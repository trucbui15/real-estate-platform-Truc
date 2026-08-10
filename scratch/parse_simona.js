const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'simona', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Match all <a> tags with href
const aRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
let match;
const links = [];
while ((match = aRegex.exec(html)) !== null) {
  const href = match[1];
  const rawText = match[2];
  const text = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  links.push({ href, text, rawText: rawText.substring(0, 100) });
}

console.log(`Found ${links.length} total links.`);

// Let's filter out non-resource links if any, or print all valid links
links.forEach((l, i) => {
  console.log(`[${i + 1}] Text: "${l.text}" | URL: "${l.href}"`);
});

// Also search for section headings or titles in the LadiPage HTML
const textNodes = html.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>|<div[^>]*class=["'][^"']*ladi-headline[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi) || [];
console.log('\n--- HEADLINES ---');
textNodes.forEach(tn => {
  const clean = tn.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length > 0 && clean.length < 100) {
    console.log(`Headline: "${clean}"`);
  }
});
