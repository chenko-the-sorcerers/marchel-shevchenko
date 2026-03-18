/* ═══════════════════════════════════════════════════════
   components/crt.js
   Injects: CRT overlays, custom cursor, and exports
   shared utilities. No DOM dependency on page content.
   Call CRT.init() at DOMContentLoaded in every page.
   ═══════════════════════════════════════════════════════ */

   const CRT = (() => {
    /* ── Inject CRT layers once ── */
    function injectLayers() {
      if (document.getElementById('crt-scanlines')) return; // already injected
      const scan = document.createElement('div');
      scan.id = 'crt-scanlines'; scan.className = 'crt-scanlines';
      const vig  = document.createElement('div');
      vig.id = 'crt-vignette'; vig.className = 'crt-vignette';
      const flk  = document.createElement('div');
      flk.id = 'crt-flicker'; flk.className = 'crt-flicker';
      document.body.append(scan, vig, flk);
    }
  
    /* ── Custom cursor ── */
    function initCursor() {
      if (document.getElementById('cursor')) return;
      const cur   = document.createElement('div'); cur.id = 'cursor';
      const trail = document.createElement('div'); trail.id = 'cursor-trail';
      document.body.append(cur, trail);
  
      let mx = 0, my = 0, tx = 0, ty = 0;
      document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        cur.style.left = mx + 'px'; cur.style.top = my + 'px';
      });
      (function animTrail() {
        tx += (mx - tx) * 0.13; ty += (my - ty) * 0.13;
        trail.style.left = tx + 'px'; trail.style.top = ty + 'px';
        requestAnimationFrame(animTrail);
      })();
      document.addEventListener('mousedown', () => cur.style.transform = 'translate(-50%,-50%) scale(1.7)');
      document.addEventListener('mouseup',   () => cur.style.transform = 'translate(-50%,-50%) scale(1)');
    }
  
    /* ── Clock ── */
    function initClock(elId) {
      const el = document.getElementById(elId);
      if (!el) return;
      const tick = () => { el.textContent = new Date().toTimeString().slice(0,8); };
      tick(); setInterval(tick, 1000);
    }
  
    /* ── Scroll reveal ── */
    function initReveal() {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
      }, { threshold: 0.12 });
      document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }
  
    /* ── Active nav link ── */
    function markActiveNav() {
      const path = location.pathname.replace(/\/$/, '') || '/';
      document.querySelectorAll('.nav-link').forEach(a => {
        const href = a.getAttribute('href').replace(/\/$/, '') || '/';
        a.classList.toggle('active', href === path);
      });
    }
  
    /* ── Type text into element ── */
    function typeText(el, text, speed, cb) {
      el.textContent = ''; let i = 0;
      const iv = setInterval(() => {
        el.textContent += text[i++];
        if (i >= text.length) { clearInterval(iv); cb && cb(); }
      }, speed);
      return iv;
    }
  
    /* ── Delete text ── */
    function deleteText(el, speed, cb) {
      const iv = setInterval(() => {
        el.textContent = el.textContent.slice(0, -1);
        if (!el.textContent.length) { clearInterval(iv); cb && cb(); }
      }, speed);
      return iv;
    }
  
    /* ── Cycle type (type → pause → delete → next) ── */
    function cycleType(el, texts, typeSpeed, deleteSpeed, pauseMs) {
      let i = 0;
      function next() {
        typeText(el, texts[i], typeSpeed, () => {
          setTimeout(() => {
            deleteText(el, deleteSpeed, () => {
              i = (i + 1) % texts.length;
              next();
            });
          }, pauseMs);
        });
      }
      next();
    }
  
    /* ── Counter animate ── */
    function animateCounter(el, target, duration) {
      if (el._done) return; el._done = true;
      if (isNaN(target)) { el.textContent = target; return; }
      const step = 16, inc = target / (duration / step);
      let cur = 0;
      const iv = setInterval(() => {
        cur = Math.min(cur + inc, target);
        el.textContent = Math.floor(cur).toLocaleString();
        if (cur >= target) clearInterval(iv);
      }, step);
    }
  
    /* ── Skill bar animate ── */
    function animateSkillBars() {
      document.querySelectorAll('.skill-fill[data-pct]').forEach(bar => {
        if (bar._done) return; bar._done = true;
        setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 80);
      });
    }
  
    /* ── Trigger when element enters viewport ── */
    function onVisible(el, cb) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { obs.disconnect(); cb(); } });
      }, { threshold: 0.15 });
      obs.observe(el);
    }
  
    /* ── Retro terminal page transition ── */
    function initTransitions() {
      // Page-specific log lines shown during transition
      const PAGE_LOGS = {
        'about.html':      [ '[SYS]  Loading operator profile...', '[DAT]  Parsing PROFILE.DAT...', '[OK]   Profile data verified' ],
        'projects.html':   [ '[SYS]  Scanning project directory...', '[DAT]  Reading 17 project entries...', '[OK]   Project index loaded' ],
        'skills.html':     [ '[SYS]  Running SKILLSCAN...', '[DAT]  Parsing CORE_SYSTEMS.LOG...', '[OK]   Skill matrix compiled' ],
        'experience.html': [ '[SYS]  Loading experience log...', '[DAT]  Decrypting work history...', '[OK]   Timeline reconstructed' ],
        'research.html':   [ '[SYS]  Loading research archive...', '[DAT]  Indexing publications...', '[OK]   Research manifest ready' ],
        'talks.html':      [ '[SYS]  Fetching talk archive...', '[DAT]  Indexing 45+ engagements...', '[OK]   Talk manifest ready' ],
        'contact.html':    [ '[SYS]  Opening contact relay...', '[NET]  Establishing uplink...', '[OK]   CONTACT_RELAY.EXE ready' ],
        'chat.html':       [ '[SYS]  Booting AXION agent...', '[AI]   Loading intent engine...', '[OK]   AXION ready for queries' ],
        'index.html':      [ '[SYS]  Returning to home base...', '[OK]   HOME loaded' ],
      };
  
      function getLogsForHref(href) {
        const file = href.split('/').pop() || 'index.html';
        return PAGE_LOGS[file] || [ '[SYS]  Navigating...', '[OK]   Page loaded' ];
      }
  
      // Inject overlay once
      const overlay = document.createElement('div');
      overlay.id = 'page-transition';
      overlay.innerHTML = `
        <div class="pt-bar-wrap">
          <div class="pt-label" id="pt-dest">LOADING...</div>
          <div class="pt-bar-track"><div class="pt-bar-fill" id="pt-fill"></div></div>
        </div>
        <div class="pt-log" id="pt-log"></div>`;
      document.body.appendChild(overlay);
  
      document.addEventListener('click', e => {
        const a = e.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
        e.preventDefault();
        runTransition(href);
      });
  
      function runTransition(href) {
        // Play transition sound
        if (typeof SFX !== "undefined" && SFX.playTransition) SFX.playTransition();
  
        const logs   = getLogsForHref(href);
        const fill   = document.getElementById('pt-fill');
        const logEl  = document.getElementById('pt-log');
        const destEl = document.getElementById('pt-dest');
        const file   = href.split('/').pop() || 'index.html';
  
        // Play nav sound
        if (typeof Sound !== 'undefined') Sound.play('nav');
  
        // Reset
        fill.style.width = '0%';
        logEl.innerHTML  = '';
        destEl.textContent = `>> LOADING ${file.replace('.html','').toUpperCase()}...`;
        overlay.classList.add('active');
  
        const steps = 18;
        const totalMs = 520; // total duration before navigate
        const stepMs = totalMs / steps;
        let step = 0;
  
        // Progress bar ticker
        const barIv = setInterval(() => {
          step++;
          fill.style.width = Math.min((step / steps) * 100, 100) + '%';
          if (step >= steps) clearInterval(barIv);
        }, stepMs);
  
        // Log lines at spread-out intervals
        const logSpread = [60, 180, 340];
        logs.forEach((line, i) => {
          setTimeout(() => {
            const span = document.createElement('span');
            const cls  = line.includes('[OK]') ? 'ok' : line.includes('[NET]') || line.includes('[AI]') ? 'info' : 'warn';
            span.className = cls;
            // Type the line character by character for retro feel
            span.textContent = '';
            logEl.appendChild(span);
            let ci = 0;
            const typeIv = setInterval(() => {
              span.textContent += line[ci++];
              if (ci >= line.length) clearInterval(typeIv);
            }, 18);
          }, logSpread[i] ?? logSpread[logSpread.length - 1]);
        });
  
        // Navigate after animation completes
        setTimeout(() => {
          overlay.classList.remove('active');
          location.href = href;
        }, totalMs + 80);
      }
    }
  
    /* ── Cursor particle trail — Aksara Nusantara ── */
    function initParticles() {
      // Aksara Jawa (Hanacaraka) + Batak + Lontara characters
      const AKSARA = [
        // Hanacaraka (Javanese)
        'ꦲ','ꦤ','ꦕ','ꦫ','ꦏ','ꦢ','ꦠ','ꦱ','ꦮ','ꦭ',
        'ꦥ','ꦝ','ꦗ','ꦪ','ꦚ','ꦩ','ꦒ','ꦧ','ꦛ','ꦔ',
        // Batak
        'ᯀ','ᯂ','ᯄ','ᯅ','ᯆ','ᯇ','ᯈ','ᯉ','ᯊ','ᯋ',
        // Lontara (Bugis)
        'ᨀ','ᨁ','ᨂ','ᨃ','ᨄ','ᨅ','ᨆ','ᨇ','ᨈ','ᨉ',
        // Mix in some binary/code for tech vibe
        '0','1','λ','Δ','∑','π','∞','◈','▸','◆',
      ];

      const COLORS = [
        '#00ff41','#00ff41','#00ff41', // mostly green
        '#00e5ff','#ffb300',           // cyan & amber
        '#cc88ff',                     // occasional purple
      ];

      let lastX = 0, lastY = 0;
      let trailCanvas, trailCtx;
      let trails = []; // { x, y, char, color, alpha, size, vx, vy, age }

      // Use canvas for performance
      function initTrailCanvas() {
        trailCanvas = document.createElement('canvas');
        trailCanvas.id = 'aksara-trail-canvas';
        trailCanvas.style.cssText = `
          position:fixed;inset:0;z-index:9996;
          pointer-events:none;width:100%;height:100%;
        `;
        trailCanvas.width  = window.innerWidth;
        trailCanvas.height = window.innerHeight;
        document.body.appendChild(trailCanvas);
        trailCtx = trailCanvas.getContext('2d');
        window.addEventListener('resize', () => {
          trailCanvas.width  = window.innerWidth;
          trailCanvas.height = window.innerHeight;
        });
      }

      function spawnAksara(x, y, speed) {
        const intensity = Math.min(speed / 8, 1);
        const count = 1 + Math.floor(intensity * 2);
        for (let i = 0; i < count; i++) {
          const char  = AKSARA[Math.floor(Math.random() * AKSARA.length)];
          const color = COLORS[Math.floor(Math.random() * COLORS.length)];
          const size  = 10 + Math.random() * 14;
          trails.push({
            x: x + (Math.random() - 0.5) * 16,
            y: y + (Math.random() - 0.5) * 16,
            char, color, size,
            alpha: 0.7 + Math.random() * 0.3,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -0.5 - Math.random() * 1.5,
            age: 0,
            maxAge: 28 + Math.floor(Math.random() * 20),
            rotate: (Math.random() - 0.5) * 0.3,
            rotateSpeed: (Math.random() - 0.5) * 0.05,
          });
        }
      }

      function animateTrails() {
        if (!trailCtx) return;
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

        for (let i = trails.length - 1; i >= 0; i--) {
          const t = trails[i];
          t.age++;
          t.x  += t.vx;
          t.y  += t.vy;
          t.vy += 0.04; // gentle gravity
          t.rotate += t.rotateSpeed;
          const progress = t.age / t.maxAge;
          const alpha = t.alpha * (1 - progress);
          const scale = 1 - progress * 0.3;

          trailCtx.save();
          trailCtx.globalAlpha = alpha;
          trailCtx.translate(t.x, t.y);
          trailCtx.rotate(t.rotate);
          trailCtx.scale(scale, scale);

          // Glow
          trailCtx.shadowColor = t.color;
          trailCtx.shadowBlur  = 8;
          trailCtx.fillStyle   = t.color;
          trailCtx.font = `${t.size}px 'Share Tech Mono', monospace`;
          trailCtx.textAlign = 'center';
          trailCtx.textBaseline = 'middle';
          trailCtx.fillText(t.char, 0, 0);

          trailCtx.restore();

          if (t.age >= t.maxAge) trails.splice(i, 1);
        }
        requestAnimationFrame(animateTrails);
      }

      document.addEventListener('mousemove', e => {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const speed = Math.sqrt(dx*dx + dy*dy);
        if (speed < 3) { lastX = e.clientX; lastY = e.clientY; return; }
        lastX = e.clientX; lastY = e.clientY;
        spawnAksara(e.clientX, e.clientY, speed);
      });

      // Burst on click
      document.addEventListener('click', e => {
        for (let i = 0; i < 8; i++) spawnAksara(e.clientX, e.clientY, 20);
      });

      initTrailCanvas();
      animateTrails();
    }
  
    /* ── Color mode toggle ── */
    function initColorMode() {
      const MODES = ['green', 'amber', 'cyan'];
      const LABELS = { green: '◉ GRN', amber: '◉ AMB', cyan: '◉ CYN' };
      const stored = localStorage.getItem('axion_mode') || 'green';
      applyMode(stored);
  
      // Inject toggle button into navbar right
      const navRight = document.querySelector('.nav-right');
      if (!navRight) return;
      const btn = document.createElement('button');
      btn.className = 'mode-toggle';
      btn.id = 'mode-toggle';
      btn.innerHTML = `<span class="mode-dot"></span><span id="mode-label">${LABELS[stored]}</span>`;
      navRight.insertBefore(btn, navRight.firstChild);
  
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-mode') || 'green';
        const next    = MODES[(MODES.indexOf(current) + 1) % MODES.length];
        applyMode(next);
        localStorage.setItem('axion_mode', next);
        document.getElementById('mode-label').textContent = LABELS[next];
      });
    }
  
    function applyMode(mode) {
      document.documentElement.setAttribute('data-mode', mode);
    }
  
    /* ── Init everything ── */
    function init(opts = {}) {
      injectLayers();
      initCursor();
      initParticles();
      initColorMode();
      initTransitions();
      if (opts.clockId) initClock(opts.clockId);
      initReveal();
      markActiveNav();
      // Init sound if available
      if (typeof SFX !== "undefined" && SFX.init) SFX.init();
    }
  
    return { init, typeText, deleteText, cycleType, animateCounter, animateSkillBars, onVisible };
  })();