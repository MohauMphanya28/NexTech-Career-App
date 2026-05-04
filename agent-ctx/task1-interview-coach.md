# Task: InterviewCoach Component

## Summary
Created the InterviewCoach.tsx component for the NexTech Career App - a comprehensive AI-powered mock interview simulator with real-time feedback and scoring.

## Files Created/Modified
- **Created**: `/home/z/my-project/src/components/career/InterviewCoach.tsx` - Main component
- **Modified**: `/home/z/my-project/src/app/page.tsx` - Integrated InterviewCoach into routing

## Component Features

### Setup Screen
- Industry/Job Type selector with 9 SA industries (Technology, Finance, Healthcare, Retail, Government, Education, Engineering, Creative, General)
- Question count selector (3, 5, 7, 10)
- "Start Interview" button with Mic icon
- Previous sessions summary (from store)
- Pro tip card for encouragement

### Interview Mode
- Chat-style interface with AI messages (left, teal border), user messages (right, primary/20 bg), and feedback messages (centered, Star icon)
- Live score indicators at top: Relevance, Clarity, Confidence (0-10 with colored bars)
- Question counter and progress bar
- Text input with Send button, Skip option, character counter
- Auto-scroll to latest message
- Typing indicator animation
- Enter to send, Shift+Enter for newline

### Results Screen
- Large SVG circular progress indicator with animated stroke-dashoffset
- Score breakdown with animated bars (teal/yellow/red based on score)
- Score interpretation guide (0-3, 4-6, 7-8, 9-10)
- AI-generated feedback summary
- Actionable improvement tips based on weak areas
- Action buttons: Practice Again, Review Answers, Back to Dashboard

### Review Answers Screen
- Q&A pairs with feedback and per-question scores
- Glass-styled cards with badges

## Technical Details
- Uses framer-motion for all animations
- Integrates with useAppStore (interviewSession, interviewHistory, aiTyping, isLoading)
- API calls to POST /api/ai/interview (start and evaluate actions)
- Running average for live scores during interview
- Responsive mobile-first design
- All required icons from lucide-react
- All required shadcn components (Button, Input, Card, Progress, Badge)
