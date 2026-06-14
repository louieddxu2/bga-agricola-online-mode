const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'soladuck 必須放置 1 位農夫 • 農家樂 • Board Game Arena_files', 'agricola.css');
const content = fs.readFileSync(cssPath, 'utf8');

console.log('=== Rules with player-boards in agricola.css ===');
const regex = /([^{}]*player-boards[^{}]*)\{([^{}]*)\}/gi;
let match;
let count = 0;
while ((match = regex.exec(content)) && count < 20) {
  console.log(`Rule ${++count}:`);
  console.log(`Selector: ${match[1].trim()}`);
  console.log(`Body: ${match[2].trim()}`);
  console.log('------------------');
}
