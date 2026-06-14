const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'soladuck 必須放置 1 位農夫 • 農家樂 • Board Game Arena.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('=== 1. Searching for Header & Yellow Banner ===');
// Search for '返回遊戲桌列表' in the html to find the yellow banner
const yellowBannerIdx = html.indexOf('返回遊戲桌列表');
if (yellowBannerIdx !== -1) {
  console.log('Found "返回遊戲桌列表" at index:', yellowBannerIdx);
  // Get surrounding HTML
  const start = Math.max(0, html.lastIndexOf('<div', yellowBannerIdx));
  const end = html.indexOf('</div>', yellowBannerIdx) + 6;
  console.log('Yellow Banner HTML segment:');
  console.log(html.slice(start, end));
} else {
  console.log('Yellow banner text not found.');
}

// Search for BGA top header bar elements
// BGA usually has elements like #topbar, #header, #ebd-header or similar.
const headerKeywords = ['id="topbar"', 'id="header"', 'id="ebd-header"', 'class="header"'];
headerKeywords.forEach(kw => {
  const idx = html.indexOf(kw);
  if (idx !== -1) {
    console.log(`Found header keyword "${kw}" at index: ${idx}`);
    console.log(html.slice(idx - 50, idx + 150));
  }
});

console.log('\n=== 2. Searching for Action Cards / Action Board ===');
// Search for '林地' or '樹林' (Action Board spaces) to find action card elements
const actionKeywords = ['林地', '樹林', '西礦場'];
actionKeywords.forEach(kw => {
  const idx = html.indexOf(kw);
  if (idx !== -1) {
    console.log(`Found Action Space keyword "${kw}" at index: ${idx}`);
    // Find parent div tag
    const start = html.lastIndexOf('<div', idx);
    console.log(html.slice(start, start + 300));
  }
});

console.log('\n=== 3. Searching for player-boards children (farm objects) ===');
// Find what resides inside player boards resizable
const boardResizableIdx = html.indexOf('player-board-resizable');
if (boardResizableIdx !== -1) {
  console.log('Found "player-board-resizable" at index:', boardResizableIdx);
  console.log(html.slice(boardResizableIdx - 50, boardResizableIdx + 300));
}
