/* ═══════════════════════════════════════════
   INDOLLNET PAGE — JavaScript
   ═══════════════════════════════════════════ */

/* ── CUSTOM CURSOR ── */
(function initCursor() {
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;
  
    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    let raf;
  
    const lerp = (a, b, t) => a + (b - a) * t;
  
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });
  
    function trackRing() {
      rx = lerp(rx, mx, 0.12);
      ry = lerp(ry, my, 0.12);
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      raf = requestAnimationFrame(trackRing);
    }
    trackRing();
  
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });
  
    // Hover effect
    document.querySelectorAll('a, button, .pipe-step, .script-char, .team-member, .btn').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  })();
  
  /* ── NAVBAR ── */
  (function initNavbar() {
    const ham = document.getElementById('nav-hamburger');
    const links = document.getElementById('nav-links');
    if (ham && links) {
      ham.addEventListener('click', () => links.classList.toggle('open'));
    }
  
    // Active link
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
      if (a.getAttribute('href') === current) a.classList.add('active');
    });
  })();
  
  /* ── REVEAL ON SCROLL ── */
  (function initReveal() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 60);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
  
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  })();
  
  /* ── COUNTER ANIMATION ── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target || el.textContent.replace(/\D/g,''), 10);
    if (isNaN(target)) return;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1600;
    const start = performance.now();
  
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + Math.floor(ease * target) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(step);
  }
  
  (function initCounters() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counter').forEach(el => obs.observe(el));
  })();
  
  /* ── ACCURACY BARS ── */
  (function initAccBars() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const fill = e.target;
          const w = fill.dataset.width || '0';
          setTimeout(() => { fill.style.width = w + '%'; }, 200);
          obs.unobserve(fill);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.acc-bar-fill').forEach(el => {
      el.style.width = '0%';
      obs.observe(el);
    });
  })();
  
  /* ── TYPEWRITER for hero subtitle ── */
  (function initTypewriter() {
    const el = document.getElementById('hero-typewrite');
    if (!el) return;
    const text = el.dataset.text || '';
    let i = 0;
    el.textContent = '';
    function type() {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(type, 28);
      }
    }
    setTimeout(type, 500);
  })();
  
  /* ── TERMINAL BOOT SEQUENCE ── */
  (function initBoot() {
    const lines = [
      '> INITIALIZING INDOLLNET v1.0...',
      '> LOADING CNN WEIGHTS.............. OK',
      '> JAVANESE UNICODE BLOCK.......... MAPPED',
      '> DATASET: 122 CONTRIBUTORS....... LOADED',
      '> ACCURACY CHECK: 95–98%.......... ✓ PASS',
      '> AKSARA CLASSIFIER............... READY',
      '> SYSTEM STATUS: ONLINE ▌',
    ];
    const container = document.getElementById('boot-terminal');
    if (!container) return;
  
    let lineIdx = 0;
    function addLine() {
      if (lineIdx >= lines.length) return;
      const div = document.createElement('div');
      div.classList.add('boot-line');
      div.style.opacity = '0';
      div.style.transform = 'translateX(-8px)';
      div.style.transition = 'all 0.25s ease';
      const line = lines[lineIdx++];
      // color last word based on content
      const colored = line
        .replace('✓ PASS', '<span class="text-green">✓ PASS</span>')
        .replace('OK', '<span class="text-green">OK</span>')
        .replace('MAPPED', '<span class="text-cyan">MAPPED</span>')
        .replace('LOADED', '<span class="text-amber">LOADED</span>')
        .replace('READY', '<span class="text-green glow-g">READY</span>')
        .replace('ONLINE ▌', '<span class="text-green">ONLINE <span class="blink">▌</span></span>');
      div.innerHTML = colored;
      container.appendChild(div);
      requestAnimationFrame(() => {
        div.style.opacity = '1';
        div.style.transform = 'none';
      });
      setTimeout(addLine, 280);
    }
  
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { setTimeout(addLine, 200); obs.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    obs.observe(container);
  })();
  
  /* ── CANVAS BACKGROUND PARTICLES ── */
  (function initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
  
    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
  
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }));
  
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
  
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,65,${p.alpha})`;
        ctx.fill();
      });
  
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,255,65,${0.06 * (1 - dist/100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  })();
  
  /* ── HOVER CURSOR RE-BIND (for dynamically added elements) ── */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a, button, .pipe-step, .script-char, .team-member, .btn, .t-card').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  });