const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageOrientation, TableOfContents, SectionType,
} = require("docx");
const fs = require("fs");

// ═══════════════════════════════════════════════════════════════
// PALETTE — DM-1 Deep Cyan (Tech / AI)
// ═══════════════════════════════════════════════════════════════
const P = {
  bg: "162235",
  primary: "FFFFFF",
  accent: "37DCF2",
  cover: {
    titleColor: "FFFFFF",
    subtitleColor: "B0B8C0",
    metaColor: "90989F",
    footerColor: "687078",
  },
  table: {
    headerBg: "1B6B7A",
    headerText: "FFFFFF",
    accentLine: "1B6B7A",
    innerLine: "C8DDE2",
    surface: "EDF3F5",
  },
  body: "1A2B40",
  secondary: "6878A0",
  surface: "F4F8FC",
};
const c = (hex) => hex.replace("#", "");

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200, line: 312 },
    keepNext: true,
    children: [new TextRun({ text, bold: true, size: 32, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, color: c(P.body) })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150, line: 312 },
    keepNext: true,
    children: [new TextRun({ text, bold: true, size: 28, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, color: c(P.body) })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: 312 },
    keepNext: true,
    children: [new TextRun({ text, bold: true, size: 26, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, color: c(P.body) })],
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 24, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" }, color: "000000" })],
  });
}

function bodyNoIndent(text) {
  return new Paragraph({
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 24, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" }, color: "000000" })],
  });
}

function bodyBold(text) {
  return new Paragraph({
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, bold: true, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" }, color: "000000" })],
  });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { line: 276, before: 80, after: 80 },
    indent: { left: 360 },
    shading: { type: ShadingType.CLEAR, fill: "F0F4F8" },
    children: [new TextRun({ text, size: 20, font: { ascii: "Courier New", eastAsia: "Courier New" }, color: "2D3748" })],
  });
}

function spacer(twips = 120) {
  return new Paragraph({ spacing: { before: twips, after: 0 }, children: [] });
}

function makeTable(headers, rows, colWidths) {
  const t = P.table;
  const hdrCells = headers.map((h, i) => new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 21, font: { ascii: "Times New Roman" }, color: c(t.headerText) })] })],
    shading: { type: ShadingType.CLEAR, fill: c(t.headerBg) },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    width: colWidths ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
  }));

  const dataRows = rows.map((row, ri) => new TableRow({
    cantSplit: true,
    children: row.map((cell, ci) => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 21, font: { ascii: "Times New Roman" }, color: "000000" })] })],
      shading: ri % 2 === 0 ? { type: ShadingType.CLEAR, fill: c(t.surface) } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      width: colWidths ? { size: colWidths[ci], type: WidthType.PERCENTAGE } : undefined,
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: c(t.accentLine) },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: c(t.accentLine) },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: c(t.innerLine) },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: hdrCells }),
      ...dataRows,
    ],
  });
}

// ═══════════════════════════════════════════════════════════════
// COVER PAGE — R1 Pure Paragraph Left (Dark bg)
// ═══════════════════════════════════════════════════════════════
function buildCover() {
  const title = "NexTech Career App";
  const subtitle = "Comprehensive Technical Guide";
  const meta1 = "AI-Powered Career Platform for South African Youth";
  const meta2 = "Version 1.0  |  March 2026";
  const meta3 = "Architecture, APIs, Data Flow & Design System";

  return [
    // Full-height wrapper table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: allNoBorders,
      rows: [new TableRow({
        height: { value: 16838, rule: "exact" },
        children: [new TableCell({
          verticalAlign: "top",
          borders: allNoBorders,
          shading: { type: ShadingType.CLEAR, fill: c(P.bg) },
          width: { size: 100, type: WidthType.PERCENTAGE },
          children: [
            // Top spacing
            new Paragraph({ spacing: { before: 4200 }, children: [] }),
            // Title
            new Paragraph({
              spacing: { after: 200, line: 920, lineRule: "atLeast" },
              indent: { left: 1200 },
              children: [new TextRun({ text: title, bold: true, size: 80, font: { ascii: "Times New Roman" }, color: c(P.cover.titleColor) })],
            }),
            // Accent line (paragraph border)
            new Paragraph({
              indent: { left: 1200, right: 5000 },
              spacing: { before: 100, after: 200 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: c(P.accent), space: 12 } },
              children: [],
            }),
            // Subtitle
            new Paragraph({
              spacing: { after: 400, line: 480, lineRule: "atLeast" },
              indent: { left: 1200 },
              children: [new TextRun({ text: subtitle, size: 36, font: { ascii: "Times New Roman" }, color: c(P.accent) })],
            }),
            // Meta lines
            new Paragraph({
              spacing: { after: 80 },
              indent: { left: 1200 },
              children: [new TextRun({ text: meta1, size: 22, font: { ascii: "Times New Roman" }, color: c(P.cover.metaColor) })],
            }),
            new Paragraph({
              spacing: { after: 80 },
              indent: { left: 1200 },
              children: [new TextRun({ text: meta2, size: 22, font: { ascii: "Times New Roman" }, color: c(P.cover.metaColor) })],
            }),
            new Paragraph({
              spacing: { after: 80 },
              indent: { left: 1200 },
              children: [new TextRun({ text: meta3, size: 22, font: { ascii: "Times New Roman" }, color: c(P.cover.metaColor) })],
            }),
          ],
        })],
      })],
    }),
  ];
}

// ═══════════════════════════════════════════════════════════════
// PAGE NUMBER FOOTER
// ═══════════════════════════════════════════════════════════════
function pageNumFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
    })],
  });
}

// ═══════════════════════════════════════════════════════════════
// BODY CONTENT
// ═══════════════════════════════════════════════════════════════
function buildBodyContent() {
  const children = [];

  // ── 1. Introduction & Overview ──
  children.push(heading1("1. Introduction & Overview"));
  children.push(body("NexTech Career is an AI-powered career development platform purpose-built for South African youth between the ages of 15 and 34. The platform addresses a critical gap in the South African job market: while millions of young people possess talent and ambition, many lack the tools, guidance, and professional documentation needed to secure meaningful employment. NexTech Career bridges this divide by leveraging cutting-edge artificial intelligence to democratise access to career preparation resources."));
  children.push(body("The platform's mission is to empower every young South African with the ability to build a professional resume, craft tailored cover letters, practise interview skills with AI coaches, and track their career readiness over time. By combining AI-powered document generation with interactive interview coaching, NexTech Career transforms the job search from an intimidating process into a guided, step-by-step journey."));
  children.push(heading2("1.1 Core Design Principles"));
  children.push(body("The application is built on four foundational pillars that inform every design and engineering decision:"));
  children.push(bodyBold("Mobile-First Design: South Africa's youth primarily access the internet via smartphones. Every component is optimised for mobile viewports, with touch-friendly interactions, safe-area-aware navigation, and responsive layouts that adapt gracefully from 320px to desktop widths."));
  children.push(bodyBold("Dark Theme with Glassmorphism: The visual identity centres on a deep dark palette with translucent glass-effect panels (the \"glass\" and \"glass-strong\" CSS classes). This design language conveys modernity and reduces eye strain during extended sessions, which is particularly important for users on older devices with limited brightness."));
  children.push(bodyBold("AI-Native Architecture: Artificial intelligence is not an afterthought or a bolt-on feature. The entire application workflow is designed around AI capabilities: from the onboarding chat that builds a user profile, through AI-generated resume summaries and skill suggestions, to the text-to-speech interview coaching system."));
  children.push(bodyBold("Seamless Workflow Integration: The core user journey follows a deliberate flow: Build Resume, then Generate Cover Letter, then Practise Interview, then Track Progress. Data flows seamlessly between these steps via the careerContext state bridge, ensuring that information entered at one stage automatically populates and enhances subsequent stages."));
  children.push(heading2("1.2 Target Audience"));
  children.push(body("NexTech Career specifically targets South African youth aged 15-34, a demographic that faces unemployment rates exceeding 40%. The platform is designed to be accessible to users with varying levels of digital literacy, from first-time job seekers to recent graduates entering the professional world. The onboarding flow is deliberately conversational and encouraging, using AI-generated motivational messages to keep users engaged through a seven-step profile-building wizard."));

  // ── 2. Application Architecture ──
  children.push(heading1("2. Application Architecture"));
  children.push(body("NexTech Career employs a modern single-page application (SPA) architecture built on Next.js 16 with the App Router paradigm. The entire application operates within a single page.tsx entry point, with client-side routing managed by the Zustand state store rather than the traditional Next.js file-based routing system. This approach enables seamless transitions between application views without page reloads, creating a fluid, app-like experience that is critical for the mobile-first audience."));
  children.push(heading2("2.1 Component Hierarchy"));
  children.push(body("The application follows a top-down component hierarchy where page.tsx acts as the root orchestrator. Based on the current state of the Zustand store, the root component conditionally renders one of several major view components: AuthScreen for unauthenticated users, OnboardingScreen for new user registration, DashboardScreen for the main application hub, and individual feature screens for each major workflow (ResumeBuilder, CoverLetterGenerator, InterviewCoach, ProgressTracker, and DocumentVault)."));
  children.push(body("This conditional rendering pattern means that only one top-level view is mounted at any given time, which simplifies state management and reduces memory overhead on mobile devices. Transitions between views are animated using Framer Motion, providing visual continuity and preventing the jarring page-swap experience common in traditional multi-page applications."));
  children.push(heading2("2.2 State Management"));
  children.push(body("The Zustand store (located at src/lib/store.ts) is the central nervous system of the application. It maintains over 30 state fields that govern everything from the current view and user authentication status to detailed career context data and interview session state. The store is defined as a single combined store using Zustand's create function with TypeScript type definitions that enforce type safety across all components."));
  children.push(body("Key state categories include: navigation state (currentView, currentStep), authentication state (userId, email, isAuthenticated, mounted), onboarding state (onboardingStep, onboardingData), resume building state (resumeData, careerContext), cover letter state (coverLetterData, pendingCoverLetterGenerate), interview state (interviewSession, interviewerPersonality), and progress tracking state (progressStats, achievements). All state mutations are performed through defined action functions within the store, ensuring predictable state transitions."));
  children.push(heading2("2.3 Database Layer"));
  children.push(body("Data persistence is handled by Prisma ORM connected to an SQLite database stored at db/custom.db. Prisma provides type-safe database access with automatic migration generation, ensuring that the TypeScript application code and the database schema remain in sync. The database stores five primary entities: User, Resume, CoverLetter, Interview, and Progress, each with well-defined relationships and timestamps for audit trailing."));

  // ── 3. Technology Stack ──
  children.push(heading1("3. Technology Stack"));
  children.push(body("The technology stack has been carefully selected to balance developer productivity, runtime performance, and deployment simplicity. Each technology choice is driven by specific requirements of the NexTech Career platform."));
  children.push(makeTable(
    ["Layer", "Technology", "Version / Detail", "Rationale"],
    [
      ["Framework", "Next.js (App Router)", "16.1.3 with Turbopack", "SSR-capable React framework with fast refresh"],
      ["Language", "TypeScript", "5.x", "Type safety across the entire codebase"],
      ["Styling", "Tailwind CSS", "4.x", "Utility-first CSS with JIT compilation"],
      ["UI Library", "shadcn/ui (New York)", "Latest", "Accessible, composable component primitives"],
      ["Animation", "Framer Motion", "11.x", "Declarative animations for page transitions"],
      ["State", "Zustand", "5.x", "Lightweight, TypeScript-first state management"],
      ["Database", "Prisma ORM + SQLite", "6.x / custom.db", "Type-safe queries, zero-config embedded DB"],
      ["Auth", "Custom bcrypt-based", "bcryptjs", "Simple email/password with hashing"],
      ["AI SDK", "z-ai-web-dev-sdk", "Latest", "Unified LLM, VLM, TTS, ASR access"],
      ["Proxy", "Caddy", "Port 81 to 3000", "Automatic HTTPS, reverse proxy"],
      ["Runtime", "Bun", "1.x", "Fast package manager and JS runtime"],
      ["Mini-Service", "Express.js", "Port 3031", "Document text extraction service"],
    ],
    [20, 22, 28, 30]
  ));
  children.push(spacer(100));
  children.push(body("The choice of SQLite over a client-server database (such as PostgreSQL) is intentional. For a platform that may be deployed in environments with limited infrastructure, SQLite provides a zero-configuration, file-based database that requires no separate server process. Prisma's abstraction layer ensures that a migration to a more scalable database would require minimal code changes if needed in the future."));

  // ── 4. Authentication System ──
  children.push(heading1("4. Authentication System"));
  children.push(body("NexTech Career implements a custom authentication system built on email/password credentials with bcryptjs password hashing. While the platform does not use a dedicated authentication service (such as Auth0 or NextAuth), the custom implementation provides the essential security properties needed for the application's scope, including password hashing, session persistence, and hydration-safe client restoration."));
  children.push(heading2("4.1 Registration and Login"));
  children.push(body("Authentication is handled through a single API endpoint at POST /api/auth, which accepts an action parameter of either 'login' or 'register'. For registration, the endpoint receives an email and password, hashes the password using bcryptjs with a standard salt round configuration, and creates a new User record in the database. For login, the endpoint retrieves the user by email, compares the provided password against the stored hash, and returns the user ID and email on successful authentication."));
  children.push(heading2("4.2 Session Persistence"));
  children.push(body("After successful authentication, the user's ID and email are stored in the browser's localStorage as a JSON object: { userId, email }. On subsequent application loads, the AuthScreen component checks localStorage for existing credentials and attempts to restore the session by calling GET /api/user with the stored userId. This approach avoids the complexity of server-side session management while providing a seamless re-authentication experience."));
  children.push(heading2("4.3 Hydration Safety"));
  children.push(body("A critical challenge in Next.js applications that read from localStorage is the hydration mismatch between server-rendered HTML and client-side state. NexTech Career solves this with a 'mounted' state guard pattern. The root component maintains a mounted boolean in the Zustand store, which is initially false. On the first client-side render cycle, a useEffect hook sets mounted to true and checks localStorage for existing credentials. Until mounted is true, the application renders a loading state, preventing any mismatch between server and client HTML."));
  children.push(heading2("4.4 Legacy User Migration"));
  children.push(body("The system includes a migration path for users who were created before the authentication system was implemented. When a login attempt finds a user record without a password hash, the system automatically sets the provided password as the user's new password and completes the login. This ensures that early adopters are not locked out when authentication is introduced."));

  // ── 5. Onboarding Flow ──
  children.push(heading1("5. Onboarding Flow"));
  children.push(body("The onboarding experience is a seven-step chat-like wizard that collects essential career profile information from new users. Designed to feel conversational rather than form-like, each step presents a focused question with appropriate input mechanisms, and AI-generated encouragement messages appear between steps to maintain user engagement and reduce abandonment."));
  children.push(heading2("5.1 Step Sequence"));
  children.push(makeTable(
    ["Step", "Question", "Input Type", "Data Stored"],
    [
      ["1", "What is your full name?", "Text input", "name"],
      ["2", "What career field interests you?", "Chip selection (single)", "careerInterest"],
      ["3", "How much work experience do you have?", "Chip selection (single)", "experience"],
      ["4", "What is your highest education level?", "Chip selection (single)", "education"],
      ["5", "What are your key skills?", "Chip selection (multi) + text", "skills"],
      ["6", "Where are you located?", "Chip selection + text input", "location"],
      ["7", "What is your career goal?", "Text input (textarea)", "careerGoal"],
    ],
    [10, 35, 25, 30]
  ));
  children.push(spacer(100));
  children.push(heading2("5.2 AI Encouragement"));
  children.push(body("Between each onboarding step, the application calls /api/ai/chat with type: 'onboarding' to generate a contextual encouragement message. These messages acknowledge the user's previous answer, validate their career direction, and gently prompt them toward the next question. This transforms what could be a tedious data-entry process into an engaging, supportive conversation."));
  children.push(heading2("5.3 Completion and Auto-Authentication"));
  children.push(body("Upon completing all seven steps, the onboarding data is submitted to PUT /api/user to save the user's profile. The system then automatically authenticates the user (setting userId and email in the store and localStorage), updates the Zustand store with the profile data and career context, and navigates directly to the Dashboard. This seamless transition ensures that new users are immediately immersed in the application without encountering another login screen."));

  // ── 6. AI-Powered Resume Builder ──
  children.push(heading1("6. AI-Powered Resume Builder"));
  children.push(body("The Resume Builder is the foundational feature of NexTech Career, guiding users through a six-step process to create a professional, ATS-optimised resume. Each step focuses on a specific section of the resume, and AI capabilities are integrated at multiple points to assist users who may struggle with self-description, a common challenge for first-time job seekers."));
  children.push(heading2("6.1 Step Structure"));
  children.push(makeTable(
    ["Step", "Section", "Key Features"],
    [
      ["1", "Personal Information", "Name, email, phone, location, LinkedIn, portfolio URL"],
      ["2", "Professional Summary", "AI Suggest Summary button, manual textarea"],
      ["3", "Work Experience", "Add/remove entries, AI Improve per entry, action verb suggestions"],
      ["4", "Education", "Institution, degree, field, dates, GPA"],
      ["5", "Skills", "AI Suggest Skills, categorized chip selection, custom input"],
      ["6", "Preview & Generate", "Full resume preview, Generate Resume with ATS score"],
    ],
    [10, 25, 65]
  ));
  children.push(spacer(100));
  children.push(heading2("6.2 AI Features"));
  children.push(bodyBold("AI Suggest Summary"));
  children.push(body("This feature generates a context-aware professional summary based on the user's onboarding profile data. The system combines the user's career interest, experience level, education, and skills into a prompt that produces a concise, industry-appropriate summary. Users can accept, edit, or regenerate the suggestion."));
  children.push(bodyBold("AI Improve"));
  children.push(body("Available on each work experience entry, the AI Improve feature rewrites the user's job description bullet points using strong action verbs and quantifiable achievements. For example, 'worked on the team that handled marketing' might be improved to 'Collaborated with a cross-functional marketing team to execute campaigns reaching 50,000+ target customers.' The improvement maintains the user's original meaning while elevating the professional tone."));
  children.push(bodyBold("AI Suggest Skills"));
  children.push(body("Based on the user's selected career interest, this feature suggests 8-10 industry-specific skills. The skill taxonomy covers Technical skills (programming languages, tools, frameworks), Soft skills (communication, leadership, problem-solving), and Industry-specific categories for IT, Finance, Healthcare, Education, Retail, Engineering, and Media. Users can select from suggestions or add custom skills."));
  children.push(bodyBold("Generate Resume"));
  children.push(body("The final AI feature produces a complete ATS-optimised resume in JSON format via the /api/ai/resume endpoint. The generated resume includes an ATS compatibility score, which evaluates how well the resume would perform in Applicant Tracking System parsing. The system analyses keyword density, formatting simplicity, section completeness, and industry alignment."));
  children.push(heading2("6.3 Save and Redirect Flow"));
  children.push(body("When the user saves a completed resume, several actions occur in sequence: (1) the careerContext state is populated with the resume's job title, company, summary, skills, experience, and education data; (2) the resume is persisted to the database via POST /api/resumes; (3) the pendingCoverLetterGenerate flag is set to true in the Zustand store; and (4) the application automatically navigates to the Cover Letter Generator. This chained workflow ensures that users progress naturally through the career preparation journey without needing to manually re-enter data."));

  // ── 7. Resume Analyzer ──
  children.push(heading1("7. Resume Analyzer (VLM + LLM)"));
  children.push(body("The Resume Analyzer allows users to upload existing resumes for AI-powered analysis and improvement. This feature is particularly valuable for users who already have a resume but want to optimise it for ATS compatibility and professional impact. The analysis operates in two distinct phases: text extraction followed by AI analysis."));
  children.push(heading2("7.1 Upload and Text Extraction"));
  children.push(body("Users can upload resume files in PDF, DOCX, or TXT format, with a maximum file size of 10MB. The text extraction is handled by a dedicated mini-service running on port 3031, which uses specialised libraries for each format:"));
  children.push(makeTable(
    ["File Format", "Extraction Library", "Process"],
    [
      ["PDF", "pdf-parse + pdfjs-dist", "Binary parsing with layout-aware text extraction"],
      ["DOCX", "mammoth", "XML-to-text conversion preserving paragraph structure"],
      ["TXT", "Buffer decoding", "Direct UTF-8 text read with encoding detection"],
    ],
    [20, 30, 50]
  ));
  children.push(spacer(100));
  children.push(heading2("7.2 AI Analysis Pipeline"));
  children.push(body("Once text is extracted, it is sent to the /api/ai/resume-analyze endpoint, which orchestrates a multi-faceted LLM analysis. The analysis produces a comprehensive result object with the following components:"));
  children.push(bodyBold("Overall Score (0-100)"));
  children.push(body("A weighted composite score reflecting the resume's overall quality, combining ATS compatibility, content strength, and presentation."));
  children.push(bodyBold("ATS Compatibility"));
  children.push(body("Includes a numerical score plus specific issues detected (e.g., missing keywords, formatting problems, section gaps) and actionable tips for improvement. This directly addresses the reality that many South African employers use ATS systems to filter applications."));
  children.push(bodyBold("Content Analysis"));
  children.push(body("Four sub-scores evaluating: impact and achievement orientation, keyword relevance to the target industry, clarity and readability, and completeness of information. Each sub-score includes specific feedback."));
  children.push(bodyBold("Strengths and Weaknesses"));
  children.push(body("Enumerated lists of what the resume does well and where it falls short, providing clear direction for improvement."));
  children.push(bodyBold("Improvement Plan"));
  children.push(body("A prioritised, ordered list of improvements ranked by expected impact. This gives users a clear roadmap rather than an overwhelming list of changes."));
  children.push(bodyBold("Improved Resume"));
  children.push(body("A fully polished version of the resume with all improvements applied. Users can choose to 'Use Improved Resume,' which loads it directly into the Resume Builder and triggers the cover letter generation flow, maintaining the seamless workflow integration."));
  children.push(bodyBold("Key Insight"));
  children.push(body("A single, memorable takeaway that summarises the most important finding from the analysis."));

  // ── 8. Cover Letter Generator ──
  children.push(heading1("8. Cover Letter Generator"));
  children.push(body("The Cover Letter Generator creates tailored, professional cover letters using AI, with smart data pre-population from the resume context. It is designed to work seamlessly as the second step in the core workflow, automatically receiving career context data from the previously completed resume."));
  children.push(heading2("8.1 Input Configuration"));
  children.push(makeTable(
    ["Field", "Required", "Source", "Description"],
    [
      ["Job Title", "Yes", "Auto-filled from careerContext.resumeJobTitle", "Target position title"],
      ["Company", "Yes", "Auto-filled from careerContext.resumeCompany", "Target employer name"],
      ["Job Description", "No", "Manual input", "Optional posting text for better tailoring"],
      ["Tone", "Yes", "User selection", "Style of the generated letter"],
    ],
    [15, 10, 35, 40]
  ));
  children.push(spacer(100));
  children.push(heading2("8.2 Tone Selection"));
  children.push(body("Users can choose from five distinct tones, each producing a letter with different stylistic characteristics:"));
  children.push(makeTable(
    ["Tone", "Character", "Best For"],
    [
      ["Formal", "Traditional professional language, conservative structure", "Corporate roles, government positions, senior roles"],
      ["Confident", "Assertive, achievement-focused, bold claims with evidence", "Sales, leadership, competitive applications"],
      ["Entry-level", "Humble, eager to learn, emphasis on potential over experience", "First jobs, internships, career changers"],
      ["Warm", "Personable, relationship-oriented, genuine enthusiasm", "Small companies, startups, creative roles"],
      ["Concise", "Brief, impactful, respect for the reader's time", "Executive assistants, busy recruiters, tech roles"],
    ],
    [15, 45, 40]
  ));
  children.push(spacer(100));
  children.push(heading2("8.3 Auto-Generation Flow"));
  children.push(body("When the pendingCoverLetterGenerate flag is set to true (which happens automatically when a resume is saved), the Cover Letter Generator automatically triggers generation upon mount. This means that after completing a resume, users are taken to the Cover Letter screen where a letter is already being generated for them, requiring no additional clicks. The /api/ai/cover-letter endpoint produces a 300-400 word letter structured with a compelling opening hook, a connection between the applicant's experience and the role, genuine enthusiasm for the company, and a clear call to action."));
  children.push(heading2("8.4 Preview and Actions"));
  children.push(body("The generated cover letter is displayed in an editable textarea with a real-time word count. Users can copy the letter to clipboard, save it to the Document Vault, regenerate with the same or different parameters, or edit the text directly before saving. Upon saving, a prominent 'Practise Interview' call-to-action button appears, guiding users to the next step in the workflow."));

  // ── 9. Interview Coach ──
  children.push(heading1("9. Interview Coach (TTS + ASR)"));
  children.push(body("The Interview Coach is the most technically sophisticated feature of NexTech Career, combining text-to-speech (TTS), automatic speech recognition (ASR), and LLM-powered evaluation into an interactive interview simulation. Users engage in a realistic interview experience with AI-powered interviewer personalities, receiving real-time feedback and scoring on their responses."));
  children.push(heading2("9.1 Interviewer Personalities"));
  children.push(body("The system features five distinct interviewer personalities, each modelled on a South African professional archetype. This cultural grounding makes the practice experience relatable and prepares users for the specific communication styles they may encounter in the South African job market."));
  children.push(makeTable(
    ["Name", "Persona", "Voice", "Speed", "Speech Patterns"],
    [
      ["Kazi", "Coach from Cape Town", "xiaochen", "1.15x", "\"ja\", \"lekker\", \"sho\""],
      ["Thabo", "Corporate HR from Johannesburg", "xiaochen", "1.0x", "Formal corporate SA English"],
      ["Naledi", "Friendly from Durban", "tongtong", "1.1x", "\"hey?\", \"shame\" (SA Indian)"],
      ["James", "Executive, British RP", "xiaochen", "0.85x", "\"Quite right\", \"Rather\""],
      ["Zanele", "Motivator from Soweto", "tongtong", "1.3x", "\"Hayi bo!\", \"Siyabang!\""],
    ],
    [10, 22, 15, 10, 43]
  ));
  children.push(spacer(100));
  children.push(heading2("9.2 Interview Setup"));
  children.push(body("Before starting an interview, users configure the session by selecting an interviewer personality, specifying the target industry (auto-derived from resume data if available), choosing the number of questions (3, 5, 7, or 10), and selecting an input mode (voice or text). Voice mode uses the device microphone for spoken responses, while text mode provides a textarea for typed answers, ensuring accessibility for users in noisy environments or those uncomfortable with voice input."));
  children.push(heading2("9.3 Interview Flow"));
  children.push(body("The interview follows a structured loop: Start with AI greeting, AI asks a question via TTS, user responds via voice or text, LLM evaluates the response, feedback and scores are displayed, the next question is asked, and the loop repeats until all questions are exhausted. At the conclusion, a comprehensive results screen displays the overall session score, per-question breakdowns, and recommendations for improvement."));
  children.push(heading2("9.4 TTS Pipeline"));
  children.push(body("The text-to-speech pipeline converts the interviewer's text into natural-sounding speech with the following stages:"));
  children.push(bodyBold("Text Preprocessing"));
  children.push(body("Raw text from the LLM is preprocessed to expand abbreviations (e.g., 'SA' becomes 'South Africa'), clean markdown formatting, add strategic pauses using punctuation insertion, and normalise numbers and special characters for optimal speech synthesis."));
  children.push(bodyBold("Chunking"));
  children.push(body("Preprocessed text is split into chunks of 1000 characters or fewer, ensuring each chunk ends at a sentence boundary. This limit is imposed by the TTS API's maximum input length."));
  children.push(bodyBold("API Calls and Concatenation"));
  children.push(body("Each chunk is sent to the z-ai TTS API, which returns WAV or MP3 audio data. The audio chunks are then concatenated in sequence to produce the complete spoken response. Playback is synchronised with a lip-sync animation on the interviewer avatar for visual engagement."));
  children.push(heading2("9.5 ASR Pipeline"));
  children.push(body("For voice input, the automatic speech recognition pipeline operates as follows: the browser's MediaRecorder API captures the user's microphone input, the raw audio is converted to WAV format at 16kHz mono using client-side audio processing, the WAV data is base64-encoded and sent to /api/ai/asr, and the API returns a text transcription of the spoken response. This transcription is then evaluated by the LLM alongside text-mode responses."));
  children.push(heading2("9.6 Rate Limiting and Caching"));
  children.push(body("To manage API costs and prevent abuse, the interview system implements a request queue that allows a maximum of one concurrent TTS/ASR request with up to five queued requests. If the queue is full, the system returns a 429 status code and prompts the user to wait. Additionally, a hash-based audio cache with a 50-entry FIFO eviction policy stores previously generated speech for repeated phrases (such as interviewer greetings and transition messages), reducing redundant API calls."));
  children.push(heading2("9.7 Scoring System"));
  children.push(body("Each interview response is evaluated on three dimensions: relevance (how directly the answer addresses the question), clarity (how well-structured and articulate the response is), and confidence (the perceived authority and conviction of the delivery). Each dimension is scored from 0 to 10, and the per-answer score is the weighted average. The overall session score is the average of all per-answer scores. These scores feed into the Progress Tracker's career readiness calculation."));

  // ── 10. Career Guide Assistant ──
  children.push(heading1("10. Career Guide Assistant"));
  children.push(body("The Career Guide Assistant is a rule-based contextual help system that provides timely guidance without requiring LLM calls. It appears as a floating action button with a notification pulse animation, drawing attention when new guidance is available based on the user's current state and progress."));
  children.push(heading2("10.1 Message Generation"));
  children.push(body("Unlike the AI-powered features, the Career Guide uses deterministic rules to generate messages. It evaluates the current state of careerContext (what the user has completed) and currentView (what screen the user is on) to select the most relevant guidance message. Messages are categorised into four types: next-step (directing users to the next logical action), tip (providing helpful advice for the current task), success (celebrating completed milestones), and motivation (encouraging continued engagement)."));
  children.push(heading2("10.2 Progress Indicator"));
  children.push(body("The Career Guide displays a three-dot progress indicator representing the three core workflow stages: resume completion, cover letter completion, and interview completion. Filled dots indicate completed stages, providing a quick visual summary of the user's progress through the career preparation journey. Users can dismiss individual messages, and quick-action navigation buttons allow them to jump directly to the recommended next step."));

  // ── 11. Progress Tracker ──
  children.push(heading1("11. Progress Tracker"));
  children.push(body("The Progress Tracker provides a comprehensive dashboard that quantifies the user's career readiness and tracks their growth over time. It synthesises data from all other features into a single, motivating view that drives continued engagement."));
  children.push(heading2("11.1 Career Readiness Score"));
  children.push(body("The Career Readiness Score is a composite metric ranging from 0 to 100%, calculated from three weighted components:"));
  children.push(makeTable(
    ["Component", "Maximum Points", "Calculation"],
    [
      ["Resume", "40 + atsScore x 0.2", "Base 40 points for completion, plus up to 20 bonus points from ATS score"],
      ["Cover Letter", "20", "Minimum 20 points for any completed cover letter"],
      ["Interview", "40", "Minimum 40 points for completion, plus avgScore x 4 bonus for high performers"],
    ],
    [20, 25, 55]
  ));
  children.push(spacer(100));
  children.push(body("The formula ensures that completing all three core activities yields at least 100 points (40 + 20 + 40), with additional ATS and interview performance bonuses pushing the score above 100, which is capped at 100%. This design rewards completeness while providing aspirational stretch goals."));
  children.push(heading2("11.2 Statistics and Achievements"));
  children.push(body("The statistics grid displays four key metrics: total resumes created, total cover letters generated, total interviews completed, and average interview score. Below the statistics, the interview performance section shows trend data across sessions, with visual bars for confidence, clarity, and relevance, and highlights the user's best and worst performance areas."));
  children.push(body("The achievement system provides milestone-based recognition: First Resume (complete your first resume), Cover Letter Pro (generate three or more cover letters), Interview Ready (complete three or more interviews), High Scorer (achieve an average interview score of 8 or above), and Career Ready (reach an overall readiness score of 80% or higher). Each achievement unlocks a visual badge and motivational message."));
  children.push(heading2("11.3 Next Step Recommendation"));
  children.push(body("Based on the current progress state, the tracker recommends the single most impactful next action with a prominent 'Go' button that navigates directly to the relevant feature. This ensures that users always have a clear path forward, even after extended breaks from the platform."));

  // ── 12. Document Vault ──
  children.push(heading1("12. Document Vault & Persistence"));
  children.push(body("The Document Vault serves as the persistent storage layer for all user-created documents, providing search, filter, and retrieval capabilities across resumes, cover letters, and interview records."));
  children.push(heading2("12.1 Document Retrieval"));
  children.push(body("All documents are fetched from /api/career-documents, which returns a unified list of the user's resumes, cover letters, and interview sessions, each with metadata including title, job title, company, industry, creation date, and document type. The vault supports full-text search across title, job title, company, and industry fields, with real-time filtering as the user types."));
  children.push(heading2("12.2 Filter and Grouping"));
  children.push(body("Four filter tabs allow quick access: All Documents, Resumes Only, Cover Letters Only, and Interviews Only. Within each tab, documents are grouped by time period: Today, Yesterday, This Week, This Month, and Older. This temporal grouping helps users quickly locate recent work while maintaining access to historical documents."));
  children.push(heading2("12.3 Detail Views and Re-use"));
  children.push(body("Each document type provides a specialised detail view: Resume detail shows the analysis results, ATS score, and individual sections; Cover Letter detail displays the full content, selected tone, and associated job details; Interview detail presents the complete Q&A transcript, per-question feedback, and scoring breakdown. A 'Load into Builder/Editor' action restores the full careerContext state from any document, enabling users to pick up where they left off or iterate on previously created content."));

  // ── 13. Data Flow & State Management ──
  children.push(heading1("13. Data Flow & State Management"));
  children.push(body("The careerContext object is the key data bridge that enables the seamless workflow between features. It is a structured subset of the Zustand store that carries essential career information from one feature to the next, eliminating redundant data entry and ensuring consistency across the user's documents."));
  children.push(heading2("13.1 CareerContext Structure"));
  children.push(makeTable(
    ["Field", "Source", "Used By"],
    [
      ["resumeJobTitle", "Resume Builder step 1", "Cover Letter auto-fill, Interview questions"],
      ["resumeCompany", "Resume Builder step 1", "Cover Letter auto-fill"],
      ["resumeSummary", "AI Generate / manual input", "Cover Letter context, Interview evaluation"],
      ["resumeSkills", "AI Suggest / manual selection", "Cover Letter tailoring, Interview question selection"],
      ["resumeExperience", "Manual input + AI Improve", "Cover Letter examples, Interview follow-up questions"],
      ["resumeEducation", "Manual input", "Cover Letter context, Interview background"],
      ["resumeCompleted", "Set on resume save", "Progress Tracker, Career Guide"],
      ["coverLetterJobTitle", "Auto-filled from resume", "Interview context"],
      ["coverLetterCompany", "Auto-filled from resume", "Interview context"],
      ["coverLetterTone", "User selection", "Document Vault metadata"],
      ["coverLetterCompleted", "Set on cover letter save", "Progress Tracker, Career Guide"],
      ["lastInterviewScore", "Interview session result", "Progress Tracker"],
      ["interviewCompleted", "Set on interview finish", "Progress Tracker, Career Guide"],
      ["pendingCoverLetterGenerate", "Set on resume save", "Auto-triggers Cover Letter generation"],
    ],
    [25, 35, 40]
  ));
  children.push(spacer(100));
  children.push(heading2("13.2 Seamless Data Flow"));
  children.push(body("The data flow follows a deliberate cascade: When the user saves a resume, careerContext is populated with all resume fields, the pendingCoverLetterGenerate flag is set to true, and navigation moves to the Cover Letter Generator. On mount, the Cover Letter Generator detects the pending flag, pre-fills the job title and company from careerContext, and automatically triggers generation. When the cover letter is saved, the cover letter fields are added to careerContext, and the 'Practise Interview' CTA navigates to the Interview Coach, which uses careerContext to generate industry-relevant interview questions tailored to the user's background."));
  children.push(body("This chained flow ensures that users never need to re-enter information that was provided in a previous step. The pendingCoverLetterGenerate flag is the critical mechanism that makes the resume-to-cover-letter transition feel automatic and instantaneous."));

  // ── 14. API Reference ──
  children.push(heading1("14. API Reference"));
  children.push(body("NexTech Career exposes 16 API endpoints that handle authentication, data persistence, AI interactions, and document extraction. All endpoints follow REST conventions with JSON request and response bodies."));
  children.push(heading2("14.1 Authentication Endpoints"));
  children.push(makeTable(
    ["Endpoint", "Method", "Request Body", "Response"],
    [
      ["/api/auth", "POST", "{ action: 'login'|'register', email, password }", "{ userId, email }"],
      ["/api/user", "GET", "Query: userId", "{ id, email, name, careerInterest, ... }"],
      ["/api/user", "PUT", "{ userId, name, careerInterest, ... }", "{ success, user }"],
    ],
    [18, 10, 40, 32]
  ));
  children.push(spacer(100));
  children.push(heading2("14.2 Resume Endpoints"));
  children.push(makeTable(
    ["Endpoint", "Method", "Request Body", "Response"],
    [
      ["/api/resumes", "GET", "Query: userId", "[{ id, title, ... }]"],
      ["/api/resumes", "POST", "{ userId, resumeData }", "{ id, createdAt }"],
      ["/api/resumes", "PUT", "{ id, resumeData }", "{ success }"],
    ],
    [18, 10, 40, 32]
  ));
  children.push(spacer(100));
  children.push(heading2("14.3 Cover Letter Endpoints"));
  children.push(makeTable(
    ["Endpoint", "Method", "Request Body", "Response"],
    [
      ["/api/cover-letters", "GET", "Query: userId", "[{ id, title, ... }]"],
      ["/api/cover-letters", "POST", "{ userId, coverLetterData }", "{ id, createdAt }"],
    ],
    [18, 10, 40, 32]
  ));
  children.push(spacer(100));
  children.push(heading2("14.4 Interview Endpoints"));
  children.push(makeTable(
    ["Endpoint", "Method", "Request Body", "Response"],
    [
      ["/api/interviews", "GET", "Query: userId", "[{ id, date, scores, ... }]"],
      ["/api/interviews", "POST", "{ userId, interviewData }", "{ id, createdAt }"],
    ],
    [18, 10, 40, 32]
  ));
  children.push(spacer(100));
  children.push(heading2("14.5 AI Endpoints"));
  children.push(makeTable(
    ["Endpoint", "Method", "Request Body", "Response"],
    [
      ["/api/ai/chat", "POST", "{ type, message, context }", "{ reply }"],
      ["/api/ai/resume", "POST", "{ profile, jobTitle }", "{ resume, atsScore }"],
      ["/api/ai/resume-analyze", "POST", "{ resumeText }", "{ overallScore, atsCompatibility, ... }"],
      ["/api/ai/cover-letter", "POST", "{ jobTitle, company, description, tone }", "{ letter }"],
      ["/api/ai/interview-question", "POST", "{ industry, previousQs }", "{ question, category }"],
      ["/api/ai/interview-evaluate", "POST", "{ question, answer }", "{ scores, feedback }"],
      ["/api/ai/tts", "POST", "{ text, voice, speed }", "{ audio (base64) }"],
      ["/api/ai/asr", "POST", "{ audio (base64), format }", "{ transcription }"],
    ],
    [22, 10, 38, 30]
  ));
  children.push(spacer(100));
  children.push(heading2("14.6 Document Vault Endpoint"));
  children.push(makeTable(
    ["Endpoint", "Method", "Request Body", "Response"],
    [
      ["/api/career-documents", "GET", "Query: userId", "{ resumes: [...], coverLetters: [...], interviews: [...] }"],
    ],
    [22, 10, 38, 30]
  ));

  // ── 15. Database Schema ──
  children.push(heading1("15. Database Schema"));
  children.push(body("The database schema is defined using Prisma's declarative schema language and consists of five models with well-defined relationships. The schema is stored in prisma/schema.prisma and Prisma generates TypeScript types and migration files automatically."));
  children.push(heading2("15.1 User Model"));
  children.push(codeBlock("model User {"));
  children.push(codeBlock("  id              String    @id @default(cuid())"));
  children.push(codeBlock("  email           String    @unique"));
  children.push(codeBlock("  password        String?"));
  children.push(codeBlock("  name            String?"));
  children.push(codeBlock("  careerInterest  String?"));
  children.push(codeBlock("  experience      String?"));
  children.push(codeBlock("  education       String?"));
  children.push(codeBlock("  skills          String?   // JSON array serialised as string"));
  children.push(codeBlock("  location        String?"));
  children.push(codeBlock("  careerGoal      String?"));
  children.push(codeBlock("  createdAt       DateTime  @default(now())"));
  children.push(codeBlock("  updatedAt       DateTime  @updatedAt"));
  children.push(codeBlock("  resumes         Resume[]"));
  children.push(codeBlock("  coverLetters    CoverLetter[]"));
  children.push(codeBlock("  interviews      Interview[]"));
  children.push(codeBlock("  progress        Progress[]"));
  children.push(codeBlock("}"));
  children.push(heading2("15.2 Resume Model"));
  children.push(codeBlock("model Resume {"));
  children.push(codeBlock("  id          String   @id @default(cuid())"));
  children.push(codeBlock("  userId      String"));
  children.push(codeBlock("  title       String"));
  children.push(codeBlock("  data        String   // Full resume JSON serialised"));
  children.push(codeBlock("  atsScore    Float?"));
  children.push(codeBlock("  industry    String?"));
  children.push(codeBlock("  createdAt   DateTime @default(now())"));
  children.push(codeBlock("  updatedAt   DateTime @updatedAt"));
  children.push(codeBlock("  user        User     @relation(fields: [userId], references: [id])"));
  children.push(codeBlock("}"));
  children.push(heading2("15.3 CoverLetter Model"));
  children.push(codeBlock("model CoverLetter {"));
  children.push(codeBlock("  id          String   @id @default(cuid())"));
  children.push(codeBlock("  userId      String"));
  children.push(codeBlock("  title       String"));
  children.push(codeBlock("  content     String   // Letter text"));
  children.push(codeBlock("  jobTitle    String?"));
  children.push(codeBlock("  company     String?"));
  children.push(codeBlock("  tone        String?"));
  children.push(codeBlock("  createdAt   DateTime @default(now())"));
  children.push(codeBlock("  user        User     @relation(fields: [userId], references: [id])"));
  children.push(codeBlock("}"));
  children.push(heading2("15.4 Interview Model"));
  children.push(codeBlock("model Interview {"));
  children.push(codeBlock("  id            String   @id @default(cuid())"));
  children.push(codeBlock("  userId        String"));
  children.push(codeBlock("  personality   String?  // Interviewer name"));
  children.push(codeBlock("  industry      String?"));
  children.push(codeBlock("  questions     String   // JSON array of Q&A pairs"));
  children.push(codeBlock("  avgScore      Float?"));
  children.push(codeBlock("  relevance     Float?"));
  children.push(codeBlock("  clarity       Float?"));
  children.push(codeBlock("  confidence    Float?"));
  children.push(codeBlock("  createdAt     DateTime @default(now())"));
  children.push(codeBlock("  user          User     @relation(fields: [userId], references: [id])"));
  children.push(codeBlock("}"));
  children.push(heading2("15.5 Progress Model"));
  children.push(codeBlock("model Progress {"));
  children.push(codeBlock("  id                String   @id @default(cuid())"));
  children.push(codeBlock("  userId            String"));
  children.push(codeBlock("  readinessScore    Float    @default(0)"));
  children.push(codeBlock("  resumesCreated    Int      @default(0)"));
  children.push(codeBlock("  lettersCreated    Int      @default(0)"));
  children.push(codeBlock("  interviewsDone    Int      @default(0)"));
  children.push(codeBlock("  avgInterviewScore Float?"));
  children.push(codeBlock("  achievements      String?  // JSON array of unlocked badges"));
  children.push(codeBlock("  updatedAt         DateTime @updatedAt"));
  children.push(codeBlock("  user              User     @relation(fields: [userId], references: [id])"));
  children.push(codeBlock("}"));

  // ── 16. Mini-Services Architecture ──
  children.push(heading1("16. Mini-Services Architecture"));
  children.push(body("NexTech Career uses a lightweight mini-service architecture for document text extraction, separating this CPU-intensive task from the main Next.js application to prevent blocking the event loop during large file processing."));
  children.push(heading2("16.1 Document Extraction Service"));
  children.push(body("The Document Extraction Service runs as a standalone Express.js server on port 3031. It provides a single POST /extract endpoint that accepts multipart file uploads and returns the extracted text content. The service is designed with simplicity and reliability as primary concerns."));
  children.push(makeTable(
    ["Property", "Value", "Notes"],
    [
      ["Port", "3031", "Fixed port, configured in main app"],
      ["Framework", "Express.js with multer", "Multipart file upload handling"],
      ["Max File Size", "10MB", "Enforced at both service and client level"],
      ["CORS", "Open (Access-Control-Allow-Origin: *)", "Development-friendly, restrict in production"],
      ["Supported Formats", "PDF, DOCX, TXT", "Auto-detected from file extension"],
    ],
    [20, 35, 45]
  ));
  children.push(spacer(100));
  children.push(heading2("16.2 Extraction Libraries"));
  children.push(body("PDF extraction uses pdf-parse with pdfjs-dist as the underlying engine, providing reliable text extraction from both text-based and scanned PDFs (though OCR is not supported). DOCX extraction uses mammoth, which converts the Office Open XML format to plain text while preserving paragraph structure. Plain text files are read directly with UTF-8 encoding and automatic BOM detection. All extraction results are returned as a JSON object with fields for text (the extracted content), pageCount (for PDFs), and metadata (file name, size, format)."));

  // ── 17. UI/UX Design System ──
  children.push(heading1("17. UI/UX Design System"));
  children.push(body("The NexTech Career design system is a cohesive visual language built around dark themes, glassmorphism effects, and purposeful animations. Every visual element serves the dual purpose of aesthetic appeal and functional clarity, with particular attention to the mobile-first context of the target audience."));
  children.push(heading2("17.1 Dark Theme"));
  children.push(body("The application enforces a dark theme across all views. The primary background uses deep navy and slate tones (#0B1120, #0F172A), with content panels rendered in slightly lighter shades (#1E293B, #1A2332). Text follows a high-contrast hierarchy: white (#FFFFFF) for primary content, light grey (#94A3B8) for secondary text, and muted teal (#5EEAD4) for accents and interactive elements. This palette was chosen for its reduced eye strain on mobile devices and its modern, professional aesthetic."));
  children.push(heading2("17.2 Glassmorphism"));
  children.push(body("Two CSS classes define the glassmorphism effect: 'glass' provides a standard translucent panel with backdrop-blur and a subtle border, while 'glass-strong' offers higher opacity for content-dense areas. Both classes use semi-transparent backgrounds (rgba with 0.1-0.3 alpha), backdrop-filter: blur(12-16px), and thin border (1px solid rgba with low alpha). This creates the signature frosted-glass look that gives depth to the dark interface."));
  children.push(heading2("17.3 Custom CSS Animations"));
  children.push(makeTable(
    ["Animation", "Purpose", "Key Properties"],
    [
      ["hero-orbs", "Landing page background atmosphere", "Floating gradient blobs, infinite loop, 20-30s duration"],
      ["shimmer", "Loading states and content placeholders", "Sweeping highlight, 2s infinite, linear gradient"],
      ["gradient-shift", "Accent element colour transitions", "Background position animation, 6s cycle"],
      ["typing-dot", "AI response typing indicator", "Opacity pulse, staggered delays, 1.4s cycle"],
      ["pulse-teal", "Career Guide notification pulse", "Box-shadow scale, 2s infinite, teal glow"],
    ],
    [18, 35, 47]
  ));
  children.push(spacer(100));
  children.push(heading2("17.4 Component Library"));
  children.push(body("The application uses shadcn/ui in the New York style variant, which provides accessible, composable component primitives. Key components include Button (with multiple variants: default, outline, ghost), Input (with glass background), Card (glass panels), Dialog (modal overlays), Select (dropdowns), Badge (for skill chips and achievements), and Progress (for completion bars). All components are styled with Tailwind CSS utility classes, with glassmorphism effects applied through custom CSS classes that extend the base shadcn/ui styles."));
  children.push(heading2("17.5 Mobile-First Responsive Design"));
  children.push(body("The layout system uses a mobile-first approach with breakpoints at 640px (sm), 768px (md), and 1024px (lg). On mobile, the application uses a single-column layout with a bottom navigation bar. On tablet and desktop, the layout expands to use side-by-side panels where appropriate. The bottom navbar includes safe-area-inset padding to accommodate devices with gesture navigation bars, ensuring that navigation elements remain accessible on all devices."));
  children.push(heading2("17.6 Framer Motion Page Transitions"));
  children.push(body("Transitions between views use Framer Motion's AnimatePresence component with custom variants. Enter animations slide in from the right with a slight fade, exit animations slide out to the left with a fade, and the transition duration is 300ms with an ease-out curve. This creates a natural, directional flow that matches the user's forward progression through the application workflow."));

  // ── 18. Deployment & Infrastructure ──
  children.push(heading1("18. Deployment & Infrastructure"));
  children.push(body("The NexTech Career deployment architecture prioritises simplicity and reliability, using a minimal set of services that can be deployed on a single server or container with straightforward configuration."));
  children.push(heading2("18.1 Service Topology"));
  children.push(makeTable(
    ["Service", "Port", "Technology", "Role"],
    [
      ["Caddy Reverse Proxy", "81", "Caddy v2", "HTTPS termination, reverse proxy to Next.js"],
      ["Next.js Application", "3000", "Next.js 16 with Turbopack", "Main application server (SSR + API)"],
      ["Document Extraction", "3031", "Express.js", "PDF/DOCX/TXT text extraction"],
      ["SQLite Database", "File", "Prisma ORM", "Persistent data storage at db/custom.db"],
    ],
    [22, 10, 30, 38]
  ));
  children.push(spacer(100));
  children.push(heading2("18.2 Caddy Configuration"));
  children.push(body("Caddy serves as the reverse proxy, listening on port 81 and forwarding all requests to the Next.js application on port 3000. Caddy provides automatic HTTPS certificate management, HTTP/2 support, and gzip compression. The XTransformPort query parameter is used for gateway routing, allowing the infrastructure to support multiple applications behind a single external-facing proxy."));
  children.push(heading2("18.3 Database Configuration"));
  children.push(body("The SQLite database is stored at db/custom.db relative to the application root. Prisma's migration system manages schema changes, with migration files generated by 'npx prisma migrate dev' and applied in production by 'npx prisma migrate deploy'. The database file is included in backup strategies and can be easily copied for development environment replication. Prisma Studio (launched via 'npx prisma studio') provides a visual database browser for debugging and data inspection."));
  children.push(heading2("18.4 Development Workflow"));
  children.push(body("The development workflow uses Bun as the package manager and script runner. The 'bun dev' command starts the Next.js development server with Turbopack for fast refresh. The document extraction service is started separately with 'bun run services/extract.js'. Environment variables are managed through a .env file that configures the database URL, AI API keys, and service ports. The 'bun build' command produces an optimised production build, which is served by 'bun start'."));
  children.push(heading2("18.5 Production Considerations"));
  children.push(body("For production deployment, several enhancements should be considered: (1) Restrict CORS on the document extraction service to only accept requests from the application domain; (2) Implement rate limiting on AI API endpoints to prevent abuse and manage costs; (3) Add monitoring and alerting for the document extraction service, which is the most likely point of failure due to file processing variability; (4) Consider migrating from SQLite to PostgreSQL if concurrent user load exceeds SQLite's write concurrency limits; (5) Implement a CDN for static assets to reduce latency for the mobile-first audience; and (6) Add structured logging with a centralised log aggregation service for debugging production issues."));

  return children;
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT ASSEMBLY
// ═══════════════════════════════════════════════════════════════
async function main() {
  const pgSize = { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT };
  const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
            size: 24,
            color: "000000",
          },
          paragraph: {
            spacing: { line: 312 },
          },
        },
        heading1: {
          run: {
            font: { ascii: "Times New Roman", eastAsia: "SimHei" },
            size: 32,
            bold: true,
            color: "0B1220",
          },
          paragraph: {
            spacing: { before: 400, after: 200, line: 312 },
          },
        },
        heading2: {
          run: {
            font: { ascii: "Times New Roman", eastAsia: "SimHei" },
            size: 28,
            bold: true,
            color: "0B1220",
          },
          paragraph: {
            spacing: { before: 300, after: 150, line: 312 },
          },
        },
        heading3: {
          run: {
            font: { ascii: "Times New Roman", eastAsia: "SimHei" },
            size: 26,
            bold: true,
            color: "0B1220",
          },
          paragraph: {
            spacing: { before: 240, after: 120, line: 312 },
          },
        },
      },
    },
    sections: [
      // Section 1: Cover (no page numbers, no footer)
      {
        properties: {
          page: { size: pgSize, margin: { top: 0, bottom: 0, left: 0, right: 0 } },
        },
        children: buildCover(),
      },
      // Section 2: Front matter (TOC) — Roman numerals
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: pgSize,
            margin: pgMargin,
            pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "NexTech Career Technical Guide", size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
            })],
          }),
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 360 },
            children: [new TextRun({
              text: "Table of Contents",
              bold: true, size: 32,
              font: { ascii: "Times New Roman", eastAsia: "SimHei" },
            })],
          }),
          new TableOfContents("Table of Contents", {
            hyperlink: true,
            headingStyleRange: "1-3",
          }),
          new Paragraph({
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: "Note: This Table of Contents is generated via field codes. To ensure page number accuracy after editing, please right-click the TOC and select \"Update Field.\"",
                italics: true, size: 18, color: "888888",
                font: { ascii: "Times New Roman" },
              }),
              new PageBreak(),
            ],
          }),
        ],
      },
      // Section 3: Body — Arabic numerals starting from 1
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: pgSize,
            margin: pgMargin,
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "NexTech Career Technical Guide", size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
            })],
          }),
        },
        footers: {
          default: pageNumFooter(),
        },
        children: buildBodyContent(),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/home/z/my-project/output/NexTech_Career_Technical_Guide.docx", buffer);
  console.log("Document generated successfully!");
}

main().catch(err => {
  console.error("Error generating document:", err);
  process.exit(1);
});
