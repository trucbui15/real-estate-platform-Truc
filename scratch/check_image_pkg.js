const fs = require('fs');
const path = require('path');

// Let's test if sharp or pngjs or canvas exists
let sharp;
try {
  sharp = require('sharp');
  console.log('Sharp is available!');
} catch (e) {
  console.log('Sharp is not installed.');
}

let pngjs;
try {
  pngjs = require('pngjs');
  console.log('PNGJS is available!');
} catch (e) {
  console.log('PNGJS is not installed.');
}
