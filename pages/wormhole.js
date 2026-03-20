/* ═══════════════════════════════════════════════════════════════
   wormhole.js v5
   - Canvas always fills 100vw × 100vh
   - Dramatic glitch effects at every phase transition
   - Phase boundary glitch: chromatic aberration, scanline tear,
     pixel shift, color invert flash
   ═══════════════════════════════════════════════════════════════ */

   const Wormhole = (() => {

    let canvas, ctx, W, H;
    let gt = 0, lastTs = 0;
    let scrollProgress = 0;
    let navigating = false;
    let glitchTimer = 0;
    let lastPhase = -1;
  
    // Explosion state
    let explosion = null;   // { t, maxT, cx, cy, rings, particles }
    let shockwave = null;   // { t, maxT }
  
    const BG = 'rgb(2,9,5)';
  
    /* ══════════════════════════════════════
       WORMHOLE AUDIO ENGINE
       Self-contained, no dependency on SFX
       ══════════════════════════════════════ */
    const WA = (() => {
      let ac = null;
      let master = null;
  
      function boot() {
        if (ac) { if (ac.state==='suspended') ac.resume(); return true; }
        try {
          ac = new (window.AudioContext||window.webkitAudioContext)();
          master = ac.createGain(); master.gain.value = 0.55;
          master.connect(ac.destination);
          return true;
        } catch(e) { return false; }
      }
  
      function tone(freq, type, t, dur, vol, slide) {
        if (!ac) return;
        const o=ac.createOscillator(), g=ac.createGain();
        o.type=type; o.frequency.setValueAtTime(freq,t);
        if (slide) o.frequency.exponentialRampToValueAtTime(slide,t+dur);
        g.gain.setValueAtTime(0.001,t);
        g.gain.linearRampToValueAtTime(vol,t+0.008);
        g.gain.exponentialRampToValueAtTime(0.001,t+dur);
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t+dur+0.05);
      }
  
      function noise(t, dur, vol, lo=200, hi=4000) {
        if (!ac) return;
        const buf=ac.createBuffer(1,Math.ceil(ac.sampleRate*dur),ac.sampleRate);
        const d=buf.getChannelData(0);
        for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
        const src=ac.createBufferSource(); src.buffer=buf;
        const fl=ac.createBiquadFilter(); fl.type='highpass'; fl.frequency.value=lo;
        const fh=ac.createBiquadFilter(); fh.type='lowpass';  fh.frequency.value=hi;
        const g=ac.createGain();
        g.gain.setValueAtTime(vol,t);
        g.gain.exponentialRampToValueAtTime(0.001,t+dur);
        src.connect(fl); fl.connect(fh); fh.connect(g); g.connect(master);
        src.start(t); src.stop(t+dur+0.05);
      }
  
      // Phase 1: wormhole entry — deep rumble + rising whine
      function playWormholeEntry() {
        if (!boot()) return;
        const n = ac.currentTime;
        // Deep sub rumble
        tone(40, 'sine',     n,      2.2, 0.4);
        tone(60, 'sine',     n+0.1,  2.0, 0.25);
        // Rising whine
        tone(120,'sawtooth', n,      2.0, 0.2, 800);
        // Chaos noise
        noise(n,      0.4, 0.18, 80,  600);
        noise(n+0.5,  0.6, 0.22, 100, 1200);
        noise(n+1.2,  0.8, 0.28, 60,  800);
        // Pulse hits
        [0.3,0.6,0.9,1.2,1.5].forEach((dt,i) => {
          tone(80-i*8,'square',n+dt,0.12,0.15);
          noise(n+dt,0.1,0.12,400,2000);
        });
      }
  
      // Phase 2: tunnel — whooshing rush + heartbeat
      function playTunnel() {
        if (!boot()) return;
        const n = ac.currentTime;
        // Whoosh
        tone(200,'sawtooth',n,0.3,0.35,2200);
        noise(n,0.8,0.3,500,6000);
        // Deep heartbeat pulse
        [0,0.5,1.0,1.4,1.7,1.9].forEach(dt => {
          tone(55,'sine',n+dt,0.18,0.45);
          noise(n+dt,0.1,0.1,60,200);
        });
        // High-freq data stream
        for (let i=0;i<8;i++) {
          tone(1200+i*200,'square',n+i*0.12,0.06,0.08);
        }
      }
  
      // Phase 2→3: BIG EXPLOSION — the moment of impact
      function playExplosion() {
        if (!boot()) return;
        const n = ac.currentTime;
  
        // ── IMPACT THUD — sub bass punch ──
        tone(30,'sine',n,0.5,0.9,15);
        tone(50,'sine',n,0.4,0.7);
  
        // ── SHOCKWAVE CRACK ──
        noise(n,     0.08, 0.95, 20,  400);   // ultra-low crack
        noise(n+0.02,0.15, 0.85, 100, 2000);  // mid body
        noise(n+0.05,0.4,  0.6,  800, 8000);  // high sizzle tail
  
        // ── DEBRIS scatter — random high tones ──
        for (let i=0;i<12;i++) {
          const dt = i*0.04;
          tone(800+Math.random()*1600,'square',n+dt,0.05,0.15);
        }
  
        // ── REVERB TAIL — decaying rumble ──
        tone(35,'sawtooth',n+0.1,1.2,0.5,20);
        noise(n+0.1,1.5,0.35,40,300);
  
        // ── ELECTRIC ZAP ──
        tone(3000,'sawtooth',n,    0.06,0.4,100);
        tone(2000,'sawtooth',n+0.03,0.08,0.3,50);
  
        // ── GLASS SHATTER feel — glitchy high bursts ──
        [0.08,0.14,0.2,0.28].forEach(dt => {
          noise(n+dt,0.04,0.5,3000,12000);
        });
      }
  
      // Phase 3: Tron — neon hum + engine roar
      function playTron() {
        if (!boot()) return;
        const n = ac.currentTime;
        // Engine roar building
        tone(80,'sawtooth',n,    2.5,0.3,200);
        tone(160,'square', n+0.1,2.3,0.2);
        // Neon electric hum
        tone(440,'sine',   n,    2.0,0.12);
        tone(880,'sine',   n+0.05,1.8,0.08);
        // Bike pass-bys
        [0.3,0.7,1.1,1.5,1.9].forEach(dt => {
          tone(600+Math.random()*400,'sawtooth',n+dt,0.15,0.18,200+Math.random()*100);
          noise(n+dt,0.2,0.15,1000,5000);
        });
      }
  
      return { playWormholeEntry, playTunnel, playExplosion, playTron };
    })();
  
    let autoProgress = 0;     // auto-driven progress 0..1
    let autoActive   = false; // true when section is in viewport
    let lastScrollY  = -1;
    let scrollStale  = 0;     // seconds since last scroll
    const AUTO_SPEED = 0.055; // progress units per second (full journey ~18s)
    const STALE_THRESHOLD = window.innerWidth < 768 ? 0.3 : 0.8;
  
    function init() {
      canvas = document.getElementById('portal-canvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('scroll', onScroll, { passive: true });
    // Touch: track swipe to drive progress on mobile
    let touchStartY = 0;
    window.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', e => {
      const dy = touchStartY - e.touches[0].clientY;
      if (Math.abs(dy) > 5) { scrollStale = 0; }
    }, { passive: true });
  
      // IntersectionObserver — activate auto when section enters viewport
      const cont = document.getElementById('portal-scroll-container');
      if (cont) {
        const obs = new IntersectionObserver(entries => {
          entries.forEach(e => {
            autoActive = e.isIntersecting;
            if (!autoActive) { autoProgress = 0; navigating = false; }
          });
        }, { threshold: 0.05 });
        obs.observe(cont);
      }
  
      requestAnimationFrame(loop);
    }
  
    function resize() {
      if (!canvas) return;
      const sticky = document.getElementById('portal-sticky');
      W = canvas.width  = sticky ? sticky.offsetWidth  : window.innerWidth;
      H = canvas.height = sticky ? sticky.offsetHeight : window.innerHeight;
    }
  
    function onScroll() {
      // Ignore scroll events we triggered ourselves
      if (window._wormholeSilentScroll) return;
  
      const cont = document.getElementById('portal-scroll-container');
      if (!cont) return;
      const total   = cont.offsetHeight - window.innerHeight;
      const scrolled = window.scrollY - cont.offsetTop;
      const fromScroll = Math.max(0, Math.min(1, scrolled / total));
  
      // If user is actively scrolling forward in the section — sync auto to scroll
      if (fromScroll > 0.01) {
        autoProgress = Math.max(autoProgress, fromScroll);
      }
  
      lastScrollY   = window.scrollY;
      scrollStale   = 0; // reset stale timer
  
      scrollProgress = Math.max(autoProgress, fromScroll);
      updateHUD();
  
      if (scrollProgress > 0.97 && !navigating) {
        navigating = true;
        setTimeout(() => {
          window.location.href = 'about.html';
        }, 480);
      }
    }
  
    function getPhase(p) {
      if (p < 0.12) return 0;
      if (p < 0.48) return 1;
      if (p < 0.74) return 2;
      return 3;
    }
  
    function updateHUD() {
      const el = document.getElementById('portal-label');
      if (!el) return;
      const p = scrollProgress;
      if      (p < 0.12) { el.textContent='SCROLL TO ENTER THE GRID ▼'; el.style.opacity='0.45'; }
      else if (p < 0.48) { el.textContent='ENTERING WORMHOLE...';        el.style.opacity='0.7';  }
      else if (p < 0.74) { el.textContent='DEEP SPACE TUNNEL';           el.style.opacity='0.75'; }
      else               { el.textContent = scrollProgress>0.93
          ? 'LOADING OPERATOR PROFILE...' : 'GRID://AXION/OS — ENGAGE';
        el.style.opacity='1'; }
    }
  
    /* ══════════════════════════════════════
       GLITCH ENGINE
       ══════════════════════════════════════ */
    function triggerGlitch(intensity = 1) {
      glitchTimer = Math.floor(8 + intensity * 12);
    }
  
    function applyGlitch(intensity) {
      if (glitchTimer <= 0) return;
      glitchTimer--;
  
      const strength = (glitchTimer / 20) * intensity;
      const imgData  = ctx.getImageData(0, 0, W, H);
      const data     = imgData.data;
  
      // Chromatic aberration — shift R channel left, B channel right
      const shift = Math.floor(strength * 18);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const iR = (y * W + Math.min(W-1, x + shift)) * 4;
          const iB = (y * W + Math.max(0,   x - shift)) * 4;
          data[i]   = data[iR];   // R from right
          data[i+2] = data[iB+2]; // B from left
        }
      }
  
      // Scanline tears — random horizontal slices shift sideways
      const tears = Math.floor(strength * 6);
      for (let t = 0; t < tears; t++) {
        const y      = Math.floor(Math.random() * H);
        const sliceH = Math.floor(2 + Math.random() * 8);
        const shiftX = Math.floor((Math.random() - 0.5) * 40 * strength);
        for (let dy = 0; dy < sliceH && y+dy < H; dy++) {
          const row = new Uint8ClampedArray(W * 4);
          for (let x = 0; x < W; x++) {
            const src = Math.max(0, Math.min(W-1, x - shiftX));
            const si  = ((y+dy)*W + src)*4;
            const di  = x*4;
            row[di]=data[si]; row[di+1]=data[si+1]; row[di+2]=data[si+2]; row[di+3]=data[si+3];
          }
          for (let x = 0; x < W; x++) {
            const i = ((y+dy)*W + x)*4;
            data[i]=row[x*4]; data[i+1]=row[x*4+1]; data[i+2]=row[x*4+2]; data[i+3]=row[x*4+3];
          }
        }
      }
  
      // Color invert flash on random rows
      if (Math.random() < strength * 0.4) {
        const y = Math.floor(Math.random() * H);
        for (let x = 0; x < W; x++) {
          const i = (y*W+x)*4;
          data[i]=255-data[i]; data[i+1]=255-data[i+1]; data[i+2]=255-data[i+2];
        }
      }
  
      ctx.putImageData(imgData, 0, 0);
  
      // Overlay color flash
      if (Math.random() < strength * 0.5) {
        const [r,g,b] = accent();
        ctx.fillStyle = `rgba(${r},${g},${b},${strength*0.15})`;
        ctx.fillRect(0, Math.floor(Math.random()*H), W, Math.floor(2+Math.random()*12));
      }
    }
  
    /* ══════════════════════════════════════
       MAIN LOOP
       ══════════════════════════════════════ */
    function loop(ts) {
      requestAnimationFrame(loop);
      const dt = Math.min((ts-lastTs)/1000, 0.05);
      lastTs = ts; gt += dt;
  
      // Auto-advance when section is active and user not scrolling
      if (autoActive && autoProgress < 1) {
        scrollStale += dt;
  
        if (scrollStale > STALE_THRESHOLD) {
          // Auto-play: advance progress smoothly
          autoProgress = Math.min(1, autoProgress + AUTO_SPEED * dt);
          scrollProgress = autoProgress;
          updateHUD();
  
          // Sync page scroll position to match autoProgress
          // so if user grabs scroll bar it starts from the right place
          const cont = document.getElementById('portal-scroll-container');
          if (cont) {
            const total    = cont.offsetHeight - window.innerHeight;
            const targetY  = cont.offsetTop + autoProgress * total;
            // Silently update without triggering our onScroll
            window._wormholeSilentScroll = true;
            window.scrollTo({ top: targetY, behavior: 'instant' });
            window._wormholeSilentScroll = false;
          }
  
          if (autoProgress > 0.97 && !navigating) {
            navigating = true;
            setTimeout(() => { window.location.href = 'about.html'; }, 480);
          }
        }
      }
  
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
  
      const p     = scrollProgress;
      const phase = getPhase(p);
  
      // Detect phase boundary
      if (phase !== lastPhase && lastPhase !== -1) {
        if (phase === 1) WA.playWormholeEntry();
        if (phase === 2) WA.playTunnel();
        if (phase === 3) {
          triggerGlitch(3.0);
          spawnExplosion();
          WA.playExplosion();
          setTimeout(() => WA.playTron(), 400);
        } else {
          triggerGlitch(1.5);
        }
      }
      lastPhase = phase;
  
      // Random micro-glitch
      if (Math.random() < 0.008 && p > 0.1) triggerGlitch(0.4);
  
      if      (phase === 0) drawIdle(p/0.12);
      else if (phase === 1) drawWormholeEntry((p-0.12)/0.36);
      else if (phase === 2) drawTunnel((p-0.48)/0.26);
      else                  drawLightCycles((p-0.74)/0.26);
  
      if (explosion) drawExplosion();
      if (shockwave) drawShockwave();
  
      if (glitchTimer > 0) applyGlitch(1.2);
    }
  
    function accent() {
      const m = document.documentElement.getAttribute('data-mode')||'green';
      return m==='amber'?[255,179,0]:m==='cyan'?[0,229,255]:[0,255,65];
    }
  
    /* ══════════════════════════════════════════════
       EXPLOSION SYSTEM
       Triggered at tunnel → tron transition
       ══════════════════════════════════════════════ */
    function spawnExplosion() {
      const [r,g,b] = accent();
      // Particles burst outward from center
      const particles = [];
      for (let i=0; i<120; i++) {
        const angle  = Math.random()*Math.PI*2;
        const speed  = 60 + Math.random()*400;
        const size   = 2 + Math.random()*6;
        const life   = 0.4 + Math.random()*0.8;
        const col    = Math.random()>0.3 ? [r,g,b] : [255,255,255];
        particles.push({ angle, speed, size, life, maxLife:life, col, dist:0 });
      }
      explosion = { t:0, maxT:1.2, particles };
      shockwave = { t:0, maxT:0.7 };
    }
  
    function drawExplosion() {
      const dt = 0.016;
      explosion.t += dt;
      if (explosion.t > explosion.maxT) { explosion = null; return; }
  
      const cx=W/2, cy=H/2;
      const progress = explosion.t / explosion.maxT;
  
      // White flash at start
      if (explosion.t < 0.12) {
        const flashA = (1 - explosion.t/0.12);
        ctx.fillStyle = `rgba(255,255,255,${flashA * 0.92})`;
        ctx.fillRect(0,0,W,H);
      }
  
      // Accent color bloom
      if (explosion.t < 0.3) {
        const bloomA = (1 - explosion.t/0.3) * 0.7;
        const [r,g,b] = accent();
        ctx.fillStyle = `rgba(${r},${g},${b},${bloomA})`;
        ctx.fillRect(0,0,W,H);
      }
  
      // Particles
      explosion.particles.forEach(p => {
        p.life -= dt;
        p.dist += p.speed * dt;
        if (p.life <= 0) return;
  
        const a     = p.life / p.maxLife;
        const x     = cx + Math.cos(p.angle) * p.dist;
        const y     = cy + Math.sin(p.angle) * p.dist * 0.55;
        const size  = p.size * a;
        const [r,g,b] = p.col;
  
        // Glow
        const grd = ctx.createRadialGradient(x,y,0,x,y,size*4);
        grd.addColorStop(0,`rgba(${r},${g},${b},${a*0.8})`);
        grd.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(x,y,size*4,0,Math.PI*2);
        ctx.fillStyle=grd; ctx.fill();
  
        // Core
        ctx.beginPath(); ctx.arc(x,y,size,0,Math.PI*2);
        ctx.fillStyle=`rgba(${r},${g},${b},${a})`;
        ctx.fill();
      });
  
      // Central fireball fading
      if (explosion.t < 0.5) {
        const fA = (1 - explosion.t/0.5);
        const fR = 20 + explosion.t*180;
        const [r,g,b] = accent();
        const fg = ctx.createRadialGradient(cx,cy,0,cx,cy,fR);
        fg.addColorStop(0,`rgba(255,255,255,${fA*0.9})`);
        fg.addColorStop(0.3,`rgba(${r},${g},${b},${fA*0.7})`);
        fg.addColorStop(0.7,`rgba(${r},${g},${b},${fA*0.2})`);
        fg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(cx,cy,fR,0,Math.PI*2);
        ctx.fillStyle=fg; ctx.fill();
      }
    }
  
    function drawShockwave() {
      const dt = 0.016;
      shockwave.t += dt;
      if (shockwave.t > shockwave.maxT) { shockwave = null; return; }
  
      const cx=W/2, cy=H/2;
      const progress = shockwave.t / shockwave.maxT;
      const radius   = progress * Math.max(W,H) * 1.1;
      const thickness = (1 - progress) * 18;
      const alpha     = (1 - progress) * 0.85;
      const [r,g,b]   = accent();
  
      // Outer ring
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius, radius*0.55, 0, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.6})`;
      ctx.lineWidth   = thickness;
      ctx.stroke();
  
      // Accent ring slightly behind
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius*0.92, radius*0.92*0.55, 0, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.5})`;
      ctx.lineWidth   = thickness * 0.6;
      ctx.stroke();
  
      // Inner glow at ring edge
      const grd = ctx.createRadialGradient(cx,cy,radius*0.7,cx,cy,radius*1.1);
      grd.addColorStop(0,'rgba(0,0,0,0)');
      grd.addColorStop(0.5,`rgba(${r},${g},${b},${alpha*0.15})`);
      grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx,cy,radius*1.1,0,Math.PI*2);
      ctx.fillStyle=grd; ctx.fill();
    }
  
    /* ══════════════════════
       IDLE
       ══════════════════════ */
    function drawIdle(t) {
      const [r,g,b] = accent();
      const cx=W/2, cy=H/2;
      const pulse = 0.5+0.5*Math.sin(gt*1.4);
      const rad   = Math.min(W,H)*0.12*pulse*(1+t*0.4);
      const alpha = t*0.3*pulse;
      const grd = ctx.createRadialGradient(cx,cy,rad*0.3,cx,cy,rad*2.5);
      grd.addColorStop(0,BG);
      grd.addColorStop(0.65,`rgba(${r},${g},${b},${alpha*0.18})`);
      grd.addColorStop(0.88,`rgba(${r},${g},${b},${alpha})`);
      grd.addColorStop(1,BG);
      ctx.beginPath(); ctx.arc(cx,cy,rad*2.5,0,Math.PI*2);
      ctx.fillStyle=grd; ctx.fill();
    }
  
    /* ══════════════════════
       WORMHOLE ENTRY
       ══════════════════════ */
    function drawWormholeEntry(t) {
      const [r,g,b] = accent();
      const cx=W/2, cy=H/2;
      const maxR = Math.hypot(cx,cy);
  
      const vig = ctx.createRadialGradient(cx,cy,0,cx,cy,maxR*1.1);
      vig.addColorStop(0,`rgba(0,0,0,${t*0.94})`);
      vig.addColorStop(0.55,`rgba(0,0,0,${t*0.5})`);
      vig.addColorStop(1,BG);
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
  
      const rings = 8+Math.floor(t*12);
      for (let i=1;i<=rings;i++) {
        const frac = i/rings;
        const rad  = maxR*frac*(1-t*0.62);
        const tw   = t*Math.PI*7*(1-frac)+gt*(0.7+i*0.17);
        const al   = (1-frac)*0.45+t*0.22;
        ctx.beginPath();
        for (let s=0;s<=100;s++) {
          const a=(s/100)*Math.PI*2+tw;
          const w=Math.sin(s/100*Math.PI*5+gt*1.6)*rad*0.03;
          const x=cx+(rad+w)*Math.cos(a);
          const y=cy+(rad+w)*Math.sin(a)*0.56;
          s===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.closePath();
        ctx.strokeStyle=`rgba(${r},${g},${b},${al})`;
        ctx.lineWidth=0.5+frac*1.4; ctx.stroke();
      }
  
      // Stars
      const stars=Math.floor(15+t*100);
      for (let i=0;i<stars;i++) {
        const a=(i/stars)*Math.PI*2+i*0.63;
        const d=maxR*(0.1+(1-t*0.82)*0.87)*(0.12+(i%9)/9*0.88);
        const len=d*0.09*(0.15+t*0.85);
        ctx.beginPath();
        ctx.moveTo(cx+d*Math.cos(a),cy+d*Math.sin(a)*0.58);
        ctx.lineTo(cx+(d-len)*Math.cos(a),cy+(d-len)*Math.sin(a)*0.58);
        ctx.strokeStyle=`rgba(${r},${g},${b},${0.12+(i%5)*0.09})`;
        ctx.lineWidth=0.3+(i%4)*0.22; ctx.stroke();
      }
  
      // Singularity
      const sr=3+t*Math.min(W,H)*0.06;
      const sg=ctx.createRadialGradient(cx,cy,0,cx,cy,sr*5);
      sg.addColorStop(0,`rgba(${r},${g},${b},${t*0.9})`);
      sg.addColorStop(0.4,`rgba(${r},${g},${b},${t*0.2})`);
      sg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx,cy,sr*5,0,Math.PI*2);
      ctx.fillStyle=sg; ctx.fill();
      ctx.beginPath(); ctx.arc(cx,cy,sr,0,Math.PI*2);
      ctx.fillStyle='#000'; ctx.fill();
    }
  
    /* ══════════════════════
       DEEP TUNNEL
       ══════════════════════ */
    function drawTunnel(t) {
      const [r,g,b] = accent();
      const cx=W/2, cy=H/2;
      const speed=1.4+t*3.8;
      ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
  
      const layers=32;
      for (let l=0;l<layers;l++) {
        const zr=(l/layers+gt*speed*0.11)%1;
        const z=Math.pow(zr,0.55);
        const rad=W*0.03+W*0.62*z;
        const al=z*0.65*(1-z*0.45);
        ctx.beginPath();
        ctx.ellipse(cx,cy,rad,rad*0.52,0,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${r},${g},${b},${al})`;
        ctx.lineWidth=0.4+z*1.7; ctx.stroke();
      }
  
      for (let i=0;i<48;i++) {
        const a=(i/48)*Math.PI*2;
        const ph=(i*0.38+gt*speed*0.16)%1;
        const near=Math.pow(ph,0.5)*W*0.68;
        const far=Math.max(0,near-W*0.16);
        if (near<14) continue;
        ctx.beginPath();
        ctx.moveTo(cx+far*Math.cos(a),cy+far*Math.sin(a)*0.52);
        ctx.lineTo(cx+near*Math.cos(a),cy+near*Math.sin(a)*0.52);
        ctx.strokeStyle=`rgba(${r},${g},${b},${ph*0.3})`;
        ctx.lineWidth=0.4+ph*1.4; ctx.stroke();
      }
  
      for (let i=0;i<55;i++) {
        const ph=(i*0.21+gt*speed*0.19)%1;
        const z2=Math.pow(ph,0.42);
        const a=(i/55)*Math.PI*2+i*1.1;
        const d=W*0.04+W*0.52*z2;
        ctx.beginPath();
        ctx.arc(cx+d*Math.cos(a),cy+d*Math.sin(a)*0.52,0.5+z2*2.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(${r},${g},${b},${z2*0.55})`; ctx.fill();
      }
  
      const cr=14+t*H*0.15;
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,cr);
      cg.addColorStop(0,`rgba(255,255,255,${0.55+t*0.35})`);
      cg.addColorStop(0.3,`rgba(${r},${g},${b},${0.35+t*0.25})`);
      cg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx,cy,cr,0,Math.PI*2);
      ctx.fillStyle=cg; ctx.fill();
    }
  
    /* ══════════════════════════════════════
       TRON LIGHT CYCLES
       ══════════════════════════════════════ */
    const BIKES = Array.from({length:12},(_,i)=>({
      lane:  (i%6-2.5)*0.19,
      phase: i/12,
      color: i%3===0?'white':'accent',
    }));
  
    function drawLightCycles(t) {
      const [r,g,b] = accent();
      const cx=W/2;
      const speed=2.0+t*5;
      const horizon=H*0.43;
  
      ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
  
      // Floor grid
      for (let z=0;z<34;z++) {
        const zOff=(z/34+gt*speed*0.06)%1;
        const depth=Math.pow(zOff,1.65);
        const y=horizon+(H-horizon)*depth;
        const xSpan=W*0.52*(0.02+depth*0.98);
        ctx.beginPath();
        ctx.moveTo(cx-xSpan,y); ctx.lineTo(cx+xSpan,y);
        ctx.strokeStyle=`rgba(${r},${g},${b},${depth*0.55*(1-depth*0.2)})`;
        ctx.lineWidth=0.35+depth*1.6; ctx.stroke();
      }
      for (let v=-40;v<=40;v++) {
        const nx=v/40, xF=cx+nx*W*0.54, xH=cx+nx*W*0.012;
        ctx.beginPath(); ctx.moveTo(xH,horizon); ctx.lineTo(xF,H);
        ctx.strokeStyle=`rgba(${r},${g},${b},${(1-Math.abs(nx)*0.5)*0.38})`;
        ctx.lineWidth=0.35; ctx.stroke();
      }
  
      // Ceiling
      for (let z=0;z<20;z++) {
        const d=Math.pow((z/20+gt*speed*0.06)%1,1.65);
        const y=horizon-horizon*d*0.72;
        const xs=W*0.32*(0.02+d*0.98);
        ctx.beginPath();
        ctx.moveTo(cx-xs,y); ctx.lineTo(cx+xs,y);
        ctx.strokeStyle=`rgba(${r},${g},${b},${d*0.18})`;
        ctx.lineWidth=0.3+d; ctx.stroke();
      }
      for (let v=-20;v<=20;v++) {
        const nx=v/20;
        ctx.beginPath();
        ctx.moveTo(cx+nx*W*0.01,horizon); ctx.lineTo(cx+nx*W*0.34,0);
        ctx.strokeStyle=`rgba(${r},${g},${b},${(1-Math.abs(nx)*0.6)*0.12})`;
        ctx.lineWidth=0.3; ctx.stroke();
      }
  
      // City
      for (let b2=0;b2<24;b2++) {
        const bx=(b2/24)*W;
        const bh=8+Math.sin(b2*2.3)*16+Math.cos(b2*1.5)*10;
        const bw=W/24*0.7;
        ctx.fillStyle='#000'; ctx.fillRect(bx,horizon-bh,bw,bh);
        ctx.strokeStyle=`rgba(${r},${g},${b},0.16)`; ctx.lineWidth=0.4;
        ctx.strokeRect(bx,horizon-bh,bw,bh);
        for (let wy=horizon-bh+3;wy<horizon-2;wy+=5)
          for (let wx=bx+2;wx<bx+bw-2;wx+=4)
            if (Math.sin(wx*wy*0.008+b2)>0.28) {
              ctx.fillStyle=`rgba(${r},${g},${b},${Math.sin(gt*2+wx*0.2)>0.6?0.12:0.25})`;
              ctx.fillRect(wx,wy,2,3);
            }
      }
  
      // Bikes
      BIKES.forEach(bike => {
        const ph=(bike.phase+gt*speed*0.085)%1;
        const z=Math.pow(ph,0.5);
        if (z<0.04) return;
        const sx=cx+bike.lane*W*(0.06+z*0.88);
        const sy=horizon+(H-horizon)*z*0.88;
        const s=W*0.013*(0.1+z*1.2);
        const al=Math.min(1,z*1.8)*Math.max(0,1-Math.pow(z,5)*8);
        if (al<0.02) return;
        const col=bike.color==='white'?`rgba(255,255,255,${al})`:`rgba(${r},${g},${b},${al})`;
  
        ctx.save(); ctx.translate(sx,sy);
        drawBike(ctx,s,col,r,g,b,al);
  
        // Trail
        if (z>0.1) {
          const tl=W*0.2*z;
          const grad=ctx.createLinearGradient(0,0,-bike.lane*tl*0.12,-tl*0.56);
          grad.addColorStop(0,bike.color==='white'?`rgba(255,255,255,${al*0.8})`:`rgba(${r},${g},${b},${al*0.8})`);
          grad.addColorStop(1,'rgba(0,0,0,0)');
          ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-bike.lane*tl*0.12,-tl*0.56);
          ctx.strokeStyle=grad; ctx.lineWidth=1.5+z*2; ctx.stroke();
        }
        ctx.restore();
      });
  
      // Player trail
      for (let i=0;i<16;i++) {
        const prog=i/16;
        const tz=Math.pow((gt*speed*0.085+prog*0.22)%1,1.45);
        const ty=horizon+(H-horizon)*tz;
        const tw=1.5+tz*6;
        ctx.beginPath(); ctx.moveTo(cx-tw,ty); ctx.lineTo(cx+tw,ty);
        ctx.strokeStyle=`rgba(255,255,255,${(1-prog)*0.6})`;
        ctx.lineWidth=0.8+tz*1.8; ctx.stroke();
      }
  
      // HUD
      // HUD — smaller on mobile
    const hudSize = Math.floor(Math.min(W*0.0095, 9));
    if (hudSize < 5 || W < 420) {
      // Skip HUD text on very small screens, just do scanlines + flash
    } else {
      ctx.font=`${hudSize}px 'Press Start 2P',monospace`;
      ctx.fillStyle=`rgba(${r},${g},${b},0.52)`;
      ctx.textAlign='left';
      ctx.fillText(`SECTOR ${Math.floor(t*99).toString().padStart(2,'0')}`,W*0.03,H*0.09);
      ctx.fillText(`SPD ${(speed*12).toFixed(0)}%`,W*0.03,H*0.14);
      if (W > 500) {
        ctx.textAlign='right';
        ctx.fillText('USER: M.SHEVCHENKO',W*0.97,H*0.09);
        ctx.fillText('GRID://AXION/OS',W*0.97,H*0.14);
      }
      ctx.textAlign='center';
    }
  
      // Scanlines
      for (let y=0;y<H;y+=4) { ctx.fillStyle='rgba(0,0,0,0.055)'; ctx.fillRect(0,y,W,1); }
  
      // End flash
      if (t>0.82) {
        const f=(t-0.82)/0.18;
        ctx.fillStyle=`rgba(${r},${g},${b},${f*0.6})`; ctx.fillRect(0,0,W,H);
        if (f>0.6) { ctx.fillStyle=`rgba(255,255,255,${(f-0.6)/0.4})`; ctx.fillRect(0,0,W,H); }
      }
    }
  
    function drawBike(ctx,s,col,r,g,b,al) {
      ctx.strokeStyle=col; ctx.lineWidth=Math.max(0.8,s*0.08);
      ctx.beginPath();
      ctx.moveTo(-s*1.8,0); ctx.lineTo(-s*1.2,-s*0.55);
      ctx.lineTo(-s*0.2,-s*0.65); ctx.lineTo(s*0.6,-s*0.45);
      ctx.lineTo(s*0.9,0); ctx.lineTo(-s*1.8,0); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s*0.2,-s*0.65); ctx.lineTo(s*0.0,-s*0.9);
      ctx.lineTo(s*0.35,-s*0.55); ctx.stroke();
      ctx.lineWidth=Math.max(0.6,s*0.06);
      [[s*0.55,s*0.32],[-s*1.2,s*0.32]].forEach(([wx,wr])=>{
        ctx.beginPath(); ctx.arc(wx,0,wr,0,Math.PI*2); ctx.stroke();
        const wg=ctx.createRadialGradient(wx,0,0,wx,0,wr*2);
        wg.addColorStop(0,`rgba(${r},${g},${b},${al*0.4})`);
        wg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(wx,0,wr*2,0,Math.PI*2);
        ctx.fillStyle=wg; ctx.fill();
      });
      const eg=ctx.createRadialGradient(-s*0.4,-s*0.1,0,-s*0.4,-s*0.1,s*1.1);
      eg.addColorStop(0,`rgba(${r},${g},${b},${al*0.3})`);
      eg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.ellipse(-s*0.4,-s*0.1,s*1.1,s*0.35,0,0,Math.PI*2);
      ctx.fillStyle=eg; ctx.fill();
    }
  
    return { init };
  })();
  
  if (document.readyState==='loading') {
    document.addEventListener('DOMContentLoaded',()=>Wormhole.init());
  } else { Wormhole.init(); }