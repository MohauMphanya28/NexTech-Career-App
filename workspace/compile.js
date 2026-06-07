const pptxgen = require('pptxgenjs');
const path = require('path');
const html2pptx = require('/home/z/my-project/skills/ppt/scripts/html2pptx.js');

const SLIDES_DIR = path.join(__dirname, 'slides');
const OUTPUT = path.join(__dirname, 'NexTech-Design-Thinking-Presentation.pptx');

const slideFiles = [
  'slide01-title.html',
  'slide02-crisis.html',
  'slide03-empathise-method.html',
  'slide04-empathise-findings.html',
  'slide05-personas.html',
  'slide06-problem-statement.html',
  'slide07-root-cause.html',
  'slide08-hmw.html',
  'slide09-ideate-ideas.html',
  'slide10-idea-eval.html',
  'slide11-discarded.html',
  'slide12-prototype-overview.html',
  'slide13-core-features.html',
  'slide14-tech-arch.html',
  'slide15-user-flow.html',
  'slide16-test-methodology.html',
  'slide17-cahau-feedback.html',
  'slide18-refinements.html',
  'slide19-competitive.html',
  'slide20-impact.html',
  'slide21-conclusion.html',
  'slide22-thankyou.html',
];

async function main() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Mohau Mphanya, Sive Mtengwana, Lesedi Ledwaba';
  pptx.title = 'Design Thinking Project: NexTech Career App';
  pptx.subject = 'Technopreneurship NTEC62110 - Sol Plaatje University';

  const fontConfig = { cjk: 'Microsoft YaHei', latin: 'Trebuchet MS' };
  const allWarnings = [];

  for (let i = 0; i < slideFiles.length; i++) {
    const htmlFile = path.join(SLIDES_DIR, slideFiles[i]);
    console.log(`Processing slide ${i + 1}/${slideFiles.length}: ${slideFiles[i]}`);
    try {
      const { slide, placeholders, warnings } = await html2pptx(htmlFile, pptx, { fontConfig });
      if (warnings.length > 0) {
        console.log(`  Warnings for ${slideFiles[i]}:`);
        warnings.forEach(w => console.log(`    - ${w}`));
        allWarnings.push({ slide: slideFiles[i], warnings });
      }
    } catch (err) {
      console.error(`  ERROR on ${slideFiles[i]}: ${err.message}`);
      allWarnings.push({ slide: slideFiles[i], warnings: [`FATAL: ${err.message}`] });
    }
  }

  await pptx.writeFile(OUTPUT);
  console.log(`\nPresentation saved to: ${OUTPUT}`);
  console.log(`Total slides: ${slideFiles.length}`);

  if (allWarnings.length > 0) {
    console.log(`\nWarnings summary (${allWarnings.length} slides with issues):`);
    allWarnings.forEach(({ slide, warnings }) => {
      console.log(`  ${slide}:`);
      warnings.forEach(w => console.log(`    - ${w}`));
    });
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
