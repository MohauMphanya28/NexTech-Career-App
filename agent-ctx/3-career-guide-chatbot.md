# Task ID: 3 — CareerGuide Chatbot Component

## Agent
CareerGuide Chatbot Component

## Summary
Created a floating chatbot-style guide component (CareerGuide) for the NexTech Career App that provides contextual hints and next-step suggestions based on user progress.

## Files Created/Modified

### Created
- `/home/z/my-project/src/components/career/CareerGuide.tsx` — Floating chatbot guide component

### Modified
- `/home/z/my-project/src/lib/store.ts` — Added `CareerContext` interface, `careerContext` state, and `setCareerContext` method
- `/home/z/my-project/src/app/page.tsx` — Integrated CareerGuide component into main layout
- `/home/z/my-project/worklog.md` — Appended work record

## Component Features

### Floating Button
- Positioned bottom-right (bottom-24, above navbar)
- Teal-500 background with shadow glow
- Animated icon swap (MessageCircle ↔ X) with rotation transitions
- Pulse ring animation when new messages exist
- Notification dot with scale animation

### Chat Panel
- Slide-up animation with spring easing
- Backdrop blur + glass effect
- Header with Sparkles icon and "NexTech Guide" branding
- Responsive: full-width on mobile (100vw-2rem), 320px on desktop

### Contextual Messages
7 message types based on career progress and current view:
1. **start-resume** (next-step): Dashboard tip when resume not started
2. **next-cover-letter** (next-step): After resume completed, prompt cover letter
3. **next-interview** (next-step): After cover letter, prompt interview practice
4. **interview-done** (success): After interview, show score and progress view
5. **resume-tip** (tip): View-specific tip on resume builder
6. **cover-letter-context** (tip): Tip about auto-filled data
7. **interview-context** (tip): Tip about tailored questions

Each type has distinct color coding:
- next-step → teal (bg-teal-500/10)
- tip → amber (bg-amber-500/10)
- success → emerald (bg-emerald-500/10)
- motivation → purple (bg-purple-500/10)

### Interactivity
- Dismiss individual messages (X button)
- Action buttons navigate to relevant views
- Progress indicator (3 dots) at panel bottom
- Hidden during onboarding view
- Hidden when no messages exist

## Store Changes
Added `CareerContext` interface with fields:
- resumeJobTitle, resumeCompany, resumeSummary, resumeSkills
- resumeExperience, resumeEducation, resumeCompleted
- coverLetterJobTitle, coverLetterCompany, coverLetterTone, coverLetterCompleted
- lastInterviewScore, interviewCompleted, currentStep

Added `careerContext` initial state and `setCareerContext(ctx: Partial<CareerContext>)` method.

## Lint Results
All files pass ESLint with no errors.
