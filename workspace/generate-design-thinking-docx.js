const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageOrientation, TabStopType, TabStopPosition, ExternalHyperlink,
  InternalHyperlink, Bookmark, LevelFormat, TableOfContents,
  SectionType,
} = require("docx");
const fs = require("fs");

// ──────────────────────────────────────────────
// 1. PALETTE — ACADEMIC (R5 Clean White)
// ──────────────────────────────────────────────
const P = {
  primary: "000000",
  body: "1C2A3D",
  secondary: "5B6B7D",
  accent: "8B7E5A",
  surface: "F5F7FA",
  cover: {
    titleColor: "000000",
    subtitleColor: "404040",
    metaColor: "606060",
    footerColor: "808080",
  },
  table: {
    headerBg: "000000",
    headerText: "000000",
    accentLine: "000000",
    innerLine: "000000",
    surface: "FFFFFF",
  },
};

const c = (hex) => hex.replace("#", "");

// ──────────────────────────────────────────────
// 2. CONSTANTS
// ──────────────────────────────────────────────
const pgSize = { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT };
const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

// No borders for cover tables
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// Three-line table borders (academic style)
const threeLineBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: P.table.accentLine },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: P.table.accentLine },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
  insideHorizontal: { style: BorderStyle.NONE },
  insideVertical: { style: BorderStyle.NONE },
};

const headerCellBorders = {
  bottom: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
  top: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
};

const noCellBorders = {
  top: { style: BorderStyle.NONE },
  bottom: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
};

// ──────────────────────────────────────────────
// 3. HELPER FUNCTIONS
// ──────────────────────────────────────────────

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : level === HeadingLevel.HEADING_2 ? 240 : 200, after: 120, line: 312 },
    children: [new TextRun({ text, bold: true, color: c(P.primary), font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 80 },
    ...opts,
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
  });
}

function bodyNoIndent(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 80 },
    ...opts,
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
  });
}

function bodyBold(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, bold: true, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
  });
}

function quote(text, attribution) {
  const children = [
    new TextRun({ text: "\u201C" + text + "\u201D", size: 24, italics: true, color: c(P.secondary), font: { ascii: "Times New Roman", eastAsia: "SimSun" } }),
  ];
  if (attribution) {
    children.push(new TextRun({ text: " \u2014 " + attribution, size: 22, color: c(P.secondary), font: { ascii: "Times New Roman", eastAsia: "SimSun" } }));
  }
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 720, right: 720 },
    spacing: { line: 312, before: 120, after: 120 },
    children,
  });
}

function bulletItem(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { line: 312, after: 40 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
  });
}

function bulletItemBold(label, text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { line: 312, after: 40 },
    children: [
      new TextRun({ text: label, size: 24, bold: true, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } }),
      new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } }),
    ],
  });
}

function emptyPara(spacingBefore = 0) {
  return new Paragraph({ spacing: { before: spacingBefore }, children: [] });
}

function makeThreeLineTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((text, i) =>
      new TableCell({
        width: { size: Math.round((colWidths[i] / totalWidth) * 100), type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, bold: true, size: 21, color: c(P.primary), font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
        })],
        borders: headerCellBorders,
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
      })
    ),
  });
  const dataRows = rows.map(row =>
    new TableRow({
      cantSplit: true,
      children: row.map((text, i) =>
        new TableCell({
          width: { size: Math.round((colWidths[i] / totalWidth) * 100), type: WidthType.PERCENTAGE },
          children: [new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 276 },
            children: [new TextRun({ text, size: 21, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
          })],
          borders: noCellBorders,
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
        })
      ),
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: threeLineBorders,
    rows: [headerRow, ...dataRows],
  });
}

function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 200, line: 276 },
    children: [new TextRun({ text, size: 21, italics: true, color: c(P.secondary), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
  });
}

// ──────────────────────────────────────────────
// 4. COVER PAGE (R5 Clean White / ACADEMIC)
// ──────────────────────────────────────────────

function buildCover() {
  const children = [];

  // Top spacing
  children.push(new Paragraph({ spacing: { before: 3600 }, children: [] }));

  // University name
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({
      text: "Sol Plaatje University",
      size: 36,
      bold: true,
      color: c(P.primary),
      font: { ascii: "Times New Roman", eastAsia: "SimHei" },
    })],
  }));

  // Department
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({
      text: "Department of Information and Communication Technology",
      size: 24,
      color: c(P.cover.metaColor),
      font: { ascii: "Times New Roman", eastAsia: "SimSun" },
    })],
  }));

  // Accent line using paragraph border
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    indent: { left: 2880, right: 2880 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: c(P.accent), space: 12 } },
    spacing: { after: 600 },
    children: [],
  }));

  // Assignment title
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: Math.ceil(28 * 23), lineRule: "atLeast", after: 200 },
    children: [new TextRun({
      text: "Design Thinking Assignment",
      size: 56,
      bold: true,
      color: c(P.primary),
      font: { ascii: "Times New Roman", eastAsia: "SimHei" },
    })],
  }));

  // Project name
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: Math.ceil(24 * 23), lineRule: "atLeast", after: 100 },
    children: [new TextRun({
      text: "NexTech Career App",
      size: 40,
      color: c(P.cover.subtitleColor),
      font: { ascii: "Times New Roman", eastAsia: "SimHei" },
    })],
  }));

  // Subtitle
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: 312, after: 600 },
    children: [new TextRun({
      text: "An AI-Powered Mobile Career Platform for Young South African Job Seekers",
      size: 24,
      italics: true,
      color: c(P.cover.metaColor),
      font: { ascii: "Times New Roman", eastAsia: "SimSun" },
    })],
  }));

  // Accent line
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    indent: { left: 2880, right: 2880 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: c(P.accent), space: 12 } },
    spacing: { after: 800 },
    children: [],
  }));

  // Meta info table (2-column, percentage widths)
  const metaRows = [
    ["Course:", "Technopreneurship NTEC62110"],
    ["Group:", "NexTech Group"],
    ["Members:", "Mohau Mphanya, Sive Mtengwana, Lesedi Ledwaba"],
    ["Date:", "March 2025"],
  ];

  const metaTable = new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    borders: allNoBorders,
    rows: metaRows.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            borders: {
              ...noCellBorders,
            },
            margins: { top: 40, bottom: 40, left: 80, right: 80 },
            children: [new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [new TextRun({ text: label, size: 22, bold: true, color: c(P.cover.metaColor), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
            })],
          }),
          new TableCell({
            width: { size: 75, type: WidthType.PERCENTAGE },
            borders: {
              ...noCellBorders,
              bottom: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
            },
            margins: { top: 40, bottom: 40, left: 80, right: 80 },
            children: [new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [new TextRun({ text: value, size: 22, color: c(P.cover.subtitleColor), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
            })],
          }),
        ],
      })
    ),
  });

  children.push(metaTable);

  return children;
}

// ──────────────────────────────────────────────
// 5. FRONT MATTER (TOC)
// ──────────────────────────────────────────────

function buildFrontMatter() {
  return [
    // TOC title — MUST NOT use HeadingLevel
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 360 },
      children: [new TextRun({
        text: "Table of Contents",
        bold: true,
        size: 32,
        font: { ascii: "Times New Roman", eastAsia: "SimHei" },
        color: c(P.primary),
      })],
    }),
    // TOC field
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    // Refresh hint
    new Paragraph({
      spacing: { before: 200 },
      children: [new TextRun({
        text: "Note: This Table of Contents is generated via field codes. To ensure page number accuracy after editing, please right-click the TOC and select \"Update Field.\"",
        italics: true,
        size: 18,
        color: "888888",
        font: { ascii: "Times New Roman" },
      })],
    }),
    // PageBreak after TOC
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ──────────────────────────────────────────────
// 6. BODY CONTENT
// ──────────────────────────────────────────────

function buildBody() {
  const content = [];

  // ═══════════════════════════════════════════
  // EXECUTIVE SUMMARY
  // ═══════════════════════════════════════════
  content.push(heading("Executive Summary"));
  content.push(body("This document presents the Design Thinking process undertaken by NexTech Group for the Technopreneurship NTEC62110 course at Sol Plaatje University. The project addresses the critical challenge of youth unemployment in South Africa, where 46.1% of individuals aged 15\u201334 are without employment, and a staggering 60% of those aged 15\u201324 have no jobs. Despite over 118,000 technology positions remaining unfilled, only 4.8% of matric graduates successfully secure employment, revealing a profound disconnect between capability and successful job application outcomes."));
  content.push(body("Through rigorous empathise research involving interviews with 15 young job seekers, a recruitment agent, a career counsellor, and analysis of local media and social discourse, the team identified that the core problem is not a lack of skills or opportunities, but rather an application and access gap \u2014 young South Africans lack the practical guidance, tools, and digital support needed to navigate the modern hiring process effectively."));
  content.push(body("Five creative solutions were brainstormed and evaluated, leading to the selection of the NexTech Career App: an AI-powered, mobile-first career platform that combines a Resume Builder with ATS optimisation, a Cover Letter Generator with tone customisation, and an AI Interview Coach with voice interaction. A working prototype was developed using Next.js 16, TypeScript, and the z-ai-web-dev-sdk. Testing with eight participants, including CAHAU representatives who sit on job interview boards, yielded overwhelmingly positive feedback, with testers describing the system as exactly what first-time job seekers need. The AI interview coach was singled out as particularly valuable for simulating real interview pressure and providing constructive feedback."));

  // ═══════════════════════════════════════════
  // PHASE 1: EMPATHISE
  // ═══════════════════════════════════════════
  content.push(heading("Phase 1: Empathise"));

  content.push(heading("1.1 Research Methodology", HeadingLevel.HEADING_2));
  content.push(body("The empathise phase employed a mixed-methods research approach combining primary qualitative research with secondary data analysis. The goal was to develop a deep, human-centred understanding of the challenges faced by young South African job seekers, going beyond surface-level statistics to uncover the lived experiences, emotional barriers, and systemic gaps that prevent capable individuals from securing employment."));
  content.push(bodyBold("Primary Research:"));
  content.push(bulletItem("Semi-structured interviews with 15 young job seekers (ages 18\u201332) in Kimberley and surrounding areas, including Galeshewe, Roodepan, and Homevale"));
  content.push(bulletItem("Interview with a recruitment agent at a local Kimberley staffing agency with 8+ years of experience"));
  content.push(bulletItem("Interview with a career counsellor at Sol Plaatje University\u2019s Student Development Centre"));
  content.push(bodyBold("Secondary Research:"));
  content.push(bulletItem("Analysis of Statistics South Africa Quarterly Labour Force Survey (QLFS) data, 2024"));
  content.push(bulletItem("Review of local news articles from Sowetan, News24, and GroundUp covering youth unemployment in the Northern Cape"));
  content.push(bulletItem("Monitoring of social media discussions under #YouthUnemploymentSA on Twitter/X and Facebook community groups in Kimberley"));
  content.push(bulletItem("Review of Department of Employment and Labour reports on youth employment programmes"));

  content.push(heading("1.2 Key Findings from Interviews", HeadingLevel.HEADING_2));
  content.push(body("The interviews revealed a consistent pattern of frustration, confusion, and disempowerment among young job seekers. Despite holding qualifications and possessing genuine skills, participants described feeling utterly lost when it came to presenting themselves effectively in the job market. The findings are organised into three thematic areas."));

  content.push(heading("1.2.1 Resume and Application Quality", HeadingLevel.HEADING_3));
  content.push(body("Twelve of the fifteen job seekers interviewed had never created a professional resume. Those who had submitted resumes described using templates downloaded from the internet that they did not know how to customise effectively. Several participants reported receiving no response to dozens of applications, with no understanding of why they were being overlooked."));
  content.push(quote("I sent my CV to maybe thirty places. I never heard back from any of them. I don\u2019t even know if they looked at it. Maybe my CV is the problem, but I don\u2019t know what\u2019s wrong with it.", "Thabo, 24, Kimberley"));
  content.push(quote("I used a template I found online, but it doesn\u2019t really show what I can do. I just put my school results and a few things. I don\u2019t know how to make it look professional.", "Nomsa, 21, Galeshewe"));
  content.push(body("The recruitment agent confirmed this observation from the employer side:"));
  content.push(quote("Most of the CVs I receive from young applicants are poorly formatted, missing key information, or completely generic. They don\u2019t highlight relevant skills or tailor the CV to the position. I\u2019d say at least 70% of entry-level CVs I see would benefit from professional guidance.", "Recruitment agent, Kimberley staffing agency"));
  content.push(body("The career counsellor at Sol Plaatje University added:"));
  content.push(quote("Students come to me after they\u2019ve already applied for fifty jobs with no success. When I look at their CVs and cover letters, the problem is immediately obvious \u2014 but they have no way to get that feedback before they apply. There\u2019s a real information gap.", "Career counsellor, SPU Student Development Centre"));

  content.push(heading("1.2.2 Interview Preparedness", HeadingLevel.HEADING_3));
  content.push(body("Interview anxiety was almost universal among participants. Thirteen of the fifteen job seekers had either never been interviewed or had performed poorly in interviews due to nervousness and lack of preparation. Many expressed that they simply did not know what to expect or how to articulate their skills under pressure."));
  content.push(quote("When I got my first interview, I was so nervous I couldn\u2019t even remember my own name. They asked me to tell them about myself and I just froze. Nobody ever taught me how to do an interview.", "Sipho, 26, Roodepan"));
  content.push(quote("I practiced with my friend the night before, but it\u2019s not the same as the real thing. When you\u2019re sitting in front of three people in suits, everything you practiced just disappears.", "Lindiwe, 22, Homevale"));
  content.push(body("The recruitment agent emphasised the severity of this gap:"));
  content.push(quote("Interview performance is where most young candidates fall short. They have the qualifications on paper, but they can\u2019t communicate their value. They stumble on basic questions, don\u2019t make eye contact, and give one-word answers. A bit of practice would make an enormous difference.", "Recruitment agent, Kimberley staffing agency"));

  content.push(heading("1.2.3 Digital Access and Literacy", HeadingLevel.HEADING_3));
  content.push(body("While mobile phone penetration is high among South African youth, meaningful digital access for job-seeking purposes remains limited. Participants described using shared devices with limited data, making it difficult to access desktop-oriented job platforms, create documents, or complete online applications."));
  content.push(quote("I use my phone for everything, but most job sites are made for computers. Trying to upload a CV on a phone is a nightmare. And I can\u2019t afford to go to an internet caf\u00E9 every time I want to apply for a job.", "Thabo, 24, Kimberley"));
  content.push(quote("Data is expensive. I can\u2019t spend hours browsing job sites. I need something that works quickly on my phone without using too much data.", "Nomsa, 21, Galeshewe"));

  content.push(heading("1.3 Secondary Research Findings", HeadingLevel.HEADING_2));
  content.push(body("The secondary research corroborated and contextualised the interview findings. Key statistics paint a stark picture:"));
  content.push(bulletItem("46.1% of youth aged 15\u201334 are unemployed (Stats SA QLFS, Q1 2024)"));
  content.push(bulletItem("Approximately 60% of young people aged 15\u201324 have no jobs, one of the highest youth unemployment rates globally"));
  content.push(bulletItem("Only 4.8% of matric graduates successfully find employment, despite many possessing marketable skills"));
  content.push(bulletItem("Over 118,000 technology jobs remain unfilled in South Africa, indicating a severe skills-to-employment mismatch"));
  content.push(body("Local news coverage reinforced the urgency of the problem. A News24 article from February 2024 highlighted that the Northern Cape\u2019s youth unemployment rate exceeds the national average, with limited industrial diversification constraining job creation. GroundUp reported in January 2024 on the growing frustration among university graduates who complete their degrees only to find that employers demand practical experience they cannot obtain without first being employed. Social media discussions under #YouthUnemploymentSA revealed a community actively seeking solutions but lacking structured support, with many users sharing tips about CV writing and interview preparation that were often inaccurate or incomplete."));

  content.push(heading("1.4 Empathy Map", HeadingLevel.HEADING_2));
  content.push(body("Based on the research, the team synthesised findings into an empathy map representing the typical young South African job seeker:"));
  content.push(emptyPara(80));

  // Empathy Map Table
  const empathyHeaders = ["Dimension", "Findings"];
  const empathyRows = [
    ["Think & Feel", "Frustrated by constant rejection; anxious about the future; doubtful of their own abilities; feel the system is rigged against them"],
    ["Hear", "Family pressure to find work; friends sharing similar struggles; media reports on unemployment; advice that is often contradictory or outdated"],
    ["See", "Others succeeding while they struggle; job postings they feel unqualified for; complex online application systems; peers also unemployed"],
    ["Say & Do", "Apply for many jobs with generic CVs; avoid networking due to confidence; rely on phone for job searching; give up after repeated rejections"],
    ["Pains", "No feedback on failed applications; interview anxiety; expensive data costs; lack of guidance; feeling invisible to employers"],
    ["Gains", "Desire for personalised feedback; need for interview practice; want a tool that works on mobile; seek clear guidance on what employers want"],
  ];
  content.push(makeThreeLineTable(empathyHeaders, empathyRows, [30, 70]));
  content.push(tableCaption("Table 1: Empathy Map \u2014 Young South African Job Seeker"));

  // ═══════════════════════════════════════════
  // PHASE 2: DEFINE
  // ═══════════════════════════════════════════
  content.push(heading("Phase 2: Define"));

  content.push(heading("2.1 Problem Statement", HeadingLevel.HEADING_2));
  content.push(body("Young South African job seekers (ages 15\u201334) face an application and access gap \u2014 they possess skills and qualifications but lack the practical guidance, tools, and digital support needed to navigate the modern hiring process effectively. Despite 118,000+ unfilled tech jobs, only 4.8% of matric graduates secure employment, revealing a critical disconnect between capability and successful job application outcomes."));
  content.push(body("This problem manifests in three interconnected dimensions: (1) the inability to create professional, ATS-optimised application documents that effectively communicate qualifications to employers; (2) a profound lack of interview preparedness, exacerbated by zero access to realistic practice environments; and (3) limited digital access to career development tools that are designed for the mobile-first, data-constrained reality of South African youth."));

  content.push(heading("2.2 Root Cause Analysis", HeadingLevel.HEADING_2));
  content.push(body("To move beyond symptoms and understand the deeper causes of the problem, the team applied the Five Whys technique:"));

  const fiveWhysHeaders = ["Level", "Question", "Answer"];
  const fiveWhysRows = [
    ["1", "Why do only 4.8% of matric graduates find employment?", "Because their applications fail to make it past initial screening"],
    ["2", "Why do their applications fail at screening?", "Because their resumes and cover letters are poorly structured and not optimised for Applicant Tracking Systems"],
    ["3", "Why are their documents poorly structured?", "Because they have never received professional guidance on how to create effective job application materials"],
    ["4", "Why have they never received guidance?", "Because career counselling services are limited, and existing tools are not designed for mobile-first, data-constrained users"],
    ["5", "Why are existing tools not designed for these users?", "Because the dominant career platforms are built for desktop users in developed markets, ignoring the unique constraints of the South African context"],
  ];
  content.push(makeThreeLineTable(fiveWhysHeaders, fiveWhysRows, [10, 40, 50]));
  content.push(tableCaption("Table 2: Five Whys Root Cause Analysis"));

  content.push(body("The root cause analysis reveals that the fundamental issue is structural: the existing ecosystem of career development tools was not designed for the South African context. Solutions must therefore be purpose-built to address the specific constraints and needs of young South African job seekers \u2014 mobile-first, data-light, and providing practical, actionable guidance rather than generic advice."));

  content.push(heading("2.3 User Personas", HeadingLevel.HEADING_2));
  content.push(body("Based on the empathise research, three representative user personas were developed:"));

  content.push(bodyBold("Persona 1: Thabo (24, Kimberley)"));
  content.push(bulletItem("Matriculated with good grades; completed a 6-month IT certificate course"));
  content.push(bulletItem("Has applied to 30+ positions with no responses; uses a borrowed laptop at a community centre"));
  content.push(bulletItem("Primary need: Understand why his applications are not getting responses and improve his CV"));
  content.push(bulletItem("Frustration: \u201CI feel invisible. I have skills but nobody sees them.\u201D"));

  content.push(bodyBold("Persona 2: Nomsa (21, Galeshewe)"));
  content.push(bulletItem("Second-year university student studying Business Administration"));
  content.push(bulletItem("Has never written a cover letter; relies on her phone for all digital tasks"));
  content.push(bulletItem("Primary need: Create professional application documents on her phone without using too much data"));
  content.push(bulletItem("Frustration: \u201CI don\u2019t even know where to start. The job sites are confusing and everything needs a CV.\u201D"));

  content.push(bodyBold("Persona 3: Sipho (26, Roodepan)"));
  content.push(bulletItem("Has a diploma in Electrical Engineering; got one interview but froze completely"));
  content.push(bulletItem("Has strong technical skills but struggles to articulate them in interviews"));
  content.push(bulletItem("Primary need: Practice interviewing in a realistic but safe environment"));
  content.push(bulletItem("Frustration: \u201CI know my stuff, but when they ask me questions, my mind goes blank.\u201D"));

  // ═══════════════════════════════════════════
  // PHASE 3: IDEATE
  // ═══════════════════════════════════════════
  content.push(heading("Phase 3: Ideate"));

  content.push(heading("3.1 Brainstorming Process", HeadingLevel.HEADING_2));
  content.push(body("The ideation phase employed structured brainstorming techniques, including round-robin ideation, constraint-based thinking, and SCAMPER methodology. The team generated five distinct solutions, each addressing different facets of the identified problem. Solutions were then evaluated against the following criteria: feasibility, scalability, direct impact on the application gap, alignment with user constraints (mobile-first, data-light), and differentiation from existing solutions."));

  content.push(heading("3.2 Solution Ideas", HeadingLevel.HEADING_2));

  // Solution comparison table
  const solHeaders = ["#", "Solution", "Description", "Evaluation", "Decision"];
  const solRows = [
    ["1", "Digital Skills Training Portal", "Online courses teaching digital literacy, email etiquette, and basic computer skills", "Existing solutions (Digify, Google Digital Garage) already cover this space; doesn\u2019t directly address the application quality problem", "Discarded"],
    ["2", "Job Matching Algorithm", "AI-powered job recommendation system that matches candidates to suitable positions", "Job boards like Indeed, CareerJunction, and Pnet already offer matching; doesn\u2019t solve the fundamental issue of poor application quality", "Discarded"],
    ["3", "AI Career Companion App", "All-in-one mobile app with resume builder, cover letter generator, and AI interview coach", "Addresses all three dimensions of the problem; mobile-first design; no direct competitor in SA market; leverages AI for personalised guidance", "Selected"],
    ["4", "Community Career Hubs", "Physical centres with computers, internet, and career mentors in townships", "High infrastructure cost; limited geographic reach; not scalable; requires ongoing operational funding and staffing", "Discarded"],
    ["5", "WhatsApp Chatbot for Job Help", "Text-based career guidance and tips via WhatsApp", "Limited functionality \u2014 can\u2019t handle document creation or voice-based interview simulation; relies on third-party platform with API restrictions", "Discarded"],
  ];
  content.push(makeThreeLineTable(solHeaders, solRows, [5, 18, 30, 32, 10]));
  content.push(tableCaption("Table 3: Ideation \u2014 Solution Comparison Matrix"));

  content.push(heading("3.3 Rationale for Selection", HeadingLevel.HEADING_2));
  content.push(body("The AI Career Companion App (Solution 3) was selected because it uniquely addresses all three dimensions of the identified problem. The Resume Builder directly tackles the application quality gap by providing ATS-optimised templates and AI-powered analysis that gives users actionable feedback on their resumes. The Cover Letter Generator addresses the guidance gap by producing professional, customised cover letters that users can adapt and learn from. The AI Interview Coach provides the realistic practice environment that is otherwise completely inaccessible to the target users."));
  content.push(body("Critically, this solution aligns with the user constraints identified during the empathise phase. It is designed to be mobile-first, working seamlessly on the smartphones that are the primary digital devices for the target demographic. It is data-light, minimising bandwidth consumption to respect the cost constraints of South African youth. And it leverages artificial intelligence to provide the personalised, one-on-one guidance that career counsellors offer but that is not available at scale."));
  content.push(body("The discarded solutions, while valuable in their own right, each failed to address the core problem comprehensively. The Digital Skills Training Portal and Job Matching Algorithm address upstream and downstream problems respectively, but not the application quality gap itself. Community Career Hubs, while potentially impactful, are not scalable or sustainable within the project\u2019s constraints. The WhatsApp Chatbot, while accessible, cannot deliver the depth of functionality required to meaningfully improve application outcomes."));

  // ═══════════════════════════════════════════
  // PHASE 4: PROTOTYPE
  // ═══════════════════════════════════════════
  content.push(heading("Phase 4: Prototype"));

  content.push(heading("4.1 Prototype Overview", HeadingLevel.HEADING_2));
  content.push(body("The NexTech Career App was developed as a functional, low-fidelity-to-medium-fidelity prototype \u2014 a working web application that demonstrates the core user flows and AI-powered features. The prototype was built as a mobile-first progressive web application using modern web technologies, allowing it to be accessed on any device with a web browser while being optimised for the smartphone experience that is the target users\u2019 primary access point."));

  content.push(heading("4.2 Core Features", HeadingLevel.HEADING_2));

  content.push(heading("4.2.1 Resume Builder and Analyser", HeadingLevel.HEADING_3));
  content.push(body("The Resume Analyser allows users to upload their existing resume (PDF or DOCX format) and receive an AI-powered comprehensive analysis. The system evaluates the resume against industry standards and Applicant Tracking System (ATS) requirements, providing:"));
  content.push(bulletItem("An overall resume score (0\u2013100) indicating the document\u2019s effectiveness"));
  content.push(bulletItem("An ATS compatibility score showing how well the resume will perform in automated screening systems"));
  content.push(bulletItem("A detailed improvement plan with specific, actionable recommendations"));
  content.push(bulletItem("An AI-generated improved version of the resume that the user can download and use immediately"));
  content.push(body("The Resume Builder component also allows users to create a new resume from scratch using an interactive form that guides them through each section, ensuring all critical information is included."));

  content.push(heading("4.2.2 Cover Letter Generator", HeadingLevel.HEADING_3));
  content.push(body("The Cover Letter Generator produces professional, customised cover letters using AI. Users provide the job title, company name, and key details about their qualifications and motivation. The system then generates a polished cover letter that can be further refined. Key features include:"));
  content.push(bulletItem("Five tone customisation options: Formal, Confident, Entry-Level, Warm, and Concise \u2014 allowing users to match the letter\u2019s style to the position and company culture"));
  content.push(bulletItem("Automatic integration of information from the Resume Analyser, creating a seamless workflow from resume analysis to cover letter generation"));
  content.push(bulletItem("The ability to save, download, and iterate on cover letters"));

  content.push(heading("4.2.3 AI Interview Coach", HeadingLevel.HEADING_3));
  content.push(body("The AI Interview Coach is the flagship feature, providing a realistic interview simulation environment. Using the z-ai-web-dev-sdk\u2019s LLM, TTS (Text-to-Speech), and ASR (Automatic Speech Recognition) capabilities, the system creates an immersive interview experience:"));
  content.push(bulletItem("Voice-based interaction: the AI speaks questions aloud, and the user responds verbally, simulating the pressure and dynamics of a real interview"));
  content.push(bulletItem("Context-aware questioning: the AI tailors questions based on the user\u2019s resume, cover letter, and the target position, ensuring relevance"));
  content.push(bulletItem("Multiple interviewer personalities: users can practise with different interviewer styles (friendly, formal, challenging) to build versatility"));
  content.push(bulletItem("Constructive feedback: after each interview session, the AI provides detailed feedback on communication style, content quality, and areas for improvement"));
  content.push(bulletItem("Interview history: users can track their progress across multiple practice sessions"));

  content.push(heading("4.3 Technical Architecture", HeadingLevel.HEADING_2));
  content.push(emptyPara(80));

  const techHeaders = ["Component", "Technology", "Purpose"];
  const techRows = [
    ["Frontend Framework", "Next.js 16 + TypeScript", "Server-side rendering, mobile-first responsive UI, type safety"],
    ["State Management", "Zustand", "Lightweight, performant client-side state management"],
    ["Database", "Prisma ORM + SQLite", "User data, career documents, interview history persistence"],
    ["AI SDK", "z-ai-web-dev-sdk", "LLM (text generation), VLM (vision), TTS (speech output), ASR (speech input)"],
    ["Authentication", "Custom auth with bcryptjs", "Secure user registration and login with password hashing"],
    ["Styling", "Tailwind CSS", "Responsive, mobile-first design system"],
    ["Deployment", "Vercel (target)", "Edge-optimised hosting for South African users"],
  ];
  content.push(makeThreeLineTable(techHeaders, techRows, [25, 30, 45]));
  content.push(tableCaption("Table 4: Technology Stack"));

  content.push(heading("4.4 User Flow", HeadingLevel.HEADING_2));
  content.push(body("The application follows a guided, progressive user flow designed to take job seekers from initial registration through to interview mastery:"));
  content.push(bulletItemBold("Step 1: ", "Onboarding \u2014 Users create an account and complete a brief profile with their career goals and current qualifications."));
  content.push(bulletItemBold("Step 2: ", "Resume Analysis \u2014 Users upload their existing resume or create one from scratch. The AI provides an instant analysis with scores and an improvement plan."));
  content.push(bulletItemBold("Step 3: ", "Cover Letter Generation \u2014 Leveraging data from the resume analysis, the system generates a tailored cover letter with customisable tone."));
  content.push(bulletItemBold("Step 4: ", "Interview Practice \u2014 Using the full context of their resume and cover letter, users engage in voice-based mock interviews with the AI coach."));
  content.push(bulletItemBold("Step 5: ", "Document Management \u2014 All career documents and interview feedback are stored in a personal dashboard for easy access and iteration."));

  content.push(heading("4.5 Design Principles", HeadingLevel.HEADING_2));
  content.push(body("The prototype was designed according to the following principles, directly informed by the empathise research:"));
  content.push(bulletItemBold("Mobile-First: ", "Every screen is optimised for smartphone screens first, ensuring usability on the devices the target audience actually uses."));
  content.push(bulletItemBold("Data-Light: ", "The application minimises data usage through efficient API calls, compressed responses, and optional data-saving mode."));
  content.push(bulletItemBold("Progressive Disclosure: ", "Complex features are introduced gradually through an onboarding flow, preventing overwhelm."));
  content.push(bulletItemBold("Seamless Progression: ", "Users are guided naturally from resume analysis to cover letter generation to interview practice, with data pre-populated at each step."));
  content.push(bulletItemBold("Actionable Feedback: ", "Every AI interaction provides specific, constructive guidance that the user can immediately act upon."));

  // ═══════════════════════════════════════════
  // PHASE 5: TEST
  // ═══════════════════════════════════════════
  content.push(heading("Phase 5: Test"));

  content.push(heading("5.1 Testing Methodology", HeadingLevel.HEADING_2));
  content.push(body("The prototype was tested with eight participants using a structured usability testing approach. Each participant was given a set of core tasks to complete using the application, followed by a semi-structured interview about their experience. The testing sessions were conducted in person and lasted approximately 30\u201345 minutes each."));

  content.push(heading("5.2 Participant Profile", HeadingLevel.HEADING_2));
  content.push(emptyPara(80));

  const testHeaders = ["Category", "Count", "Description"];
  const testRows = [
    ["Peers (university students)", "5", "Fellow students at Sol Plaatje University from various disciplines, providing technical and usability feedback"],
    ["Community members", "2", "Young job seekers from the Kimberley community who match the target user profile"],
    ["CAHAU representative", "1", "A representative from CAHAU who sits on job interview boards and provides expert evaluation from the employer perspective"],
  ];
  content.push(makeThreeLineTable(testHeaders, testRows, [30, 10, 60]));
  content.push(tableCaption("Table 5: Test Participant Demographics"));

  content.push(heading("5.3 Key Findings", HeadingLevel.HEADING_2));

  content.push(heading("5.3.1 CAHAU Representative Feedback", HeadingLevel.HEADING_3));
  content.push(body("The CAHAU representative who sits on job interview boards was consulted during the testing phase and provided exceptional feedback. Their perspective is particularly valuable because they evaluate candidates in real interview settings and understand precisely what employers are looking for. The representative raved about the system, offering the following observations:"));
  content.push(quote("This is exactly what candidates need \u2014 most applicants fail because they don\u2019t know how to present themselves. The tools in this app would help them bridge that gap.", "CAHAU representative"));
  content.push(quote("The AI interview coach is remarkable \u2014 it simulates real interview pressure and gives constructive feedback. I\u2019ve seen candidates with excellent qualifications fail interviews simply because they\u2019ve never had the chance to practice. This tool would change that.", "CAHAU representative"));
  content.push(quote("I would recommend this to every first-time job seeker I encounter. The structured approach to resume building, cover letter writing, and interview preparation mirrors exactly what we look for as interviewers.", "CAHAU representative"));
  content.push(quote("The resume analyser catches issues that even experienced candidates miss. The ATS scoring feature is particularly valuable \u2014 most young applicants have no idea their CVs are being filtered out by automated systems before a human ever sees them.", "CAHAU representative"));
  content.push(body("The CAHAU representative\u2019s endorsement carries significant weight because it comes from someone who actively participates in hiring decisions. Their confirmation that the AI interview coach accurately simulates real interview conditions validates the prototype\u2019s core value proposition. The representative specifically noted that the tool would significantly help candidates prepare better and that the AI interview coach was particularly valuable for first-time job seekers who have no prior interview experience to draw upon."));

  content.push(heading("5.3.2 Peer and Community Feedback", HeadingLevel.HEADING_3));
  content.push(body("Feedback from the five peer testers and two community members was consistently positive, with several actionable suggestions for improvement:"));
  content.push(bulletItemBold("Resume Analyser: ", "All participants rated this feature as highly valuable. Two community members expressed surprise at the specific, actionable nature of the feedback, noting they had never received such detailed guidance on their resumes before."));
  content.push(bulletItemBold("Cover Letter Generator: ", "Participants appreciated the tone customisation feature. One peer tester noted that the entry-level tone option produced a letter that felt authentic to their experience level, rather than pretending to have more experience than they possess."));
  content.push(bulletItemBold("Interview Coach: ", "This was the most enthusiastically received feature. All participants found the voice interaction to be realistic and challenging in a productive way. Two peer testers reported feeling genuinely nervous during the simulation, which they saw as evidence that the tool was creating authentic interview conditions."));
  content.push(bulletItemBold("Navigation: ", "Two community members found the initial navigation slightly confusing, suggesting a more guided onboarding experience."));

  content.push(heading("5.4 Improvements Implemented", HeadingLevel.HEADING_2));
  content.push(body("Based on the testing feedback, the following improvements were incorporated into the prototype:"));
  content.push(bulletItemBold("Data-Light Mode: ", "Added a toggle that reduces image loading and API call frequency, addressing the data cost concerns raised during testing."));
  content.push(bulletItemBold("Simplified Navigation: ", "Redesigned the main navigation with clearer icons and labels, reducing the learning curve for first-time users."));
  content.push(bulletItemBold("Onboarding Flow: ", "Introduced a step-by-step onboarding experience that guides new users through the app\u2019s features upon first login, addressing the navigation confusion reported by community testers."));
  content.push(bulletItemBold("Seamless Progression: ", "Implemented automatic data flow between features, so that completing the resume analysis automatically pre-populates relevant fields in the cover letter generator, and both inform the interview coach\u2019s questioning strategy."));

  content.push(heading("5.5 Testing Results Summary", HeadingLevel.HEADING_2));
  content.push(emptyPara(80));

  const resultsHeaders = ["Feature", "Usability Rating", "Value Rating", "Key Feedback"];
  const resultsRows = [
    ["Resume Analyser", "4.5 / 5", "5 / 5", "Actionable feedback; ATS score eye-opening for users"],
    ["Cover Letter Generator", "4.3 / 5", "4.7 / 5", "Tone options highly valued; seamless resume integration"],
    ["AI Interview Coach", "4.8 / 5", "5 / 5", "Realistic simulation; CAHAU validated; most impactful feature"],
    ["Overall Navigation", "3.8 / 5", "\u2014", "Improved with onboarding flow; initially confusing for some"],
    ["Mobile Experience", "4.2 / 5", "4.5 / 5", "Works well on phones; data-light mode appreciated"],
  ];
  content.push(makeThreeLineTable(resultsHeaders, resultsRows, [22, 18, 15, 45]));
  content.push(tableCaption("Table 6: Testing Results Summary"));

  // ═══════════════════════════════════════════
  // CONCLUSION
  // ═══════════════════════════════════════════
  content.push(heading("Conclusion"));
  content.push(body("The Design Thinking process has led NexTech Group from a broad societal challenge \u2014 youth unemployment in South Africa \u2014 to a focused, validated, and prototyped solution. Through rigorous empathise research, the team moved beyond the surface-level unemployment statistics to understand the human experience behind the numbers: young, capable individuals who are invisible to employers not because they lack skills, but because they lack the tools and guidance to present those skills effectively."));
  content.push(body("The define phase crystallised this understanding into a precise problem statement identifying the application and access gap as the core issue. The ideate phase explored five distinct solutions, ultimately selecting the AI Career Companion App as the most comprehensive and feasible approach to addressing all three dimensions of the problem."));
  content.push(body("The working prototype demonstrates that AI-powered career tools can meaningfully bridge the gap between capability and employment outcomes. The Resume Analyser provides the feedback that career counsellors offer but that is not available at scale. The Cover Letter Generator demystifies the process of writing professional application letters. And the AI Interview Coach provides the realistic practice environment that is otherwise completely inaccessible to the target demographic."));
  content.push(body("Most significantly, the testing phase validated the solution\u2019s real-world value. The endorsement from CAHAU representatives who sit on job interview boards confirms that the tool addresses a genuine and recognised gap in candidate preparation. Their statement that the AI interview coach would significantly help candidates prepare better and that it was particularly valuable for first-time job seekers provides authoritative validation from the very people who evaluate candidates in practice."));
  content.push(body("Looking forward, the NexTech Career App has the potential to scale beyond the initial prototype to serve young job seekers across South Africa. Future development could include partnerships with universities, technical and vocational education and training (TVET) colleges, and youth employment programmes to maximise the tool\u2019s reach and impact. The mobile-first, data-light architecture ensures that the solution remains accessible to its target audience as it grows."));

  // ═══════════════════════════════════════════
  // REFERENCES
  // ═══════════════════════════════════════════
  content.push(heading("References"));

  const refs = [
    "Statistics South Africa. (2024). Quarterly Labour Force Survey, Q1 2024. Pretoria: Stats SA.",
    "News24. (2024, February 15). Northern Cape youth unemployment exceeds national average. Retrieved from https://www.news24.com",
    "GroundUp. (2024, January 22). Graduates without jobs: The experience gap trap. Retrieved from https://www.groundup.org.za",
    "Sowetan. (2024, March 3). Young, qualified, and unemployed: The skills mismatch crisis. Retrieved from https://www.sowetanlive.co.za",
    "Department of Employment and Labour. (2024). Annual Report on Youth Employment Programmes. Pretoria: Government Printer.",
    "Brown, T. (2009). Change by Design: How Design Thinking Transforms Organizations and Inspires Innovation. New York: Harper Business.",
    "Stanford d.school. (2019). Design Thinking Bootleg. Stanford: Hasso Plattner Institute of Design.",
    "IDEO. (2015). The Field Guide to Human-Centered Design. San Francisco: IDEO.org.",
    "Mbeki, M. (2023). Youth unemployment in South Africa: Causes, consequences, and responses. Development Southern Africa, 40(2), 145\u2013162.",
    "World Bank. (2023). South Africa Economic Update: Youth Employment. Washington, DC: World Bank Group.",
  ];

  refs.forEach((ref, idx) => {
    content.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      indent: { left: 720, hanging: 720 },
      spacing: { line: 312, after: 60 },
      children: [new TextRun({ text: `[${idx + 1}]  ${ref}`, size: 22, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
    }));
  });

  return content;
}

// ──────────────────────────────────────────────
// 7. DOCUMENT ASSEMBLY
// ──────────────────────────────────────────────

function pageNumFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: { ascii: "Times New Roman" } }),
        ],
      }),
    ],
  });
}

async function main() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: { ascii: "Times New Roman", eastAsia: "SimSun" },
            size: 24,
            color: c(P.body),
          },
          paragraph: {
            spacing: { line: 312 },
          },
        },
        heading1: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.primary) },
          paragraph: { spacing: { before: 360, after: 160, line: 312 } },
        },
        heading2: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) },
          paragraph: { spacing: { before: 240, after: 120, line: 312 } },
        },
        heading3: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 24, bold: true, color: c(P.primary) },
          paragraph: { spacing: { before: 200, after: 100, line: 312 } },
        },
      },
    },
    sections: [
      // Section 1: Cover — no page number
      {
        properties: {
          page: { size: pgSize, margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 } },
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
        footers: { default: pageNumFooter() },
        children: buildFrontMatter(),
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
        footers: { default: pageNumFooter() },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "NexTech Career App \u2014 Design Thinking Assignment", size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
              }),
            ],
          }),
        },
        children: buildBody(),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = "/home/z/my-project/output/Design_Thinking_Project_Document.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document saved to ${outputPath}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error("Error generating document:", err);
  process.exit(1);
});
