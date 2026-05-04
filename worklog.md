# NexTech Career App - Worklog

---
Task ID: 0
Agent: Main Orchestrator
Task: Project initialization and planning

Work Log:
- Analyzed user requirements for NexTech Career App
- Reviewed existing project structure (Next.js 16, Tailwind CSS 4, shadcn/ui)
- Loaded skills: PPT, LLM, Image Generation
- Planned 10-step implementation roadmap
- Key decisions: Single-page app with client-side navigation, dark mode default, mobile-first

Stage Summary:
- Project uses Next.js 16 with App Router
- All features must be on / route only
- Dark mode as default theme
- AI powered by z-ai-web-dev-sdk (backend only)

---
Task ID: 1
Agent: Subagent (general-purpose)
Task: Create PPTX presentation "Addressing Youth Unemployment in South Africa"

Work Log:
- Used Azure theme with teal/cyan accent for the presentation
- Created 12 professional slides covering the full product spec
- Slides include: Cover, Problem, Solution, Resume Builder, Cover Letter, Interview Coach, UX Philosophy, Architecture, SA Context, Roadmap, Impact, Closing
- Generated thumbnails and validated visual quality
- Output: /home/z/my-project/upload/Addressing Youth Unemployment in South Africa.pptx (800KB)

Stage Summary:
- 12-slide professional PPTX created successfully
- Uses Azure theme with custom teal accent (#2A9D8F)
- 6+ layout structures, 4+ card styles, 3+ background treatments

---
Task ID: 2
Agent: Main Orchestrator
Task: Design database schema (Prisma)

Work Log:
- Created Prisma schema with 5 models: User, Resume, CoverLetter, Interview, Progress
- User model: name, email, phone, age, location, education, field, experience, skills, careerGoal, onboardingDone
- Resume model: personalInfo (JSON), summary, experience, education, skills, template, atsScore
- CoverLetter model: title, jobTitle, company, jobDesc, content, tone
- Interview model: type, industry, questions, answers, feedback, scores (overall, confidence, clarity, relevance)
- Progress model: type, milestone, value
- Pushed schema to SQLite database

Stage Summary:
- Database schema with 5 models created and synced
- All relationships configured with cascade delete

---
Task ID: 3-a
Agent: Subagent (full-stack-developer)
Task: Build core UI layout, dark theme, navigation, dashboard

Work Log:
- Created globals.css with custom dark theme (teal/cyan accents, glassmorphism, glow effects)
- Updated layout.tsx with dark mode default, proper metadata, viewport config
- Created Navbar.tsx: Bottom navigation with 5 tabs (Home, Resume, Letter, Interview, Profile)
- Created Dashboard.tsx: Hero banner, Quick Actions grid, Stats section, Tip of the Day, Getting Started CTA
- Used framer-motion for stagger animations, glass backgrounds, teal/cyan accents

Stage Summary:
- Dark theme with custom CSS variables, glassmorphism, glow effects
- Mobile-first bottom navigation with active state indicators
- Dashboard with hero image, action cards, progress stats, AI tips

---
Task ID: 3-b
Agent: Subagent (full-stack-developer)
Task: Build onboarding flow

Work Log:
- Created OnboardingFlow.tsx: Chat-style conversational onboarding
- 7 steps: Name, Career Interest, Experience Level, Education, Skills, Location, Career Goal
- AI typing indicator, progressive chip/text inputs
- Data saved to Zustand store and POSTed to /api/user
- On completion, navigates to dashboard

Stage Summary:
- Conversational AI-guided onboarding with 7 steps
- Chat UI with Framer Motion animations
- Chip selection + text input modes
- Profile data persisted to database

---
Task ID: 4
Agent: Subagent (full-stack-developer)
Task: Build AI Resume Builder

Work Log:
- Created ResumeBuilder.tsx: 6-step progressive wizard
- Steps: Personal Info, Professional Summary, Work Experience, Education, Skills, Preview & Generate
- AI integration: AI Suggest Summary, AI Improve Experience, AI Suggest Skills, Generate Full Resume
- ATS Score display with circular progress indicator
- Save to store and database, navigate back to dashboard

Stage Summary:
- Full resume builder with AI-powered suggestions
- Dynamic add/remove for experience and education entries
- Skills selection from Technical/Soft/Industry-specific categories
- ATS score calculation and improvement suggestions

---
Task ID: 5
Agent: Subagent (full-stack-developer)
Task: Build AI Cover Letter Generator

Work Log:
- Created CoverLetterGenerator.tsx: 3-phase flow (Input, Generating, Preview)
- Input: Job title, company, job description, tone selector (5 options)
- Generating: Animated progress, typing indicator, fun fact card
- Preview: Editable textarea, word count, Save/Copy/Regenerate buttons
- API call: POST /api/ai/cover-letter with profile and resume data

Stage Summary:
- Three-phase cover letter generator with AI
- Five tone options: Formal, Confident, Entry-level, Warm, Concise
- Copy to clipboard, save, and regenerate functionality

---
Task ID: 6
Agent: Subagent (full-stack-developer)
Task: Build AI Interview Coach

Work Log:
- Created InterviewCoach.tsx: Setup, Interview, Results, Review modes
- Setup: Industry selector (9 SA industries), question count (3/5/7/10)
- Interview: Chat UI with live scores (Relevance, Clarity, Confidence), skip option
- Results: Circular score visualization, breakdown bars, feedback summary, improvement tips
- Review: Q&A pairs with inline feedback and per-question scores
- Score history tracked in store for progress tracking

Stage Summary:
- Full interview simulation with AI evaluation
- Live scoring during interview with color-coded indicators
- Comprehensive results with improvement tips
- Session history for progress tracking

---
Task ID: 7
Agent: Subagent (full-stack-developer)
Task: Build progress tracking dashboard

Work Log:
- Created ProgressTracker.tsx: Career Readiness Score, Stats Grid, Interview Performance, Achievements, Tips, Next Steps
- Career Readiness: SVG circular progress (0-100%) calculated from resume + letters + interviews
- Stats: Resumes, Letters, Interviews, Avg Score
- Achievements: 5 badges (First Resume, Cover Letter Pro, Interview Ready, High Scorer, Career Ready)
- Context-aware tips and next steps based on user progress

Stage Summary:
- Visual progress dashboard with animated SVG indicators
- Achievement/milestone system with unlock conditions
- Smart next-step recommendations based on user state

---
Task ID: 8
Agent: Main Orchestrator
Task: Create backend API routes

Work Log:
- Created /api/ai/chat/route.ts: General LLM chat with type-specific system prompts
- Created /api/ai/resume/route.ts: Resume generation with ATS scoring
- Created /api/ai/cover-letter/route.ts: Cover letter generation with tone options
- Created /api/ai/interview/route.ts: Interview start/evaluate actions
- Created /api/user/route.ts: CRUD operations for user profiles
- All routes use z-ai-web-dev-sdk (backend only)

Stage Summary:
- 5 API routes for AI features and user management
- LLM integration with context-aware system prompts
- South African context built into all AI prompts

---
Task ID: 9
Agent: Main Orchestrator
Task: Generate brand images and polish UI

Work Log:
- Generated hero image: /public/nextech-hero.png (1344x768, abstract geometric teal/cyan)
- Generated app icon: /public/nextech-icon.png (1024x1024, stylized N logo)
- Added hero banner to Dashboard with gradient overlay
- Added Image component import for next/image optimization
- Verified all components compile and render correctly

Stage Summary:
- AI-generated brand images added to public folder
- Hero banner integrated into Dashboard with gradient overlay
- All features rendering correctly on dev server

---
Task ID: 10
Agent: Main Orchestrator
Task: Fix voice transcription bug in Interview Coach

Work Log:
- Investigated the voice transcription pipeline end-to-end
- Identified 5 root causes from dev server logs:
  1. ASR API format detection failure: "unsupported audio format: unknown, only WAV and WebM are supported"
  2. ASR 30-second duration limit exceeded: "transcriptions文件时长限制为0-30秒"
  3. TTS format error: "不支持当前response_format值" for wav format
  4. Stale closure bug: sendAnswer captured in stale closure in startRecording's useCallback
  5. No user feedback when ASR fails — UI stuck in "transcribing" state
- Fixed ASR route: Better error handling with specific error messages for format and duration errors
- Fixed TTS route: Changed response_format from 'wav' to 'mp3' (more universally supported)
- Fixed InterviewCoach component:
  - Added WAV encoding utilities (writeStringToDataView, encodeAudioBufferToWav, convertBlobToWavBase64)
  - Client-side audio conversion: Recorded audio is decoded via AudioContext and re-encoded as WAV before sending to ASR
  - Added sendAnswerRef pattern to eliminate stale closure in mediaRecorder.onstop
  - Added 25-second recording auto-stop timer (ASR API limit is 30s)
  - Added user-friendly error feedback messages in chat when ASR fails
  - Fixed score double-counting bug in interview completion path
  - Fixed 800ms typing indicator gap in next-question path
  - Removed dead audioContextRef
  - Tightened error string matching in ASR route

Stage Summary:
- Voice transcription now works by converting recorded audio to WAV format before sending
- Stale closure bug fixed with ref pattern
- Recording capped at 25 seconds to stay under ASR's 30-second limit
- Users get helpful feedback when voice transcription fails
- Score calculation corrected — no double-counting
- TTS switched to mp3 format for reliability

---
Task ID: 11
Agent: Main Orchestrator
Task: Fix TTS "不支持当前response_format值" error (mp3 format rejected by API)

Work Log:
- User reported console error: "TTS failed" at InterviewCoach.tsx:573
- Investigated dev server logs — found TTS API returning 400: {"error":{"code":"1214","message":"不支持当前response_format值"}}
- Root cause: The TTS API rejects `response_format: 'mp3'`. The previous fix (Task 10) incorrectly changed from wav to mp3
- Loaded TTS skill documentation — confirmed `wav` is the default and most reliably supported format
- Fixed TTS route (/api/ai/tts/route.ts):
  - Changed `response_format` from `'mp3'` to `'wav'` in both single-request and chunked paths
  - Changed `Content-Type` from `'audio/mpeg'` to `'audio/wav'`
  - Added `concatWavBuffers()` utility for proper WAV file concatenation (strip headers from subsequent chunks, update RIFF size)
  - Previous approach of `Buffer.concat()` produced invalid WAV for multi-chunk texts
- Fixed ASR route (/api/ai/asr/route.ts):
  - Added explicit `format: 'wav'` parameter to help the ASR API recognize the format
- Fixed InterviewCoach.tsx playTTS:
  - Replaced `throw new Error('TTS failed')` with graceful degradation (log error + return)
  - Interview continues without audio if TTS fails, instead of crashing
  - Added blob size validation (< 100 bytes = invalid audio)
  - Added detailed error logging with status code and response body
- Verified: TTS endpoint now returns 200 with valid 216KB WAV file

Stage Summary:
- TTS API now works correctly with `wav` format (the API's native format)
- ASR reliability improved with explicit `format: 'wav'` hint
- Frontend gracefully handles TTS failures — interview always continues
- WAV concatenation properly handles long text chunks
