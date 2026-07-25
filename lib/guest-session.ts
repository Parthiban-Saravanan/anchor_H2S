import { createClient } from '@/lib/supabase/client'

const GUEST_ID_KEY = 'anchor_guest_id'
const USER_ID_KEY = 'anchor_user_id'

export async function getOrCreateGuestSession(): Promise<{
  guestId: string
  userId: string
}> {
  const supabase = createClient()

  // Check localStorage
  const existingGuestId =
    typeof window !== 'undefined' ? localStorage.getItem(GUEST_ID_KEY) : null
  const existingUserId =
    typeof window !== 'undefined' ? localStorage.getItem(USER_ID_KEY) : null

  if (existingGuestId && existingUserId) {
    return {
      guestId: existingGuestId,
      userId: existingUserId,
    }
  }

  // Create new guest user
  const newGuestId = crypto.randomUUID()

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        guest_id: newGuestId,
        is_guest: true,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create guest session: ${error.message}`)
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_ID_KEY, newGuestId)
    localStorage.setItem(USER_ID_KEY, data.id)
  }

  return {
    guestId: newGuestId,
    userId: data.id,
  }
}

export function getStoredSessionIds(): {
  guestId: string | null
  userId: string | null
} {
  const guestId =
    typeof window !== 'undefined' ? localStorage.getItem(GUEST_ID_KEY) : null
  const userId =
    typeof window !== 'undefined' ? localStorage.getItem(USER_ID_KEY) : null

  return { guestId, userId }
}

export async function updateUserProfile(userId: string, profile: any) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .update(profile)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  return data
}

export async function getUserProfile(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }

  return data || null
}
