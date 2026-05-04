# Task 2: Career Context System (Linked Data Flow)

## Summary
Implemented a linked career context system connecting ResumeBuilder, CoverLetterGenerator, and InterviewCoach through shared Zustand state. When a user builds a resume for a specific job, the cover letter and interview components automatically receive this context.

## Files Modified
1. `src/lib/store.ts` - Added CareerContext interface and state
2. `src/components/career/ResumeBuilder.tsx` - Saves career context on resume save
3. `src/components/career/CoverLetterGenerator.tsx` - Pre-fills from career context, saves on cover letter save
4. `src/components/career/InterviewCoach.tsx` - Auto-derives industry, sends candidateContext to API, saves results
5. `src/app/api/ai/interview/route.ts` - Uses candidate context in system prompts

## Verification
- ESLint: All 5 files pass with zero errors
- TypeScript: No new type errors introduced
- Dev server compiles successfully
