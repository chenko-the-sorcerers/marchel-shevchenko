/* ═══════════════════════════════════════════════════════
   components/sound.js
   Retro beep/click effects using Web Audio API
   No external files needed — all synthesized
   ═══════════════════════════════════════════════════════ */

   const Sound = (() => {
    let ctx = null;
    let enabled = true;
  
    function getCtx() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      return ctx;
    }
  
    /* ── Core synth ── */
    function beep({ freq = 880, type = 'square', duration = 0.06, vol = 0.08, decay = 0.05 }) {
      if (!enabled) return;
      try {
        const ac  = getCtx();
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ac.currentTime);
        gain.gain.setValueAtTime(vol, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
        osc.start(ac.currentTime);
        osc.stop(ac.currentTime + duration + decay);
      } catch(e) {}
    }
  
    /* ── Named sounds ── */
    const sounds = {
      // Short click on hover
      hover:    () => beep({ freq: 1200, type: 'square',   duration: 0.03, vol: 0.05 }),
      // Satisfying click on button press
      click:    () => beep({ freq: 660,  type: 'square',   duration: 0.08, vol: 0.1 }),
      // Page transition — ascending sweep
      nav:      () => {
        beep({ freq: 440, duration: 0.04, vol: 0.07 });
        setTimeout(() => beep({ freq: 660, duration: 0.04, vol: 0.07 }), 50);
        setTimeout(() => beep({ freq: 880, duration: 0.06, vol: 0.06 }), 100);
      },
      // Boot complete — success chord
      boot:     () => {
        beep({ freq: 523, duration: 0.08, vol: 0.07 });
        setTimeout(() => beep({ freq: 659, duration: 0.08, vol: 0.07 }), 80);
        setTimeout(() => beep({ freq: 784, duration: 0.12, vol: 0.08 }), 160);
      },
      // Typing — very soft tick
      type:     () => beep({ freq: 800 + Math.random()*400, type: 'square', duration: 0.02, vol: 0.03 }),
      // Error
      error:    () => {
        beep({ freq: 200, type: 'sawtooth', duration: 0.1, vol: 0.08 });
        setTimeout(() => beep({ freq: 150, type: 'sawtooth', duration: 0.15, vol: 0.07 }), 110);
      },
      // Success / form sent
      success:  () => {
        [523, 659, 784, 1047].forEach((f,i) =>
          setTimeout(() => beep({ freq: f, duration: 0.07, vol: 0.07 }), i * 70)
        );
      },
    };
  
    /* ── Auto-attach to page elements ── */
    function attach() {
      // Hover on nav links + buttons
      document.addEventListener('mouseover', e => {
        if (e.target.matches('.nav-link, .btn, .filter-btn, .tab-btn, .sug-btn, .mode-toggle')) {
          sounds.hover();
        }
      }, true);
  
      // Click on buttons
      document.addEventListener('click', e => {
        if (e.target.closest('.btn, .filter-btn, .tab-btn, .retro-btn')) {
          sounds.click();
        }
      }, true);
  
      // Nav transitions (intercepted by crt.js)
      document.addEventListener('click', e => {
        const a = e.target.closest('a[href]');
        if (a && !a.getAttribute('href').startsWith('#') && !a.getAttribute('href').startsWith('mailto')) {
          sounds.nav();
        }
      }, true);
  
      // Toggle button — sound toggle in navbar
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'sound-toggle';
      toggleBtn.className = 'mode-toggle';
      toggleBtn.title = 'Toggle sound';
      toggleBtn.innerHTML = '<span id="sound-icon">♪</span>';
      toggleBtn.style.cssText = 'font-size:0.75rem;letter-spacing:0;padding:0.2rem 0.45rem;';
      toggleBtn.addEventListener('click', () => {
        enabled = !enabled;
        document.getElementById('sound-icon').textContent = enabled ? '♪' : '♪̶';
        toggleBtn.style.opacity = enabled ? '1' : '0.4';
        if (enabled) sounds.click();
      });
  
      const navRight = document.querySelector('.nav-right');
      if (navRight) navRight.insertBefore(toggleBtn, navRight.firstChild);
    }
  
    function init() {
      // Resume AudioContext on first interaction (browser policy)
      document.addEventListener('click', () => {
        if (ctx && ctx.state === 'suspended') ctx.resume();
      }, { once: true });
      attach();
    }
  
    return { init, play: (name) => sounds[name]?.() };
  })();