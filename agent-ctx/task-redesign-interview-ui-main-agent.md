# Task: Redesign Interview Mode to Zoom-like Virtual Interview Experience

## Summary
Successfully redesigned the interview mode of `InterviewCoach.tsx` from a chat-style UI to a Zoom-like Virtual Interview Experience with animated AI avatars, camera PiP, collapsible transcript, and dark video-call aesthetic.

## Changes Made

### 1. New Imports (line ~5-31)
- Added `Video`, `VideoOff`, `MessageCircle` from `lucide-react`
- Added `InterviewAvatar` from `@/components/career/InterviewAvatar`

### 2. New State Variables (line ~604-608)
- `cameraOn` (boolean) - tracks user camera state
- `showTranscript` (boolean) - tracks transcript panel visibility
- `userVideoRef` (ref) - reference to user video element
- `userStreamRef` (ref) - reference to user MediaStream

### 3. New Callbacks (line ~626-653)
- `toggleCamera()` - async function to turn camera on/off using `getUserMedia`
- Camera cleanup `useEffect` on unmount

### 4. Cleanup in Existing Functions
- `handleEndInterview()` - now stops camera stream and resets camera state
- `handleReset()` - now stops camera stream, resets camera and transcript state

### 5. Derived State (line ~1465-1473)
- `latestAiQuestion` - useMemo to find the most recent AI question
- `avgScore` - computed average of live scores

### 6. Complete Interview Mode UI Replacement (line ~2158-2743)
Replaced the entire interview mode rendering with a Zoom-like interface:

**Top Bar**: Dark glassmorphism bar with interviewer info (avatar + name + title), timer (MM:SS), question progress (Q3/5), score badge, and end call button.

**Main Video Area** (dark bg-black/95):
- Ambient glow in interviewer's accent color
- Large centered InterviewAvatar component with lip-sync (passes `currentAudioRef` and `isAiSpeaking`)
- Name badge below avatar
- Status indicators: speaking (with wave visualizer), thinking (animated dots), transcribing, ready
- Current question subtitle in semi-transparent card
- Collapsible chat transcript (bottom-left, toggle button, scrollable messages)
- User camera PiP (bottom-right, mirrored video, placeholder when off)

**Text Input Area** (shown when in text mode):
- Dark themed input with send button
- Character count feedback

**Bottom Control Bar** (dark glassmorphism):
- Camera toggle (with green indicator when on)
- Mute AI toggle (red when muted)
- Main mic button (large, white when idle, red with pulse rings when recording, purple when transcribing)
- Skip question button
- Input mode switch (keyboard/message circle icons)
- Hint text below controls

**End Interview Dialog**: Dark themed modal matching the video call aesthetic (bg-neutral-900, white/10 borders)

## Key Design Decisions
- Mobile-first responsive design with sm: breakpoints
- All touch targets at least 44px (size-11 = 44px)
- Interviewer accent color themes the entire experience
- Smooth framer-motion transitions between states
- Camera stream properly cleaned up on interview end/reset/unmount
- useMemo for latestAiQuestion moved before early returns to satisfy React hooks rules
