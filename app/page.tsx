'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getOrCreateGuestSession } from '@/lib/guest-session'

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = async () => {
    setIsLoading(true)
    try {
      await getOrCreateGuestSession()
    } catch (error) {
      console.error('Failed to create guest session:', error)
    }
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-primary">
          Anchor
        </h1>
        <p className="text-2xl md:text-3xl font-light mb-6 text-secondary">
          Your calm in the storm
        </p>

        {/* Description */}
        <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
          A compassionate voice-first companion designed for moments of crisis.
          Speak freely. Receive instant, personalized guidance. Find calm.
        </p>

        {/* Trust Statement */}
        <div className="bg-card rounded-2xl p-6 mb-12 border border-border shadow-sm">
          <p className="text-foreground/70 text-sm">
            <span className="font-semibold text-primary">Fully confidential.</span>{' '}
            Your data stays private. No judgment. Just support.
          </p>
        </div>

        {/* CTA Button */}
        <Link
          href="/setup"
          onClick={handleGetStarted}
          className="inline-block bg-gradient-to-r from-primary to-secondary text-white font-semibold py-4 px-12 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-lg"
        >
          {isLoading ? 'Starting...' : 'Get Started'}
        </Link>

        {/* Support Text */}
        <p className="text-sm text-foreground/60 mt-12">
          No sign-up needed. Open Anchor anytime you need it.
        </p>
      </div>

      {/* Footer accent */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-secondary/5 to-transparent pointer-events-none" />
    </main>
  )
}
