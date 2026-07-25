'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getStoredSessionIds,
  getUserProfile,
  updateUserProfile,
} from '@/lib/guest-session'
import { ArrowLeft } from 'lucide-react'

const TRIGGER_OPTIONS = [
  'Stress',
  'Loneliness',
  'Social events',
  'Boredom',
  'Conflict',
]

const COPING_ACTIVITIES = ['Breathing', 'Calling someone', 'Walking', 'Music']

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [triggers, setTriggers] = useState<string[]>([])
  const [copingActivity, setCopingActivity] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactRelation, setContactRelation] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { userId: storedUserId } = getStoredSessionIds()
        if (!storedUserId) {
          router.push('/')
          return
        }

        setUserId(storedUserId)
        const profile = await getUserProfile(storedUserId)

        if (profile) {
          setName(profile.profile_name || '')
          setTriggers(
            profile.trigger_descriptions
              ? profile.trigger_descriptions.split(', ')
              : []
          )
          setCopingActivity(profile.coping_activity || '')
          setContactName(profile.trusted_contact_name || '')
          setContactRelation(profile.trusted_contact_relation || '')
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const toggleTrigger = (trigger: string) => {
    setTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    )
  }

  const handleSave = async () => {
    if (!userId || !name.trim()) {
      alert('Please enter your name')
      return
    }

    if (triggers.length === 0) {
      alert('Please select at least one trigger')
      return
    }

    if (!copingActivity) {
      alert('Please select a coping activity')
      return
    }

    setIsSaving(true)
    try {
      await updateUserProfile(userId, {
        profile_name: name,
        trigger_descriptions: triggers.join(', '),
        coping_activity: copingActivity,
        trusted_contact_name: contactName,
        trusted_contact_relation: contactRelation,
      })

      alert('Profile updated successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
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
          <h1 className="text-3xl font-bold text-primary mb-2">Settings</h1>
          <p className="text-foreground/60">Update your profile and preferences</p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Name */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <label className="block font-semibold text-primary mb-3">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
            />
          </div>

          {/* Triggers */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <label className="block font-semibold text-primary mb-4">
              Your Triggers
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TRIGGER_OPTIONS.map((trigger) => (
                <button
                  key={trigger}
                  onClick={() => toggleTrigger(trigger)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
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

          {/* Coping Activity */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <label className="block font-semibold text-primary mb-4">
              Your Coping Activity
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COPING_ACTIVITIES.map((activity) => (
                <button
                  key={activity}
                  onClick={() => setCopingActivity(activity)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
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

          {/* Emergency Contact */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <label className="block font-semibold text-primary mb-4">
              Emergency Contact (Optional)
            </label>
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
                placeholder="Relationship"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-4 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-background border border-border text-foreground font-semibold py-3 px-6 rounded-lg hover:border-secondary transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  )
}
