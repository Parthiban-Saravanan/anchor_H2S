# Anchor - Quick Setup Guide

## What You Have

A fully functional voice-first crisis companion web app with:
- Landing page and guided setup wizard
- Voice capture with Web Speech API
- AI-powered responses from Google Gemini
- Session history and educational resources
- Breathing exercise guide
- Full Supabase integration for data persistence
- Beautiful light/dark mode design

## Get It Running

### 1. Set Environment Variables

Create `.env.local` in your project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
```

**Get these in 3 minutes:**

#### Supabase (Database)
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New project"
3. Fill in project name, password, region
4. In project settings → "API", copy `Project URL` and `anon key`
5. Paste into `.env.local`

#### Google Generative AI (AI Responses)
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API key"
3. Create a new project and generate API key
4. Paste into `GOOGLE_GENERATIVE_AI_API_KEY`

### 2. Run Locally

```bash
cd /vercel/share/v0-project
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Test the Flow

1. **Landing** → Click "Get Started"
2. **Setup** → Enter name, pick triggers, coping activity, emergency contact
3. **Dashboard** → See the main "I Need Help Now" button
4. **Context** → Speak your concern or select options
5. **Response** → Get AI-generated guidance, hear it read aloud
6. **Breathing** → Try the guided breathing exercise

## Database Schema Already Set Up

The Supabase schema (users, sessions, resources tables) was automatically created via migration. No additional DB setup needed.

## Optional: Seed Resources

To populate educational resources:

```bash
pnpm tsx scripts/seed-resources.ts
```

## Deploy

### Deploy to Vercel (Recommended)

```bash
vercel deploy
```

Then add your environment variables in Vercel project settings.

### Deploy to Other Platforms

- Ensure Node.js 18+
- Set environment variables
- Run `pnpm build` then `pnpm start`

## Key Features to Explore

### Voice Input
- Microphone button in context page uses Web Speech API
- Automatic transcription and fallback buttons

### AI Responses
- Real Gemini API integration
- Personalized based on user profile
- Auto-read via browser speech synthesis
- Error fallback for smooth UX

### Data Persistence
- All sessions saved to Supabase
- Guest users get random UUID in localStorage
- Can view history anytime

### Accessibility
- 48px+ tap targets for mobile
- High contrast colors (WCAG compliant)
- Semantic HTML and ARIA labels
- Dark mode support

## Troubleshooting

**Voice not working?**
- Check browser (Chrome, Safari, Edge required)
- Grant microphone permission when prompted
- Use fallback tap buttons if needed

**"Can't resolve @supabase/ssr"?**
- Run `pnpm install`

**Database connection failing?**
- Verify URL and key in `.env.local`
- Check Supabase project is active

**Google API not working?**
- Verify API key is valid
- Check rate limits (free tier: 60 req/min)

## Support

- Issues? Check console: F12 → Console tab
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Google AI docs: [ai.google.dev/docs](https://ai.google.dev/docs)
- Crisis: Call 988 (US) or [findahelpline.com](https://findahelpline.com)

## Next Steps

- Customize colors in `app/globals.css`
- Add your own educational resources to Supabase
- Tweak AI prompts in `app/api/generate-response/route.ts`
- Deploy and share with the world

Good luck! 🚀
