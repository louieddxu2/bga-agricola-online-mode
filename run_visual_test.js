const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8000;
const ROOT_DIR = __dirname;

let receivedReport = null;

// Simple static file server + report handler
const server = http.createServer((req, res) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  if (req.method === 'POST' && req.url === '/report') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        receivedReport = JSON.parse(body);
        console.log('\n=== Received Layout Report ===');
        console.log(JSON.stringify(receivedReport, null, 2));
        console.log('==============================\n');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (e) {
        res.statusCode = 400;
        res.end('Bad Request');
      }
    });
    return;
  }

  // Decode URL to handle spaces, Chinese characters, etc.
  const decodedUrl = decodeURIComponent(req.url);
  let filePath = path.join(ROOT_DIR, decodedUrl === '/' ? 'test_injected.html' : decodedUrl);
  
  // Basic security check to prevent directory traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    console.error(`[403] Forbidden path: ${filePath}`);
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      console.error(`[404] Not Found: ${filePath}`);
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    // Basic Content-Type mapping
    let ext = path.extname(filePath).toLowerCase();
    let contentType = 'text/html';
    if (ext === '.css') contentType = 'text/css';
    else if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';

    console.log(`[200] Serving ${filePath} (${contentType})`);
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  
  // Run Chrome Headless Screenshot
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const screenshotPath = path.join(ROOT_DIR, 'screenshot_compact.png');
  
  // Wait up to 3 seconds for virtual time to let page load and reporting script trigger
  const cmd = `"${chromePath}" --headless=new --disable-gpu --no-sandbox --window-size=1920,1080 --virtual-time-budget=3000 --enable-logging --screenshot="${screenshotPath}" http://localhost:${PORT}/test_injected.html`;
  
  console.log('Running screenshot and rendering analysis...');
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Chrome execution error: ${error.message}`);
    } else {
      console.log('Chrome command executed successfully.');
      if (fs.existsSync(screenshotPath)) {
        console.log(`Screenshot saved successfully to ${screenshotPath}`);
      } else {
        console.error('Screenshot file was not created by Chrome.');
      }
    }
    
    // Shut down server and run assertions
    console.log('Shutting down server...');
    server.close(() => {
      console.log('Server closed.');
      
      // Perform automated layout assertions
      if (receivedReport) {
        console.log('\n--- Running Layout Assertions ---');
        let failed = false;
        const els = receivedReport.elements;
        
        // Assert: Elements should be visible
        ['toolbar', 'hand', 'boards'].forEach(key => {
          if (!els[key] || !els[key].visible) {
            console.error(`[FAIL] Element '${key}' is not visible or not found in DOM.`);
            failed = true;
          } else {
            console.log(`[PASS] Element '${key}' is visible.`);
          }
        });
        
        if (!failed) {
          // Assert top-down order (toolbar -> hand -> boards)
          const toolbarTop = els.toolbar.rect.top;
          const handTop = els.hand.rect.top;
          const boardsTop = els.boards.rect.top;
          
          console.log(`Positions - Toolbar Top: ${toolbarTop}, Hand Top: ${handTop}, Boards Top: ${boardsTop}`);
          
          // For top-based positioning: toolbar top < hand top < boards top
          if (toolbarTop >= handTop) {
            console.error(`[FAIL] Toolbar (${toolbarTop}) should be above Hand (${handTop}).`);
            failed = true;
          } else {
            console.log(`[PASS] Toolbar is above Hand.`);
          }
          
          if (handTop >= boardsTop) {
            console.error(`[FAIL] Hand (${handTop}) should be above Boards (${boardsTop}).`);
            failed = true;
          } else {
            console.log(`[PASS] Hand is above Boards.`);
          }
        }

        // Assert: Grain to Field ratio comparison
        console.log('\n--- Crop Ratio Assertions (Grain in Field) ---');
        const cCompact = receivedReport.cropsCompact;
        const cNative = receivedReport.cropsNative;
        
        if (cCompact && cCompact.found) {
          console.log(`[INFO] Compact Mode - Field Font Size: ${cCompact.field.fontSize}, Grain Font Size: ${cCompact.grain.fontSize}`);
          console.log(`[INFO] Compact Mode - Field Size: ${cCompact.field.w.toFixed(1)}x${cCompact.field.h.toFixed(1)}, Grain Height: ${cCompact.grain.h.toFixed(1)}`);
          console.log(`[INFO] Compact Mode - Ratio (Grain Height / Field Height): ${cCompact.ratio.toFixed(3)}`);
        } else {
          console.error('[FAIL] Crops in Compact mode not found or could not be measured.');
          failed = true;
        }
        
        if (cNative && cNative.found) {
          console.log(`[INFO] Native BGA    - Field Font Size: ${cNative.field.fontSize}, Grain Font Size: ${cNative.grain.fontSize}`);
          console.log(`[INFO] Native BGA    - Field Size: ${cNative.field.w.toFixed(1)}x${cNative.field.h.toFixed(1)}, Grain Height: ${cNative.grain.h.toFixed(1)}`);
          console.log(`[INFO] Native BGA    - Ratio (Grain Height / Field Height): ${cNative.ratio.toFixed(3)}`);
        } else {
          console.warn('[WARN] Crops in Native BGA mode not found or could not be measured.');
        }

        if (cCompact && cCompact.found && cNative && cNative.found) {
          const ratioDiff = Math.abs(cCompact.ratio - cNative.ratio);
          console.log(`[INFO] Height Ratio Difference (Compact vs Native): ${ratioDiff.toFixed(3)}`);
          
          // Assert that Compact ratio is aligned with Native BGA ratio (around 0.215)
          if (cCompact.ratio < 0.18 || cCompact.ratio > 0.25) {
            console.error(`[FAIL] Compact grain ratio (${cCompact.ratio.toFixed(3)}) is out of expected [0.18, 0.25] bounds.`);
            failed = true;
          } else if (ratioDiff > 0.03) {
            console.error(`[FAIL] Compact grain ratio deviates too much from Native grain ratio (${cNative.ratio.toFixed(3)}).`);
            failed = true;
          } else {
            console.log('[PASS] Crop ratio assertion passed! Compact mode successfully matches or mimics Native BGA crop proportions.');
          }
        }

        // Assert: Played cards layout ratio
        console.log('\n--- Played Cards Layout Assertions (62px wrapper + 4px margin) ---');
        const pStack = receivedReport.playedCardsStack;
        if (pStack) {
          console.log(`[INFO] Card 1 Height: ${pStack.card1Height}px`);
          console.log(`[INFO] Top Coordinate Difference (Card 2 - Card 1): ${pStack.topDiff}px`);
          console.log(`[INFO] Measured Ratio: ${pStack.ratio.toFixed(3)} (Expected: ~0.654)`);
          
          // Ratio should be 66 / 100.98 = 0.654. We allow [0.63, 0.67] range
          if (pStack.ratio < 0.63 || pStack.ratio > 0.67) {
            console.error(`[FAIL] Played cards layout ratio (${pStack.ratio.toFixed(3)}) deviates from the expected 0.654 ratio.`);
            failed = true;
          } else {
            console.log('[PASS] Played cards layout ratio assertion passed! Cards are successfully laid out in columns with 62px wrapper height.');
          }
        } else {
          console.error('[FAIL] Mocked played cards not found or could not be measured.');
          failed = true;
        }
        
        if (failed) {
          console.error('\nResult: LAYOUT VERIFICATION FAILED.');
          process.exit(1);
        } else {
          console.log('\nResult: LAYOUT VERIFICATION PASSED.');
          process.exit(0);
        }
      } else {
        console.error('No layout report received from page. Cannot perform assertions.');
        process.exit(1);
      }
    });
  });
});
