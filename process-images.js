const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { removeBackground } = require('@imgly/background-removal-node');

const inputDir = path.join(__dirname, 'Images', 'Me');
const outputDir = path.join(__dirname, 'public', 'assets', 'me');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function processAll() {
  const files = fs.readdirSync(inputDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  console.log(`Found ${files.length} images to process.`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `photo_${i + 1}.png`);
    console.log(`Processing [${i + 1}/${files.length}]: ${file}...`);
    try {
      const fileBuffer = fs.readFileSync(inputPath);
      const inputBlob = new Blob([fileBuffer], { type: file.endsWith('.png') ? 'image/png' : 'image/jpeg' });
      const resultBlob = await removeBackground(inputBlob);
      const outBuffer = Buffer.from(await resultBlob.arrayBuffer());
      fs.writeFileSync(outputPath, outBuffer);
      console.log(`Successfully saved transparent image: photo_${i + 1}.png (${outBuffer.length} bytes)`);
    } catch (err) {
      console.error(`Failed to process ${file}:`, err);
    }
  }
  console.log('ALL IMAGES PROCESSED SUCCESSFULLY!');
}

processAll();
