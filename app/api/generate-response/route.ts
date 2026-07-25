import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const { session_id, user_id, mode } = await request.json()

    if (!session_id || !user_id || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
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

    // Build prompt
    let prompt = ''

    if (mode === 'user') {
      prompt = `You are a compassionate crisis companion for someone in addiction recovery. 
      
Person's Profile:
- Name: ${profile.profile_name || 'Friend'}
- Triggers: ${profile.trigger_descriptions || 'Not specified'}
- Coping activity: ${profile.coping_activity || 'Not specified'}

Current Situation:
- What they shared: "${session.voice_input_text}"
- Alone: ${session.context_text}
- Urge level: ${session.context_text}

Generate a warm, compassionate 2-3 sentence script that:
1. Validates their feelings
2. Reminds them of their strength
3. Gently guides them toward their coping activity (${profile.coping_activity})

Keep it personal, warm, and actionable. Speak directly to them.`
    } else {
      prompt = `You are a supportive family member advisor for someone supporting a loved one in recovery.

Situation they shared: "${session.voice_input_text}"

Generate a warm, empathetic 2-3 sentence guidance script that:
1. Validates the caregiver's experience
2. Offers practical, compassionate advice
3. Reminds them that supporting someone is itself an act of love

Keep it warm, practical, and encouraging.`
    }

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const aiResponse =
      result.response.text() ||
      'Take a deep breath. You are stronger than you think. I believe in you.'

    // Update session with response
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ ai_response: aiResponse })
      .eq('id', session_id)

    if (updateError) {
      console.error('Failed to update session:', updateError)
    }

    return NextResponse.json({ session_id, ai_response: aiResponse })
  } catch (error) {
    console.error('API error:', error)
    
    const fallbackResponse =
      "We are having trouble reaching Anchor right now, but your strength is still there. Take a moment to breathe. You have got this."

    return NextResponse.json(
      { session_id: 'error', ai_response: fallbackResponse },
      { status: 200 }
    )
  }
}
