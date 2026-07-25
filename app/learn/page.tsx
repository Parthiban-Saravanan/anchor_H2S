'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ExternalLink, ArrowLeft } from 'lucide-react'

interface Resource {
  id: string
  title: string
  description: string
  category: string
  url?: string
}

export default function LearnPage() {
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadResources = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('resources')
          .select()
          .eq('is_featured', true)
          .limit(6)

        if (error) throw error
        setResources(data || [])
      } catch (error) {
        console.error('Failed to load resources:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadResources()
  }, [])

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
          <h1 className="text-3xl font-bold text-primary mb-2">
            Learn & Grow
          </h1>
          <p className="text-foreground/60">
            Resources to support your recovery journey
          </p>
        </div>

        {/* Resources */}
        {resources.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 text-center border border-border">
            <p className="text-foreground/60 mb-4">No resources available</p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="bg-card rounded-2xl p-6 border border-border hover:border-secondary transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-primary flex-1">
                    {resource.title}
                  </h3>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary/10 text-secondary ml-3 flex-shrink-0">
                    {resource.category}
                  </span>
                </div>
                <p className="text-sm text-foreground/70 mb-4">
                  {resource.description}
                </p>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors font-semibold text-sm"
                  >
                    Learn More
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12">
          <Link
            href="/dashboard"
            className="block w-full text-center bg-gradient-to-r from-primary to-secondary text-white font-semibold py-4 px-6 rounded-lg hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
