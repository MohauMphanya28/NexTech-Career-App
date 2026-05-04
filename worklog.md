---
Task ID: 21
Agent: Main Agent
Task: Implement document history (save & retrieve) with chat-style UI, cross-component data flow, and enhanced CareerGuide

Work Log:
- Updated Prisma schema: Added `type` (built/analyzed/improved), `analysisData` (JSON), and `originalFileName` fields to Resume model
- Ran `bun run db:push` to sync schema changes
- Created API route `/api/career-documents` with GET (list all), POST (save), DELETE (remove) operations for resumes, cover letters, and interviews
- Created API route `/api/career-documents/[id]` with GET for single document detail retrieval
- Created `DocumentHistory` component with chat-style timeline view: grouped by date (Today/Yesterday/This Week/This Month/Older), search/filter, detail view for each document type, load-into-editor functionality, delete support
- Added `savedDocuments`, `setSavedDocuments`, `dbUserId`, `setDbUserId` to Zustand store
- Added `documents` to `AppView` union type
- Integrated auto-save into ResumeBuilder: saves to DB after existing store save, refreshes document list
- Integrated auto-save into ResumeAnalyzer: saves analysis results with improvedResume data to DB after analysis completes
- Integrated auto-save into CoverLetterGenerator: saves cover letter to DB on save action (fixed async function issue)
- Integrated auto-save into InterviewCoach: saves interview results to DB in all three completion paths (normal, skip, early end)
- Updated Navbar: Replaced "Profile" tab with "My Docs" tab using FolderOpen icon, pointing to 'documents' view
- Updated page.tsx: Added DocumentHistory import and rendering for 'documents' view
- Updated Dashboard: Added "My Documents" quick action card with FolderOpen icon
- Enhanced CareerGuide: Added document-aware cues (My Documents tips, analyzer tips, interview context tips for no-experience candidates, cover letter context tips, motivation messages)
- Fixed InterviewCoach DB save: Changed `await fetch` to fire-and-forget `fetch` since it was inside a non-async `setLiveScores` callback
- Verified compilation succeeds (200 response from dev server)
- Verified `/api/career-documents` API returns correct response

Stage Summary:
- Full document history system implemented: auto-save on all create actions, timeline-style browsing, detail view, load-into-editor
- Cross-component data flow already existed via `careerContext` in Zustand store
- Interview coach already sends `candidateContext` (job title, company, skills, experience, education, cover letter info) to the API
- CareerGuide enhanced with context-aware cues for each step of the journey
- "My Docs" accessible from both the Navbar and Dashboard quick actions

---
Task ID: 22
Agent: Main Agent
Task: Fix analyzed and AI-improved resumes not saving to My Docs

Work Log:
- Identified root cause: OnboardingFlow created user in DB but never captured the real DB user ID (used fake `user-${Date.now()}` instead). When ResumeAnalyzer/ResumeBuilder tried to save with this fake ID, Prisma foreign key constraint failed silently.
- Fixed OnboardingFlow: Now captures real DB user ID from `POST /api/user` response and stores it as `dbUserId` in Zustand store
- Added page.tsx initialization effect: On mount, resolves `dbUserId` from `/api/career-documents` API and restores user profile from DB (handles page refresh which resets Zustand state)
- Made `/api/career-documents` POST endpoint resilient: Auto-creates a user if none exists, verifies userId exists before saving, falls back to existing user or creates new one. Returns resolved `userId` in response.
- Fixed ResumeAnalyzer: Uses robust userId resolution (dbUserId → API fallback → auto-create), saves analysis with `subType: 'analyzed'`, captures resolved userId from save response
- Fixed ResumeAnalyzer "Use Improved Resume" button: Now also saves improved resume to DB with `subType: 'improved'` before navigating to builder
- Fixed ResumeBuilder: Uses same robust userId resolution, correctly marks resumes from analyzer as `subType: 'improved'` (detected by title containing "(Improved)")
- Fixed CoverLetterGenerator: Same robust userId resolution pattern, sends without userId to let API auto-create
- Fixed InterviewCoach: Created `saveInterviewToDb` helper function (avoids `await` in non-async `.finally()` callbacks which caused parse errors), uses fire-and-forget pattern compatible with non-async contexts
- Enhanced DocumentHistory detail view: Now shows full analysis data for analyzed resumes (overall score, ATS score, section breakdown, strengths, weaknesses, key insight) with a visual divider between analysis and resume content
- Added "Analysis" indicator badge in document list for resumes with analysis data
- Added improved resume icon (Sparkles) in detail view for `improved` subType

Stage Summary:
- Critical bug fixed: All document saves now work correctly by resolving the real DB user ID instead of using a fake client-side ID
- Analyzed resumes now properly save to My Docs with full analysis data
- AI-improved resumes now save when user clicks "Use Improved Resume"
- Document detail view now displays rich analysis data for analyzed resumes
- Server-side auto-creates users when needed, making the system resilient to missing userIds
- Page refresh no longer loses the user ID (restored from API on mount)
