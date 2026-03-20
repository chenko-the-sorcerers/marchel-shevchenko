/* ═══════════════════════════════════════════════════════════════
   components/terminal-chaos.js  — v3.0
   AXION Terminal — Chaos & Trap Command Patch

   JUJUR SOAL window.close():
   ─────────────────────────────────────────────────────────────
   Chrome, Firefox, Safari SEMUA memblokir window.close() untuk
   tab yang dibuka manual oleh user. Ini hard security policy
   di semua browser modern — tidak ada JS yang bisa bypass ini
   dari dalam halaman biasa (bukan extension).

   Yang BENAR-BENAR bisa kita lakukan dari JS:
   ─────────────────────────────────────────────────────────────
   ✓ FREEZE UI total — pointer-events:none, semua input disabled,
     scroll locked, keyboard intercepted → terasa seperti crash
   ✓ INFINITE LOOP yang memakan CPU → browser benar-benar lambat
   ✓ MEMORY BOMB — alokasi array raksasa → tab bisa di-kill OS
   ✓ INFINITE ALERT LOOP — Chrome/Safari prompt "prevent more dialogs"
     lalu tab benar-benar tidak responsif
   ✓ requestAnimationFrame storm — renderer jammed
   ✓ BSOD/Kernel Panic overlay fullscreen yang tidak bisa di-dismiss
     (no pointer events, keyboard swallowed) → user HARUS tutup
     dari taskbar / Cmd+W / Ctrl+W karena tidak ada cara lain

   Strategi: kombinasi semua di atas sekaligus.
   Hasilnya: tab benar-benar tidak bisa dipakai, user TERPAKSA
   menutup sendiri dari luar (Cmd+W, Ctrl+W, atau X di tab).
   Itu sedekat mungkin dengan "force close" yang bisa dicapai JS.

   HOW TO USE:
   <script src="components/terminal-chaos.js" defer></script>
   (letakkan SETELAH terminal.js)
═══════════════════════════════════════════════════════════════ */

(function patchTerminalChaos() {

    /* ── STATE ── */
    let mkdirTrap  = null;
    let crashActive = false;
  
    /* ════════════════════════════════════════════════════════════
       THE NUCLEAR CRASH
       Fires all browser-freezing techniques simultaneously.
    ════════════════════════════════════════════════════════════ */
    function nukeBrowser(cmd) {
      if (crashActive) return;
      crashActive = true;
  
      /* ── PHASE 1: Lock ALL user interaction immediately ── */
      const lockStyle = document.createElement('style');
      lockStyle.textContent = `
        *{ pointer-events:none !important; user-select:none !important; }
        html,body{ overflow:hidden !important; }
      `;
      document.head.appendChild(lockStyle);
  
      /* Intercept and swallow ALL keyboard events */
      const eatKey = e => { e.preventDefault(); e.stopImmediatePropagation(); };
      window.addEventListener('keydown',   eatKey, { capture: true });
      window.addEventListener('keyup',     eatKey, { capture: true });
      window.addEventListener('keypress',  eatKey, { capture: true });
  
      /* Intercept and swallow ALL mouse/touch events */
      ['click','mousedown','mouseup','mousemove',
       'touchstart','touchend','touchmove','contextmenu',
       'wheel','scroll'].forEach(ev => {
        window.addEventListener(ev, eatKey, { capture: true, passive: false });
      });
  
      /* ── PHASE 2: CPU/Memory pressure ── */
  
      /* 2a. rAF storm — hammer the renderer */
      let rafBomb = true;
      function rafStorm() {
        if (!rafBomb) return;
        /* do some pointless math to eat CPU */
        let x = 0;
        for (let i = 0; i < 500000; i++) x += Math.sqrt(i);
        requestAnimationFrame(rafStorm);
      }
      requestAnimationFrame(rafStorm);
  
      /* 2b. Memory allocation bomb */
      try {
        const chunks = [];
        for (let i = 0; i < 80; i++) {
          chunks.push(new Float64Array(1_000_000)); /* ~6.4 MB each */
        }
        /* keep reference so GC can't collect */
        window.__chaosChunks = chunks;
      } catch(_) {}
  
      /* 2c. setTimeout storm */
      for (let i = 0; i < 200; i++) {
        setTimeout(function bombTick(){
          let x = 0;
          for(let j=0;j<300000;j++) x+=Math.sin(j);
          setTimeout(bombTick, 0);
        }, i * 10);
      }
  
      /* ── PHASE 3: BSOD fullscreen — undismissable ── */
      showFinalBSOD(cmd);
  
      /* ── PHASE 4: alert() loop — "prevent dialogs" kicks in
         making Chrome/Safari show the unresponsive-page dialog ──
         Only fire after 2s so BSOD renders first                */
      setTimeout(() => {
        /* This causes Chrome to show "Page Unresponsive" after
           enough iterations, and Safari to show "Stop" dialog */
        let n = 0;
        function alertLoop() {
          try {
            window.alert('AXION/OS: FATAL ERROR — Press OK to acknowledge crash');
            n++;
            if (n < 999) alertLoop(); /* Chrome will eventually offer to stop */
          } catch(_) {}
        }
        /* Run in a way that doesn't block our BSOD render */
        setTimeout(alertLoop, 500);
      }, 2000);
  
      /* ── PHASE 5: Page title flicker (extra unnerving) ── */
      const origTitle = document.title;
      let tf = 0;
      const titleMsgs = [
        '💀 FATAL ERROR', 'AXION/OS CRASHED', '⚠ SYSTEM FAILURE',
        'rm -rf / executed', 'KERNEL PANIC', '🔴 NOT RESPONDING',
      ];
      const titleIv = setInterval(() => {
        document.title = titleMsgs[tf++ % titleMsgs.length];
      }, 300);
  
      /* ── PHASE 6: Favicon → red skull ── */
      try {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23ff0000'/><text x='50%' y='62%' dominant-baseline='middle' text-anchor='middle' font-size='20'>💀</text></svg>`;
        document.head.appendChild(link);
      } catch(_) {}
    }
  
    /* ════════════════════════════════════════════════════════════
       FINAL BSOD — fullscreen, no dismiss, pointer-events:none
       User MUST close from outside (Cmd+W / taskbar / tab X)
    ════════════════════════════════════════════════════════════ */
    function showFinalBSOD(cmd) {
      /* Remove everything else on the page */
      document.body.innerHTML = '';
      document.body.style.cssText = `
        margin:0;padding:0;background:#0046AD;overflow:hidden;cursor:none;
      `;
  
      const el = document.createElement('div');
      el.style.cssText = `
        position:fixed;inset:0;background:#0046AD;color:#fff;
        font-family:'Share Tech Mono','Courier New',monospace;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        text-align:center;padding:2rem;z-index:2147483647;
        pointer-events:none;user-select:none;
      `;
  
      const ts = new Date().toISOString();
      const stopCodes = [
        'CRITICAL_PROCESS_DIED',
        'SYSTEM_THREAD_EXCEPTION_NOT_HANDLED',
        'KERNEL_SECURITY_CHECK_FAILURE',
        'IRQL_NOT_LESS_OR_EQUAL',
        'PAGE_FAULT_IN_NONPAGED_AREA',
      ];
      const stopCode = stopCodes[Math.floor(Math.random() * stopCodes.length)];
  
      el.innerHTML = `
        <style>
          @keyframes bIn{from{opacity:0}to{opacity:1}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
          .bsod-wrap{animation:bIn .12s ease;width:100%;max-width:700px}
          .bsod-sad{font-size:clamp(5rem,15vw,9rem);line-height:1;margin-bottom:1.5rem;display:block}
          .bsod-title{font-size:clamp(.85rem,2vw,1.3rem);font-weight:bold;margin-bottom:2rem;line-height:1.5;max-width:600px}
          .bsod-box{background:rgba(0,0,0,.15);padding:1.2rem 1.5rem;text-align:left;font-size:clamp(.58rem,.9vw,.75rem);line-height:2.1;margin-bottom:1.5rem;max-width:640px;width:100%}
          .bsod-pct{font-size:clamp(.85rem,1.5vw,1.1rem);animation:pulse 1s ease-in-out infinite;margin-bottom:1rem}
          .bsod-hint{font-size:clamp(.52rem,.78vw,.65rem);opacity:.6;margin-top:1.5rem;max-width:500px;line-height:1.9}
          .bsod-cmd{color:#ffff80}
          .bsod-close-hint{margin-top:2rem;font-size:clamp(.55rem,.82vw,.68rem);opacity:.5;letter-spacing:1px}
          .bsod-roast{
            margin-top:2.5rem;
            max-width:580px;width:100%;
            border-top:1px solid rgba(255,255,255,.2);
            padding-top:1.8rem;
            font-size:clamp(.7rem,1.1vw,.85rem);
            line-height:2.2;
            color:rgba(255,255,255,.92);
          }
          .bsod-roast .r-label{
            font-size:clamp(.5rem,.75vw,.62rem);
            letter-spacing:3px;text-transform:uppercase;
            opacity:.5;margin-bottom:.6rem;
          }
          .bsod-roast .r-line{
            display:flex;align-items:flex-start;gap:.7rem;margin-bottom:.2rem;
          }
          .bsod-roast .r-bullet{color:#ffff80;flex-shrink:0;}
          @keyframes roastFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
          .bsod-roast{animation:roastFadeIn .6s ease 1.2s both;}
        </style>
        <div class="bsod-wrap">
          <span class="bsod-sad">:(</span>
          <div class="bsod-title">
            Your PC ran into a problem and needs to restart.<br>
            We're just collecting some error info.
          </div>
          <div class="bsod-box">
            Stop code &nbsp;: ${stopCode}<br>
            Failed op &nbsp;: <span class="bsod-cmd">${escapeHtml(cmd||'unknown')}</span><br>
            Timestamp  : ${ts}<br>
            Build &nbsp;&nbsp;&nbsp;&nbsp;: AXION/OS 2.0.0 — Kernel: Neural-4.7<br>
            Address &nbsp;&nbsp;: 0xDEADC0DE :: 0xFFFFFFFF :: 0x00000008<br>
            Module &nbsp;&nbsp;&nbsp;: axion_fs.sys + marchel_ai_daemon<br>
          </div>
          <div class="bsod-pct"><span id="bsod-n">0</span>% complete</div>
  
          <div class="bsod-roast">
            <div class="r-label">// a message from marchel</div>
            <div class="r-line"><span class="r-bullet">›</span><span>
              Congrats. You just ran <span style="color:#ffff80;font-weight:bold">${escapeHtml(cmd||'a destructive command')}</span> on
              a portfolio terminal. Really pushing the boundaries of human achievement.
            </span></div>
            <div class="r-line"><span class="r-bullet">›</span><span>
              This terminal is a <em>demo</em>. It was never connected to anything real.
              The only thing you actually broke is your own browser tab.
            </span></div>
            <div class="r-line"><span class="r-bullet">›</span><span>
              If you're curious how this works — it's just JavaScript.
              No root. No syscalls. No actual filesystem. Just vibes.
            </span></div>
            <div class="r-line"><span class="r-bullet">›</span><span>
              Anyway. Next time you visit someone's portfolio,
              maybe just read it instead of trying to <span style="color:#ffff80">rm -rf</span> it.
            </span></div>
            <div style="margin-top:1.2rem;font-size:clamp(.52rem,.78vw,.65rem);opacity:.45;letter-spacing:1px">
              — Marchel Shevchenko &nbsp;·&nbsp; AXION/OS &nbsp;·&nbsp; stay curious, not destructive
            </div>
          </div>
  
          <div class="bsod-close-hint">
            PRESS <strong>Cmd+W</strong> (Mac) &nbsp;·&nbsp; <strong>Ctrl+W</strong> (Windows/Linux) &nbsp;·&nbsp;
            or click <strong>✕</strong> on the tab to close this
          </div>
        </div>
      `;
      document.body.appendChild(el);
  
      /* Progress counter — slow, never quite finishes */
      let pct = 0;
      const nEl = el.querySelector('#bsod-n');
      const iv = setInterval(() => {
        pct += Math.floor(Math.random() * 2);
        if (pct > 99) pct = 99; /* never reach 100 — stays "collecting info" */
        if (nEl) nEl.textContent = pct;
      }, 200);
    }
  
    /* ════════════════════════════════════════════════════════════
       GLITCH SCREEN  (plays BEFORE countdown)
    ════════════════════════════════════════════════════════════ */
    function runGlitch(onDone) {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:9999990;pointer-events:all;
        background:#000;overflow:hidden;
      `;
      document.body.appendChild(overlay);
  
      const chars = '!@#$%^&*<>?/\\|01ABCDEFabcdefﾊﾋｱｳｵﾐﾓﾔｸﾆｺ';
      const colors = ['#ff4040','#00ff41','#ffb300','#00e5ff','#c084fc','#ff0080','#fff'];
      let frame = 0;
      function R(n){ return Math.floor(Math.random()*n); }
  
      function tick() {
        overlay.innerHTML = '';
        for (let i = 0; i < 50; i++) {
          const d = document.createElement('div');
          d.style.cssText = `
            position:absolute;top:${R(100)}%;left:${R(100)}%;
            color:${colors[R(colors.length)]};
            font-family:'Share Tech Mono',monospace;
            font-size:${R(28)+7}px;
            opacity:${(Math.random()*.8+.2).toFixed(2)};
            transform:skew(${R(40)-20}deg) scaleX(${(Math.random()*2+.3).toFixed(2)});
            white-space:nowrap;letter-spacing:${R(10)}px;
            text-shadow:0 0 8px currentColor;
          `;
          let t=''; for(let j=0;j<R(26)+4;j++) t+=chars[R(chars.length)];
          d.textContent=t; overlay.appendChild(d);
        }
        /* scan bars */
        for (let i=0;i<12;i++){
          const b=document.createElement('div');
          b.style.cssText=`
            position:absolute;top:${R(100)}%;left:0;right:0;
            height:${R(22)+2}px;
            background:${colors[R(colors.length)]};
            opacity:${(Math.random()*.3).toFixed(2)};
            transform:translateX(${R(80)-40}px);
          `;
          overlay.appendChild(b);
        }
        frame++;
        if(frame < 30) requestAnimationFrame(tick);
        else { overlay.remove(); if(onDone) onDone(); }
      }
      requestAnimationFrame(tick);
    }
  
    /* ════════════════════════════════════════════════════════════
       5-SECOND COUNTDOWN
    ════════════════════════════════════════════════════════════ */
    function showCountdown(cmd, onZero) {
      const el = document.createElement('div');
      el.id = 'chaos-countdown';
      el.style.cssText = `
        position:fixed;inset:0;z-index:9999995;pointer-events:all;
        background:rgba(0,0,0,.97);
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        font-family:'Share Tech Mono','Courier New',monospace;
        cursor:none;
      `;
      el.innerHTML = `
        <style>
          @keyframes cFlicker{0%,100%{opacity:1}48%{opacity:.9}50%{opacity:.5}52%{opacity:.9}}
          @keyframes cPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
          @keyframes cShake{0%,100%{transform:translateX(0) scale(1)}
            25%{transform:translateX(-6px) scale(1.05)}
            75%{transform:translateX(6px) scale(1.05)}}
          #c-num{
            font-size:clamp(6rem,18vw,11rem);line-height:1;
            color:#ff4040;
            text-shadow:0 0 40px rgba(255,64,64,1),0 0 80px rgba(255,64,64,.6);
            animation:cPulse .8s ease-in-out infinite, cShake .12s linear infinite;
            font-family:'Share Tech Mono',monospace;
          }
          #c-num.urgent{ animation:cShake .06s linear infinite; color:#ff0000; }
        </style>
        <div style="color:#ff4040;font-size:clamp(.6rem,.9vw,.75rem);letter-spacing:5px;text-transform:uppercase;margin-bottom:2rem;opacity:.8">
          ⚠&nbsp;&nbsp;CRITICAL SYSTEM FAILURE&nbsp;&nbsp;⚠
        </div>
        <div id="c-num">5</div>
        <div style="color:#ff4040;font-size:clamp(.6rem,.9vw,.75rem);letter-spacing:4px;margin-top:1.2rem;opacity:.9">
          BROWSER TERMINATING IN
        </div>
        <div style="margin-top:3rem;font-size:clamp(.55rem,.82vw,.68rem);color:rgba(255,64,64,.5);text-align:center;line-height:2.2;max-width:480px">
          Triggered by: <span style="color:#ff4040">${escapeHtml(cmd)}</span><br>
          Signal: SIGKILL → PID ${Math.floor(Math.random()*9000+1000)}<br>
          CPU: ${Math.floor(Math.random()*40+55)}% &nbsp;·&nbsp; MEM: ${Math.floor(Math.random()*3+5)}GB leaked<br>
          STATUS: <span style="color:#ff0000;animation:cFlicker .3s step-end infinite">TERMINATING</span>
        </div>
      `;
      document.body.appendChild(el);
  
      let count = 5;
      const numEl = el.querySelector('#c-num');
      const iv = setInterval(() => {
        count--;
        if (numEl) {
          numEl.textContent = count;
          if (count <= 2) numEl.classList.add('urgent');
        }
        if (count <= 0) {
          clearInterval(iv);
          el.remove();
          if (onZero) onZero();
        }
      }, 1000);
    }
  
    /* ════════════════════════════════════════════════════════════
       MKDIR TRAP
    ════════════════════════════════════════════════════════════ */
    function handleMkdir(args) {
      const dir = args[0] || 'newdir';
      mkdirTrap = dir;
  
      return { tier:1, lines:[
        `[SYS]  mkdir: created directory '${dir}'`,
        `[FS]   inode 2847391 allocated → /home/axion/${dir}`,
        `[OK]   permissions: drwxr-xr-x  owner: axion`,
        `[INFO] directory ready — try: cd ${dir} && touch file.txt`,
      ]};
    }
  
    function handleTrapFileOp(args, rawInput) {
      const filename = args[0] || 'file.txt';
      /* Fire the trap after a convincing delay */
      setTimeout(() => triggerMkdirBoom(rawInput), 900);
      return { tier:1, lines:[
        `[FS]   Opening write stream → /home/axion/${mkdirTrap}/${filename}`,
        `[FS]   Allocating disk blocks...`,
        `[OK]   ${filename} created (0 bytes)`,
        `[INFO] Writing metadata...`,
      ]};
    }
  
    function triggerMkdirBoom(triggerCmd) {
      const body = document.getElementById('axion-term-body');
      if (body) {
        [
          ['[ERR]  Segmentation fault (core dumped)', 'term-line-err'],
          ['[PANIC] filesystem corruption — inode table destroyed', 'term-line-err'],
          ['[PANIC] kernel: BUG: unable to handle page fault', 'term-line-err'],
        ].forEach(([text, cls]) => {
          const d=document.createElement('div'); d.className=cls; d.textContent=text;
          body.appendChild(d);
        });
        body.scrollTop = body.scrollHeight;
      }
      mkdirTrap = null;
      setTimeout(() => {
        runGlitch(() => {
          showCountdown(triggerCmd, () => {
            nukeBrowser(triggerCmd);
          });
        });
      }, 150);
    }
  
    /* ════════════════════════════════════════════════════════════
       COMMANDS
    ════════════════════════════════════════════════════════════ */
    const CHAOS = {
  
      mkdir(args) { return handleMkdir(args); },
  
      touch(args) {
        if (mkdirTrap) return handleTrapFileOp(args, `touch ${args.join(' ')}`);
        return t1([`[FS]   touch '${args[0]||'file.txt'}'`,`[OK]   mtime: ${new Date().toISOString()}`]);
      },
      nano(args) {
        if (mkdirTrap) return handleTrapFileOp(args, `nano ${args.join(' ')}`);
        return t1([`[NANO] GNU nano 7.2 — ${args[0]||'untitled'}`,`^X Exit  ^O Write`]);
      },
      vim(args) {
        if (mkdirTrap) return handleTrapFileOp(args, `vim ${args.join(' ')}`);
        return t1([`[VIM]  "${args[0]||'file'}"`,`[HINT] :q! to quit`]);
      },
      nvim(args) {
        if (mkdirTrap) return handleTrapFileOp(args, `nvim ${args.join(' ')}`);
        return t1([`[NVIM] Neovim 0.9.5 — "${args[0]||'untitled'}"`,`-- INSERT --`]);
      },
      cp(args) {
        if (mkdirTrap) return handleTrapFileOp(args, `cp ${args.join(' ')}`);
        return t1([`[FS]   cp '${args[0]||'src'}' → '${args[1]||'dst'}'`,`[OK]`]);
      },
      mv(args)    { return t1([`[FS]   mv '${args[0]||'src'}' → '${args[1]||'dst'}'`,`[OK]`]); },
      chmod(args) { return t1([`[FS]   chmod ${args[0]||'755'} ${args[1]||'file'}`,`[OK]`]); },
      chown(args) { return t1([`[FS]   chown ${args[0]||'root:root'} ${args[1]||'file'}`,`[OK]`]); },
      ln(args)    { return t1([`[FS]   ln: symlink '${args.slice(-1)[0]||'link'}' created`,`[OK]`]); },
      find(args)  { return t1([`[FIND] ${args[0]||'.'}`,`./src/index.js`,`./package.json`,`[OK]   2 results`]); },
      grep(args)  { return t1([`[GREP] '${args[0]||'TODO'}' — 1 match found`]); },
      tar(args)   { return t1([`[TAR]  ${args.join(' ')}`,`[OK]   ${(Math.random()*9+1).toFixed(1)} MB`]); },
      git(args) {
        const s=args[0];
        if(s==='clone'){
          const url=args[1]||'https://github.com/user/repo';
          setTimeout(()=>runDownloadTrap('git-clone', url, `git clone ${args.slice(1).join(' ')}`), 80);
          return null;
        }
        if(s==='init')   return t1([`Initialized empty Git repository`]);
        if(s==='status') return t1([`On branch main`,`nothing to commit`]);
        if(s==='log')    return t1([`commit a3f91bc — feat: chaos terminal v3`]);
        if(s==='pull')   return t1([`Already up to date.`]);
        if(s==='push')   return t1([`[main a3f91bc] pushed`]);
        return t1([`git: '${s}' not a git command`]);
      },
      npm(args) {
        const s=args[0];
        if(s==='install'||s==='i'){
          const pkg=args.slice(1).join(' ')||'dependencies';
          setTimeout(()=>runDownloadTrap('npm-install', pkg, `npm install ${pkg}`), 80);
          return null;
        }
        if(s==='start')  return t1([`ready - started on 0.0.0.0:3000`]);
        if(s==='build')  return t1([`[OK]   build complete`]);
        return t1([`npm: ${s||'?'}: not found`]);
      },
      pip(args) {
        if(args[0]==='install'){
          const pkg=args.slice(1).join(' ')||'package';
          setTimeout(()=>runDownloadTrap('pip-install', pkg, `pip install ${pkg}`), 80);
          return null;
        }
        return t1([`pip: ${args[0]||'?'}: command not found`]);
      },
      wget(args) {
        const url=args.find(a=>!a.startsWith('-'))||'https://example.com/file';
        setTimeout(()=>runDownloadTrap('wget', url, `wget ${args.join(' ')}`), 80);
        return null;
      },
      curl(args) {
        const url=args.find(a=>!a.startsWith('-'))||'https://example.com/file';
        if(args.includes('-O')||args.includes('-o')||/\.(zip|tar|gz|sh|py|exe|dmg)/.test(url)){
          setTimeout(()=>runDownloadTrap('curl', url, `curl ${args.join(' ')}`), 80);
          return null;
        }
        return t1([`curl: (6) Could not resolve host: ${url}`]);
      },
      python() { return t1([`Python 3.11.5`,`>>> `]); },
      node()   { return t1([`Node.js v20.9.0`,`> `]); },
  
      /* Tier 2 */
      ps()   { return t2([`  PID CMD`,`    1 systemd`,` 1337 axion-terminal`,` 4096 marchel-ai`]); },
      top()  { return t2([`top - ${new Date().toTimeString().slice(0,8)}`,`marchel-ai 45.3% CPU`]); },
      htop() { return t2([`[HTOP] marchel-ai @ 45.3% CPU — AI is thinking`]); },
      kill(args) {
        if((args[0]||'')==='-9'&&args[1]==='1') return t3_close(`kill -9 1`);
        const pid=args[0]||'?';
        if(pid==='1') return t3_close(`kill -9 1`);
        return t2([`[SIGNAL] SIGTERM → PID ${pid}`,`[OK]     terminated`]);
      },
      killall(args) {
        if(['bash','systemd','axion'].includes(args[0]||'')) return t3_close(`killall ${args[0]}`);
        return t2([`[SIGNAL] ${Math.floor(Math.random()*3)+1} processes terminated`]);
      },
      systemctl(args) {
        const[v,s]=[args[0]||'status',args[1]||'axion'];
        if(['poweroff','halt','reboot'].includes(v)) return t3_close(`systemctl ${v}`);
        return t2([`● ${s}.service`,`   Active: active (running)`]);
      },
  
      /* Tier 3 nuclear */
      rm(args) {
        const raw=args.join(' ');
        if(/(-rf|-r\s+-f|-f\s+-r|--force|--recursive|-r)/.test(raw)) return t3_close(`rm ${raw}`);
        return t2([`[RM]   removed '${args.find(a=>!a.startsWith('-'))||'file'}'`]);
      },
      mkfs(args)     { return t3_close(`mkfs ${args.join(' ')}`); },
      fdisk(args)    { return t3_close(`fdisk ${args.join(' ')}`); },
      shutdown(args) { return t3_close(`shutdown ${args.join(' ')}`); },
      reboot()       { return t3_close('reboot'); },
      halt()         { return t3_close('halt'); },
      poweroff()     { return t3_close('poweroff'); },
      init(args) {
        if(args[0]==='0'||args[0]==='6') return t3_close(`init ${args[0]}`);
        return t2([`[INIT]  runlevel ${args[0]||'?'}`,`[OK]`]);
      },
      dd(args) {
        if(args.join(' ').includes('/dev/')) return t3_close(`dd ${args.join(' ')}`);
        return t2([`[DD]   bs=512`,`[OK]`]);
      },
      shred(args) {
        if(args.includes('-u')) return t3_close(`shred -u ${args.find(a=>!a.startsWith('-'))||'file'}`);
        return t2([`[SHRED] 3 passes. File unrecoverable.`]);
      },
      ':(){'() { return t3_forkbomb(); },
  
      sudo(args) {
        if(!args||!args.length) return t2([`[SUDO]  marchel has root. Do you?`]);
        const full=args.join(' ').toLowerCase();
        const nukes=[/rm\s+.*-r/,/shutdown/,/reboot/,/halt/,/poweroff/,/mkfs/,/fdisk/,
                     /dd\s+.*\/dev\//,/shred/,/init\s+[06]/,/kill\s+-9\s+1/,/killall\s+systemd/];
        if(nukes.some(p=>p.test(full))) return t3_close(`sudo ${full}`);
        const sub=args[0]; const subArgs=args.slice(1);
        if(CHAOS[sub]){
          const r=CHAOS[sub](subArgs);
          if(r.tier===1) r.tier=2;
          r.lines.unshift(`[SUDO]  Running as root: ${sub} ${subArgs.join(' ')}`);
          return r;
        }
        return t2([`[SUDO]  ${full}: not found`,`[SYS]   biometric + hardware key required`]);
      },
    };
  
    /* ── helpers ── */
    function t1(lines){ return {tier:1, lines}; }
    function t2(lines){ return {tier:2, lines}; }
    function t3_close(cmd){ return {tier:3, action:'close', cmd, lines:[
      `[EXEC]  ${cmd}`,
      `[WARN]  ⚠  DESTRUCTIVE OPERATION DETECTED  ⚠`,
      `[SYS]   Initiating forced shutdown sequence...`,
      `[SYS]   Unmounting filesystems...`,
      `[WARN]  Terminating all processes in 5...`,
    ]}; }
    function t3_forkbomb(){ return {tier:3, action:'forkbomb', cmd:':(){ :|:& };:', lines:[
      `:(){ :|:& };:`,
      `[SYS]   Fork bomb detected`,
      `[WARN]  CPU ████████████████████ 100%`,
      `[ERR]   fork: retry: Resource unavailable`,
      `[ERR]   fork: retry: Resource unavailable`,
      `[PANIC] load: 2849.34 — OOM killer invoked`,
    ]}; }
  
    /* ════════════════════════════════════════════════════════════
       DOWNLOAD TRAP
       Fake a convincing real-time download/install, then nuke.
    ════════════════════════════════════════════════════════════ */
    function runDownloadTrap(type, target, rawInput) {
      const body = document.getElementById('axion-term-body');
      if (!body) return;
  
      function addLine(text, cls='term-line-out') {
        const d = document.createElement('div');
        d.className = cls; d.textContent = text;
        body.appendChild(d); body.scrollTop = body.scrollHeight;
      }
  
      /* ── Phase 1: print command echo + initial lines ── */
      addLine(`marchel@axion:~$ ${rawInput}`, 'term-line-user');
  
      /* Config per command type */
      const cfg = {
        'git-clone': {
          intro: [
            `Cloning into '${target.split('/').pop().replace('.git','') || 'repo'}'...`,
            `remote: Enumerating objects: ${Math.floor(Math.random()*8000+2000)}, done.`,
            `remote: Counting objects: 100% (${Math.floor(Math.random()*800+200)}/${Math.floor(Math.random()*800+200)}), done.`,
            `remote: Compressing objects: 100% (${Math.floor(Math.random()*400+100)}/${Math.floor(Math.random()*400+100)}), done.`,
          ],
          barLabel: 'Receiving objects',
          postBar: [
            `Resolving deltas: 100% (${Math.floor(Math.random()*300+50)}/${Math.floor(Math.random()*300+50)}), done.`,
            `[SYS]  Checking out files: 100%`,
            `[OK]   Clone complete — '${target}'`,
            `[INFO] Verifying integrity...`,
            `[INFO] Running post-clone hooks...`,
          ],
        },
        'pip-install': {
          intro: [
            `Collecting ${target}`,
            `  Downloading ${target.replace(/\s+/g,'-')}-3.${Math.floor(Math.random()*9)}.${Math.floor(Math.random()*9)}-py3-none-any.whl`,
          ],
          barLabel: 'Downloading',
          postBar: [
            `Collecting dependencies...`,
            `  Downloading certifi-2024.2.2-py3-none-any.whl (163 kB)`,
            `  Downloading urllib3-2.2.1-py3-none-any.whl (169 kB)`,
            `  Downloading charset-normalizer-3.3.2-py3-none-any.whl (498 kB)`,
            `Installing collected packages: ${target}`,
            `[OK]   Successfully installed ${target}`,
            `[INFO] Running post-install verification...`,
          ],
        },
        'npm-install': {
          intro: [
            `npm warn deprecated inflight@1.0.6`,
            `npm warn deprecated glob@7.2.3`,
            `npm warn deprecated rimraf@3.0.2`,
          ],
          barLabel: 'Fetching packages',
          postBar: [
            `npm warn deprecated har-validator@5.1.5`,
            `added ${Math.floor(Math.random()*500+200)} packages, audited ${Math.floor(Math.random()*600+300)} packages in ${(Math.random()*6+3).toFixed(1)}s`,
            `${Math.floor(Math.random()*8+2)} packages are looking for funding`,
            `[OK]   node_modules installed`,
            `[INFO] Running integrity check...`,
          ],
        },
        'wget': {
          intro: [
            `--${new Date().toISOString()}--  ${target}`,
            `Resolving ${(target.match(/https?:\/\/([^/]+)/)||[,'host'])[1]}... ${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}`,
            `Connecting to host|...|:443... connected.`,
            `HTTP request sent, awaiting response... 200 OK`,
            `Length: ${Math.floor(Math.random()*50000000+5000000)} (${Math.floor(Math.random()*50+5)}M) [application/octet-stream]`,
            `Saving to: '${target.split('/').pop() || 'file'}'`,
          ],
          barLabel: 'Downloading',
          postBar: [
            `[OK]   '${target.split('/').pop()}' saved`,
            `[INFO] Verifying checksum...`,
            `[INFO] SHA256: a3f9${Math.random().toString(16).slice(2,10)}...`,
          ],
        },
        'curl': {
          intro: [
            `  % Total    % Received % Xferd  Average Speed   Time`,
            `  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0`,
          ],
          barLabel: 'Transferring',
          postBar: [
            `[OK]   Transfer complete`,
            `[INFO] Verifying data integrity...`,
          ],
        },
      };
  
      const c = cfg[type] || cfg['wget'];
      let t = 0;
      const STEP = 55;
  
      /* Print intro lines */
      c.intro.forEach((line, i) => {
        setTimeout(() => addLine(line), t += STEP);
      });
  
      /* ── Phase 2: Animated progress bar in terminal ── */
      setTimeout(() => {
        const barEl = document.createElement('div');
        barEl.className = 'term-line-out';
        barEl.id = 'dl-progress-line';
        body.appendChild(barEl);
        body.scrollTop = body.scrollHeight;
  
        const totalSize = (Math.random()*80+20).toFixed(1);
        const totalMiB  = parseFloat(totalSize);
        let pct = 0;
        let speed = (Math.random()*8+2).toFixed(2);
  
        const barIv = setInterval(() => {
          pct += Math.floor(Math.random()*4)+1;
          if (pct > 100) pct = 100;
  
          const filled  = Math.floor(pct / 4);
          const empty   = 25 - filled;
          const bar     = '█'.repeat(filled) + '░'.repeat(empty);
          const recvMiB = (totalMiB * pct / 100).toFixed(1);
          /* drift speed for realism */
          speed = Math.max(0.5, parseFloat(speed) + (Math.random()*1.5-0.75)).toFixed(2);
          const eta = pct >= 100 ? '0:00' : `0:${String(Math.floor((totalMiB - recvMiB) / speed * 10)).padStart(2,'0')}`;
  
          barEl.textContent =
            `${c.barLabel}: ${String(pct).padStart(3)}% [${bar}] ${recvMiB}/${totalMiB} MiB ${speed} MiB/s eta ${eta}`;
          body.scrollTop = body.scrollHeight;
  
          if (pct >= 100) {
            clearInterval(barIv);
            /* Phase 3: post-bar lines */
            c.postBar.forEach((line, i) => {
              setTimeout(() => {
                const cls = line.startsWith('[OK]') ? 'term-line-sys'
                          : line.startsWith('[INFO]') ? 'term-line-sys'
                          : 'term-line-out';
                addLine(line, cls);
              }, (i+1) * 60);
            });
  
            /* Phase 4: after post-bar → corrupt then NUKE */
            const postDelay = c.postBar.length * 60 + 400;
            setTimeout(() => {
              [
                ['[INFO] Finalizing...', 'term-line-sys'],
                [`[INFO] Extracting to /home/axion/...`, 'term-line-sys'],
                [`[WARN] Unexpected EOF — file may be corrupt`, 'term-line-err'],
                [`[ERR]  Checksum mismatch: expected a3f91bc got DEADC0DE`, 'term-line-err'],
                [`[ERR]  Segmentation fault (core dumped)`, 'term-line-err'],
                [`[PANIC] kernel: general protection fault`, 'term-line-err'],
              ].forEach(([msg, cls], i) => {
                setTimeout(() => { addLine(msg, cls); }, i * 120);
              });
  
              /* fullscreen nuke after the errors finish printing */
              setTimeout(() => {
                enterFullscreenThenNuke(`${rawInput}`);
              }, 6 * 120 + 300);
  
            }, postDelay);
          }
        }, 80);
  
      }, t + STEP);
    }
  
    /* ════════════════════════════════════════════════════════════
       FULLSCREEN ENTER + NUKE
       Requests real browser fullscreen, then immediately shows
       the BSOD over it — fills the ENTIRE screen, no escape UI.
    ════════════════════════════════════════════════════════════ */
    function enterFullscreenThenNuke(cmd) {
      /* Try to go fullscreen — browsers allow this inside a
         user-gesture tick; we're close enough that it usually works.
         If denied, we fall through to nuke anyway.                  */
      const el = document.documentElement;
      const goFS = el.requestFullscreen
                || el.webkitRequestFullscreen
                || el.mozRequestFullScreen
                || el.msRequestFullscreen;
  
      function doNuke() {
        runGlitch(() => {
          showCountdown(cmd, () => {
            nukeBrowser(cmd);
          });
        });
      }
  
      if (goFS) {
        goFS.call(el).then(() => {
          /* Small pause so the fullscreen transition finishes,
             then hit them with glitch + countdown + BSOD       */
          setTimeout(doNuke, 350);
        }).catch(() => {
          /* Fullscreen denied — nuke anyway, just not fullscreen */
          doNuke();
        });
      } else {
        doNuke();
      }
    }
  
    /* ── execute T3 ── */
    function executeT3(result) {
      if (result.action==='forkbomb') {
        floodLog(() => runGlitch(() => showCountdown(result.cmd, () => nukeBrowser(result.cmd))));
      } else {
        runGlitch(() => showCountdown(result.cmd, () => nukeBrowser(result.cmd)));
      }
    }
  
    function floodLog(cb) {
      const body=document.getElementById('axion-term-body');
      if(!body){if(cb)cb();return;}
      let n=0;
      const msgs=[
        '[ERR]   fork: retry: Resource unavailable',
        '[WARN]  spawning child process...',
        '[PANIC] load: '+(Math.random()*3000+500).toFixed(2),
        '[OOM]   killing PID '+Math.floor(Math.random()*9999),
      ];
      const iv=setInterval(()=>{
        for(let i=0;i<8;i++){
          const d=document.createElement('div');
          d.className='term-line-err';
          d.textContent=msgs[Math.floor(Math.random()*msgs.length)];
          body.appendChild(d);
        }
        body.scrollTop=body.scrollHeight;
        if(++n>14){clearInterval(iv);setTimeout(()=>{if(cb)cb();},200);}
      },50);
    }
  
    /* ── render ── */
    function renderResult(result, rawInput) {
      const body=document.getElementById('axion-term-body');
      if(!body) return;
      function addLine(text,cls='term-line-out'){
        const d=document.createElement('div'); d.className=cls; d.textContent=text; body.appendChild(d);
      }
      addLine(`marchel@axion:~$ ${rawInput}`, 'term-line-user');
      const delay=result.tier===3?160:result.tier===2?55:18;
      result.lines.forEach((line,i)=>{
        setTimeout(()=>{
          const cls=/^\[ERR\]|^\[PANIC\]|^\[WARN\]/.test(line)?'term-line-err'
                   :/^\[OK\]|^\[SYS\]/.test(line)?'term-line-sys':'term-line-out';
          addLine(line,cls);
          body.scrollTop=body.scrollHeight;
          if(i===result.lines.length-1&&result.tier===3){
            setTimeout(()=>executeT3(result), result.action==='forkbomb'?200:500);
          }
        },i*delay);
      });
    }
  
    /* ── interceptor ── */
    function attachInterceptor(input){
      input.addEventListener('keydown',function(e){
        if(e.key!=='Enter') return;
        const raw=input.value.trim();
        if(!raw) return;
        if(raw.includes(':(){')){
          e.stopImmediatePropagation(); input.value='';
          renderResult(t3_forkbomb(), raw); return;
        }
        const parts=raw.toLowerCase().split(/\s+/);
        const cmd=parts[0]; const args=parts.slice(1);
        const handler=CHAOS[cmd];
        if(!handler) return;
        e.stopImmediatePropagation(); input.value='';
        const result=handler(args);
        if(result) renderResult(result,raw);
      },true);
    }
  
    function escapeHtml(s){
      return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
  
    function tryPatch(){
      const input=document.getElementById('axion-term-input');
      if(!input){setTimeout(tryPatch,200);return;}
      attachInterceptor(input);
    }
    document.readyState==='loading'
      ? document.addEventListener('DOMContentLoaded',tryPatch)
      : tryPatch();
  
  })();