---
Task ID: 1
Agent: main
Task: Fix "Failed to fetch" error and robotic voices in Interview Coach

Work Log:
- Investigated the "Failed to fetch" TypeError at InterviewCoach.tsx:1010
- Confirmed the /api/ai/interview API route exists and works correctly (tested with curl, returns 200)
- Identified the error was a transient network issue, not a code bug
- Added `fetchWithRetry()` utility function with exponential backoff (3 retries, 500ms base delay) for network-level failures
- Applied fetchWithRetry to all 5 fetch calls: 3 interview API calls, 1 TTS call, 1 ASR call
- ROOT CAUSE of robotic voices: Kazi and James both used `xiaochen` voice, Zanele used `tongtong` at speed 1.3 (too fast)
- Fixed voice assignments:
  - Kazi: `xiaochen` → `kazi` (Clear and standard - literally named for this avatar!)
  - James: `xiaochen` → `jam` (British gentleman - perfect for the executive persona!)
  - Zanele: `tongtong` → `luodo` (Infectious/expressive - great for the motivator!)
- Adjusted volume parameters (0.8-1.1 → 1.2-1.4 range) for better audibility without distortion
- Reduced Zanele's speed from 1.3 to 1.15 to prevent robotic-sounding fast playback
- Tested all 3 new voices via TTS API - all return valid WAV audio (368KB-454KB)
- Verified full interview start flow works end-to-end

Stage Summary:
- "Failed to fetch" error now has automatic retry with backoff
- Voice assignments now use unique, personality-matching voice_ids
- All 5 interviewers now have distinct voices: kazi, xiaochen, tongtong, jam, luodo
- Server compiles cleanly, all API endpoints tested and working
