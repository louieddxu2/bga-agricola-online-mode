const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'soladuck 必須放置 1 位農夫 • 農家樂 • Board Game Arena.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('=== Meeples in Player Boards (Index > 120000) ===');
const regex = /<div[^>]*class="[^"]*meeple[^"]*"[^>]*>/gi;
let match;
let count = 0;
while ((match = regex.exec(html))) {
  if (match.index > 120000 && count < 10) {
    console.log(`Match ${++count}: ${match[0]} at index ${match.index}`);
    // Print 400 characters around the meeple to see the parent field
    const start = html.lastIndexOf('<div', match.index - 150);
    const end = match.index + 250;
    console.log(html.slice(start, end));
    console.log('------------------');
  }
}
