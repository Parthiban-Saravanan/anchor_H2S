'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'complete'

export default function BreathingExercise() {
  const router = useRouter()
  const [phase, setPhase] = useState<BreathingPhase>('inhale')
  const [progress, setProgress] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [isActive, setIsActive] = useState(true)

  const phases: {
    [key in BreathingPhase]: { label: string; duration: number; instruction: string }
  } = {
    inhale: {
      label: 'Inhale',
      duration: 4,
      instruction: 'Breathe in slowly through your nose',
    },
    hold: {
      label: 'Hold',
      duration: 4,
      instruction: 'Hold your breath gently',
    },
    exhale: {
      label: 'Exhale',
      duration: 4,
      instruction: 'Breathe out slowly through your mouth',
    },
    complete: {
      label: 'Complete',
      duration: 0,
      instruction: 'You did great!',
    },
  }

  const TOTAL_CYCLES = 5

  useEffect(() => {
    if (!isActive || phase === 'complete') return

    const duration = phases[phase].duration * 1000
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next phase
          if (phase === 'inhale') {
            setPhase('hold')
          } else if (phase === 'hold') {
            setPhase('exhale')
          } else if (phase === 'exhale') {
            if (cycle < TOTAL_CYCLES - 1) {
              setCycle((prev) => prev + 1)
              setPhase('inhale')
            } else {
              setPhase('complete')
              setIsActive(false)
            }
          }
          return 0
        }
        return prev + 100 / (duration / 50)
      })
    }, 50)

    return () => clearInterval(interval)
  }, [phase, cycle, isActive])

  const phaseIndex = { inhale: 0, hold: 1, exhale: 2, complete: 3 }[phase]
  const circleSize = phase === 'inhale' ? 80 + (progress / 100) * 40 : phase === 'exhale' ? 120 - (progress / 100) * 40 : 120

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-secondary/10 text-foreground flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-12"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold text-primary text-center mb-2">
          Box Breathing
        </h1>
        <p className="text-foreground/60 text-center mb-12">
          A simple technique to calm your nervous system
        </p>

        {/* Breathing Circle */}
        <div className="flex justify-center mb-12">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 opacity-30" />

            {/* Breathing circle */}
            <div
              className="absolute rounded-full bg-gradient-to-br from-secondary to-primary transition-all duration-75"
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                opacity: 0.6,
              }}
            />

            {/* Text */}
            <div className="relative text-center z-10">
              <p className="text-5xl font-bold text-primary mb-2">
                {Math.ceil(phases[phase].duration - (progress / 100) * phases[phase].duration) || phase === 'complete' ? (phase === 'complete' ? '✓' : Math.ceil(phases[phase].duration - (progress / 100) * phases[phase].duration)) : '0'}
              </p>
              <p className="text-lg font-semibold text-primary">
                {phases[phase].label}
              </p>
            </div>
          </div>
        </div>

        {/* Instruction */}
        <p className="text-center text-foreground/80 text-lg mb-8">
          {phases[phase].instruction}
        </p>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-12">
          {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-12 rounded-full transition-all ${
                i < cycle
                  ? 'bg-secondary'
                  : i === cycle
                    ? 'bg-gradient-to-r from-secondary to-primary'
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Cycle counter */}
        <p className="text-center text-foreground/60 mb-8">
          Cycle {cycle + 1} of {TOTAL_CYCLES}
        </p>

        {/* Completion message */}
        {phase === 'complete' && (
          <div className="bg-gradient-to-r from-green-500/10 to-secondary/10 rounded-2xl p-8 text-center border border-green-500/20 mb-8">
            <p className="text-xl font-semibold text-primary mb-2">You did it!</p>
            <p className="text-foreground/70">
              Take a moment to notice how you're feeling. You've given yourself permission to slow down and breathe.
            </p>
          </div>
        )}

        {/* Controls */}
        {phase === 'complete' ? (
          <div className="space-y-3">
            <button
              onClick={() => {
                setPhase('inhale')
                setProgress(0)
                setCycle(0)
                setIsActive(true)
              }}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-background border border-border text-foreground font-semibold py-3 rounded-lg hover:border-secondary transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsActive(!isActive)}
            className="w-full bg-background border border-border text-foreground font-semibold py-3 rounded-lg hover:border-secondary transition-all"
          >
            {isActive ? 'Pause' : 'Resume'}
          </button>
        )}
      </div>
    </main>
  )
}
