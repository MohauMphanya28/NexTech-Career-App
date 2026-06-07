const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PageBreak, Tab, TabStopType, TabStopPosition, convertInchesToTwip,
  Header, Footer, PageNumber, NumberFormat, LevelFormat,
  TableOfContents, StyleLevel, UnderlineType
} = require("docx");
const fs = require("fs");

// ── Color Palette ──────────────────────────────────────────────
const COLORS = {
  primary: "0D7377",      // Deep teal
  primaryDark: "095456",  // Darker teal
  accent: "14A085",       // Emerald green
  dark: "1A1A2E",         // Near black
  medium: "4A4A68",       // Medium gray-purple
  light: "6B7280",        // Gray
  lighter: "9CA3AF",      // Lighter gray
  white: "FFFFFF",
  offWhite: "F8FAFB",
  lightBg: "ECFDF5",      // Light green bg
  tableBorder: "D1D5DB",  // Table border
  tableHeader: "0D7377",  // Table header bg
  tableAlt: "F0FDFA",     // Table alternate row
  checkGreen: "059669",   // Green for checkmarks
  red: "DC2626",
  orange: "EA580C",
  blue: "2563EB",
};

// ── Helper Functions ───────────────────────────────────────────

function createSpacer(size = 200) {
  return new Paragraph({ spacing: { after: size } });
}

function createHeading(text, level = HeadingLevel.HEADING_1, options = {}) {
  const colorMap = {
    [HeadingLevel.HEADING_1]: COLORS.primary,
    [HeadingLevel.HEADING_2]: COLORS.primaryDark,
    [HeadingLevel.HEADING_3]: COLORS.accent,
    [HeadingLevel.HEADING_4]: COLORS.medium,
  };
  const sizeMap = {
    [HeadingLevel.HEADING_1]: 40,
    [HeadingLevel.HEADING_2]: 32,
    [HeadingLevel.HEADING_3]: 26,
    [HeadingLevel.HEADING_4]: 22,
  };
  return new Paragraph({
    heading: level,
    spacing: { before: 360, after: 200 },
    ...options,
    children: [
      new TextRun({
        text,
        bold: true,
        size: sizeMap[level] || 28,
        color: colorMap[level] || COLORS.primary,
        font: "Calibri",
      }),
    ],
  });
}

function createParagraph(text, options = {}) {
  const { bold, italic, color, size, alignment, spacing, font } = options;
  return new Paragraph({
    alignment: alignment || AlignmentType.LEFT,
    spacing: spacing || { after: 120, line: 276 },
    children: [
      new TextRun({
        text,
        bold: bold || false,
        italics: italic || false,
        size: size || 22,
        color: color || COLORS.dark,
        font: font || "Calibri",
      }),
    ],
  });
}

function createBulletPoint(text, level = 0, options = {}) {
  const { bold, color, size } = options;
  return new Paragraph({
    bullet: { level },
    spacing: { after: 60, line: 276 },
    children: [
      new TextRun({
        text,
        bold: bold || false,
        size: size || 21,
        color: color || COLORS.dark,
        font: "Calibri",
      }),
    ],
  });
}

function createFeatureBullet(text, isImplemented = true) {
  const prefix = isImplemented ? "✓  " : "○  ";
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 50, line: 260 },
    children: [
      new TextRun({
        text: prefix,
        bold: true,
        size: 21,
        color: isImplemented ? COLORS.checkGreen : COLORS.lighter,
        font: "Calibri",
      }),
      new TextRun({
        text: text,
        size: 21,
        color: isImplemented ? COLORS.dark : COLORS.light,
        font: "Calibri",
      }),
    ],
  });
}

function createSubBullet(text) {
  return new Paragraph({
    bullet: { level: 1 },
    spacing: { after: 40, line: 260 },
    children: [
      new TextRun({
        text,
        size: 20,
        color: COLORS.medium,
        font: "Calibri",
      }),
    ],
  });
}

function createRichParagraph(runs, options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: options.spacing || { after: 120, line: 276 },
    children: runs,
  });
}

// ── Table Helpers ──────────────────────────────────────────────

function createTableHeaderCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: COLORS.tableHeader },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            bold: true,
            size: 20,
            color: COLORS.white,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

function createTableCell(text, width, options = {}) {
  const { bold, color, alignment, shading } = options;
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: shading ? { type: ShadingType.CLEAR, fill: shading } : undefined,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: alignment || AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            bold: bold || false,
            size: 19,
            color: color || COLORS.dark,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

function createStatusCell(status, width, shading) {
  const colorMap = {
    "Complete": COLORS.checkGreen,
    "Phase 1": COLORS.checkGreen,
    "Phase 2": COLORS.accent,
    "Planned": COLORS.orange,
    "Future": COLORS.lighter,
  };
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: shading ? { type: ShadingType.CLEAR, fill: shading } : undefined,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: status,
            bold: true,
            size: 19,
            color: colorMap[status] || COLORS.dark,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

// ── Section: Title Page ────────────────────────────────────────

function createTitlePage() {
  return [
    createSpacer(2400),
    createSpacer(2400),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "NexTech Career App",
          bold: true,
          size: 56,
          color: COLORS.primary,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Business Plan",
          bold: true,
          size: 44,
          color: COLORS.primaryDark,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          size: 24,
          color: COLORS.accent,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "Updated March 2026",
          bold: true,
          size: 28,
          color: COLORS.medium,
          font: "Calibri",
        }),
      ],
    }),
    createSpacer(600),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "Phase 1 + Phase 2 Complete",
          bold: true,
          size: 24,
          color: COLORS.checkGreen,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "AI-Powered Career Development Platform for South Africa",
          size: 22,
          color: COLORS.light,
          font: "Calibri",
          italics: true,
        }),
      ],
    }),
    createSpacer(1600),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: "CONFIDENTIAL",
          bold: true,
          size: 18,
          color: COLORS.lighter,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "This document contains proprietary information. Distribution is restricted.",
          size: 16,
          color: COLORS.lighter,
          font: "Calibri",
          italics: true,
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

// ── Section: Table of Contents ─────────────────────────────────

function createTableOfContents() {
  const sections = [
    { num: "1", title: "Executive Summary", page: "3" },
    { num: "2", title: "Current Feature Status", page: "4" },
    { num: "2.1", title: "AI-Powered Resume Builder", page: "4" },
    { num: "2.2", title: "AI Resume Analyzer", page: "5" },
    { num: "2.3", title: "AI Cover Letter Generator", page: "6" },
    { num: "2.4", title: "AI Interview Coach", page: "7" },
    { num: "2.5", title: "User Authentication & Onboarding", page: "8" },
    { num: "2.6", title: "Progress & Motivation Tracker", page: "9" },
    { num: "2.7", title: "Document History (My Docs)", page: "10" },
    { num: "2.8", title: "Career Guide Widget", page: "10" },
    { num: "2.9", title: "Data Persistence", page: "11" },
    { num: "2.10", title: "Dashboard", page: "11" },
    { num: "3", title: "Technical Architecture", page: "12" },
    { num: "4", title: "Development Roadmap", page: "14" },
    { num: "5", title: "Revenue Model", page: "16" },
  ];

  const children = [
    createHeading("Table of Contents", HeadingLevel.HEADING_1),
    createSpacer(200),
  ];

  sections.forEach((s) => {
    const isMain = !s.num.includes(".");
    const indent = isMain ? 0 : 1;
    children.push(
      new Paragraph({
        spacing: { after: isMain ? 80 : 50 },
        indent: { left: indent * 360 },
        children: [
          new TextRun({
            text: `${s.num}    ${s.title}`,
            bold: isMain,
            size: isMain ? 22 : 20,
            color: isMain ? COLORS.dark : COLORS.medium,
            font: "Calibri",
          }),
        ],
      })
    );
  });

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  return children;
}

// ── Section: Executive Summary ─────────────────────────────────

function createExecutiveSummary() {
  return [
    createHeading("1. Executive Summary", HeadingLevel.HEADING_1),
    
    createParagraph(
      "NexTech Career App is an AI-powered career development platform designed to address South Africa's youth unemployment crisis. As of March 2026, the platform has completed Phase 1 and Phase 2 of development, delivering a comprehensive suite of tools that guide young South Africans from resume creation through interview preparation — all powered by cutting-edge artificial intelligence.",
      { spacing: { after: 200, line: 276 } }
    ),

    createParagraph(
      "The platform stands apart from generic career tools through its deep contextualization for the South African market: interviewer personas rooted in local culture, onboarding flows that understand SA career landscapes, and AI models trained to appreciate the nuances of the local job market.",
      { spacing: { after: 200, line: 276 } }
    ),

    createHeading("Key Achievements (March 2026)", HeadingLevel.HEADING_3),

    createBulletPoint("10 fully implemented feature modules delivering end-to-end career preparation"),
    createBulletPoint("AI-powered resume building, analysis, and cover letter generation with GPT-4 class LLM"),
    createBulletPoint("Interactive AI Interview Coach with voice input (Whisper ASR), text-to-speech, and lip-synced avatar animation"),
    createBulletPoint("Comprehensive progress tracking with gamification (5 achievement badges, career readiness scoring)"),
    createBulletPoint("Full data persistence via SQLite/Prisma ORM — zero data loss on refresh"),
    createBulletPoint("Modern tech stack: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4"),

    createSpacer(200),

    createHeading("Market Opportunity", HeadingLevel.HEADING_3),

    createParagraph(
      "South Africa faces one of the highest youth unemployment rates globally, with approximately 4.7 million young people aged 15–34 not in employment, education, or training (NEET). The gap is not merely structural — many young South Africans lack access to basic career preparation tools: professional resume writing, cover letter templates, and interview practice. NexTech bridges this gap with free, AI-powered tools that are accessible from any web browser.",
      { spacing: { after: 200, line: 276 } }
    ),

    createHeading("Revenue Strategy", HeadingLevel.HEADING_3),

    createParagraph(
      "NexTech follows a social-impact revenue model: the platform is free for individual job seekers, with revenue generated through B2B institutional licensing. Universities, TVET colleges, SETAs, and government employment programs pay for bulk access, customized dashboards, and analytics — while every student gets the tools for free.",
      { spacing: { after: 200, line: 276 } }
    ),

    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

// ── Section: Current Feature Status ────────────────────────────

function createFeatureStatus() {
  const children = [
    createHeading("2. Current Feature Status", HeadingLevel.HEADING_1),

    createParagraph(
      "The following sections detail every feature currently implemented in the NexTech Career App as of March 2026. All features listed below are fully functional and tested.",
      { spacing: { after: 200, line: 276 } }
    ),

    // ── Feature Summary Table ──
    createHeading("Feature Overview", HeadingLevel.HEADING_3),
    createSpacer(100),
  ];

  // Summary table
  const summaryRows = [
    ["AI-Powered Resume Builder", "Phase 1", "Complete"],
    ["AI Resume Analyzer", "Phase 1", "Complete"],
    ["AI Cover Letter Generator", "Phase 1", "Complete"],
    ["AI Interview Coach", "Phase 2", "Complete"],
    ["User Authentication & Onboarding", "Phase 1", "Complete"],
    ["Progress & Motivation Tracker", "Phase 2", "Complete"],
    ["Document History (My Docs)", "Phase 2", "Complete"],
    ["Career Guide Widget", "Phase 1", "Complete"],
    ["Data Persistence", "Phase 1", "Complete"],
    ["Dashboard", "Phase 1", "Complete"],
  ];

  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        createTableHeaderCell("Feature", 55),
        createTableHeaderCell("Phase", 20),
        createTableHeaderCell("Status", 25),
      ],
    }),
  ];

  summaryRows.forEach((row, idx) => {
    const shading = idx % 2 === 1 ? COLORS.tableAlt : undefined;
    tableRows.push(
      new TableRow({
        children: [
          createTableCell(row[0], 55, { bold: true, shading }),
          createTableCell(row[1], 20, { alignment: AlignmentType.CENTER, shading }),
          createStatusCell(row[2], 25, shading),
        ],
      })
    );
  });

  children.push(
    new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );

  children.push(createSpacer(200));

  // ── 2.1 AI-Powered Resume Builder ──
  children.push(
    createHeading("2.1 AI-Powered Resume Builder", HeadingLevel.HEADING_2),
    createParagraph(
      "The Resume Builder is a structured, AI-enhanced wizard that guides users through creating a professional resume step by step. It integrates real-time AI assistance at every stage, ensuring the final output is polished, ATS-optimized, and tailored to the user's target role.",
      { spacing: { after: 160, line: 276 } }
    ),
    createHeading("Core Capabilities", HeadingLevel.HEADING_4),
  );

  const resumeBuilderFeatures = [
    "Structured 6-step wizard: Personal Info → Summary → Experience → Education → Skills → Preview",
    "AI Suggest Summary — real-time GPT integration generates a professional summary from profile data",
    "AI Improve Experience Descriptions — transforms basic job descriptions into impactful, quantified statements",
    "AI Suggest Skills — recommends relevant skills based on the user's industry and experience",
    "AI Generate Full Resume — produces a polished, ATS-optimized version of the complete resume",
    "Real-time ATS Score with visual indicator — instant feedback on resume compatibility",
    "Multi-version CV management — save multiple resumes to the database for different roles",
    "One-tap PDF export — html2pdf.js integration for immediate download",
    "Pre-filled from user profile — onboarding data carries over seamlessly",
    "Seamless progression to Cover Letter after saving — workflow continuity",
  ];
  resumeBuilderFeatures.forEach(f => children.push(createFeatureBullet(f, true)));

  children.push(createSpacer(100));

  // ── 2.2 AI Resume Analyzer ──
  children.push(
    createHeading("2.2 AI Resume Analyzer", HeadingLevel.HEADING_2),
    createParagraph(
      "The Resume Analyzer allows users to upload existing resumes for comprehensive AI-powered evaluation. It provides detailed scoring, section-by-section analysis, and actionable improvement suggestions — then offers to generate an improved version that flows directly into the Resume Builder.",
      { spacing: { after: 160, line: 276 } }
    ),
    createHeading("Core Capabilities", HeadingLevel.HEADING_4),
  );

  const analyzerFeatures = [
    "Upload support: PDF (unpdf), DOCX (mammoth), TXT formats",
    "Drag-and-drop file upload with 10MB file size limit",
    "AI-powered comprehensive analysis with retry logic for resilience",
    "Overall score + ATS compatibility score — dual-metric evaluation",
    "Section breakdown analysis: Summary, Experience, Education, Skills",
    "Strengths & Weaknesses identification with specific examples",
    "Priority-based improvement plan with before/after examples",
    "AI-Improved Resume generation — one-click enhanced version",
    "\"Use Improved Resume\" flow into Builder — seamless transition from analysis to editing",
    "Save analysis to database for future reference",
    "Job Target field for tailored, role-specific analysis",
  ];
  analyzerFeatures.forEach(f => children.push(createFeatureBullet(f, true)));

  children.push(createSpacer(100));

  // ── 2.3 AI Cover Letter Generator ──
  children.push(
    createHeading("2.3 AI Cover Letter Generator", HeadingLevel.HEADING_2),
    createParagraph(
      "The Cover Letter Generator creates tailored, professional cover letters using AI. Users provide job details, select a tone, and receive a polished letter that can be edited, saved, and exported — with seamless flow from the resume workflow.",
      { spacing: { after: 160, line: 276 } }
    ),
    createHeading("Core Capabilities", HeadingLevel.HEADING_4),
  );

  const coverLetterFeatures = [
    "Input form: Job Title, Company Name, Job Description",
    "5 tone options: Formal, Confident, Entry-level, Warm, Concise",
    "AI generation with animated progress indicator",
    "Editable preview with real-time word count",
    "Save, Copy, and Regenerate actions",
    "Download as PDF — one-click export",
    "Auto-generate from resume flow — seamless Resume → Cover Letter transition",
    "Career context propagation — job title and company from resume carry over",
    "Template saving — all letters saved to database for reuse and iteration",
  ];
  coverLetterFeatures.forEach(f => children.push(createFeatureBullet(f, true)));

  children.push(createSpacer(100));

  // ── 2.4 AI Interview Coach ──
  children.push(
    createHeading("2.4 AI Interview Coach", HeadingLevel.HEADING_2),
    createParagraph(
      "The Interview Coach is the most sophisticated module in NexTech, providing an immersive, AI-driven mock interview experience. It features voice input/output, animated avatar personas, and detailed performance analytics — creating a realistic practice environment that adapts to the South African job market context.",
      { spacing: { after: 160, line: 276 } }
    ),
    createHeading("Core Capabilities", HeadingLevel.HEADING_4),
  );

  const interviewFeatures = [
    "Setup screen: Industry selection (9 options), Question count (3/5/7/10), Interviewer persona selection",
    "5 South African-contextualized interviewer personas: Kazi (Cape Town Coach), Thabo (Jozi Corporate), Naledi (Durban Friendly), James (British Executive), Zanele (Soweto Motivator)",
    "Voice input via Whisper ASR (z-ai-web-dev-sdk) — speak your answers naturally",
    "Text input fallback — type answers when voice isn't available",
    "AI question generation with personality-aware prompts — each persona asks differently",
    "AI answer evaluation — scored on Relevance, Clarity, and Confidence",
    "Text-to-Speech (TTS) with caching and voice selection — interviewer speaks back",
    "Lip-sync avatar animation using Web Audio API amplitude analysis",
    "Optional camera support via getUserMedia — practice with eye contact",
    "Zoom-like UI: camera toggle, transcript toggle, timer, mute controls",
    "Recording timer with 25-second maximum per answer",
    "WAV encoding on client side for ASR processing",
    "Request queue for ASR to prevent API overload",
    "Retry logic with exponential backoff for 429/5xx errors",
    "Results screen with overall score + sub-scores (Relevance, Clarity, Confidence)",
    "Progress tracking across sessions — see improvement over time",
    "Save interview results to database",
  ];
  interviewFeatures.forEach(f => children.push(createFeatureBullet(f, true)));

  children.push(createSpacer(100));

  // ── 2.5 User Authentication & Onboarding ──
  children.push(
    createHeading("2.5 User Authentication & Onboarding", HeadingLevel.HEADING_2),
    createParagraph(
      "NexTech provides a complete authentication system with a conversational onboarding flow that builds user profiles progressively — gathering career context that powers AI personalization across the entire platform.",
      { spacing: { after: 160, line: 276 } }
    ),
    createHeading("Core Capabilities", HeadingLevel.HEADING_4),
  );

  const authFeatures = [
    "Email/password registration and login (bcryptjs encryption)",
    "7-step conversational onboarding flow: Name → Career Interest → Experience Level → Education → Skills → Location → Career Goal",
    "Chip/text/multi-select input modes — intuitive, mobile-friendly",
    "AI encouragement between steps — motivational, contextual messages",
    "Profile creation with database persistence",
    "Auto-login after onboarding completion",
    "Session persistence via localStorage — seamless return visits",
  ];
  authFeatures.forEach(f => children.push(createFeatureBullet(f, true)));

  children.push(createSpacer(100));

  // ── 2.6 Progress & Motivation Tracker ──
  children.push(
    createHeading("2.6 Progress & Motivation Tracker", HeadingLevel.HEADING_2),
    createParagraph(
      "The Progress Tracker provides a gamified dashboard that visualizes each user's career readiness journey. It combines quantitative scoring with achievement badges and contextual tips to maintain engagement and guide next steps.",
      { spacing: { after: 160, line: 276 } }
    ),
    createHeading("Core Capabilities", HeadingLevel.HEADING_4),
  );

  const progressFeatures = [
    "Career Readiness Score (0–100%) — composite metric of overall preparedness",
    "Score breakdown: Resume (40pts) + Cover Letter (20pts) + Interview (40pts)",
    "Stats grid: Resume count, Cover Letter count, Interview count, Average Score",
    "Interview performance breakdown — Confidence, Clarity, Relevance sub-scores",
    "Interview trend tracking — improving, declining, or steady indicators",
    "Achievement system with 5 badges: First Resume, Cover Letter Pro, Interview Ready, High Scorer, Career Ready",
    "Score history chart — visual progress over time",
    "Context-aware career tips — suggestions based on current progress state",
    "Next step CTA — always know what to do next",
    "Progress milestones saved to database — persist across browser refreshes",
  ];
  progressFeatures.forEach(f => children.push(createFeatureBullet(f, true)));

  children.push(createSpacer(100));

  // ── 2.7 Document History ──
  children.push(
    createHeading("2.7 Document History (My Docs)", HeadingLevel.HEADING_2),
    createParagraph(
      "My Docs provides a unified timeline of all saved career documents — resumes, cover letters, and interview sessions — with powerful filtering, search, and the ability to reload any document back into its editor.",
      { spacing: { after: 160, line: 276 } }
    ),
    createHeading("Core Capabilities", HeadingLevel.HEADING_4),
  );

  const docsFeatures = [
    "Unified timeline of all saved documents",
    "Grouped by date: Today, Yesterday, This Week, This Month, Older",
    "Filter by type: All / Resumes / Letters / Interviews",
    "Search by title, job title, company, or industry",
    "Full document detail view — resume analysis, cover letter content, interview Q&A",
    "Load documents back into editor for iteration",
    "Delete documents",
    "Stats row with counts per document type",
  ];
  docsFeatures.forEach(f => children.push(createFeatureBullet(f, true)));

  children.push(createSpacer(100));

  // ── 2.8 Career Guide Widget ──
  children.push(
    createHeading("2.8 Career Guide Widget", HeadingLevel.HEADING_2),
    createParagraph(
      "A contextual floating assistant that provides timely, relevant guidance based on the user's current progress and the page they're viewing. It acts as an always-available career advisor.",
      { spacing: { after: 160, line: 276 } }
    ),
    createHeading("Core Capabilities", HeadingLevel.HEADING_4),
  );

  const guideFeatures = [
    "Contextual floating button with notification pulse animation",
    "Context-aware messages based on current progress state",
    "Next-step suggestions: Resume → Letter → Interview progression",
    "View-specific tips tailored to the current page/feature",
    "Dismissible messages — non-intrusive UX",
  ];
  guideFeatures.forEach(f => children.push(createFeatureBullet(f, true)));

  children.push(createSpacer(100));

  // ── 2.9 Data Persistence ──
  children.push(
    createHeading("2.9 Data Persistence", HeadingLevel.HEADING_2),
    createParagraph(
      "All user data is persisted to a SQLite database via Prisma ORM, ensuring zero data loss on browser refresh or accidental close. This is a foundational capability that underpins every feature in the platform.",
      { spacing: { after: 160, line: 276 } }
    ),
    createHeading("Core Capabilities", HeadingLevel.HEADING_4),
  );

  const persistenceFeatures = [
    "All data saved to SQLite database via Prisma ORM",
    "Full session restoration on page refresh",
    "Persistent data includes: User profile, Resumes, Cover Letters, Interview History, Career Context, Saved Documents",
    "No data loss on browser refresh or accidental close",
  ];
  persistenceFeatures.forEach(f => children.push(createFeatureBullet(f, true)));

  children.push(createSpacer(100));

  // ── 2.10 Dashboard ──
  children.push(
    createHeading("2.10 Dashboard", HeadingLevel.HEADING_2),
    createParagraph(
      "The Dashboard serves as the user's home base, providing a personalized, data-driven overview of their career journey with quick access to all platform features.",
      { spacing: { after: 160, line: 276 } }
    ),
    createHeading("Core Capabilities", HeadingLevel.HEADING_4),
  );

  const dashboardFeatures = [
    "Personalized greeting based on time of day",
    "Career Journey progress indicator",
    "Real-time stats pulled from database",
    "Quick action grid with 6 primary actions",
    "Rotating tip of the day",
    "Getting Started CTA for new users",
  ];
  dashboardFeatures.forEach(f => children.push(createFeatureBullet(f, true)));

  children.push(
    createSpacer(200),
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  return children;
}

// ── Section: Technical Architecture ────────────────────────────

function createTechnicalArchitecture() {
  const children = [
    createHeading("3. Technical Architecture", HeadingLevel.HEADING_1),

    createParagraph(
      "NexTech Career App is built on a modern, performant technology stack optimized for rapid development, AI integration, and the specific constraints of the South African web environment (limited bandwidth, varied devices).",
      { spacing: { after: 200, line: 276 } }
    ),

    // Tech Stack Table
    createHeading("Technology Stack", HeadingLevel.HEADING_3),
    createSpacer(100),
  ];

  const techRows = [
    ["Frontend Framework", "Next.js 16 (App Router)", "React 19, TypeScript 5"],
    ["Styling", "Tailwind CSS 4", "shadcn/ui (New York style)"],
    ["UI Components", "shadcn/ui + Lucide icons", "40+ pre-built components"],
    ["AI Engine", "z-ai-web-dev-sdk", "GPT-4 class LLM, Whisper ASR, TTS"],
    ["Backend", "Next.js API Routes", "RESTful API architecture"],
    ["Database", "SQLite via Prisma ORM", "MVP-grade relational DB"],
    ["PDF Generation", "html2pdf.js", "Client-side PDF export"],
    ["PDF Text Extraction", "unpdf + mammoth", "PDF and DOCX parsing"],
    ["Animation", "Framer Motion", "Page transitions, micro-interactions"],
    ["State Management", "Zustand", "Client-side state management"],
    ["Authentication", "Custom (bcryptjs)", "Secure email/password auth"],
    ["Version Control", "Git / GitHub", "CI/CD pipeline"],
  ];

  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        createTableHeaderCell("Layer", 25),
        createTableHeaderCell("Technology", 35),
        createTableHeaderCell("Details", 40),
      ],
    }),
  ];

  techRows.forEach((row, idx) => {
    const shading = idx % 2 === 1 ? COLORS.tableAlt : undefined;
    tableRows.push(
      new TableRow({
        children: [
          createTableCell(row[0], 25, { bold: true, shading }),
          createTableCell(row[1], 35, { shading }),
          createTableCell(row[2], 40, { shading, color: COLORS.medium }),
        ],
      })
    );
  });

  children.push(
    new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );

  children.push(createSpacer(200));

  // Architecture Principles
  children.push(
    createHeading("Architecture Principles", HeadingLevel.HEADING_3),
  );

  const principles = [
    { title: "API-First Design", desc: "All AI capabilities are exposed through Next.js API routes, ensuring clean separation between client and server logic. The frontend never directly accesses AI SDKs or database connections." },
    { title: "Progressive Enhancement", desc: "The application works across a range of devices and connection speeds. Core functionality (resume building, cover letter generation) works without camera or microphone access." },
    { title: "Data Locality", desc: "All user data is stored in a local SQLite database, ensuring fast access and zero dependency on external database services during the MVP phase." },
    { title: "Resilient AI Integration", desc: "All AI API calls implement retry logic with exponential backoff. The ASR pipeline includes request queuing to prevent API overload. Rate limit (429) and server error (5xx) responses are handled gracefully." },
    { title: "Context Propagation", desc: "Career context (job title, company, industry, experience level) flows seamlessly between features. Building a resume pre-populates the cover letter generator. Interview results feed into progress tracking." },
  ];

  principles.forEach(p => {
    children.push(
      createRichParagraph([
        new TextRun({ text: p.title + ": ", bold: true, size: 21, color: COLORS.primary, font: "Calibri" }),
        new TextRun({ text: p.desc, size: 21, color: COLORS.dark, font: "Calibri" }),
      ], { spacing: { after: 140, line: 276 } })
    );
  });

  children.push(createSpacer(200));

  // AI Integration Architecture
  children.push(
    createHeading("AI Integration Architecture", HeadingLevel.HEADING_3),
    createParagraph(
      "All AI capabilities are powered by the z-ai-web-dev-sdk, accessed exclusively through server-side Next.js API routes. This ensures API keys remain secure and allows for server-side caching, rate limiting, and error handling.",
      { spacing: { after: 160, line: 276 } }
    ),
  );

  const aiCapabilities = [
    ["Resume AI", "GPT-4 class LLM", "Summary generation, experience improvement, skill suggestions, full resume generation, ATS scoring"],
    ["Analyzer AI", "GPT-4 class LLM", "Comprehensive resume analysis, section scoring, improvement suggestions, improved resume generation"],
    ["Cover Letter AI", "GPT-4 class LLM", "Tone-aware letter generation, context-aware personalization"],
    ["Interview AI", "GPT-4 class LLM", "Question generation, answer evaluation (relevance/clarity/confidence), persona-aware prompts"],
    ["ASR", "Whisper (z-ai-web-dev-sdk)", "Voice-to-text for interview answers, WAV encoding, request queuing"],
    ["TTS", "z-ai-web-dev-sdk TTS", "Interviewer voice output, voice caching, multi-voice selection"],
  ];

  const aiTableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        createTableHeaderCell("Capability", 20),
        createTableHeaderCell("Model/Service", 25),
        createTableHeaderCell("Use Cases", 55),
      ],
    }),
  ];

  aiCapabilities.forEach((row, idx) => {
    const shading = idx % 2 === 1 ? COLORS.tableAlt : undefined;
    aiTableRows.push(
      new TableRow({
        children: [
          createTableCell(row[0], 20, { bold: true, shading }),
          createTableCell(row[1], 25, { shading }),
          createTableCell(row[2], 55, { shading, color: COLORS.medium }),
        ],
      })
    );
  });

  children.push(
    new Table({
      rows: aiTableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );

  children.push(
    createSpacer(200),
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  return children;
}

// ── Section: Development Roadmap ───────────────────────────────

function createDevelopmentRoadmap() {
  const children = [
    createHeading("4. Development Roadmap", HeadingLevel.HEADING_1),

    createParagraph(
      "The NexTech development roadmap is organized into phases, with Phase 1 (core AI tools) and Phase 2 (advanced features and polish) now complete. The roadmap below reflects the current state and future direction as of March 2026.",
      { spacing: { after: 200, line: 276 } }
    ),

    // Completed phases
    createHeading("Completed Phases", HeadingLevel.HEADING_2),

    createRichParagraph([
      new TextRun({ text: "Phase 1 — Core AI Career Tools ", bold: true, size: 22, color: COLORS.checkGreen, font: "Calibri" }),
      new TextRun({ text: "(Q4 2025 – Q1 2026)", size: 20, color: COLORS.light, font: "Calibri", italics: true }),
    ], { spacing: { after: 80 } }),

    createParagraph(
      "Established the foundation: AI resume building, analysis, cover letter generation, user authentication, onboarding, dashboard, career guide, and data persistence. All features ship with database persistence and cross-feature context propagation.",
      { spacing: { after: 160, line: 276 } }
    ),

    createRichParagraph([
      new TextRun({ text: "Phase 2 — Interview Coach & Progress Tracking ", bold: true, size: 22, color: COLORS.checkGreen, font: "Calibri" }),
      new TextRun({ text: "(Q1 2026)", size: 20, color: COLORS.light, font: "Calibri", italics: true }),
    ], { spacing: { after: 80 } }),

    createParagraph(
      "Delivered the AI Interview Coach with voice I/O, SA-contextualized personas, and lip-sync avatar animation. Added comprehensive progress tracking with gamification (5 achievement badges), document history management, and interview performance analytics with trend tracking.",
      { spacing: { after: 200, line: 276 } }
    ),

    // Roadmap table
    createHeading("Development Phase Summary", HeadingLevel.HEADING_3),
    createSpacer(100),
  ];

  const roadmapData = [
    ["Phase 1", "Core AI Career Tools", "Resume Builder, Analyzer, Cover Letter, Auth, Onboarding, Dashboard, Career Guide, Persistence", "Complete"],
    ["Phase 2", "Interview & Progress", "Interview Coach (voice/visual), Progress Tracker, Document History, Gamification", "Complete"],
    ["Phase 3", "Mobile & Offline", "React Native app (Android-first), offline mode, data-light optimization", "Planned"],
    ["Phase 4", "B2B Platform", "Institutional portal, admin dashboard, bulk licensing, analytics", "Planned"],
    ["Phase 5", "Employer Tools", "Candidate matching, skills assessments, employer-side tools", "Future"],
    ["Phase 6", "Premium & Scale", "Premium tier, LinkedIn integration, advanced analytics, multilingual", "Future"],
  ];

  const roadmapRows = [
    new TableRow({
      tableHeader: true,
      children: [
        createTableHeaderCell("Phase", 10),
        createTableHeaderCell("Focus", 18),
        createTableHeaderCell("Key Deliverables", 50),
        createTableHeaderCell("Status", 22),
      ],
    }),
  ];

  roadmapData.forEach((row, idx) => {
    const shading = idx % 2 === 1 ? COLORS.tableAlt : undefined;
    roadmapRows.push(
      new TableRow({
        children: [
          createTableCell(row[0], 10, { bold: true, alignment: AlignmentType.CENTER, shading }),
          createTableCell(row[1], 18, { bold: true, shading }),
          createTableCell(row[2], 50, { shading, color: COLORS.medium }),
          createStatusCell(row[3], 22, shading),
        ],
      })
    );
  });

  children.push(
    new Table({
      rows: roadmapRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );

  children.push(createSpacer(200));

  // Future Roadmap Details
  children.push(
    createHeading("Future Roadmap Details", HeadingLevel.HEADING_2),

    createRichParagraph([
      new TextRun({ text: "Phase 3 — Mobile & Offline (Target: Q2–Q3 2026)", bold: true, size: 22, color: COLORS.primary, font: "Calibri" }),
    ], { spacing: { after: 80 } }),
    createParagraph(
      "Develop a React Native mobile application targeting Android-first (given Android's dominant market share in South Africa). Implement offline mode and data-light optimization to serve users in areas with limited or expensive connectivity. Core features will work without an internet connection, syncing when connectivity is restored.",
      { spacing: { after: 160, line: 276 } }
    ),

    createRichParagraph([
      new TextRun({ text: "Phase 4 — B2B Institutional Platform (Target: Q3–Q4 2026)", bold: true, size: 22, color: COLORS.primary, font: "Calibri" }),
    ], { spacing: { after: 80 } }),
    createParagraph(
      "Build an institutional portal and admin dashboard that allows universities, TVET colleges, SETAs, and government programs to manage bulk access, track cohort progress, and access analytics. This phase unlocks the primary revenue stream while keeping the platform free for individual users.",
      { spacing: { after: 160, line: 276 } }
    ),

    createRichParagraph([
      new TextRun({ text: "Phase 5 — Employer-Side Tools (Target: Q1 2027)", bold: true, size: 22, color: COLORS.primary, font: "Calibri" }),
    ], { spacing: { after: 80 } }),
    createParagraph(
      "Introduce employer-facing features including candidate matching, skills assessments, and a talent marketplace. Employers can post opportunities and discover pre-assessed candidates based on NexTech's AI-driven performance metrics. This creates a two-sided marketplace that increases placement rates.",
      { spacing: { after: 160, line: 276 } }
    ),

    createRichParagraph([
      new TextRun({ text: "Phase 6 — Premium & Scale (Target: Q2 2027+)", bold: true, size: 22, color: COLORS.primary, font: "Calibri" }),
    ], { spacing: { after: 80 } }),
    createParagraph(
      "Introduce a premium subscription tier with advanced features (LinkedIn integration, advanced analytics, priority AI access, dedicated career coaching). Add multi-language support (Sesotho, isiZulu, Afrikaans) to serve South Africa's multilingual population. Develop the iOS version of the mobile app. Scale infrastructure for national-level deployment.",
      { spacing: { after: 200, line: 276 } }
    ),
  );

  // What's NOT yet implemented
  children.push(
    createHeading("Not Yet Implemented", HeadingLevel.HEADING_3),
    createParagraph(
      "The following features are on the roadmap but have not been implemented as of March 2026:",
      { spacing: { after: 120, line: 276 } }
    ),
  );

  const notImplemented = [
    "React Native mobile app (Android-first)",
    "Offline mode / data-light optimization",
    "B2B institutional portal/dashboard",
    "Employer-side tools (candidate matching, skills assessments)",
    "Premium subscription tier",
    "LinkedIn integration",
    "Advanced analytics",
    "Multi-language support (Sesotho, isiZulu, Afrikaans)",
    "iOS application",
  ];
  notImplemented.forEach(f => children.push(createFeatureBullet(f, false)));

  children.push(
    createSpacer(200),
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  return children;
}

// ── Section: Revenue Model ─────────────────────────────────────

function createRevenueModel() {
  const children = [
    createHeading("5. Revenue Model", HeadingLevel.HEADING_1),

    createParagraph(
      "NexTech Career App follows a social-impact revenue model that keeps the platform free for individual job seekers while generating sustainable revenue through institutional licensing. This approach maximizes social impact while building a viable business.",
      { spacing: { after: 200, line: 276 } }
    ),

    createHeading("Core Principle: Free for Individuals", HeadingLevel.HEADING_3),
    createParagraph(
      "Every feature currently implemented — AI Resume Builder, Analyzer, Cover Letter Generator, Interview Coach, Progress Tracker, and Document History — is and will remain free for individual users. This is non-negotiable and central to our mission of democratizing career preparation for South African youth.",
      { spacing: { after: 200, line: 276 } }
    ),

    createHeading("Revenue Stream: B2B Institutional Licensing", HeadingLevel.HEADING_3),
    createParagraph(
      "Revenue is generated through licensing the platform to institutions that serve job seekers. These organizations pay for bulk access, administrative dashboards, and analytics — while their students/members use NexTech for free.",
      { spacing: { after: 160, line: 276 } }
    ),
  ];

  // Revenue streams table
  const revenueData = [
    ["Universities", "Bulk student access, career center integration, cohort analytics, custom branding", "R50–R150 per student/year", "Medium"],
    ["TVET Colleges", "Student access, placement tracking, SETA reporting integration", "R30–R100 per student/year", "High"],
    ["SETAs", "Sector-wide deployment, skills gap analytics, placement outcome tracking", "Custom enterprise pricing", "High"],
    ["Government Programs", "NYDA, YES Programme integration, employment outcome tracking", "Custom enterprise pricing", "Medium"],
    ["Corporate CSR", "Enterprise career development, community impact reporting", "R100–R300 per user/year", "Low"],
    ["NGOs/NPOs", "Beneficiary access, program outcome tracking, donor reporting", "R20–R80 per beneficiary/year", "Medium"],
  ];

  const revenueRows = [
    new TableRow({
      tableHeader: true,
      children: [
        createTableHeaderCell("Institution Type", 18),
        createTableHeaderCell("Value Proposition", 38),
        createTableHeaderCell("Pricing Range", 22),
        createTableHeaderCell("Priority", 22),
      ],
    }),
  ];

  revenueData.forEach((row, idx) => {
    const shading = idx % 2 === 1 ? COLORS.tableAlt : undefined;
    const priorityColors = { High: COLORS.checkGreen, Medium: COLORS.accent, Low: COLORS.lighter };
    revenueRows.push(
      new TableRow({
        children: [
          createTableCell(row[0], 18, { bold: true, shading }),
          createTableCell(row[1], 38, { shading, color: COLORS.medium }),
          createTableCell(row[2], 22, { alignment: AlignmentType.CENTER, shading }),
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            shading: shading ? { type: ShadingType.CLEAR, fill: shading } : undefined,
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: row[3],
                    bold: true,
                    size: 19,
                    color: priorityColors[row[3]] || COLORS.dark,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  });

  children.push(
    new Table({
      rows: revenueRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );

  children.push(createSpacer(200));

  // Revenue Projections
  children.push(
    createHeading("Revenue Projections", HeadingLevel.HEADING_3),
    createParagraph(
      "Projections are based on conservative adoption estimates within the South African higher education and training sector. Pricing is structured in South African Rand (ZAR) to align with institutional budgets.",
      { spacing: { after: 160, line: 276 } }
    ),
  );

  const projectionData = [
    ["Year 1 (2026)", "5,000–15,000", "2–5", "R250K–R1.5M", "Platform launch, pilot partnerships"],
    ["Year 2 (2027)", "50,000–100,000", "10–25", "R2.5M–R10M", "B2B portal, mobile app, scale"],
    ["Year 3 (2028)", "200,000–500,000", "30–75", "R10M–R50M", "Employer tools, premium tier, national"],
  ];

  const projRows = [
    new TableRow({
      tableHeader: true,
      children: [
        createTableHeaderCell("Period", 16),
        createTableHeaderCell("Users", 16),
        createTableHeaderCell("Institutions", 14),
        createTableHeaderCell("Revenue", 18),
        createTableHeaderCell("Milestones", 36),
      ],
    }),
  ];

  projectionData.forEach((row, idx) => {
    const shading = idx % 2 === 1 ? COLORS.tableAlt : undefined;
    projRows.push(
      new TableRow({
        children: [
          createTableCell(row[0], 16, { bold: true, shading }),
          createTableCell(row[1], 16, { alignment: AlignmentType.CENTER, shading }),
          createTableCell(row[2], 14, { alignment: AlignmentType.CENTER, shading }),
          createTableCell(row[3], 18, { bold: true, alignment: AlignmentType.CENTER, shading, color: COLORS.primary }),
          createTableCell(row[4], 36, { shading, color: COLORS.medium }),
        ],
      })
    );
  });

  children.push(
    new Table({
      rows: projRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );

  children.push(createSpacer(200));

  // Future revenue streams
  children.push(
    createHeading("Future Revenue Streams (Phase 5–6)", HeadingLevel.HEADING_3),
    createBulletPoint("Premium subscription tier: Advanced analytics, LinkedIn integration, priority AI access, dedicated career coaching (R99–R299/month)"),
    createBulletPoint("Employer marketplace: Companies pay to access pre-assessed candidate pools (placement fees or subscription)"),
    createBulletPoint("Skills certification: Verified digital credentials based on AI assessment performance (R50–R200 per certificate)"),
    createBulletPoint("API licensing: Third-party career platforms can integrate NexTech's AI engine (usage-based pricing)"),

    createSpacer(200),

    createHeading("Unit Economics", HeadingLevel.HEADING_3),
    createParagraph(
      "The AI-powered nature of the platform creates compelling unit economics: once the core platform is built, marginal cost per additional user is extremely low. The primary costs are AI API calls (LLM, ASR, TTS), which scale linearly with usage but decrease per-user as institutional licensing provides predictable, bulk usage patterns.",
      { spacing: { after: 160, line: 276 } }
    ),

    createBulletPoint("Estimated AI API cost per user: R5–R15/month (depends on feature usage intensity)"),
    createBulletPoint("Average institutional licensing revenue per user: R50–R150/year"),
    createBulletPoint("Projected gross margin at scale: 70–85%"),
    createBulletPoint("Break-even target: 25,000–50,000 active users with 10+ institutional contracts"),

    createSpacer(300),

    // Closing
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          size: 24,
          color: COLORS.accent,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "End of Business Plan",
          bold: true,
          size: 24,
          color: COLORS.primary,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: "NexTech Career App — Updated March 2026",
          size: 18,
          color: COLORS.lighter,
          font: "Calibri",
          italics: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Phase 1 + Phase 2 Complete | 10 Feature Modules | AI-Powered | Built for South Africa",
          size: 16,
          color: COLORS.lighter,
          font: "Calibri",
        }),
      ],
    }),
  );

  return children;
}

// ── Assemble Document ──────────────────────────────────────────

async function generateDocument() {
  console.log("📄 Generating NexTech Business Plan (Updated March 2026)...");

  const doc = new Document({
    creator: "NexTech Career App",
    title: "NexTech Career App — Business Plan (Updated March 2026)",
    description: "Comprehensive business plan for the NexTech Career App, updated March 2026. Covers current feature status, technical architecture, development roadmap, and revenue model.",
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
            color: COLORS.dark,
          },
          paragraph: {
            spacing: { line: 276 },
          },
        },
        heading1: {
          run: {
            font: "Calibri",
            size: 40,
            bold: true,
            color: COLORS.primary,
          },
          paragraph: {
            spacing: { before: 360, after: 200 },
          },
        },
        heading2: {
          run: {
            font: "Calibri",
            size: 32,
            bold: true,
            color: COLORS.primaryDark,
          },
          paragraph: {
            spacing: { before: 280, after: 160 },
          },
        },
        heading3: {
          run: {
            font: "Calibri",
            size: 26,
            bold: true,
            color: COLORS.accent,
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.1),
              right: convertInchesToTwip(1.1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "NexTech Career App — Business Plan (March 2026)",
                    size: 16,
                    color: COLORS.lighter,
                    font: "Calibri",
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Page ",
                    size: 16,
                    color: COLORS.lighter,
                    font: "Calibri",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: COLORS.lighter,
                    font: "Calibri",
                  }),
                  new TextRun({
                    text: "  |  CONFIDENTIAL",
                    size: 16,
                    color: COLORS.lighter,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...createTitlePage(),
          ...createTableOfContents(),
          ...createExecutiveSummary(),
          ...createFeatureStatus(),
          ...createTechnicalArchitecture(),
          ...createDevelopmentRoadmap(),
          ...createRevenueModel(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = "/home/z/my-project/output/NexTech_Business_Plan_Updated.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Document saved to: ${outputPath}`);
  console.log(`📊 File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

generateDocument().catch((err) => {
  console.error("❌ Error generating document:", err);
  process.exit(1);
});
