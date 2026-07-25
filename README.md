# Anchor - Voice-First Crisis Companion

A compassionate web app for people in addiction recovery and their caregivers. Speak freely. Receive instant, personalized AI guidance. Find calm.

## Features

- **Voice-First Interface**: Use your voice to express what you're experiencing
- **AI-Powered Support**: Real-time responses from Google Gemini API tailored to your situation
- **Auto-Read Responses**: AI responses are automatically read aloud via browser speech synthesis
- **Guided Breathing**: Built-in 5-cycle box breathing exercise
- **Crisis Context**: Capture alone/together, urge level, and location for personalized guidance
- **Session History**: Track your journey and see how far you've come
- **Educational Resources**: Curated links to support materials
- **Dark Mode**: Calming dark theme option for any time of day
- **Guest-First**: No sign-up needed—just open and get support

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Generative AI (Gemini API)
- **Audio**: Web Speech API (SpeechRecognition + SpeechSynthesis)

## Setup

### 1. Environment Variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
```

**Get your credentials:**

- **Supabase**: Visit [supabase.com](https://supabase.com), create a project, and copy the URL and anon key from settings
- **Google API**: Visit [ai.google.dev](https://ai.google.dev), sign in, and create an API key

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Seed Educational Resources (Optional)

```bash
pnpm tsx scripts/seed-resources.ts
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Flow

1. **Landing Page** (`/`) - Introduction to Anchor
2. **Setup Wizard** (`/setup`) - Create profile (name, triggers, coping activity, emergency contact)
3. **Dashboard** (`/dashboard`) - Main hub with one-tap crisis button
4. **Context Capture** (`/context`) - Speak or select context (alone, urge level, location)
5. **AI Response** (`/response/:sessionId`) - Read AI-generated script aloud, take actions
6. **Supporting Pages**:
   - Breathing Exercise (`/breathing`)
   - Learn/Resources (`/learn`)
   - History (`/history`)
   - Settings (`/settings`)

## API Routes

- `POST /api/capture-context` - Save voice context and create session
- `POST /api/generate-response` - Generate AI response using Gemini API

## Design System

- **Colors**: Deep blue (#2C3E66), soft teal (#5FB3A3), off-white (#F7F5F0)
- **Dark Mode**: Deep navy (#1A1F3A), soft teal accents, light off-white text
- **Accessible**: 48px+ tap targets, high contrast, semantic HTML

## Browser Support

- Chrome/Edge 25+
- Safari 14.1+
- Firefox 25+
- Requires Web Speech API support for voice features

## Privacy & Security

- All data is encrypted and stored in Supabase
- Guest sessions are stored locally (localStorage) with random UUIDs
- No authentication required—fully confidential
- No tracking or analytics

## Deployment

### Option 1: Vercel (Recommended)

```bash
vercel deploy
```

Don't forget to add environment variables in Vercel project settings.

### Option 2: Other Platforms

Ensure Node.js 18+ and set environment variables before deploying.

## Troubleshooting

**Voice not working?**
- Check browser compatibility (Chrome, Safari, Edge)
- Grant microphone permissions when prompted
- Use fallback tap-button context capture if voice fails

**AI responses not generating?**
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set
- Check browser console for error messages
- Ensure Supabase connection is working

**Supabase connection issues?**
- Verify URL and anon key in `.env.local`
- Check that the database schema is properly set up (tables created)

## Contributing

This is a v0 generation. For improvements or bug reports, please open an issue.

## License

MIT

## Support

For crisis support, please contact:
- **National Crisis Hotline**: 988 (US)
- **Crisis Text Line**: Text HOME to 741741
- **International**: [findahelpline.com](https://findahelpline.com)

---

Built with compassion. Every voice matters.
