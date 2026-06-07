const fs = require('fs');
const path = require('path');

const C = {
  bg: '#191919',
  surface: '#262626',
  surfaceCard: '#2A2A3C',
  indigo: '#6366F1',
  teal: '#14b8a6',
  tealLight: '#2dd4bf',
  red: '#FB2C36',
  redLight: '#FF6467',
  white: '#FFFFFF',
  textSec: 'rgba(255,255,255,0.70)',
  textMuted: '#8F8F8F',
  border: 'rgba(255,255,255,0.12)',
};

const base = (bg, content) => `<body style="width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;background-color:${bg};font-family:'Microsoft YaHei','Corbel',sans-serif;display:flex;flex-direction:column;">${content}</body>`;

const slides = [];

// SLIDE 1: COVER
slides.push(base('transparent', `
<div style="position:absolute;top:0;left:0;width:720pt;height:405pt;">
  <img src="images/cover-bg.png" style="width:720pt;height:405pt;object-fit:cover;display:block;"/>
</div>
<div style="position:absolute;top:0;left:0;width:720pt;height:405pt;background-color:rgba(15,15,26,0.65);"></div>
<div style="position:relative;z-index:1;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 60pt;">
  <div style="width:40pt;height:3pt;background:${C.teal};margin:0 0 20pt 0;"></div>
  <h1 style="font-size:32pt;font-weight:bold;color:${C.white};margin:0 0 8pt 0;line-height:1.2;text-align:center;">Addressing Youth Unemployment</h1>
  <h1 style="font-size:32pt;font-weight:bold;color:${C.indigo};margin:0 0 16pt 0;line-height:1.2;text-align:center;">in South Africa</h1>
  <div style="width:40pt;height:3pt;background:${C.teal};margin:0 0 20pt 0;"></div>
  <p style="font-size:16pt;color:${C.textSec};margin:0 0 24pt 0;line-height:1.4;text-align:center;">NexTech Career App — AI-Powered Mobile Career Support</p>
  <p style="font-size:11pt;color:${C.textMuted};margin:0;line-height:1.5;text-align:center;white-space:nowrap;">NexTech Group  ·  Mohau Mphanya  ·  Sive Mtengwana  ·  Lesedi Ledwaba</p>
  <p style="font-size:10pt;color:${C.textMuted};margin:6pt 0 0 0;line-height:1.4;text-align:center;white-space:nowrap;">Technopreneurship NTEC62110  |  Sol Plaatje University  |  June 2026</p>
</div>`));

// SLIDE 2: CRISIS AT A GLANCE
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.indigo};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.indigo};letter-spacing:2pt;margin:0 0 6pt 0;">INTRODUCTION</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">Crisis at a Glance</span>
</div>
<div style="padding:20pt 48pt 0 48pt;display:flex;gap:14pt;">
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:20pt 14pt;text-align:center;">
    <p style="font-size:34pt;font-weight:bold;color:${C.indigo};margin:0 0 6pt 0;line-height:1;">46.1%</p>
    <p style="font-size:12pt;color:${C.textSec};margin:0;line-height:1.4;">Youth Unemployed</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:20pt 14pt;text-align:center;">
    <p style="font-size:34pt;font-weight:bold;color:${C.teal};margin:0 0 6pt 0;line-height:1;">~60%</p>
    <p style="font-size:12pt;color:${C.textSec};margin:0;line-height:1.4;">Ages 15-24</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:20pt 14pt;text-align:center;">
    <p style="font-size:34pt;font-weight:bold;color:${C.red};margin:0 0 6pt 0;line-height:1;">4.8%</p>
    <p style="font-size:12pt;color:${C.textSec};margin:0;line-height:1.4;">Matric Grads Employed</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:20pt 14pt;text-align:center;">
    <p style="font-size:34pt;font-weight:bold;color:${C.indigo};margin:0 0 6pt 0;line-height:1;">118K+</p>
    <p style="font-size:12pt;color:${C.textSec};margin:0;line-height:1.4;">Unfilled Tech Jobs</p>
  </div>
</div>
<div style="padding:16pt 48pt 0 48pt;display:flex;gap:14pt;">
  <div style="flex:1;background:rgba(99,102,241,0.08);border-left:3pt solid ${C.indigo};border-radius:0 8pt 8pt 0;padding:12pt 16pt;">
    <p style="font-size:12pt;color:${C.white};margin:0;line-height:1.5;">Youth unemployment in SA has reached crisis levels, threatening social stability and economic growth for an entire generation.</p>
  </div>
  <div style="flex:1;background:rgba(20,184,166,0.08);border-left:3pt solid ${C.teal};border-radius:0 8pt 8pt 0;padding:12pt 16pt;">
    <p style="font-size:12pt;color:${C.white};margin:0;line-height:1.5;">Millions of young South Africans lack access to digital tools, professional networks, and career guidance needed to compete.</p>
  </div>
</div>`));

// SLIDE 3: OUR RESEARCH (EMPATHISE)
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.teal};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.teal};letter-spacing:2pt;margin:0 0 6pt 0;">EMPATHISE — 5 MARKS</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">Our Research</span>
</div>
<div style="padding:16pt 48pt 0 48pt;display:flex;gap:16pt;">
  <div style="width:300pt;flex-shrink:0;">
    <div style="background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:16pt 18pt;margin-bottom:12pt;">
      <p style="font-size:14pt;font-weight:bold;color:${C.indigo};margin:0 0 8pt 0;">Primary Research</p>
      <ul style="font-size:12pt;color:${C.textSec};margin:0;padding-left:18pt;line-height:20pt;">
        <li>15 in-depth interviews with unemployed youth aged 18-35</li>
        <li>Recruitment agent insights from hiring processes</li>
        <li>Career counsellor perspectives on guidance gaps</li>
        <li>Focus groups in Kimberley township areas</li>
      </ul>
    </div>
    <div style="background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:16pt 18pt;">
      <p style="font-size:14pt;font-weight:bold;color:${C.teal};margin:0 0 8pt 0;">Secondary Research</p>
      <ul style="font-size:12pt;color:${C.textSec};margin:0;padding-left:18pt;line-height:20pt;">
        <li>Stats SA quarterly labour force surveys</li>
        <li>News articles on youth employment crisis</li>
        <li>Social media sentiment analysis</li>
        <li>Academic research on SA job market barriers</li>
      </ul>
    </div>
  </div>
  <div style="width:300pt;flex-shrink:0;">
    <div style="background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:16pt 18pt;margin-bottom:12pt;">
      <p style="font-size:14pt;font-weight:bold;color:${C.white};margin:0 0 8pt 0;">Key Findings</p>
      <ul style="font-size:12pt;color:${C.textSec};margin:0;padding-left:18pt;line-height:20pt;">
        <li><b style="color:${C.indigo};">87%</b> don't know how to write a professional CV</li>
        <li><b style="color:${C.indigo};">92%</b> have no interview preparation resources</li>
        <li><b style="color:${C.teal};">73%</b> rely solely on mobile phones for internet</li>
        <li><b style="color:${C.teal};">65%</b> find existing platforms confusing</li>
      </ul>
    </div>
    <div style="background:rgba(99,102,241,0.1);border:1pt solid rgba(99,102,241,0.2);border-radius:10pt;padding:14pt 18pt;">
      <p style="font-size:11pt;font-style:italic;color:${C.textSec};margin:0;line-height:1.5;">"I know I can do the job, but I don't know how to show it on paper. Every time I apply online, I feel invisible."</p>
      <p style="font-size:10pt;color:${C.textMuted};margin:8pt 0 0 0;">— Thabo, 24, Kimberley</p>
    </div>
  </div>
</div>`));

// SLIDE 4: EMPATHY MAP
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.indigo};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.indigo};letter-spacing:2pt;margin:0 0 6pt 0;">EMPATHISE — 5 MARKS</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">Empathy Map</span>
</div>
<div style="padding:16pt 48pt 0 48pt;display:flex;gap:12pt;">
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.indigo};border-radius:0 0 8pt 8pt;padding:14pt 12pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.indigo};margin:0 0 8pt 0;">SAYS</p>
    <ul style="font-size:10pt;color:${C.textSec};margin:0;padding-left:14pt;line-height:17pt;">
      <li>"I don't know how to write a CV"</li>
      <li>"Online applications are too complicated"</li>
      <li>"No one calls me back"</li>
      <li>"I can't afford data to browse jobs"</li>
    </ul>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.teal};border-radius:0 0 8pt 8pt;padding:14pt 12pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.teal};margin:0 0 8pt 0;">THINKS</p>
    <ul style="font-size:10pt;color:${C.textSec};margin:0;padding-left:14pt;line-height:17pt;">
      <li>"I'm not good enough"</li>
      <li>"The system is rigged against me"</li>
      <li>"Education didn't prepare me for this"</li>
      <li>"I'll never escape unemployment"</li>
    </ul>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.indigo};border-radius:0 0 8pt 8pt;padding:14pt 12pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.indigo};margin:0 0 8pt 0;">DOES</p>
    <ul style="font-size:10pt;color:${C.textSec};margin:0;padding-left:14pt;line-height:17pt;">
      <li>Applies to dozens of jobs with same CV</li>
      <li>Asks friends for help with applications</li>
      <li>Gives up after multiple rejections</li>
      <li>Borrows money for internet cafe visits</li>
    </ul>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.teal};border-radius:0 0 8pt 8pt;padding:14pt 12pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.teal};margin:0 0 8pt 0;">FEELS</p>
    <ul style="font-size:10pt;color:${C.textSec};margin:0;padding-left:14pt;line-height:17pt;">
      <li>Frustrated by constant rejection</li>
      <li>Overwhelmed by complex processes</li>
      <li>Hopeless about future prospects</li>
      <li>Embarrassed to ask for help</li>
    </ul>
  </div>
</div>`));

// SLIDE 5: THE NUMBERS
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.teal};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.teal};letter-spacing:2pt;margin:0 0 6pt 0;">DATA &amp; INSIGHTS</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">The Numbers Behind the Crisis</span>
</div>
<div style="padding:20pt 48pt 0 48pt;display:flex;gap:14pt;">
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:18pt 14pt;text-align:center;">
    <p style="font-size:34pt;font-weight:bold;color:${C.indigo};margin:0 0 4pt 0;line-height:1;">46.1%</p>
    <p style="font-size:11pt;font-weight:bold;color:${C.white};margin:0 0 4pt 0;">Youth Unemployment Rate</p>
    <p style="font-size:9pt;color:${C.textMuted};margin:0;line-height:1.4;">Q1 2024 — among the highest globally. Over 4.9 million young South Africans seeking work.</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:18pt 14pt;text-align:center;">
    <p style="font-size:34pt;font-weight:bold;color:${C.teal};margin:0 0 4pt 0;line-height:1;">73%</p>
    <p style="font-size:11pt;font-weight:bold;color:${C.white};margin:0 0 4pt 0;">Mobile-Only Internet Users</p>
    <p style="font-size:9pt;color:${C.textMuted};margin:0;line-height:1.4;">The majority of SA youth access the internet exclusively via mobile phones.</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:18pt 14pt;text-align:center;">
    <p style="font-size:34pt;font-weight:bold;color:${C.red};margin:0 0 4pt 0;line-height:1;">87%</p>
    <p style="font-size:11pt;font-weight:bold;color:${C.white};margin:0 0 4pt 0;">Cannot Write Professional CVs</p>
    <p style="font-size:9pt;color:${C.textMuted};margin:0;line-height:1.4;">The vast majority of young job seekers have never received CV writing guidance.</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:18pt 14pt;text-align:center;">
    <p style="font-size:34pt;font-weight:bold;color:${C.indigo};margin:0 0 4pt 0;line-height:1;">92%</p>
    <p style="font-size:11pt;font-weight:bold;color:${C.white};margin:0 0 4pt 0;">No Interview Preparation</p>
    <p style="font-size:9pt;color:${C.textMuted};margin:0;line-height:1.4;">Almost all respondents reported zero access to interview coaching or mock interviews.</p>
  </div>
</div>`));

// SLIDE 6: UNDERSTANDING THE BARRIERS
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.indigo};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.indigo};letter-spacing:2pt;margin:0 0 6pt 0;">PROBLEM ANALYSIS</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">Understanding the Barriers</span>
</div>
<div style="padding:14pt 48pt 0 48pt;">
  <div style="background:rgba(99,102,241,0.1);border:1pt solid rgba(99,102,241,0.25);border-radius:10pt;padding:14pt 20pt;text-align:center;margin-bottom:14pt;">
    <p style="font-size:10pt;color:${C.indigo};margin:0 0 4pt 0;">CORE PROBLEM</p>
    <p style="font-size:13pt;color:${C.white};margin:0;line-height:1.5;">South African youth face a systemic barrier to employment: they lack access to professional career development tools, guidance, and resources essential for competing in the modern job market.</p>
  </div>
</div>
<div style="padding:0 48pt 0 48pt;display:flex;gap:14pt;">
  <div style="width:200pt;flex-shrink:0;background:${C.surface};border-left:3pt solid ${C.indigo};border-radius:0 8pt 8pt 0;padding:14pt 16pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.indigo};margin:0 0 6pt 0;">Skills Presentation Gap</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.5;">Youth cannot effectively present their skills and qualifications to employers. CVs are poorly structured and fail to highlight relevant competencies.</p>
  </div>
  <div style="width:200pt;flex-shrink:0;background:${C.surface};border-left:3pt solid ${C.teal};border-radius:0 8pt 8pt 0;padding:14pt 16pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.teal};margin:0 0 6pt 0;">Digital Access Divide</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.5;">Desktop-only solutions exclude the 73% who rely solely on mobile. Data-heavy platforms are unusable on limited prepaid data bundles.</p>
  </div>
  <div style="width:200pt;flex-shrink:0;background:${C.surface};border-left:3pt solid ${C.indigo};border-radius:0 8pt 8pt 0;padding:14pt 16pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.indigo};margin:0 0 6pt 0;">Guidance Void</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.5;">No access to interview coaching, career counselling, or professional mentorship. Young job seekers navigate the process entirely alone.</p>
  </div>
</div>`));

// SLIDE 7: PROBLEM STATEMENT (DEFINE)
slides.push(base('transparent', `
<div style="position:absolute;top:0;left:0;width:720pt;height:405pt;">
  <img src="images/divider-bg.png" style="width:720pt;height:405pt;object-fit:cover;display:block;"/>
</div>
<div style="position:absolute;top:0;left:0;width:720pt;height:405pt;background-color:rgba(15,15,26,0.80);"></div>
<div style="position:relative;z-index:1;flex:1;display:flex;flex-direction:column;padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.teal};letter-spacing:2pt;margin:0 0 6pt 0;">DEFINE — 10 MARKS</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">Problem Statement</span>
  <div style="background:rgba(99,102,241,0.12);border:1pt solid rgba(99,102,241,0.3);border-radius:10pt;padding:14pt 20pt;margin-top:14pt;">
    <p style="font-size:12pt;font-style:italic;color:${C.white};margin:0;line-height:1.6;">"Young South Africans aged 18-35 who are actively seeking employment lack accessible, mobile-friendly tools to create professional application materials, prepare for interviews, and navigate career pathways — resulting in systemic exclusion from the formal job market despite available opportunities."</p>
  </div>
  <div style="margin-top:14pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.indigo};margin:0 0 10pt 0;">FIVE WHYS — Root Cause Analysis</p>
  </div>
  <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:6pt;">
    <p style="font-size:11pt;font-weight:bold;color:${C.teal};margin:0;white-space:nowrap;width:220pt;">1. Why are youth unemployed?</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;">They cannot effectively compete for available positions</p>
  </div>
  <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:6pt;">
    <p style="font-size:11pt;font-weight:bold;color:${C.teal};margin:0;white-space:nowrap;width:220pt;">2. Why can't they compete?</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;">They lack professional CVs, cover letters, and interview skills</p>
  </div>
  <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:6pt;">
    <p style="font-size:11pt;font-weight:bold;color:${C.teal};margin:0;white-space:nowrap;width:220pt;">3. Why do they lack these?</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;">No access to career guidance or professional development tools</p>
  </div>
  <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:6pt;">
    <p style="font-size:11pt;font-weight:bold;color:${C.teal};margin:0;white-space:nowrap;width:220pt;">4. Why no access?</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;">Existing solutions are desktop-only, expensive, or data-heavy</p>
  </div>
  <div style="display:flex;align-items:flex-start;gap:8pt;">
    <p style="font-size:11pt;font-weight:bold;color:${C.teal};margin:0;white-space:nowrap;width:220pt;">5. Why mobile-only solutions fail?</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;">The market has ignored mobile-first, data-light career tools for SA youth</p>
  </div>
</div>`));

// SLIDE 8: PAIN POINTS
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.teal};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.teal};letter-spacing:2pt;margin:0 0 6pt 0;">USER PERSPECTIVE</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">Pain Points from the Ground</span>
</div>
<div style="padding:16pt 48pt 0 48pt;display:flex;gap:12pt;">
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.red};border-radius:0 0 8pt 8pt;padding:14pt 12pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.red};margin:0 0 6pt 0;">Application Fatigue</p>
    <p style="font-size:10pt;font-style:italic;color:${C.textSec};margin:0;line-height:1.5;">"I've applied to over 100 jobs and heard back from none."</p>
    <p style="font-size:9pt;color:${C.textMuted};margin:6pt 0 0 0;">— Sive, 22</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.indigo};border-radius:0 0 8pt 8pt;padding:14pt 12pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.indigo};margin:0 0 6pt 0;">CV Blindness</p>
    <p style="font-size:10pt;font-style:italic;color:${C.textSec};margin:0;line-height:1.5;">"I don't know what employers want to see. My CV looks the same as everyone else's."</p>
    <p style="font-size:9pt;color:${C.textMuted};margin:6pt 0 0 0;">— Naledi, 25</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.teal};border-radius:0 0 8pt 8pt;padding:14pt 12pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.teal};margin:0 0 6pt 0;">Interview Anxiety</p>
    <p style="font-size:10pt;font-style:italic;color:${C.textSec};margin:0;line-height:1.5;">"I've never had a professional interview. When I finally got one, I froze completely."</p>
    <p style="font-size:9pt;color:${C.textMuted};margin:6pt 0 0 0;">— Thabo, 24</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.indigo};border-radius:0 0 8pt 8pt;padding:14pt 12pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.indigo};margin:0 0 6pt 0;">Digital Exclusion</p>
    <p style="font-size:10pt;font-style:italic;color:${C.textSec};margin:0;line-height:1.5;">"Everything wants a laptop. I only have my phone and R20 data that lasts 2 days."</p>
    <p style="font-size:9pt;color:${C.textMuted};margin:6pt 0 0 0;">— Karabo, 21</p>
  </div>
</div>
<div style="padding:14pt 48pt 0 48pt;">
  <div style="background:rgba(20,184,166,0.1);border:1pt solid rgba(20,184,166,0.25);border-radius:8pt;padding:10pt 16pt;">
    <p style="font-size:11pt;font-weight:bold;color:${C.teal};margin:0;line-height:1.4;">KEY TAKEAWAY: Young South Africans are not lazy or unqualified — they are systematically underserved by existing career development infrastructure.</p>
  </div>
</div>`));

// SLIDE 9: EXISTING SOLUTIONS
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.indigo};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.indigo};letter-spacing:2pt;margin:0 0 6pt 0;">CURRENT LANDSCAPE</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">Existing Solutions &amp; Their Gaps</span>
</div>
<div style="padding:16pt 48pt 0 48pt;display:flex;gap:14pt;">
  <div style="width:300pt;flex-shrink:0;">
    <div style="background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:14pt 16pt;margin-bottom:10pt;">
      <p style="font-size:13pt;font-weight:bold;color:${C.indigo};margin:0 0 4pt 0;">LinkedIn</p>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;">Professional networking — desktop-centric, data-heavy, Western-oriented</p>
    </div>
    <div style="background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:14pt 16pt;margin-bottom:10pt;">
      <p style="font-size:13pt;font-weight:bold;color:${C.indigo};margin:0 0 4pt 0;">Indeed / CareerJunction</p>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;">Job search engines — focus on listing, not preparation or guidance</p>
    </div>
    <div style="background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:14pt 16pt;">
      <p style="font-size:13pt;font-weight:bold;color:${C.indigo};margin:0 0 4pt 0;">Government Youth Programmes</p>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;">NYDA, YES Programme — limited reach, bureaucratic, no digital tools</p>
    </div>
  </div>
  <div style="width:300pt;flex-shrink:0;">
    <p style="font-size:13pt;font-weight:bold;color:${C.red};margin:0 0 10pt 0;">Key Limitations</p>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:10pt;">
      <div style="width:6pt;height:6pt;background:${C.red};border-radius:50%;flex-shrink:0;margin-top:5pt;"></div>
      <p style="font-size:12pt;color:${C.textSec};margin:0;line-height:1.4;"><b style="color:${C.white};">Not Mobile-First</b> — Desktop interfaces exclude 73% of target audience</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:10pt;">
      <div style="width:6pt;height:6pt;background:${C.red};border-radius:50%;flex-shrink:0;margin-top:5pt;"></div>
      <p style="font-size:12pt;color:${C.textSec};margin:0;line-height:1.4;"><b style="color:${C.white};">No AI Guidance</b> — No personalised career advice or interview prep</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:10pt;">
      <div style="width:6pt;height:6pt;background:${C.red};border-radius:50%;flex-shrink:0;margin-top:5pt;"></div>
      <p style="font-size:12pt;color:${C.textSec};margin:0;line-height:1.4;"><b style="color:${C.white};">Data-Heavy</b> — Unusable on prepaid data bundles</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;">
      <div style="width:6pt;height:6pt;background:${C.red};border-radius:50%;flex-shrink:0;margin-top:5pt;"></div>
      <p style="font-size:12pt;color:${C.textSec};margin:0;line-height:1.4;"><b style="color:${C.white};">SA Context Ignored</b> — No localisation for SA job market norms</p>
    </div>
  </div>
</div>`));

// SLIDE 10: THE OPPORTUNITY
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.teal};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.teal};letter-spacing:2pt;margin:0 0 6pt 0;">THE OPPORTUNITY</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">Where Others Fall Short, We Step In</span>
</div>
<div style="padding:16pt 48pt 0 48pt;display:flex;gap:12pt;">
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.teal};border-radius:0 0 8pt 8pt;padding:14pt 12pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.teal};margin:0 0 6pt 0;">Mobile-First AI Tools</p>
    <p style="font-size:10pt;color:${C.textSec};margin:0;line-height:1.5;">Build professional CVs, cover letters, and prepare for interviews — all from a mobile phone.</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.indigo};border-radius:0 0 8pt 8pt;padding:14pt 12pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.indigo};margin:0 0 6pt 0;">SA Market Localised</p>
    <p style="font-size:10pt;color:${C.textSec};margin:0;line-height:1.5;">Designed specifically for South African job market norms and unique challenges faced by SA youth.</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.teal};border-radius:0 0 8pt 8pt;padding:14pt 12pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.teal};margin:0 0 6pt 0;">Data-Light Architecture</p>
    <p style="font-size:10pt;color:${C.textSec};margin:0;line-height:1.5;">Optimised for low-bandwidth environments with offline capabilities. Works on R20 prepaid data.</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.indigo};border-radius:0 0 8pt 8pt;padding:14pt 12pt;">
    <p style="font-size:13pt;font-weight:bold;color:${C.indigo};margin:0 0 6pt 0;">AI Personalisation</p>
    <p style="font-size:10pt;color:${C.textSec};margin:0;line-height:1.5;">Intelligent resume analysis, interview coaching, and career pathway recommendations tailored to each user.</p>
  </div>
</div>
<div style="padding:14pt 48pt 0 48pt;">
  <div style="background:rgba(99,102,241,0.1);border:1pt solid rgba(99,102,241,0.25);border-radius:8pt;padding:10pt 16pt;">
    <p style="font-size:10pt;color:${C.indigo};margin:0 0 4pt 0;font-weight:bold;">THE CRITICAL GAP</p>
    <p style="font-size:11pt;color:${C.white};margin:0;line-height:1.4;">No existing solution combines mobile-first design, AI-powered career tools, data-light architecture, and South African localisation in a single platform. NexTech fills this gap.</p>
  </div>
</div>`));

// SLIDE 11: IDEATE - 5 SOLUTIONS
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.indigo};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.indigo};letter-spacing:2pt;margin:0 0 6pt 0;">IDEATE — 10 MARKS</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">5 Solutions Explored</span>
</div>
<div style="padding:16pt 48pt 0 48pt;display:flex;gap:12pt;">
  <div style="width:118pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.red};border-radius:0 0 8pt 8pt;padding:12pt 10pt;">
    <p style="font-size:9pt;color:${C.red};margin:0 0 4pt 0;font-weight:bold;">DISCARDED</p>
    <p style="font-size:12pt;font-weight:bold;color:${C.white};margin:0 0 4pt 0;">WhatsApp Chatbot</p>
    <p style="font-size:9pt;color:${C.textSec};margin:0;line-height:1.4;">Limited formatting, no document generation, poor UX</p>
  </div>
  <div style="width:118pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.red};border-radius:0 0 8pt 8pt;padding:12pt 10pt;">
    <p style="font-size:9pt;color:${C.red};margin:0 0 4pt 0;font-weight:bold;">DISCARDED</p>
    <p style="font-size:12pt;font-weight:bold;color:${C.white};margin:0 0 4pt 0;">Web-Only Portal</p>
    <p style="font-size:9pt;color:${C.textSec};margin:0;line-height:1.4;">Excludes 73% mobile-only users, requires broadband</p>
  </div>
  <div style="width:118pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.red};border-radius:0 0 8pt 8pt;padding:12pt 10pt;">
    <p style="font-size:9pt;color:${C.red};margin:0 0 4pt 0;font-weight:bold;">DISCARDED</p>
    <p style="font-size:12pt;font-weight:bold;color:${C.white};margin:0 0 4pt 0;">Physical Workshops</p>
    <p style="font-size:9pt;color:${C.textSec};margin:0;line-height:1.4;">Scalability issues, high cost, geographic limitations</p>
  </div>
  <div style="width:118pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.red};border-radius:0 0 8pt 8pt;padding:12pt 10pt;">
    <p style="font-size:9pt;color:${C.red};margin:0 0 4pt 0;font-weight:bold;">DISCARDED</p>
    <p style="font-size:12pt;font-weight:bold;color:${C.white};margin:0 0 4pt 0;">SMS-Based System</p>
    <p style="font-size:9pt;color:${C.textSec};margin:0;line-height:1.4;">Too limited for CV generation, no multimedia</p>
  </div>
  <div style="width:118pt;flex-shrink:0;background:rgba(20,184,166,0.12);border:2pt solid ${C.teal};border-radius:8pt;padding:12pt 10pt;">
    <p style="font-size:9pt;color:${C.teal};margin:0 0 4pt 0;font-weight:bold;">SELECTED</p>
    <p style="font-size:12pt;font-weight:bold;color:${C.teal};margin:0 0 4pt 0;">NexTech Career App</p>
    <p style="font-size:9pt;color:${C.textSec};margin:0;line-height:1.4;">Mobile-first, AI-powered, data-light, SA-localised</p>
  </div>
</div>
<div style="padding:12pt 48pt 0 48pt;">
  <div style="background:rgba(20,184,166,0.08);border:1pt solid rgba(20,184,166,0.2);border-radius:8pt;padding:10pt 16pt;">
    <p style="font-size:11pt;color:${C.white};margin:0;line-height:1.4;">The NexTech Career App was selected because it uniquely addresses all four critical barriers: mobile accessibility, AI-powered guidance, data-light architecture, and South African localisation.</p>
  </div>
</div>`));

// SLIDE 12: OUR SOLUTION
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.teal};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.teal};letter-spacing:2pt;margin:0 0 6pt 0;">OUR SOLUTION</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">NexTech Career App</span>
</div>
<div style="padding:16pt 48pt 0 48pt;display:flex;gap:14pt;">
  <div style="width:192pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:16pt 16pt;">
    <p style="font-size:16pt;font-weight:bold;color:${C.indigo};margin:0 0 8pt 0;">Resume Builder</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.5;">AI-powered resume creation with professional templates, step-by-step guidance, and ATS optimisation. Build a standout CV in minutes.</p>
  </div>
  <div style="width:192pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:16pt 16pt;">
    <p style="font-size:16pt;font-weight:bold;color:${C.teal};margin:0 0 8pt 0;">Cover Letter Generator</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.5;">Personalised cover letters tailored to each job application. AI analyses job descriptions and crafts targeted, compelling letters.</p>
  </div>
  <div style="width:192pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:16pt 16pt;">
    <p style="font-size:16pt;font-weight:bold;color:${C.indigo};margin:0 0 8pt 0;">AI Interview Coach</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.5;">Practice interviews with AI-powered coaching. Get real-time feedback on answers and confidence-building exercises.</p>
  </div>
</div>
<div style="padding:14pt 48pt 0 48pt;display:flex;gap:12pt;justify-content:center;">
  <div style="background:rgba(20,184,166,0.12);border-radius:20pt;padding:6pt 16pt;">
    <p style="font-size:10pt;font-weight:bold;color:${C.teal};margin:0;">Mobile-First</p>
  </div>
  <div style="background:rgba(99,102,241,0.12);border-radius:20pt;padding:6pt 16pt;">
    <p style="font-size:10pt;font-weight:bold;color:${C.indigo};margin:0;">Data-Light</p>
  </div>
  <div style="background:rgba(20,184,166,0.12);border-radius:20pt;padding:6pt 16pt;">
    <p style="font-size:10pt;font-weight:bold;color:${C.teal};margin:0;">AI-Powered</p>
  </div>
  <div style="background:rgba(99,102,241,0.12);border-radius:20pt;padding:6pt 16pt;">
    <p style="font-size:10pt;font-weight:bold;color:${C.indigo};margin:0;">Accessible</p>
  </div>
</div>
<div style="padding:10pt 48pt 0 48pt;">
  <p style="font-size:12pt;color:${C.white};margin:0;text-align:center;line-height:1.4;">AI-powered career support in your pocket — built for South African youth, by South African youth.</p>
</div>`));

// SLIDE 13: DETAILED FEATURES
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.indigo};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.indigo};letter-spacing:2pt;margin:0 0 6pt 0;">FEATURES</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">Detailed Feature Walkthrough</span>
</div>
<div style="padding:16pt 48pt 0 48pt;display:flex;gap:14pt;">
  <div style="width:192pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.indigo};border-radius:0 0 8pt 8pt;padding:14pt 14pt;">
    <p style="font-size:14pt;font-weight:bold;color:${C.indigo};margin:0 0 8pt 0;">Resume Builder</p>
    <ul style="font-size:10pt;color:${C.textSec};margin:0;padding-left:14pt;line-height:17pt;">
      <li>AI-powered content suggestions</li>
      <li>Professional ATS-optimised templates</li>
      <li>Step-by-step guided CV creation</li>
      <li>Real-time quality scoring</li>
      <li>Export to PDF from mobile</li>
      <li>Multiple CV versions</li>
    </ul>
  </div>
  <div style="width:192pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.teal};border-radius:0 0 8pt 8pt;padding:14pt 14pt;">
    <p style="font-size:14pt;font-weight:bold;color:${C.teal};margin:0 0 8pt 0;">Cover Letter Generator</p>
    <ul style="font-size:10pt;color:${C.textSec};margin:0;padding-left:14pt;line-height:17pt;">
      <li>AI analyses job postings</li>
      <li>Personalised letters matching skills</li>
      <li>Professional tone auto-applied</li>
      <li>One-tap generation + edit option</li>
      <li>Saved templates for quick use</li>
      <li>Industry-specific keywords</li>
    </ul>
  </div>
  <div style="width:192pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.indigo};border-radius:0 0 8pt 8pt;padding:14pt 14pt;">
    <p style="font-size:14pt;font-weight:bold;color:${C.indigo};margin:0 0 8pt 0;">AI Interview Coach</p>
    <ul style="font-size:10pt;color:${C.textSec};margin:0;padding-left:14pt;line-height:17pt;">
      <li>Voice-powered mock interviews</li>
      <li>Real-time AI feedback on responses</li>
      <li>Industry-specific question banks</li>
      <li>Body language tips</li>
      <li>Confidence-building exercises</li>
      <li>Progress tracking over time</li>
    </ul>
  </div>
</div>`));

// SLIDE 14: PROTOTYPE & TECHNOLOGY
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.teal};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.teal};letter-spacing:2pt;margin:0 0 6pt 0;">PROTOTYPE — 10 MARKS</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">Prototype &amp; Technology</span>
</div>
<div style="padding:14pt 48pt 0 48pt;display:flex;gap:14pt;">
  <div style="width:290pt;flex-shrink:0;">
    <p style="font-size:14pt;font-weight:bold;color:${C.indigo};margin:0 0 8pt 0;">Technology Stack</p>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:6pt;">
      <div style="width:6pt;height:6pt;background:${C.teal};border-radius:50%;flex-shrink:0;margin-top:5pt;"></div>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;"><b style="color:${C.white};">Frontend:</b> Next.js 16 + React 19 + TypeScript</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:6pt;">
      <div style="width:6pt;height:6pt;background:${C.teal};border-radius:50%;flex-shrink:0;margin-top:5pt;"></div>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;"><b style="color:${C.white};">Styling:</b> Tailwind CSS 4 + shadcn/ui</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:6pt;">
      <div style="width:6pt;height:6pt;background:${C.teal};border-radius:50%;flex-shrink:0;margin-top:5pt;"></div>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;"><b style="color:${C.white};">Backend:</b> Next.js API Routes + Prisma ORM</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:6pt;">
      <div style="width:6pt;height:6pt;background:${C.teal};border-radius:50%;flex-shrink:0;margin-top:5pt;"></div>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;"><b style="color:${C.white};">AI Engine:</b> OpenAI GPT-4 + Whisper ASR</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:6pt;">
      <div style="width:6pt;height:6pt;background:${C.teal};border-radius:50%;flex-shrink:0;margin-top:5pt;"></div>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;"><b style="color:${C.white};">Database:</b> SQLite (data-light) via Prisma</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;">
      <div style="width:6pt;height:6pt;background:${C.teal};border-radius:50%;flex-shrink:0;margin-top:5pt;"></div>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;"><b style="color:${C.white};">Deployment:</b> Vercel (CDN-optimised for SA)</p>
    </div>
  </div>
  <div style="width:310pt;flex-shrink:0;">
    <p style="font-size:14pt;font-weight:bold;color:${C.teal};margin:0 0 8pt 0;">User Flow</p>
    <div style="background:${C.surface};border:1pt solid ${C.border};border-radius:8pt;padding:12pt 14pt;">
      <p style="font-size:11pt;color:${C.white};margin:0;line-height:1.6;">Sign Up → Onboarding → Dashboard → Choose Tool → Build / Prepare → Review → Export / Practice → Track Progress</p>
    </div>
    <p style="font-size:10pt;color:${C.textMuted};margin:8pt 0 0 0;line-height:1.4;">Each step is optimised for mobile screens, minimal data usage, and intuitive navigation with progressive disclosure.</p>
    <p style="font-size:14pt;font-weight:bold;color:${C.indigo};margin:14pt 0 8pt 0;">Design Principles</p>
    <div style="display:flex;gap:8pt;">
      <div style="background:rgba(99,102,241,0.1);border-radius:16pt;padding:5pt 12pt;">
        <p style="font-size:10pt;font-weight:bold;color:${C.indigo};margin:0;">Mobile-First</p>
      </div>
      <div style="background:rgba(20,184,166,0.1);border-radius:16pt;padding:5pt 12pt;">
        <p style="font-size:10pt;font-weight:bold;color:${C.teal};margin:0;">Data-Light</p>
      </div>
      <div style="background:rgba(99,102,241,0.1);border-radius:16pt;padding:5pt 12pt;">
        <p style="font-size:10pt;font-weight:bold;color:${C.indigo};margin:0;">Accessible</p>
      </div>
    </div>
  </div>
</div>`));

// SLIDE 15: COMPETITIVE ADVANTAGE
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.indigo};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.indigo};letter-spacing:2pt;margin:0 0 6pt 0;">COMPETITIVE ADVANTAGE</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">Why NexTech Wins</span>
</div>
<div style="padding:16pt 48pt 0 48pt;display:flex;gap:16pt;">
  <div style="width:300pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:16pt 18pt;">
    <p style="font-size:15pt;font-weight:bold;color:${C.red};margin:0 0 12pt 0;">Current Systems</p>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.red};margin:0;">✕</p>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;">Desktop-only interfaces</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.red};margin:0;">✕</p>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;">Data-heavy, requires broadband</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.red};margin:0;">✕</p>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;">No AI-powered guidance</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.red};margin:0;">✕</p>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;">Generic, not SA-localised</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.red};margin:0;">✕</p>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;">No interview preparation</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.red};margin:0;">✕</p>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;">Expensive premium features</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.red};margin:0;">✕</p>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;">Complex, overwhelming UX</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;">
      <p style="font-size:11pt;color:${C.red};margin:0;">✕</p>
      <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.4;">No offline functionality</p>
    </div>
  </div>
  <div style="width:300pt;flex-shrink:0;background:${C.surface};border:1pt solid rgba(20,184,166,0.3);border-radius:10pt;padding:16pt 18pt;">
    <p style="font-size:15pt;font-weight:bold;color:${C.teal};margin:0 0 12pt 0;">NexTech Career App</p>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.teal};margin:0;">✓</p>
      <p style="font-size:11pt;color:${C.white};margin:0;line-height:1.4;">Mobile-first design</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.teal};margin:0;">✓</p>
      <p style="font-size:11pt;color:${C.white};margin:0;line-height:1.4;">Data-light, works on prepaid</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.teal};margin:0;">✓</p>
      <p style="font-size:11pt;color:${C.white};margin:0;line-height:1.4;">AI-powered career coaching</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.teal};margin:0;">✓</p>
      <p style="font-size:11pt;color:${C.white};margin:0;line-height:1.4;">Built for South African context</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.teal};margin:0;">✓</p>
      <p style="font-size:11pt;color:${C.white};margin:0;line-height:1.4;">Interview preparation built-in</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.teal};margin:0;">✓</p>
      <p style="font-size:11pt;color:${C.white};margin:0;line-height:1.4;">Core features free to use</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:8pt;">
      <p style="font-size:11pt;color:${C.teal};margin:0;">✓</p>
      <p style="font-size:11pt;color:${C.white};margin:0;line-height:1.4;">Simple, guided user experience</p>
    </div>
    <div style="display:flex;align-items:flex-start;gap:8pt;">
      <p style="font-size:11pt;color:${C.teal};margin:0;">✓</p>
      <p style="font-size:11pt;color:${C.white};margin:0;line-height:1.4;">Offline capability with caching</p>
    </div>
  </div>
</div>`));

// SLIDE 16: CAHAU FEEDBACK
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.teal};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.teal};letter-spacing:2pt;margin:0 0 6pt 0;">TEST — 5 MARKS</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">CAHAU Feedback</span>
</div>
<div style="padding:14pt 48pt 0 48pt;display:flex;gap:14pt;">
  <div style="width:340pt;flex-shrink:0;">
    <div style="background:rgba(99,102,241,0.08);border:1pt solid rgba(99,102,241,0.2);border-radius:10pt;padding:12pt 16pt;margin-bottom:10pt;">
      <p style="font-size:11pt;font-style:italic;color:${C.white};margin:0;line-height:1.5;">"This is exactly what candidates need — most applicants fail because they don't know how to present themselves"</p>
      <p style="font-size:9pt;color:${C.indigo};margin:6pt 0 0 0;">— CAHAU Representative, Job Interview Board Member</p>
    </div>
    <div style="background:rgba(20,184,166,0.08);border:1pt solid rgba(20,184,166,0.2);border-radius:10pt;padding:12pt 16pt;">
      <p style="font-size:11pt;font-style:italic;color:${C.white};margin:0;line-height:1.5;">"The AI interview coach is remarkable — it simulates real interview pressure and gives constructive feedback"</p>
      <p style="font-size:9pt;color:${C.teal};margin:6pt 0 0 0;">— CAHAU Representative, Hiring Panel Member</p>
    </div>
  </div>
  <div style="width:260pt;flex-shrink:0;">
    <div style="background:rgba(99,102,241,0.08);border:1pt solid rgba(99,102,241,0.2);border-radius:10pt;padding:12pt 16pt;margin-bottom:10pt;">
      <p style="font-size:11pt;font-style:italic;color:${C.white};margin:0;line-height:1.5;">"I would recommend this to every first-time job seeker I encounter"</p>
      <p style="font-size:9pt;color:${C.indigo};margin:6pt 0 0 0;">— CAHAU Representative, Recruitment Specialist</p>
    </div>
    <div style="background:rgba(20,184,166,0.08);border:1pt solid rgba(20,184,166,0.2);border-radius:10pt;padding:12pt 16pt;">
      <p style="font-size:11pt;font-style:italic;color:${C.white};margin:0;line-height:1.5;">"The resume analyser catches issues that even experienced candidates miss"</p>
      <p style="font-size:9pt;color:${C.teal};margin:6pt 0 0 0;">— CAHAU Representative, HR Professional</p>
    </div>
  </div>
</div>
<div style="padding:10pt 48pt 0 48pt;">
  <div style="background:rgba(20,184,166,0.1);border:1pt solid rgba(20,184,166,0.25);border-radius:8pt;padding:10pt 16pt;">
    <p style="font-size:11pt;font-weight:bold;color:${C.teal};margin:0 0 6pt 0;">Improvements Made Based on Feedback:</p>
    <div style="display:flex;gap:12pt;">
      <div style="display:flex;align-items:center;gap:4pt;">
        <p style="font-size:11pt;color:${C.teal};margin:0;">✓</p>
        <p style="font-size:11pt;color:${C.white};margin:0;">Added Data-Light:1.4;">— CAHAU Representative, Job Interview Board Member</p>
    </div>
    <div style="background:rgba(20,184,166,0.08);border:1pt solid rgba(20,184,166,0.2);border-radius:10pt;padding:12pt 16pt;">
      <p style="font-size:11pt;font-style:italic;color:${C.white};margin:0;line-height:1.5;">"The AI interview coach is remarkable — it simulates real interview pressure and gives constructive feedback"</p>
      <p style="font-size:9pt;color:${C.teal};margin:6pt 0 0 0;">— CAHAU Representative, Hiring Panel Member</p>
    </div>
  </div>
  <div style="width:260pt;flex-shrink:0;">
    <div style="background:rgba(99,102,241,0.08);border:1pt solid rgba(99,102,241,0.2);border-radius:10pt;padding:12pt 16pt;margin-bottom:10pt;">
      <p style="font-size:11pt;font-style:italic;color:${C.white};margin:0;line-height:1.5;">"I would recommend this to every first-time job seeker I encounter"</p>
      <p style="font-size:9pt;color:${C.indigo};margin:6pt 0 0 0;">— CAHAU Representative, Recruitment Specialist</p>
    </div>
    <div style="background:rgba(20,184,166,0.08);border:1pt solid rgba(20,184,166,0.2);border-radius:10pt;padding:12pt 16pt;">
      <p style="font-size:11pt;font-style:italic;color:${C.white};margin:0;line-height:1.5;">"The resume analyser catches issues that even experienced candidates miss"</p>
      <p style="font-size:9pt;color:${C.teal};margin:6pt 0 0 0;">— CAHAU Representative, HR Professional</p>
    </div>
  </div>
</div>
<div style="padding:10pt 48pt 0 48pt;">
  <div style="background:rgba(20,184,166,0.1);border:1pt solid rgba(20,184,166,0.25);border-radius:8pt;padding:10pt 16pt;">
    <p style="font-size:11pt;font-weight:bold;color:${C.teal};margin:0 0 6pt 0;">Improvements Made Based on Feedback:</p>
    <div style="display:flex;gap:12pt;">
      <div style="display:flex;align-items:center;gap:4pt;">
        <p style="font-size:11pt;color:${C.teal};margin:0;">✓</p>
        <p style="font-size:11pt;color:${C.white};margin:0;">Added Data-Light Mode</p>
      </div>
      <div style="display:flex;align-items:center;gap:4pt;">
        <p style="font-size:11pt;color:${C.teal};margin:0;">✓</p>
        <p style="font-size:11pt;color:${C.white};margin:0;">Simplified Navigation</p>
      </div>
      <div style="display:flex;align-items:center;gap:4pt;">
        <p style="font-size:11pt;color:${C.teal};margin:0;">✓</p>
        <p style="font-size:11pt;color:${C.white};margin:0;">Added Onboarding Flow</p>
      </div>
    </div>
  </div>
</div>`));

// SLIDE 17: CONCLUSION
slides.push(base(C.bg, `
<div style="height:4pt;background:${C.indigo};"></div>
<div style="padding:28pt 48pt 0 48pt;">
  <p style="font-size:10pt;color:${C.indigo};letter-spacing:2pt;margin:0 0 6pt 0;">CONCLUSION</p>
  <span style="font-size:26pt;font-weight:bold;color:${C.white};">Our Path Forward</span>
</div>
<div style="padding:16pt 48pt 0 48pt;display:flex;gap:14pt;">
  <div style="width:192pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.teal};border-radius:0 0 8pt 8pt;padding:16pt 14pt;">
    <p style="font-size:14pt;font-weight:bold;color:${C.teal};margin:0 0 8pt 0;">Accessible Technology</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.5;">Mobile-first, data-light AI tools that work for every South African youth, regardless of device or connectivity.</p>
  </div>
  <div style="width:192pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.indigo};border-radius:0 0 8pt 8pt;padding:16pt 14pt;">
    <p style="font-size:14pt;font-weight:bold;color:${C.indigo};margin:0 0 8pt 0;">Empowered Youth</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.5;">Professional career development resources that transform job seekers from invisible applicants to confident candidates.</p>
  </div>
  <div style="width:192pt;flex-shrink:0;background:${C.surface};border-top:3pt solid ${C.teal};border-radius:0 0 8pt 8pt;padding:16pt 14pt;">
    <p style="font-size:14pt;font-weight:bold;color:${C.teal};margin:0 0 8pt 0;">Systemic Impact</p>
    <p style="font-size:11pt;color:${C.textSec};margin:0;line-height:1.5;">Bridging the gap between unemployment and opportunity at scale, creating lasting change in SA's employment landscape.</p>
  </div>
</div>
<div style="padding:14pt 48pt 0 48pt;display:flex;gap:14pt;">
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:14pt 14pt;text-align:center;">
    <p style="font-size:28pt;font-weight:bold;color:${C.indigo};margin:0 0 4pt 0;line-height:1;">46.1%</p>
    <p style="font-size:10pt;color:${C.textSec};margin:0;">Youth Unemployment</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:14pt 14pt;text-align:center;">
    <p style="font-size:28pt;font-weight:bold;color:${C.teal};margin:0 0 4pt 0;line-height:1;">73%</p>
    <p style="font-size:10pt;color:${C.textSec};margin:0;">Mobile-Only Users</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:14pt 14pt;text-align:center;">
    <p style="font-size:28pt;font-weight:bold;color:${C.indigo};margin:0 0 4pt 0;line-height:1;">87%</p>
    <p style="font-size:10pt;color:${C.textSec};margin:0;">Need CV Help</p>
  </div>
  <div style="width:148pt;flex-shrink:0;background:${C.surface};border:1pt solid ${C.border};border-radius:10pt;padding:14pt 14pt;text-align:center;">
    <p style="font-size:28pt;font-weight:bold;color:${C.teal};margin:0 0 4pt 0;line-height:1;">100%</p>
    <p style="font-size:10pt;color:${C.textSec};margin:0;">Our Commitment</p>
  </div>
</div>`));

// SLIDE 18: THANK YOU
slides.push(base('transparent', `
<div style="position:absolute;top:0;left:0;width:720pt;height:405pt;">
  <img src="images/closing-bg.png" style="width:720pt;height:405pt;object-fit:cover;display:block;"/>
</div>
<div style="position:absolute;top:0;left:0;width:720pt;height:405pt;background-color:rgba(15,15,26,0.70);"></div>
<div style="position:relative;z-index:1;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 60pt;">
  <div style="width:10pt;height:10pt;border-radius:50%;background:${C.teal};margin:0 0 24pt 0;"></div>
  <h1 style="font-size:38pt;font-weight:bold;color:${C.white};margin:0 0 12pt 0;line-height:1.2;text-align:center;">Thank You</h1>
  <div style="width:48pt;height:3pt;background:${C.teal};margin:0 0 20pt 0;"></div>
  <p style="font-size:14pt;color:${C.indigo};margin:0 0 20pt 0;line-height:1.4;text-align:center;font-weight:bold;">NexTech Group</p>
  <p style="font-size:12pt;color:${C.textSec};margin:0 0 6pt 0;line-height:1.5;text-align:center;white-space:nowrap;">Mohau Mphanya  ·  Sive Mtengwana  ·  Lesedi Ledwaba</p>
  <p style="font-size:11pt;color:${C.textMuted};margin:0 0 16pt 0;line-height:1.5;text-align:center;white-space:nowrap;">Technopreneurship NTEC62110  |  Sol Plaatje University  |  June 2026</p>
  <p style="font-size:13pt;color:${C.teal};margin:0;line-height:1.4;text-align:center;font-style:italic;">Together, we can bridge the gap.</p>
</div>`));

// Write all slides
slides.forEach((html, i) => {
  const num = String(i + 1).padStart(2, '0');
  fs.writeFileSync(path.join('slides', `slide${num}.html`), html);
});
console.log(`Wrote ${slides.length} slide HTML files`);
