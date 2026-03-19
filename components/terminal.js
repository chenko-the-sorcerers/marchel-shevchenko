/* ═══════════════════════════════════════════════════════
   components/terminal.js
   AXION Terminal Mode — Global overlay terminal
   Features:
     - Ctrl+` or ~ to open/close
     - Full command set (help, projects, contact, etc.)
     - Easter eggs (sudo, matrix, hack, konami, etc.)
     - Visitor counter (terminal-style)
     - Bilingual: EN + ID
   ═══════════════════════════════════════════════════════ */

   const Terminal = (() => {

    /* ── STATE ── */
    let open      = false;
    let history   = [];
    let histIdx   = -1;
    let lang      = 'en'; // 'en' | 'id'
    let visitorCount = null;
  
    /* ── EASTER EGG FLAGS ── */
    let matrixActive  = false;
    let hackActive    = false;
    let konamiStep    = 0;
    const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  
    /* ══════════════════════════════════════════════
       COMMAND DEFINITIONS
    ══════════════════════════════════════════════ */
    const COMMANDS = {
  
      /* ── META ── */
      help: () => lang === 'id' ? `
  [AXION TERMINAL v2.0 — BANTUAN]
  
  Perintah tersedia:
    help           — tampilkan daftar ini
    about          — profil singkat Marchel
    projects       — daftar semua proyek
    skills         — skill scan
    experience     — riwayat kerja
    education      — riwayat pendidikan
    achievements   — penghargaan & grant
    talks          — seminar & workshop
    contact        — info kontak
    stats          — ringkasan angka
    nvidia         — grant & sertifikasi NVIDIA
    visitors       — counter pengunjung
    lang           — ganti bahasa (id/en)
    clear          — bersihkan layar
    exit           — tutup terminal
  
  Navigasi:
    [↑↓]          — riwayat perintah
    [Tab]          — autocomplete
    [Ctrl+\`]      — toggle terminal
  
  >> Coba juga: sudo, whoami, ls, pwd, ping, date...` :
  `
  [AXION TERMINAL v2.0 — HELP]
  
  Available commands:
    help           — show this list
    about          — Marchel's profile
    projects       — list all projects
    skills         — skill scan
    experience     — work history
    education      — academic record
    achievements   — awards & grants
    talks          — seminars & workshops
    contact        — contact info
    stats          — numbers at a glance
    nvidia         — NVIDIA grants & certs
    visitors       — visitor counter
    lang           — switch language (id/en)
    clear          — clear screen
    exit           — close terminal
  
  Navigation:
    [↑↓]          — command history
    [Tab]          — autocomplete
    [Ctrl+\`]      — toggle terminal
  
  >> Try also: sudo, whoami, ls, pwd, ping, date...`,
  
      /* ── ABOUT ── */
      about: () => lang === 'id' ? `
  [INFO] ${CV.fullName}
         ${CV.title}
         ${CV.location}
  
  ${CV.summary}
  
  Email  : ${CV.email}
  Telp   : ${CV.phone}` :
  `
  [INFO] ${CV.fullName}
         ${CV.title}
         ${CV.location}
  
  ${CV.summary}
  
  Email  : ${CV.email}
  Phone  : ${CV.phone}`,
  
      /* ── PROJECTS ── */
      projects: (args) => {
        const tag = args && args[0] ? args[0].toUpperCase() : null;
        const list = tag
          ? CV.projects.filter(p => p.tag.toUpperCase() === tag || p.stack.some(s => s.toUpperCase().includes(tag)))
          : CV.projects;
        if (!list.length) return `[WARN] No projects found for tag: ${tag}`;
        const label = lang === 'id' ? 'proyek' : 'projects';
        return `\n[PROJECTS] ${list.length} ${label}:\n\n` +
          list.map(p =>
            `  [${p.tag.padEnd(4)}] ${p.num}  ${p.title}\n         ${p.desc.slice(0,65)}...`
          ).join('\n\n') +
          `\n\n>> projects [tag] — filter by: NLP, LLM, CV, ML, Web3, Audio, Data`;
      },
  
      /* ── SKILLS ── */
      skills: () => {
        const bars = CV.skills.map(s => {
          const f = Math.round(s.pct / 10);
          return `  ${s.name.padEnd(32)} [${'█'.repeat(f)}${'░'.repeat(10-f)}] ${s.pct}%`;
        });
        return `\n[SKILLSCAN] ${lang === 'id' ? 'Kompetensi inti' : 'Core competencies'}:\n\n` + bars.join('\n');
      },
  
      /* ── EXPERIENCE ── */
      experience: () => {
        const label = lang === 'id' ? 'Riwayat kerja' : 'Work history';
        return `\n[EXP] ${label} (${CV.experience.length} roles):\n\n` +
          CV.experience.map(e =>
            `  ${e.period.padEnd(22)}  ${e.role}\n  ${''.padEnd(22)}  @ ${e.company}, ${e.location}`
          ).join('\n\n');
      },
  
      /* ── EDUCATION ── */
      education: () => {
        const label = lang === 'id' ? 'Riwayat pendidikan' : 'Academic record';
        return `\n[EDU] ${label}:\n\n` +
          CV.education.map(e =>
            `  ${e.period.padEnd(12)}  ${e.degree}\n  ${''.padEnd(12)}  ${e.school}, ${e.location}\n  ${''.padEnd(12)}  Focus: ${e.focus}`
          ).join('\n\n');
      },
  
      /* ── ACHIEVEMENTS ── */
      achievements: () => {
        const label = lang === 'id' ? 'Penghargaan' : 'Achievements';
        return `\n[${label.toUpperCase()}] ${CV.achievements.length} ${lang === 'id' ? 'tercatat' : 'on record'}:\n\n` +
          CV.achievements.map(a =>
            `  ${a.year}  ◆ ${a.title}\n         ${a.org}`
          ).join('\n\n');
      },
  
      /* ── TALKS ── */
      talks: () => {
        const total = CV.talks.seminars.length + CV.talks.workshops.length +
                      CV.talks.publicLectures.length + CV.talks.judgeAndMentor.length;
        const recent = CV.talks.seminars.slice(0, 5).map(t =>
          `  ◆ "${t.title.slice(0,60)}..."\n    ${t.host} (${t.year})`
        );
        return `\n[TALKS] ${total} ${lang === 'id' ? 'keterlibatan publik' : 'public engagements'}:\n` +
          `  Seminars ${CV.talks.seminars.length} · Workshops ${CV.talks.workshops.length} · Lectures ${CV.talks.publicLectures.length} · Judge/Mentor ${CV.talks.judgeAndMentor.length}\n\n` +
          `${lang === 'id' ? 'Seminar terbaru' : 'Recent seminars'}:\n\n` +
          recent.join('\n\n') +
          `\n\n>> ${CV.talks.seminars.length - 5} more — talks.html`;
      },
  
      /* ── CONTACT ── */
      contact: () => lang === 'id' ? `
  [KONTAK]
  
    Email    : ${CV.email}
    Telepon  : ${CV.phone}
    Lokasi   : ${CV.location}
  
  >> Kunjungi contact.html untuk kirim pesan langsung.` :
  `
  [CONTACT]
  
    Email    : ${CV.email}
    Phone    : ${CV.phone}
    Location : ${CV.location}
  
  >> Visit contact.html to send a message directly.`,
  
      /* ── STATS ── */
      stats: () => {
        const total = CV.talks.seminars.length + CV.talks.workshops.length +
                      CV.talks.publicLectures.length + CV.talks.judgeAndMentor.length;
        const vc = visitorCount ? visitorCount.toLocaleString() : '...';
        return lang === 'id' ? `
  [STATISTIK] Marchel sekilas:
  
    Proyek           : ${CV.projects.length}
    Pengalaman kerja : ${CV.experience.length} peran
    Gelar akademik   : ${CV.education.length}
    Penghargaan      : ${CV.achievements.length}
    Sertifikasi      : ${CV.certifications.length}
    Bicara publik    : ${total}
    Pengguna app     : 600K+
    Grant NVIDIA     : USD 362K+
    Pengunjung web   : ${vc}` :
  `
  [STATS] Marchel at a glance:
  
    Projects         : ${CV.projects.length}
    Work roles       : ${CV.experience.length}
    Degrees          : ${CV.education.length}
    Achievements     : ${CV.achievements.length}
    Certifications   : ${CV.certifications.length}
    Public talks     : ${total}
    App users        : 600K+
    NVIDIA grants    : USD 362K+
    Website visitors : ${vc}`;
      },
  
      /* ── NVIDIA ── */
      nvidia: () => `
  [NVIDIA]
  
    Inception Program    — USD 250K+ Grant (2025)
    Deep Learning Grant  — USD 112K+ / IDR 1.8B (2025-2027)
    DLI Certifications   — 5x (Healthcare, GANs, TF, Medical Imaging)
    Scholarship Project  — DVH & Radiomic IMRT Optimizer (NVIDIA × UGM)`,
  
      /* ── VISITORS ── */
      visitors: () => {
        if (visitorCount !== null) {
          return lang === 'id'
            ? `\n[KONEKSI] >> ${visitorCount.toLocaleString()} koneksi terbentuk\n   Terima kasih telah mengunjungi portal AXION.`
            : `\n[CONNECTIONS] >> ${visitorCount.toLocaleString()} connections established\n   Thank you for visiting the AXION portal.`;
        }
        fetchVisitorCount();
        return lang === 'id'
          ? '[SYS] Menghitung pengunjung...'
          : '[SYS] Fetching visitor count...';
      },
  
      /* ── LANG ── */
      lang: (args) => {
        const target = args && args[0] ? args[0].toLowerCase() : null;
        if (target === 'id') {
          lang = 'id';
          return '[SYS] Bahasa diubah ke Bahasa Indonesia. Ketik "help" untuk daftar perintah.';
        } else if (target === 'en') {
          lang = 'en';
          return '[SYS] Language switched to English. Type "help" for command list.';
        }
        return `[SYS] Current language: ${lang.toUpperCase()}\n>> lang id — switch to Indonesian\n>> lang en — switch to English`;
      },
  
      /* ── CLEAR ── */
      clear: () => {
        setTimeout(() => {
          const body = document.getElementById('axion-term-body');
          if (body) body.innerHTML = '';
        }, 10);
        return null;
      },
  
      /* ── EXIT ── */
      exit: () => {
        setTimeout(closeTerminal, 200);
        return lang === 'id' ? '[SYS] Menutup terminal...' : '[SYS] Closing terminal...';
      },
  
      /* ── UNIX-STYLE EASTER EGGS ── */
      whoami: () => `marchel-shevchenko — AI Architect, Founder, MIT Pre-PhD`,
  
      pwd: () => `/sys/marchel/portfolio`,
  
      ls: () => `
  drwxr-xr-x  about/        experience/   projects/     skills/
  drwxr-xr-x  talks/        contact/      chat/         publications/
  -rw-r--r--  README.md     cv-data.js    ARUNA_7B.bin  DIALEKTA_2B.bin`,
  
      date: () => new Date().toString(),
  
      ping: (args) => {
        const host = (args && args[0]) || 'marchel.dev';
        return `PING ${host}: 56 data bytes\n64 bytes from ${host}: icmp_seq=0 ttl=64 time=0.042 ms\n64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.039 ms\n\n--- ${host} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`;
      },
  
      uname: () => `AXION/OS v2.0.0 (SYS://MARCHEL) — Kernel: Neural-4.7`,
  
      uptime: () => {
        const d = new Date();
        return `${d.toTimeString().slice(0,8)} up ${Math.floor(Math.random()*365)} days, AI systems nominal`;
      },
  
      /* ── NAVIGATION ── */
      cd: (args) => {
        const target = (args && args[0]) || '';
        const routes = {
          'home': 'index.html', 'index': 'index.html', '~': 'index.html',
          'about': 'about.html',
          'projects': 'projects.html', 'proyek': 'projects.html',
          'skills': 'skills.html', 'keahlian': 'skills.html',
          'experience': 'experience.html', 'exp': 'experience.html', 'pengalaman': 'experience.html',
          'talks': 'talks.html', 'seminar': 'talks.html',
          'contact': 'contact.html', 'kontak': 'contact.html',
          'publications': 'publications.html', 'research': 'publications.html',
          'chat': 'chat.html', 'ai': 'chat.html',
          'origin': 'origin.html', 'story': 'origin.html', 'comic': 'origin.html',
        };
        const clean = target.replace('.html','').toLowerCase();
        const dest = routes[clean] || (target.endsWith('.html') ? target : null);
        if (!dest) return `[WARN] Unknown destination: "${target}"\n>> Available: home, about, projects, skills, experience, talks, contact, publications, chat`;
        setTimeout(() => { window.location.href = dest; }, 300);
        return `[SYS] Navigating to ${dest}...`;
      },
  
      cat: (args) => {
        const f = (args && args[0]) || '';
        if (f.includes('README')) return `# Marchel Shevchenko — AI Architect\n\nBuilding AI for culture, language, and the future of Indonesia.\n\nVisit: https://marchel-shevchenko.vercel.app`;
        if (f.includes('cv-data')) return `[WARN] cv-data.js is ${Math.round(CV.projects.length * 1.2)}KB — use: stats, projects, skills, etc.`;
        return `[WARN] File not found: ${f}. Try: ls`;
      },
  
      /* ── EASTER EGG: SUDO ── */
      sudo: (args) => {
        const cmd = (args || []).join(' ');
        if (!cmd) return `[SUDO] Usage: sudo <command>\n[SUDO] Marchel has root. Do you?`;
        if (cmd.includes('rm -rf') || cmd.includes('format') || cmd.includes('delete')) {
          return `[SUDO] Permission denied.\n[SYS] Nice try. Marchel's systems are hardened.\n[NVIDIA] Activating countermeasures...`;
        }
        return `[SUDO] sudo: ${cmd}: command not found in root scope.\n[SYS] Elevated privileges require: biometric + hardware key + MIT access badge.`;
      },
  
      /* ── EASTER EGG: MATRIX ── */
      matrix: () => {
        setTimeout(() => triggerMatrix(), 10);
        return '[SYS] Entering the Matrix...\n[WARN] Press any key or wait 5s to exit.';
      },
  
      /* ── EASTER EGG: HACK ── */
      hack: () => {
        setTimeout(() => triggerHack(), 10);
        return '[WARN] Initiating offensive protocol...\n[SYS] Just kidding. This is a portfolio.\n[INFO] But Marchel did co-found NESNF cybersec team in 2014.';
      },
  
      /* ── EASTER EGG: ARUNA ── */
      aruna: () => `
  [ARUNA 7B — FOUNDATION MODEL]
  
    Type    : LLM, Indonesian language
    Params  : 7 Billion
    Domain  : Low-resource Indonesian + dialects
    Status  : Research / Production
    By      : Marchel Shevchenko × Data Sorcerers
  
    "The first foundation model built for Nusantara."`,
  
      /* ── EASTER EGG: AXION ── */
      axion: () => `
  [AXION — SYSTEM IDENTITY]
  
    I am AXION — the AI interface for Marchel's portfolio.
    Codename derived from: A(rtificial) X(intelligence) ION
    Purpose: Answer all queries about Marchel's work and background.
    Status : ONLINE — All systems nominal.
    Backend: Claude API + cv-data.js
  
    >> Chat mode: chat.html`,
  
      /* ── EASTER EGG: SORCERERS ── */
      sorcerers: () => `
  [DATA SORCERERS — PT. Data Sorcerers Indonesia]
  
    Founded : Apr 2024
    CEO     : Marchel Andrian Shevchenko
    HQ      : Yogyakarta, Indonesia
    Focus   : AI for Culture, Healthcare & Wellness
    Org     : 10 divisions, 20+ projects, 2 products
    Classes : 5 exclusive classes held
  
    "Preparing digital talent for the AI era."`,
  
      /* ── EASTER EGG: NUSANTARA ── */
      nusantara: () => `
  [NUSANTARA — The Archipelago AI Mission]
  
    Indonesia has 700+ regional languages and 20+ traditional scripts.
    Most are LOW-RESOURCE — no digital tools, no AI support.
  
    Marchel's mission: change that.
  
    ◆ IndoLLNet v2.1   — OCR for Nusantara handwritten scripts
    ◆ ARUNA 7B         — Indonesian foundation model
    ◆ DIALEKTA 2B      — 21 dialect coverage
    ◆ Arutala Aksara   — 600K+ users, scan & translate scripts
  
    "Every script deserves an AI."`,
  
      /* ── EASTER EGG: MIT ── */
      mit: () => `
  [MIT — Massachusetts Institute of Technology]
  
    Program  : Pre-PhD Computational Science & Engineering
    Status   : Ongoing
    Focus    : Computer Vision, Computational Optimization
    Location : Boston, USA
  
    Notable: 4th Place MIT REAP Regional Entrepreneurship 2025
             2nd Place MIT Hacking Medicine (Upstream: Pharma) 2023`,
  
    };
  
    /* ── AUTOCOMPLETE LIST ── */
    const ALL_CMDS = Object.keys(COMMANDS).concat([
      'projects nlp','projects llm','projects cv','projects ml',
      'lang id','lang en',
    ]);
  
    /* ══════════════════════════════════════════════
       VISITOR COUNT
    ══════════════════════════════════════════════ */
    function fetchVisitorCount() {
      fetch('https://api.countapi.xyz/hit/marchel-shevchenko-portfolio/visits')
        .then(r => r.json())
        .then(data => {
          if (data && data.value) {
            visitorCount = data.value;
            // Update footer counter if visible
            const footer = document.getElementById('visitor-count');
            if (footer) footer.textContent = visitorCount.toLocaleString();
          }
        })
        .catch(() => { visitorCount = null; });
    }
  
    /* ══════════════════════════════════════════════
       EASTER EGG: MATRIX RAIN
    ══════════════════════════════════════════════ */
    function triggerMatrix() {
      if (matrixActive) return;
      matrixActive = true;
      const overlay = document.createElement('canvas');
      overlay.id = 'matrix-overlay';
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:19999;
        background:#000;pointer-events:all;cursor:none;`;
      document.body.appendChild(overlay);
  
      const ctx = overlay.getContext('2d');
      overlay.width = window.innerWidth;
      overlay.height = window.innerHeight;
      const cols = Math.floor(overlay.width / 14);
      const drops = Array(cols).fill(1);
      const chars = 'ꦲꦤꦕꦫꦏꦢꦠꦱꦮꦭꦥꦝꦗꦪꦚꦩꦒꦧꦛꦔꦀꦁꦂꦃꦄꦅꦆꦇꦈꦉꦊꦋꦌꦍꦎꦏꦐꦑꦒꦓꦔꦕꦖꦗꦘꦙꦚꦛꦜꦝꦞꦟꦠꦡꦢꦣꦤꦥꦦꦧꦨꦩꦪꦫꦬꦭꦮꦯꦰꦱꦲ';
  
      let rafId;
      const draw = () => {
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, 0, overlay.width, overlay.height);
        ctx.fillStyle = '#00ff41';
        ctx.font = '14px Share Tech Mono, monospace';
        drops.forEach((y, i) => {
          ctx.fillStyle = i % 5 === 0 ? '#ffffff' : '#00ff41';
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 14);
          if (y * 14 > overlay.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        });
        rafId = requestAnimationFrame(draw);
      };
      draw();
  
      const exit = () => {
        cancelAnimationFrame(rafId);
        overlay.remove();
        matrixActive = false;
      };
      setTimeout(exit, 5000);
      overlay.addEventListener('click', exit);
      document.addEventListener('keydown', exit, { once: true });
    }
  
    /* ══════════════════════════════════════════════
       EASTER EGG: HACK ANIMATION
    ══════════════════════════════════════════════ */
    function triggerHack() {
      if (hackActive) return;
      hackActive = true;
      const overlay = document.createElement('div');
      overlay.id = 'hack-overlay';
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:19998;background:rgba(0,0,0,0.92);
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        font-family:'Share Tech Mono',monospace;color:#ff4040;font-size:0.82rem;
        z-index:19999;pointer-events:all;`;
  
      const lines = [
        '> INITIALIZING OFFENSIVE PROTOCOL...',
        '> SCANNING TARGET NETWORK...',
        '> FOUND 3 OPEN PORTS: 22, 80, 443',
        '> DEPLOYING PAYLOAD... ████████░░ 80%',
        '> ACCESS GRANTED — root@marchel.dev',
        '',
        '> Just kidding 😄',
        '> Marchel co-founded NESNF cybersec team in 2014',
        '> He knows all the tricks — and defends against them.',
        '',
        '>> Click or press any key to exit',
      ];
  
      overlay.innerHTML = lines.map((l, i) =>
        `<div style="opacity:0;transition:opacity 0.3s;transition-delay:${i*0.25}s;margin:2px 0;color:${l.includes('Just')? '#00ff41' : '#ff4040'}">${l || '&nbsp;'}</div>`
      ).join('');
      document.body.appendChild(overlay);
      requestAnimationFrame(() => {
        overlay.querySelectorAll('div').forEach(d => d.style.opacity = '1');
      });
  
      const exit = () => { overlay.remove(); hackActive = false; };
      setTimeout(exit, 6000);
      overlay.addEventListener('click', exit);
      document.addEventListener('keydown', exit, { once: true });
    }
  
    /* ══════════════════════════════════════════════
       EASTER EGG: KONAMI CODE
    ══════════════════════════════════════════════ */
    function checkKonami(key) {
      if (key === KONAMI[konamiStep]) {
        konamiStep++;
        if (konamiStep === KONAMI.length) {
          konamiStep = 0;
          triggerKonami();
        }
      } else {
        konamiStep = 0;
      }
    }
  
    function triggerKonami() {
      const el = document.createElement('div');
      el.style.cssText = `
        position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
        z-index:20000;font-family:'VT323',monospace;font-size:clamp(2rem,6vw,4rem);
        color:#ffb300;text-shadow:0 0 20px #ffb300;text-align:center;
        pointer-events:none;animation:konamiFade 3s ease forwards;`;
      el.innerHTML = `
        ◈ CHEAT CODE ACTIVATED ◈<br>
        <span style="font-size:0.6em;color:#00ff41">
          +30 CHARISMA<br>+99 AI SKILLS<br>MARCHEL MODE ON
        </span>`;
      const style = document.createElement('style');
      style.textContent = `@keyframes konamiFade{0%{opacity:0;transform:translate(-50%,-50%) scale(0.5)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.3)}}`;
      document.head.appendChild(style);
      document.body.appendChild(el);
      setTimeout(() => { el.remove(); style.remove(); }, 3000);
    }
  
    /* ══════════════════════════════════════════════
       COMMAND PARSER
    ══════════════════════════════════════════════ */
    function parse(input) {
      const trimmed = input.trim();
      if (!trimmed) return null;
  
      const parts = trimmed.toLowerCase().split(/\s+/);
      const cmd   = parts[0];
      const args  = parts.slice(1);
  
      history.unshift(trimmed);
      histIdx = -1;
  
      // Direct match
      if (COMMANDS[cmd]) return COMMANDS[cmd](args);
  
      // Alias map
      const aliases = {
        'proyek':'projects','keahlian':'skills','pengalaman':'experience',
        'pendidikan':'education','penghargaan':'achievements','seminar':'talks',
        'kontak':'contact','ringkasan':'stats','bantuan':'help',
        'keluar':'exit','bersih':'clear','bahasa':'lang',
        'project':'projects','skill':'skills','exp':'experience',
        'edu':'education','award':'achievements','achieve':'achievements',
        'talk':'talks','quit':'exit','q':'exit','cls':'clear',
      };
      if (aliases[cmd]) return COMMANDS[aliases[cmd]](args);
  
      // Partial match
      const match = Object.keys(COMMANDS).find(k => k.startsWith(cmd) && cmd.length >= 2);
      if (match) return COMMANDS[match](args);
  
      return lang === 'id'
        ? `[AXION] Perintah tidak dikenal: "${trimmed}"\n>> Ketik "help" untuk daftar perintah.`
        : `[AXION] Unknown command: "${trimmed}"\n>> Type "help" for a list of commands.`;
    }
  
    /* ══════════════════════════════════════════════
       UI RENDERING
    ══════════════════════════════════════════════ */
    function buildUI() {
      const overlay = document.createElement('div');
      overlay.id = 'axion-terminal';
      overlay.innerHTML = `
        <div id="axion-term-header">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <span style="width:10px;height:10px;border-radius:50%;background:#ff5f57;display:inline-block"></span>
            <span style="width:10px;height:10px;border-radius:50%;background:#febc2e;display:inline-block"></span>
            <span style="width:10px;height:10px;border-radius:50%;background:#28c840;display:inline-block"></span>
            <span style="margin-left:0.5rem;font-size:0.78rem;color:var(--text-dim)">AXION TERMINAL v2.0</span>
          </div>
          <div style="display:flex;align-items:center;gap:1rem">
            <span id="axion-term-lang" style="font-size:0.72rem;color:var(--amber);cursor:pointer" title="Click to switch language">🌐 EN</span>
            <span style="font-size:0.72rem;color:var(--text-dim)">Ctrl+\` to close</span>
            <button id="axion-term-close" style="background:none;border:none;color:var(--text-dim);font-size:1rem;cursor:pointer;line-height:1">✕</button>
          </div>
        </div>
        <div id="axion-term-body"></div>
        <div id="axion-term-input-row">
          <span id="axion-term-prompt" style="color:var(--green);white-space:nowrap">marchel@axion:~$&nbsp;</span>
          <input id="axion-term-input" type="text" autocomplete="off" spellcheck="false"
            placeholder="${lang === 'id' ? 'ketik perintah...' : 'type a command...'}" />
        </div>`;
  
      const style = document.createElement('style');
      style.id = 'axion-terminal-styles';
      style.textContent = `
        #axion-terminal {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: min(520px, 60vh);
          background: rgba(2,9,5,0.97);
          border-top: 2px solid var(--green);
          z-index: 10000;
          display: flex; flex-direction: column;
          font-family: var(--font-mono);
          font-size: 0.82rem;
          transform: translateY(100%);
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 -10px 60px rgba(0,255,65,0.15);
        }
        #axion-terminal.open { transform: translateY(0); }
        #axion-term-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.45rem 1rem;
          background: rgba(5,15,8,0.98);
          border-bottom: 1px solid var(--border-hi);
          flex-shrink: 0;
        }
        #axion-term-body {
          flex: 1; overflow-y: auto;
          padding: 0.75rem 1rem;
          color: var(--text);
          white-space: pre-wrap;
          line-height: 1.7;
          scroll-behavior: smooth;
        }
        #axion-term-body::-webkit-scrollbar { width: 4px; }
        #axion-term-body::-webkit-scrollbar-track { background: transparent; }
        #axion-term-body::-webkit-scrollbar-thumb { background: var(--green-dark); border-radius: 2px; }
        #axion-term-input-row {
          display: flex; align-items: center;
          padding: 0.5rem 1rem;
          border-top: 1px solid var(--border);
          background: rgba(2,9,5,0.98);
          flex-shrink: 0;
        }
        #axion-term-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--green); font-family: var(--font-mono); font-size: 0.82rem;
          caret-color: var(--green);
        }
        #axion-term-input::placeholder { color: var(--text-dim); }
        .term-line-user { color: var(--amber); margin: 0.15rem 0; }
        .term-line-out   { color: var(--text);  margin: 0.1rem 0 0.5rem; }
        .term-line-err   { color: var(--red);   margin: 0.1rem 0; }
        .term-line-sys   { color: var(--cyan);  margin: 0.1rem 0; }
  
        /* Toggle button */
        #axion-term-toggle {
          position: fixed;
          bottom: 1.2rem; right: 1.5rem;
          z-index: 9990;
          background: rgba(2,9,5,0.92);
          border: 1px solid var(--border-hi);
          color: var(--green);
          font-family: var(--font-mono);
          font-size: 0.72rem;
          padding: 0.4rem 0.8rem;
          cursor: pointer;
          letter-spacing: 0.08em;
          box-shadow: 0 0 12px rgba(0,255,65,0.15);
          transition: all 0.2s;
        }
        #axion-term-toggle:hover {
          background: var(--green);
          color: var(--bg);
          box-shadow: 0 0 20px rgba(0,255,65,0.4);
        }
  
        /* Game button */
        #axion-game-btn {
          position: fixed;
          bottom: 1.2rem; right: 8.5rem;
          z-index: 9990;
          background: rgba(2,9,5,0.92);
          border: 1px solid var(--amber-dim);
          color: var(--amber);
          font-family: var(--font-mono);
          font-size: 0.72rem;
          padding: 0.4rem 0.8rem;
          letter-spacing: 0.08em;
          box-shadow: 0 0 12px rgba(255,179,0,0.1);
          transition: all 0.2s;
          cursor: pointer;
          user-select: none;
        }
        #axion-game-btn:hover {
          background: var(--amber);
          color: var(--bg);
          box-shadow: 0 0 20px rgba(255,179,0,0.4);
        }
        #axion-game-menu {
          position: fixed;
          bottom: 3.2rem; right: 8.5rem;
          z-index: 9991;
          background: rgba(2,9,5,0.97);
          border: 1px solid var(--amber-dim);
          display: none;
          flex-direction: column;
          min-width: 160px;
          box-shadow: 0 0 20px rgba(255,179,0,0.15);
        }
        #axion-game-menu a {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text);
          padding: 0.4rem 0.8rem;
          border-bottom: 1px solid var(--border);
          text-decoration: none;
          transition: all 0.15s;
          display: block;
        }
        #axion-game-menu a:last-child { border-bottom: none; }
        #axion-game-menu a:hover { background: rgba(255,179,0,0.08); color: var(--amber); }
  
        /* Visitor counter terminal widget */
        #axion-visitor-widget {
          position: fixed;
          bottom: 4.5rem; right: 1.5rem;
          z-index: 9989;
          background: rgba(2,9,5,0.88);
          border: 1px solid var(--border);
          color: var(--text-dim);
          font-family: var(--font-mono);
          font-size: 0.68rem;
          padding: 0.35rem 0.7rem;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
        }
        #axion-visitor-widget.show { opacity: 1; }
        #axion-visitor-widget .vc-num { color: var(--green); font-size: 0.8rem; }
      `;
  
      document.head.appendChild(style);
      document.body.appendChild(overlay);
  
      // Toggle button
      const btn = document.createElement('button');
      btn.id = 'axion-term-toggle';
      btn.textContent = '> TERMINAL_';
      btn.setAttribute('title', 'Ctrl+` to toggle');
      document.body.appendChild(btn);
  
      // Game button (dropdown)
      const gameBtn = document.createElement('div');
      gameBtn.id = 'axion-game-btn';
      gameBtn.textContent = '🎮 GAME ▲';
      document.body.appendChild(gameBtn);
  
      // Game dropdown menu
      const gameMenu = document.createElement('div');
      gameMenu.id = 'axion-game-menu';
      gameMenu.innerHTML = `
        <a href="origin.html">📖 Origin Story</a>
        <a href="gesture.html">🤚 Gesture CV</a>
        <a href="rpg.html">⚔️ Nusantara RPG</a>
        <a href="game.html">🧠 Neural Builder</a>
        <a href="404.html">🗺️ 404 Adventure</a>
        <a href="chess.html">♟️ Chess vs AI</a>
      `;
      document.body.appendChild(gameMenu);
      gameBtn.addEventListener('click', () => {
        const isOpen = gameMenu.style.display === 'flex';
        gameMenu.style.display = isOpen ? 'none' : 'flex';
        gameBtn.textContent = isOpen ? '🎮 GAME ▲' : '🎮 GAME ▼';
      });
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!gameBtn.contains(e.target) && !gameMenu.contains(e.target)) {
          gameMenu.style.display = 'none';
          gameBtn.textContent = '🎮 GAME ▲';
        }
      });
  
      // Visitor widget
      const vw = document.createElement('div');
      vw.id = 'axion-visitor-widget';
      vw.innerHTML = `>> <span class="vc-num" id="term-vc">...</span> connections`;
      document.body.appendChild(vw);
  
      // Events
      btn.addEventListener('click', toggleTerminal);
      document.getElementById('axion-term-close').addEventListener('click', closeTerminal);
      document.getElementById('axion-term-lang').addEventListener('click', () => {
        lang = lang === 'en' ? 'id' : 'en';
        document.getElementById('axion-term-lang').textContent = `🌐 ${lang.toUpperCase()}`;
        printOutput(lang === 'id'
          ? '[SYS] Bahasa diubah ke Bahasa Indonesia.'
          : '[SYS] Language switched to English.', 'sys');
      });
  
      const input = document.getElementById('axion-term-input');
      input.addEventListener('keydown', e => {
        // Gamelan bonang sound on typing
        if (e.key.length === 1 && typeof SFX !== 'undefined') SFX.playType();
        if (e.key === 'Enter') {
          const val = input.value.trim();
          if (!val) return;
          printLine(`marchel@axion:~$ ${val}`, 'user');
          const result = parse(val);
          if (result !== null) printOutput(result);
          input.value = '';
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (histIdx < history.length - 1) {
            histIdx++;
            input.value = history[histIdx] || '';
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (histIdx > 0) {
            histIdx--;
            input.value = history[histIdx] || '';
          } else {
            histIdx = -1;
            input.value = '';
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const val2 = input.value.toLowerCase();
          const match = ALL_CMDS.find(c => c.startsWith(val2) && c !== val2);
          if (match) input.value = match;
        }
      });
    }
  
    function printLine(text, type = 'out') {
      const body = document.getElementById('axion-term-body');
      if (!body) return;
      const div = document.createElement('div');
      div.className = `term-line-${type}`;
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }
  
    function printOutput(text, type = 'out') {
      if (text === null) return;
      const body = document.getElementById('axion-term-body');
      if (!body) return;
      const div = document.createElement('div');
      div.className = `term-line-${type}`;
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }
  
    /* ══════════════════════════════════════════════
       OPEN / CLOSE
    ══════════════════════════════════════════════ */
    function openTerminal() {
      open = true;
      document.getElementById('axion-terminal').classList.add('open');
      document.getElementById('axion-term-toggle').textContent = '✕ TERMINAL_';
  
      // Show visitor widget
      const vw = document.getElementById('axion-visitor-widget');
      if (vw) vw.classList.add('show');
  
      // Print boot message first time
      const body = document.getElementById('axion-term-body');
      if (body && body.children.length === 0) {
        const boot = lang === 'id'
          ? `AXION TERMINAL v2.0 — SYS://MARCHEL
  ═══════════════════════════════════════════
  Ketik "help" untuk daftar perintah.
  Ketik "lang id" untuk Bahasa Indonesia.
  Tips: coba "matrix", "sudo", "hack", atau kode Konami ↑↑↓↓←→←→BA
  ═══════════════════════════════════════════`
          : `AXION TERMINAL v2.0 — SYS://MARCHEL
  ═══════════════════════════════════════════
  Type "help" for available commands.
  Try: "matrix", "sudo rm -rf /", "hack", or Konami code ↑↑↓↓←→←→BA
  ═══════════════════════════════════════════`;
        printOutput(boot, 'sys');
      }
  
      setTimeout(() => document.getElementById('axion-term-input')?.focus(), 50);
    }
  
    function closeTerminal() {
      open = false;
      document.getElementById('axion-terminal').classList.remove('open');
      document.getElementById('axion-term-toggle').textContent = '> TERMINAL_';
      const vw = document.getElementById('axion-visitor-widget');
      if (vw) vw.classList.remove('show');
    }
  
    function toggleTerminal() {
      open ? closeTerminal() : openTerminal();
    }
  
    /* ══════════════════════════════════════════════
       VISITOR COUNTER (terminal-style)
    ══════════════════════════════════════════════ */
    function initVisitorCounter() {
      fetch('https://api.countapi.xyz/hit/marchel-shevchenko-portfolio/visits')
        .then(r => r.json())
        .then(data => {
          if (data && data.value) {
            visitorCount = data.value;
            // Update terminal widget
            const el = document.getElementById('term-vc');
            if (el) animCount(el, visitorCount);
            // Update footer too
            const footer = document.getElementById('visitor-count');
            if (footer) animCount(footer, visitorCount);
          }
        })
        .catch(() => {
          const el = document.getElementById('term-vc');
          if (el) el.textContent = '--';
        });
    }
  
    function animCount(el, target) {
      let cur = 0;
      const step = Math.ceil(target / 60);
      const iv = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur.toLocaleString();
        if (cur >= target) clearInterval(iv);
      }, 20);
    }
  
    /* ══════════════════════════════════════════════
       GLOBAL KEYBOARD SHORTCUTS
    ══════════════════════════════════════════════ */
    function initKeyboard() {
      document.addEventListener('keydown', e => {
        // Ctrl+` to toggle terminal
        if (e.ctrlKey && e.key === '`') {
          e.preventDefault();
          toggleTerminal();
          return;
        }
        // Konami code (works anywhere)
        checkKonami(e.key);
      });
    }
  
    /* ══════════════════════════════════════════════
       INIT
    ══════════════════════════════════════════════ */
    function init() {
      buildUI();
      initKeyboard();
      initVisitorCounter();
    }
  
    return { init, open: openTerminal, close: closeTerminal, toggle: toggleTerminal, matrix: triggerMatrix, hack: triggerHack };
  
  })();