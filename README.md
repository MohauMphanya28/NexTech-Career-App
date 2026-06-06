# NexTech Career App

AI-Powered Career Platform for South Africa's Youth

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ or **Bun** runtime
- **npm** or **bun** package manager

### Setup

1. **Clone/Download the project**
   ```bash
   cd nextech-career-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up the database**
   ```bash
   # The .env file should contain:
   # DATABASE_URL=file:./db/custom.db
   
   # Push the schema to create tables
   npm run db:push
   # or
   bun run db:push
   ```

4. **Generate Prisma Client**
   ```bash
   npm run db:generate
   # or
   bun run db:generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

6. **Open your browser** → `http://localhost:3000`

### Production Build

```bash
npm run build
npm run start
# or
bun run build
bun run start
```

## 📁 Project Structure

```
├── prisma/
│   └── schema.prisma       # Database schema
├── db/
│   └── custom.db           # SQLite database file
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Authentication
│   │   │   ├── ai/         # AI features (LLM, TTS, ASR)
│   │   │   ├── career-documents/  # Document CRUD
│   │   │   ├── progress/   # Progress tracking
│   │   │   └── user/       # User management
│   │   ├── page.tsx        # Main app page
│   │   └── layout.tsx      # Root layout
│   ├── components/
│   │   ├── career/         # App components
│   │   └── ui/             # shadcn/ui components
│   └── lib/
│       ├── store.ts        # Zustand state management
│       └── db.ts           # Prisma client
├── public/                 # Static assets
├── .env                    # Environment variables
└── package.json
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./db/custom.db` |

## 🛠️ Tech Stack

- **Framework**: Next.js 16 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM + SQLite
- **State**: Zustand
- **AI**: z-ai-web-dev-sdk (LLM, TTS, ASR, VLM)
- **Auth**: Custom with bcryptjs
- **Animations**: Framer Motion

## 📱 Features

- ✅ AI Resume Builder & Analyzer
- ✅ AI Cover Letter Generator (5 tones)
- ✅ AI Interview Coach (5 SA-accent personalities, voice + text)
- ✅ Career Guide Widget
- ✅ Document History & Management
- ✅ Progress Tracker
- ✅ Seamless data flow between features
- ✅ Mobile-first dark theme design

## 📝 Notes

- The database is SQLite, stored in `db/custom.db`
- On first run, run `npm run db:push` to create the database tables
- The app uses the z-ai-web-dev-sdk for AI features - ensure network access for API calls
- All data is stored locally in the SQLite database
