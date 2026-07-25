'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredSessionIds, getUserProfile } from '@/lib/guest-session'
import Link from 'next/link'
import { Heart, Book, Settings, History, Zap } from 'lucide-react'

interface UserProfile {
  id: string
  profile_name: string
  trusted_contact_name?: string
  user_type: 'user' | 'caregiver'
}

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userType, setUserType] = useState<'user' | 'caregiver'>('user')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { userId } = getStoredSessionIds()
        if (!userId) {
          router.push('/')
          return
        }
        const userProfile = await getUserProfile(userId)
        if (userProfile) {
          setProfile(userProfile)
          setUserType(userProfile.user_type || 'user')
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
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

  const greeting = profile?.profile_name
    ? `Welcome back, ${profile.profile_name}`
    : 'Welcome to Anchor'

  return (
    <main className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-primary">{greeting}</h1>
          <p className="text-foreground/60">
            We&apos;re here to help you through each moment
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="bg-card rounded-2xl p-6 mb-8 border border-border shadow-sm">
          <p className="text-sm font-semibold text-foreground/70 mb-3">Mode</p>
          <div className="flex gap-4">
            {(['user', 'caregiver'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setUserType(mode)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  userType === mode
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-background border border-border text-foreground hover:border-secondary'
                }`}
              >
                {mode === 'user' ? 'I Need Help' : 'Supporting Someone'}
              </button>
            ))}
          </div>
          <p className="text-xs text-foreground/50 mt-3">
            Choose your role to get personalized guidance
          </p>
        </div>

        {/* Main CTA - Crisis Button */}
        <div className="mb-8">
          <Link
            href={`/context?mode=${userType}`}
            className="block w-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-3xl p-8 text-center font-bold text-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-102 active:scale-98"
          >
            <div className="flex items-center justify-center gap-3">
              <Heart className="w-8 h-8 fill-current" />
              <span>I Need Help Now</span>
            </div>
            <p className="text-red-100 text-sm mt-2 font-normal">
              Speak or tap to get support
            </p>
          </Link>
        </div>

        {/* Trusted Contact Card */}
        {profile?.trusted_contact_name && (
          <div className="bg-card rounded-2xl p-6 mb-8 border border-border shadow-sm">
            <h3 className="font-semibold text-primary mb-3">Emergency Contact</h3>
            <p className="text-foreground/80">
              {profile.trusted_contact_name}
            </p>
            <p className="text-sm text-foreground/60">
              You can reach out to them anytime
            </p>
          </div>
        )}

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/history"
            className="bg-card rounded-2xl p-6 border border-border hover:border-secondary transition-all hover:shadow-lg group"
          >
            <History className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-foreground mb-1">History</h3>
            <p className="text-sm text-foreground/60">
              View past sessions
            </p>
          </Link>

          <Link
            href="/learn"
            className="bg-card rounded-2xl p-6 border border-border hover:border-secondary transition-all hover:shadow-lg group"
          >
            <Book className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-foreground mb-1">Learn</h3>
            <p className="text-sm text-foreground/60">
              Educational resources
            </p>
          </Link>

          <Link
            href="/settings"
            className="bg-card rounded-2xl p-6 border border-border hover:border-secondary transition-all hover:shadow-lg group"
          >
            <Settings className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-foreground mb-1">Settings</h3>
            <p className="text-sm text-foreground/60">
              Edit your profile
            </p>
          </Link>
        </div>

        {/* Quick Breathing Tip */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border border-secondary/20">
          <div className="flex items-start gap-4">
            <Zap className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-primary mb-2">Quick Tip</h3>
              <p className="text-foreground/70 text-sm">
                Try box breathing anytime: breathe in for 4 counts, hold for 4,
                breathe out for 4. This simple technique can help calm your
                nervous system instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
