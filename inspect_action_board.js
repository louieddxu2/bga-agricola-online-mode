const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'soladuck 必須放置 1 位農夫 • 農家樂 • Board Game Arena.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('=== Inspecting Action Cards Parent and Siblings ===');

// Find the index of the first action-card class
const actionCardIdx = html.indexOf('class="action-card');
if (actionCardIdx !== -1) {
  // Let's get parent context by looking backward from first action-card
  const start = Math.max(0, actionCardIdx - 800);
  console.log('Context before first action-card:');
  console.log(html.slice(start, actionCardIdx + 300));
} else {
  console.log('No action-card found.');
}

// Let's find all action-cards and print their headers to see how many there are
const regex = /<div[^>]*class="[^"]*action-card[^"]*"[^>]*>([\s\S]*?)<h4[^>]*class="action-header"[^>]*>([\s\S]*?)<\/h4>/gi;
let match;
const actionCards = [];
while ((match = regex.exec(html))) {
  actionCards.push({
    htmlStart: match[0].slice(0, 100),
    title: match[2].trim()
  });
}

console.log(`\nFound ${actionCards.length} action cards on the board:`);
console.log(actionCards);
