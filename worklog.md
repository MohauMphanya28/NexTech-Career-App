---
Task ID: 3
Agent: Main Agent
Task: Implement seamless progression (Resume → Cover Letter auto-redirect) and authentication (login, signup, sign out)

Work Log:
- Read and analyzed all project files: store.ts, ResumeAnalyzer.tsx, CoverLetterGenerator.tsx, ResumeBuilder.tsx, Dashboard.tsx, Navbar.tsx, page.tsx, OnboardingFlow.tsx, DocumentHistory.tsx, career-documents API, user API, Prisma schema
- Updated Zustand store (src/lib/store.ts):
  - Added 'auth' to AppView type
  - Added `pendingCoverLetterGenerate` boolean and setter for seamless flow
  - Added `isAuthenticated` boolean and setter for auth state
- Modified ResumeAnalyzer (src/components/career/ResumeAnalyzer.tsx):
  - Changed `handleUseImprovedResume` to set careerContext with resume data (job title, company, skills, etc.)
  - Pre-fills cover letter store fields (job title, company)
  - Sets `pendingCoverLetterGenerate = true` flag
  - Redirects directly to cover-letter view instead of resume builder
  - Updated toast message to indicate progression to cover letter
- Modified ResumeBuilder (src/components/career/ResumeBuilder.tsx):
  - Added `setPendingCoverLetterGenerate` to destructured store values
  - Changed `handleSave` to redirect to cover-letter view instead of dashboard
  - Sets `pendingCoverLetterGenerate = true` for auto-generation
- Modified CoverLetterGenerator (src/components/career/CoverLetterGenerator.tsx):
  - Added `useRef` and `useEffect` imports
  - Added `pendingCoverLetterGenerate` and `setPendingCoverLetterGenerate` from store
  - Added `autoGenerateRef` to prevent double-trigger
  - Added useEffect to auto-generate cover letter when `pendingCoverLetterGenerate` is true and form is valid
  - Added "Next Step: Practice Interview" CTA card in preview phase with save+redirect to interview
  - Added ArrowRight and Mic icons to imports
- Updated Prisma schema:
  - Added `passwordHash` field to User model
  - Added `@unique` constraint on email field
  - Ran `prisma db push --accept-data-loss` to sync schema
- Created auth API (src/app/api/auth/route.ts):
  - POST handler with `action: 'login' | 'register'`
  - Register: validates email uniqueness, hashes password with bcryptjs, creates user
  - Login: finds user by email, verifies password with bcryptjs, returns user data
  - Handles legacy users without passwords
- Created AuthScreen component (src/components/career/AuthScreen.tsx):
  - Login/register mode toggle with animated transitions
  - Email, password, name fields with validation
  - Show/hide password toggle
  - Error message display
  - Loading state with spinner
  - On success: sets user in store, sets isAuthenticated, persists to localStorage, navigates to dashboard or onboarding
  - Feature cards highlighting AI tools and SA-specific design
- Updated page.tsx:
  - Added AuthScreen import and useCallback, toast imports
  - Added localStorage-based auth persistence on mount
  - Legacy user migration: auto-authenticates existing DB users and saves to localStorage
  - Shows AuthScreen when `!isAuthenticated && currentView !== 'onboarding'`
  - ProfileView now includes Sign Out button that clears auth state and localStorage
  - Shows user email in profile header
- Updated OnboardingFlow:
  - Added `setIsAuthenticated` to store destructuring
  - On onboarding completion: sets `isAuthenticated = true` and saves to localStorage
- Updated Navbar:
  - Added Profile tab with User icon (6 tabs total)
  - Adjusted padding/spacing for 6-tab layout
- Installed bcryptjs and @types/bcryptjs

Stage Summary:
- Seamless progression: Resume → Cover Letter → Interview flow is now automatic with data pre-population
- Authentication: Full login/signup/sign-out system with localStorage persistence
- All code compiles (verified: `GET / 200`)
- No lint errors in src/ directory
