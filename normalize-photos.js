const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, 'public', 'assets', 'me');

async function normalize() {
  // Let's inspect photo_2.png: it was full body. Let's crop it from waist up to match photo_1 and photo_3.
  const p2Meta = await sharp(path.join(dir, 'photo_2.png')).metadata();
  console.log('photo_2 original dimensions:', p2Meta.width, p2Meta.height);

  // Let's trim photo_2 first to get the subject
  const trimmedP2Buffer = await sharp(path.join(dir, 'photo_2.png')).trim().toBuffer();
  const trimmedP2Meta = await sharp(trimmedP2Buffer).metadata();
  console.log('photo_2 trimmed:', trimmedP2Meta.width, trimmedP2Meta.height);

  // For photo_2, crop from top to about 65% of the trimmed height (waist up)
  const cropHeight = Math.round(trimmedP2Meta.height * 0.65);
  const croppedP2 = await sharp(trimmedP2Buffer)
    .extract({
      left: 0,
      top: 0,
      width: trimmedP2Meta.width,
      height: cropHeight
    })
    .resize({ height: 1650, fit: 'inside' })
    .toBuffer();

  const croppedP2Meta = await sharp(croppedP2).metadata();
  // Pad into standard 1365 x 2048 canvas with bottom alignment
  await sharp({
    create: {
      width: 1365,
      height: 2048,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{
    input: croppedP2,
    top: 2048 - croppedP2Meta.height,
    left: Math.round((1365 - croppedP2Meta.width) / 2)
  }])
  .png()
  .toFile(path.join(dir, 'photo_2.png'));

  console.log('photo_2.png successfully zoomed & normalized to waist-up height!');
}

normalize();
