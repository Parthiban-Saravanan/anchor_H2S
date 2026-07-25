import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const {
      user_id,
      mode,
      voice_transcript,
      context_alone,
      context_urge_level,
      context_location,
    } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create session record
    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          user_id,
          session_type: mode,
          context_text: `Alone: ${context_alone}, Urge: ${context_urge_level}, Location: ${context_location}`,
          voice_input_text: voice_transcript,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ session_id: data.id })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
