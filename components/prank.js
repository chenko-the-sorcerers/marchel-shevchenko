/* ═══════════════════════════════════════════════════════════════
   prank.js — Three pranks for Marchel's portfolio
   
   1. VIRUS SCAN     — triggers after 45s idle on any page
   2. FAKE HACK      — triggered by Konami code or after 90s
   3. FAKE CRASH     — triggered randomly after 2 min, or secret click
   
   All pranks have an escape: press ESC or click ✕ to dismiss.
   They're clearly labeled "APRIL FOOLS" at the end so user knows.
═══════════════════════════════════════════════════════════════ */

const Prank = (() => {

    let triggered = { scan: false, hack: false, crash: false };
    let idleTimer  = 0;
    let lastActive = Date.now();
    let konamiSeq  = [];
    const KONAMI   = [38,38,40,40,37,39,37,39,66,65]; // ↑↑↓↓←→←→BA
  
    /* ── AUDIO helpers ── */
    let ac = null;
    function getAC() {
      if (!ac) try { ac = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){}
      return ac;
    }
    function beep(freq, type, dur, vol=0.3) {
      const a = getAC(); if (!a) return;
      const o=a.createOscillator(), g=a.createGain();
      o.type=type; o.frequency.value=freq;
      g.gain.setValueAtTime(vol,a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
      o.connect(g); g.connect(a.destination);
      o.start(); o.stop(a.currentTime+dur+0.05);
    }
    function noiseBlast(dur=0.3, vol=0.4) {
      const a=getAC(); if (!a) return;
      const buf=a.createBuffer(1,a.sampleRate*dur,a.sampleRate);
      const d=buf.getChannelData(0);
      for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
      const src=a.createBufferSource(); src.buffer=buf;
      const g=a.createGain();
      g.gain.setValueAtTime(vol,a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
      src.connect(g); g.connect(a.destination);
      src.start();
    }
    function crashSound() {
      const a=getAC(); if (!a) return;
      const n=a.currentTime;
      // Low thud
      const o=a.createOscillator(), g=a.createGain();
      o.type='sawtooth'; o.frequency.setValueAtTime(200,n);
      o.frequency.exponentialRampToValueAtTime(20,n+0.4);
      g.gain.setValueAtTime(0.5,n); g.gain.exponentialRampToValueAtTime(0.001,n+0.5);
      o.connect(g); g.connect(a.destination); o.start(n); o.stop(n+0.6);
      // Static noise
      noiseBlast(0.2, 0.6);
    }
  
    /* ════════════════════════════════════════════════════
       PRANK 1 — FAKE VIRUS SCAN
       Terminal overlay scans system, finds spicy files
       ════════════════════════════════════════════════════ */
    function runVirusScan() {
      if (triggered.scan) return;
      triggered.scan = true;
  
      const overlay = document.createElement('div');
      overlay.id = 'prank-scan';
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:99999;
        background:rgba(0,0,0,0.92);
        display:flex;align-items:center;justify-content:center;
        font-family:'Share Tech Mono',monospace;
      `;
  
      const box = document.createElement('div');
      box.style.cssText = `
        background:#020905;border:1px solid #00ff41;
        width:min(720px,92vw);max-height:80vh;overflow:hidden;
        box-shadow:0 0 40px rgba(0,255,65,0.3);
        padding:1.2rem;position:relative;
      `;
  
      box.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;border-bottom:1px solid #0a2e12;padding-bottom:0.6rem;">
          <span style="color:#00ff41;font-size:0.8rem;letter-spacing:0.1em">⚠ AXION SECURITY SCANNER v2.7.1</span>
          <button id="prank-scan-close" style="background:none;border:1px solid #ff4040;color:#ff4040;padding:0.1rem 0.5rem;cursor:pointer;font-family:inherit;font-size:0.75rem;">✕ CLOSE</button>
        </div>
        <div id="scan-log" style="font-size:0.72rem;line-height:1.9;color:#00b330;height:320px;overflow-y:auto;"></div>
        <div style="margin-top:0.8rem;border-top:1px solid #0a2e12;padding-top:0.6rem;">
          <div style="height:8px;background:#0a1a0a;border:1px solid #0a3a15;margin-bottom:0.4rem;">
            <div id="scan-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#003a10,#00ff41);transition:width 0.3s;box-shadow:0 0 6px #00ff41;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:#005a1a;">
            <span id="scan-pct">0%</span>
            <span id="scan-status">Initializing scanner...</span>
          </div>
        </div>
      `;
      overlay.appendChild(box);
      document.body.appendChild(overlay);
  
      document.getElementById('prank-scan-close').addEventListener('click', () => {
        overlay.remove();
      });
  
      const log     = document.getElementById('scan-log');
      const bar     = document.getElementById('scan-bar');
      const pct     = document.getElementById('scan-pct');
      const status  = document.getElementById('scan-status');
  
      const LINES = [
        { t:200,  col:'#00ff41', txt:'[INIT] Starting AXION threat detection engine...' },
        { t:600,  col:'#00ff41', txt:'[SCAN] Scanning system memory...' },
        { t:900,  col:'#00b330', txt:'[INFO] User agent detected: ' + navigator.userAgent.slice(0,55)+'...' },
        { t:1300, col:'#00ff41', txt:'[SCAN] Analyzing browser cookies...' },
        { t:1700, col:'#ffb300', txt:'[WARN] 847 tracking cookies found from suspicious sources' },
        { t:2100, col:'#00ff41', txt:'[SCAN] Checking search history...' },
        { t:2500, col:'#ff4040', txt:'[FIND] ⚠ Suspicious search: "how to pretend to be productive"' },
        { t:2900, col:'#ff4040', txt:'[FIND] ⚠ Suspicious search: "why is my code not working 3am"' },
        { t:3300, col:'#ff4040', txt:'[FIND] ⚠ Suspicious search: "is redbull a food group"' },
        { t:3700, col:'#00ff41', txt:'[SCAN] Scanning Downloads folder...' },
        { t:4100, col:'#ff4040', txt:'[FIND] ⚠ /Downloads/tutorial_i_never_finished.zip (14.2 GB)' },
        { t:4500, col:'#ff4040', txt:'[FIND] ⚠ /Downloads/definitely_not_a_virus.exe' },
        { t:4800, col:'#ff4040', txt:'[FIND] ⚠ /Downloads/my_passwords_FINAL_v3_REAL.txt' },
        { t:5200, col:'#00ff41', txt:'[SCAN] Checking clipboard contents...' },
        { t:5600, col:'#ff4040', txt:'[FIND] ⚠ Clipboard: "stackoverflow.com/questions/927358"' },
        { t:6000, col:'#00ff41', txt:'[SCAN] Analyzing webcam activity...' },
        { t:6400, col:'#ffb300', txt:'[WARN] Webcam accessed 2,847 times by "definitely_not_nsa.js"' },
        { t:6800, col:'#00ff41', txt:'[SCAN] Checking network packets...' },
        { t:7200, col:'#ff4040', txt:'[FIND] ⚠ Outbound data to: pizza-delivery-tracker.io' },
        { t:7600, col:'#ff4040', txt:'[FIND] ⚠ Outbound data to: youtube.com/watch?v=dQw4w9WgXcQ' },
        { t:8000, col:'#00ff41', txt:'[SCAN] Deep scanning RAM...' },
        { t:8400, col:'#ff4040', txt:'[CRIT] ██ CRITICAL: 12 instances of "impostor syndrome" detected in memory' },
        { t:8800, col:'#ff4040', txt:'[CRIT] ██ CRITICAL: Cortisol levels dangerously high' },
        { t:9300, col:'#ff4040', txt:'[CRIT] ██ CRITICAL: Last git commit message: "fix (please work this time)"' },
        { t:9800, col:'#00b330', txt:'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
        { t:10200,col:'#ffb300', txt:'[DONE] SCAN COMPLETE — 1,337 threats found (none real, lol)' },
        { t:10600,col:'#00ff41', txt:'                                                    ' },
        { t:11000,col:'#00ff41', txt:'   🎉 APRIL FOOLS — from Marchel. You got pranked! 🎉' },
        { t:11400,col:'#00b330', txt:'      (your browser is safe, probably... maybe... idk)' },
      ];
  
      LINES.forEach(({ t, col, txt }) => {
        setTimeout(() => {
          const line = document.createElement('div');
          line.style.color = col;
          line.textContent = txt;
          log.appendChild(line);
          log.scrollTop = log.scrollHeight;
          beep(col==='#ff4040'?440:col==='#ffb300'?660:880, 'square', 0.04, 0.06);
  
          const progress = Math.min(100, Math.round((t/11400)*100));
          bar.style.width = progress+'%';
          pct.textContent = progress+'%';
          status.textContent = progress < 100 ? 'Scanning...' : 'Done!';
        }, t);
      });
    }
  
    /* ════════════════════════════════════════════════════
       PRANK 2 — FAKE HACK
       Screen starts typing itself, matrix rain, "ACCESS GRANTED"
       ════════════════════════════════════════════════════ */
    function runFakeHack() {
      if (triggered.hack) return;
      triggered.hack = true;
  
      const overlay = document.createElement('div');
      overlay.id = 'prank-hack';
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:99998;
        background:#000;
        font-family:'Share Tech Mono',monospace;
        overflow:hidden;cursor:none;
      `;
  
      // Matrix rain canvas
      const rain = document.createElement('canvas');
      rain.style.cssText = 'position:absolute;inset:0;opacity:0.35;';
      overlay.appendChild(rain);
  
      // Terminal output
      const term = document.createElement('div');
      term.style.cssText = `
        position:absolute;inset:0;
        display:flex;flex-direction:column;justify-content:center;align-items:center;
        z-index:2;padding:2rem;
      `;
      overlay.appendChild(term);
  
      const output = document.createElement('div');
      output.style.cssText = `
        width:min(700px,90vw);
        font-size:clamp(0.65rem,1.2vw,0.82rem);
        line-height:1.8;color:#00ff41;
      `;
      term.appendChild(output);
  
      document.body.appendChild(overlay);
  
      // Matrix rain
      const rctx = rain.getContext('2d');
      rain.width  = window.innerWidth;
      rain.height = window.innerHeight;
      const cols   = Math.floor(rain.width/16);
      const drops  = Array(cols).fill(1);
      const chars  = 'アイウエオカキクケコNUSANTARAMARCHEL01アBCDEF'.split('');
      let rainRaf;
      function drawRain() {
        rainRaf = requestAnimationFrame(drawRain);
        rctx.fillStyle='rgba(0,0,0,0.06)';
        rctx.fillRect(0,0,rain.width,rain.height);
        rctx.fillStyle='#00ff41';
        rctx.font='14px monospace';
        drops.forEach((y,i) => {
          rctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*16, y*16);
          if (y*16>rain.height && Math.random()>0.975) drops[i]=0;
          drops[i]++;
        });
      }
      drawRain();
  
      const HACK_LINES = [
        { t:0,    col:'#00ff41', txt:'root@unknown:~# ./infiltrate.sh --target=marchel-portfolio' },
        { t:600,  col:'#00b330', txt:'Initializing connection matrix...' },
        { t:1000, col:'#00b330', txt:'Bypassing firewall layer 1... ████████ done' },
        { t:1500, col:'#00b330', txt:'Bypassing firewall layer 2... ████████ done' },
        { t:2000, col:'#ffb300', txt:'[!] Anomaly detected — attempting reroute...' },
        { t:2500, col:'#00b330', txt:'Spoofing IP: 192.168.'+Math.floor(Math.random()*255)+'.'+Math.floor(Math.random()*255) },
        { t:2900, col:'#00b330', txt:'Cracking password hash... ████████████████████ 100%' },
        { t:3400, col:'#00ff41', txt:'Accessing user data...' },
        { t:3800, col:'#ff4040', txt:'[FOUND] Secret file: marchel_embarrassing_photos.zip' },
        { t:4200, col:'#ff4040', txt:'[FOUND] Browser history: last 847 searches saved...' },
        { t:4600, col:'#ff4040', txt:'[FOUND] Webcam stream: activated (you look confused rn)' },
        { t:5000, col:'#ff4040', txt:'[FOUND] Microphone: activated (we can hear you breathing)' },
        { t:5500, col:'#00b330', txt:'Uploading to darknet server...' },
        { t:5900, col:'#00b330', txt:'████████████████████████████████ 100%' },
        { t:6400, col:'#00ff41', txt:'' },
        { t:6500, col:'#00ff41', txt:'╔══════════════════════════════════════════╗' },
        { t:6600, col:'#00ff41', txt:'║                                          ║' },
        { t:6700, col:'#00ff41', txt:'║        ✓ ACCESS GRANTED                  ║' },
        { t:6800, col:'#00ff41', txt:'║        WELCOME TO THE GRID               ║' },
        { t:6900, col:'#00ff41', txt:'║                                          ║' },
        { t:7000, col:'#00ff41', txt:'╚══════════════════════════════════════════╝' },
        { t:7500, col:'#ffb300', txt:'' },
        { t:7600, col:'#ffb300', txt:'   just kidding lol. april fools! 😂' },
        { t:7900, col:'#00b330', txt:'   — Marchel Shevchenko, AI Architect & Prankster' },
        { t:8200, col:'#005a1a', txt:'' },
        { t:8300, col:'#005a1a', txt:'   (press ESC or wait 5 seconds to continue)' },
      ];
  
      HACK_LINES.forEach(({ t, col, txt }) => {
        setTimeout(() => {
          const line = document.createElement('div');
          line.style.color = col;
          line.textContent = txt;
          output.appendChild(line);
          output.scrollTop = output.scrollHeight;
          if (txt) beep(col==='#ff4040'?330:col==='#ffb300'?550:770,'square',0.025,0.05);
        }, t);
      });
  
      // Auto-dismiss after 13s
      const autoDismiss = setTimeout(() => {
        cancelAnimationFrame(rainRaf);
        overlay.remove();
      }, 13000);
  
      document.addEventListener('keydown', function esc(e) {
        if (e.key==='Escape') {
          clearTimeout(autoDismiss);
          cancelAnimationFrame(rainRaf);
          overlay.remove();
          document.removeEventListener('keydown', esc);
        }
      });
    }
  
    /* ════════════════════════════════════════════════════
       PRANK 3 — FAKE CRASH
       Page freezes, Windows-style error popup appears
       ════════════════════════════════════════════════════ */
    function runFakeCrash() {
      if (triggered.crash) return;
      triggered.crash = true;
  
      // Step 1: page "freezes" for 1.5s (just an overlay)
      const freeze = document.createElement('div');
      freeze.style.cssText = 'position:fixed;inset:0;z-index:99997;cursor:wait;';
      document.body.appendChild(freeze);
      document.body.style.pointerEvents = 'none';
  
      crashSound();
  
      setTimeout(() => {
        freeze.remove();
        document.body.style.pointerEvents = '';
        showCrashDialog();
      }, 1500);
    }
  
    function showCrashDialog() {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:99997;
        background:rgba(0,0,0,0.6);
        display:flex;align-items:center;justify-content:center;
      `;
  
      // Windows XP style error dialog
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        background:#ECE9D8;
        border:2px solid #0055EA;
        width:min(480px,90vw);
        font-family:'Segoe UI',Tahoma,sans-serif;
        font-size:13px;
        box-shadow:4px 4px 12px rgba(0,0,0,0.5);
      `;
  
      dialog.innerHTML = `
        <!-- Title bar -->
        <div style="background:linear-gradient(to bottom,#245EDC,#0831A0);padding:4px 6px;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:6px;">
            <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect width='7' height='7' fill='%23f00'/><rect x='9' width='7' height='7' fill='%230f0'/><rect y='9' width='7' height='7' fill='%2300f'/><rect x='9' y='9' width='7' height='7' fill='%23ff0'/></svg>" width="16" height="16">
            <span style="color:white;font-weight:bold;font-size:12px;">AxionOS — Critical Error</span>
          </div>
          <div style="display:flex;gap:2px;">
            <button id="prank-min"  style="width:21px;height:21px;background:linear-gradient(to bottom,#e8e8e8,#d0d0d0);border:1px solid #666;cursor:pointer;font-size:11px;font-weight:bold;">_</button>
            <button id="prank-max"  style="width:21px;height:21px;background:linear-gradient(to bottom,#e8e8e8,#d0d0d0);border:1px solid #666;cursor:pointer;font-size:11px;">□</button>
            <button id="prank-x"    style="width:21px;height:21px;background:linear-gradient(to bottom,#e05050,#b02020);border:1px solid #800;color:white;cursor:pointer;font-size:12px;font-weight:bold;">✕</button>
          </div>
        </div>
  
        <!-- Content -->
        <div style="padding:16px;display:flex;gap:14px;align-items:flex-start;">
          <div style="font-size:36px;line-height:1;">⛔</div>
          <div>
            <div style="font-weight:bold;margin-bottom:8px;color:#CC0000;">AXION.EXE has encountered a critical error</div>
            <div style="color:#333;line-height:1.6;margin-bottom:12px;">
              A fatal exception <strong>0x0000MARCH3L</strong> has occurred at address <strong>0x42069420</strong>.<br><br>
              Possible causes:<br>
              &bull; User is too impressive for this browser<br>
              &bull; AI overload: too many neural networks detected<br>
              &bull; System cannot handle this level of sigma<br>
              &bull; <span style="color:#0000CC;text-decoration:underline;cursor:pointer">coffee.dll</span> not found
            </div>
            <div style="background:#FFF8DC;border:1px solid #CCC;padding:8px;font-size:11px;color:#666;margin-bottom:12px;">
              Error code: BRAIN_TOO_BIG_FOR_COMPUTER<br>
              Module: marchel_shevchenko.exe v∞.0<br>
              Timestamp: ${new Date().toLocaleString()}
            </div>
            <div style="display:flex;gap:8px;justify-content:center;">
              <button id="prank-debug" style="padding:4px 20px;background:linear-gradient(to bottom,#f0f0f0,#d8d8d8);border:1px solid #888;cursor:pointer;">Debug</button>
              <button id="prank-send"  style="padding:4px 20px;background:linear-gradient(to bottom,#f0f0f0,#d8d8d8);border:1px solid #888;cursor:pointer;">Send Report</button>
              <button id="prank-ok"    style="padding:4px 20px;background:linear-gradient(to bottom,#f0f0f0,#d8d8d8);border:1px solid #888;cursor:pointer;font-weight:bold;">OK</button>
            </div>
          </div>
        </div>
  
        <!-- Status bar -->
        <div style="background:#ECE9D8;border-top:1px solid #bbb;padding:3px 8px;font-size:11px;color:#666;text-align:right;">
          🎉 gotcha! — this was a prank by Marchel
        </div>
      `;
  
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
  
      // Buttons
      document.getElementById('prank-x').addEventListener('click', () => overlay.remove());
      document.getElementById('prank-ok').addEventListener('click', () => overlay.remove());
      document.getElementById('prank-debug').addEventListener('click', () => {
        beep(220,'sawtooth',0.3,0.2);
        alert('DEBUG LOG:\n\nStack trace: everything is fine\nMemory: mostly memes\nCPU: thinking about lunch\n\n(seriously though, this is a prank 😄)');
      });
      document.getElementById('prank-send').addEventListener('click', () => {
        beep(880,'sine',0.2,0.15);
        const btn = document.getElementById('prank-send');
        btn.textContent = 'Sent! (to /dev/null)';
        btn.disabled = true;
      });
      // Fake min/max do nothing funny
      document.getElementById('prank-min').addEventListener('click', () => beep(440,'square',0.05,0.1));
      document.getElementById('prank-max').addEventListener('click', () => {
        dialog.style.width='100vw'; dialog.style.maxWidth='100vw';
      });
    }
  
    /* ════════════════════════════════
       TRIGGER LOGIC
       ════════════════════════════════ */
    function setupTriggers() {
      // Track idle time
      ['mousemove','keydown','scroll','click','touchstart'].forEach(ev => {
        document.addEventListener(ev, () => { lastActive = Date.now(); }, { passive:true });
      });
  
      // Check idle every 5s
      setInterval(() => {
        const idle = (Date.now() - lastActive) / 1000;
        if (idle > 45 && !triggered.scan)  runVirusScan();
        if (idle > 90 && !triggered.hack)  runFakeHack();
        if (idle > 120 && !triggered.crash) runFakeCrash();
      }, 5000);
  
      // Konami code → fake hack immediately
      document.addEventListener('keydown', e => {
        konamiSeq.push(e.keyCode);
        if (konamiSeq.length > KONAMI.length) konamiSeq.shift();
        if (JSON.stringify(konamiSeq) === JSON.stringify(KONAMI)) {
          runFakeHack();
        }
      });
  
      // Secret: click logo 5 times → virus scan
      let logoClicks = 0;
      document.addEventListener('click', e => {
        if (e.target.closest('.admin-logo, .nav-logo, #footer')) {
          logoClicks++;
          if (logoClicks >= 5) { logoClicks=0; runVirusScan(); }
        }
      });
  
      // Secret: type "crash" anywhere → fake crash
      let crashTyped = '';
      document.addEventListener('keydown', e => {
        if (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
        crashTyped += e.key.toLowerCase();
        if (crashTyped.length > 5) crashTyped = crashTyped.slice(-5);
        if (crashTyped === 'crash') runFakeCrash();
      });
    }
  
    function init() {
      // Small delay so page loads first
      setTimeout(setupTriggers, 2000);
    }
  
    return { init, runVirusScan, runFakeHack, runFakeCrash };
  })();
  
  // Auto-init
  if (document.readyState==='loading') {
    document.addEventListener('DOMContentLoaded', () => Prank.init());
  } else { Prank.init(); }