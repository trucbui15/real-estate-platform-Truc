const fs = require('fs');
const path = require('path');

async function processImage() {
  const sharp = require('sharp');
  const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
  const logoPathUploads = path.join(__dirname, '..', 'public', 'uploads', 'logo.png');

  const { data, info } = await sharp(logoPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 230; // Anything brighter than 230 in RGB is considered white background

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // If pixel is near-white (background), set alpha (transparency) to 0
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0; // Alpha transparent
    }
  }

  const transparentBuffer = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toBuffer();

  fs.writeFileSync(logoPath, transparentBuffer);
  fs.writeFileSync(logoPathUploads, transparentBuffer);
  console.log('SUCCESS: Removed white background and saved transparent PNG to public/logo.png!');
}

processImage().catch(console.error);
