import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'

// Claude (Anthropic) via the Vercel AI Gateway. Anthropic is zero-config on the
// gateway, so no provider package or API key setup is required here.
const MODEL = 'anthropic/claude-haiku-4.5'

const USER_FALLBACK =
  "Take a slow breath in, and a slower breath out. This moment is hard, but it will pass, and you have made it through hard moments before. You are not alone right now."

const SUPPORTER_FALLBACK =
  "What you're feeling is a sign of how much you care. You can't carry this perfectly, and you don't have to. Take one steady breath, and know that simply being present is already a gift to them."

export async function POST(request: NextRequest) {
  let mode: string | undefined

  try {
    const body = await request.json()
    const { session_id, user_id } = body
    mode = body.mode

    if (!session_id || !user_id || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch session and user profile
    const [sessionData, profileData] = await Promise.all([
      supabase.from('sessions').select().eq('id', session_id).single(),
      supabase.from('users').select().eq('id', user_id).single(),
    ])

    if (sessionData.error || profileData.error) {
      return NextResponse.json(
        { error: 'Failed to fetch data' },
        { status: 500 }
      )
    }

    const session = sessionData.data
    const profile = profileData.data

    const sharedContext = session.context_text || 'They did not add details.'
    const sharedBy = session.input_method === 'voice' ? 'speaking' : 'typing'

    // Build a system + user prompt for Claude
    let system = ''
    let prompt = ''

    if (mode === 'user') {
      system =
        'You are Anchor, a warm and compassionate crisis companion for someone in addiction recovery. ' +
        'You speak directly to the person in a calm, steady, non-judgmental voice. ' +
        'Never lecture, diagnose, or shame. Keep responses to 2-3 short sentences that can be read aloud calmly. ' +
        'Always: (1) validate their feelings, (2) remind them of their own strength, (3) gently guide them toward a concrete next step.'

      prompt =
        `Person's profile:\n` +
        `- Name: ${profile.profile_name || 'Friend'}\n` +
        `- Known triggers: ${profile.trigger_descriptions || 'Not specified'}\n` +
        `- Coping activity that helps them: ${profile.coping_activity || 'Not specified'}\n\n` +
        `They just reached out by ${sharedBy} and shared:\n"${sharedContext}"\n\n` +
        `Write a warm, personal 2-3 sentence message spoken directly to ${profile.profile_name || 'them'}. ` +
        `Gently guide them toward their coping activity (${profile.coping_activity || 'a calming activity that grounds them'}).`
    } else {
      system =
        'You are Anchor, a supportive advisor for someone who is helping a loved one through addiction recovery. ' +
        'You speak warmly and practically to the supporter. Keep responses to 2-3 short sentences. ' +
        'Always: (1) validate the supporter\'s experience, (2) offer one practical, compassionate action, ' +
        '(3) remind them that showing up is itself an act of love.'

      prompt =
        `The supporter reached out by ${sharedBy} and shared:\n"${sharedContext}"\n\n` +
        `Write a warm, practical 2-3 sentence message spoken directly to the supporter.`
    }

    const { text } = await generateText({
      model: MODEL,
      system,
      prompt,
      temperature: 0.7,
      maxRetries: 2,
    })

    const aiResponse =
      text?.trim() || (mode === 'user' ? USER_FALLBACK : SUPPORTER_FALLBACK)

    // Persist the response so it survives refreshes / history
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ ai_response: aiResponse })
      .eq('id', session_id)

    if (updateError) {
      console.error('Failed to update session:', updateError)
    }

    return NextResponse.json({ session_id, ai_response: aiResponse })
  } catch (error) {
    console.error('generate-response error:', error)

    // Calm, non-technical fallback so the person is never left with an error.
    const fallbackResponse =
      mode && mode !== 'user' ? SUPPORTER_FALLBACK : USER_FALLBACK

    return NextResponse.json(
      { session_id: 'error', ai_response: fallbackResponse, fallback: true },
      { status: 200 }
    )
  }
}
