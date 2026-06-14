const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'soladuck 必須放置 1 位農夫 • 農家樂 • Board Game Arena.html');
const cssInject = '<link rel="stylesheet" href="bga-agricola-compact-extension-v0.4.1/style.css">';
const jsInject = '<script defer src="bga-agricola-compact-extension-v0.4.1/content.js"></script>';

const reportScript = `
<script>
window.addEventListener('load', () => {
  // Wait 1.5s for initial layout
  setTimeout(() => {
    // Find a mini card in the boards and click it to open zoom modal
    const miniCard = document.querySelector('#player-boards .player-card.mini');
    if (miniCard) {
      console.log('Found mini card, clicking to open zoom modal...');
      miniCard.click();
    } else {
      console.log('No mini card found to click');
    }
    
    // Wait another 800ms for zoom modal to mount and render
    setTimeout(() => {
      const report = {
        window: { width: window.innerWidth, height: window.innerHeight },
        elements: {},
        cropsCompact: null,
        cropsNative: null
      };
      
      const targets = {
        toolbar: '#bga-agri-css-toolbar',
        hand: '#alternative-hand-wrapper',
        boards: '#player-boards',
        zoomOverlay: '#bga-agri-css-zoom',
        zoomCard: '#bga-agri-css-zoom .player-card',
        zoomCardDesc: '#bga-agri-css-zoom .player-card .card-desc',
        zoomCardDescScroller: '#bga-agri-css-zoom .player-card .card-desc .card-desc-scroller'
      };
      
      for (const [key, selector] of Object.entries(targets)) {
        const el = document.querySelector(selector);
        if (el) {
          const r = el.getBoundingClientRect();
          const computed = window.getComputedStyle(el);
          report.elements[key] = {
            selector,
            visible: r.width > 0 && r.height > 0,
            parent: el.parentElement ? {
              tag: el.parentElement.tagName.toLowerCase(),
              id: el.parentElement.id,
              cls: el.parentElement.className
            } : null,
            rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) },
            style: {
              position: computed.position,
              display: computed.display,
              visibility: computed.visibility,
              opacity: computed.opacity,
              overflow: computed.overflow,
              height: computed.height,
              top: computed.top,
              bottom: computed.bottom
            }
          };
        } else {
          report.elements[key] = { selector, visible: false };
        }
      }
      
      const boardsEl = document.querySelector('#player-boards');
      if (boardsEl) {
        report.boardsDiagnostic = {
          inlineStyle: boardsEl.getAttribute('style'),
          offsetTop: boardsEl.offsetTop,
          offsetHeight: boardsEl.offsetHeight,
          clientHeight: boardsEl.clientHeight,
          scrollTop: boardsEl.scrollTop,
          scrollHeight: boardsEl.scrollHeight
        };
      }
      
      // Helper to measure field grain meeple size and ratio
      function measureCrops() {
        const fieldEl = document.querySelector('.meeple-field');
        const grainEl = fieldEl ? fieldEl.querySelector('.meeple-grain') : null;
        if (!fieldEl || !grainEl) {
          return { found: false };
        }
        const fRect = fieldEl.getBoundingClientRect();
        const gRect = grainEl.getBoundingClientRect();
        const fStyle = window.getComputedStyle(fieldEl);
        const gStyle = window.getComputedStyle(grainEl);
        return {
          found: true,
          field: { w: fRect.width, h: fRect.height, fontSize: fStyle.fontSize },
          grain: { w: gRect.width, h: gRect.height, fontSize: gStyle.fontSize },
          ratio: gRect.height / fRect.height
        };
      }
      
      // Measure under Compact Mode
      report.cropsCompact = measureCrops();
      
      // Now toggle off Compact mode to measure native layout
      const toggle = document.querySelector('#bga-agri-css-toggle');
      if (toggle) {
        console.log('Toggling off compact mode...');
        toggle.click();
      }
      
      // Wait 500ms for browser layout update after restoring native BGA
      setTimeout(() => {
        report.cropsNative = measureCrops();
        
        // Send report
        fetch('/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        }).then(() => console.log('Report sent successfully!'))
          .catch(err => console.error('Failed to send report:', err));
      }, 500);
      
    }, 800);
  }, 1500);
});
</script>
`;

if (!fs.existsSync(htmlPath)) {
  console.error('HTML file not found:', htmlPath);
  process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8');

const injections = `${cssInject}\n${jsInject}\n${reportScript}`;
if (html.includes('</head>')) {
  html = html.replace('</head>', `${injections}\n</head>`);
} else {
  html = injections + '\n' + html;
}

const outputPath = path.join(__dirname, 'test_injected.html');
fs.writeFileSync(outputPath, html, 'utf8');
console.log('Successfully generated test_injected.html with reporting capability');
