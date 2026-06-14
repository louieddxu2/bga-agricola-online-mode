const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'soladuck 必須放置 1 位農夫 • 農家樂 • Board Game Arena.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Filter out <style>...</style> and <script>...</script>
html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

console.log('=== Searching for Player Board Elements (No Scripts/Styles) ===');

// Let's find "player-board-resizable" or similar tags
let idx = 0;
const searchStr = 'player-board-resizable';
while ((idx = html.indexOf(searchStr, idx)) !== -1) {
  console.log(`Found "${searchStr}" at index ${idx}:`);
  console.log(html.slice(idx - 50, idx + 800));
  console.log('------------------------------------\n');
  idx += searchStr.length;
  break; // Just print the first one for structure analysis
}

// Search for any element containing 'field' or 'sow' or 'plant' or 'farm' inside the player board
const boardStartIdx = html.indexOf('player-board-resizable');
if (boardStartIdx !== -1) {
  const boardHtml = html.slice(boardStartIdx, boardStartIdx + 30000); // Take a large chunk of the board
  // Look for any meeple or resource elements in this board
  const meepleRegex = /<div[^>]*class="[^"]*agricola-meeple[^"]*"[^>]*>/gi;
  let meepleMatch;
  let count = 0;
  console.log('=== Meeples inside this player board ===');
  while ((meepleMatch = meepleRegex.exec(boardHtml)) && count < 10) {
    const start = boardHtml.lastIndexOf('<div', meepleMatch.index - 80);
    console.log(`Meeple ${++count}:`);
    console.log(boardHtml.slice(start, meepleMatch.index + 200));
    console.log('...................\n');
  }
}
