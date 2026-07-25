'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredSessionIds, updateUserProfile } from '@/lib/guest-session'
import { Button } from '@/components/ui/button'

const TRIGGER_OPTIONS = [
  'Stress',
  'Loneliness',
  'Social events',
  'Boredom',
  'Conflict',
]

const COPING_ACTIVITIES = ['Breathing', 'Calling someone', 'Walking', 'Music']

type SetupStep = 'name' | 'triggers' | 'coping' | 'contact'

export default function SetupWizard() {
  const router = useRouter()
  const [step, setStep] = useState<SetupStep>('name')
  const [userId, setUserId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [triggers, setTriggers] = useState<string[]>([])
  const [copingActivity, setCopingActivity] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactRelation, setContactRelation] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const { userId: storedUserId } = getStoredSessionIds()
    if (storedUserId) {
      setUserId(storedUserId)
    }
  }, [])

  const toggleTrigger = (trigger: string) => {
    setTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    )
  }

  const handleNext = () => {
    if (step === 'name' && !name.trim()) {
      alert('Please enter your name')
      return
    }
    if (step === 'triggers' && triggers.length === 0) {
      alert('Please select at least one trigger')
      return
    }
    if (step === 'coping' && !copingActivity) {
      alert('Please select a coping activity')
      return
    }

    const nextSteps: Record<SetupStep, SetupStep> = {
      name: 'triggers',
      triggers: 'coping',
      coping: 'contact',
      contact: 'contact',
    }
    setStep(nextSteps[step])
  }

  const handleFinish = async () => {
    if (!userId) {
      alert('Session error. Please reload.')
      return
    }

    setIsLoading(true)
    try {
      await updateUserProfile(userId, {
        profile_name: name,
        trigger_descriptions: triggers.join(', '),
        coping_activity: copingActivity,
        trusted_contact_name: contactName,
        trusted_contact_number: contactRelation,
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const stepCount = 4
  const currentStepNumber = {
    name: 1,
    triggers: 2,
    coping: 3,
    contact: 4,
  }[step]

  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-primary">Let&apos;s Get Started</h1>
            <span className="text-sm text-foreground/60">
              Step {currentStepNumber} of {stepCount}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300"
              style={{
                width: `${(currentStepNumber / stepCount) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Step 1: Name */}
        {step === 'name' && (
          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-primary">
              What&apos;s your name?
            </h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNext()
              }}
              autoFocus
            />
          </div>
        )}

        {/* Step 2: Triggers */}
        {step === 'triggers' && (
          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-primary">
              What are your main triggers?
            </h2>
            <p className="text-foreground/70 mb-6">
              Select the situations that make cravings harder:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TRIGGER_OPTIONS.map((trigger) => (
                <button
                  key={trigger}
                  onClick={() => toggleTrigger(trigger)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    triggers.includes(trigger)
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-background border-border text-foreground hover:border-secondary'
                  }`}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Coping Activity */}
        {step === 'coping' && (
          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-primary">
              What helps you cope?
            </h2>
            <p className="text-foreground/70 mb-6">
              Choose your go-to coping strategy:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COPING_ACTIVITIES.map((activity) => (
                <button
                  key={activity}
                  onClick={() => setCopingActivity(activity)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    copingActivity === activity
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-background border-border text-foreground hover:border-secondary'
                  }`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Contact */}
        {step === 'contact' && (
          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-primary">
              Emergency contact (optional)
            </h2>
            <p className="text-foreground/70 mb-6">
              Add a trusted contact you can reach out to:
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Name"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
              />
              <input
                type="text"
                value={contactRelation}
                onChange={(e) => setContactRelation(e.target.value)}
                placeholder="Relationship (e.g., Mom, Best Friend)"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
              />
              <p className="text-sm text-foreground/60 mt-4">
                You can update this information anytime in settings.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-12">
          <button
            onClick={() => {
              const prevSteps: Record<SetupStep, SetupStep> = {
                name: 'name',
                triggers: 'name',
                coping: 'triggers',
                contact: 'coping',
              }
              setStep(prevSteps[step])
            }}
            disabled={step === 'name'}
            className="flex-1 px-6 py-3 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>

          {step === 'contact' ? (
            <button
              onClick={handleFinish}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Start Using Anchor'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
