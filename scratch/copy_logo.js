const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\X\\.gemini\\antigravity-ide\\brain\\27fa9c1f-8e03-44fb-ba14-1f17290d4665\\media__1786422492412.png';
const destPath1 = path.join(__dirname, '..', 'public', 'logo.png');
const destPath2 = path.join(__dirname, '..', 'public', 'uploads', 'logo.png');

if (fs.existsSync(srcPath)) {
  fs.copyFileSync(srcPath, destPath1);
  fs.copyFileSync(srcPath, destPath2);
  console.log('SUCCESSFULLY copied MD logo image to public/logo.png and public/uploads/logo.png!');
} else {
  console.error('Source logo file not found at:', srcPath);
}
