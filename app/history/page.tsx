'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredSessionIds } from '@/lib/guest-session'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Session {
  id: string
  created_at: string
  session_type: 'user' | 'caregiver'
  context_text: string
  outcome?: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const { userId } = getStoredSessionIds()
        if (!userId) {
          router.push('/')
          return
        }

        const supabase = createClient()
        const { data, error } = await supabase
          .from('sessions')
          .select()
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setSessions(data || [])
      } catch (error) {
        console.error('Failed to load sessions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSessions()
  }, [router])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-secondary rounded-full animate-pulse mx-auto mb-4" />
          <p className="text-foreground/60">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-primary mb-2">Your Journey</h1>
          <p className="text-foreground/60">
            Every moment you reach out is a moment of strength
          </p>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 text-center border border-border">
            <p className="text-foreground/60 mb-4">No sessions yet</p>
            <p className="text-sm text-foreground/50">
              When you use Anchor, your sessions will appear here
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/response/${session.id}`}
                className="block bg-card rounded-2xl p-6 border border-border hover:border-secondary hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-primary">
                    {session.session_type === 'user'
                      ? "I needed help"
                      : "Supporting someone"}
                  </h3>
                  {session.outcome === 'okay_now' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-700 dark:text-green-400">
                      Okay now ✓
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/60 mb-3">
                  {new Date(session.created_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-sm text-foreground/70 line-clamp-2">
                  {session.context_text}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
