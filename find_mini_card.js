const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'soladuck 必須放置 1 位農夫 • 農家樂 • Board Game Arena.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const match = html.indexOf('id="B99_Tutor"');
console.log('Match index:', match);
if (match !== -1) {
  // Print 2000 characters from the match index
  console.log(html.slice(match, match + 2000));
} else {
  console.log('B99_Tutor not found');
}
