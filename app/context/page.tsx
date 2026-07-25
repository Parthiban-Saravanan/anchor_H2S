'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoredSessionIds } from '@/lib/guest-session'
import { Mic, Square } from 'lucide-react'

export default function ContextCapture() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = (searchParams.get('mode') as 'user' | 'caregiver') || 'user'

  const [isListening, setIsListening] = useState(false)
  const [text, setText] = useState('')
  const [inputMethod, setInputMethod] = useState<'voice' | 'typed'>('typed')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [speechSupported, setSpeechSupported] = useState(false)
  const [mounted, setMounted] = useState(false)

  const recognitionRef = useRef<any>(null)
  const baseTextRef = useRef('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const { userId: storedUserId } = getStoredSessionIds()
    if (storedUserId) {
      setUserId(storedUserId)
    }

    const SpeechRecognition =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition)

    if (SpeechRecognition) {
      setSpeechSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setError('')
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += chunk
          } else {
            interimTranscript += chunk
          }
        }
        if (finalTranscript) {
          baseTextRef.current = (
            baseTextRef.current +
            ' ' +
            finalTranscript
          ).trim()
        }
        const combined = (baseTextRef.current + ' ' + interimTranscript).trim()
        setText(combined)
      }

      recognition.onerror = (event: any) => {
        setError(`Microphone error: ${event.error}. You can type instead.`)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // ignore
        }
      }
    }
  }, [])

  const startListening = () => {
    if (!recognitionRef.current) return
    baseTextRef.current = text.trim()
    setInputMethod('voice')
    setError('')
    try {
      recognitionRef.current.start()
    } catch {
      // start() throws if already started; ignore
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const handleSubmit = async () => {
    if (!userId) {
      setError('Session lost. Please reload the page.')
      return
    }

    if (isListening) {
      stopListening()
    }

    const contextText = text.trim()
    if (!contextText) {
      setError('Please share what is going on, by voice or by typing.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const sessionRes = await fetch('/api/capture-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          mode,
          context_text: contextText,
          input_method: inputMethod,
        }),
      })

      if (!sessionRes.ok) {
        const body = await sessionRes.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to capture context')
      }

      const { session_id } = await sessionRes.json()

      const aiRes = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, user_id: userId, mode }),
      })

      if (!aiRes.ok) {
        throw new Error('Failed to generate response')
      }

      router.push(`/response/${session_id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-background text-foreground py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-2">Loading...</h1>
        </div>
      </main>
    )
  }

  // Calming full-screen state while Anchor prepares a response.
  if (isSubmitting) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="relative flex items-center justify-center mb-8">
            <span className="absolute w-28 h-28 rounded-full bg-secondary/20 animate-ping" />
            <span className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse" />
          </div>
          <h1 className="text-2xl font-semibold text-primary mb-3 text-balance">
            Anchor is here with you
          </h1>
          <p className="text-foreground/60 leading-relaxed text-pretty">
            Take a slow breath while we put together something just for you.
            This will only take a moment.
          </p>
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
          <h1 className="text-3xl font-bold text-primary mb-2 text-balance">
            {mode === 'user'
              ? "What's on your mind?"
              : 'Describe the situation'}
          </h1>
          <p className="text-foreground/60 text-pretty">
            {mode === 'user'
              ? 'Tell us what you are experiencing right now. Speak it aloud or type it, whatever feels easier.'
              : 'Share what you observe or what was shared with you. Speak or type, whichever is easier.'}
          </p>
        </div>

        {/* Voice Input */}
        <div className="bg-card rounded-2xl p-8 mb-6 border border-border shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={!speechSupported || isSubmitting}
              aria-label={isListening ? 'Stop recording' : 'Start recording'}
              className={`relative w-28 h-28 rounded-full flex items-center justify-center text-primary-foreground transition-all transform disabled:opacity-40 disabled:cursor-not-allowed ${
                isListening
                  ? 'bg-destructive hover:brightness-110 animate-pulse'
                  : 'bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-105'
              }`}
            >
              {isListening ? (
                <Square className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
            <p className="text-sm text-foreground/60 text-center">
              {!speechSupported
                ? 'Voice input is not available in this browser, please type below.'
                : isListening
                  ? 'Listening... tap to stop.'
                  : 'Tap the microphone to speak.'}
            </p>
          </div>
        </div>

        {/* Typed Input */}
        <div className="bg-card rounded-2xl p-6 mb-6 border border-border shadow-sm">
          <label
            htmlFor="context-text"
            className="block font-semibold text-primary mb-3"
          >
            {mode === 'user'
              ? 'What are you feeling or facing?'
              : 'What is happening?'}
          </label>
          <textarea
            id="context-text"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              if (!isListening) setInputMethod('typed')
              baseTextRef.current = e.target.value
            }}
            rows={5}
            placeholder={
              mode === 'user'
                ? 'e.g. I am home alone and the cravings are getting strong...'
                : 'e.g. They seem overwhelmed and I am not sure what to say...'
            }
            className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-secondary text-foreground resize-none leading-relaxed"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-6 bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-pretty">{error}</span>
            <button
              type="button"
              onClick={handleSubmit}
              className="shrink-0 rounded-lg border border-destructive/40 px-4 py-2 font-medium text-destructive transition-colors hover:bg-destructive/15"
            >
              Try again
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold py-4 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Getting support...' : 'Get Anchor Support'}
        </button>
      </div>
    </main>
  )
}
