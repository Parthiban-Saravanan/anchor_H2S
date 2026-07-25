import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { user_id, mode, context_text, input_method } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const trimmedContext =
      typeof context_text === 'string' ? context_text.trim() : ''

    if (!trimmedContext) {
      return NextResponse.json(
        { error: 'Please share what is going on before continuing.' },
        { status: 400 }
      )
    }

    const sessionType = mode === 'caregiver' ? 'caregiver' : 'user'
    const method = input_method === 'voice' ? 'voice' : 'typed'

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          user_id,
          session_type: sessionType,
          context_text: trimmedContext,
          input_method: method,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('[v0] capture-context db error:', error.message)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ session_id: data.id })
  } catch (error) {
    console.error('[v0] capture-context api error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
