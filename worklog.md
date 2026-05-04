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
