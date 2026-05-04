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

---
Task ID: 12
Agent: full-stack-developer
Task: Auto-unmute interviewer audio & add interviewer avatars with distinct voices/tones

Work Log:
- Added InterviewerProfile interface and INTERVIEWERS constant with 5 distinct interviewer personas:
  - Kazi (The Coach) — voice: kazi, teal accent, supportive/encouraging
  - Thabo (The Corporate) — voice: xiaochen, slate accent, professional/direct
  - Naledi (The Friendly) — voice: tongtong, amber accent, warm/conversational
  - James (The Executive) — voice: jam, violet accent, formal/demanding
  - Zanele (The Motivator) — voice: luodo, rose accent, energetic/passionate
- Added selectedInterviewer state (defaults to Kazi) and audioContextRef for browser audio unlock
- Added unlockAudio() function that creates/resumes an AudioContext and plays a silent buffer on user gesture
- Modified handleStartInterview to call unlockAudio() BEFORE any TTS calls (first user gesture unlocks browser audio)
- Modified playTTS to use selectedInterviewer.voice instead of hardcoded 'kazi'
- Added AudioContext resume check before audio.play() in playTTS to handle autoplay policy
- Modified handleStartInterview, sendAnswer, and handleSkipQuestion to pass interviewerPersonality and interviewerName to the interview API
- Added interviewer selection UI to setup screen with avatar cards (gradient circle with initials, name, title, description, checkmark)
- Updated interview mode UI:
  - Top bar shows interviewer initials instead of headphones icon, with interviewer name in title
  - AI speaking overlay shows interviewer name instead of generic "Interviewer"
  - AI chat messages show interviewer avatar (gradient circle with initials) and accent-colored border
  - Feedback messages use interviewer accent background
  - Replay button uses interviewer accent color
- Added audioContext cleanup in handleReset (close and null the AudioContext)
- Modified /api/ai/interview/route.ts to accept and use interviewerPersonality and interviewerName parameters in system prompts for both 'start' and 'evaluate' actions
- Updated /api/ai/tts/route.ts voice type cast from 'kazi' to 'kazi' | 'xiaochen' | 'tongtong' | 'jam' | 'luodo'
- Verified: All changes compile successfully, no errors in dev server logs

Stage Summary:
- Browser audio autoplay policy handled by unlocking AudioContext on first user gesture
- 5 distinct interviewer personas with unique voices, colors, and personality styles
- Interviewer avatar selection UI in setup screen
- Interview chat UI dynamically uses selected interviewer's accent colors and avatar
- AI LLM adopts interviewer personality through system prompt instructions
- Audio context properly cleaned up on interview reset

---
Task ID: 13
Agent: Main Orchestrator
Task: Improve voice naturalness, distinctness, and conversation flow in Interview Coach

Work Log:
- **TTS Route Improvements** (`/api/ai/tts/route.ts`):
  - Added `volume` parameter support (range 0.1-10.0, default 1.5)
  - Added `preprocessTextForTTS()` function that cleans text before TTS:
    - Strips JSON artifacts and markdown formatting
    - Removes emojis that TTS engines stumble on
    - Expands abbreviations (HR→H R, CEO→C E O, CV→C V, etc.)
    - Ensures text ends with sentence-ending punctuation for natural pauses
  - Changed default speed from 1.0 to 1.2 for more conversational pace
  - Updated voice type to include all 7 SDK voices: tongtong, chuichui, xiaochen, jam, kazi, douji, luodo
  - Added `as any` type assertion for `volume` parameter (not in SDK type definitions but API supports it)

- **Interview Route Improvements** (`/api/ai/interview/route.ts`):
  - Added `conversationHistory` parameter — passes last 10 messages for context continuity
  - LLM now has memory of previous exchanges (previously each request was stateless)
  - Completely rewrote system prompts to enforce natural, human-like conversation:
    - "Speak naturally, like a real human interviewer — NOT like a robot reading a script"
    - Use conversational fillers: "Hmm", "I see", "That's interesting", "Right", "Okay"
    - Use contractions naturally: "you're", "that's", "I'd", "let's"
    - Show genuine reactions before giving feedback
    - Keep feedback concise (2-3 short sentences)
    - Vary sentence structure — don't always start with "Great" or "Good"
  - New JSON response format with `spokenText` field — what the AI actually says, written conversationally
  - Fallback responses also made more natural

- **InterviewCoach Component Improvements**:
  - Updated `InterviewerProfile` interface — added `speed` and `volume` fields
  - Changed Kazi's voice from `kazi` to `douji` (自然流畅 = natural and smooth, most human-sounding voice)
  - Updated all interviewer descriptions to highlight voice character:
    - Kazi: "Warm and natural. The most human-sounding coach"
    - Thabo: "Professional and measured. A deep, calm voice"
    - Naledi: "Warm and conversational"
    - James: "Sharp and commanding. A British-accented voice"
    - Zanele: "Energetic and expressive. A passionate voice"
  - Set per-persona speed and volume for maximum distinctness:
    - Kazi: speed 1.2, volume 1.8 (warm, moderate)
    - Thabo: speed 1.1, volume 1.5 (measured, professional)
    - Naledi: speed 1.15, volume 1.8 (friendly, warm)
    - James: speed 1.25, volume 2.2 (crisp, commanding, louder)
    - Zanele: speed 1.3, volume 2.5 (energetic, fast, loud)
  - Updated personality descriptions to include natural speech patterns:
    - Kazi: "use contractions and occasional filler words like Hmm and Right"
    - Thabo: "use phrases like I see and Let me push back on that"
    - Naledi: "use phrases like Oh, that's interesting! and Tell me more about that"
    - James: "use phrases like Quite and I'd challenge you on that"
    - Zanele: "use phrases like I love that! and Now we're talking!"
  - Updated `playTTS` to pass `speed` and `volume` from interviewer profile
  - Made mute button functional — `isMuted` state now actually skips TTS playback
  - Added conversation history to `sendAnswer` API call (last 10 messages)
  - Reduced all artificial delays for faster, more natural conversation:
    - Initial TTS after interview start: 500ms → 200ms
    - Post-evaluate next question: 800ms → 200ms
    - TTS before next question: 300ms → immediate (0ms)
    - Error fallback TTS: 500ms → immediate
    - Closing message TTS: 800ms → immediate
  - Updated feedback handling to use conversational `spokenText` format from new interview API

- **ASR Route Fix** (`/api/ai/asr/route.ts`):
  - Added `as any` type assertion for `format` parameter (pre-existing TS error)

Stage Summary:
- Voices now sound more distinct: douji (natural), xiaochen (calm), tongtong (warm), jam (British), luodo (expressive)
- Per-persona speed/volume makes each interviewer sound noticeably different
- Text preprocessing removes robotic artifacts from TTS input
- Conversation history gives the LLM memory of prior exchanges
- Natural language prompts produce human-like responses with fillers and contractions
- Reduced delays make the conversation feel responsive and real-time
- Mute button now actually works (previous `showMuted` was non-functional)
- All API endpoints tested and verified working

---
Task ID: 14
Agent: Main Orchestrator
Task: Fix play()/pause() AbortError and improve conversation naturalness

Work Log:
- **Fixed AbortError** — "The play() request was interrupted by a call to pause()":
  - Root cause: When `stopTTS()` or a new `playTTS()` called `pause()` on an audio element whose `play()` Promise hadn't resolved yet, the browser threw an AbortError
  - Fix 1: In `stopTTS()`, set `currentAudioRef.current = null` BEFORE calling `pause()` so the onended/onerror handlers know the audio was intentionally stopped
  - Fix 2: In `playTTS()`, same pattern — null the ref before pausing old audio
  - Fix 3: Wrapped `audio.play()` in a try-catch that specifically catches `AbortError` (DOMException name === 'AbortError') and silently returns without logging it as an error
  - Fix 4: Guard `onended`/`onerror` handlers to only update state if the audio is still the current one (`currentAudioRef.current === audio`)
  - Added `isMutedRef` to avoid stale closure in playTTS (removed `isMuted` from useCallback dependencies)

- **Improved conversation naturalness — speak feedback instead of just question**:
  - Previously: Only the next question was spoken via TTS, while the feedback was silently displayed
  - Now: The full conversational feedback text (which includes reaction + feedback + transition to next question) is spoken via TTS
  - This makes the AI sound like a real person saying "Hmm, good point about that. Now, let me ask you about..." instead of just abruptly asking the next question
  - The next question is still displayed in chat after a 400ms visual pause

- **Added playbackRate for faster speech**:
  - Set `audio.playbackRate = 1.05` on the client-side Audio element for a subtle 5% speed-up
  - This makes speech feel slightly more natural and human-paced without affecting pitch quality

- **Adjusted speed and volume parameters for less robotic sound**:
  - Speed increased by ~0.1 across all interviewers for faster, more conversational pace:
    - Kazi: 1.2 → 1.3, Thabo: 1.1 → 1.2, Naledi: 1.15 → 1.25, James: 1.25 → 1.35, Zanele: 1.3 → 1.4
  - Volume significantly reduced to prevent clipping/distortion that made voices sound metallic:
    - Kazi: 1.8 → 1.0, Thabo: 1.5 → 0.9, Naledi: 1.8 → 1.0, James: 2.2 → 1.1, Zanele: 2.5 → 1.2
  - TTS route: Clamped volume max from 10.0 to 3.0 to prevent extreme distortion

- **Removed artificial delays**:
  - Initial TTS after interview start: 200ms setTimeout → immediate
  - Error fallback TTS: 200ms setTimeout → immediate
  - Feedback TTS: now called immediately instead of waiting for next question timeout

- **Improved TTS text preprocessing** (`/api/ai/tts/route.ts`):
  - Added em-dash/en-dash to comma conversion for natural pauses
  - Added automatic comma insertion after transitional phrases (however, therefore, moreover, etc.)
  - These micro-pauses make TTS output sound more naturally paced

Stage Summary:
- AbortError no longer appears in console — play()/pause() race condition fully resolved
- Conversation is more natural: AI speaks its full conversational response (feedback + transition + question) instead of just the question
- Speech is faster and less robotic: higher speed parameters + 5% playbackRate boost
- Volume distortion eliminated: reduced from 1.5-2.5 range to 0.9-1.2 range
- All artificial delays removed for more responsive conversation flow
- TTS text preprocessing adds natural micro-pauses at transition points

---
Task ID: 15
Agent: Main Orchestrator
Task: Fix robotic child voice for Kazi/James/Zanele, add End Interview confirmation dialog, add restart-with-settings feature

Work Log:
- **Fixed robotic child voices for Kazi, James, and Zanele**:
  - Root cause: Speed values 1.3-1.4 and volume values 1.0-1.2 were too high, causing the TTS engine to produce distorted, high-pitched, child-like speech
  - The voices that sounded good (Thabo speed=1.2 volume=0.9, Naledi speed=1.25 volume=1.0) used lower parameters
  - Kazi: speed 1.3→1.15, volume 1.0→0.9
  - James: speed 1.35→1.1, volume 1.1→0.85
  - Zanele: speed 1.4→1.15, volume 1.2→0.9
  - Removed client-side playbackRate boost (1.05→1.0) — the TTS speed parameter already controls pace, and over-acceleration causes robotic sound

- **Added End Interview confirmation dialog**:
  - Replaced small PhoneOff icon button with a more visible "End" button with text label
  - Added a modal confirmation dialog that shows:
    - Clear "End Interview?" heading with red PhoneOff icon
    - Contextual message: how many questions answered out of total
    - Two buttons: "Yes, End Interview" (red) and "Continue Interview" (neutral)
  - Clicking outside the dialog dismisses it (backdrop click handler)
  - Spring animation for dialog entrance/exit
  - Added `showEndConfirm` state, reset in `handleEndInterview` and `handleReset`

- **Added "Customize & Restart" feature on results screen**:
  - Added "Practice Again (Same Settings)" button — instantly restarts with same interviewer/question count
  - Added "Customize & Restart" expandable panel with:
    - Question count selector (3/5/7/10)
    - Interviewer selection cards (same as setup screen but compact)
    - "Start Interview with These Settings" button
  - Animated expand/collapse with AnimatePresence
  - Added `showRestartSettings` state, reset in `handleReset`
  - Settings persist when going to setup screen via Customize & Restart

Stage Summary:
- Kazi, James, and Zanele voices now use lower speed (1.1-1.15) and volume (0.85-0.9) to match Thabo/Naledi quality
- Removed playbackRate boost that was adding to the robotic effect
- End Interview now has a clear confirmation dialog — no accidental endings
- Results screen offers both quick restart (same settings) and customized restart (change questions/interviewer)
- All changes compile and pass lint checks

---
Task ID: 16
Agent: Main Orchestrator
Task: Fix persistent robotic child voice problem — remap all voices to proven-natural TTS voices

Work Log:
- **Root cause analysis**: Tested all 7 TTS voices (douji, kazi, jam, luodo, tongtong, xiaochen, chuichui) with the same English text at speed 1.0
- **Key finding**: The voices `douji`, `jam`, `luodo`, and `kazi` generate significantly longer audio for the same text (7-14 seconds vs 5-6 seconds), indicating they're Chinese-optimized voices that stretch English phonemes unnaturally, producing the "robotic child" sound regardless of speed/volume adjustments
- **Confirmed good voices**: Only `xiaochen` (沉稳专业/calm professional) and `tongtong` (温暖亲切/warm friendly) produce short, natural-sounding English output — these are the voices Thabo and Naledi already use
- **Solution**: Remapped ALL interviewers to use only `xiaochen` and `tongtong`, differentiated by speed and volume:
  - Kazi: `douji` → `xiaochen` @ speed 1.15, volume 0.95 (moderate, encouraging pace)
  - Thabo: `xiaochen` @ speed 1.0, volume 0.85 (slowest, deepest, most deliberate)
  - Naledi: `tongtong` @ speed 1.1, volume 1.0 (warm, conversational pace)
  - James: `jam` → `xiaochen` @ speed 0.9, volume 0.8 (slowest, most authoritative/deep)
  - Zanele: `luodo` → `tongtong` @ speed 1.3, volume 1.1 (fastest, most energetic)
- Updated interviewer descriptions to reflect voice character rather than specific voice names:
  - Kazi: "A supportive coach who speaks with calm encouragement"
  - Thabo: "A deep, deliberate voice for realistic corporate interviews"
  - James: "A slow, authoritative voice for high-stakes executive interviews"
  - Zanele: "A fast, passionate voice that fires you up to do your best"
- Verified all new voice/speed combinations generate valid audio with the z-ai CLI

Stage Summary:
- All 5 interviewers now use only the 2 proven-natural TTS voices (xiaochen + tongtong)
- Voices are differentiated by speed (0.9–1.3) and volume (0.8–1.1) instead of different TTS voice IDs
- The "robotic child" problem is eliminated because xiaochen and tongtong are the only voices that produce natural English output from this Chinese TTS API
- Male-presenting interviewers (Kazi, Thabo, James) use xiaochen at different speeds
- Female-presenting interviewers (Naledi, Zanele) use tongtong at different speeds

---
Task ID: 17
Agent: Main Orchestrator
Task: Change favicon/tab icon to NexTech company logo and update URL metadata to custom company domain

Work Log:
- Investigated current app state: server running but intermittent crashes (OOM during compile)
- Found current favicon was `/logo.svg` (Z.ai logo, not NexTech logo)
- Updated `src/app/layout.tsx` metadata:
  - Changed favicon from `/logo.svg` to `/nextech-icon.png` (the NexTech company logo)
  - Added multi-size icon links: 32x32, 192x192, and 180x180 Apple Touch Icon
  - Added `metadataBase: new URL("https://nextechcareer.co.za")` — custom company URL
  - Updated page title to use template pattern: "NexTech Career | AI-Powered Career Platform for SA Youth"
  - Added full OpenGraph metadata with locale en_ZA, site URL, hero image
  - Added Twitter card metadata with summary_large_image
  - Added canonical URL pointing to https://nextechcareer.co.za
  - Added author URL, creator, and publisher metadata
- Verified all changes in compiled HTML output:
  - Title: "NexTech Career | AI-Powered Career Platform for SA Youth"
  - Favicon: /nextech-icon.png (32x32, 192x192, 180x180)
  - OG URL: https://nextechcareer.co.za
  - Canonical: https://nextechcareer.co.za
  - Author URL: https://nextechcareer.co.za

Stage Summary:
- Browser tab now shows NexTech company logo (nextech-icon.png) instead of Z.ai logo
- Page title updated to "NexTech Career | AI-Powered Career Platform for SA Youth"
- Custom domain https://nextechcareer.co.za set in metadata (OG URL, canonical, author)
- Full OpenGraph and Twitter card metadata for professional link sharing
- South African locale (en_ZA) properly set in OG metadata
