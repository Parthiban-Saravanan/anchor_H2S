'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoredSessionIds } from '@/lib/guest-session'
import { Mic, Square, Volume2 } from 'lucide-react'

export default function ContextCapture() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = (searchParams.get('mode') as 'user' | 'caregiver') || 'user'
  
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Fallback context state
  const [alone, setAlone] = useState<boolean | null>(null)
  const [urgeLevel, setUrgeLevel] = useState<'mild' | 'strong' | null>(null)
  const [location, setLocation] = useState<'home' | 'out' | null>(null)
  const [mounted, setMounted] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const { userId: storedUserId } = getStoredSessionIds()
    if (storedUserId) {
      setUserId(storedUserId)
    }

    // Initialize Web Speech API
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || (window as any).webkitSpeechRecognition)

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError('')
      }

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + ' ' + transcript)
          } else {
            interimTranscript += transcript
          }
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        setError(`Microphone error: ${event.error}`)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('')
      setError('')
      recognitionRef.current.start()
      setIsProcessing(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsProcessing(false)
    }
  }

  const handleSubmit = async () => {
    if (!userId) {
      setError('Session lost. Please reload.')
      return
    }

    if (!transcript.trim() && (!alone || !urgeLevel || !location)) {
      setError(
        'Please provide context either through voice or by selecting options'
      )
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Create session
      const sessionRes = await fetch('/api/capture-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          mode,
          voice_transcript: transcript,
          context_alone: alone,
          context_urge_level: urgeLevel,
          context_location: location,
        }),
      })

      if (!sessionRes.ok) {
        throw new Error('Failed to capture context')
      }

      const { session_id } = await sessionRes.json()

      // Generate AI response
      const aiRes = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id,
          user_id: userId,
          mode,
        }),
      })

      if (!aiRes.ok) {
        throw new Error('Failed to generate response')
      }

      router.push(`/response/${session_id}`)
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-background text-foreground py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Loading...</h1>
          </div>
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
            className="text-secondary hover:text-primary transition-colors mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {mode === 'user'
              ? "What's on your mind?"
              : 'Describe the situation'}
          </h1>
          <p className="text-foreground/60">
            {mode === 'user'
              ? "Tell us what you are experiencing right now. We are listening."
              : 'Share what you observe or what was shared with you.'}
          </p>
        </div>

        {/* Voice Input */}
        <div className="bg-card rounded-2xl p-8 mb-8 border border-border shadow-sm">
          <div className="flex justify-center mb-8">
            <button
              onClick={isProcessing ? stopListening : startListening}
              className={`relative w-32 h-32 rounded-full flex items-center justify-center font-semibold text-white text-lg transition-all transform ${
                isProcessing
                  ? 'bg-red-500 hover:bg-red-600 scale-100'
                  : 'bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-105'
              } ${!isListening && isProcessing ? 'animate-pulse' : ''}`}
            >
              {isProcessing ? (
                <Square className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          {isListening && (
            <p className="text-center text-secondary font-semibold mb-4 animate-pulse">
              Listening...
            </p>
          )}

          {transcript && (
            <div className="bg-background rounded-lg p-4 mb-6">
              <p className="text-foreground/80">{transcript}</p>
            </div>
          )}

          {!recognitionRef.current && !transcript && (
            <p className="text-center text-foreground/60 text-sm">
              Voice recognition not available. Use the options below instead.
            </p>
          )}
        </div>

        {/* Fallback Context Options */}
        <div className="space-y-6">
          <div>
            <p className="font-semibold text-primary mb-3">Are you alone?</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Alone', value: true },
                { label: 'With someone', value: false },
              ].map((option) => (
                <button
                  key={String(option.value)}
                  onClick={() => setAlone(option.value)}
                  className={`p-3 rounded-lg font-semibold transition-all ${
                    alone === option.value
                      ? 'bg-secondary text-white'
                      : 'bg-background border border-border text-foreground hover:border-secondary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-primary mb-3">
              How strong is the urge?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Mild urge', value: 'mild' as const },
                { label: 'Strong urge', value: 'strong' as const },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setUrgeLevel(option.value)}
                  className={`p-3 rounded-lg font-semibold transition-all ${
                    urgeLevel === option.value
                      ? 'bg-secondary text-white'
                      : 'bg-background border border-border text-foreground hover:border-secondary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-primary mb-3">Where are you?</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'At home', value: 'home' as const },
                { label: 'Out', value: 'out' as const },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLocation(option.value)}
                  className={`p-3 rounded-lg font-semibold transition-all ${
                    location === option.value
                      ? 'bg-secondary text-white'
                      : 'bg-background border border-border text-foreground hover:border-secondary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isProcessing}
          className="w-full mt-8 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-4 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Getting support...' : 'Get Anchor Support'}
        </button>
      </div>
    </main>
  )
}
