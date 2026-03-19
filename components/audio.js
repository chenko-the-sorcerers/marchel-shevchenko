/* ═══════════════════════════════════════════════════════
   audio.js — Retro Audio Engine v4
   Changes from v3:
   - Master volume raised 0.28 → 0.55
   - All individual sound volumes boosted ~2x
   - Ambient gain raised 0.22 → 0.40
   - NEW chess sounds:
       playPieceMove    — wooden thud on piece placement
       playPieceCapture — heavy impact on capture
       playCheck        — urgent double beep + drone
       playCheckmate    — victory fanfare + gong
       playIllegalMove  — descending buzzer
       playCastle       — sliding rook + king thud
       playPromotion    — rising arpeggio + shimmer
       playAIDone       — soft blip when AI moves
       playDraw         — neutral drawn chord
       playHint         — soft ping on hint reveal
       playUndo         — rewind blip
   ═══════════════════════════════════════════════════════ */

   const SFX = (() => {
    let ctx = null, master = null;
    let muted = false;
    let ambientRunning = false, ambientStop = false;
    let ambGain = null;
  
    /* ── LAZY CONTEXT ── */
    function ensureCtx() {
      if (ctx) {
        if (ctx.state === 'suspended') ctx.resume();
        return true;
      }
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain();
        master.gain.value = 0.55; /* ↑ was 0.28 */
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
       STANDARD SOUNDS (all volumes ~2x boosted)
       ══════════════════════════════════════════ */
  
    function playBoot() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      const h = ctx.createOscillator(), hg = ctx.createGain();
      h.type = 'sine'; h.frequency.value = 55;
      hg.gain.setValueAtTime(0, n);
      hg.gain.linearRampToValueAtTime(0.30, n+0.4);
      hg.gain.linearRampToValueAtTime(0, n+0.9);
      h.connect(hg); hg.connect(master); h.start(n); h.stop(n+1);
      tone(440,  'square', n+0.1,  0.07, 0.55);
      tone(880,  'square', n+0.22, 0.07, 0.50);
      tone(1760, 'square', n+0.34, 0.05, 0.42);
      [110,138,165,196,220,262,330,392,523,659,784,1046].forEach((f,i) =>
        tone(f, 'square', n+0.5+i*0.07, 0.06, 0.30)
      );
      for (let i=0;i<8;i++) {
        noise(n+1.5+i*0.15, 0.05, 0.20, 800, 4000);
        tone(180+(i%3)*60, 'square', n+1.5+i*0.15, 0.04, 0.18);
      }
      [220,196,165,147].forEach((f,i) => tone(f,'sawtooth',n+2.7+i*0.12,0.1,0.35));
      const rt = n+3.3;
      [523,659,784,1046].forEach((f,i) => tone(f,'sine',rt+i*0.03,0.5,0.42));
      noise(rt, 0.06, 0.16, 600, 2000);
    }
  
    function playTransition() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      tone(80, 'sawtooth', n, 0.18, 0.40, 2400);
      [1800,1400,1100,880,660].forEach((f,i) => tone(f,'square',n+0.04+i*0.018,0.018,0.24));
      noise(n+0.15, 0.1, 0.12, 1500, 6000);
    }
  
    function playClick() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      tone(1200, 'square', n,      0.025, 0.52);
      tone(600,  'square', n+0.02, 0.025, 0.32);
      noise(n, 0.025, 0.14, 2000, 8000);
    }
  
    function playHover() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      tone(1800, 'square', n, 0.012, 0.14);
    }
  
    function playType() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      const freq = GAMELAN.bonang[Math.floor(Math.random() * GAMELAN.bonang.length)];
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, n);
      o.frequency.exponentialRampToValueAtTime(freq * 0.98, n + 0.08);
      g.gain.setValueAtTime(0.0001, n);
      g.gain.linearRampToValueAtTime(0.32, n + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, n + 0.18);
      o.connect(g); g.connect(master); o.start(n); o.stop(n + 0.2);
      const o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o2.type = 'sine'; o2.frequency.value = freq * 2.76;
      g2.gain.setValueAtTime(0.0001, n);
      g2.gain.linearRampToValueAtTime(0.12, n + 0.003);
      g2.gain.exponentialRampToValueAtTime(0.0001, n + 0.1);
      o2.connect(g2); g2.connect(master); o2.start(n); o2.stop(n + 0.12);
    }
  
    function playSuccess() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      [523,659,784,1046].forEach((f,i) => tone(f,'sine',n+i*0.06,0.18,0.42));
    }
  
    function playError() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      tone(220,'sawtooth',n,0.08,0.52);
      tone(185,'sawtooth',n+0.06,0.08,0.44);
      noise(n, 0.15, 0.24, 100, 600);
    }
  
    /* ══════════════════════════════════════════
       CHESS SOUNDS — NEW in v4
       ══════════════════════════════════════════ */
  
    /* Wooden thud — piece placed on board */
    function playPieceMove() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      noise(n, 0.04, 0.55, 80, 400);
      tone(180, 'sine', n, 0.05, 0.50, 90);
      noise(n + 0.035, 0.018, 0.30, 600, 3000);
      tone(800, 'square', n + 0.035, 0.012, 0.20);
    }
  
    /* Heavy impact — piece captured */
    function playPieceCapture() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      noise(n, 0.06, 0.80, 60, 350);
      tone(120, 'sawtooth', n, 0.08, 0.60, 60);
      noise(n + 0.02, 0.05, 0.40, 1200, 5000);
      noise(n + 0.07, 0.04, 0.25, 80, 300);
      tone(90, 'sine', n + 0.07, 0.06, 0.30);
    }
  
    /* Urgent triple beep — king in check */
    function playCheck() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      tone(880,  'square', n,      0.06, 0.60);
      tone(1100, 'square', n+0.08, 0.06, 0.65);
      tone(880,  'square', n+0.16, 0.06, 0.55);
      noise(n, 0.04, 0.20, 800, 3000);
      tone(110, 'sawtooth', n, 0.22, 0.28);
    }
  
    /* Victory fanfare — checkmate */
    function playCheckmate() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      [1046,880,784,659,523].forEach((f,i) => tone(f,'square',n+i*0.08,0.09,0.55));
      const c = n + 0.5;
      [262,330,392,523].forEach((f,i) => tone(f,'sine',c+i*0.04,0.6,0.50));
      tone(82, 'sine', c, 1.2, 0.45, 55);
      noise(c, 0.08, 0.30, 200, 1500);
    }
  
    /* Descending buzzer — illegal move attempt */
    function playIllegalMove() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      tone(220, 'square', n,      0.05, 0.50);
      tone(196, 'square', n+0.05, 0.05, 0.45);
      tone(175, 'square', n+0.10, 0.05, 0.40);
      noise(n, 0.12, 0.22, 100, 500);
    }
  
    /* Two-part slide — castling */
    function playCastle() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      noise(n, 0.10, 0.40, 200, 1200);
      tone(300, 'sine', n, 0.06, 0.30, 220);
      noise(n + 0.08, 0.04, 0.50, 80, 400);
      tone(160, 'sine', n + 0.08, 0.05, 0.40, 80);
      noise(n + 0.14, 0.02, 0.25, 700, 3000);
      tone(600, 'square', n + 0.14, 0.01, 0.20);
    }
  
    /* Rising shimmer — pawn promotes */
    function playPromotion() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      [262,330,392,523,659,784,1046].forEach((f,i) =>
        tone(f, 'sine', n + i*0.055, 0.12, 0.42)
      );
      const c = n + 0.45;
      [523,659,784].forEach((f,i) => tone(f,'square',c+i*0.05,0.10,0.50));
      tone(1046, 'square', c+0.18, 0.25, 0.55);
      noise(c, 0.08, 0.22, 2000, 8000);
      noise(c+0.2, 0.06, 0.18, 3000, 10000);
    }
  
    /* Soft blip — AI finished computing and played */
    function playAIDone() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      tone(440, 'sine', n,      0.04, 0.28);
      tone(550, 'sine', n+0.04, 0.04, 0.32);
      noise(n, 0.03, 0.12, 800, 3000);
    }
  
    /* Neutral chord — draw / stalemate */
    function playDraw() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      [392, 370, 349].forEach((f,i) => tone(f,'sine',n+i*0.1,0.2,0.42));
      tone(330, 'sine', n+0.35, 0.4, 0.38);
      noise(n, 0.05, 0.15, 300, 1200);
    }
  
    /* High ping — hint shown */
    function playHint() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      tone(1320, 'sine', n,      0.06, 0.35);
      tone(1760, 'sine', n+0.06, 0.06, 0.28);
      noise(n, 0.03, 0.10, 1500, 5000);
    }
  
    /* Descending blips — undo move */
    function playUndo() {
      if (!ensureCtx()) return;
      const n = ctx.currentTime;
      tone(880, 'square', n,      0.03, 0.38);
      tone(660, 'square', n+0.04, 0.03, 0.34);
      tone(523, 'square', n+0.08, 0.05, 0.30);
    }
  
    /* ══════════════════════════════════════════
       GAMELAN SCALES + AMBIENT
       ══════════════════════════════════════════ */
    const GAMELAN = {
      pelog_lo:  [130.8, 146.8, 164.8, 185.0, 207.7, 220.0, 246.9],
      pelog_mid: [261.6, 293.7, 329.6, 370.0, 415.3, 440.0, 493.9],
      pelog_hi:  [523.3, 587.3, 659.3, 740.0, 830.6, 880.0, 987.8],
      slendro_lo:  [130.8, 155.6, 185.0, 220.0, 261.6],
      slendro_mid: [261.6, 311.1, 370.0, 440.0, 523.3],
      slendro_hi:  [523.3, 622.3, 740.0, 880.0, 1046.5],
      bonang: [523.3, 587.3, 659.3, 698.5, 783.9, 880.0],
      gong:   [55, 65.4, 73.4, 82.4, 87.3, 98.0],
    };
    const NOTES = { lo: GAMELAN.slendro_lo, mid: GAMELAN.slendro_mid, hi: GAMELAN.slendro_hi };
  
    function schedBonang(freq, t, vol) {
      if (!ctx || ambientStop || muted) return;
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      o2.type = 'sine'; o2.frequency.value = freq * 2.76;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.005);
      g.gain.exponentialRampToValueAtTime(vol * 0.4, t + 0.3);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      const g2 = ctx.createGain(); g2.gain.value = 0.3;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(ambGain);
      o.start(t); o.stop(t + 1.3);
      o2.start(t); o2.stop(t + 0.8);
    }
  
    function schedSaron(freq, t, dur, vol) {
      if (!ctx || ambientStop || muted) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(vol * 0.5, t + dur * 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ambGain);
      o.start(t); o.stop(t + dur + 0.05);
    }
  
    function schedGong(freq, t, vol) {
      if (!ctx || ambientStop || muted) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 4.0);
      o.connect(g); g.connect(ambGain);
      o.start(t); o.stop(t + 4.5);
    }
  
    function schedKendhang(t, vol) {
      if (!ctx || ambientStop || muted) return;
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.15), ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f   = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 180; f.Q.value = 0.8;
      const g   = ctx.createGain(); g.gain.value = vol;
      src.connect(f); f.connect(g); g.connect(ambGain);
      src.start(t); src.stop(t + 0.2);
    }
  
    function phrase(startAt) {
      if (ambientStop || muted || !ctx) return;
      const pat     = Math.floor(Math.random() * 5);
      let t         = startAt;
      const scale   = Math.random() > 0.5 ? GAMELAN.pelog_mid : GAMELAN.slendro_mid;
      const scaleLo = Math.random() > 0.5 ? GAMELAN.pelog_lo  : GAMELAN.slendro_lo;
  
      if (pat === 0) {
        const notes = [...scale].sort(() => Math.random() - 0.5).slice(0, 4);
        for (let i = 0; i < 8 + Math.floor(Math.random() * 4); i++) {
          schedBonang(notes[i % notes.length], t, 0.18 + Math.random() * 0.08);
          if (i % 2 === 1) schedBonang(notes[(i+2) % notes.length] * 0.5, t + 0.12, 0.12);
          t += 0.24 + Math.random() * 0.08;
        }
      } else if (pat === 1) {
        for (let i = 0; i < 5 + Math.floor(Math.random() * 4); i++) {
          const freq = scale[Math.floor(Math.random() * scale.length)];
          schedSaron(freq, t, 0.35 + Math.random() * 0.25, 0.22 + Math.random() * 0.08);
          t += 0.45 + Math.random() * 0.35;
        }
        if (Math.random() > 0.5) { schedSaron(scale[Math.floor(Math.random() * scale.length)], t, 0.4, 0.14); t += 0.6; }
      } else if (pat === 2) {
        for (let i = 0; i < 8; i++) {
          if (i % 3 === 0) schedKendhang(t, 0.30);
          if (i % 2 === 0) schedSaron(scaleLo[Math.floor(Math.random() * scaleLo.length)], t, 0.18, 0.18);
          t += 0.22;
        }
      } else if (pat === 3) {
        schedGong(GAMELAN.gong[Math.floor(Math.random() * GAMELAN.gong.length)], t, 0.35);
        t += 0.5;
        for (let i = 0; i < 5; i++) { schedBonang(scale[Math.floor(Math.random() * scale.length)], t, 0.14); t += 0.18 + Math.random() * 0.1; }
      } else {
        const runScale = [...GAMELAN.pelog_mid, ...GAMELAN.pelog_hi];
        for (let i = 0; i < 10 + Math.floor(Math.random() * 6); i++) {
          schedSaron(runScale[Math.floor(Math.random() * runScale.length)], t, 0.12, 0.15);
          t += 0.09 + Math.random() * 0.06;
        }
      }
  
      if (Math.random() > 0.4) {
        schedBonang(GAMELAN.bonang[Math.floor(Math.random() * GAMELAN.bonang.length)], startAt + Math.random() * 2, 0.10);
      }
  
      const gap   = 1.5 + Math.random() * 4.0;
      const next  = t + gap;
      const delay = Math.max(50, (next - ctx.currentTime - 0.3) * 1000);
      setTimeout(() => { if (!ambientStop) phrase(next); }, delay);
    }
  
    function startAmbient() {
      if (!ensureCtx() || ambientRunning || muted) return;
      ambientRunning = true; ambientStop = false;
      ambGain = ctx.createGain();
      ambGain.gain.value = 0;
      ambGain.connect(master);
      ambGain.gain.linearRampToValueAtTime(0.40, ctx.currentTime + 4); /* ↑ was 0.22 */
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
      if (master) master.gain.linearRampToValueAtTime(muted ? 0 : 0.55, ctx.currentTime + 0.3);
      muted ? stopAmbient() : startAmbient();
      return muted;
    }
  
    /* ══════════════════════════════════════════
       WIRE EVENTS
       ══════════════════════════════════════════ */
    function wireEvents() {
      let lastHover = null;
  
      document.addEventListener('mouseover', e => {
        const el = e.target;
        if (el === lastHover) return;
        lastHover = el;
        if (el.matches('a, button, .btn, .nav-link, .filter-btn, .tab-btn, .sug-btn, .contact-link, .pill, .ctrl-btn, .diff-btn, .promo-piece')) {
          playHover(); return;
        }
        const card = el.closest('.t-card, .proj-card, .tl-item, .skill-item, .cert-item, .ach-item, .talk-item, .stat-item, .edu-item');
        if (card && card !== lastHover) { lastHover = card; playHover(); }
      });
  
      document.addEventListener('click', e => {
        const el = e.target;
        if (el.matches('button, .btn, .filter-btn, .tab-btn, .sug-btn, .nav-burger, .ctrl-btn, .diff-btn')) {
          playClick(); return;
        }
        if (el.id === 'cf-send' || el.id === 'chat-send') setTimeout(playSuccess, 2200);
      });
  
      document.addEventListener('keydown', e => {
        const tag = document.activeElement?.tagName;
        const id  = document.activeElement?.id;
        if (id === 'mt-input' || id === 'chat-input' || id === 'tm-input') {
          if (e.key.length === 1 || e.key === 'Backspace') playType();
          if (e.key === 'Enter') playClick();
        }
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
       INIT
       ══════════════════════════════════════════ */
    function init() {
      wireEvents();
      setTimeout(injectMuteBtn, 300);
      const onFirst = () => { ensureCtx(); startAmbient(); };
      document.addEventListener('click',     onFirst, { once: true });
      document.addEventListener('keydown',   onFirst, { once: true });
      document.addEventListener('mousemove', onFirst, { once: true });
    }
  
    (() => {
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
      /* ── chess specific ── */
      playPieceMove, playPieceCapture,
      playCheck, playCheckmate,
      playIllegalMove, playCastle,
      playPromotion, playAIDone,
      playDraw, playHint, playUndo,
    };
  })();