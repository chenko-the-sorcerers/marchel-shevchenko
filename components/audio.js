/* ═══════════════════════════════════════════════════════
   audio.js — Retro Audio Engine v3
   Key fix: wireEvents runs immediately on script load,
   independent of AudioContext. ctx created lazily on
   first user gesture. Works on ALL pages.
   ═══════════════════════════════════════════════════════ */

   const SFX = (() => {
    let ctx = null, master = null;
    let muted = false;
    let ambientRunning = false, ambientStop = false;
    let ambGain = null;
  
    /* ── LAZY CONTEXT — created on first gesture ── */
    function ensureCtx() {
      if (ctx) {
        if (ctx.state === 'suspended') ctx.resume();
        return true;
      }
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain();
        master.gain.value = 0.28;
        master.connect(ctx.destination);
        if (ctx.state === 'suspended') ctx.resume();
        return true;
      } catch(e) { return false; }
    }
  
    /* ── PRIMITIVES ── */
    function tone(freq, type, t, dur, vol, slide) {
      if (!ctx || muted) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + dur + 0.05);
    }
  
    function noise(t, dur, vol, lo = 300, hi = 3000) {
      if (!ctx || muted) return;
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src  = ctx.createBufferSource(); src.buffer = buf;
      const flo  = ctx.createBiquadFilter(); flo.type = 'highpass'; flo.frequency.value = lo;
      const fhi  = ctx.createBiquadFilter(); fhi.type = 'lowpass';  fhi.frequency.value = hi;
      const g    = ctx.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(flo); flo.connect(fhi); fhi.connect(g); g.connect(master);
      src.start(t); src.stop(t + dur + 0.05);
    }
  
    /* ══════════════════════════════════════════
       SOUNDS
       ══════════════════════════════════════════ */
  
    function playBoot() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      // Power hum
      const h = ctx.createOscillator(), hg = ctx.createGain();
      h.type = 'sine'; h.frequency.value = 55;
      hg.gain.setValueAtTime(0, n);
      hg.gain.linearRampToValueAtTime(0.15, n+0.4);
      hg.gain.linearRampToValueAtTime(0, n+0.9);
      h.connect(hg); hg.connect(master); h.start(n); h.stop(n+1);
      // POST beeps
      tone(440,  'square', n+0.1,  0.07, 0.32);
      tone(880,  'square', n+0.22, 0.07, 0.28);
      tone(1760, 'square', n+0.34, 0.05, 0.22);
      // Memory scan arpeggio
      [110,138,165,196,220,262,330,392,523,659,784,1046].forEach((f,i) =>
        tone(f, 'square', n+0.5+i*0.07, 0.06, 0.16)
      );
      // Disk noise
      for (let i=0;i<8;i++) {
        noise(n+1.5+i*0.15, 0.05, 0.1, 800, 4000);
        tone(180+(i%3)*60, 'square', n+1.5+i*0.15, 0.04, 0.09);
      }
      // Kernel bass
      [220,196,165,147].forEach((f,i) => tone(f,'sawtooth',n+2.7+i*0.12,0.1,0.18));
      // Ready chord
      const rt = n+3.3;
      [523,659,784,1046].forEach((f,i) => tone(f,'sine',rt+i*0.03,0.5,0.22));
      noise(rt, 0.06, 0.08, 600, 2000);
    }
  
    function playTransition() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      tone(80, 'sawtooth', n, 0.18, 0.2, 2400);
      [1800,1400,1100,880,660].forEach((f,i) => tone(f,'square',n+0.04+i*0.018,0.018,0.12));
      noise(n+0.15, 0.1, 0.06, 1500, 6000);
    }
  
    function playClick() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      tone(1200, 'square', n,      0.025, 0.28);
      tone(600,  'square', n+0.02, 0.025, 0.16);
      noise(n, 0.025, 0.07, 2000, 8000);
    }
  
    function playHover() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      tone(1800, 'square', n, 0.012, 0.06);
    }
  
    function playType() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      const freqs = [880,1100,990,1200,770];
      tone(freqs[Math.floor(Math.random()*freqs.length)], 'square', n, 0.018, 0.065);
    }
  
    function playSuccess() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      [523,659,784,1046].forEach((f,i) => tone(f,'sine',n+i*0.06,0.18,0.2));
    }
  
    function playError() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      tone(220,'sawtooth',n,0.08,0.28);
      tone(185,'sawtooth',n+0.06,0.08,0.22);
      noise(n, 0.15, 0.12, 100, 600);
    }
  
    /* ══════════════════════════════════════════
       AMBIENT CHIPTUNE
       ══════════════════════════════════════════ */
    const NOTES = {
      lo:  [110,130.8,146.8,164.8,174.6,196,220,233.1],
      mid: [261.6,311.1,349.2,392,440,466.2,523.3],
      hi:  [587.3,659.3,698.5,783.9,880],
    };
  
    function schedNote(freq, t, dur, vol) {
      if (!ctx || ambientStop || muted) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = Math.random() > 0.3 ? 'sine' : 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t+0.01);
      g.gain.setValueAtTime(vol*0.7, t+dur-0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
      o.connect(g); g.connect(ambGain);
      o.start(t); o.stop(t+dur+0.05);
    }
  
    function phrase(startAt) {
      if (ambientStop || muted || !ctx) return;
      const pat = Math.floor(Math.random()*4);
      let t = startAt;
  
      if (pat === 0) {
        // Arpeggio run
        const pool = [...NOTES.lo, ...NOTES.mid];
        for (let i=0; i<7+Math.floor(Math.random()*5); i++) {
          schedNote(pool[Math.floor(Math.random()*pool.length)], t, 0.1+Math.random()*0.1, 0.12+Math.random()*0.08);
          t += 0.12 + Math.random()*0.08;
        }
      } else if (pat === 1) {
        // Slow melodic line
        const pool = [...NOTES.mid, ...NOTES.hi];
        for (let i=0; i<4+Math.floor(Math.random()*4); i++) {
          schedNote(pool[Math.floor(Math.random()*pool.length)], t, 0.25+Math.random()*0.2, 0.1+Math.random()*0.08);
          t += 0.38 + Math.random()*0.28;
        }
      } else if (pat === 2) {
        // Rhythmic pulse
        for (let i=0; i<8; i++) {
          schedNote(NOTES.lo[Math.floor(Math.random()*4)], t, 0.08, 0.16);
          if (i%2===1) schedNote(NOTES.mid[Math.floor(Math.random()*NOTES.mid.length)], t+0.04, 0.06, 0.09);
          t += 0.2;
        }
      } else {
        // Chord stabs
        const roots = [261.6,220,196,233.1];
        const root  = roots[Math.floor(Math.random()*roots.length)];
        for (let i=0; i<3+Math.floor(Math.random()*3); i++) {
          schedNote(root,       t,      0.18, 0.16);
          schedNote(root*1.189, t+0.02, 0.14, 0.1);
          schedNote(root*1.498, t+0.04, 0.12, 0.08);
          t += 0.55 + Math.random()*0.4;
        }
      }
  
      // Sparkle
      if (Math.random() > 0.45) {
        const hi = NOTES.hi[Math.floor(Math.random()*NOTES.hi.length)];
        schedNote(hi, startAt + Math.random()*1.5, 0.06, 0.07);
      }
  
      const next = t + 0.8 + Math.random()*2.5;
      const delay = Math.max(50, (next - ctx.currentTime - 0.3)*1000);
      setTimeout(() => { if (!ambientStop) phrase(next); }, delay);
    }
  
    function startAmbient() {
      if (!ensureCtx() || ambientRunning || muted) return;
      ambientRunning = true; ambientStop = false;
      ambGain = ctx.createGain();
      ambGain.gain.value = 0;
      ambGain.connect(master);
      ambGain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 4);
      phrase(ctx.currentTime + 1.2);
    }
  
    function stopAmbient() {
      ambientStop = true; ambientRunning = false;
      if (ambGain) ambGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    }
  
    /* ══════════════════════════════════════════
       MUTE
       ══════════════════════════════════════════ */
    function toggleMute() {
      muted = !muted;
      if (master) master.gain.linearRampToValueAtTime(muted ? 0 : 0.28, ctx.currentTime + 0.3);
      muted ? stopAmbient() : startAmbient();
      return muted;
    }
  
    /* ══════════════════════════════════════════
       WIRE EVENTS — runs immediately, no ctx needed
       ensureCtx() called lazily inside each sound fn
       ══════════════════════════════════════════ */
    function wireEvents() {
      let lastHover = null;
  
      // Hover sounds
      document.addEventListener('mouseover', e => {
        const el = e.target;
        if (el === lastHover) return;
        lastHover = el;
  
        // Direct matches
        if (el.matches('a, button, .btn, .nav-link, .filter-btn, .tab-btn, .sug-btn, .contact-link, .pill')) {
          playHover(); return;
        }
        // Parent card/section hover
        const card = el.closest('.t-card, .proj-card, .tl-item, .skill-item, .cert-item, .ach-item, .talk-item, .stat-item, .edu-item');
        if (card && card !== lastHover) {
          lastHover = card;
          playHover();
        }
      });
  
      // Click sounds
      document.addEventListener('click', e => {
        const el = e.target;
        if (el.matches('button, .btn, .filter-btn, .tab-btn, .sug-btn, .nav-burger')) {
          playClick(); return;
        }
        // Form send — success sound after delay
        if (el.id === 'cf-send' || el.id === 'chat-send') {
          setTimeout(playSuccess, 2200);
        }
      });
  
      // Typing sounds in terminal/chat inputs
      document.addEventListener('keydown', e => {
        const tag = document.activeElement?.tagName;
        const id  = document.activeElement?.id;
        if (id === 'mt-input' || id === 'chat-input' || id === 'tm-input') {
          if (e.key.length === 1 || e.key === 'Backspace') playType();
          if (e.key === 'Enter') playClick();
        }
        // Global mute shortcut S
        if ((e.key === 's' || e.key === 'S') && tag !== 'INPUT' && tag !== 'TEXTAREA') {
          const btn = document.getElementById('mute-btn');
          if (btn) btn.click();
        }
      });
    }
  
    /* ── MUTE BUTTON ── */
    function injectMuteBtn() {
      if (document.getElementById('mute-btn')) return;
      const navRight = document.querySelector('.nav-right');
      if (!navRight) return;
      const btn = document.createElement('button');
      btn.id = 'mute-btn';
      btn.className = 'mode-toggle';
      btn.title = 'Toggle sound (S)';
      btn.innerHTML = `<span id="mute-icon" style="font-size:0.85rem">♪</span>`;
      navRight.insertBefore(btn, navRight.firstChild);
      btn.addEventListener('click', () => {
        const isMuted = toggleMute();
        document.getElementById('mute-icon').textContent = isMuted ? '✕' : '♪';
        btn.style.opacity = isMuted ? '0.4' : '1';
      });
    }
  
    /* ══════════════════════════════════════════
       INIT — called once per page by CRT.init()
       ══════════════════════════════════════════ */
    function init() {
      // wireEvents immediately — no AudioContext needed yet
      wireEvents();
  
      // Inject mute btn after navbar renders
      setTimeout(injectMuteBtn, 300);
  
      // Start ambient + create ctx on first ANY interaction
      const onFirst = () => {
        ensureCtx();
        startAmbient();
      };
      document.addEventListener('click',     onFirst, { once: true });
      document.addEventListener('keydown',   onFirst, { once: true });
      document.addEventListener('mousemove', onFirst, { once: true });
    }
  
    // ── AUTO-INIT: also wire events as soon as script loads
    // This handles the case where init() might be called before
    // all page JS is ready
    (() => {
      // Wire events immediately when script loads
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireEvents);
      } else {
        wireEvents();
      }
    })();
  
    return {
      init, toggleMute,
      playBoot, playTransition,
      playClick, playHover, playType,
      playSuccess, playError,
      startAmbient, stopAmbient,
    };
  })();