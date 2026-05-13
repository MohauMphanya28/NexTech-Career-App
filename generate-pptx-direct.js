/**
 * NexTech Design Thinking Presentation
 * Built with pptxgenjs directly (no html2pptx)
 * 18 slides — Design Thinking Assignment Rubric
 */

const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'NexTech Group';
pptx.title = 'Addressing Youth Unemployment in South Africa';
pptx.subject = 'Design Thinking - NexTech Career App';

// ─── Azure Theme Colors (NO # prefix) ───
const C = {
  primaryDark:  '0C2A40',
  primary:      '1E5F8C',
  primaryLight: '4085B0',
  blue4:        '70AAD0',
  blue5:        'A8CEE5',
  surface:      'D8E9F3',
  surfaceLight: 'F0F6FA',
  accentOrange: 'FF6B2B',
  accentRed:    'DD5F5F',
  accentPurple: '9270E1',
  teal:         '2A9D8F',
  tealDark:     '1F7A6F',
  white:        'FFFFFF',
  textDark:     '333333',
  black:        '000000',
  lightGray:    'E8EDF2',
  midGray:      '8899AA',
};

// ─── Slide dimensions ───
const W = 13.33;
const H = 7.5;

// ─── Helper functions ───
function addDarkBg(slide) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.primaryDark } });
}

function addLightBg(slide) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.surfaceLight } });
}

function addGradientDarkBg(slide) {
  // Simulate gradient with two overlapping shapes
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.primaryDark } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: '0F3460' }, opacity: 40 });
}

function addTealDarkBg(slide) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.tealDark } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.primaryDark }, opacity: 30 });
}

function addPhaseTag(slide, text) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 0.35, w: 3.0, h: 0.42,
    fill: { color: C.accentOrange },
    rectRadius: 0.1,
    shadow: { type: 'outer', blur: 4, offset: 2, color: '000000', opacity: 0.3 },
  });
  slide.addText(text, {
    x: 0.5, y: 0.35, w: 3.0, h: 0.42,
    fontSize: 11, fontFace: 'Arial', color: C.white, bold: true,
    align: 'center', valign: 'middle',
  });
}

function addSlideNumber(slide, num) {
  slide.addText(`${num} / 18`, {
    x: W - 1.2, y: H - 0.4, w: 1.0, h: 0.3,
    fontSize: 9, fontFace: 'Arial', color: C.midGray, align: 'right',
  });
}

function addFooterLine(slide, dark = false) {
  const lineColor = dark ? C.primary : C.surface;
  slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: H - 0.55, w: W - 1.0, h: 0.01, fill: { color: lineColor } });
  slide.addText('NexTech Career App  |  Design Thinking Project', {
    x: 0.5, y: H - 0.5, w: 6, h: 0.35,
    fontSize: 8, fontFace: 'Arial', color: dark ? C.blue5 : C.midGray,
  });
}

function addCard(slide, x, y, w, h, opts = {}) {
  const { fill = C.white, border = null, radius = 0.1, shadow = true } = opts;
  const shapeOpts = {
    x, y, w, h,
    fill: { color: fill },
    rectRadius: radius,
  };
  if (border) {
    shapeOpts.line = { color: border, width: 1.5 };
  }
  if (shadow) {
    shapeOpts.shadow = { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.15 };
  }
  slide.addShape(pptx.ShapeType.roundRect, shapeOpts);
}

// ═══════════════════════════════════════════════
// SLIDE 1: COVER
// ═══════════════════════════════════════════════
function buildSlide1() {
  const slide = pptx.addSlide();
  addDarkBg(slide);

  // Accent orange line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.9, w: 1.5, h: 0.06,
    fill: { color: C.accentOrange },
  });

  // Title
  slide.addText('Addressing Youth Unemployment\nin South Africa', {
    x: 0.8, y: 2.1, w: 8.0, h: 1.6,
    fontSize: 32, fontFace: 'Arial', color: C.white, bold: true,
    lineSpacingMultiple: 1.1,
  });

  // Subtitle
  slide.addText('NexTech Career App — AI-Powered Mobile Career Support', {
    x: 0.8, y: 3.85, w: 8.0, h: 0.5,
    fontSize: 16, fontFace: 'Arial', color: C.blue5,
  });

  // Team
  slide.addText('NexTech Group', {
    x: 0.8, y: 4.8, w: 3.0, h: 0.35,
    fontSize: 13, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('Mohau Mphanya  •  Sive Mtengwana  •  Lesedi Ledwaba', {
    x: 0.8, y: 5.15, w: 7.0, h: 0.35,
    fontSize: 12, fontFace: 'Arial', color: C.blue5,
  });

  // Course info
  slide.addText('Technopreneurship NTEC62110  |  Sol Plaatje University  |  June 2026', {
    x: 0.8, y: 5.7, w: 8.0, h: 0.35,
    fontSize: 11, fontFace: 'Arial', color: C.midGray,
  });

  // Decorative right side element
  slide.addShape(pptx.ShapeType.rect, {
    x: 10.5, y: 0, w: 2.83, h: H,
    fill: { color: C.primary }, opacity: 30,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 11.5, y: 0, w: 1.83, h: H,
    fill: { color: C.accentOrange }, opacity: 15,
  });

  addSlideNumber(slide, 1);
}

// ═══════════════════════════════════════════════
// SLIDE 2: INTRODUCTION - Crisis at a Glance
// ═══════════════════════════════════════════════
function buildSlide2() {
  const slide = pptx.addSlide();
  addLightBg(slide);

  // Title
  slide.addText('INTRODUCTION', {
    x: 0.6, y: 0.3, w: 5, h: 0.5,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('Crisis at a Glance', {
    x: 0.6, y: 0.65, w: 8, h: 0.6,
    fontSize: 26, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  // 4 stat cards
  const stats = [
    { num: '46.1%', label: 'Youth Unemployed', desc: 'South Africa has one of the highest youth unemployment rates globally', color: C.accentRed },
    { num: '~60%', label: 'Ages 15-24', desc: 'Majority of young adults in this age bracket are without work', color: C.accentOrange },
    { num: '4.8%', label: 'Matric Grads Employed', desc: 'Only a fraction of recent matriculants find employment', color: C.accentPurple },
    { num: '118K+', label: 'Unfilled Tech Jobs', desc: 'Thousands of tech positions remain vacant due to skills gaps', color: C.teal },
  ];

  stats.forEach((s, i) => {
    const x = 0.6 + i * 3.05;
    addCard(slide, x, 1.6, 2.8, 2.2, { fill: C.white });
    // Color bar top
    slide.addShape(pptx.ShapeType.rect, { x: x + 0.05, y: 1.65, w: 2.7, h: 0.06, fill: { color: s.color } });
    // Number
    slide.addText(s.num, {
      x, y: 1.85, w: 2.8, h: 0.7,
      fontSize: 30, fontFace: 'Arial', color: s.color, bold: true, align: 'center',
    });
    // Label
    slide.addText(s.label, {
      x, y: 2.55, w: 2.8, h: 0.35,
      fontSize: 12, fontFace: 'Arial', color: C.primaryDark, bold: true, align: 'center',
    });
    // Description
    slide.addText(s.desc, {
      x: x + 0.15, y: 2.95, w: 2.5, h: 0.7,
      fontSize: 10, fontFace: 'Arial', color: C.textDark, align: 'center', valign: 'top',
    });
  });

  // 3 text cards
  const cards = [
    { title: 'Critical Levels', text: 'Youth unemployment in South Africa has reached crisis levels, threatening social stability and economic growth for an entire generation.', icon: '⚠' },
    { title: 'Digital Divide', text: 'Millions of young South Africans lack access to digital tools, professional networks, and career guidance needed to compete in the modern job market.', icon: '🌐' },
    { title: 'Our Mission', text: 'NexTech Career App bridges the gap between unemployed youth and career opportunities using AI-powered tools accessible on any mobile device.', icon: '🎯' },
  ];

  cards.forEach((c, i) => {
    const x = 0.6 + i * 4.05;
    addCard(slide, x, 4.15, 3.8, 2.6, { fill: C.white });
    // Icon circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.2, y: 4.35, w: 0.5, h: 0.5,
      fill: { color: C.primary },
    });
    slide.addText(c.icon, {
      x: x + 0.2, y: 4.35, w: 0.5, h: 0.5,
      fontSize: 14, align: 'center', valign: 'middle',
    });
    slide.addText(c.title, {
      x: x + 0.85, y: 4.35, w: 2.7, h: 0.45,
      fontSize: 14, fontFace: 'Arial', color: C.primaryDark, bold: true, valign: 'middle',
    });
    slide.addText(c.text, {
      x: x + 0.2, y: 4.95, w: 3.4, h: 1.6,
      fontSize: 11, fontFace: 'Arial', color: C.textDark, lineSpacingMultiple: 1.2, valign: 'top',
    });
  });

  addFooterLine(slide);
  addSlideNumber(slide, 2);
}

// ═══════════════════════════════════════════════
// SLIDE 3: EMPATHISE - Our Research
// ═══════════════════════════════════════════════
function buildSlide3() {
  const slide = pptx.addSlide();
  addLightBg(slide);

  addPhaseTag(slide, 'EMPATHISE — 5 MARKS');

  slide.addText('Our Research', {
    x: 0.5, y: 0.9, w: 8, h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  // 3 columns
  const cols = [
    {
      title: 'Primary Research',
      color: C.primary,
      items: [
        '• 15 in-depth interviews with unemployed youth aged 18-35',
        '• Recruitment agent insights from hiring processes',
        '• Career counsellor perspectives on guidance gaps',
        '• Focus groups in Kimberley township areas',
      ],
    },
    {
      title: 'Secondary Research',
      color: C.teal,
      items: [
        '• Stats SA quarterly labour force surveys',
        '• News articles on youth employment crisis',
        '• Social media sentiment analysis',
        '• Academic research on SA job market barriers',
      ],
    },
    {
      title: 'Key Findings',
      color: C.accentOrange,
      items: [
        '• 87% don\'t know how to write a professional CV',
        '• 92% have no interview preparation resources',
        '• 73% rely solely on mobile phones for internet',
        '• 65% find existing platforms confusing and overwhelming',
      ],
    },
  ];

  cols.forEach((col, i) => {
    const x = 0.5 + i * 4.15;
    addCard(slide, x, 1.7, 3.9, 3.3, { fill: C.white });
    // Header bar
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.05, y: 1.75, w: 3.8, h: 0.5,
      fill: { color: col.color }, rectRadius: 0.08,
    });
    slide.addText(col.title, {
      x: x + 0.05, y: 1.75, w: 3.8, h: 0.5,
      fontSize: 13, fontFace: 'Arial', color: C.white, bold: true, align: 'center', valign: 'middle',
    });
    slide.addText(col.items.join('\n'), {
      x: x + 0.2, y: 2.4, w: 3.5, h: 2.4,
      fontSize: 11, fontFace: 'Arial', color: C.textDark, lineSpacingMultiple: 1.5, valign: 'top',
    });
  });

  // Quote
  addCard(slide, 0.5, 5.25, 12.33, 1.5, { fill: C.primary, border: null });
  slide.addText('"I know I can do the job, but I don\'t know how to show it on paper. Every time I apply online, I feel invisible."', {
    x: 0.8, y: 5.35, w: 10.5, h: 0.9,
    fontSize: 13, fontFace: 'Arial', color: C.white, italic: true, lineSpacingMultiple: 1.3,
  });
  slide.addText('— Thabo, 24, Kimberley', {
    x: 0.8, y: 6.25, w: 10.5, h: 0.35,
    fontSize: 11, fontFace: 'Arial', color: C.blue5, bold: true,
  });

  addFooterLine(slide);
  addSlideNumber(slide, 3);
}

// ═══════════════════════════════════════════════
// SLIDE 4: EMPATHISE - Empathy Map
// ═══════════════════════════════════════════════
function buildSlide4() {
  const slide = pptx.addSlide();
  addLightBg(slide);

  addPhaseTag(slide, 'EMPATHISE — 5 MARKS');

  slide.addText('Empathy Map', {
    x: 0.5, y: 0.9, w: 8, h: 0.5,
    fontSize: 24, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  const quadrants = [
    {
      title: 'SAYS', color: C.primary,
      items: ['"I don\'t know how to write a CV"', '"Online applications are too complicated"', '"No one calls me back"', '"I can\'t afford data to browse jobs"'],
      x: 0.5, y: 1.6,
    },
    {
      title: 'THINKS', color: C.teal,
      items: ['"I\'m not good enough"', '"The system is rigged against me"', '"Education didn\'t prepare me for this"', '"I\'ll never escape unemployment"'],
      x: 6.65, y: 1.6,
    },
    {
      title: 'DOES', color: C.accentOrange,
      items: ['Applies to dozens of jobs with same CV', 'Asks friends for help with applications', 'Gives up after multiple rejections', 'Borrows money for internet café visits'],
      x: 0.5, y: 4.0,
    },
    {
      title: 'FEELS', color: C.accentPurple,
      items: ['Frustrated by constant rejection', 'Overwhelmed by complex processes', 'Hopeless about future prospects', 'Invisible to employers and systems'],
      x: 6.65, y: 4.0,
    },
  ];

  quadrants.forEach(q => {
    addCard(slide, q.x, q.y, 5.85, 2.15, { fill: C.white });
    // Header
    slide.addShape(pptx.ShapeType.roundRect, {
      x: q.x + 0.05, y: q.y + 0.05, w: 2.0, h: 0.4,
      fill: { color: q.color }, rectRadius: 0.08,
    });
    slide.addText(q.title, {
      x: q.x + 0.05, y: q.y + 0.05, w: 2.0, h: 0.4,
      fontSize: 12, fontFace: 'Arial', color: C.white, bold: true, align: 'center', valign: 'middle',
    });
    slide.addText(q.items.join('\n'), {
      x: q.x + 0.2, y: q.y + 0.55, w: 5.45, h: 1.5,
      fontSize: 11, fontFace: 'Arial', color: C.textDark, lineSpacingMultiple: 1.4, valign: 'top',
    });
  });

  // Critical insight callout
  addCard(slide, 0.5, 6.35, 12.33, 0.7, { fill: C.accentOrange });
  slide.addText('CRITICAL INSIGHT: The gap isn\'t motivation — it\'s access to professional tools and guidance that most job seekers take for granted.', {
    x: 0.7, y: 6.35, w: 11.9, h: 0.7,
    fontSize: 12, fontFace: 'Arial', color: C.white, bold: true, align: 'center', valign: 'middle',
  });

  addFooterLine(slide);
  addSlideNumber(slide, 4);
}

// ═══════════════════════════════════════════════
// SLIDE 5: DATA & INSIGHTS
// ═══════════════════════════════════════════════
function buildSlide5() {
  const slide = pptx.addSlide();
  addLightBg(slide);

  slide.addText('DATA & INSIGHTS', {
    x: 0.6, y: 0.3, w: 5, h: 0.5,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('The Numbers Behind the Crisis', {
    x: 0.6, y: 0.7, w: 8, h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  const stats = [
    { num: '46.1%', label: 'Youth Unemployment Rate', desc: 'Q1 2024 — among the highest globally. Over 4.9 million young South Africans are actively seeking work.', color: C.accentRed },
    { num: '73%', label: 'Mobile-Only Internet Users', desc: 'The majority of SA youth access the internet exclusively via mobile phones, making desktop-only solutions ineffective.', color: C.primary },
    { num: '87%', label: 'Cannot Write Professional CVs', desc: 'Our research found that the vast majority of young job seekers have never received CV writing guidance.', color: C.accentOrange },
    { num: '92%', label: 'No Interview Preparation', desc: 'Almost all respondents reported zero access to interview coaching or mock interview resources.', color: C.accentPurple },
  ];

  stats.forEach((s, i) => {
    const x = 0.5 + i * 3.15;
    addCard(slide, x, 1.6, 2.9, 4.6, { fill: C.white });
    // Top color bar
    slide.addShape(pptx.ShapeType.rect, { x: x + 0.05, y: 1.65, w: 2.8, h: 0.08, fill: { color: s.color } });
    // Big number
    slide.addText(s.num, {
      x, y: 2.0, w: 2.9, h: 1.0,
      fontSize: 38, fontFace: 'Arial', color: s.color, bold: true, align: 'center',
    });
    // Label
    slide.addText(s.label, {
      x, y: 3.1, w: 2.9, h: 0.5,
      fontSize: 13, fontFace: 'Arial', color: C.primaryDark, bold: true, align: 'center',
    });
    // Description
    slide.addText(s.desc, {
      x: x + 0.2, y: 3.75, w: 2.5, h: 2.2,
      fontSize: 11, fontFace: 'Arial', color: C.textDark, align: 'center', valign: 'top', lineSpacingMultiple: 1.3,
    });
  });

  addFooterLine(slide);
  addSlideNumber(slide, 5);
}

// ═══════════════════════════════════════════════
// SLIDE 6: PROBLEM ANALYSIS
// ═══════════════════════════════════════════════
function buildSlide6() {
  const slide = pptx.addSlide();
  addLightBg(slide);

  slide.addText('PROBLEM ANALYSIS', {
    x: 0.6, y: 0.3, w: 5, h: 0.5,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('Understanding the Barriers', {
    x: 0.6, y: 0.7, w: 8, h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  // Core problem box
  addCard(slide, 0.5, 1.5, 12.33, 1.2, { fill: C.primaryDark });
  slide.addText('CORE PROBLEM', {
    x: 0.7, y: 1.55, w: 3, h: 0.35,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('South African youth face a systemic barrier to employment: they lack access to professional career development tools, guidance, and resources that are essential for competing in the modern job market.', {
    x: 0.7, y: 1.9, w: 11.8, h: 0.7,
    fontSize: 13, fontFace: 'Arial', color: C.white, lineSpacingMultiple: 1.3,
  });

  // 3 barrier cards
  const barriers = [
    { title: 'Skills Presentation Gap', icon: '📄', desc: 'Youth cannot effectively present their skills and qualifications to employers. CVs are poorly structured and fail to highlight relevant competencies.', color: C.accentRed },
    { title: 'Digital Access Divide', icon: '📱', desc: 'Desktop-only solutions exclude the 73% who rely solely on mobile. Data-heavy platforms are unusable on limited prepaid data bundles.', color: C.accentOrange },
    { title: 'Guidance & Preparation Void', icon: '🎯', desc: 'No access to interview coaching, career counselling, or professional mentorship. Young job seekers navigate the process entirely alone.', color: C.accentPurple },
  ];

  barriers.forEach((b, i) => {
    const x = 0.5 + i * 4.15;
    addCard(slide, x, 3.0, 3.9, 2.8, { fill: C.white });
    // Icon circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.2, y: 3.2, w: 0.55, h: 0.55,
      fill: { color: b.color },
    });
    slide.addText(b.icon, {
      x: x + 0.2, y: 3.2, w: 0.55, h: 0.55,
      fontSize: 16, align: 'center', valign: 'middle',
    });
    slide.addText(b.title, {
      x: x + 0.9, y: 3.2, w: 2.8, h: 0.55,
      fontSize: 13, fontFace: 'Arial', color: C.primaryDark, bold: true, valign: 'middle',
    });
    slide.addText(b.desc, {
      x: x + 0.2, y: 3.9, w: 3.5, h: 1.7,
      fontSize: 11, fontFace: 'Arial', color: C.textDark, lineSpacingMultiple: 1.3, valign: 'top',
    });
  });

  // Critical insight
  addCard(slide, 0.5, 6.05, 12.33, 0.7, { fill: C.accentOrange });
  slide.addText('CRITICAL INSIGHT: These barriers are interconnected — solving one without addressing the others will not create meaningful change.', {
    x: 0.7, y: 6.05, w: 11.9, h: 0.7,
    fontSize: 12, fontFace: 'Arial', color: C.white, bold: true, align: 'center', valign: 'middle',
  });

  addFooterLine(slide);
  addSlideNumber(slide, 6);
}

// ═══════════════════════════════════════════════
// SLIDE 7: DEFINE - Problem Statement
// ═══════════════════════════════════════════════
function buildSlide7() {
  const slide = pptx.addSlide();
  addGradientDarkBg(slide);

  addPhaseTag(slide, 'DEFINE — 10 MARKS');

  slide.addText('Problem Statement', {
    x: 0.5, y: 0.9, w: 8, h: 0.6,
    fontSize: 26, fontFace: 'Arial', color: C.white, bold: true,
  });

  // Quote box
  addCard(slide, 0.8, 1.7, 11.73, 1.8, { fill: C.primary, radius: 0.12 });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.7, w: 0.08, h: 1.8,
    fill: { color: C.accentOrange },
  });
  slide.addText('"Young South Africans aged 18-35 who are actively seeking employment lack accessible, mobile-friendly tools to create professional application materials, prepare for interviews, and navigate career pathways — resulting in systemic exclusion from the formal job market despite available opportunities."', {
    x: 1.15, y: 1.85, w: 11.1, h: 1.5,
    fontSize: 14, fontFace: 'Arial', color: C.white, italic: true, lineSpacingMultiple: 1.4, valign: 'middle',
  });

  // Five Whys
  slide.addText('FIVE WHYS — Root Cause Analysis', {
    x: 0.8, y: 3.8, w: 8, h: 0.45,
    fontSize: 14, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });

  const whys = [
    { q: 'Why are youth unemployed?', a: 'They cannot effectively compete for available positions' },
    { q: 'Why can\'t they compete?', a: 'They lack professional CVs, cover letters, and interview skills' },
    { q: 'Why do they lack these?', a: 'No access to career guidance or professional development tools' },
    { q: 'Why no access?', a: 'Existing solutions are desktop-only, expensive, or data-heavy' },
    { q: 'Why mobile-only solutions fail?', a: 'The market has ignored mobile-first, data-light career tools for SA youth' },
  ];

  whys.forEach((w, i) => {
    const y = 4.35 + i * 0.58;
    // Why question
    slide.addText(`${i + 1}. ${w.q}`, {
      x: 0.9, y, w: 5.5, h: 0.5,
      fontSize: 11, fontFace: 'Arial', color: C.blue5, bold: true,
    });
    // Arrow
    slide.addText('→', {
      x: 6.5, y, w: 0.4, h: 0.5,
      fontSize: 13, fontFace: 'Arial', color: C.accentOrange, align: 'center',
    });
    // Answer
    slide.addText(w.a, {
      x: 6.9, y, w: 5.5, h: 0.5,
      fontSize: 11, fontFace: 'Arial', color: C.white,
    });
  });

  addSlideNumber(slide, 7);
}

// ═══════════════════════════════════════════════
// SLIDE 8: USER PERSPECTIVE
// ═══════════════════════════════════════════════
function buildSlide8() {
  const slide = pptx.addSlide();
  addLightBg(slide);

  slide.addText('USER PERSPECTIVE', {
    x: 0.6, y: 0.3, w: 5, h: 0.5,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('Pain Points from the Ground', {
    x: 0.6, y: 0.7, w: 8, h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  const pains = [
    { title: 'Application Fatigue', desc: '"I\'ve applied to over 100 jobs and heard back from none. It feels pointless to keep trying." — Sive, 22', icon: '😤', color: C.accentRed },
    { title: 'CV Blindness', desc: '"I don\'t know what employers want to see. My CV looks the same as everyone else\'s." — Naledi, 25', icon: '😵', color: C.accentOrange },
    { title: 'Interview Anxiety', desc: '"I\'ve never had a professional interview. When I finally got one, I froze completely." — Thabo, 24', icon: '😰', color: C.accentPurple },
    { title: 'Digital Exclusion', desc: '"Everything wants a laptop. I only have my phone and R20 data that lasts 2 days." — Karabo, 21', icon: '📵', color: C.primary },
  ];

  pains.forEach((p, i) => {
    const x = 0.5 + i * 3.15;
    addCard(slide, x, 1.5, 2.9, 3.8, { fill: C.white });
    // Top color bar
    slide.addShape(pptx.ShapeType.rect, { x: x + 0.05, y: 1.55, w: 2.8, h: 0.06, fill: { color: p.color } });
    // Icon
    slide.addText(p.icon, {
      x, y: 1.75, w: 2.9, h: 0.55,
      fontSize: 24, align: 'center',
    });
    // Title
    slide.addText(p.title, {
      x, y: 2.35, w: 2.9, h: 0.4,
      fontSize: 14, fontFace: 'Arial', color: C.primaryDark, bold: true, align: 'center',
    });
    // Quote
    slide.addText(p.desc, {
      x: x + 0.15, y: 2.85, w: 2.6, h: 2.2,
      fontSize: 11, fontFace: 'Arial', color: C.textDark, italic: true, align: 'center', valign: 'top', lineSpacingMultiple: 1.3,
    });
  });

  // Key takeaway
  addCard(slide, 0.5, 5.6, 12.33, 1.2, { fill: C.primaryDark });
  slide.addText('KEY TAKEAWAY', {
    x: 0.7, y: 5.65, w: 3, h: 0.35,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('Young South Africans are not lazy or unqualified — they are systematically underserved by existing career development infrastructure. A mobile-first, AI-powered solution can bridge this gap.', {
    x: 0.7, y: 6.0, w: 11.8, h: 0.7,
    fontSize: 13, fontFace: 'Arial', color: C.white, lineSpacingMultiple: 1.3,
  });

  addFooterLine(slide, true);
  addSlideNumber(slide, 8);
}

// ═══════════════════════════════════════════════
// SLIDE 9: CURRENT LANDSCAPE
// ═══════════════════════════════════════════════
function buildSlide9() {
  const slide = pptx.addSlide();
  addLightBg(slide);

  slide.addText('CURRENT LANDSCAPE', {
    x: 0.6, y: 0.3, w: 5, h: 0.5,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('Existing Solutions & Their Gaps', {
    x: 0.6, y: 0.7, w: 8, h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  // Existing solutions (left)
  slide.addText('Existing Solutions', {
    x: 0.5, y: 1.5, w: 6, h: 0.4,
    fontSize: 15, fontFace: 'Arial', color: C.teal, bold: true,
  });

  const solutions = [
    { name: 'LinkedIn', desc: 'Professional networking platform — desktop-centric, data-heavy, Western-oriented' },
    { name: 'Indeed / CareerJunction', desc: 'Job search engines — focus on listing, not preparation or guidance' },
    { name: 'Government Youth Programmes', desc: 'NYDA, YES Programme — limited reach, bureaucratic processes, no digital tools' },
  ];

  solutions.forEach((s, i) => {
    const y = 2.05 + i * 1.2;
    addCard(slide, 0.5, y, 5.9, 1.05, { fill: C.white, border: C.teal });
    slide.addText(s.name, {
      x: 0.7, y, w: 5.5, h: 0.4,
      fontSize: 12, fontFace: 'Arial', color: C.teal, bold: true, valign: 'middle',
    });
    slide.addText(s.desc, {
      x: 0.7, y: y + 0.38, w: 5.5, h: 0.6,
      fontSize: 11, fontFace: 'Arial', color: C.textDark, valign: 'top',
    });
  });

  // Limitations (right)
  slide.addText('Key Limitations', {
    x: 6.9, y: 1.5, w: 6, h: 0.4,
    fontSize: 15, fontFace: 'Arial', color: C.accentRed, bold: true,
  });

  const limitations = [
    { title: 'Not Mobile-First', desc: 'Desktop-only interfaces exclude 73% of the target audience' },
    { title: 'No AI Guidance', desc: 'No personalised career advice or interview preparation tools' },
    { title: 'Data-Heavy', desc: 'High bandwidth requirements make them unusable on prepaid data' },
    { title: 'SA Context Ignored', desc: 'No localisation for SA job market norms and requirements' },
  ];

  limitations.forEach((l, i) => {
    const y = 2.05 + i * 1.1;
    addCard(slide, 6.9, y, 5.93, 0.95, { fill: C.white, border: C.accentRed });
    slide.addText('✕  ' + l.title, {
      x: 7.1, y, w: 5.5, h: 0.4,
      fontSize: 12, fontFace: 'Arial', color: C.accentRed, bold: true, valign: 'middle',
    });
    slide.addText(l.desc, {
      x: 7.5, y: y + 0.38, w: 5.1, h: 0.5,
      fontSize: 11, fontFace: 'Arial', color: C.textDark, valign: 'top',
    });
  });

  addFooterLine(slide);
  addSlideNumber(slide, 9);
}

// ═══════════════════════════════════════════════
// SLIDE 10: THE OPPORTUNITY
// ═══════════════════════════════════════════════
function buildSlide10() {
  const slide = pptx.addSlide();
  addLightBg(slide);

  slide.addText('THE OPPORTUNITY', {
    x: 0.6, y: 0.3, w: 5, h: 0.5,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('Where Others Fall Short, We Step In', {
    x: 0.6, y: 0.7, w: 10, h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  const opps = [
    { title: 'Mobile-First AI Career Tools', desc: 'Build professional CVs, cover letters, and prepare for interviews — all from a mobile phone with minimal data usage.', icon: '📱', color: C.primary },
    { title: 'Localised for SA Market', desc: 'Designed specifically for South African job market norms, requirements, and the unique challenges faced by SA youth.', icon: '🇿🇦', color: C.teal },
    { title: 'Data-Light Architecture', desc: 'Optimised for low-bandwidth environments with offline capabilities. Works on R20 prepaid data bundles.', icon: '💡', color: C.accentOrange },
    { title: 'AI-Powered Personalisation', desc: 'Intelligent resume analysis, interview coaching, and career pathway recommendations tailored to each user.', icon: '🤖', color: C.accentPurple },
  ];

  opps.forEach((o, i) => {
    const x = 0.5 + i * 3.15;
    addCard(slide, x, 1.5, 2.9, 3.5, { fill: C.white });
    // Icon circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.95, y: 1.7, w: 0.8, h: 0.8,
      fill: { color: o.color },
    });
    slide.addText(o.icon, {
      x: x + 0.95, y: 1.7, w: 0.8, h: 0.8,
      fontSize: 20, align: 'center', valign: 'middle',
    });
    // Title
    slide.addText(o.title, {
      x, y: 2.65, w: 2.9, h: 0.45,
      fontSize: 13, fontFace: 'Arial', color: C.primaryDark, bold: true, align: 'center',
    });
    // Description
    slide.addText(o.desc, {
      x: x + 0.15, y: 3.2, w: 2.6, h: 1.6,
      fontSize: 11, fontFace: 'Arial', color: C.textDark, align: 'center', valign: 'top', lineSpacingMultiple: 1.3,
    });
  });

  // Critical gap callout
  addCard(slide, 0.5, 5.3, 12.33, 1.5, { fill: C.primaryDark });
  slide.addText('THE CRITICAL GAP', {
    x: 0.7, y: 5.4, w: 3, h: 0.35,
    fontSize: 12, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('No existing solution combines mobile-first design, AI-powered career tools, data-light architecture, and South African localisation in a single, accessible platform. NexTech Career App fills this gap.', {
    x: 0.7, y: 5.8, w: 11.8, h: 0.85,
    fontSize: 14, fontFace: 'Arial', color: C.white, lineSpacingMultiple: 1.3,
  });

  addFooterLine(slide, true);
  addSlideNumber(slide, 10);
}

// ═══════════════════════════════════════════════
// SLIDE 11: IDEATE - 5 Solutions
// ═══════════════════════════════════════════════
function buildSlide11() {
  const slide = pptx.addSlide();
  addLightBg(slide);

  addPhaseTag(slide, 'IDEATE — 10 MARKS');

  slide.addText('5 Solutions Explored', {
    x: 0.5, y: 0.9, w: 8, h: 0.5,
    fontSize: 24, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  const ideas = [
    { name: 'WhatsApp Chatbot', desc: 'CV tips via WhatsApp Bot', reason: 'Limited formatting, no document generation, poor UX for complex tasks', status: 'DISCARDED', color: C.accentRed },
    { name: 'Web-Only Portal', desc: 'Full-featured desktop website', reason: 'Excludes 73% mobile-only users, requires broadband connectivity', status: 'DISCARDED', color: C.accentRed },
    { name: 'Physical Workshop Series', desc: 'In-person career bootcamps', reason: 'Scalability issues, high cost, geographic limitations', status: 'DISCARDED', color: C.accentRed },
    { name: 'SMS-Based System', desc: 'Career tips via text messages', reason: 'Too limited for CV generation, no multimedia, poor engagement', status: 'DISCARDED', color: C.accentRed },
    { name: 'NexTech Career App', desc: 'AI-powered mobile career platform', reason: 'Mobile-first, data-light, AI-powered, offline capable, SA-focused — addresses all identified barriers', status: 'SELECTED', color: C.teal },
  ];

  ideas.forEach((idea, i) => {
    const y = 1.6 + i * 1.12;
    const isLast = i === ideas.length - 1;
    const cardFill = isLast ? C.tealDark : C.white;
    const textColor = isLast ? C.white : C.textDark;
    const nameColor = isLast ? C.white : C.primaryDark;
    const borderColor = isLast ? C.teal : C.accentRed;

    addCard(slide, 0.5, y, 12.33, 0.97, { fill: cardFill, border: isLast ? null : borderColor });

    // Status badge
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.7, y: y + 0.1, w: 1.8, h: 0.35,
      fill: { color: idea.color }, rectRadius: 0.08,
    });
    slide.addText(idea.status, {
      x: 0.7, y: y + 0.1, w: 1.8, h: 0.35,
      fontSize: 9, fontFace: 'Arial', color: C.white, bold: true, align: 'center', valign: 'middle',
    });

    // Name
    slide.addText(idea.name, {
      x: 2.7, y: y + 0.05, w: 2.5, h: 0.45,
      fontSize: 13, fontFace: 'Arial', color: nameColor, bold: true, valign: 'middle',
    });
    // Description
    slide.addText(idea.desc, {
      x: 2.7, y: y + 0.45, w: 2.8, h: 0.45,
      fontSize: 11, fontFace: 'Arial', color: textColor, valign: 'top',
    });

    // Reason
    slide.addText(idea.reason, {
      x: 5.8, y: y + 0.1, w: 6.8, h: 0.8,
      fontSize: 11, fontFace: 'Arial', color: textColor, valign: 'middle', lineSpacingMultiple: 1.2,
    });
  });

  addFooterLine(slide);
  addSlideNumber(slide, 11);
}

// ═══════════════════════════════════════════════
// SLIDE 12: OUR SOLUTION - NexTech Career App
// ═══════════════════════════════════════════════
function buildSlide12() {
  const slide = pptx.addSlide();
  addDarkBg(slide);

  slide.addText('OUR SOLUTION', {
    x: 0.6, y: 0.3, w: 5, h: 0.5,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('NexTech Career App', {
    x: 0.6, y: 0.7, w: 8, h: 0.6,
    fontSize: 28, fontFace: 'Arial', color: C.white, bold: true,
  });

  // 3 feature columns
  const features = [
    { title: 'Resume Builder', desc: 'AI-powered resume creation with professional templates, step-by-step guidance, and ATS optimisation. Build a standout CV in minutes.', icon: '📄', color: C.primary },
    { title: 'Cover Letter Generator', desc: 'Personalised cover letters tailored to each job application. AI analyses job descriptions and crafts targeted, compelling letters.', icon: '✉️', color: C.teal },
    { title: 'AI Interview Coach', desc: 'Practice interviews with AI-powered coaching. Get real-time feedback on answers, body language tips, and confidence-building exercises.', icon: '🎤', color: C.accentOrange },
  ];

  features.forEach((f, i) => {
    const x = 0.5 + i * 4.15;
    addCard(slide, x, 1.6, 3.9, 3.4, { fill: '0F3460' });

    // Icon
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 1.4, y: 1.8, w: 0.9, h: 0.9,
      fill: { color: f.color },
    });
    slide.addText(f.icon, {
      x: x + 1.4, y: 1.8, w: 0.9, h: 0.9,
      fontSize: 24, align: 'center', valign: 'middle',
    });

    // Title
    slide.addText(f.title, {
      x, y: 2.85, w: 3.9, h: 0.45,
      fontSize: 16, fontFace: 'Arial', color: C.white, bold: true, align: 'center',
    });

    // Description
    slide.addText(f.desc, {
      x: x + 0.2, y: 3.4, w: 3.5, h: 1.4,
      fontSize: 11, fontFace: 'Arial', color: C.blue5, align: 'center', valign: 'top', lineSpacingMultiple: 1.3,
    });
  });

  // Badge row
  const badges = [
    { label: 'Mobile-First', color: C.primary },
    { label: 'Data-Light', color: C.teal },
    { label: 'AI-Powered', color: C.accentPurple },
    { label: 'Accessible', color: C.accentOrange },
  ];

  badges.forEach((b, i) => {
    const x = 1.2 + i * 2.8;
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 5.3, w: 2.3, h: 0.5,
      fill: { color: b.color }, rectRadius: 0.1,
      shadow: { type: 'outer', blur: 4, offset: 1, color: '000000', opacity: 0.3 },
    });
    slide.addText(b.label, {
      x, y: 5.3, w: 2.3, h: 0.5,
      fontSize: 12, fontFace: 'Arial', color: C.white, bold: true, align: 'center', valign: 'middle',
    });
  });

  // Tagline
  slide.addText('AI-powered career support in your pocket — built for South African youth, by South African youth.', {
    x: 0.5, y: 6.1, w: 12.33, h: 0.5,
    fontSize: 13, fontFace: 'Arial', color: C.blue5, align: 'center', italic: true,
  });

  addSlideNumber(slide, 12);
}

// ═══════════════════════════════════════════════
// SLIDE 13: FEATURES - Detailed Walkthrough
// ═══════════════════════════════════════════════
function buildSlide13() {
  const slide = pptx.addSlide();
  addLightBg(slide);

  slide.addText('FEATURES', {
    x: 0.6, y: 0.3, w: 5, h: 0.5,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('Detailed Feature Walkthrough', {
    x: 0.6, y: 0.7, w: 8, h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  const features = [
    {
      title: 'Resume Builder',
      color: C.primary,
      bullets: [
        'AI-powered content suggestions based on job descriptions',
        'Professional templates optimised for ATS scanning',
        'Step-by-step guided CV creation process',
        'Real-time resume quality scoring and improvement tips',
        'Export to PDF directly from mobile device',
        'Multiple CV versions for different job applications',
      ],
    },
    {
      title: 'Cover Letter Generator',
      color: C.teal,
      bullets: [
        'AI analyses job postings to extract key requirements',
        'Personalised letters matching your experience and skills',
        'Professional tone and formatting automatically applied',
        'One-tap generation with manual edit option',
        'Saved templates for quick customisation',
        'Industry-specific language and keywords',
      ],
    },
    {
      title: 'AI Interview Coach',
      color: C.accentOrange,
      bullets: [
        'Voice-powered mock interview sessions',
        'Real-time AI feedback on responses',
        'Industry-specific interview question banks',
        'Body language and confidence coaching',
        'Recorded sessions for self-review',
        'Progressive difficulty levels to build confidence',
      ],
    },
  ];

  features.forEach((f, i) => {
    const x = 0.5 + i * 4.15;
    addCard(slide, x, 1.5, 3.9, 5.3, { fill: C.white });

    // Header bar
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.05, y: 1.55, w: 3.8, h: 0.55,
      fill: { color: f.color }, rectRadius: 0.08,
    });
    slide.addText(f.title, {
      x: x + 0.05, y: 1.55, w: 3.8, h: 0.55,
      fontSize: 15, fontFace: 'Arial', color: C.white, bold: true, align: 'center', valign: 'middle',
    });

    // Bullets
    const bulletText = f.bullets.map(b => `•  ${b}`).join('\n');
    slide.addText(bulletText, {
      x: x + 0.2, y: 2.3, w: 3.5, h: 4.3,
      fontSize: 11, fontFace: 'Arial', color: C.textDark, lineSpacingMultiple: 1.5, valign: 'top',
    });
  });

  addFooterLine(slide);
  addSlideNumber(slide, 13);
}

// ═══════════════════════════════════════════════
// SLIDE 14: PROTOTYPE
// ═══════════════════════════════════════════════
function buildSlide14() {
  const slide = pptx.addSlide();
  addLightBg(slide);

  addPhaseTag(slide, 'PROTOTYPE — 10 MARKS');

  slide.addText('Prototype & Technology', {
    x: 0.5, y: 0.9, w: 8, h: 0.5,
    fontSize: 24, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  // Technology stack (left side)
  addCard(slide, 0.5, 1.6, 5.5, 2.8, { fill: C.white });
  slide.addText('Technology Stack', {
    x: 0.7, y: 1.7, w: 5, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  const techItems = [
    { label: 'Frontend', value: 'Next.js 16 + React 19 + TypeScript' },
    { label: 'Styling', value: 'Tailwind CSS 4 + shadcn/ui' },
    { label: 'Backend', value: 'Next.js API Routes + Prisma ORM' },
    { label: 'AI Engine', value: 'OpenAI GPT-4 + Whisper ASR' },
    { label: 'Database', value: 'SQLite (data-light) via Prisma' },
    { label: 'Deployment', value: 'Vercel (CDN-optimised for SA)' },
  ];

  techItems.forEach((t, i) => {
    const y = 2.2 + i * 0.34;
    slide.addText(t.label, {
      x: 0.8, y, w: 1.5, h: 0.3,
      fontSize: 11, fontFace: 'Arial', color: C.primary, bold: true,
    });
    slide.addText(t.value, {
      x: 2.3, y, w: 3.5, h: 0.3,
      fontSize: 11, fontFace: 'Arial', color: C.textDark,
    });
  });

  // Screenshot (right side)
  const screenshotPath = '/home/z/my-project/output/screenshots/01_dashboard.png';
  if (fs.existsSync(screenshotPath)) {
    addCard(slide, 6.3, 1.6, 6.53, 3.8, { fill: C.white });
    slide.addText('App Dashboard', {
      x: 6.5, y: 1.7, w: 3, h: 0.35,
      fontSize: 12, fontFace: 'Arial', color: C.primaryDark, bold: true,
    });
    slide.addImage({
      path: screenshotPath,
      x: 6.5, y: 2.1, w: 6.1, h: 3.1,
      rounding: true,
    });
  } else {
    addCard(slide, 6.3, 1.6, 6.53, 3.8, { fill: C.surface });
    slide.addText('[Screenshot: 01_dashboard.png]', {
      x: 6.3, y: 2.5, w: 6.53, h: 1.0,
      fontSize: 14, fontFace: 'Arial', color: C.midGray, align: 'center', valign: 'middle',
    });
  }

  // User flow & Design principles (bottom)
  addCard(slide, 0.5, 4.65, 6.2, 2.3, { fill: C.white });
  slide.addText('User Flow', {
    x: 0.7, y: 4.75, w: 5, h: 0.35,
    fontSize: 13, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });
  slide.addText('Sign Up → Onboarding → Dashboard → Choose Tool → Build/Prepare → Review → Export/Practice → Track Progress', {
    x: 0.7, y: 5.15, w: 5.8, h: 0.6,
    fontSize: 12, fontFace: 'Arial', color: C.primary, bold: true, lineSpacingMultiple: 1.3,
  });
  slide.addText('Each step is optimised for mobile screens, minimal data usage, and intuitive navigation with progressive disclosure.', {
    x: 0.7, y: 5.8, w: 5.8, h: 0.9,
    fontSize: 11, fontFace: 'Arial', color: C.textDark, lineSpacingMultiple: 1.3,
  });

  addCard(slide, 6.9, 4.65, 5.93, 2.3, { fill: C.white });
  slide.addText('Design Principles', {
    x: 7.1, y: 4.75, w: 5, h: 0.35,
    fontSize: 13, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  const principles = [
    { label: 'Mobile-First', desc: 'Every screen designed for thumb-friendly mobile use' },
    { label: 'Data-Light', desc: 'Compressed assets, lazy loading, offline caching' },
    { label: 'Accessible', desc: 'WCAG 2.1 AA, screen reader support, high contrast' },
    { label: 'Progressive', desc: 'Core features work offline, enhanced with connectivity' },
  ];

  principles.forEach((p, i) => {
    const y = 5.2 + i * 0.42;
    slide.addText('•  ' + p.label + ':  ', {
      x: 7.1, y, w: 2.2, h: 0.35,
      fontSize: 11, fontFace: 'Arial', color: C.primary, bold: true,
    });
    slide.addText(p.desc, {
      x: 9.0, y, w: 3.6, h: 0.35,
      fontSize: 11, fontFace: 'Arial', color: C.textDark,
    });
  });

  addFooterLine(slide);
  addSlideNumber(slide, 14);
}

// ═══════════════════════════════════════════════
// SLIDE 15: COMPETITIVE ADVANTAGE
// ═══════════════════════════════════════════════
function buildSlide15() {
  const slide = pptx.addSlide();
  addLightBg(slide);

  slide.addText('COMPETITIVE ADVANTAGE', {
    x: 0.6, y: 0.3, w: 5, h: 0.5,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('Why NexTech Wins', {
    x: 0.6, y: 0.7, w: 8, h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  // Left column: Current Systems
  addCard(slide, 0.5, 1.5, 5.9, 5.2, { fill: C.white, border: C.accentRed });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.55, y: 1.55, w: 5.8, h: 0.55,
    fill: { color: C.accentRed }, rectRadius: 0.08,
  });
  slide.addText('Current Systems', {
    x: 0.55, y: 1.55, w: 5.8, h: 0.55,
    fontSize: 15, fontFace: 'Arial', color: C.white, bold: true, align: 'center', valign: 'middle',
  });

  const currentItems = [
    '✕  Desktop-only interfaces',
    '✕  Data-heavy, requires broadband',
    '✕  No AI-powered guidance',
    '✕  Generic, not SA-localised',
    '✕  No interview preparation',
    '✕  Expensive premium features',
    '✕  Complex, overwhelming UX',
    '✕  No offline functionality',
  ];

  currentItems.forEach((item, i) => {
    slide.addText(item, {
      x: 0.8, y: 2.3 + i * 0.52, w: 5.3, h: 0.45,
      fontSize: 12, fontFace: 'Arial', color: C.accentRed,
    });
  });

  // Right column: Our Solution
  addCard(slide, 6.9, 1.5, 5.93, 5.2, { fill: C.white, border: C.teal });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.95, y: 1.55, w: 5.83, h: 0.55,
    fill: { color: C.teal }, rectRadius: 0.08,
  });
  slide.addText('NexTech Career App', {
    x: 6.95, y: 1.55, w: 5.83, h: 0.55,
    fontSize: 15, fontFace: 'Arial', color: C.white, bold: true, align: 'center', valign: 'middle',
  });

  const ourItems = [
    '✓  Mobile-first design',
    '✓  Data-light, works on prepaid',
    '✓  AI-powered career coaching',
    '✓  Built for South African context',
    '✓  Interview preparation built-in',
    '✓  Core features free to use',
    '✓  Simple, guided user experience',
    '✓  Offline capability with caching',
  ];

  ourItems.forEach((item, i) => {
    slide.addText(item, {
      x: 7.2, y: 2.3 + i * 0.52, w: 5.3, h: 0.45,
      fontSize: 12, fontFace: 'Arial', color: C.teal, bold: true,
    });
  });

  addFooterLine(slide);
  addSlideNumber(slide, 15);
}

// ═══════════════════════════════════════════════
// SLIDE 16: TESTING - CAHAU Feedback
// ═══════════════════════════════════════════════
function buildSlide16() {
  const slide = pptx.addSlide();
  addTealDarkBg(slide);

  addPhaseTag(slide, 'TEST — 5 MARKS');

  slide.addText('CAHAU Feedback', {
    x: 0.5, y: 0.9, w: 8, h: 0.5,
    fontSize: 24, fontFace: 'Arial', color: C.white, bold: true,
  });

  // 4 quote cards
  const quotes = [
    { text: '"This is exactly what candidates need — most applicants fail because they don\'t know how to present themselves"', by: 'CAHAU Representative, Job Interview Board Member' },
    { text: '"The AI interview coach is remarkable — it simulates real interview pressure and gives constructive feedback"', by: 'CAHAU Representative, Hiring Panel Member' },
    { text: '"I would recommend this to every first-time job seeker I encounter"', by: 'CAHAU Representative, Recruitment Specialist' },
    { text: '"The resume analyser catches issues that even experienced candidates miss"', by: 'CAHAU Representative, HR Professional' },
  ];

  quotes.forEach((q, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = 0.5 + col * 6.2;
    const y = 1.6 + row * 2.25;

    addCard(slide, x, y, 5.9, 2.0, { fill: '0F3460' });
    // Orange left bar
    slide.addShape(pptx.ShapeType.rect, {
      x, y: y + 0.1, w: 0.06, h: 1.8,
      fill: { color: C.accentOrange },
    });
    // Quote
    slide.addText(q.text, {
      x: x + 0.25, y: y + 0.15, w: 5.4, h: 1.2,
      fontSize: 12, fontFace: 'Arial', color: C.white, italic: true, lineSpacingMultiple: 1.3, valign: 'top',
    });
    // Attribution
    slide.addText('— ' + q.by, {
      x: x + 0.25, y: y + 1.35, w: 5.4, h: 0.5,
      fontSize: 10, fontFace: 'Arial', color: C.blue5, bold: true,
    });
  });

  // Improvement badges
  slide.addText('Improvements Made Based on Feedback:', {
    x: 0.5, y: 6.15, w: 5, h: 0.35,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });

  const improvements = [
    { label: 'Added Data-Light Mode', color: C.teal },
    { label: 'Simplified Navigation', color: C.primary },
    { label: 'Added Onboarding Flow', color: C.accentPurple },
  ];

  improvements.forEach((imp, i) => {
    const x = 5.5 + i * 2.7;
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 6.15, w: 2.4, h: 0.4,
      fill: { color: imp.color }, rectRadius: 0.08,
    });
    slide.addText('✓  ' + imp.label, {
      x, y: 6.15, w: 2.4, h: 0.4,
      fontSize: 10, fontFace: 'Arial', color: C.white, bold: true, align: 'center', valign: 'middle',
    });
  });

  addSlideNumber(slide, 16);
}

// ═══════════════════════════════════════════════
// SLIDE 17: CONCLUSION
// ═══════════════════════════════════════════════
function buildSlide17() {
  const slide = pptx.addSlide();
  addLightBg(slide);

  slide.addText('CONCLUSION', {
    x: 0.6, y: 0.3, w: 5, h: 0.5,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('Our Path Forward', {
    x: 0.6, y: 0.7, w: 8, h: 0.6,
    fontSize: 24, fontFace: 'Arial', color: C.primaryDark, bold: true,
  });

  // 3 pillar cards
  const pillars = [
    { title: 'Accessible Technology', desc: 'Mobile-first, data-light AI tools that work for every South African youth, regardless of device or connectivity.', icon: '📱', color: C.primary },
    { title: 'Empowered Youth', desc: 'Professional career development resources that transform job seekers from invisible applicants to confident candidates.', icon: '🎓', color: C.teal },
    { title: 'Systemic Impact', desc: 'Bridging the gap between unemployment and opportunity at scale, creating lasting change in SA\'s employment landscape.', icon: '🌍', color: C.accentOrange },
  ];

  pillars.forEach((p, i) => {
    const x = 0.5 + i * 4.15;
    addCard(slide, x, 1.5, 3.9, 2.5, { fill: C.white });

    // Icon circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 1.4, y: 1.7, w: 0.8, h: 0.8,
      fill: { color: p.color },
    });
    slide.addText(p.icon, {
      x: x + 1.4, y: 1.7, w: 0.8, h: 0.8,
      fontSize: 20, align: 'center', valign: 'middle',
    });

    slide.addText(p.title, {
      x, y: 2.6, w: 3.9, h: 0.4,
      fontSize: 14, fontFace: 'Arial', color: C.primaryDark, bold: true, align: 'center',
    });
    slide.addText(p.desc, {
      x: x + 0.2, y: 3.05, w: 3.5, h: 0.8,
      fontSize: 11, fontFace: 'Arial', color: C.textDark, align: 'center', valign: 'top', lineSpacingMultiple: 1.3,
    });
  });

  // 4 stat boxes
  const stats = [
    { num: '46.1%', label: 'Youth Unemployment', color: C.accentRed },
    { num: '73%', label: 'Mobile-Only Users', color: C.primary },
    { num: '87%', label: 'Need CV Help', color: C.accentOrange },
    { num: '100%', label: 'Our Commitment', color: C.teal },
  ];

  stats.forEach((s, i) => {
    const x = 0.5 + i * 3.15;
    addCard(slide, x, 4.3, 2.9, 1.3, { fill: s.color });
    slide.addText(s.num, {
      x, y: 4.35, w: 2.9, h: 0.6,
      fontSize: 24, fontFace: 'Arial', color: C.white, bold: true, align: 'center',
    });
    slide.addText(s.label, {
      x, y: 4.95, w: 2.9, h: 0.4,
      fontSize: 11, fontFace: 'Arial', color: C.white, align: 'center',
    });
  });

  // Vision statement
  addCard(slide, 0.5, 5.9, 12.33, 1.0, { fill: C.primaryDark });
  slide.addText('OUR VISION', {
    x: 0.7, y: 5.95, w: 3, h: 0.3,
    fontSize: 11, fontFace: 'Arial', color: C.accentOrange, bold: true,
  });
  slide.addText('Every young South African deserves the tools to present their best self to employers. NexTech Career App makes that possible — one download at a time.', {
    x: 0.7, y: 6.25, w: 11.8, h: 0.55,
    fontSize: 14, fontFace: 'Arial', color: C.white, lineSpacingMultiple: 1.3,
  });

  addFooterLine(slide, true);
  addSlideNumber(slide, 17);
}

// ═══════════════════════════════════════════════
// SLIDE 18: THANK YOU
// ═══════════════════════════════════════════════
function buildSlide18() {
  const slide = pptx.addSlide();
  addDarkBg(slide);

  // Decorative elements
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H,
    fill: { color: C.primary }, opacity: 15,
  });

  // Orange accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.2, y: 1.5, w: 3.0, h: 0.06,
    fill: { color: C.accentOrange },
  });

  // Thank You
  slide.addText('Thank You', {
    x: 0, y: 1.8, w: W, h: 1.2,
    fontSize: 48, fontFace: 'Arial', color: C.white, bold: true, align: 'center',
  });

  // Team names
  slide.addText('NexTech Group', {
    x: 0, y: 3.3, w: W, h: 0.5,
    fontSize: 16, fontFace: 'Arial', color: C.accentOrange, bold: true, align: 'center',
  });

  slide.addText('Mohau Mphanya  •  Sive Mtengwana  •  Lesedi Ledwaba', {
    x: 0, y: 3.8, w: W, h: 0.5,
    fontSize: 14, fontFace: 'Arial', color: C.blue5, align: 'center',
  });

  // Course
  slide.addText('Technopreneurship NTEC62110  |  Sol Plaatje University  |  June 2026', {
    x: 0, y: 4.5, w: W, h: 0.4,
    fontSize: 11, fontFace: 'Arial', color: C.midGray, align: 'center',
  });

  // Motto
  addCard(slide, 3.5, 5.3, 6.33, 0.7, { fill: C.accentOrange, radius: 0.12 });
  slide.addText('Together, we can bridge the gap.', {
    x: 3.5, y: 5.3, w: 6.33, h: 0.7,
    fontSize: 16, fontFace: 'Arial', color: C.white, bold: true, align: 'center', valign: 'middle', italic: true,
  });

  addSlideNumber(slide, 18);
}

// ═══════════════════════════════════════════════
// BUILD ALL SLIDES
// ═══════════════════════════════════════════════
console.log('Building presentation...');
buildSlide1();
buildSlide2();
buildSlide3();
buildSlide4();
buildSlide5();
buildSlide6();
buildSlide7();
buildSlide8();
buildSlide9();
buildSlide10();
buildSlide11();
buildSlide12();
buildSlide13();
buildSlide14();
buildSlide15();
buildSlide16();
buildSlide17();
buildSlide18();

const outputPath = '/home/z/my-project/output/NexTech_Design_Thinking_Presentation.pptx';
pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`✅ Presentation saved to: ${outputPath}`);
    console.log(`   Slides: 18`);
  })
  .catch(err => {
    console.error('❌ Error saving presentation:', err);
    process.exit(1);
  });
