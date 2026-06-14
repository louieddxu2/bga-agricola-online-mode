const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'soladuck 必須放置 1 位農夫 • 農家樂 • Board Game Arena.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('=== Inspecting Farm Grid Cells ===');

// Let's search for board wrapper and inspect its children
const wrapperIdx = html.indexOf('player-board-wrapper');
if (wrapperIdx !== -1) {
  // Let's print out 4000 characters from wrapperIdx to see the layout of farm board grid
  console.log('Fragment from player-board-wrapper:');
  console.log(html.slice(wrapperIdx, wrapperIdx + 3000));
} else {
  console.log('player-board-wrapper not found');
}
