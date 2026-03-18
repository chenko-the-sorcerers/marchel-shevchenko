/* ══════════════════════════════════════════════════════
   components/wayang.js
   ASCII Wayang background — dekoratif di semua halaman
   kecuali index.html
   ══════════════════════════════════════════════════════ */

   const Wayang = (() => {

    // Koleksi ASCII wayang berbagai karakter
    const FIGURES = [
  
      // Arjuna — satria halus
      { name: 'ARJUNA', lines: [
        '    ,^,    ',
        '   (o o)   ',
        '  < |T| >  ',
        '    /|\\    ',
        '   / | \\   ',
        '  /  |  \\  ',
        '    / \\    ',
      ]},
  
      // Semar — punakawan bijak
      { name: 'SEMAR', lines: [
        '   _____   ',
        '  ( o . )  ',
        '  (  v  )  ',
        ' /|     |\\ ',
        '/ |     | \\',
        '  |     |  ',
        '  |_| |_|  ',
      ]},
  
      // Gatotkaca — satria kuat
      { name: 'GATOTKACA', lines: [
        '   /\\_/\\   ',
        '  | o o |  ',
        '  |  ^  |  ',
        ' /|     |\\ ',
        '/ /     \\ \\',
        '| |     | |',
        '\\_/     \\_/',
      ]},
  
      // Bima — satria gagah
      { name: 'BIMA', lines: [
        '   _/ \\_   ',
        '  | * * |  ',
        '  |  >  |  ',
        ' /|_____|\\ ',
        '/ |     | \\',
        '  |     |  ',
        '  |_____|  ',
      ]},
  
      // Punakawan Bagong
      { name: 'BAGONG', lines: [
        '  .------.  ',
        ' ( o   o )  ',
        ' (   w   )  ',
        '  \\     /   ',
        ' /|     |\\  ',
        '/ |     | \\ ',
        '  |_| |_|   ',
      ]},
  
      // Rama — panah
      { name: 'RAMA', lines: [
        '    ,A,    ',
        '   (- -)   ',
        '  <(   )>  ',
        '    |^|    ',
        '   /|||\\   ',
        '  / ||| \\  ',
        '    |_|    ',
      ]},
  
      // Srikandi — ksatria wanita
      { name: 'SRIKANDI', lines: [
        '   ,(_),   ',
        '  ( o o )  ',
        '  (  ^  )  ',
        ' <|     |> ',
        '  |     |  ',
        '  |  |  |  ',
        '  |__|__|  ',
      ]},
  
      // Gunungan / Kayon — pohon kehidupan
      { name: 'GUNUNGAN', lines: [
        '     /\\     ',
        '    /  \\    ',
        '   /><><\\   ',
        '  /<><><>\\  ',
        ' /><><><><\\ ',
        '/____________\\',
        '|    ||    |',
        '|__________| ',
      ]},
  
    ];
  
    // Aksara Jawa dekoratif untuk background
    const AKSARA_BG = [
      'ꦲꦤꦕꦫꦏ', 'ꦢꦠꦱꦮꦭ', 'ꦥꦝꦗꦪꦚ',
      'ꦩꦒꦧꦛꦔ', 'ꦲꦤꦕꦫꦏꦢꦠꦱ',
    ];
  
    let container = null;
    let figures   = [];
    let animId    = null;
    let tick      = 0;
  
    /* ── Don't run on index.html ── */
    function shouldRun() {
      const page = location.pathname.split('/').pop() || 'index.html';
      return page !== 'index.html' && page !== '' && page !== 'rpg.html' && page !== 'game.html';
    }
  
    /* ── Create container ── */
    function buildContainer() {
      container = document.createElement('div');
      container.id = 'wayang-bg';
      container.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
        font-family: 'Share Tech Mono', monospace;
        font-size: 0.65rem;
        line-height: 1.4;
        user-select: none;
      `;
      document.body.appendChild(container);
    }
  
    /* ── Spawn a wayang figure ── */
    function spawnFigure() {
      const fig    = FIGURES[Math.floor(Math.random() * FIGURES.length)];
      const side   = Math.random() > 0.5 ? 'left' : 'right';
      const startX = side === 'left'
        ? -120
        : window.innerWidth + 20;
      const y      = 80 + Math.random() * (window.innerHeight - 250);
      const speed  = 0.12 + Math.random() * 0.18;
      const dir    = side === 'left' ? 1 : -1;
      const alpha  = 0.04 + Math.random() * 0.06; // very subtle
      const color  = Math.random() > 0.6 ? '#00ff41' : Math.random() > 0.5 ? '#ffb300' : '#00e5ff';
      const scale  = 0.7 + Math.random() * 0.8;
  
      const el = document.createElement('pre');
      el.style.cssText = `
        position: absolute;
        left: ${startX}px;
        top: ${y}px;
        color: ${color};
        opacity: ${alpha};
        transform: scaleX(${dir === -1 ? '-' : ''}${scale}) scaleY(${scale});
        transform-origin: top left;
        margin: 0; padding: 0;
        white-space: pre;
        text-shadow: 0 0 8px ${color};
        transition: none;
      `;
      el.textContent = fig.lines.join('\n');
  
      // Name tag below figure
      const nameTag = document.createElement('div');
      nameTag.style.cssText = `
        font-size: 0.5rem;
        color: ${color};
        opacity: 0.6;
        text-align: center;
        letter-spacing: 0.15em;
        margin-top: 2px;
      `;
      nameTag.textContent = fig.name;
      el.appendChild(nameTag);
  
      container.appendChild(el);
      return { el, x: startX, y, speed, dir, alpha, alive: true };
    }
  
    /* ── Spawn aksara text blob ── */
    function spawnAksara() {
      const text  = AKSARA_BG[Math.floor(Math.random() * AKSARA_BG.length)];
      const x     = Math.random() * (window.innerWidth - 100);
      const y     = Math.random() * window.innerHeight;
      const alpha = 0.03 + Math.random() * 0.05;
      const color = '#00ff41';
  
      const el = document.createElement('div');
      el.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        color: ${color};
        opacity: ${alpha};
        font-size: ${0.8 + Math.random() * 1.2}rem;
        text-shadow: 0 0 6px ${color};
        letter-spacing: 0.1em;
        animation: wayangFloat ${8 + Math.random() * 8}s ease-in-out infinite alternate;
        animation-delay: ${Math.random() * 5}s;
      `;
      el.textContent = text;
      container.appendChild(el);
      return el;
    }
  
    /* ── INIT ── */
    function init() {
      if (!shouldRun()) return;
  
      // Inject keyframe animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes wayangFloat {
          from { transform: translateY(0px) rotate(-1deg); }
          to   { transform: translateY(-12px) rotate(1deg); }
        }
      `;
      document.head.appendChild(style);
  
      buildContainer();
  
      // Spawn static aksara blobs first
      for (let i = 0; i < 6; i++) spawnAksara();
  
      // Spawn initial figures
      for (let i = 0; i < 2; i++) {
        setTimeout(() => {
          figures.push(spawnFigure());
        }, i * 4000);
      }
  
      // Periodically spawn new figures
      setInterval(() => {
        // Remove dead figures
        figures = figures.filter(f => f.alive);
        // Keep max 3 figures at once
        if (figures.length < 3) figures.push(spawnFigure());
      }, 6000);
  
      // Animate figures walking across screen
      function animate() {
        tick++;
        for (const fig of figures) {
          if (!fig.alive) continue;
          fig.x += fig.speed * fig.dir;
          fig.el.style.left = fig.x + 'px';
  
          // Subtle vertical bob while walking
          const bob = Math.sin(tick * 0.04 + fig.y) * 3;
          fig.el.style.top = (fig.y + bob) + 'px';
  
          // Kill when off screen
          const offLeft  = fig.dir === -1 && fig.x < -200;
          const offRight = fig.dir ===  1 && fig.x > window.innerWidth + 100;
          if (offLeft || offRight) {
            fig.el.remove();
            fig.alive = false;
          }
        }
        animId = requestAnimationFrame(animate);
      }
      animate();
    }
  
    return { init };
  })();