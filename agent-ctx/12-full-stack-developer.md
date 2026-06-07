# Task 12: Auto-unmute interviewer audio & interviewer avatars

## Agent: full-stack-developer

## Summary

Implemented two major features for the InterviewCoach component:

### Feature 1: Auto-unmute the interviewer
- Browser autoplay policy blocks `audio.play()` in setTimeout callbacks unless unlocked by a prior user gesture
- Added `unlockAudio()` that creates/resumes an AudioContext and plays a silent buffer
- Called in `handleStartInterview()` (user gesture) before any TTS calls
- Added `audioContextRef` to store the unlocked AudioContext
- Added AudioContext resume check before `audio.play()` in `playTTS()`
- Cleanup in `handleReset()`

### Feature 2: Interviewer Avatars with different voices and tones
- 5 interviewer personas: Kazi, Thabo, Naledi, James, Zanele
- Each has: unique voice, accent color, avatar gradient, personality prompt
- Voices map to TTS API voices: kazi, xiaochen, tongtong, jam, luodo
- Selection UI added to setup screen with avatar cards
- Interview chat UI dynamically uses selected interviewer's colors/avatar
- API routes pass personality to LLM system prompts

## Files Modified
1. `/home/z/my-project/src/components/career/InterviewCoach.tsx` - Main component
2. `/home/z/my-project/src/app/api/ai/interview/route.ts` - Interview API route
3. `/home/z/my-project/src/app/api/ai/tts/route.ts` - TTS voice type update

## Verification
- All changes compile successfully
- No errors in dev server logs
- ESLint passes (only pre-existing workspace/compile.js errors)
