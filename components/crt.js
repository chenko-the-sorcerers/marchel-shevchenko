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
  
    /* ── Cursor particle trail ── */
    function initParticles() {
      const COLORS = ['#00ff41','#00e5ff','#ffb300','#00ff41','#00ff41'];
      let lastX = 0, lastY = 0;
      document.addEventListener('mousemove', e => {
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        if (Math.abs(dx) + Math.abs(dy) < 4) return; // throttle
        lastX = e.clientX; lastY = e.clientY;
        spawnParticle(e.clientX, e.clientY);
      });
  
      function spawnParticle(x, y) {
        const p    = document.createElement('div');
        const size = 3 + Math.random() * 4;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        p.className = 'cursor-particle';
        p.style.cssText = `
          left:${x + (Math.random()-0.5)*12}px;
          top:${y + (Math.random()-0.5)*12}px;
          width:${size}px; height:${size}px;
          background:${color};
          box-shadow:0 0 ${size*2}px ${color};
          animation-duration:${0.4 + Math.random()*0.4}s;
        `;
        document.body.appendChild(p);
        p.addEventListener('animationend', () => p.remove());
      }
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