import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not configured')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const resources = [
  {
    title: 'Understanding Cravings',
    description: 'Learn how cravings work and evidence-based strategies to manage them.',
    category: 'coping',
    is_featured: true,
    url: 'https://www.samhsa.gov/',
  },
  {
    title: 'Meditation for Recovery',
    description: 'A guide to mindfulness meditation practices for managing stress and triggers.',
    category: 'wellness',
    is_featured: true,
    url: 'https://www.mindful.org/',
  },
  {
    title: 'Supporting a Loved One',
    description: 'Practical tips for family members and friends supporting someone in recovery.',
    category: 'education',
    is_featured: true,
    url: 'https://www.nih.gov/',
  },
  {
    title: 'Crisis Hotlines',
    description: 'National resources available 24/7 during times of crisis.',
    category: 'emergency',
    is_featured: true,
    url: 'https://988lifeline.org/',
  },
  {
    title: 'Sleep and Recovery',
    description: 'How to improve sleep quality during addiction recovery.',
    category: 'wellness',
    is_featured: true,
    url: 'https://www.cdc.gov/',
  },
  {
    title: 'Building Healthy Habits',
    description: 'Replace old patterns with new, positive routines.',
    category: 'education',
    is_featured: true,
    url: 'https://www.apa.org/',
  },
]

async function seed() {
  try {
    console.log('Seeding resources...')
    const { data, error } = await supabase
      .from('resources')
      .insert(resources)
      .select()

    if (error) {
      console.error('Error seeding resources:', error.message)
      process.exit(1)
    } else {
      console.log('Successfully seeded', data?.length || 0, 'resources')
      process.exit(0)
    }
  } catch (err: any) {
    console.error('Seeding failed:', err.message)
    process.exit(1)
  }
}

seed()
