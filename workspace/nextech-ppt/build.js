const pptxgen = require('pptxgenjs');
const html2pptx = require('/home/z/my-project/skills/ppt/scripts/html2pptx');
const path = require('path');
const fs = require('fs');

async function main() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const fontConfig = { cjk: 'Microsoft YaHei', latin: 'Corbel' };
  const slideDir = path.join(__dirname, 'slides');

  const files = fs.readdirSync(slideDir)
    .filter(f => f.endsWith('.html'))
    .sort();

  const allWarnings = [];

  for (const file of files) {
    const filePath = path.join(slideDir, file);
    console.log(`Processing ${file}...`);
    try {
      const { slide, placeholders, warnings } = await html2pptx(filePath, pptx, { fontConfig });
      if (warnings.length > 0) {
        console.log(`  Warnings for ${file}:`, warnings);
        allWarnings.push({ file, warnings });
      }
    } catch (err) {
      console.error(`  ERROR on ${file}:`, err.message);
      allWarnings.push({ file, warnings: [err.message] });
    }
  }

  const outPath = '/home/z/my-project/public/downloads/NexTech_Design_Thinking_Presentation.pptx';
  await pptx.writeFile({ fileName: outPath });
  console.log(`\nPresentation saved to ${outPath}`);
  console.log(`Total warnings: ${allWarnings.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
