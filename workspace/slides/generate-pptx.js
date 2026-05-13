const pptxgen = require('pptxgenjs');
const html2pptx = require('./html2pptx');
const fs = require('fs');
const path = require('path');
const moduleDir = path.resolve('/home/z/my-project/node_modules');
module.paths.unshift(moduleDir);

const SLIDES_DIR = path.join(__dirname);
const OUTPUT = '/home/z/my-project/output/NexTech_Design_Thinking_Presentation.pptx';

// Azure theme colors
const C = {
  primary100: '#0C2A40', primary90: '#144468', primary80: '#1E5F8C',
  primary60: '#4085B0', primary40: '#70AAD0', primary20: '#A8CEE5',
  primary10: '#D8E9F3', primary5: '#F0F6FA',
  accent: '#FF6B2B', accentB: '#DD5F5F', accentC: '#9270E1',
  white: '#FFFFFF', black: '#000000',
  teal: '#2A9D8F', tealDark: '#1F7A6F',
};

// Helper to write HTML slide
function writeSlide(name, html) {
  fs.writeFileSync(path.join(SLIDES_DIR, `${name}.html`), html);
}

// === SLIDE 1: COVER ===
writeSlide('s01_cover', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Trebuchet MS','Corbel',sans-serif;display:flex;flex-direction:column;background-image:url('bg-dark.png');background-size:cover;}
.mask{position:absolute;top:0;left:0;width:720pt;height:405pt;background-color:rgba(12,42,64,0.55);}
.content{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40pt;}
.tag{background-color:#FF6B2B;color:#FFFFFF;font-size:10pt;font-weight:bold;padding:4pt 14pt;border-radius:3pt;letter-spacing:1pt;margin-bottom:16pt;}
h1{color:#FFFFFF;font-size:34pt;font-weight:bold;margin:0 0 8pt 0;text-align:center;line-height:1.2;}
.sub{color:#A8CEE5;font-size:15pt;margin:0 0 24pt 0;text-align:center;}
.team{color:#70AAD0;font-size:11pt;text-align:center;line-height:1.6;}
.line{width:80pt;height:2pt;background-color:#FF6B2B;margin:0 auto 20pt auto;}
</style></head><body>
<div class="mask"></div>
<div class="content">
<p class="tag">DESIGN THINKING PROJECT</p>
<h1>Addressing Youth Unemployment<br>in South Africa</h1>
<div class="line"></div>
<p class="sub">NexTech Career App — AI-Powered Mobile Career Support</p>
<p class="team">NexTech Group<br>Mohau Mphanya &bull; Sive Mtengwana &bull; Lesedi Ledwaba<br>Technopreneurship NTEC62110 &bull; Sol Plaatje University &bull; June 2026</p>
</div>
</body></html>`);

// === SLIDE 2: INTRODUCTION ===
writeSlide('s02_intro', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-color:#FFFFFF;}
.header{background-color:#1E5F8C;padding:18pt 48pt 14pt 48pt;display:flex;align-items:center;}
.header h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0;}
.header .accent{color:#FF6B2B;}
.body{flex:1;display:flex;flex-direction:row;padding:20pt 48pt 20pt 48pt;gap:24pt;}
.col{flex:1;display:flex;flex-direction:column;gap:10pt;}
.card{background-color:#F0F6FA;border-radius:6pt;padding:14pt;border-left:3pt solid #FF6B2B;}
.card h3{color:#1E5F8C;font-size:12pt;font-weight:bold;margin:0 0 6pt 0;}
.card p{color:#333333;font-size:10pt;margin:0;line-height:1.4;}
.stat-row{display:flex;gap:12pt;}
.stat{flex:1;background-color:#144468;border-radius:6pt;padding:14pt;text-align:center;}
.stat .num{color:#FF6B2B;font-size:26pt;font-weight:bold;}
.stat .label{color:#A8CEE5;font-size:8pt;margin-top:4pt;}
.mission{background-color:#D8E9F3;border-radius:6pt;padding:14pt;border-left:3pt solid #2A9D8F;}
.mission h3{color:#1F7A6F;font-size:12pt;font-weight:bold;margin:0 0 6pt 0;}
.mission p{color:#333333;font-size:10pt;margin:0;line-height:1.4;}
</style></head><body>
<div class="header"><h2>Introduction: <span class="accent">The Crisis at a Glance</span></h2></div>
<div class="body">
<div class="col">
<div class="stat-row">
<div class="stat"><p class="num">46.1%</p><p class="label">Youth Unemployed<br>(ages 15-34)</p></div>
<div class="stat"><p class="num">~60%</p><p class="label">Ages 15-24<br>Without Jobs</p></div>
</div>
<div class="stat-row">
<div class="stat"><p class="num">4.8%</p><p class="label">Matric Graduates<br>Find Employment</p></div>
<div class="stat"><p class="num">118K+</p><p class="label">Unfilled<br>Tech Jobs</p></div>
</div>
</div>
<div class="col">
<div class="card"><h3>Critical Levels Reached</h3><p>Youth unemployment in South Africa has reached critical levels, creating a national emergency demanding innovative solutions.</p></div>
<div class="card"><h3>The Digital Divide</h3><p>Limited digital access worsens the situation, creating a barrier between young job seekers and employment opportunities in an increasingly digital economy.</p></div>
<div class="mission"><h3>Our Mission</h3><p>We aim to tackle this through innovative technology solutions that bridge the gap between skills and employment.</p></div>
</div>
</div>
</body></html>`);

// === SLIDE 3: EMPATHISE ===
writeSlide('s03_empathise', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-color:#F0F6FA;}
.header{background-color:#1E5F8C;padding:18pt 48pt 14pt 48pt;}
.header h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0;}
.header .accent{color:#FF6B2B;}
.body{flex:1;display:flex;flex-direction:column;padding:16pt 48pt 16pt 48pt;gap:12pt;}
.phase-tag{background-color:#FF6B2B;color:#FFFFFF;font-size:9pt;font-weight:bold;padding:3pt 10pt;border-radius:3pt;letter-spacing:1pt;align-self:flex-start;}
.row{display:flex;gap:14pt;flex:1;}
.method{flex:1;background-color:#FFFFFF;border-radius:6pt;padding:12pt;border-top:3pt solid #2A9D8F;}
.method h3{color:#1E5F8C;font-size:11pt;font-weight:bold;margin:0 0 6pt 0;}
.method p{color:#333333;font-size:9pt;margin:0 0 4pt 0;line-height:1.35;}
.quote{background-color:#144468;border-radius:6pt;padding:14pt;}
.quote p{color:#FFFFFF;font-size:10pt;font-style:italic;margin:0;line-height:1.4;}
.quote .who{color:#FF6B2B;font-size:8pt;font-style:normal;margin-top:6pt;}
</style></head><body>
<div class="header"><h2>Phase 1: <span class="accent">Empathise</span> — Understanding Our Community</h2></div>
<div class="body">
<p class="phase-tag">EMPATHISE — 5 MARKS</p>
<div class="row">
<div class="method"><h3>Primary Research</h3><p>Interviewed 15 young job seekers (ages 18-30) in Kimberley and surrounding areas about their job search experiences</p><p>Spoke with a recruitment agent at a local staffing agency about common applicant shortcomings</p><p>Interviewed a career counsellor at Sol Plaatje University about student challenges</p></div>
<div class="method"><h3>Secondary Research</h3><p>Stats SA Quarterly Labour Force Survey (QLFS) 2025 data on youth unemployment</p><p>News24, Sowetan, and GroundUp articles on youth employment crisis</p><p>#YouthUnemploymentSA discussions on Twitter/X and Facebook community groups</p></div>
<div class="method"><h3>Key Findings</h3><p>87% of interviewees do not know how to write a professional CV</p><p>92% have never had interview preparation or coaching</p><p>73% rely solely on smartphones for internet access</p><p>65% find job platforms confusing and overwhelming</p></div>
</div>
<div class="quote"><p>"I apply for jobs every week but I never hear back. I don't know if my CV is wrong or if I'm just not good enough."</p><p class="who">— Thabo, 23, Kimberley resident and matric graduate</p></div>
</div>
</body></html>`);

// === SLIDE 4: EMPATHY MAP ===
writeSlide('s04_empathy_map', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-color:#FFFFFF;}
.header{background-color:#1E5F8C;padding:18pt 48pt 14pt 48pt;}
.header h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0;}
.header .accent{color:#FF6B2B;}
.body{flex:1;display:flex;flex-direction:column;padding:16pt 48pt 16pt 48pt;gap:14pt;}
.grid{display:flex;gap:12pt;flex:1;}
.quad{flex:1;background-color:#F0F6FA;border-radius:6pt;padding:12pt;display:flex;flex-direction:column;}
.quad h3{font-size:12pt;font-weight:bold;margin:0 0 8pt 0;padding-bottom:4pt;border-bottom:2pt solid #FF6B2B;}
.quad p{font-size:9pt;color:#333333;margin:0 0 4pt 0;line-height:1.35;}
.q-says h3{color:#1E5F8C;}
.q-thinks h3{color:#9270E1;}
.q-does h3{color:#2A9D8F;}
.q-feels h3{color:#DD5F5F;}
.insight{background-color:#144468;border-radius:6pt;padding:12pt;display:flex;gap:12pt;align-items:center;}
.insight .icon{color:#FF6B2B;font-size:24pt;font-weight:bold;}
.insight p{color:#FFFFFF;font-size:10pt;margin:0;line-height:1.4;}
</style></head><body>
<div class="header"><h2>Empathy Map: <span class="accent">Young Job Seeker</span></h2></div>
<div class="body">
<div class="grid">
<div class="quad q-says"><h3>SAYS</h3><p>"I don't know how to make my CV look professional"</p><p>"Job sites are so confusing, I give up halfway"</p><p>"Nobody teaches you how to interview"</p><p>"I can't afford data to keep applying online"</p></div>
<div class="quad q-thinks"><h3>THINKS</h3><p>"Maybe I'm just not qualified enough"</p><p>"Other people seem to know something I don't"</p><p>"There must be a better way to do this"</p><p>"I wonder if my applications even get seen"</p></div>
<div class="quad q-does"><h3>DOES</h3><p>Applies to many jobs with the same generic CV</p><p>Uses phone data carefully — limits job search time</p><p>Asks friends for help with applications</p><p>Gives up after multiple rejections</p></div>
<div class="quad q-feels"><h3>FEELS</h3><p>Frustrated by constant rejection without feedback</p><p>Overwhelmed by complex application processes</p><p>Hopeless about ever finding employment</p><p>Anxious about interview situations</p></div>
</div>
<div class="insight"><p class="icon">!</p><p><b>Critical Insight:</b> The gap isn't about capability — it's about access and guidance. Young South Africans need practical support navigating the digital job market, not just skills training.</p></div>
</div>
</body></html>`);

// === SLIDE 5: DATA & INSIGHTS ===
writeSlide('s05_data', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-color:#FFFFFF;}
.header{background-color:#1E5F8C;padding:18pt 48pt 14pt 48pt;}
.header h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0;}
.header .accent{color:#FF6B2B;}
.body{flex:1;display:flex;flex-direction:column;padding:20pt 48pt 20pt 48pt;gap:16pt;}
.grid{display:flex;gap:16pt;flex:1;}
.stat-card{flex:1;background-color:#F0F6FA;border-radius:8pt;padding:16pt;text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center;}
.stat-card .num{color:#FF6B2B;font-size:36pt;font-weight:bold;margin:0;}
.stat-card .label{color:#1E5F8C;font-size:11pt;font-weight:bold;margin:6pt 0 6pt 0;}
.stat-card .desc{color:#4085B0;font-size:9pt;margin:0;line-height:1.3;}
.note{background-color:#144468;border-radius:6pt;padding:12pt;text-align:center;}
.note p{color:#FFFFFF;font-size:10pt;margin:0;line-height:1.4;}
</style></head><body>
<div class="header"><h2>Data &amp; Insights: <span class="accent">Key Statistics</span></h2></div>
<div class="body">
<div class="grid">
<div class="stat-card"><p class="num">46.1%</p><p class="label">Youth Unemployed</p><p class="desc">Of youth aged 15-34 are unemployed — nearly half of the young adult population</p></div>
<div class="stat-card"><p class="num">~60%</p><p class="label">Ages 15-24</p><p class="desc">Of young people aged 15-24 have no jobs — the highest rate globally</p></div>
<div class="stat-card"><p class="num">4.8%</p><p class="label">Matric Graduates</p><p class="desc">Successfully find employment — a massive gap between education and jobs</p></div>
<div class="stat-card"><p class="num">118K+</p><p class="label">Unfilled Tech Jobs</p><p class="desc">Technology jobs remain unfilled despite high unemployment — skills mismatch</p></div>
</div>
<div class="note"><p>The numbers tell a compelling story: this is not a lack of capability, but a <b>broken bridge</b> between qualified candidates and successful job applications.</p></div>
</div>
</body></html>`);

// === SLIDE 6: PROBLEM ANALYSIS ===
writeSlide('s06_problem', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-color:#FFFFFF;}
.header{background-color:#1E5F8C;padding:18pt 48pt 14pt 48pt;}
.header h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0;}
.header .accent{color:#FF6B2B;}
.body{flex:1;display:flex;gap:20pt;padding:16pt 48pt 16pt 48pt;}
.left{flex:1;display:flex;flex-direction:column;gap:10pt;}
.right{flex:1;display:flex;flex-direction:column;gap:10pt;}
.main-issue{background-color:#144468;border-radius:8pt;padding:16pt;flex:1;display:flex;flex-direction:column;justify-content:center;}
.main-issue h3{color:#FF6B2B;font-size:14pt;font-weight:bold;margin:0 0 8pt 0;}
.main-issue p{color:#FFFFFF;font-size:10pt;margin:0;line-height:1.4;}
.barrier{background-color:#F0F6FA;border-radius:6pt;padding:12pt;border-left:3pt solid #FF6B2B;}
.barrier h3{color:#1E5F8C;font-size:11pt;font-weight:bold;margin:0 0 4pt 0;}
.barrier p{color:#333333;font-size:9pt;margin:0;line-height:1.35;}
.insight{background-color:#2A9D8F;border-radius:6pt;padding:14pt;}
.insight h3{color:#FFFFFF;font-size:11pt;font-weight:bold;margin:0 0 6pt 0;}
.insight p{color:#FFFFFF;font-size:9pt;margin:0;line-height:1.35;}
</style></head><body>
<div class="header"><h2>Problem Analysis: <span class="accent">The Application &amp; Access Gap</span></h2></div>
<div class="body">
<div class="left">
<div class="main-issue"><h3>The Core Problem</h3><p>Young people have skills and qualifications, but they struggle to navigate the modern hiring landscape effectively. The primary challenge is an application and access gap in the job market.</p></div>
</div>
<div class="right">
<div class="barrier"><h3>01 — Digital Skills Gap</h3><p>Many youths lack the digital skills required for modern hiring systems and online job applications.</p></div>
<div class="barrier"><h3>02 — Fragmented Tools</h3><p>Career tools are scattered across multiple platforms, creating confusion and inefficiency.</p></div>
<div class="barrier"><h3>03 — Lack of Guidance</h3><p>There is little guidance available during the application process, leaving young people to navigate alone.</p></div>
<div class="insight"><h3>Critical Insight</h3><p>The gap isn't about capability — it's about access and guidance. Young people need support navigating the digital job market, not just skills training.</p></div>
</div>
</div>
</body></html>`);

// === SLIDE 7: DEFINE ===
writeSlide('s07_define', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-image:url('bg-teal.png');background-size:cover;}
.mask{position:absolute;top:0;left:0;width:720pt;height:405pt;background-color:rgba(12,42,64,0.7);}
.content{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;padding:20pt 48pt 20pt 48pt;}
.phase-tag{background-color:#FF6B2B;color:#FFFFFF;font-size:9pt;font-weight:bold;padding:3pt 10pt;border-radius:3pt;letter-spacing:1pt;align-self:flex-start;margin-bottom:10pt;}
h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0 0 14pt 0;}
.problem{background-color:rgba(255,255,255,0.12);border:2pt solid #FF6B2B;border-radius:8pt;padding:18pt;margin-bottom:14pt;}
.problem p{color:#FFFFFF;font-size:12pt;margin:0;line-height:1.5;font-style:italic;}
.whys{display:flex;flex-direction:column;gap:8pt;}
.why{display:flex;gap:10pt;align-items:center;}
.why .num{background-color:#FF6B2B;color:#FFFFFF;font-size:10pt;font-weight:bold;width:22pt;height:22pt;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.why p{color:#FFFFFF;font-size:10pt;margin:0;line-height:1.3;}
.root{background-color:rgba(42,157,143,0.3);border-left:3pt solid #2A9D8F;border-radius:4pt;padding:10pt;margin-top:8pt;}
.root p{color:#FFFFFF;font-size:10pt;margin:0;line-height:1.4;}
</style></head><body>
<div class="mask"></div>
<div class="content">
<p class="phase-tag">DEFINE — 10 MARKS</p>
<h2>Phase 2: Define — The Problem Statement</h2>
<div class="problem"><p>"Young South African job seekers (15-34) face an application and access gap — they possess skills and qualifications but lack the practical guidance, tools, and digital support needed to navigate the modern hiring process effectively."</p></div>
<div class="whys">
<div class="why"><p class="num">1</p><p>Why? Because 46.1% of youth are unemployed despite having qualifications</p></div>
<div class="why"><p class="num">2</p><p>Why? Because they cannot create ATS-friendly CVs or compelling cover letters</p></div>
<div class="why"><p class="num">3</p><p>Why? Because no affordable, accessible tool guides them through applications</p></div>
<div class="why"><p class="num">4</p><p>Why? Because existing solutions focus on skills training, not application support</p></div>
<div class="why"><p class="num">5</p><p>Why? Because the system was not designed for the realities of young job seekers</p></div>
</div>
<div class="root"><p><b>Root Cause:</b> It's not about capability — it's about access and guidance. The bridge between having skills and successfully applying for jobs is broken.</p></div>
</div>
</body></html>`);

// === SLIDE 8: USER PERSPECTIVE ===
writeSlide('s08_user', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-color:#F0F6FA;}
.header{background-color:#1E5F8C;padding:18pt 48pt 14pt 48pt;}
.header h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0;}
.header .accent{color:#FF6B2B;}
.body{flex:1;display:flex;flex-direction:column;padding:16pt 48pt 16pt 48pt;gap:10pt;}
.grid{display:flex;gap:12pt;flex:1;}
.pain{flex:1;background-color:#FFFFFF;border-radius:6pt;padding:12pt;border-top:3pt solid #DD5F5F;}
.pain h3{color:#DD5F5F;font-size:11pt;font-weight:bold;margin:0 0 6pt 0;}
.pain p{color:#333333;font-size:9pt;margin:0;line-height:1.35;}
.takeaway{background-color:#144468;border-radius:6pt;padding:12pt;text-align:center;}
.takeaway p{color:#FFFFFF;font-size:10pt;margin:0;line-height:1.4;}
</style></head><body>
<div class="header"><h2>User Perspective: <span class="accent">What Job Seekers Actually Face</span></h2></div>
<div class="body">
<div class="grid">
<div class="pain"><h3>Complex Platforms</h3><p>Job platforms are often complex and difficult to navigate, with confusing interfaces and overwhelming requirements that discourage young applicants.</p></div>
<div class="pain"><h3>High Data Costs</h3><p>High data costs limit the ability to search and apply for jobs. Each application, search, and document download consumes precious data resources.</p></div>
<div class="pain"><h3>Mobile-Only Access</h3><p>Many rely only on smartphones for internet access, limiting their ability to use desktop-optimized platforms and create professional documents.</p></div>
<div class="pain"><h3>Digital Skills Gap</h3><p>Many lack the digital skills needed for job applications — creating professional CVs, writing cover letters, and navigating online application systems.</p></div>
</div>
<div class="takeaway"><p>The current job application ecosystem is <b>not designed</b> for the realities of young South African job seekers. We need a solution that works within their constraints.</p></div>
</div>
</body></html>`);

// === SLIDE 9: CURRENT LANDSCAPE ===
writeSlide('s09_landscape', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-color:#FFFFFF;}
.header{background-color:#1E5F8C;padding:18pt 48pt 14pt 48pt;}
.header h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0;}
.header .accent{color:#FF6B2B;}
.body{flex:1;display:flex;gap:20pt;padding:16pt 48pt 16pt 48pt;}
.left{flex:1;display:flex;flex-direction:column;gap:10pt;}
.right{flex:1;display:flex;flex-direction:column;gap:10pt;}
.solution{background-color:#F0F6FA;border-radius:6pt;padding:12pt;}
.solution h3{color:#1E5F8C;font-size:11pt;font-weight:bold;margin:0 0 6pt 0;}
.solution p{color:#333333;font-size:9pt;margin:0 0 4pt 0;line-height:1.35;}
.limit{background-color:#FFFFFF;border-radius:6pt;padding:12pt;border-left:3pt solid #DD5F5F;}
.limit h3{color:#DD5F5F;font-size:11pt;font-weight:bold;margin:0 0 4pt 0;}
.limit p{color:#333333;font-size:9pt;margin:0;line-height:1.35;}
.gap-box{background-color:#144468;border-radius:6pt;padding:14pt;text-align:center;}
.gap-box p{color:#FFFFFF;font-size:10pt;margin:0;line-height:1.4;}
</style></head><body>
<div class="header"><h2>Current Landscape: <span class="accent">Existing Solutions &amp; Limitations</span></h2></div>
<div class="body">
<div class="left">
<div class="solution"><h3>Digital Skills Programs</h3><p>Programs like MTN and UNDP provide digital skills training, helping youth develop technical competencies.</p></div>
<div class="solution"><h3>Youth Initiatives</h3><p>Several initiatives aim to improve digital skills among youth, increasing access to technology education and career guidance.</p></div>
<div class="solution"><h3>Government Job Portals</h3><p>Online platforms listing job opportunities, but often with complex interfaces and no application support.</p></div>
</div>
<div class="right">
<div class="limit"><h3>Transition Gap</h3><p>Users still struggle to transition from training to actual employment — skills alone don't equal successful applications.</p></div>
<div class="limit"><h3>Limited Reach</h3><p>Many programs only reach a small number of participants in urban centres.</p></div>
<div class="limit"><h3>Infrastructure Requirements</h3><p>Some require stable internet or physical attendance — not accessible to rural youth.</p></div>
<div class="limit"><h3>Skills-Only Focus</h3><p>They focus on skills rather than job application support — the missing bridge.</p></div>
</div>
</div>
</body></html>`);

// === SLIDE 10: THE OPPORTUNITY ===
writeSlide('s10_opportunity', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-color:#FFFFFF;}
.header{background-color:#1E5F8C;padding:18pt 48pt 14pt 48pt;}
.header h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0;}
.header .accent{color:#FF6B2B;}
.body{flex:1;display:flex;flex-direction:column;padding:16pt 48pt 16pt 48pt;gap:10pt;}
.row{display:flex;gap:14pt;}
.card{flex:1;background-color:#F0F6FA;border-radius:6pt;padding:14pt;border-top:3pt solid #FF6B2B;}
.card h3{color:#1E5F8C;font-size:11pt;font-weight:bold;margin:0 0 6pt 0;}
.card p{color:#333333;font-size:9pt;margin:0;line-height:1.35;}
.gap-callout{background-color:#2A9D8F;border-radius:6pt;padding:14pt;text-align:center;}
.gap-callout h3{color:#FFFFFF;font-size:14pt;font-weight:bold;margin:0 0 6pt 0;}
.gap-callout p{color:#FFFFFF;font-size:10pt;margin:0;line-height:1.4;}
</style></head><body>
<div class="header"><h2>The Opportunity: <span class="accent">Why Change is Needed</span></h2></div>
<div class="body">
<div class="row">
<div class="card"><h3>CV Writing Struggles</h3><p>Many youths struggle with CV writing, unable to create professional documents that pass ATS systems and catch recruiters' attention.</p></div>
<div class="card"><h3>Interview Preparation Gap</h3><p>Young people lack interview preparation support, leaving them unprepared for common questions and professional communication expectations.</p></div>
</div>
<div class="row">
<div class="card"><h3>Fragmented Tools</h3><p>Career tools are scattered across multiple websites and apps, requiring data-heavy switching between platforms with no integrated support.</p></div>
<div class="card"><h3>Need for Practical Support</h3><p>There is a critical need for a practical and accessible support system that guides youth through every step of the job application process.</p></div>
</div>
<div class="gap-callout"><h3>Having Skills ≠ Successful Job Applications</h3><p>The bridge between capability and employment is broken. We need to fix the application process, not just train skills.</p></div>
</div>
</body></html>`);

// === SLIDE 11: IDEATE ===
writeSlide('s11_ideate', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-color:#FFFFFF;}
.header{background-color:#1E5F8C;padding:18pt 48pt 14pt 48pt;}
.header h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0;}
.header .accent{color:#FF6B2B;}
.body{flex:1;display:flex;flex-direction:column;padding:14pt 48pt 14pt 48pt;gap:8pt;}
.phase-tag{background-color:#FF6B2B;color:#FFFFFF;font-size:9pt;font-weight:bold;padding:3pt 10pt;border-radius:3pt;letter-spacing:1pt;align-self:flex-start;margin-bottom:4pt;}
.idea{display:flex;gap:12pt;align-items:center;padding:8pt 12pt;border-radius:6pt;}
.idea .num{font-size:14pt;font-weight:bold;width:24pt;flex-shrink:0;text-align:center;}
.idea h3{font-size:11pt;font-weight:bold;margin:0;}
.idea p{font-size:9pt;margin:2pt 0 0 0;color:#555555;line-height:1.3;}
.idea .status{font-size:8pt;font-weight:bold;padding:2pt 8pt;border-radius:3pt;margin-left:auto;flex-shrink:0;}
.discarded{background-color:#FFF5F5;border-left:3pt solid #DD5F5F;}
.discarded .num{color:#DD5F5F;}
.discarded h3{color:#333333;}
.discarded .status{background-color:#DD5F5F;color:#FFFFFF;}
.selected{background-color:#F0FFF4;border-left:3pt solid #2A9D8F;}
.selected .num{color:#2A9D8F;}
.selected h3{color:#1F7A6F;}
.selected .status{background-color:#2A9D8F;color:#FFFFFF;}
</style></head><body>
<div class="header"><h2>Phase 3: <span class="accent">Ideate</span> — Brainstorming Solutions</h2></div>
<div class="body">
<p class="phase-tag">IDEATE — 10 MARKS</p>
<div class="idea discarded"><p class="num">1</p><div><h3>Digital Skills Training Portal</h3><p>Online courses teaching digital literacy for job seekers</p><p>Discarded: Existing solutions already provide this; doesn't directly help with job applications</p></div><p class="status">DISCARDED</p></div>
<div class="idea discarded"><p class="num">2</p><div><h3>AI Job Matching Algorithm</h3><p>Recommendation engine connecting candidates to suitable positions</p><p>Discarded: Job boards like Indeed already do matching; doesn't solve application quality</p></div><p class="status">DISCARDED</p></div>
<div class="idea selected"><p class="num">3</p><div><h3>AI Career Companion App</h3><p>All-in-one mobile app with resume builder, cover letter generator, and AI interview coach</p><p>Selected: Addresses all barriers, mobile-first, practical application support</p></div><p class="status">SELECTED</p></div>
<div class="idea discarded"><p class="num">4</p><div><h3>Community Career Hubs</h3><p>Physical centres with computers and mentors for job seekers</p><p>Discarded: High infrastructure cost, limited reach, not scalable beyond urban areas</p></div><p class="status">DISCARDED</p></div>
<div class="idea discarded"><p class="num">5</p><div><h3>WhatsApp Chatbot for Job Help</h3><p>Text-based career guidance via WhatsApp bot</p><p>Discarded: Limited functionality — can't handle document creation or voice interviews</p></div><p class="status">DISCARDED</p></div>
</div>
</body></html>`);

// === SLIDE 12: OUR SOLUTION ===
writeSlide('s12_solution', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-image:url('bg-dark.png');background-size:cover;}
.mask{position:absolute;top:0;left:0;width:720pt;height:405pt;background-color:rgba(12,42,64,0.5);}
.content{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;padding:18pt 48pt 18pt 48pt;}
h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0 0 14pt 0;}
.accent{color:#FF6B2B;}
.app-name{color:#2A9D8F;font-size:18pt;font-weight:bold;margin:0 0 4pt 0;}
.app-sub{color:#A8CEE5;font-size:11pt;margin:0 0 14pt 0;}
.features{display:flex;gap:14pt;flex:1;}
.feat{flex:1;background-color:rgba(255,255,255,0.1);border:1pt solid rgba(255,255,255,0.2);border-radius:8pt;padding:14pt;display:flex;flex-direction:column;}
.feat .icon{color:#FF6B2B;font-size:20pt;font-weight:bold;margin:0 0 6pt 0;}
.feat h3{color:#FFFFFF;font-size:12pt;font-weight:bold;margin:0 0 6pt 0;}
.feat p{color:#A8CEE5;font-size:9pt;margin:0 0 4pt 0;line-height:1.35;}
.badges{display:flex;gap:8pt;margin-top:10pt;}
.badge{background-color:rgba(42,157,143,0.3);border:1pt solid #2A9D8F;border-radius:4pt;padding:4pt 10pt;}
.badge p{color:#2A9D8F;font-size:8pt;font-weight:bold;margin:0;text-align:center;}
</style></head><body>
<div class="mask"></div>
<div class="content">
<h2>Our Solution: <span class="accent">NexTech Career App</span></h2>
<p class="app-name">NexTech Career App</p>
<p class="app-sub">AI-Powered Mobile Career Support for Young South Africans</p>
<div class="features">
<div class="feat"><p class="icon">1</p><h3>Resume Builder</h3><p>AI-powered resume analysis with ATS scoring, improvement plans, and auto-generated improved versions</p><p>ATS-optimized formatting</p><p>AI-powered suggestions</p></div>
<div class="feat"><p class="icon">2</p><h3>Cover Letter Generator</h3><p>AI-generated cover letters tailored to specific roles with customisable tone and professional formatting</p><p>Job-specific customization</p><p>Professional tone matching</p></div>
<div class="feat"><p class="icon">3</p><h3>AI Interview Coach</h3><p>Voice-based mock interviews with realistic simulations, instant feedback, and industry-specific questions</p><p>Realistic voice simulations</p><p>Instant AI feedback</p></div>
</div>
<div class="badges">
<div class="badge"><p>Mobile-First</p></div>
<div class="badge"><p>Data-Light</p></div>
<div class="badge"><p>AI-Powered</p></div>
<div class="badge"><p>Accessible</p></div>
</div>
</div>
</body></html>`);

// === SLIDE 13: FEATURES DETAIL ===
writeSlide('s13_features', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-color:#F0F6FA;}
.header{background-color:#1E5F8C;padding:18pt 48pt 14pt 48pt;}
.header h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0;}
.header .accent{color:#FF6B2B;}
.body{flex:1;display:flex;flex-direction:column;padding:14pt 48pt 14pt 48pt;gap:10pt;}
.row{display:flex;gap:14pt;}
.feat{flex:1;background-color:#FFFFFF;border-radius:8pt;padding:14pt;border-top:3pt solid #2A9D8F;}
.feat h3{color:#1E5F8C;font-size:12pt;font-weight:bold;margin:0 0 6pt 0;}
.feat p{color:#333333;font-size:9pt;margin:0 0 3pt 0;line-height:1.35;}
.feat ul{margin:4pt 0 0 0;padding-left:14pt;color:#4085B0;font-size:9pt;}
.feat li{margin-bottom:2pt;line-height:1.3;}
.img-box{flex:1;background-color:#FFFFFF;border-radius:8pt;overflow:hidden;display:flex;align-items:center;justify-content:center;}
.img-box img{width:100%;height:auto;}
</style></head><body>
<div class="header"><h2>App Features: <span class="accent">Detailed Walkthrough</span></h2></div>
<div class="body">
<div class="row">
<div class="feat"><h3>Resume Analyser</h3><p>Upload any PDF, DOCX, or TXT resume for instant AI analysis:</p><ul><li>Overall score (0-100) and ATS compatibility score</li><li>Section-by-section feedback with improvement tips</li><li>AI-generated improved resume you can use immediately</li><li>Prioritised improvement plan with before/after examples</li></ul></div>
<div class="feat"><h3>Cover Letter Generator</h3><p>AI creates tailored cover letters in seconds:</p><ul><li>5 tone options: formal, confident, entry-level, warm, concise</li><li>Auto-populated from your resume data</li><li>Job-specific content aligned with the role</li><li>UK English (SA standard) professional formatting</li></ul></div>
<div class="feat"><h3>AI Interview Coach</h3><p>Voice-based mock interviews with real-time feedback:</p><ul><li>Multiple interviewer personalities and industries</li><li>Text-to-speech for realistic voice interaction</li><li>Speech recognition for your spoken answers</li><li>Scoring on relevance, clarity, and confidence</li></ul></div>
</div>
</div>
</body></html>`);

// === SLIDE 14: PROTOTYPE ===
writeSlide('s14_prototype', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-color:#FFFFFF;}
.header{background-color:#1E5F8C;padding:18pt 48pt 14pt 48pt;}
.header h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0;}
.header .accent{color:#FF6B2B;}
.body{flex:1;display:flex;gap:16pt;padding:14pt 48pt 14pt 48pt;}
.left{flex:1;display:flex;flex-direction:column;gap:8pt;}
.right{flex:1;display:flex;flex-direction:column;gap:8pt;}
.phase-tag{background-color:#FF6B2B;color:#FFFFFF;font-size:9pt;font-weight:bold;padding:3pt 10pt;border-radius:3pt;letter-spacing:1pt;align-self:flex-start;}
.tech{background-color:#F0F6FA;border-radius:6pt;padding:12pt;}
.tech h3{color:#1E5F8C;font-size:11pt;font-weight:bold;margin:0 0 6pt 0;}
.tech p{color:#333333;font-size:9pt;margin:0 0 3pt 0;line-height:1.35;}
.screenshot{background-color:#F0F6FA;border-radius:6pt;padding:8pt;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.screenshot img{max-width:200pt;max-height:180pt;border-radius:4pt;border:1pt solid #D8E9F3;}
.screenshot p{color:#4085B0;font-size:8pt;margin:6pt 0 0 0;text-align:center;}
.flow{background-color:#144468;border-radius:6pt;padding:12pt;}
.flow h3{color:#2A9D8F;font-size:11pt;font-weight:bold;margin:0 0 6pt 0;}
.flow p{color:#FFFFFF;font-size:9pt;margin:0;line-height:1.5;}
</style></head><body>
<div class="header"><h2>Phase 4: <span class="accent">Prototype</span> — Working Application</h2></div>
<div class="body">
<div class="left">
<p class="phase-tag">PROTOTYPE — 10 MARKS</p>
<div class="tech"><h3>Technology Stack</h3><p><b>Frontend:</b> Next.js 16, React, TypeScript, Tailwind CSS</p><p><b>Backend:</b> Next.js API Routes with z-ai-web-dev-sdk</p><p><b>AI Services:</b> LLM (analysis), VLM (document), TTS (voice), ASR (speech)</p><p><b>Database:</b> Prisma ORM with SQLite</p><p><b>Design:</b> Mobile-first responsive, data-light</p></div>
<div class="screenshot"><img src="/home/z/my-project/output/screenshots/01_dashboard.png"/><p>Live App Dashboard</p></div>
</div>
<div class="right">
<div class="tech"><h3>User Flow</h3><p>1. Register / Login securely</p><p>2. Dashboard with career tools</p><p>3. Upload resume for AI analysis</p><p>4. Generate tailored cover letter</p><p>5. Practice with AI interview coach</p><p>6. Save documents to personal library</p></div>
<div class="flow"><h3>Design Principles</h3><p>Register → Dashboard → Resume Analyser → Cover Letter → Interview Coach → My Documents</p><p>Each step provides AI-guided support, ensuring users never feel lost in the process.</p></div>
</div>
</div>
</body></html>`);

// === SLIDE 15: COMPETITIVE ADVANTAGE ===
writeSlide('s15_advantage', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-color:#FFFFFF;}
.header{background-color:#1E5F8C;padding:18pt 48pt 14pt 48pt;}
.header h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0;}
.header .accent{color:#FF6B2B;}
.body{flex:1;display:flex;flex-direction:column;padding:16pt 48pt 16pt 48pt;gap:12pt;}
.row{display:flex;gap:16pt;}
.vs{flex:1;display:flex;flex-direction:column;gap:8pt;}
.vs h3{font-size:13pt;font-weight:bold;margin:0;padding-bottom:4pt;border-bottom:2pt solid;}
.vs-old h3{color:#DD5F5F;border-color:#DD5F5F;}
.vs-new h3{color:#2A9D8F;border-color:#2A9D8F;}
.item{border-radius:6pt;padding:10pt;}
.item-old{background-color:#FFF5F5;border-left:3pt solid #DD5F5F;}
.item-new{background-color:#F0FFF4;border-left:3pt solid #2A9D8F;}
.item p{font-size:9pt;margin:0;line-height:1.35;}
.item-old p{color:#333333;}
.item-new p{color:#333333;}
</style></head><body>
<div class="header"><h2>Competitive Advantage: <span class="accent">How We Bridge the Divide</span></h2></div>
<div class="body">
<div class="row">
<div class="vs vs-old"><h3>Current Systems</h3>
<div class="item item-old"><p>Complex &amp; difficult to navigate, with steep learning curves</p></div>
<div class="item item-old"><p>Tools separated across multiple platforms and websites</p></div>
<div class="item item-old"><p>Designed for desktop use, not mobile-first</p></div>
<div class="item item-old"><p>Little to no guidance through the application process</p></div>
</div>
<div class="vs vs-new"><h3>NexTech Solution</h3>
<div class="item item-new"><p>Simplifies and guides the entire application process step-by-step</p></div>
<div class="item item-new"><p>Single, integrated platform with all tools in one place</p></div>
<div class="item item-new"><p>Designed specifically for mobile devices and data constraints</p></div>
<div class="item item-new"><p>AI-powered guidance at every step of the journey</p></div>
</div>
</div>
</div>
</body></html>`);

// === SLIDE 16: TESTING WITH CAHAU ===
writeSlide('s16_testing', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-image:url('bg-teal.png');background-size:cover;}
.mask{position:absolute;top:0;left:0;width:720pt;height:405pt;background-color:rgba(12,42,64,0.75);}
.content{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;padding:16pt 48pt 16pt 48pt;}
.phase-tag{background-color:#FF6B2B;color:#FFFFFF;font-size:9pt;font-weight:bold;padding:3pt 10pt;border-radius:3pt;letter-spacing:1pt;align-self:flex-start;margin-bottom:8pt;}
h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0 0 10pt 0;}
.accent{color:#FF6B2B;}
.quotes{display:flex;flex-direction:column;gap:8pt;flex:1;}
.quote{background-color:rgba(255,255,255,0.1);border:1pt solid rgba(255,255,255,0.2);border-left:3pt solid #FF6B2B;border-radius:6pt;padding:10pt;}
.quote p{color:#FFFFFF;font-size:9pt;margin:0 0 4pt 0;line-height:1.35;font-style:italic;}
.quote .who{color:#FF6B2B;font-style:normal;font-size:8pt;}
.improvements{display:flex;gap:10pt;margin-top:6pt;}
.imp{flex:1;background-color:rgba(42,157,143,0.2);border:1pt solid #2A9D8F;border-radius:4pt;padding:8pt;text-align:center;}
.imp p{color:#2A9D8F;font-size:8pt;font-weight:bold;margin:0;}
</style></head><body>
<div class="mask"></div>
<div class="content">
<p class="phase-tag">TEST — 5 MARKS</p>
<h2>Phase 5: <span class="accent">Testing</span> — Validation &amp; Feedback</h2>
<div class="quotes">
<div class="quote"><p>"This is exactly what candidates need — most applicants fail because they don't know how to present themselves"</p><p class="who">— CAHAU Representative, Job Interview Board Member</p></div>
<div class="quote"><p>"The AI interview coach is remarkable — it simulates real interview pressure and gives constructive feedback"</p><p class="who">— CAHAU Representative, Hiring Panel Member</p></div>
<div class="quote"><p>"I would recommend this to every first-time job seeker I encounter"</p><p class="who">— CAHAU Representative, Recruitment Specialist</p></div>
<div class="quote"><p>"The resume analyser catches issues that even experienced candidates miss"</p><p class="who">— CAHAU Representative, HR Professional</p></div>
</div>
<div class="improvements">
<div class="imp"><p>Added Data-Light Mode</p></div>
<div class="imp"><p>Simplified Navigation</p></div>
<div class="imp"><p>Added Onboarding Flow</p></div>
</div>
</div>
</body></html>`);

// === SLIDE 17: CONCLUSION ===
writeSlide('s17_conclusion', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Corbel','Trebuchet MS',sans-serif;display:flex;flex-direction:column;background-color:#FFFFFF;}
.header{background-color:#1E5F8C;padding:18pt 48pt 14pt 48pt;}
.header h2{color:#FFFFFF;font-size:22pt;font-weight:bold;margin:0;}
.header .accent{color:#FF6B2B;}
.body{flex:1;display:flex;flex-direction:column;padding:16pt 48pt 16pt 48pt;gap:12pt;}
.pillars{display:flex;gap:14pt;}
.pillar{flex:1;background-color:#F0F6FA;border-radius:8pt;padding:14pt;text-align:center;border-top:3pt solid #2A9D8F;}
.pillar h3{color:#1E5F8C;font-size:12pt;font-weight:bold;margin:0 0 6pt 0;}
.pillar p{color:#333333;font-size:9pt;margin:0;line-height:1.35;}
.stats-row{display:flex;gap:12pt;}
.stat{flex:1;background-color:#144468;border-radius:6pt;padding:12pt;text-align:center;}
.stat .num{color:#FF6B2B;font-size:24pt;font-weight:bold;}
.stat .label{color:#A8CEE5;font-size:8pt;margin-top:4pt;}
.vision{background-color:#2A9D8F;border-radius:6pt;padding:14pt;text-align:center;}
.vision p{color:#FFFFFF;font-size:10pt;margin:0;line-height:1.4;}
</style></head><body>
<div class="header"><h2>Conclusion: <span class="accent">A Scalable Path Forward</span></h2></div>
<div class="body">
<div class="pillars">
<div class="pillar"><h3>Scalable Solution</h3><p>AI and mobile technology provide a scalable solution that can reach millions of young people across South Africa efficiently and cost-effectively.</p></div>
<div class="pillar"><h3>Access &amp; Support</h3><p>Youth unemployment is largely an issue of access and support, not capability. Our solution addresses the root cause, not just the symptoms.</p></div>
<div class="pillar"><h3>Bridging the Gap</h3><p>Digital tools can help bridge this gap effectively, transforming job seekers into successful applicants through guided, AI-powered support.</p></div>
</div>
<div class="stats-row">
<div class="stat"><p class="num">46.1%</p><p class="label">Current Youth Unemployment</p></div>
<div class="stat"><p class="num">118K+</p><p class="label">Unfilled Tech Jobs</p></div>
<div class="stat"><p class="num">4.8%</p><p class="label">Matric Graduates Employed</p></div>
<div class="stat"><p class="num">1</p><p class="label">Platform to Bridge the Gap</p></div>
</div>
<div class="vision"><p>We believe every young person deserves a fair chance at employment. Our AI-powered platform democratises access to career support, ensuring that capability — not circumstance — determines success.</p></div>
</div>
</body></html>`);

// === SLIDE 18: THANK YOU ===
writeSlide('s18_thankyou', `<!DOCTYPE html><html><head><style>
body{width:720pt;height:405pt;margin:0;padding:0;overflow:hidden;font-family:'Trebuchet MS','Corbel',sans-serif;display:flex;flex-direction:column;background-image:url('bg-dark.png');background-size:cover;}
.mask{position:absolute;top:0;left:0;width:720pt;height:405pt;background-color:rgba(12,42,64,0.6);}
.content{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40pt;}
h1{color:#FFFFFF;font-size:36pt;font-weight:bold;margin:0 0 10pt 0;text-align:center;}
.sub{color:#A8CEE5;font-size:14pt;margin:0 0 24pt 0;text-align:center;}
.team{background-color:rgba(255,255,255,0.1);border:1pt solid rgba(255,255,255,0.2);border-radius:8pt;padding:16pt 30pt;text-align:center;}
.team h3{color:#FF6B2B;font-size:11pt;font-weight:bold;margin:0 0 8pt 0;}
.team p{color:#FFFFFF;font-size:10pt;margin:0 0 4pt 0;line-height:1.5;}
.motto{color:#2A9D8F;font-size:12pt;font-weight:bold;margin-top:16pt;text-align:center;}
</style></head><body>
<div class="mask"></div>
<div class="content">
<h1>Thank You</h1>
<p class="sub">Questions &amp; Discussion</p>
<div class="team"><h3>NexTech Group</h3><p>Mohau Mphanya</p><p>Sive Mtengwana</p><p>Lesedi Ledwaba</p></div>
<p class="motto">Together, we can bridge the gap.</p>
</div>
</body></html>`);

// === GENERATE PPTX ===
async function generate() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'NexTech Group';
  pptx.subject = 'Design Thinking: Addressing Youth Unemployment in South Africa';
  
  const fontConfig = { cjk: 'Microsoft YaHei', latin: 'Trebuchet MS' };
  
  const slideFiles = [
    's01_cover', 's02_intro', 's03_empathise', 's04_empathy_map',
    's05_data', 's06_problem', 's07_define', 's08_user',
    's09_landscape', 's10_opportunity', 's11_ideate', 's12_solution',
    's13_features', 's14_prototype', 's15_advantage', 's16_testing',
    's17_conclusion', 's18_thankyou'
  ];
  
  for (const name of slideFiles) {
    const htmlPath = path.join(SLIDES_DIR, `${name}.html`);
    console.log(`Processing: ${name}`);
    try {
      const { slide, warnings } = await html2pptx(htmlPath, pptx, { fontConfig });
      if (warnings.length > 0) {
        console.log(`  Warnings: ${warnings.join('; ')}`);
      }
    } catch (err) {
      console.error(`  ERROR on ${name}:`, err.message);
    }
  }
  
  await pptx.writeFile({ fileName: OUTPUT });
  console.log(`\nPresentation saved to: ${OUTPUT}`);
}

generate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
