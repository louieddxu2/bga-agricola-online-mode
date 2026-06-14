const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'soladuck 必須放置 1 位農夫 • 農家樂 • Board Game Arena.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('=== Listing candidate header elements ===');

// Regex to find potential header container div IDs and classes near the top
const divRegex = /<div[^>]*id="([^"]*)"[^>]*>/gi;
let match;
const foundIds = new Set();
while ((match = divRegex.exec(html))) {
  const id = match[1];
  if (id.includes('header') || id.includes('bar') || id.includes('title') || id.includes('banner') || id.includes('menu')) {
    foundIds.add(id);
  }
}
console.log('Found IDs matching header keywords:', Array.from(foundIds));

// Find elements containing button tags with return-like ids or text
const btnRegex = /<(button|a)[^>]*id="([^"]*)"[^>]*>/gi;
const foundBtnIds = new Set();
while ((match = btnRegex.exec(html))) {
  const id = match[2];
  if (id.includes('return') || id.includes('back') || id.includes('table') || id.includes('exit')) {
    foundBtnIds.add(id);
  }
}
console.log('Found button/link IDs:', Array.from(foundBtnIds));

// Let's print out BGA main structural wrappers at the top
const wrappers = ['page-content', 'game_play_area', 'ebd-body', 'global_action_bar'];
wrappers.forEach(w => {
  const idx = html.indexOf(w);
  if (idx !== -1) {
    console.log(`Found structure "${w}" at index ${idx}:`);
    console.log(html.slice(idx - 30, idx + 120));
  }
});
