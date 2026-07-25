'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Volume2, RotateCcw, Phone, Wind } from 'lucide-react'

interface Session {
  id: string
  ai_response: string
  user_id: string
}

interface TrustedContact {
  name: string
  relation: string
}

export default function ResponseDisplay() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<Session | null>(null)
  const [contact, setContact] = useState<TrustedContact | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isAutoRead, setIsAutoRead] = useState(true)
  const synthRef = useRef<any>(null)

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
    }

    // Fetch session
    const fetchSession = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('sessions')
          .select()
          .eq('id', sessionId)
          .single()

        if (error) throw error
        setSession(data)

        // Load the trusted contact for this user (if any)
        if (data.user_id) {
          const { data: profile } = await supabase
            .from('users')
            .select('trusted_contact_name, trusted_contact_relation')
            .eq('id', data.user_id)
            .single()

          if (profile?.trusted_contact_name) {
            setContact({
              name: profile.trusted_contact_name,
              relation: profile.trusted_contact_relation || '',
            })
          }
        }

        // Auto-read response
        if (data.ai_response && synthRef.current && isAutoRead) {
          readResponse(data.ai_response)
        }
      } catch (error) {
        console.error('Failed to fetch session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [sessionId, isAutoRead])

  const readResponse = (text: string) => {
    if (!synthRef.current) return

    // Cancel any existing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)

    synthRef.current.speak(utterance)
  }

  const handleReplay = () => {
    if (session) {
      readResponse(session.ai_response)
    }
  }

  const handleOkayNow = async () => {
    try {
      const supabase = createClient()
      await supabase
        .from('sessions')
        .update({ outcome: 'okay_now' })
        .eq('id', sessionId)

      router.push('/learn')
    } catch (error) {
      console.error('Failed to update outcome:', error)
    }
  }

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

  if (!session) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Session not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-primary text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 text-foreground py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Anchor is here with you
          </h1>
          <p className="text-foreground/60">Listen to your personalized message</p>
        </div>

        {/* Message Box */}
        <div className="bg-card rounded-2xl p-8 mb-8 border border-border shadow-lg">
          <p className="text-lg leading-relaxed text-foreground mb-6">
            {session.ai_response}
          </p>

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="flex items-center justify-center gap-2 text-secondary">
              <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" />
              <span className="text-sm">Speaking...</span>
              <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            </div>
          )}
        </div>

        {/* Audio Controls */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleReplay}
            disabled={isSpeaking}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" />
            Replay
          </button>
          <button
            onClick={() => setIsAutoRead(!isAutoRead)}
            className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-lg transition-all ${
              isAutoRead
                ? 'bg-secondary text-white'
                : 'bg-background border border-border text-foreground'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            Auto-read
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {contact && (
            <div className="w-full flex items-center gap-3 bg-primary/10 border border-primary/30 text-primary font-semibold py-4 px-6 rounded-lg">
              <Phone className="w-6 h-6 shrink-0" />
              <span className="text-pretty">
                Reach out to {contact.name}
                {contact.relation ? ` (${contact.relation})` : ''} — you
                don&apos;t have to do this alone.
              </span>
            </div>
          )}

          <button
            onClick={() => router.push('/breathing')}
            className="w-full flex items-center justify-center gap-3 bg-secondary/10 border border-secondary/30 hover:bg-secondary/20 text-secondary font-semibold py-4 px-6 rounded-lg transition-all"
          >
            <Wind className="w-6 h-6" />
            Try a Breathing Exercise
          </button>

          <button
            onClick={handleOkayNow}
            className="w-full flex items-center justify-center gap-3 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 text-green-700 dark:text-green-400 font-semibold py-4 px-6 rounded-lg transition-all"
          >
            <span>I&apos;m Okay Now</span>
          </button>

          <button
            onClick={() => router.push('/learn')}
            className="w-full flex items-center justify-center gap-3 bg-background border border-border hover:border-secondary text-foreground font-semibold py-4 px-6 rounded-lg transition-all"
          >
            Learn More
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full text-center text-foreground/60 hover:text-foreground py-3 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  )
}
