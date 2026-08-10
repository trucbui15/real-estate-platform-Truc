const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'simona', 'index.html'), 'utf8');

const bgRegex = /url\(["']?([^"'\)]+)["']?\)/gi;
let match;
const urls = new Set();
while ((match = bgRegex.exec(html)) !== null) {
  urls.add(match[1]);
}

console.log('Background image URLs found in HTML inline styles:');
console.log(Array.from(urls));
