const pptxgen = require('pptxgenjs');
const html2pptx = require('/tmp/my-project/skills/ppt/scripts/html2pptx');
const fs = require('fs');
const path = require('path');

// ============================================================
// THEME: Ocean (Deep Sea Blue) — Accent A (teal)
// ============================================================
const C = {
  'primary-100': '#0D1525',
  'primary-90':  '#122040',
  'primary-80':  '#1B2A4A',
  'primary-60':  '#3D5A80',
  'primary-40':  '#6B8AB0',
  'primary-20':  '#B0C4DE',
  'primary-10':  '#DFE8F2',
  'primary-5':   '#F0F4F8',
  'accent':      '#2A9D8F',
  'accent-b':    '#D7A460',
  'accent-c':    '#6C92E0',
  'on-dark':     '#FFFFFF',
  'on-dark-sec': 'rgba(255,255,255,0.70)',
  'background':  '#FFFFFF',
  'surface':     '#F0F4F8',
  'surface-card':'#FFFFFF',
  'border':      '#DFE8F2',
};

const IMG = '/home/z/my-project/workspace/images';
const SLIDES = '/home/z/my-project/workspace/slides';

// Consistent title bar: dark bar with accent line
function titleBar(title) {
  return `
  <div style="height:56pt;background:${C['primary-90']};display:flex;align-items:center;padding:0 48pt;">
    <div style="width:4pt;height:28pt;background:${C['accent']};margin-right:16pt;border-radius:2pt;"></div>
    <h2 style="font-size:22pt;font-weight:bold;color:${C['on-dark']};margin:0;line-height:1.25;">${title}</h2>
  </div>`;
}

// ============================================================
// SLIDE HTML DEFINITIONS
// ============================================================

const slideHtmls = [];

// --- SLIDE 1: Cover (dark hero with gradient) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-image:url('${IMG}/cover-gradient.png');background-size:cover;font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  <div style="height:4pt;background:${C['accent']};"></div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 80pt;">
    <div style="width:10pt;height:10pt;border-radius:50%;background:${C['accent']};margin-bottom:20pt;"></div>
    <p style="font-size:12pt;font-weight:bold;color:${C['accent']};margin:0 0 16pt 0;letter-spacing:3pt;text-transform:uppercase;">Group Assignment</p>
    <h1 style="font-size:36pt;font-weight:bold;color:${C['on-dark']};margin:0 0 8pt 0;line-height:1.15;text-align:center;">Addressing Youth Unemployment</h1>
    <h1 style="font-size:36pt;font-weight:bold;color:${C['on-dark']};margin:0 0 12pt 0;line-height:1.15;text-align:center;">in South Africa</h1>
    <div style="width:48pt;height:3pt;background:${C['accent']};margin:16pt 0;"></div>
    <p style="font-size:16pt;color:${C['on-dark-sec']};margin:0 0 24pt 0;line-height:1.4;text-align:center;">NexTech Career App — A Design Thinking Approach</p>
    <p style="font-size:13pt;color:${C['on-dark-sec']};margin:0;line-height:1.5;text-align:center;">NexTech Group: Mohau Mphanya, Sive Mtengwana, Lesedi Ledwaba</p>
    <p style="font-size:11pt;color:${C['primary-40']};margin:8pt 0 0 0;text-align:center;">Sol Plaatje University | Technopreneurship NTEC62110 | April 2026</p>
  </div>
</body>`);

// --- SLIDE 2: Introduction — The Crisis at a Glance (light bg) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['background']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  ${titleBar('Introduction: The Crisis at a Glance')}
  <div style="flex:1;display:flex;padding:20pt 48pt 36pt 48pt;gap:24pt;">
    <div style="width:200pt;flex-shrink:0;background:${C['primary-90']};border-radius:12pt;padding:24pt;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <p style="font-size:56pt;font-weight:bold;color:${C['accent']};margin:0;line-height:1;text-align:center;">46.1%</p>
      <p style="font-size:13pt;color:${C['on-dark-sec']};margin:12pt 0 0 0;line-height:1.4;text-align:center;">Youth Unemployment Rate in South Africa</p>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:12pt;">
      <div style="display:flex;align-items:flex-start;gap:12pt;">
        <div style="width:3pt;min-height:32pt;background:${C['accent']};border-radius:2pt;margin-top:2pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:15pt;font-weight:bold;color:${C['primary-80']};margin:0 0 4pt 0;line-height:1.4;">Critical Levels Reached</p>
          <p style="font-size:13pt;color:${C['primary-60']};margin:0;line-height:1.5;">Youth unemployment has reached critical levels, creating a national emergency demanding innovative solutions.</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12pt;">
        <div style="width:3pt;min-height:32pt;background:${C['accent']};border-radius:2pt;margin-top:2pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:15pt;font-weight:bold;color:${C['primary-80']};margin:0 0 4pt 0;line-height:1.4;">The Digital Divide</p>
          <p style="font-size:13pt;color:${C['primary-60']};margin:0;line-height:1.5;">Limited digital access worsens the situation, creating barriers between young job seekers and employment opportunities.</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12pt;">
        <div style="width:3pt;min-height:32pt;background:${C['accent']};border-radius:2pt;margin-top:2pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:15pt;font-weight:bold;color:${C['primary-80']};margin:0 0 4pt 0;line-height:1.4;">Economic and Social Impact</p>
          <p style="font-size:13pt;color:${C['primary-60']};margin:0;line-height:1.5;">This issue negatively affects economic growth and social stability, creating a cycle of poverty and inequality.</p>
        </div>
      </div>
    </div>
  </div>
</body>`);

// --- SLIDE 3: EMPATHISE — Our Research (dark bg with numbered items) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['primary-90']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;">
  <div style="height:4pt;background:${C['accent']};"></div>
  <div style="padding:28pt 48pt 0 48pt;display:flex;align-items:center;gap:12pt;">
    <div style="background:${C['accent']};border-radius:4pt;padding:4pt 12pt;">
      <p style="font-size:11pt;font-weight:bold;color:#FFFFFF;margin:0;letter-spacing:1pt;">EMPATHISE</p>
    </div>
    <span style="font-size:26pt;font-weight:bold;color:${C['on-dark']};">Our Research Methodology</span>
  </div>
  <div style="padding:12pt 48pt 36pt 48pt;display:flex;flex-direction:column;gap:8pt;">
    <div style="background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:8pt;padding:12pt 18pt;display:flex;align-items:flex-start;gap:10pt;">
      <div style="width:26pt;height:26pt;background:${C['accent']};border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:12pt;font-weight:bold;color:#FFFFFF;">1</span>
      </div>
      <div style="flex:1;min-width:0;">
        <p style="font-size:14pt;font-weight:bold;color:${C['on-dark']};margin:0 0 2pt 0;">Primary Research: Interviews</p>
        <p style="font-size:12pt;color:${C['on-dark-sec']};margin:0;line-height:1.4;">15 young job seekers (18-30), 1 recruitment agent, 1 career counsellor in Kimberley</p>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:8pt;padding:12pt 18pt;display:flex;align-items:flex-start;gap:10pt;">
      <div style="width:26pt;height:26pt;background:${C['accent']};border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:12pt;font-weight:bold;color:#FFFFFF;">2</span>
      </div>
      <div style="flex:1;min-width:0;">
        <p style="font-size:14pt;font-weight:bold;color:${C['on-dark']};margin:0 0 2pt 0;">Secondary Research: Data Analysis</p>
        <p style="font-size:12pt;color:${C['on-dark-sec']};margin:0;line-height:1.4;">Stats SA labour force data, local news on youth employment, social media analysis</p>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:8pt;padding:12pt 18pt;display:flex;align-items:flex-start;gap:10pt;">
      <div style="width:26pt;height:26pt;background:${C['accent']};border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:12pt;font-weight:bold;color:#FFFFFF;">3</span>
      </div>
      <div style="flex:1;min-width:0;">
        <p style="font-size:14pt;font-weight:bold;color:${C['on-dark']};margin:0 0 2pt 0;">Observation: Online Behaviour</p>
        <p style="font-size:12pt;color:${C['on-dark-sec']};margin:0;line-height:1.4;">How job seekers use existing platforms — mobile patterns, data constraints, pain points</p>
      </div>
    </div>
    <div style="background:rgba(42,157,143,0.15);border:1pt solid ${C['accent']};border-radius:8pt;padding:10pt 18pt;">
      <p style="font-size:12pt;color:${C['on-dark']};margin:0;line-height:1.4;"><b style="color:${C['accent']};">Key Quote:</b> <i>"I have a degree but I do not know how to write a proper CV."</i> — Thabo, 24</p>
    </div>
  </div>
</body>`);

// --- SLIDE 4: EMPATHISE — Empathy Map & Key Insights (surface bg, 2x2 grid) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['surface']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  ${titleBar('Empathise: Empathy Map')}
  <div style="flex:1;padding:12pt 48pt 36pt 48pt;display:flex;gap:12pt;">
    <div style="width:306pt;flex-shrink:0;display:flex;flex-direction:column;gap:10pt;">
      <div style="background:${C['surface-card']};border-radius:8pt;padding:12pt 14pt;border-left:4pt solid ${C['accent']};box-shadow:0 2pt 6pt rgba(0,0,0,0.06);flex:1;">
        <p style="font-size:13pt;font-weight:bold;color:${C['accent']};margin:0 0 4pt 0;">SAYS</p>
        <p style="font-size:11pt;color:${C['primary-60']};margin:0;line-height:1.4;">"I don't know how to write a CV" | "Job sites are too confusing" | "Data is too expensive"</p>
      </div>
      <div style="background:${C['surface-card']};border-radius:8pt;padding:12pt 14pt;border-left:4pt solid ${C['accent-b']};box-shadow:0 2pt 6pt rgba(0,0,0,0.06);flex:1;">
        <p style="font-size:13pt;font-weight:bold;color:${C['accent-b']};margin:0 0 4pt 0;">THINKS</p>
        <p style="font-size:11pt;color:${C['primary-60']};margin:0;line-height:1.4;">"There must be a better way" | "I am qualified but invisible" | "I feel stuck"</p>
      </div>
    </div>
    <div style="width:306pt;flex-shrink:0;display:flex;flex-direction:column;gap:10pt;">
      <div style="background:${C['surface-card']};border-radius:8pt;padding:12pt 14pt;border-left:4pt solid ${C['accent-c']};box-shadow:0 2pt 6pt rgba(0,0,0,0.06);flex:1;">
        <p style="font-size:13pt;font-weight:bold;color:${C['accent-c']};margin:0 0 4pt 0;">DOES</p>
        <p style="font-size:11pt;color:${C['primary-60']};margin:0;line-height:1.4;">Borrows data from friends | Asks family for CV help | Uses phone for all job searching</p>
      </div>
      <div style="background:${C['surface-card']};border-radius:8pt;padding:12pt 14pt;border-left:4pt solid #E05555;box-shadow:0 2pt 6pt rgba(0,0,0,0.06);flex:1;">
        <p style="font-size:13pt;font-weight:bold;color:#E05555;margin:0 0 4pt 0;">FEELS</p>
        <p style="font-size:11pt;color:${C['primary-60']};margin:0;line-height:1.4;">Frustrated by systems | Overwhelmed | Invisible to employers | Anxious | Hopeless</p>
      </div>
    </div>
  </div>
</body>`);

// --- SLIDE 5: Data & Insights — Key Statistics (dark KPI dashboard) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['primary-100']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;">
  <div style="padding:32pt 48pt 0 48pt;text-align:center;">
    <p style="font-size:11pt;font-weight:bold;color:${C['accent']};margin:0 0 8pt 0;letter-spacing:2pt;">DATA &amp; INSIGHTS</p>
    <p style="font-size:26pt;font-weight:bold;color:${C['on-dark']};margin:0;">Key Statistics</p>
    <p style="font-size:12pt;color:${C['on-dark-sec']};margin:6pt 0 0 0;">The numbers tell a compelling story of urgency</p>
  </div>
  <div style="padding:20pt 48pt 36pt 48pt;display:flex;gap:16pt;justify-content:center;">
    <div style="width:140pt;background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:10pt;padding:20pt 12pt;text-align:center;">
      <p style="font-size:36pt;font-weight:bold;color:${C['accent']};margin:0 0 6pt 0;white-space:nowrap;">46.1%</p>
      <p style="font-size:11pt;color:${C['on-dark-sec']};margin:0;line-height:1.3;">Youth Unemployment (15-34)</p>
    </div>
    <div style="width:140pt;background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:10pt;padding:20pt 12pt;text-align:center;">
      <p style="font-size:36pt;font-weight:bold;color:${C['accent']};margin:0 0 6pt 0;white-space:nowrap;">~60%</p>
      <p style="font-size:11pt;color:${C['on-dark-sec']};margin:0;line-height:1.3;">Young Adults 15-24 Unemployed</p>
    </div>
    <div style="width:140pt;background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:10pt;padding:20pt 12pt;text-align:center;">
      <p style="font-size:36pt;font-weight:bold;color:${C['accent']};margin:0 0 6pt 0;white-space:nowrap;">4.8%</p>
      <p style="font-size:11pt;color:${C['on-dark-sec']};margin:0;line-height:1.3;">Matric Graduates Find Jobs</p>
    </div>
    <div style="width:140pt;background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:10pt;padding:20pt 12pt;text-align:center;">
      <p style="font-size:36pt;font-weight:bold;color:${C['accent']};margin:0 0 6pt 0;white-space:nowrap;">118K+</p>
      <p style="font-size:11pt;color:${C['on-dark-sec']};margin:0;line-height:1.3;">Unfilled Tech Jobs in SA</p>
    </div>
  </div>
  <div style="padding:0 48pt 36pt 48pt;text-align:center;">
    <p style="font-size:12pt;color:${C['on-dark-sec']};margin:0;line-height:1.5;">Source: Stats SA Quarterly Labour Force Survey, 2025</p>
  </div>
</body>`);

// --- SLIDE 6: Problem Analysis (light bg, accent bar bullets) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['background']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  ${titleBar('Problem Analysis: The Application &amp; Access Gap')}
  <div style="flex:1;display:flex;padding:12pt 48pt 36pt 48pt;gap:16pt;">
    <div style="width:310pt;flex-shrink:0;display:flex;flex-direction:column;justify-content:center;gap:10pt;">
      <div style="display:flex;align-items:flex-start;gap:10pt;">
        <div style="width:3pt;min-height:32pt;background:${C['accent']};border-radius:2pt;margin-top:2pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:14pt;font-weight:bold;color:${C['primary-80']};margin:0 0 3pt 0;">01 Digital Skills Gap</p>
          <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.4;">Youths lack digital skills for modern hiring systems and online job applications.</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10pt;">
        <div style="width:3pt;min-height:32pt;background:${C['accent']};border-radius:2pt;margin-top:2pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:14pt;font-weight:bold;color:${C['primary-80']};margin:0 0 3pt 0;">02 Fragmented Tools</p>
          <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.4;">Career tools scattered across multiple platforms, creating confusion for applicants.</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10pt;">
        <div style="width:3pt;min-height:32pt;background:${C['accent']};border-radius:2pt;margin-top:2pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:14pt;font-weight:bold;color:${C['primary-80']};margin:0 0 3pt 0;">03 Lack of Guidance</p>
          <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.4;">Little guidance available during application process, leaving youth to navigate alone.</p>
        </div>
      </div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      <div style="background:${C['primary-10']};border-radius:10pt;padding:20pt;border-bottom:3pt solid ${C['accent']};">
        <p style="font-size:11pt;font-weight:bold;color:${C['accent']};margin:0 0 6pt 0;letter-spacing:1pt;">CRITICAL INSIGHT</p>
        <p style="font-size:15pt;font-weight:bold;color:${C['primary-80']};margin:0 0 6pt 0;line-height:1.4;">The gap is not about capability — it is about access and guidance.</p>
        <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.4;">Young people need support navigating the digital job market, not just skills training.</p>
      </div>
    </div>
  </div>
</body>`);

// --- SLIDE 7: DEFINE — Problem Statement (bold center, dark) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['primary-90']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;">
  <div style="height:4pt;background:${C['accent']};"></div>
  <div style="display:flex;height:401pt;">
    <div style="width:260pt;background:${C['accent']};padding:48pt 32pt;display:flex;flex-direction:column;justify-content:center;">
      <p style="font-size:12pt;font-weight:bold;color:rgba(255,255,255,0.7);margin:0 0 12pt 0;letter-spacing:2pt;">DESIGN THINKING</p>
      <p style="font-size:42pt;font-weight:bold;color:#FFFFFF;line-height:1.15;margin:0;">Define</p>
      <div style="width:32pt;height:3pt;background:rgba(255,255,255,0.5);margin-top:16pt;"></div>
      <p style="font-size:13pt;color:rgba(255,255,255,0.8);margin:16pt 0 0 0;line-height:1.5;">Phase 2: Problem Statement</p>
    </div>
    <div style="flex:1;padding:32pt 36pt;display:flex;flex-direction:column;justify-content:center;gap:16pt;">
      <div style="background:rgba(255,255,255,0.08);border:1pt solid rgba(255,255,255,0.15);border-radius:10pt;padding:20pt;">
        <p style="font-size:11pt;font-weight:bold;color:${C['accent']};margin:0 0 8pt 0;letter-spacing:1pt;">PROBLEM STATEMENT</p>
        <p style="font-size:14pt;font-weight:bold;color:${C['on-dark']};margin:0;line-height:1.5;">Young South African job seekers (15-34) face an application and access gap — they possess skills and qualifications but lack the practical guidance, tools, and digital support needed to navigate the modern hiring process effectively.</p>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10pt;">
        <div style="width:4pt;height:32pt;background:${C['accent']};flex-shrink:0;border-radius:2pt;margin-top:4pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:13pt;font-weight:bold;color:${C['on-dark']};margin:0 0 3pt 0;">Root Cause</p>
          <p style="font-size:12pt;color:${C['on-dark-sec']};line-height:1.4;margin:0;">Not about capability — about access and guidance. Young people have potential but lack tools and support to present themselves effectively.</p>
        </div>
      </div>
    </div>
  </div>
</body>`);

// --- SLIDE 8: User Perspective (light bg, 2x2 grid outline cards) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['background']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  ${titleBar('User Perspective: What Young Job Seekers Face')}
  <div style="flex:1;padding:12pt 48pt 20pt 48pt;display:flex;flex-direction:column;gap:10pt;">
    <div style="display:flex;gap:14pt;">
      <div style="width:296pt;flex-shrink:0;background:${C['primary-10']};border-radius:10pt;padding:14pt 16pt;">
        <p style="font-size:15pt;font-weight:bold;color:${C['primary-80']};margin:0 0 4pt 0;">Complex Platforms</p>
        <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.4;">Job platforms are complex and difficult to navigate, with confusing interfaces that discourage young applicants.</p>
      </div>
      <div style="width:296pt;flex-shrink:0;background:${C['primary-10']};border-radius:10pt;padding:14pt 16pt;">
        <p style="font-size:15pt;font-weight:bold;color:${C['primary-80']};margin:0 0 4pt 0;">High Data Costs</p>
        <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.4;">High data costs limit the ability to search and apply for jobs. Each application consumes precious data.</p>
      </div>
    </div>
    <div style="display:flex;gap:14pt;">
      <div style="width:296pt;flex-shrink:0;background:${C['primary-10']};border-radius:10pt;padding:14pt 16pt;">
        <p style="font-size:15pt;font-weight:bold;color:${C['primary-80']};margin:0 0 4pt 0;">Mobile-Only Access</p>
        <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.4;">Many rely only on smartphones, limiting ability to use desktop-optimized platforms and create documents.</p>
      </div>
      <div style="width:296pt;flex-shrink:0;background:${C['primary-10']};border-radius:10pt;padding:14pt 16pt;">
        <p style="font-size:15pt;font-weight:bold;color:${C['primary-80']};margin:0 0 4pt 0;">Digital Skills Gap</p>
        <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.4;">Many lack skills for applications — creating CVs, writing cover letters, navigating online systems.</p>
      </div>
    </div>
    <div style="background:${C['surface']};border-radius:8pt;padding:8pt 16pt;border-left:4pt solid ${C['accent']};">
      <p style="font-size:12pt;color:${C['primary-80']};margin:0;line-height:1.4;"><b>Key Takeaway:</b> The job application ecosystem is not designed for the realities of young SA job seekers.</p>
    </div>
  </div>
</body>`);

// --- SLIDE 9: Current Landscape (light split) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['background']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  ${titleBar('Current Landscape: Solutions &amp; Limitations')}
  <div style="flex:1;display:flex;padding:12pt 48pt 36pt 48pt;gap:20pt;">
    <div style="width:296pt;flex-shrink:0;display:flex;flex-direction:column;justify-content:center;">
      <div style="width:40pt;height:3pt;background:${C['accent']};margin:0 0 10pt 0;"></div>
      <p style="font-size:17pt;font-weight:bold;color:${C['primary-80']};margin:0 0 8pt 0;">What Has Been Done</p>
      <div style="background:${C['surface']};border-radius:8pt;padding:14pt;margin-bottom:10pt;">
        <p style="font-size:13pt;font-weight:bold;color:${C['primary-80']};margin:0 0 3pt 0;">Digital Skills Programs</p>
        <p style="font-size:11pt;color:${C['primary-60']};margin:0;line-height:1.4;">Programs like MTN and UNDP provide digital skills training, helping youth develop competencies.</p>
      </div>
      <div style="background:${C['surface']};border-radius:8pt;padding:14pt;">
        <p style="font-size:13pt;font-weight:bold;color:${C['primary-80']};margin:0 0 3pt 0;">Youth Initiatives</p>
        <p style="font-size:11pt;color:${C['primary-60']};margin:0;line-height:1.4;">Initiatives aim to improve digital skills among youth, increasing access to technology education.</p>
      </div>
    </div>
    <div style="width:1pt;height:180pt;background:${C['primary-10']};"></div>
    <div style="width:296pt;flex-shrink:0;display:flex;flex-direction:column;justify-content:center;">
      <div style="width:40pt;height:3pt;background:#E05555;margin:0 0 10pt 0;"></div>
      <p style="font-size:17pt;font-weight:bold;color:${C['primary-80']};margin:0 0 8pt 0;">Critical Limitations</p>
      <ul style="font-size:12pt;color:${C['primary-60']};margin:0;padding-left:20pt;line-height:20pt;">
        <li>Transition Gap: Users struggle to move from training to employment</li>
        <li>Limited Reach: Programs only reach a small number of participants</li>
        <li>Infrastructure: Require stable internet or physical attendance</li>
        <li>Skills-Only Focus: No job application support provided</li>
      </ul>
    </div>
  </div>
</body>`);

// --- SLIDE 10: The Opportunity (surface bg, solid fill cards) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['surface']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  ${titleBar('The Opportunity: Why Change is Needed')}
  <div style="flex:1;display:flex;flex-direction:column;padding:16pt 48pt 36pt 48pt;gap:12pt;">
    <div style="display:flex;gap:16pt;">
      <div style="width:192pt;flex-shrink:0;background:${C['surface-card']};border-radius:10pt;padding:20pt 16pt;text-align:center;box-shadow:0 2pt 8pt rgba(0,0,0,0.06);">
        <p style="font-size:32pt;font-weight:bold;color:${C['accent']};margin:0 0 8pt 0;">CV</p>
        <p style="font-size:14pt;font-weight:bold;color:${C['primary-80']};margin:0 0 6pt 0;">Writing Struggles</p>
        <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.4;">Many youths struggle with CV writing, unable to create documents that pass ATS systems.</p>
      </div>
      <div style="width:192pt;flex-shrink:0;background:${C['surface-card']};border-radius:10pt;padding:20pt 16pt;text-align:center;box-shadow:0 2pt 8pt rgba(0,0,0,0.06);">
        <p style="font-size:32pt;font-weight:bold;color:${C['accent']};margin:0 0 8pt 0;">AI</p>
        <p style="font-size:14pt;font-weight:bold;color:${C['primary-80']};margin:0 0 6pt 0;">Interview Prep Gap</p>
        <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.4;">Young people lack access to interview coaching and preparation tools.</p>
      </div>
      <div style="width:192pt;flex-shrink:0;background:${C['surface-card']};border-radius:10pt;padding:20pt 16pt;text-align:center;box-shadow:0 2pt 8pt rgba(0,0,0,0.06);">
        <p style="font-size:32pt;font-weight:bold;color:${C['accent']};margin:0 0 8pt 0;">SA</p>
        <p style="font-size:14pt;font-weight:bold;color:${C['primary-80']};margin:0 0 6pt 0;">Practical Support</p>
        <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.4;">Need for practical, hands-on support tailored to South African context.</p>
      </div>
    </div>
    <div style="background:${C['primary-80']};border-radius:8pt;padding:16pt 24pt;">
      <p style="font-size:15pt;font-weight:bold;color:${C['on-dark']};margin:0;line-height:1.5;">We aim to tackle this issue through innovative technology solutions that bridge the gap between skills and employment.</p>
    </div>
  </div>
</body>`);

// --- SLIDE 11: IDEATE — 5 Solutions Brainstormed (comparison table style) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['primary-90']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;">
  <div style="height:4pt;background:${C['accent']};"></div>
  <div style="padding:24pt 48pt 0 48pt;display:flex;align-items:center;gap:12pt;">
    <div style="background:${C['accent']};border-radius:4pt;padding:4pt 12pt;">
      <p style="font-size:11pt;font-weight:bold;color:#FFFFFF;margin:0;letter-spacing:1pt;">IDEATE</p>
    </div>
    <span style="font-size:24pt;font-weight:bold;color:${C['on-dark']};">5 Solutions Brainstormed</span>
  </div>
  <div style="padding:12pt 48pt 36pt 48pt;display:flex;flex-direction:column;gap:8pt;">
    <div style="background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.10);border-radius:6pt;padding:10pt 16pt;display:flex;align-items:center;gap:12pt;">
      <div style="width:24pt;height:24pt;background:rgba(255,255,255,0.15);border-radius:4pt;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-size:12pt;font-weight:bold;color:${C['on-dark']};">1</span>
      </div>
      <p style="font-size:13pt;color:${C['on-dark']};margin:0;flex:1;min-width:0;"><b>Digital Skills Training Portal</b></p>
      <div style="background:rgba(255,80,80,0.2);border-radius:4pt;padding:2pt 8pt;flex-shrink:0;">
        <p style="font-size:11pt;color:#FF8080;margin:0;font-weight:bold;">NO</p>
      </div>
      <p style="font-size:11pt;color:${C['on-dark-sec']};margin:0;width:180pt;flex-shrink:0;">Existing solutions; does not help applications</p>
    </div>
    <div style="background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.10);border-radius:6pt;padding:10pt 16pt;display:flex;align-items:center;gap:12pt;">
      <div style="width:24pt;height:24pt;background:rgba(255,255,255,0.15);border-radius:4pt;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-size:12pt;font-weight:bold;color:${C['on-dark']};">2</span>
      </div>
      <p style="font-size:13pt;color:${C['on-dark']};margin:0;flex:1;min-width:0;"><b>Job Matching Algorithm</b></p>
      <div style="background:rgba(255,80,80,0.2);border-radius:4pt;padding:2pt 8pt;flex-shrink:0;">
        <p style="font-size:11pt;color:#FF8080;margin:0;font-weight:bold;">NO</p>
      </div>
      <p style="font-size:11pt;color:${C['on-dark-sec']};margin:0;width:180pt;flex-shrink:0;">Job boards already do this; no core gap addressed</p>
    </div>
    <div style="background:rgba(42,157,143,0.15);border:2pt solid ${C['accent']};border-radius:6pt;padding:10pt 16pt;display:flex;align-items:center;gap:12pt;">
      <div style="width:24pt;height:24pt;background:${C['accent']};border-radius:4pt;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-size:12pt;font-weight:bold;color:#FFFFFF;">3</span>
      </div>
      <p style="font-size:14pt;font-weight:bold;color:${C['on-dark']};margin:0;flex:1;min-width:0;">AI Career Companion App</p>
      <div style="background:${C['accent']};border-radius:4pt;padding:2pt 8pt;flex-shrink:0;">
        <p style="font-size:11pt;color:#FFFFFF;margin:0;font-weight:bold;">YES</p>
      </div>
      <p style="font-size:11pt;color:${C['on-dark-sec']};margin:0;width:180pt;flex-shrink:0;">Addresses all barriers; mobile-first; AI-powered guidance</p>
    </div>
    <div style="background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.10);border-radius:6pt;padding:10pt 16pt;display:flex;align-items:center;gap:12pt;">
      <div style="width:24pt;height:24pt;background:rgba(255,255,255,0.15);border-radius:4pt;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-size:12pt;font-weight:bold;color:${C['on-dark']};">4</span>
      </div>
      <p style="font-size:13pt;color:${C['on-dark']};margin:0;flex:1;min-width:0;"><b>Community Career Hubs</b></p>
      <div style="background:rgba(255,80,80,0.2);border-radius:4pt;padding:2pt 8pt;flex-shrink:0;">
        <p style="font-size:11pt;color:#FF8080;margin:0;font-weight:bold;">NO</p>
      </div>
      <p style="font-size:11pt;color:${C['on-dark-sec']};margin:0;width:180pt;flex-shrink:0;">High cost; limited reach; not scalable</p>
    </div>
    <div style="background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.10);border-radius:6pt;padding:10pt 16pt;display:flex;align-items:center;gap:12pt;">
      <div style="width:24pt;height:24pt;background:rgba(255,255,255,0.15);border-radius:4pt;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-size:12pt;font-weight:bold;color:${C['on-dark']};">5</span>
      </div>
      <p style="font-size:13pt;color:${C['on-dark']};margin:0;flex:1;min-width:0;"><b>WhatsApp Chatbot</b></p>
      <div style="background:rgba(255,80,80,0.2);border-radius:4pt;padding:2pt 8pt;flex-shrink:0;">
        <p style="font-size:11pt;color:#FF8080;margin:0;font-weight:bold;">NO</p>
      </div>
      <p style="font-size:11pt;color:${C['on-dark-sec']};margin:0;width:180pt;flex-shrink:0;">Limited functionality; cannot handle complex tasks</p>
    </div>
  </div>
</body>`);

// --- SLIDE 12: Innovation — Our Solution (dark split) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-image:url('${IMG}/teal-gradient.png');background-size:cover;font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  <div style="position:absolute;top:0;left:0;width:720pt;height:405pt;background-color:rgba(13,21,37,0.80);"></div>
  <div style="position:relative;z-index:1;flex:1;display:flex;">
    <div style="width:280pt;padding:48pt 32pt;display:flex;flex-direction:column;justify-content:center;">
      <div style="background:${C['accent']};border-radius:6pt;padding:4pt 12pt;width:80pt;margin-bottom:16pt;">
        <p style="font-size:11pt;font-weight:bold;color:#FFFFFF;margin:0;letter-spacing:1pt;">OUR SOLUTION</p>
      </div>
      <p style="font-size:34pt;font-weight:bold;color:${C['on-dark']};margin:0;line-height:1.15;">NexTech Career App</p>
      <div style="width:40pt;height:3pt;background:${C['accent']};margin:16pt 0;"></div>
      <p style="font-size:14pt;color:${C['on-dark-sec']};margin:0;line-height:1.5;">An AI-powered mobile career platform designed specifically for young South African job seekers.</p>
    </div>
    <div style="flex:1;padding:40pt 36pt;display:flex;flex-direction:column;justify-content:center;gap:14pt;">
      <div style="display:flex;align-items:flex-start;gap:10pt;">
        <div style="width:4pt;height:36pt;background:${C['accent']};flex-shrink:0;border-radius:2pt;margin-top:4pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:16pt;font-weight:bold;color:${C['on-dark']};margin:0 0 4pt 0;">AI-Powered</p>
          <p style="font-size:13pt;color:${C['on-dark-sec']};margin:0;line-height:1.5;">Intelligent analysis, suggestions, and coaching powered by large language models</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10pt;">
        <div style="width:4pt;height:36pt;background:${C['accent']};flex-shrink:0;border-radius:2pt;margin-top:4pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:16pt;font-weight:bold;color:${C['on-dark']};margin:0 0 4pt 0;">All-in-One Platform</p>
          <p style="font-size:13pt;color:${C['on-dark-sec']};margin:0;line-height:1.5;">Resume builder, cover letter generator, and interview coach in a single app</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:10pt;">
        <div style="width:4pt;height:36pt;background:${C['accent']};flex-shrink:0;border-radius:2pt;margin-top:4pt;"></div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:16pt;font-weight:bold;color:${C['on-dark']};margin:0 0 4pt 0;">Youth-Centric Design</p>
          <p style="font-size:13pt;color:${C['on-dark-sec']};margin:0;line-height:1.5;">Mobile-first, data-light, and designed for the realities of SA youth</p>
        </div>
      </div>
    </div>
  </div>
</body>`);

// --- SLIDE 13: Features — Three Card (shadow) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['surface']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  ${titleBar('Core Features')}
  <div style="flex:1;padding:20pt 48pt 36pt 48pt;display:flex;gap:16pt;align-items:center;">
    <div style="width:192pt;flex-shrink:0;background:${C['surface-card']};border-radius:10pt;padding:24pt 16pt;box-shadow:0 3pt 10pt rgba(0,0,0,0.08);display:flex;flex-direction:column;align-items:center;text-align:center;">
      <div style="width:48pt;height:48pt;background:${C['primary-10']};border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:12pt;">
        <p style="font-size:22pt;font-weight:bold;color:${C['accent']};margin:0;">CV</p>
      </div>
      <p style="font-size:16pt;font-weight:bold;color:${C['primary-80']};margin:0 0 8pt 0;">Resume Builder</p>
      <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.5;">AI-powered resume analysis and builder. Scores your resume, suggests improvements, and generates ATS-optimized versions.</p>
    </div>
    <div style="width:192pt;flex-shrink:0;background:${C['surface-card']};border-radius:10pt;padding:24pt 16pt;box-shadow:0 3pt 10pt rgba(0,0,0,0.08);display:flex;flex-direction:column;align-items:center;text-align:center;">
      <div style="width:48pt;height:48pt;background:${C['primary-10']};border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:12pt;">
        <p style="font-size:22pt;font-weight:bold;color:${C['accent']};margin:0;">CL</p>
      </div>
      <p style="font-size:16pt;font-weight:bold;color:${C['primary-80']};margin:0 0 8pt 0;">Cover Letter Generator</p>
      <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.5;">Automatically generates tailored cover letters based on your resume and the target job description.</p>
    </div>
    <div style="width:192pt;flex-shrink:0;background:${C['surface-card']};border-radius:10pt;padding:24pt 16pt;box-shadow:0 3pt 10pt rgba(0,0,0,0.08);display:flex;flex-direction:column;align-items:center;text-align:center;">
      <div style="width:48pt;height:48pt;background:${C['primary-10']};border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:12pt;">
        <p style="font-size:22pt;font-weight:bold;color:${C['accent']};margin:0;">IC</p>
      </div>
      <p style="font-size:16pt;font-weight:bold;color:${C['primary-80']};margin:0 0 8pt 0;">AI Interview Coach</p>
      <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.5;">Simulates real interview pressure with AI. Provides constructive feedback on answers, delivery, and confidence.</p>
    </div>
  </div>
</body>`);

// --- SLIDE 14: PROTOTYPE — Working App (light bg, flow diagram) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['background']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  ${titleBar('Prototype: Our Working Solution')}
  <div style="flex:1;display:flex;padding:12pt 48pt 36pt 48pt;gap:20pt;">
    <div style="width:260pt;flex-shrink:0;display:flex;flex-direction:column;justify-content:center;gap:8pt;">
      <p style="font-size:11pt;font-weight:bold;color:${C['accent']};margin:0;letter-spacing:1pt;">TECH STACK</p>
      <div style="background:${C['primary-10']};border-radius:8pt;padding:10pt 14pt;">
        <p style="font-size:13pt;font-weight:bold;color:${C['primary-80']};margin:0 0 2pt 0;">Next.js 16 + TypeScript</p>
        <p style="font-size:11pt;color:${C['primary-60']};margin:0;">Full-stack React framework</p>
      </div>
      <div style="background:${C['primary-10']};border-radius:8pt;padding:10pt 14pt;">
        <p style="font-size:13pt;font-weight:bold;color:${C['primary-80']};margin:0 0 2pt 0;">AI-Powered Analysis</p>
        <p style="font-size:11pt;color:${C['primary-60']};margin:0;">LLM integration for smart feedback</p>
      </div>
      <div style="background:${C['primary-10']};border-radius:8pt;padding:10pt 14pt;">
        <p style="font-size:13pt;font-weight:bold;color:${C['primary-80']};margin:0 0 2pt 0;">Mobile-First Design</p>
        <p style="font-size:11pt;color:${C['primary-60']};margin:0;">Optimized for smartphones</p>
      </div>
      <div style="background:${C['primary-10']};border-radius:8pt;padding:10pt 14pt;">
        <p style="font-size:13pt;font-weight:bold;color:${C['primary-80']};margin:0 0 2pt 0;">Prisma + PostgreSQL</p>
        <p style="font-size:11pt;color:${C['primary-60']};margin:0;">Secure data persistence</p>
      </div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:6pt;">
      <p style="font-size:11pt;font-weight:bold;color:${C['accent']};margin:0;letter-spacing:1pt;">USER FLOW</p>
      <div style="display:flex;align-items:center;gap:8pt;">
        <div style="background:${C['accent']};border-radius:6pt;padding:10pt 12pt;width:92pt;text-align:center;flex-shrink:0;">
          <p style="font-size:12pt;font-weight:bold;color:#FFFFFF;margin:0;">Register</p>
        </div>
        <p style="font-size:16pt;color:${C['accent']};margin:0;">&#8594;</p>
        <div style="background:${C['primary-80']};border-radius:6pt;padding:10pt 12pt;width:92pt;text-align:center;flex-shrink:0;">
          <p style="font-size:12pt;font-weight:bold;color:#FFFFFF;margin:0;">Dashboard</p>
        </div>
        <p style="font-size:16pt;color:${C['accent']};margin:0;">&#8594;</p>
        <div style="background:${C['primary-60']};border-radius:6pt;padding:10pt 12pt;width:92pt;text-align:center;flex-shrink:0;">
          <p style="font-size:12pt;font-weight:bold;color:#FFFFFF;margin:0;">Resume</p>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8pt;margin-top:4pt;">
        <div style="background:${C['primary-40']};border-radius:6pt;padding:10pt 12pt;width:92pt;text-align:center;flex-shrink:0;">
          <p style="font-size:12pt;font-weight:bold;color:#FFFFFF;margin:0;">Cover Letter</p>
        </div>
        <p style="font-size:16pt;color:${C['accent']};margin:0;">&#8594;</p>
        <div style="background:${C['accent-b']};border-radius:6pt;padding:10pt 12pt;width:92pt;text-align:center;flex-shrink:0;">
          <p style="font-size:12pt;font-weight:bold;color:#FFFFFF;margin:0;">Interview</p>
        </div>
        <p style="font-size:16pt;color:${C['accent']};margin:0;">&#8594;</p>
        <div style="background:${C['accent']};border-radius:6pt;padding:10pt 12pt;width:92pt;text-align:center;flex-shrink:0;">
          <p style="font-size:12pt;font-weight:bold;color:#FFFFFF;margin:0;">Success!</p>
        </div>
      </div>
      <div style="background:${C['surface']};border-radius:8pt;padding:12pt 16pt;border-left:4pt solid ${C['accent']};margin-top:8pt;">
        <p style="font-size:12pt;color:${C['primary-80']};margin:0;line-height:1.5;"><b>Seamless Progression:</b> Resume analysis auto-populates cover letter fields, which pre-fills interview context. One connected journey.</p>
      </div>
    </div>
  </div>
</body>`);

// --- SLIDE 15: Competitive Advantage — Gap Analysis (comparison table) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['surface']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  ${titleBar('Competitive Advantage: Gap Analysis')}
  <div style="flex:1;padding:16pt 48pt 36pt 48pt;display:flex;flex-direction:column;justify-content:center;">
    <div style="display:flex;gap:16pt;">
      <div style="width:296pt;flex-shrink:0;background:${C['surface-card']};border-radius:10pt;padding:20pt;box-shadow:0 2pt 8pt rgba(0,0,0,0.06);">
        <p style="font-size:14pt;font-weight:bold;color:${C['primary-40']};margin:0 0 12pt 0;letter-spacing:1pt;">CURRENT SYSTEMS</p>
        <ul style="font-size:13pt;color:${C['primary-60']};margin:0;padding-left:20pt;line-height:22pt;">
          <li>Fragmented tools across platforms</li>
          <li>Desktop-optimized, not mobile-first</li>
          <li>No AI guidance or feedback</li>
          <li>High data consumption</li>
          <li>Generic, not SA-contextualized</li>
        </ul>
      </div>
      <div style="width:296pt;flex-shrink:0;background:${C['primary-90']};border-radius:10pt;padding:20pt;">
        <p style="font-size:14pt;font-weight:bold;color:${C['accent']};margin:0 0 12pt 0;letter-spacing:1pt;">NEXTECH SOLUTION</p>
        <ul style="font-size:13pt;color:${C['on-dark-sec']};margin:0;padding-left:20pt;line-height:22pt;">
          <li>All-in-one integrated platform</li>
          <li>Mobile-first design philosophy</li>
          <li>AI-powered coaching and analysis</li>
          <li>Data-light mode for low bandwidth</li>
          <li>Designed for South African youth</li>
        </ul>
      </div>
    </div>
  </div>
</body>`);

// --- SLIDE 16: TESTING — Validation & CAHAU Feedback (dark bg with quote cards) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-image:url('${IMG}/success-gradient.png');background-size:cover;font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;">
  <div style="position:absolute;top:0;left:0;width:720pt;height:405pt;background-color:rgba(13,21,37,0.82);"></div>
  <div style="position:relative;z-index:1;height:405pt;display:flex;flex-direction:column;">
    <div style="height:4pt;background:${C['accent']};"></div>
    <div style="padding:20pt 48pt 0 48pt;display:flex;align-items:center;gap:12pt;">
      <div style="background:${C['accent']};border-radius:4pt;padding:4pt 12pt;">
        <p style="font-size:11pt;font-weight:bold;color:#FFFFFF;margin:0;letter-spacing:1pt;">TEST</p>
      </div>
      <span style="font-size:22pt;font-weight:bold;color:${C['on-dark']};">Validation &amp; CAHAU Feedback</span>
      <span style="font-size:13pt;color:${C['on-dark-sec']};margin-left:auto;">8 Participants Tested</span>
    </div>
    <div style="padding:10pt 48pt 0 48pt;display:flex;gap:10pt;">
      <div style="flex:1;background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:8pt;padding:10pt 14pt;">
        <p style="font-size:11pt;color:${C['accent']};margin:0 0 4pt 0;font-weight:bold;">CAHAU Representative</p>
        <p style="font-size:11pt;color:${C['on-dark']};margin:0;line-height:1.4;font-style:italic;">"This is exactly what candidates need — most applicants fail because they do not know how to present themselves"</p>
      </div>
      <div style="flex:1;background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:8pt;padding:10pt 14pt;">
        <p style="font-size:11pt;color:${C['accent']};margin:0 0 4pt 0;font-weight:bold;">CAHAU Representative</p>
        <p style="font-size:11pt;color:${C['on-dark']};margin:0;line-height:1.4;font-style:italic;">"The AI interview coach is remarkable — it simulates real interview pressure and gives constructive feedback"</p>
      </div>
    </div>
    <div style="padding:8pt 48pt 0 48pt;display:flex;gap:10pt;">
      <div style="flex:1;background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:8pt;padding:10pt 14pt;">
        <p style="font-size:11pt;color:${C['accent']};margin:0 0 4pt 0;font-weight:bold;">CAHAU Representative</p>
        <p style="font-size:11pt;color:${C['on-dark']};margin:0;line-height:1.4;font-style:italic;">"I would recommend this to every first-time job seeker I encounter"</p>
      </div>
      <div style="flex:1;background:rgba(255,255,255,0.06);border:1pt solid rgba(255,255,255,0.12);border-radius:8pt;padding:10pt 14pt;">
        <p style="font-size:11pt;color:${C['accent']};margin:0 0 4pt 0;font-weight:bold;">CAHAU Representative</p>
        <p style="font-size:11pt;color:${C['on-dark']};margin:0;line-height:1.4;font-style:italic;">"The resume analyzer catches issues that even experienced candidates miss"</p>
      </div>
    </div>
    <div style="padding:8pt 48pt 28pt 48pt;">
      <p style="font-size:11pt;font-weight:bold;color:${C['accent']};margin:0 0 6pt 0;letter-spacing:1pt;">KEY IMPROVEMENTS MADE</p>
      <div style="display:flex;gap:12pt;">
        <div style="background:rgba(42,157,143,0.15);border:1pt solid ${C['accent']};border-radius:6pt;padding:8pt 12pt;flex:1;">
          <p style="font-size:12pt;color:${C['on-dark']};margin:0;text-align:center;">Data-Light Mode</p>
        </div>
        <div style="background:rgba(42,157,143,0.15);border:1pt solid ${C['accent']};border-radius:6pt;padding:8pt 12pt;flex:1;">
          <p style="font-size:12pt;color:${C['on-dark']};margin:0;text-align:center;">Simplified Navigation</p>
        </div>
        <div style="background:rgba(42,157,143,0.15);border:1pt solid ${C['accent']};border-radius:6pt;padding:8pt 12pt;flex:1;">
          <p style="font-size:12pt;color:${C['on-dark']};margin:0;text-align:center;">Onboarding Flow</p>
        </div>
      </div>
    </div>
  </div>
</body>`);

// --- SLIDE 17: Conclusion — A Scalable Path Forward (light bg) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-color:${C['background']};font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  ${titleBar('Conclusion: A Scalable Path Forward')}
  <div style="flex:1;display:flex;padding:16pt 48pt 36pt 48pt;gap:20pt;">
    <div style="width:240pt;flex-shrink:0;background:${C['primary-90']};border-radius:12pt;padding:24pt;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <p style="font-size:48pt;font-weight:bold;color:${C['accent']};margin:0;line-height:1;text-align:center;">3</p>
      <p style="font-size:14pt;color:${C['on-dark']};margin:8pt 0 0 0;text-align:center;font-weight:bold;">Core AI Features</p>
      <div style="width:32pt;height:2pt;background:${C['accent']};margin:12pt 0;"></div>
      <p style="font-size:12pt;color:${C['on-dark-sec']};margin:0;text-align:center;line-height:1.4;">Resume, Cover Letter, Interview Coach</p>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:10pt;">
      <div style="background:${C['primary-10']};border-radius:8pt;padding:14pt 18pt;border-left:4pt solid ${C['accent']};">
        <p style="font-size:14pt;font-weight:bold;color:${C['primary-80']};margin:0 0 4pt 0;">Bridging the Gap</p>
        <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.5;">NexTech bridges the application and access gap by providing practical, AI-powered tools directly to youth on their mobile devices.</p>
      </div>
      <div style="background:${C['primary-10']};border-radius:8pt;padding:14pt 18pt;border-left:4pt solid ${C['accent-b']};">
        <p style="font-size:14pt;font-weight:bold;color:${C['primary-80']};margin:0 0 4pt 0;">Validated by Experts</p>
        <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.5;">CAHAU representatives confirmed the solution addresses real hiring pain points and recommended it for first-time job seekers.</p>
      </div>
      <div style="background:${C['primary-10']};border-radius:8pt;padding:14pt 18pt;border-left:4pt solid ${C['accent-c']};">
        <p style="font-size:14pt;font-weight:bold;color:${C['primary-80']};margin:0 0 4pt 0;">Scalable Impact</p>
        <p style="font-size:12pt;color:${C['primary-60']};margin:0;line-height:1.5;">Mobile-first, data-light design means the solution can reach millions of youth across South Africa, regardless of connectivity.</p>
      </div>
    </div>
  </div>
</body>`);

// --- SLIDE 18: Thank You (dark, echoing cover) ---
slideHtmls.push(`
<body style="margin:0;padding:0;width:720pt;height:405pt;overflow:hidden;background-image:url('${IMG}/cover-gradient.png');background-size:cover;font-family:'Trebuchet MS','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;">
  <div style="height:4pt;background:${C['accent']};"></div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 80pt;">
    <div style="width:10pt;height:10pt;border-radius:50%;background:${C['accent']};margin-bottom:20pt;"></div>
    <h1 style="font-size:40pt;font-weight:bold;color:${C['on-dark']};margin:0 0 12pt 0;line-height:1.15;text-align:center;">Thank You</h1>
    <div style="width:48pt;height:3pt;background:${C['accent']};margin:12pt 0;"></div>
    <p style="font-size:18pt;color:${C['on-dark-sec']};margin:0 0 24pt 0;line-height:1.4;text-align:center;">Questions &amp; Discussion</p>
    <p style="font-size:14pt;color:${C['on-dark-sec']};margin:0;line-height:1.5;text-align:center;">NexTech Group</p>
    <p style="font-size:12pt;color:${C['primary-40']};margin:8pt 0 0 0;text-align:center;">Mohau Mphanya | Sive Mtengwana | Lesedi Ledwaba</p>
    <p style="font-size:11pt;color:${C['primary-40']};margin:8pt 0 0 0;text-align:center;">Sol Plaatje University | Technopreneurship NTEC62110 | April 2026</p>
  </div>
</body>`);

// ============================================================
// GENERATE PPTX
// ============================================================

async function main() {
  // Write all HTML files
  for (let i = 0; i < slideHtmls.length; i++) {
    const filepath = path.join(SLIDES, `slide-${String(i).padStart(2,'0')}.html`);
    fs.writeFileSync(filepath, slideHtmls[i].trim());
  }
  console.log(`Wrote ${slideHtmls.length} HTML slide files`);

  // Create PPTX
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'NexTech Group';
  pptx.title = 'NexTech Design Thinking Presentation';
  pptx.subject = 'Addressing Youth Unemployment in South Africa';

  const fontConfig = { cjk: 'Microsoft YaHei', latin: 'Trebuchet MS' };
  const allWarnings = [];

  for (let i = 0; i < slideHtmls.length; i++) {
    const filepath = path.join(SLIDES, `slide-${String(i).padStart(2,'0')}.html`);
    console.log(`Processing slide ${i + 1}/${slideHtmls.length}...`);
    try {
      const { slide, placeholders, warnings } = await html2pptx(filepath, pptx, { fontConfig });
      allWarnings.push(...warnings.map(w => `Slide ${i+1}: ${w}`));
    } catch (e) {
      console.error(`ERROR on slide ${i+1}: ${e.message}`);
      throw e;
    }
  }

  // Report warnings
  const blocking = allWarnings.filter(w => w.includes('overflow') || w.includes('font') || w.includes('below 11pt'));
  if (blocking.length > 0) {
    console.warn('BLOCKING WARNINGS:');
    blocking.forEach(w => console.warn('  ' + w));
  }
  if (allWarnings.length > 0 && allWarnings.length <= 20) {
    console.log('All warnings:');
    allWarnings.forEach(w => console.log('  ' + w));
  } else if (allWarnings.length > 20) {
    console.log(`Total warnings: ${allWarnings.length} (showing first 10)`);
    allWarnings.slice(0, 10).forEach(w => console.log('  ' + w));
  }

  const outputPath = '/home/z/my-project/output/NexTech_Design_Thinking_Presentation.pptx';
  await pptx.writeFile({ fileName: outputPath });
  console.log(`\nPPTX saved to: ${outputPath}`);

  // Check file size
  const stats = fs.statSync(outputPath);
  console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
}

main().catch(e => { console.error(e); process.exit(1); });
