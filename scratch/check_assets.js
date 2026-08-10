const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'simona', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Find image src tags
const imgRegex = /<img[^>]*src=["']([^"']*)["'][^>]*>/gi;
let match;
const images = [];
while ((match = imgRegex.exec(html)) !== null) {
  images.push(match[1]);
}

console.log('Images count:', images.length);
console.log('Sample images:', images.slice(0, 15));

// Check background images in styles or sources folder
const sourcesDir = path.join(__dirname, 'simona', 'sources');
if (fs.existsSync(sourcesDir)) {
  const files = fs.readdirSync(sourcesDir);
  console.log('Files in sources:', files);
}
