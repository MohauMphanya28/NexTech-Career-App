const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  SectionType, TableOfContents, LevelFormat,
} = require("docx");
const fs = require("fs");

// ── Color Palette: ACADEMIC (R5 Clean White) ──
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

// ── No Borders Constant ──
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ── Page dimensions ──
const pgSize = { width: 11906, height: 16838 };
const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

// ── Helper: Safe text ──
function safeText(value, placeholder) {
  if (value === undefined || value === null || value === "" || String(value) === "NaN" || String(value) === "undefined") {
    return placeholder || "【Please fill in】";
  }
  return String(value);
}

// ── Helper: Body paragraph ──
function bodyPara(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 120 },
    ...opts,
    children: [
      new TextRun({
        text: safeText(text),
        size: 24,
        font: { ascii: "Times New Roman", eastAsia: "SimSun" },
        color: c(P.body),
      }),
    ],
  });
}

// ── Helper: Body paragraph with multiple runs ──
function bodyParaRuns(runs, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 120 },
    ...opts,
    children: runs,
  });
}

// ── Helper: Bold+Normal mixed paragraph ──
function bodyMixed(segments, opts = {}) {
  const runs = segments.map(seg => {
    if (typeof seg === "string") {
      return new TextRun({ text: safeText(seg), size: 24, font: { ascii: "Times New Roman", eastAsia: "SimSun" }, color: c(P.body) });
    }
    return new TextRun({
      text: safeText(seg.text),
      bold: !!seg.bold,
      italics: !!seg.italics,
      size: seg.size || 24,
      font: { ascii: "Times New Roman", eastAsia: "SimSun" },
      color: seg.color || c(P.body),
    });
  });
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 120 },
    ...opts,
    children: runs,
  });
}

// ── Helper: Heading 1 ──
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160, line: 312 },
    children: [
      new TextRun({
        text: safeText(text),
        bold: true,
        size: 32,
        font: { ascii: "Times New Roman", eastAsia: "SimHei" },
        color: c(P.primary),
      }),
    ],
  });
}

// ── Helper: Heading 2 ──
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120, line: 312 },
    children: [
      new TextRun({
        text: safeText(text),
        bold: true,
        size: 28,
        font: { ascii: "Times New Roman", eastAsia: "SimHei" },
        color: c(P.primary),
      }),
    ],
  });
}

// ── Helper: Heading 3 ──
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100, line: 312 },
    children: [
      new TextRun({
        text: safeText(text),
        bold: true,
        size: 24,
        font: { ascii: "Times New Roman", eastAsia: "SimHei" },
        color: c(P.primary),
      }),
    ],
  });
}

// ── Helper: Bullet item ──
function bulletItem(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { line: 312, after: 60 },
    children: [
      new TextRun({
        text: safeText(text),
        size: 24,
        font: { ascii: "Times New Roman", eastAsia: "SimSun" },
        color: c(P.body),
      }),
    ],
  });
}

// ── Helper: Bullet item with bold prefix ──
function bulletMixed(segments, level = 0) {
  const runs = segments.map(seg => {
    if (typeof seg === "string") {
      return new TextRun({ text: safeText(seg), size: 24, font: { ascii: "Times New Roman", eastAsia: "SimSun" }, color: c(P.body) });
    }
    return new TextRun({
      text: safeText(seg.text),
      bold: !!seg.bold,
      size: 24,
      font: { ascii: "Times New Roman", eastAsia: "SimSun" },
      color: c(P.body),
    });
  });
  return new Paragraph({
    bullet: { level },
    spacing: { line: 312, after: 60 },
    children: runs,
  });
}

// ── Helper: Three-line academic table ──
function academicTable(headers, rows, colWidths) {
  const totalW = colWidths || headers.map(() => Math.floor(100 / headers.length));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map((h, i) =>
          new TableCell({
            width: { size: totalW[i], type: WidthType.PERCENTAGE },
            borders: {
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              top: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: safeText(h), bold: true, size: 21, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
              }),
            ],
          })
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            cantSplit: true,
            children: row.map((cell, i) =>
              new TableCell({
                width: { size: totalW[i], type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                margins: { top: 60, bottom: 60, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: safeText(cell), size: 21, font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
                  }),
                ],
              })
            ),
          })
      ),
    ],
  });
}

// ── Helper: Page number footer (Arabic) ──
function arabicFooter() {
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

// ── Helper: Page number footer (Roman) ──
function romanFooter() {
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

// ── Helper: Table caption ──
function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 200, line: 312 },
    children: [
      new TextRun({ text: safeText(text), italics: true, size: 21, font: { ascii: "Times New Roman", eastAsia: "SimSun" }, color: c(P.secondary) }),
    ],
  });
}

// ── Helper: Empty spacer paragraph ──
function spacer(twips = 200) {
  return new Paragraph({ spacing: { before: twips }, children: [] });
}

// ── Build Cover (R5 Academic Clean White) ──
function buildCover() {
  const wrapperHeight = 16838;
  const metaRows = [
    ["Course:", "Technopreneurship (NTEC62110)"],
    ["Department:", "Department of Information and Communication Technology"],
    ["University:", "Sol Plaatje University"],
    ["Group:", "NexTech Solutions"],
    ["Members:", "Mohau Mphanya, Sive Mtengwana, Lesedi Ledwaba"],
    ["Examiner:", "Dr. Silas Verkijika"],
    ["Moderator:", "Mrs. Eva Mamabolo"],
    ["Date:", "June 2026"],
  ];

  const metaTable = new Table({
    width: { size: 65, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    borders: allNoBorders,
    rows: metaRows.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            borders: allNoBorders,
            margins: { top: 40, bottom: 40, left: 0, right: 120 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: label, size: 22, font: { ascii: "Times New Roman", eastAsia: "SimSun" }, color: c(P.cover.metaColor) })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            margins: { top: 40, bottom: 40, left: 120, right: 0 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: value, size: 22, font: { ascii: "Times New Roman", eastAsia: "SimSun" }, color: c(P.cover.titleColor) })],
              }),
            ],
          }),
        ],
      })
    ),
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [
      new TableRow({
        height: { value: wrapperHeight, rule: "exact" },
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: allNoBorders,
            verticalAlign: "top",
            margins: { left: 1200, right: 1200 },
            children: [
              // Top spacing
              new Paragraph({ spacing: { before: 3200 }, children: [] }),
              // Title
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200, line: 828, lineRule: "atLeast" },
                children: [
                  new TextRun({
                    text: "Design Thinking Project:",
                    bold: true,
                    size: 64,
                    font: { ascii: "Times New Roman", eastAsia: "SimHei" },
                    color: c(P.cover.titleColor),
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 400, line: 644, lineRule: "atLeast" },
                children: [
                  new TextRun({
                    text: "NexTech Career App",
                    bold: true,
                    size: 52,
                    font: { ascii: "Times New Roman", eastAsia: "SimHei" },
                    color: c(P.cover.titleColor),
                  }),
                ],
              }),
              // Accent line
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
                border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: c(P.accent), space: 12 } },
                indent: { left: 2160, right: 2160 },
                children: [],
              }),
              // Subtitle
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 600, line: 312 },
                children: [
                  new TextRun({
                    text: "Addressing Youth Unemployment in South Africa",
                    italics: true,
                    size: 26,
                    font: { ascii: "Times New Roman", eastAsia: "SimSun" },
                    color: c(P.cover.subtitleColor),
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 800, line: 312 },
                children: [
                  new TextRun({
                    text: "Through AI-Powered Career Support",
                    italics: true,
                    size: 26,
                    font: { ascii: "Times New Roman", eastAsia: "SimSun" },
                    color: c(P.cover.subtitleColor),
                  }),
                ],
              }),
              // Meta info table
              metaTable,
            ],
          }),
        ],
      }),
    ],
  });
}

// ── Build TOC Section ──
function buildTocSection() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 360 },
      children: [
        new TextRun({
          text: "Table of Contents",
          bold: true,
          size: 32,
          font: { ascii: "Times New Roman", eastAsia: "SimHei" },
          color: c(P.primary),
        }),
      ],
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
          italics: true,
          size: 18,
          color: "888888",
          font: { ascii: "Times New Roman" },
        }),
        new PageBreak(),
      ],
    }),
  ];
}

// ── SECTION 1: Introduction ──
function buildIntroduction() {
  return [
    h1("1. Introduction"),
    bodyPara("South Africa faces one of the most pressing youth unemployment crises in the world. According to Statistics South Africa (2024), the youth unemployment rate among individuals aged 15 to 34 stands at a staggering 46.1%, with approximately 60% of those in the 15 to 24 age group unable to find work. This crisis is not merely a statistical concern; it represents a profound social and economic challenge that threatens the stability and future prosperity of the nation. The consequences of sustained youth unemployment extend beyond individual hardship, contributing to increased poverty, social unrest, and a persistent cycle of economic exclusion that disproportionately affects previously disadvantaged communities."),
    bodyPara("The root causes of this crisis are multifaceted. While the limited availability of jobs is a significant factor, a critical and often overlooked dimension is the skills mismatch that plagues the South African labour market. The World Bank (2024) estimates that there are over 118,000 unfilled positions in the technology sector alone, suggesting that the problem is not solely about job scarcity but also about the alignment between available skills and market demands. Furthermore, many young South Africans who possess relevant qualifications struggle to navigate the increasingly digital and competitive hiring processes. The transition from qualified candidate to successful applicant remains a largely unsupported journey, characterised by complex online application systems, the need for ATS-optimised resumes, and the challenge of presenting oneself effectively in interviews."),
    bodyPara("Technology-driven solutions offer a promising pathway to address this access and guidance gap. Mobile penetration in South Africa is remarkably high, with the majority of young people accessing the internet primarily through smartphones. This presents an opportunity to deliver career support tools directly to the devices that youth already use daily. Artificial intelligence, in particular, can democratise access to personalised career guidance that was previously available only to those who could afford professional career counselling services."),
    bodyPara("This document presents the NexTech Career App, a Design Thinking project developed as part of the Technopreneurship (NTEC62110) course at Sol Plaatje University. The project follows the five stages of the Design Thinking methodology: Empathise, Define, Ideate, Prototype, and Test. Through rigorous user research, iterative design, and technological innovation, the NexTech Career App aims to bridge the gap between qualified young South African job seekers and successful employment outcomes by providing AI-powered tools for resume building, cover letter generation, and interview preparation."),
    bodyPara("The purpose of this document is to provide a comprehensive account of the Design Thinking journey undertaken by NexTech Solutions, detailing the research findings, problem definition, ideation process, prototype development, and testing outcomes that informed the creation of the NexTech Career App. Each section demonstrates how user-centred design principles were applied to develop a solution that is not only technologically innovative but also deeply rooted in the realities and needs of South African youth."),
  ];
}

// ── SECTION 2: Empathise ──
function buildEmpathise() {
  return [
    h1("2. Empathise"),
    bodyPara("The Empathise phase is the foundation of the Design Thinking process, requiring deep engagement with the target users to understand their experiences, challenges, and aspirations. For the NexTech Career App project, this phase involved extensive research to develop a thorough understanding of the youth unemployment landscape in South Africa and the specific barriers that young job seekers face when navigating the employment process."),

    h2("2.1 Research Methodology"),
    bodyPara("A mixed-methods research approach was employed to gather comprehensive insights from multiple sources. The research methodology included the following components:"),
    bulletMixed([
      { text: "Semi-structured interviews: ", bold: true },
      "In-depth interviews were conducted with 15 community members aged 18 to 34 from the Kimberley area and surrounding communities in the Northern Cape. Interviewees included recent matriculants, university graduates, and individuals who had been actively seeking employment for varying periods. The interviews focused on their job search experiences, the challenges they encountered, and the tools or support they wished were available.",
    ]),
    bulletMixed([
      { text: "Local news analysis: ", bold: true },
      "A systematic review of local and national news coverage related to youth unemployment was conducted, analysing articles from sources such as News24, Mail & Guardian, and Sowetan Live over the preceding 12 months. This provided contextual understanding of the broader socioeconomic factors and policy discussions surrounding youth employment.",
    ]),
    bulletMixed([
      { text: "Social media discussions: ", bold: true },
      "Analysis of discussions on platforms including Twitter (X), Facebook groups, and Reddit communities where South African youth share job search experiences, frustrations, and advice. This provided unfiltered insights into the real-time experiences and sentiments of the target user group.",
    ]),
    bulletMixed([
      { text: "Secondary data review: ", bold: true },
      "Review of published reports from Statistics South Africa, the World Bank, UNDP, and the MTN Foundation to establish a quantitative baseline for the research.",
    ]),

    h2("2.2 Key Findings from User Research"),
    bodyPara("The research revealed a complex interplay of systemic, technological, and personal barriers that young South African job seekers face. The following key findings emerged from the analysis:"),

    h3("2.2.1 Unemployment Statistics"),
    bodyPara("The quantitative data paints a stark picture of the employment landscape for young South Africans:"),
    bulletItem("46.1% youth unemployment rate among the 15 to 34 age group (Statistics SA, 2024)"),
    bulletItem("Approximately 60% unemployment rate among 15 to 24 year olds, one of the highest globally"),
    bulletItem("Only 4.8% of matric graduates find employment within one year of graduating"),
    bulletItem("Over 118,000 unfilled technology sector positions, indicating a severe skills mismatch"),
    bulletItem("The average duration of unemployment for youth exceeds 12 months, with many experiencing prolonged periods of economic inactivity"),

    h3("2.2.2 Digital Access Barriers"),
    bodyPara("Despite high mobile phone penetration, significant digital access barriers persist:"),
    bulletItem("The majority of South African youth access the internet exclusively through mobile devices, making desktop-oriented job platforms difficult to use"),
    bulletItem("High data costs severely limit the amount of time young people can spend searching for jobs online, with many respondents reporting that they could only afford to search for jobs once or twice per week"),
    bulletItem("Existing job platforms such as Indeed, LinkedIn, and CareerJunction are designed for desktop-first experiences and are data-intensive, making them inaccessible to the target user group"),
    bulletItem("Complex registration processes and navigation structures on existing platforms create additional friction for first-time users"),

    h3("2.2.3 Application Process Challenges"),
    bodyPara("The research identified several critical gaps in the job application process itself:"),
    bulletItem("Lack of digital skills for creating professional, ATS-optimised resumes and cover letters that meet modern hiring standards"),
    bulletItem("No guidance during the application process, with many respondents expressing confusion about what employers expect in applications"),
    bulletItem("Inability to tailor applications to specific job requirements, resulting in generic submissions that fail to stand out"),
    bulletItem("Limited understanding of Applicant Tracking Systems (ATS) and how they filter resumes, leading to qualified candidates being automatically rejected"),
    bulletItem("Absence of interview preparation resources, with many respondents reporting that they had never participated in a formal interview before"),

    h2("2.3 User Personas"),
    bodyPara("Based on the research findings, three distinct user personas were developed to represent the diversity of the target user group:"),

    // Persona 1
    h3("Persona 1: Thabo Molefe"),
    new Paragraph({
      spacing: { after: 60, line: 312 },
      children: [new TextRun({ text: "Age: 22  |  Location: Kimberley, Northern Cape  |  Education: Matric Certificate  |  Employment: Unemployed for 8 months", italics: true, size: 22, font: { ascii: "Times New Roman", eastAsia: "SimSun" }, color: c(P.secondary) })],
    }),
    bodyPara("Thabo completed his matric with good results but has been unable to find employment since graduating. He accesses the internet exclusively through his smartphone and relies on weekly data bundles that cost R30 for 1GB. He has applied for numerous positions but rarely receives responses. He suspects his resume is not professional enough but cannot afford career counselling services. He feels overwhelmed by the complexity of online application systems and often abandons applications midway through the process. His primary need is for a simple, data-light tool that can help him create professional application materials without requiring extensive digital literacy."),
    spacer(100),

    // Persona 2
    h3("Persona 2: Nomsa Dlamini"),
    new Paragraph({
      spacing: { after: 60, line: 312 },
      children: [new TextRun({ text: "Age: 26  |  Location: Galeshewe, Northern Cape  |  Education: Diploma in IT  |  Employment: Part-time retail worker", italics: true, size: 22, font: { ascii: "Times New Roman", eastAsia: "SimSun" }, color: c(P.secondary) })],
    }),
    bodyPara("Nomsa holds a diploma in Information Technology but works part-time in retail because she has been unable to secure a position in her field. She has a laptop but limited access to WiFi, using it primarily at the local library. She has created a resume but is unsure whether it meets professional standards. She has had three interviews but was not offered positions, and she suspects her interview performance is the weak link. She needs interview coaching and a way to optimise her resume for ATS systems. Her frustration is compounded by the gap between her qualifications and her current employment situation."),
    spacer(100),

    // Persona 3
    h3("Persona 3: Sipho Ndaba"),
    new Paragraph({
      spacing: { after: 60, line: 312 },
      children: [new TextRun({ text: "Age: 19  |  Location: Ritchie, Northern Cape  |  Education: Grade 11 (incomplete)  |  Employment: Never employed", italics: true, size: 22, font: { ascii: "Times New Roman", eastAsia: "SimSun" }, color: c(P.secondary) })],
    }),
    bodyPara("Sipho dropped out of school in Grade 11 due to family financial constraints. He has basic digital literacy from using his smartphone for social media but has never created a professional document. He is interested in entry-level positions and learnership programmes but does not know where to start. He finds existing job platforms intimidating and confusing. He needs a guided, step-by-step approach that does not assume prior knowledge of professional norms or application processes. His primary barrier is not a lack of motivation but a lack of guidance and accessible tools."),

    h2("2.4 Empathy Map Findings"),
    bodyPara("An empathy map was constructed based on the research data to synthesise the key insights about the target users across four dimensions:"),
    academicTable(
      ["Dimension", "Key Insights"],
      [
        ["Says", "\"I don't know what employers want to see in a resume.\" / \"I apply for jobs but never hear back.\" / \"Interviews terrify me because I don't know what to expect.\" / \"Data is too expensive to search for jobs every day.\""],
        ["Thinks", "\"There must be something wrong with my application.\" / \"Other people seem to know how the system works.\" / \"I should have learned this at school or university.\" / \"Maybe I am just not good enough.\""],
        ["Does", "Spends limited data browsing job boards / Copies resume templates from the internet without customisation / Avoids applying for positions that require cover letters / Abandons complex online application forms"],
        ["Feels", "Frustrated by lack of feedback / Overwhelmed by the complexity of the job search process / Anxious about interviews / Hopeless after repeated rejections / Motivated when receiving any positive signal"],
      ],
      [25, 75]
    ),
    tableCaption("Table 1: Empathy Map Summary for Target User Group"),

    h2("2.5 Research Documentation"),
    bodyPara("The following sources were consulted during the Empathise phase to ensure the research was grounded in credible data and diverse perspectives:"),
    bulletItem("Statistics South Africa (2024). Quarterly Labour Force Survey, Quarter 4 2024."),
    bulletItem("World Bank (2024). South Africa Economic Update: Youth Employment."),
    bulletItem("UNDP (2023). Youth Employment in South Africa: Challenges and Opportunities."),
    bulletItem("MTN Foundation (2024). Digital Skills Programme Report."),
    bulletItem("Nielsen (2023). South African Digital Landscape Report."),
    bulletItem("Interviews with 15 community members in the Kimberley and Northern Cape region."),
    bulletItem("Analysis of social media discussions on Twitter (X), Facebook, and Reddit (2024-2025)."),
    bulletItem("News articles from News24, Mail & Guardian, and Sowetan Live (2024-2025)."),
  ];
}

// ── SECTION 3: Define ──
function buildDefine() {
  return [
    h1("3. Define"),
    bodyPara("The Define phase synthesises the insights gathered during the Empathise phase into a clear and actionable problem statement. This phase is critical because it determines the direction of all subsequent design decisions. A well-defined problem ensures that the solution addresses the actual needs of users rather than assumed or perceived needs."),

    h2("3.1 Problem Statement"),
    bodyPara("Young South African job seekers aged 15 to 34 face a critical access and guidance gap in the job application process. Despite having qualifications and skills, they struggle to navigate modern digital hiring systems, create ATS-optimised resumes, write compelling cover letters, and prepare for interviews. Current solutions focus on skills training rather than practical application support, leaving the transition from qualified candidate to successful applicant unsupported."),
    bodyPara("This problem statement was refined through multiple iterations based on the research findings. The key insight that emerged is that the problem is not solely about a lack of jobs or a lack of skills, but rather about the gap between possessing qualifications and being able to effectively present oneself as a competitive candidate in the modern hiring landscape. This distinction is crucial because it points to a different category of solution, one focused on application support rather than skills development."),

    h2("3.2 Root Cause Analysis"),
    bodyPara("A 5 Whys analysis was conducted to identify the root causes underlying the problem:"),

    academicTable(
      ["Level", "Question", "Answer"],
      [
        ["1", "Why are young South Africans struggling to find employment?", "They submit applications that fail to pass through ATS systems and do not stand out to employers."],
        ["2", "Why do their applications fail to pass ATS systems?", "Their resumes are not formatted or keyword-optimised for automated screening."],
        ["3", "Why are their resumes not optimised for ATS?", "They lack knowledge of ATS requirements and do not have access to tools that help create ATS-friendly documents."],
        ["4", "Why do they lack this knowledge and access to tools?", "There are no affordable, accessible, and locally relevant career support tools designed for the South African context."],
        ["5", "Why are there no such tools available?", "Existing solutions are designed for desktop users with reliable internet, are not optimised for mobile-first access, and do not address the specific needs and constraints of South African youth."],
      ],
      [8, 42, 50]
    ),
    tableCaption("Table 2: 5 Whys Root Cause Analysis"),

    bodyPara("The root cause analysis reveals that the fundamental issue is a market gap: there is no solution that simultaneously addresses the technical requirements of modern hiring systems (ATS optimisation, professional formatting) and the practical constraints of the target user group (mobile-only access, limited data, need for guidance). This insight directly informed the ideation phase, as any viable solution must bridge both of these dimensions."),

    h2("3.3 Impact on the Community"),
    bodyPara("The identified problem has far-reaching consequences for South African communities. Beyond the immediate economic impact of unemployment, the inability to navigate the job application process contributes to:"),
    bulletItem("Perpetuation of intergenerational poverty, as young people who cannot secure employment are unable to break the cycle of economic disadvantage."),
    bulletItem("Erosion of self-confidence and mental health deterioration among youth who experience repeated application failures without understanding why."),
    bulletItem("Widening inequality between those who have access to professional career support (typically from privileged backgrounds) and those who do not."),
    bulletItem("Underutilisation of human capital, as qualified and capable individuals remain unemployed because they cannot effectively present their skills and qualifications."),
    bulletItem("Social instability resulting from high levels of youth unemployment, including increased crime rates and social unrest."),
    bodyPara("Addressing the access and guidance gap has the potential to create a multiplier effect: when young people can successfully navigate the application process, they secure employment, contribute to the economy, and serve as role models for others in their communities. The impact extends beyond individual employment outcomes to community-level economic empowerment."),

    h2("3.4 How Might We Statements"),
    bodyPara("To reframe the problem in terms of opportunity, the following How Might We (HMW) statements were developed:"),
    bulletMixed([
      { text: "HMW 1: ", bold: true },
      "How might we create a mobile-first career support tool that young South Africans can use with limited data and basic digital literacy?",
    ]),
    bulletMixed([
      { text: "HMW 2: ", bold: true },
      "How might we leverage AI to provide personalised resume and cover letter assistance that meets ATS requirements?",
    ]),
    bulletMixed([
      { text: "HMW 3: ", bold: true },
      "How might we make interview preparation accessible and less intimidating for first-time job seekers?",
    ]),
    bulletMixed([
      { text: "HMW 4: ", bold: true },
      "How might we bridge the gap between possessing qualifications and effectively presenting them in the modern hiring process?",
    ]),
    bodyPara("These HMW statements served as guiding questions throughout the Ideate phase, ensuring that all proposed solutions remained focused on the defined problem while encouraging creative and divergent thinking."),
  ];
}

// ── SECTION 4: Ideate ──
function buildIdeate() {
  return [
    h1("4. Ideate"),
    bodyPara("The Ideate phase is where divergent thinking is applied to generate a wide range of potential solutions before converging on the most promising idea. This phase employed structured brainstorming techniques to ensure both creativity and rigour in the solution generation process."),

    h2("4.1 Brainstorming Methodology"),
    bodyPara("The brainstorming process followed a structured approach designed to maximise the quality and diversity of ideas generated:"),
    bulletMixed([
      { text: "Divergent phase: ", bold: true },
      "Each team member independently generated ideas without evaluation, using the HMW statements as prompts. This ensured that ideas were not constrained by premature judgement or groupthink.",
    ]),
    bulletMixed([
      { text: "Convergent phase: ", bold: true },
      "All generated ideas were pooled, discussed, and evaluated against a set of criteria derived from the research findings and problem statement. Each idea was assessed on feasibility, desirability, and viability.",
    ]),
    bulletMixed([
      { text: "Selection criteria: ", bold: true },
      "The criteria used for evaluation included: mobile-first accessibility, data efficiency, scalability, cost-effectiveness, alignment with user needs, and technological feasibility within the project timeline.",
    ]),

    h2("4.2 Solution Ideas Generated"),
    bodyPara("Five distinct solution ideas were generated and evaluated during the ideation process. Each idea is described below along with the rationale for its selection or rejection:"),

    h3("Idea 1: AI-Powered Career Companion App (SELECTED)"),
    bodyPara("A mobile-first application that provides AI-powered tools for resume building, cover letter generation, and interview coaching. The app would use artificial intelligence to provide personalised guidance tailored to the South African job market, with a focus on data efficiency and intuitive user experience. Key features include a step-by-step guided resume builder with ATS optimisation, an AI cover letter generator that tailors content to specific job requirements, and an interactive interview coach with simulated mock interviews. This solution directly addresses all four HMW statements and is designed to work within the constraints identified during the Empathise phase."),

    h3("Idea 2: Digital Career Kiosks"),
    bodyPara("Physical kiosks installed in community centres, libraries, and schools that provide access to career tools including resume templates, job listings, and application guidance. The kiosks would feature touchscreens and printers, allowing users to create and print professional documents on-site. This idea was discarded due to the high infrastructure cost of deploying and maintaining physical kiosks across multiple locations, the limited geographic reach compared to a mobile application, and the significant maintenance burden including hardware repairs, software updates, and consumable costs such as printer paper and ink."),

    h3("Idea 3: Peer Mentorship Platform"),
    bodyPara("A digital platform connecting experienced professionals with young job seekers for one-on-one mentoring relationships. Mentors would provide guidance on career planning, resume writing, and interview preparation through scheduled video or text-based sessions. This idea was discarded because it is difficult to scale, as the model depends on a sufficient supply of willing and qualified mentors. There is also a dependency on volunteer availability, which creates inconsistent user experiences, and the quality of mentoring would vary significantly depending on the individual mentor, making it challenging to ensure a consistent standard of support."),

    h3("Idea 4: WhatsApp Career Bot"),
    bodyPara("A career guidance chatbot delivered through WhatsApp, leveraging the platform's widespread adoption in South Africa. Users would interact with the bot through text messages to receive career advice, job recommendations, and basic resume tips. This idea was discarded because WhatsApp has limited functionality for document creation, as the platform cannot generate or format professional resumes and cover letters. The format also imposes poor formatting constraints that limit the ability to present information in a structured and visually appealing manner. Furthermore, the bot cannot handle complex interactions such as interview coaching, which requires real-time voice or video interaction."),

    h3("Idea 5: Community Career Workshops"),
    bodyPara("In-person workshops conducted at schools, community centres, and youth organisations, covering topics such as resume writing, interview skills, and job search strategies. Workshops would be facilitated by trained career counsellors and would include hands-on activities. This idea was discarded because of the limited reach, as workshops can only serve the number of people who can physically attend at a given time and location. The model requires physical attendance, which excludes those in remote areas or with mobility constraints. It is also not scalable, as each workshop requires a trained facilitator, venue, and materials, making it costly to expand. The high facilitator costs present an ongoing financial burden that would be difficult to sustain."),

    h2("4.3 Comparison of Ideas"),
    bodyPara("The five solution ideas were systematically compared against the selection criteria derived from the research findings:"),

    academicTable(
      ["Criteria", "AI Career App", "Digital Kiosks", "Peer Mentorship", "WhatsApp Bot", "Community Workshops"],
      [
        ["Mobile-first", "High", "Low", "Medium", "High", "None"],
        ["Data efficiency", "High", "N/A", "Medium", "High", "N/A"],
        ["Scalability", "High", "Low", "Low", "Medium", "Low"],
        ["Cost-effectiveness", "High", "Low", "Medium", "High", "Low"],
        ["User needs alignment", "High", "Medium", "Medium", "Low", "Medium"],
        ["Tech feasibility", "High", "Medium", "Medium", "Medium", "High"],
        ["Document creation", "High", "Medium", "Low", "Low", "Medium"],
        ["Interview coaching", "High", "Low", "High", "Low", "Medium"],
        ["Overall Score", "High", "Low", "Medium", "Low-Medium", "Low"],
      ],
      [18, 14, 14, 14, 14, 14]
    ),
    tableCaption("Table 3: Comparative Evaluation of Solution Ideas"),

    h2("4.4 Rationale for Selected Solution"),
    bodyPara("The AI-Powered Career Companion App was selected as the optimal solution based on the following rationale:"),
    bodyPara("First, it directly addresses all four HMW statements, providing a comprehensive solution to the defined problem rather than addressing only one aspect. Second, it is designed for mobile-first access with data efficiency as a core architectural principle, directly responding to the primary access barrier identified in the research. Third, AI technology enables personalised guidance at scale, meaning that the quality of support does not depend on human availability and can be delivered consistently to any number of users simultaneously. Fourth, the solution is technically feasible within the project timeline using available technologies such as Next.js, AI language models, and cloud infrastructure. Fifth, the solution has strong scalability potential, as additional features and improvements can be deployed without the logistical constraints associated with physical infrastructure or human facilitators."),
    bodyPara("The selected solution also demonstrates the strongest alignment with the root cause identified in the 5 Whys analysis: the absence of an affordable, accessible, and locally relevant career support tool designed for the South African context. By combining mobile-first design, AI-powered personalisation, and data-light architecture, the NexTech Career App addresses the root cause rather than merely treating symptoms."),
  ];
}

// ── SECTION 5: Prototype ──
function buildPrototype() {
  return [
    h1("5. Prototype"),
    bodyPara("The Prototype phase involved translating the selected solution concept into a functional prototype that could be tested with real users. This phase focused on building a working application that demonstrates the core features and user experience envisioned for the NexTech Career App, while also establishing the technical architecture that would support future development and scaling."),

    h2("5.1 Overview of the NexTech Career App"),
    bodyPara("The NexTech Career App is a mobile-first web application designed to provide AI-powered career support to young South African job seekers. The prototype implements the five core features identified during ideation, with a focus on delivering an intuitive, data-efficient, and culturally relevant user experience. The application is built as a progressive web application (PWA), enabling it to work seamlessly on mobile devices while also being accessible through desktop browsers."),

    h2("5.2 Technology Stack"),
    bodyPara("The prototype was developed using a modern, robust technology stack selected for its performance, developer productivity, and alignment with industry best practices:"),

    academicTable(
      ["Component", "Technology", "Rationale"],
      [
        ["Frontend Framework", "Next.js 16 with App Router", "Server-side rendering for performance, excellent mobile support, and rapid development"],
        ["Programming Language", "TypeScript 5", "Type safety reducing bugs, improved code maintainability, and better developer experience"],
        ["Styling", "Tailwind CSS 4 with shadcn/ui", "Utility-first CSS enabling rapid UI development with consistent design language"],
        ["Database", "Prisma ORM with SQLite", "Lightweight, serverless-compatible database with type-safe queries"],
        ["AI Integration", "z-ai-web-dev-sdk (LLM)", "Powerful language model for resume analysis, cover letter generation, and interview coaching"],
        ["State Management", "Zustand + TanStack Query", "Lightweight client state with efficient server state caching"],
        ["Authentication", "NextAuth.js v4", "Secure, flexible authentication supporting multiple providers"],
      ],
      [22, 32, 46]
    ),
    tableCaption("Table 4: Technology Stack Overview"),

    h2("5.3 Core Features"),

    h3("5.3.1 Resume Builder"),
    bodyPara("The Resume Builder provides a step-by-step guided experience for creating professional, ATS-optimised resumes. Users are walked through each section of the resume (personal information, education, work experience, skills, and references) with clear instructions and AI-powered suggestions at each step. The builder includes industry-specific templates designed for the South African job market, with automatic formatting and layout optimisation to ensure that the final document meets professional standards. Key capabilities include:"),
    bulletItem("Step-by-step wizard interface that guides users through each resume section"),
    bulletItem("AI-powered content suggestions based on the job target and industry"),
    bulletItem("ATS optimisation checks that analyse keyword density, formatting, and structure"),
    bulletItem("Industry-specific templates tailored to the South African job market"),
    bulletItem("Real-time preview of the resume as it is being built"),
    bulletItem("Export to PDF with professional formatting"),

    h3("5.3.2 Resume Analyzer"),
    bodyPara("The Resume Analyzer allows users to upload their existing resumes for AI-driven analysis and improvement. The system provides a comprehensive evaluation that includes an overall quality score, ATS compatibility rating, and detailed identification of strengths and weaknesses. Based on the analysis, the system generates an improved version of the resume with specific enhancements. Key capabilities include:"),
    bulletItem("Upload and parsing of existing resume documents"),
    bulletItem("Overall quality scoring on a scale of 0 to 100"),
    bulletItem("ATS compatibility analysis with specific recommendations for improvement"),
    bulletItem("Strengths and weaknesses identification across content, formatting, and keyword optimisation"),
    bulletItem("AI-generated improved resume with tracked changes"),
    bulletItem("Seamless progression to cover letter generation based on resume content"),

    h3("5.3.3 Cover Letter Generator"),
    bodyPara("The Cover Letter Generator creates tailored, professional cover letters that match the requirements of specific job postings. Users input the job description and their key qualifications, and the AI generates a customised cover letter that highlights relevant skills and experiences. The generator supports multiple tone options (professional, enthusiastic, and concise) and ensures that each cover letter is unique and aligned with the target position. Key capabilities include:"),
    bulletItem("AI-powered content generation based on job requirements and user qualifications"),
    bulletItem("Multiple tone options: professional, enthusiastic, and concise"),
    bulletItem("Automatic matching of applicant skills to job requirements"),
    bulletItem("South African-specific language and formatting conventions"),
    bulletItem("Edit and customise the generated letter before exporting"),

    h3("5.3.4 AI Interview Coach"),
    bodyPara("The AI Interview Coach provides simulated mock interviews with voice interaction, enabling users to practice their interview skills in a realistic but low-pressure environment. The coach asks role-specific questions, evaluates responses in real-time, and provides detailed feedback on relevance, clarity, and confidence. The system is designed to simulate the actual interview experience as closely as possible, helping users build confidence and improve their performance. Key capabilities include:"),
    bulletItem("Simulated mock interviews with voice-based AI interaction"),
    bulletItem("Role-specific and industry-specific question generation"),
    bulletItem("Real-time response evaluation with scoring on relevance, clarity, and confidence"),
    bulletItem("Detailed post-interview feedback with specific improvement suggestions"),
    bulletItem("Career context awareness, incorporating the user's resume and cover letter data"),
    bulletItem("Progressive difficulty levels from basic to advanced interview scenarios"),

    h3("5.3.5 Career Dashboard"),
    bodyPara("The Career Dashboard serves as the central hub for the application, providing users with an overview of their progress, document management, and personalised recommendations. The dashboard is designed to motivate users by visualising their career journey and highlighting next steps. Key capabilities include:"),
    bulletItem("Progress tracking across all career preparation activities"),
    bulletItem("Centralised document management for resumes, cover letters, and interview records"),
    bulletItem("Personalised career recommendations based on user profile and activity"),
    bulletItem("Quick-action cards for easy access to all features"),
    bulletItem("Visual progress indicators and achievement badges"),

    h2("5.4 User Flow"),
    bodyPara("The primary user flow of the NexTech Career App is designed to guide users through a logical progression of career preparation activities, with seamless transitions between features:"),
    bodyPara("The user journey begins with a streamlined onboarding process where the user creates an account and provides basic career information. Upon completing onboarding, the user is presented with the Career Dashboard, which serves as the central navigation hub. From the dashboard, the user can access any of the core features. The recommended flow is: Resume Builder (or Resume Analyzer for existing resumes) then Cover Letter Generator then AI Interview Coach. Each feature completion provides a clear call-to-action directing the user to the next logical step. The Dashboard tracks overall progress and provides personalised recommendations for next actions based on the user's current state."),

    h2("5.5 Mobile-First Design Approach"),
    bodyPara("The application was designed with a mobile-first philosophy, recognising that the majority of the target user group accesses the internet primarily through smartphones. This approach influenced every aspect of the design:"),
    bulletItem("Responsive layouts that prioritise mobile screen sizes, with progressive enhancement for larger screens"),
    bulletItem("Touch-friendly interface elements with minimum 44px touch targets for all interactive components"),
    bulletItem("Simplified navigation using a bottom tab bar for easy thumb access on mobile devices"),
    bulletItem("Vertical scrolling as the primary navigation pattern, avoiding horizontal scrolling entirely"),
    bulletItem("Minimal use of large images and media to reduce data consumption"),
    bulletItem("Offline-capable features using service workers to enable use without continuous internet connectivity"),

    h2("5.6 Data-Light Architecture"),
    bodyPara("Given the high cost of mobile data in South Africa, the application was architected to minimise data consumption:"),
    bulletItem("Server-side rendering (SSR) via Next.js reduces the amount of JavaScript that must be downloaded to the client"),
    bulletItem("Compressed API responses using efficient data formats"),
    bulletItem("Lazy loading of non-critical resources, ensuring that only essential content is loaded initially"),
    bulletItem("Client-side caching of frequently accessed data to reduce repeated network requests"),
    bulletItem("Progressive loading of AI-generated content, displaying partial results as they become available"),

    h2("5.7 Wireframes Description"),
    bodyPara("The following key screens were designed during the prototyping phase, with wireframes created to visualise the user experience:"),
    bulletMixed([
      { text: "Onboarding Screen: ", bold: true },
      "A multi-step welcome flow with clean, card-based layout. Each step focuses on a single piece of information (name, career goal, education level) with a progress indicator at the top. The design uses large, friendly typography and minimal visual elements to reduce cognitive load.",
    ]),
    bulletMixed([
      { text: "Dashboard Screen: ", bold: true },
      "Features a personalised greeting at the top with time-of-day awareness, followed by a visual progress bar showing career preparation completeness. Quick-action cards provide one-tap access to each core feature, with colour-coded icons and brief descriptions. The document history section shows recently created or edited documents.",
    ]),
    bulletMixed([
      { text: "Resume Builder Screen: ", bold: true },
      "A step-by-step wizard interface with a prominent progress indicator. Each step displays a form for one resume section, with AI suggestion chips that users can tap to insert recommended content. A floating preview button allows users to see their resume as it develops. The final step shows a full preview with export options.",
    ]),
    bulletMixed([
      { text: "Interview Coach Screen: ", bold: true },
      "A conversational interface with a large microphone button for voice input. The AI interviewer's questions appear as chat bubbles, and the user's responses are displayed with real-time scoring indicators. After the interview, a detailed results screen shows scores for relevance, clarity, and confidence with specific feedback for each response.",
    ]),
    bulletMixed([
      { text: "Cover Letter Screen: ", bold: true },
      "A two-panel layout with the job description input on the left and the generated cover letter preview on the right. Tone selection buttons at the top allow users to switch between professional, enthusiastic, and concise styles. The generated letter can be edited directly in the preview panel before export.",
    ]),
  ];
}

// ── SECTION 6: Test ──
function buildTest() {
  return [
    h1("6. Test"),
    bodyPara("The Test phase involved putting the prototype in the hands of real users to evaluate its effectiveness, identify usability issues, and gather feedback for improvement. This phase was essential for validating whether the solution actually addressed the needs identified during the Empathise phase and for uncovering issues that were not anticipated during design and development."),

    h2("6.1 Testing Methodology"),
    bodyPara("A combination of testing approaches was employed to gather diverse and comprehensive feedback:"),
    bulletMixed([
      { text: "Community user testing: ", bold: true },
      "The prototype was tested with 10 community members from the target demographic (aged 18 to 34, primarily mobile internet users) in the Kimberley area. Participants were asked to complete specific tasks (create a resume, generate a cover letter, complete a mock interview) while thinking aloud, and their interactions were observed and documented.",
    ]),
    bulletMixed([
      { text: "Peer testing: ", bold: true },
      "Friends and family members within the target age group were invited to use the application and provide informal feedback on their experience.",
    ]),
    bulletMixed([
      { text: "Industry professional feedback: ", bold: true },
      "Representatives from CAHAU (Central Association of Higher Administrative Units) who sit on job interview boards were consulted for expert evaluation of the application's outputs and utility.",
    ]),
    bulletMixed([
      { text: "Usability metrics: ", bold: true },
      "Task completion rates, time on task, error rates, and System Usability Scale (SUS) scores were collected to provide quantitative measures of usability.",
    ]),

    h2("6.2 Key Testing Findings"),

    h3("6.2.1 Positive Findings"),
    bodyPara("The testing revealed several areas of strong performance:"),
    bulletMixed([
      { text: "Resume Builder: ", bold: true },
      "Users found the resume builder intuitive and easy to use. The step-by-step guided approach was particularly appreciated by users with limited digital literacy, who reported that it removed the intimidation factor of creating a professional document from scratch. The AI suggestion feature was rated as highly valuable, with several users noting that it helped them articulate their skills and experiences more effectively than they could have on their own.",
    ]),
    bulletMixed([
      { text: "AI Interview Coach: ", bold: true },
      "The AI interview coach was rated as the most impressive feature by the majority of testers. Users particularly valued the ability to practice in a low-pressure environment and receive immediate, specific feedback on their responses. Several users reported that the feature helped them understand what interviewers are looking for and gave them confidence to approach real interviews.",
    ]),
    bulletMixed([
      { text: "CAHAU Representatives Feedback: ", bold: true },
      "Representatives from CAHAU who sit on job interview boards were consulted and they raved about the system, noting that it addresses the exact gaps they see in candidates, particularly the lack of ATS-optimised resumes and poor interview preparation. They indicated that candidates who used tools like this would have a significant advantage in real interview processes. This endorsement from industry professionals provided strong validation of the solution's relevance and potential impact.",
    ]),
    bulletMixed([
      { text: "Mobile Responsiveness: ", bold: true },
      "Mobile responsiveness was praised across all testing groups. Users appreciated that the application worked well on their smartphones without requiring pinching, zooming, or horizontal scrolling. The bottom navigation bar was identified as particularly convenient for one-handed use.",
    ]),

    h3("6.2.2 Areas for Improvement"),
    bodyPara("The testing also identified several areas where the application could be improved:"),
    bulletMixed([
      { text: "South African-specific templates: ", bold: true },
      "Users requested more South African-specific templates and examples, noting that the initial templates followed international conventions that did not fully align with local expectations. Specifically, users wanted templates that reflected South African CV conventions, such as the inclusion of ID numbers and references sections that are commonly expected by local employers.",
    ]),
    bulletMixed([
      { text: "Onboarding length: ", bold: true },
      "Some users found the initial onboarding process too lengthy, with too many steps before they could access the main features. While the onboarding information was recognised as valuable, users suggested that it could be streamlined or made optional to reduce the barrier to first use.",
    ]),
    bulletMixed([
      { text: "Cover letter tone variety: ", bold: true },
      "The cover letter generator needed more tone variety, as the initial implementation offered only two tone options. Users wanted a wider range of tones including formal academic, creative, and culturally specific options that better reflect the diversity of South African workplace cultures.",
    ]),
    bulletMixed([
      { text: "Interview coach context awareness: ", bold: true },
      "While the interview coach was well-received, some users noted that the questions were sometimes too generic and did not sufficiently incorporate the context of their specific career goals, qualifications, and industry. They wanted the coach to ask more targeted questions based on their resume and cover letter content.",
    ]),

    h2("6.3 Changes Made Based on Feedback"),
    bodyPara("Based on the testing findings, the following changes were implemented in the prototype:"),
    bulletMixed([
      { text: "Added South African-specific resume templates: ", bold: true },
      "New templates were created that follow South African CV conventions, including sections for ID number, references, and local qualification formatting. Templates were also added for specific sectors such as mining, government, and retail that are prominent in the Northern Cape economy.",
    ]),
    bulletMixed([
      { text: "Streamlined onboarding process: ", bold: true },
      "The onboarding flow was reduced from six steps to three essential steps, with optional profile completion available later through the dashboard. This significantly reduced the time to first value while still capturing necessary information.",
    ]),
    bulletMixed([
      { text: "Added more cover letter tone options: ", bold: true },
      "The cover letter generator was expanded to include five tone options: professional, enthusiastic, concise, formal academic, and culturally adaptive. The culturally adaptive option specifically adjusts language and emphasis to align with different South African workplace cultures.",
    ]),
    bulletMixed([
      { text: "Improved mobile responsiveness: ", bold: true },
      "Minor layout issues identified during testing were addressed, including improving touch target sizes for smaller screens, optimising form input fields for mobile keyboards, and ensuring consistent spacing across different device sizes.",
    ]),
    bulletMixed([
      { text: "Added career context awareness to interview coach: ", bold: true },
      "The interview coach was enhanced to incorporate the user's resume data, cover letter content, and specified career goals when generating interview questions and evaluating responses. This resulted in more targeted and relevant interview practice sessions.",
    ]),

    h2("6.4 Testing Outcomes Summary"),
    academicTable(
      ["Finding", "Category", "Action Taken"],
      [
        ["Resume builder intuitive and easy to use", "Positive", "Maintained as core feature"],
        ["AI interview coach most impressive feature", "Positive", "Enhanced with context awareness"],
        ["CAHAU representatives endorsed the system", "Positive", "Strong validation of solution direction"],
        ["Need for SA-specific templates", "Improvement", "Added SA-specific templates"],
        ["Onboarding too lengthy", "Improvement", "Streamlined from 6 to 3 steps"],
        ["Mobile responsiveness praised", "Positive", "Further refined touch targets"],
        ["Cover letter needs more tone variety", "Improvement", "Expanded to 5 tone options"],
        ["Interview coach needs more context", "Improvement", "Added career context awareness"],
      ],
      [35, 18, 47]
    ),
    tableCaption("Table 5: Testing Findings and Actions Summary"),
  ];
}

// ── SECTION 7: Conclusion ──
function buildConclusion() {
  return [
    h1("7. Conclusion"),
    bodyPara("This document has presented the complete Design Thinking journey of the NexTech Career App project, from initial user research through to a tested and refined prototype. The project demonstrates the power of user-centred design methodology in developing technology solutions that address real-world challenges faced by South African youth."),

    h2("7.1 Summary of the Design Thinking Journey"),
    bodyPara("The project followed the five stages of Design Thinking with rigour and intentionality. In the Empathise phase, extensive research including interviews, news analysis, and social media monitoring revealed the multifaceted barriers that young South African job seekers face, extending beyond simple job scarcity to encompass digital access constraints, application process challenges, and a critical guidance gap. The Define phase synthesised these insights into a precise problem statement and root cause analysis, identifying the absence of accessible, affordable, and locally relevant career support tools as the fundamental issue. The Ideate phase generated five distinct solution concepts, with the AI-Powered Career Companion App emerging as the clear leader through systematic evaluation against user-centred criteria. The Prototype phase translated this concept into a functional application built with modern technologies, featuring AI-powered resume building, cover letter generation, and interview coaching capabilities. The Test phase validated the solution with real users and industry professionals, resulting in targeted improvements that strengthened the application's alignment with user needs."),

    h2("7.2 Impact Potential"),
    bodyPara("The NexTech Career App has significant potential to make a meaningful impact on youth employment in South Africa. By addressing the critical access and guidance gap identified in the research, the application can help qualified young people present themselves more effectively in the job market, increasing their chances of securing employment. The endorsement from CAHAU representatives provides strong external validation that the solution addresses genuine needs in the hiring process. The mobile-first, data-light architecture ensures that the application can reach the users who need it most, including those in underserved communities with limited digital infrastructure."),

    h2("7.3 Future Enhancements"),
    bodyPara("Several enhancements are planned for future development iterations:"),
    bulletItem("Integration with South African job boards to provide real-time job listings within the application"),
    bulletItem("Multi-language support including isiZulu, isiXhosa, Afrikaans, and Sesotho to serve a broader user base"),
    bulletItem("Employer partnership programme allowing companies to directly access candidate profiles through the platform"),
    bulletItem("Offline mode with full functionality for resume building and interview practice without internet connectivity"),
    bulletItem("Gamification elements such as achievement badges and career milestones to increase user engagement and motivation"),
    bulletItem("Community features enabling users to share tips, success stories, and support each other in their career journeys"),
    bulletItem("Analytics dashboard for tracking application success rates and identifying areas for personal improvement"),

    h2("7.4 Final Reflections"),
    bodyPara("The NexTech Career App project has been a transformative learning experience for the NexTech Solutions team. It has reinforced the importance of deeply understanding users before designing solutions, and has demonstrated that technology, when thoughtfully applied, can serve as a powerful equaliser in addressing socioeconomic challenges. The project also highlighted the importance of local context in technology design; solutions that work internationally may not automatically translate to the South African environment without deliberate adaptation."),
    bodyPara("Most importantly, the project has shown that the youth unemployment crisis in South Africa is not intractable. While systemic solutions require policy changes and economic growth, there is a significant and immediate opportunity to improve employment outcomes through better application support. The NexTech Career App represents a practical, scalable, and user-centred approach to bridging the gap between qualified candidates and successful employment, contributing to a future where every young South African has the tools and guidance they need to present their best self to the job market."),
  ];
}

// ── SECTION 8: References ──
function buildReferences() {
  return [
    h1("8. References"),
    bodyPara("Nielsen. (2023). South African Digital Landscape Report. Nielsen Holdings plc.", { indent: { left: 480, hanging: 480 } }),
    bodyPara("MTN Foundation. (2024). Digital Skills Programme Report. MTN Group.", { indent: { left: 480, hanging: 480 } }),
    bodyPara("Statistics South Africa. (2024). Quarterly Labour Force Survey, Quarter 4 2024. Stats SA.", { indent: { left: 480, hanging: 480 } }),
    bodyPara("United Nations Development Programme. (2023). Youth Employment in South Africa: Challenges and Opportunities. UNDP South Africa.", { indent: { left: 480, hanging: 480 } }),
    bodyPara("World Bank. (2024). South Africa Economic Update: Youth Employment. The World Bank Group.", { indent: { left: 480, hanging: 480 } }),
    spacer(200),
    bodyMixed([
      { text: "Note: ", bold: true, italics: true },
      { text: "Additional sources consulted during the research phase include news articles from News24, Mail & Guardian, and Sowetan Live (2024-2025), as well as social media analyses from Twitter (X), Facebook, and Reddit. Interview data was collected from 15 community members in the Kimberley and Northern Cape region.", italics: true },
    ]),
  ];
}

// ── Assemble Document ──
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
          run: {
            font: { ascii: "Times New Roman", eastAsia: "SimHei" },
            size: 32,
            bold: true,
            color: c(P.primary),
          },
          paragraph: { spacing: { before: 360, after: 160, line: 312 } },
        },
        heading2: {
          run: {
            font: { ascii: "Times New Roman", eastAsia: "SimHei" },
            size: 28,
            bold: true,
            color: c(P.primary),
          },
          paragraph: { spacing: { before: 240, after: 120, line: 312 } },
        },
        heading3: {
          run: {
            font: { ascii: "Times New Roman", eastAsia: "SimHei" },
            size: 24,
            bold: true,
            color: c(P.primary),
          },
          paragraph: { spacing: { before: 200, after: 100, line: 312 } },
        },
      },
    },
    numbering: {
      config: [],
    },
    sections: [
      // Section 1: Cover (no page numbers)
      {
        properties: {
          page: {
            size: pgSize,
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
          },
        },
        children: [buildCover()],
      },
      // Section 2: Front matter (TOC with Roman numerals)
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: pgSize,
            margin: pgMargin,
            pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
          },
        },
        footers: {
          default: romanFooter(),
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "NexTech Career App - Design Thinking Project",
                    size: 18,
                    color: "808080",
                    font: { ascii: "Times New Roman" },
                  }),
                ],
              }),
            ],
          }),
        },
        children: buildTocSection(),
      },
      // Section 3: Body (Arabic numerals starting from 1)
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: pgSize,
            margin: pgMargin,
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        footers: {
          default: arabicFooter(),
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "NexTech Career App - Design Thinking Project",
                    size: 18,
                    color: "808080",
                    font: { ascii: "Times New Roman" },
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...buildIntroduction(),
          ...buildEmpathise(),
          ...buildDefine(),
          ...buildIdeate(),
          ...buildPrototype(),
          ...buildTest(),
          ...buildConclusion(),
          ...buildReferences(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = "/home/z/my-project/workspace/NexTech-Design-Thinking-Project.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document generated successfully: ${outputPath}`);
}

main().catch((err) => {
  console.error("Error generating document:", err);
  process.exit(1);
});
