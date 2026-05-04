
---
Task ID: 1
Agent: main
Task: Fix all 5 reported issues - TTS format, voice quality, audio delay, image alignment, accent support

Work Log:
- Fixed TTS route: switched from `wav` to `mp3` format (primary) with `wav` fallback
- Fixed voice assignments: James→jam, Zanele→luodo, Kazi→kazi. Each interviewer now has a UNIQUE voice
- Reduced volume levels: All interviewers set to volume 1.2. Clamped TTS route max volume to 2.0
- Fixed 5-second audio delay: aiTyping cleared when LLM text arrives, not when audio plays
- Fixed InterviewAvatar image/circle misalignment: explicit width/height, objectPosition center 20%
- Added accent emphasis in LLM system prompts

Stage Summary:
- All 5 reported issues fixed
- Each interviewer has unique voice: kazi, xiaochen, tongtong, jam, luodo
