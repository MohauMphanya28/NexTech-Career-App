const pptxgen = require('pptxgenjs');
const html2pptx = require('/home/z/my-project/skills/ppt/scripts/html2pptx');
const path = require('path');

async function main() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'NexTech';
  pptx.subject = 'Addressing Youth Unemployment in South Africa';

  const fontConfig = { cjk: 'Microsoft YaHei', latin: 'Trebuchet MS' };

  const slideFiles = [
    'slides/slide01-cover.html',
    'slides/slide02-problem.html',
    'slides/slide03-solution.html',
    'slides/slide04-resume.html',
    'slides/slide05-cover-letter.html',
    'slides/slide06-interview.html',
    'slides/slide07-ux.html',
    'slides/slide08-architecture.html',
    'slides/slide09-sa-context.html',
    'slides/slide10-roadmap.html',
    'slides/slide11-impact.html',
    'slides/slide12-closing.html',
  ];

  const allWarnings = [];
  for (const htmlFile of slideFiles) {
    const fullPath = path.join(__dirname, htmlFile);
    console.log(`Processing: ${htmlFile}`);
    try {
      const { slide, placeholders, warnings } = await html2pptx(fullPath, pptx, { fontConfig });
      if (warnings.length > 0) {
        console.log(`  Warnings for ${htmlFile}:`);
        warnings.forEach(w => console.log(`    ${w}`));
        allWarnings.push({ file: htmlFile, warnings });
      } else {
        console.log(`  OK`);
      }
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      allWarnings.push({ file: htmlFile, warnings: [err.message] });
    }
  }

  const outputPath = '/home/z/my-project/upload/Addressing Youth Unemployment in South Africa.pptx';
  await pptx.writeFile({ fileName: outputPath });
  console.log(`\nPPTX saved to: ${outputPath}`);

  if (allWarnings.length > 0) {
    console.log(`\nTotal slides with warnings: ${allWarnings.length}`);
  } else {
    console.log('\nAll slides processed without warnings.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
