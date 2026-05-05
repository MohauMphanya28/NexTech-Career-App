const pptxgen = require('pptxgenjs');
const html2pptx = require('/home/z/my-project/skills/ppt/scripts/html2pptx');
const path = require('path');

async function main() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const fontConfig = { cjk: 'Microsoft YaHei', latin: 'Corbel' };

  const slidesDir = '/home/z/my-project/output/slides';
  const slideFiles = [
    'slide01-cover.html',
    'slide02-problem.html',
    'slide03-overview.html',
    'slide04-auth.html',
    'slide05-dashboard.html',
    'slide06-resume-builder.html',
    'slide07-analyzer.html',
    'slide08-cover-letter.html',
    'slide09-interview.html',
    'slide10-guide-progress.html',
    'slide11-vault-flow.html',
    'slide12-architecture.html',
    'slide13-techstack.html',
    'slide14-closing.html'
  ];

  const allWarnings = [];

  for (const file of slideFiles) {
    const htmlPath = path.join(slidesDir, file);
    console.log(`Processing: ${file}`);
    try {
      const { slide, placeholders, warnings } = await html2pptx(htmlPath, pptx, { fontConfig });
      if (warnings.length > 0) {
        console.log(`  Warnings for ${file}:`);
        warnings.forEach(w => console.log(`    ${w}`));
        allWarnings.push({ file, warnings });
      } else {
        console.log(`  OK`);
      }
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      allWarnings.push({ file, warnings: [err.message] });
    }
  }

  const outputPath = '/home/z/my-project/output/NexTech_Career_Features.pptx';
  await pptx.writeFile(outputPath);
  console.log(`\nSaved to: ${outputPath}`);

  if (allWarnings.length > 0) {
    console.log(`\n=== Warnings Summary ===`);
    allWarnings.forEach(({ file, warnings }) => {
      console.log(`${file}:`);
      warnings.forEach(w => console.log(`  - ${w}`));
    });
  }
}

main().catch(err => { console.error(err); process.exit(1); });
