/* ═══════════════════════════════════════════════════════
   components/boot.js
   Shows a fake BIOS boot screen on first visit per session.
   Call Boot.run(onDone) — onDone fires when user dismisses.
   ═══════════════════════════════════════════════════════ */

   const Boot = (() => {

    const LOG = [
      { text: '[BIOS]  POST check: CPU cores detected ......... OK',       cls: 'ok',   d: 100  },
      { text: '[BIOS]  Memory: 64 GB ECC RAM ................... OK',       cls: 'ok',   d: 210  },
      { text: '[KERN]  Loading AXION/OS kernel v2.7.1 ...........',         cls: 'info', d: 350  },
      { text: '[KERN]  Mounting /sys/neural ..................... done',      cls: 'ok',   d: 490  },
      { text: '[KERN]  Mounting /sys/language_models ........... done',     cls: 'ok',   d: 600  },
      { text: '[NET]   Initialising GRID uplink .................',          cls: 'info', d: 740  },
      { text: '[NET]   Sector 7 node handshake .................. OK',      cls: 'ok',   d: 870  },
      { text: '[GPU]   CUDA devices: 4× A100 ................... online',   cls: 'ok',   d: 1010 },
      { text: '[AI]    Loading ARUNA 7B weights .................',          cls: 'info', d: 1160 },
      { text: '[AI]    Loading DIALEKTA 2B weights ..............',          cls: 'info', d: 1280 },
      { text: '[AI]    Inference engine ......................... ready',    cls: 'ok',   d: 1420 },
      { text: '[SYS]   Operator profile: MARCHEL SHEVCHENKO',               cls: 'warn', d: 1570 },
      { text: '[SYS]   Clearance level: ALPHA-7 ................ GRANTED',  cls: 'ok',   d: 1680 },
      { text: '[WARN]  Temporal anomaly detected: +31 years from baseline', cls: 'warn', d: 1820 },
      { text: '[SYS]   Rendering portfolio interface ............',          cls: 'info', d: 1960 },
      { text: '[SYS]   ████████████████████ 100% COMPLETE',                 cls: 'ok',   d: 2150 },
    ];
  
    const ASCII = `
   ███╗   ███╗ █████╗ ██████╗  ██████╗██╗  ██╗███████╗██╗
   ████╗ ████║██╔══██╗██╔══██╗██╔════╝██║  ██║██╔════╝██║
   ██╔████╔██║███████║██████╔╝██║     ███████║█████╗  ██║
   ██║╚██╔╝██║██╔══██║██╔══██╗██║     ██╔══██║██╔══╝  ██║
   ██║ ╚═╝ ██║██║  ██║██║  ██║╚██████╗██║  ██║███████╗███████╗
   ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝`.trim();
  
    function run(onDone) {
      // Show boot if: direct visit, new tab, or page refresh
      // Skip if: navigating from another page within the site
      const ref       = document.referrer;
      const sameOrigin = ref && new URL(ref).origin === location.origin;
      const fromInternal = sameOrigin && !ref.endsWith('index.html') && !ref.endsWith('/');
  
      if (fromInternal) { onDone(); return; }
  
      const overlay = document.createElement('div');
      overlay.id = 'boot-overlay';
      overlay.style.cssText = `
        position:fixed;inset:0;background:var(--bg);z-index:9800;
        display:flex;align-items:center;justify-content:center;
        padding:2rem;font-family:var(--font-vt);
      `;
  
      overlay.innerHTML = `
        <div style="max-width:740px;width:100%;">
          <pre id="boot-ascii" style="
            font-family:var(--font-mono);
            font-size:clamp(0.38rem,1.1vw,0.68rem);
            color:var(--green);
            text-shadow:var(--glow-g);
            line-height:1.15;
            white-space:pre;
            margin-bottom:0.5rem;
          ">${ASCII}</pre>
          <div style="color:var(--amber);text-shadow:var(--glow-a);font-size:1.1rem;margin-bottom:0.3rem;">
            AXION/OS v2.7.1 — MARCHEL SHEVCHENKO PORTFOLIO TERMINAL
          </div>
          <div style="color:var(--border-hi);margin-bottom:0.6rem;">
            ══════════════════════════════════════════════════════════
          </div>
          <div id="boot-log" style="min-height:200px;font-size:1.1rem;line-height:1.85;color:var(--text-dim);margin-bottom:1rem;"></div>
          <div style="margin-bottom:0.3rem;font-size:0.9rem;color:var(--green-dim);">
            SYSTEM LOAD: <span id="boot-pct">0</span>%
          </div>
          <div style="width:100%;height:13px;border:1px solid var(--border-hi);background:var(--bg2);margin-bottom:1rem;overflow:hidden;">
            <div id="boot-bar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--green-dark),var(--green));box-shadow:0 0 8px var(--green);transition:width 0.12s linear;"></div>
          </div>
          <div id="boot-enter" style="display:none;text-align:center;color:var(--amber);text-shadow:var(--glow-a);font-size:1.1rem;animation:blink 1s step-end infinite;cursor:pointer;">
            [ PRESS ENTER OR CLICK ANYWHERE TO INITIALIZE ]
          </div>
        </div>
      `;
  
      document.body.prepend(overlay);
  
      const logEl  = document.getElementById('boot-log');
      const barEl  = document.getElementById('boot-bar');
      const pctEl  = document.getElementById('boot-pct');
      const entEl  = document.getElementById('boot-enter');
      const total  = LOG.length;
  
      // Color map
      const colorMap = { ok: 'var(--green)', warn: 'var(--amber)', info: 'var(--cyan)', err: 'var(--red)' };
  
      LOG.forEach(({ text, cls, d }, i) => {
        setTimeout(() => {
          const span = document.createElement('span');
          span.style.cssText = `display:block;color:${colorMap[cls] || 'var(--text-dim)'}`;
          span.textContent = text;
          logEl.appendChild(span);
          logEl.scrollTop = logEl.scrollHeight;
          const pct = Math.round(((i + 1) / total) * 100);
          barEl.style.width = pct + '%';
          pctEl.textContent = pct;
        }, d);
      });
  
      const lastDelay = LOG[LOG.length - 1].d + 500;
  
      // Play boot beeps if Audio is available
      if (typeof SFX !== "undefined" && SFX.playBoot) {
        const startAudio = () => SFX.playBoot();
        overlay.addEventListener('click',    startAudio, { once: true });
        document.addEventListener('keydown', startAudio, { once: true });
      }
  
      setTimeout(() => {
        entEl.style.display = 'block';
        const dismiss = () => {
          if (typeof SFX !== "undefined" && SFX.playClick) SFX.playClick();
          overlay.style.transition = 'opacity 0.6s';
          overlay.style.opacity = '0';
          setTimeout(() => { overlay.remove(); onDone(); }, 620);
        };
        document.addEventListener('keydown', e => { if (e.key === 'Enter') dismiss(); }, { once: true });
        overlay.addEventListener('click', dismiss, { once: true });
      }, lastDelay);
    }
  
    return { run };
  })();