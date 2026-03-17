/* ═══════════════════════════════════════════════════════
   pages/chat.js — AXION local AI chat v2
   No API key. Reads directly from cv-data.js.
   Improved: smarter intent, Indonesian support, fuzzy match
   ═══════════════════════════════════════════════════════ */

   document.addEventListener('DOMContentLoaded', () => {
    Navbar.render();
    Footer.render();
    CRT.init({ clockId: 'nav-clock' });
    initChat();
    initSuggestions();
  });
  
  /* ══════════════════════════════════════════════
     INTENT ENGINE
     ══════════════════════════════════════════════ */
  
  function buildResponse(q) {
    const raw    = q.toLowerCase().trim();
    const tokens = raw.split(/\s+/);
    const has    = (...kws) => kws.some(k => raw.includes(k));
  
    // 1. GREETING
    if (has('hello','hi ','hey ','halo','hai ','salam','selamat','good morning','good afternoon','good evening','sup ','yo ')) {
      return `[SYS] Greetings, operator.
  I am AXION — Marchel's AI liaison.
  Ask me anything about his work, projects, skills, or background.
  Type 'help' for a list of topics.`;
    }
  
    // 2. HELP
    if (has('help','bantuan','what can you','apa yang bisa','commands','topics','topik')) {
      return `[HELP] Topics I can answer:
  
    about / profil       — who is Marchel
    projects / proyek    — all ${CV.projects.length} projects
    skills / keahlian    — tech skill scan
    tools / stack        — full tech stack list
    experience / karir   — work history
    education / kuliah   — degrees & schools
    achievements / award — ${CV.achievements.length} awards & grants
    talks / seminar      — public engagements
    workshops            — workshop list
    judge & mentor       — judge/mentor roles
    certifications       — ${CV.certifications.length} certs
    contact / kontak     — how to reach him
    mit / phd / riset    — research background
    nvidia               — NVIDIA grants & certs
    indonesian ai        — Indonesian NLP mission
    data sorcerers       — his company
    stats / ringkasan    — numbers at a glance
    [project name]       — specific project details`;
    }
  
    // 3. WHO / ABOUT
    if (has('who is','siapa','tentang marchel','about marchel','tell me about','ceritakan','profil','profile','bio','describe him','describe marchel','perkenalkan')) {
      return `[INFO] ${CV.summary}
  
    Location : ${CV.location}
    Email    : ${CV.email}
    Focus    : AI for low-resource languages & culture
    Status   : MIT Pre-PhD + Founder @ Data Sorcerers`;
    }
  
    // 4. STATS / OVERVIEW
    if (has('stat','stats','berapa','how many','jumlah','summary','ringkasan','overview','angka')) {
      const total = CV.talks.seminars.length + CV.talks.workshops.length +
                    CV.talks.publicLectures.length + CV.talks.judgeAndMentor.length;
      return `[STATS] Marchel at a glance:
  
    Projects       : ${CV.projects.length}
    Work roles     : ${CV.experience.length}
    Degrees        : ${CV.education.length}
    Achievements   : ${CV.achievements.length}
    Certifications : ${CV.certifications.length}
    Public talks   : ${total}
      Seminars     : ${CV.talks.seminars.length}
      Workshops    : ${CV.talks.workshops.length}
      Lectures     : ${CV.talks.publicLectures.length}
      Judge/Mentor : ${CV.talks.judgeAndMentor.length}
    App users      : 600K+
    NVIDIA grants  : USD 362K+`;
    }
  
    // 5. NVIDIA
    if (has('nvidia')) {
      return `[NVIDIA]
  
    Inception Program    — USD 250K+ Grant for AI Development (2025)
    Deep Learning Grant  — USD 112K+ (IDR 1.8B) Certs Program 2025-2027
    DLI Certifications   — 5x (Healthcare, Medical Imaging, GANs, TF, MedNIST)
    Scholarship Project  — DVH & Radiomic Optimization from IMRT (NVIDIA x UGM)`;
    }
  
    // 6. MIT / PHD / RESEARCH
    if (has('mit','phd','doctoral','riset','research','computational','tesis','thesis','dissertation','cambridge')) {
      const edu = CV.education.find(e => e.school.includes('MIT'));
      return edu
        ? `[RESEARCH]
  
    Degree   : ${edu.degree}
    School   : ${edu.school}, ${edu.location}
    Status   : ${edu.period}
    Focus    : ${edu.focus}`
        : `[INFO] Marchel is pursuing a Pre-PhD at MIT in Computational Science & Engineering.
  Focus: Computer Vision & Computational Optimization.`;
    }
  
    // 7. EDUCATION
    if (has('education','edukasi','school','university','degree','kuliah','studi','study','erasmus','zagreb','utm','uty','pendidikan','sarjana','bachelor','master','doktor','akademik')) {
      const lines = CV.education.map(e =>
        `  ${e.period.padEnd(10)}  ${e.degree}\n              ${e.school}, ${e.location}\n              ${e.focus}`
      );
      return `[EDU] Academic record:\n\n` + lines.join('\n\n');
    }
  
    // 8. SKILLS
    if (has('skill','keahlian','kemampuan','technologies','expertise','bisa apa','what can he do','proficiency')) {
      const bars = CV.skills.map(s => {
        const f = Math.round(s.pct / 10);
        return `  ${s.name.padEnd(30)} [${'█'.repeat(f)}${'░'.repeat(10-f)}] ${s.pct}%`;
      });
      return `[SKILLSCAN] Core competencies:\n\n` + bars.join('\n');
    }
  
    // 9. TOOLS / TECH STACK
    if (has('tool','stack','tech stack','bahasa pemrograman','programming language','framework','library')) {
      const lines = Object.entries(CV.tools).map(([cat, items]) =>
        `  ${cat.padEnd(12)} : ${items.join(', ')}`
      );
      return `[TOOLS] Full tech stack:\n\n` + lines.join('\n');
    }
  
    // 10. INDONESIAN AI / LANGUAGE FOCUS
    if (has('indonesian','bahasa indonesia','nusantara','local language','low resource','low-resource','bahasa daerah','dialek','dialect','budaya','cultural')) {
      return `[MISSION] Marchel's core: AI for Indonesian & low-resource languages.
  
    ARUNA 7B       — Foundation LLM for Indonesian language
    DIALEKTA 2B    — Covers 21 Indonesian dialects
    Arutala v2.2   — Full multimodal LLM + VLM ecosystem
    IndoLLNet v2.1 — CNN-OCR for Nusantara handwritten scripts
    Dialekta v1.0  — 21-persona agent for Indonesian comm styles
    Arutala Aksara — 600K+ users, learning Nusantara scripts`;
    }
  
    // 11. SPECIFIC PROJECT LOOKUP (by id or title)
    const projExact = CV.projects.find(p =>
      raw.includes(p.id.toLowerCase()) ||
      raw.includes(p.title.toLowerCase())
    );
    if (projExact) return fmtProject(projExact);
  
    // 12. PROJECTS LIST / FILTER
    if (has('project','proyek','karya','built','developed','created','what has he made','list project','all project','semua project')) {
      const tagMap = {
        'nlp':'NLP','llm':'LLM','computer vision':'CV',' cv ':'CV','web3':'Web3',
        'audio':'Audio','machine learning':'ML',' ml ':'ML','data':'Data','sys':'Sys','app':'App'
      };
      const matchedTag = Object.entries(tagMap).find(([k]) => raw.includes(k));
      if (matchedTag) {
        const filtered = CV.projects.filter(p => p.tag === matchedTag[1]);
        return `[INFO] ${filtered.length} ${matchedTag[1]} projects:\n\n` +
          filtered.map(p => `  ◆ ${p.title} — ${p.desc.slice(0,70)}...`).join('\n');
      }
      const lines = CV.projects.map(p => `  [${p.tag.padEnd(4)}] ${p.num}  ${p.title}`);
      return `[INFO] ${CV.projects.length} projects on record:\n\n` + lines.join('\n') +
        '\n\n>> Ask about any project by name for details.';
    }
  
    // 13. SPECIFIC COMPANY EXPERIENCE
    const companyKeys = {
      'kalbe':            e => e.company.includes('Kalbe'),
      'twitter':          e => e.company.includes('X Corp'),
      'x corp':           e => e.company.includes('X Corp'),
      'data sorcerers':   e => e.company.includes('Sorcerers'),
      'sorcerers':        e => e.company.includes('Sorcerers'),
      'coding collective':e => e.company.includes('Coding'),
      'nesnf':            e => e.company.includes('NESNF'),
      'teaching':         e => e.role.toLowerCase().includes('teaching'),
      'dosen':            e => e.role.toLowerCase().includes('teaching'),
      'uty':              e => e.company.includes('Yogyakarta'),
    };
    const ck = Object.entries(companyKeys).find(([k]) => raw.includes(k));
    if (ck) {
      const exp = CV.experience.find(ck[1]);
      if (exp) return fmtExperience(exp);
    }
  
    // 14. EXPERIENCE GENERAL
    if (has('experience','pengalaman','kerja','work history','career','karir','job','riwayat','pernah kerja','worked','perusahaan')) {
      const lines = CV.experience.map(e =>
        `  ${e.period.padEnd(22)}  ${e.role} @ ${e.company}`
      );
      return `[EXP] Work history (${CV.experience.length} roles):\n\n` + lines.join('\n') +
        '\n\n>> Ask about a specific company for full details.';
    }
  
    // 15. ACHIEVEMENTS
    if (has('achievement','award','penghargaan','prestasi','prize','winner','juara','grant','ibm','reap','startup pitching','changemaker','ideathon','gdsc','telkom')) {
      const lines = CV.achievements.map(a => `  ${a.year}  ◆ ${a.title}\n         ${a.org}`);
      return `[ACHIEVEMENTS] ${CV.achievements.length} on record:\n\n` + lines.join('\n\n');
    }
  
    // 16. TALKS — JUDGE & MENTOR
    if (has('judge','juri','mentor','mentoring')) {
      return `[JUDGE & MENTOR] ${CV.talks.judgeAndMentor.length} roles:\n\n` +
        CV.talks.judgeAndMentor.map(t =>
          `  [${t.type.toUpperCase().padEnd(6)}] ${t.title}\n           ${t.host} (${t.year})`
        ).join('\n\n');
    }
  
    // 17. TALKS — WORKSHOPS
    if (has('workshop')) {
      return `[WORKSHOPS] ${CV.talks.workshops.length} workshops:\n\n` +
        CV.talks.workshops.map(t =>
          `  ◆ ${t.title}\n    ${t.host} (${t.year})`
        ).join('\n\n');
    }
  
    // 18. TALKS — PUBLIC LECTURES
    if (has('public lecture','kuliah umum','studium generale','guest lecture')) {
      return `[PUBLIC LECTURES] ${CV.talks.publicLectures.length}:\n\n` +
        CV.talks.publicLectures.map(t =>
          `  ◆ ${t.title}\n    ${t.host} (${t.year})`
        ).join('\n\n');
    }
  
    // 19. TALKS — GENERAL / SEMINARS
    if (has('talk','talks','seminar','speaker','ngomong','presentasi','bicara','lecture','outreach','invited','undangan','public speaking')) {
      const total = CV.talks.seminars.length + CV.talks.workshops.length +
                    CV.talks.publicLectures.length + CV.talks.judgeAndMentor.length;
      const recent = CV.talks.seminars.slice(0, 6).map(t =>
        `  ◆ "${t.title}"\n    ${t.host} (${t.year})`
      );
      return `[TALKS] ${total} public engagements total:
    Seminars ${CV.talks.seminars.length} · Workshops ${CV.talks.workshops.length} · Lectures ${CV.talks.publicLectures.length} · Judge/Mentor ${CV.talks.judgeAndMentor.length}
  
  Recent seminars:\n\n` + recent.join('\n\n') +
        `\n\n>> ${CV.talks.seminars.length - 6} more — see talks.html`;
    }
  
    // 20. CERTIFICATIONS
    if (has('cert','sertifikat','certification','lisensi','license')) {
      const lines = CV.certifications.map(c =>
        `  ${c.year}  ${c.title}\n         ${c.org}`
      );
      return `[CERTS] ${CV.certifications.length} certifications:\n\n` + lines.join('\n\n');
    }
  
    // 21. CONTACT
    if (has('contact','kontak','email','reach','hire','collab','collaboration','hubungi','rekrut','recruit','work with','get in touch')) {
      return `[CONTACT]
  
    EMAIL    : ${CV.email}
    PHONE    : ${CV.phone}
    LOCATION : ${CV.location}
  
  >> Go to contact.html to send a message directly.`;
    }
  
    // 22. DATA SORCERERS
    if (has('data sorcerer','sorcerer','startup','founder','ceo','organisasi')) {
      const exp = CV.experience.find(e => e.company.includes('Sorcerers'));
      return exp ? fmtExperience(exp) :
        '[INFO] Data Sorcerers is Marchel\'s IT consulting org.\nFocus: AI for Culture, Healthcare & Wellness. 10 divisions, 20+ projects.';
    }
  
    // 23. CYBERSECURITY
    if (has('cyber','security','hacker','hacking','ddos','red team','blue team','nesnf','malware','keamanan siber','ctf')) {
      const exp = CV.experience.find(e => e.company.includes('NESNF'));
      return exp ? fmtExperience(exp) :
        `[INFO] Marchel co-founded NESNF cybersecurity team (2014–2017).
  Covered: DDoS simulation, defacement, malware analysis, red/blue team strategy.
  Current: speaks on AI-powered cybersecurity for red & blue team engineering.`;
    }
  
    // ── DEEP FUZZY FALLBACKS ──────────────────────────────
  
    // Project desc/stack fuzzy
    const longTokens = tokens.filter(w => w.length > 3);
    const projFuzzy = CV.projects.find(p => {
      const hay = (p.title + ' ' + p.desc + ' ' + p.stack.join(' ')).toLowerCase();
      return longTokens.some(k => hay.includes(k));
    });
    if (projFuzzy) return fmtProject(projFuzzy);
  
    // Experience fuzzy
    const expFuzzy = CV.experience.find(e => {
      const hay = (e.role + ' ' + e.company + ' ' + e.desc + ' ' + e.tags.join(' ')).toLowerCase();
      return longTokens.some(k => hay.includes(k));
    });
    if (expFuzzy) return fmtExperience(expFuzzy);
  
    // Talk title fuzzy
    const allTalks = [...CV.talks.seminars, ...CV.talks.workshops, ...CV.talks.publicLectures];
    const talkFuzzy = allTalks.find(t =>
      longTokens.some(k => t.title.toLowerCase().includes(k))
    );
    if (talkFuzzy) {
      return `[TALK] "${talkFuzzy.title}"\nHost : ${talkFuzzy.host}\nYear : ${talkFuzzy.year}`;
    }
  
    // Achievement fuzzy
    const achFuzzy = CV.achievements.find(a =>
      longTokens.some(k => a.title.toLowerCase().includes(k) || a.org.toLowerCase().includes(k))
    );
    if (achFuzzy) {
      return `[ACHIEVEMENT] ${achFuzzy.year}\n${achFuzzy.title}\n${achFuzzy.org}`;
    }
  
    // Final fallback
    return `[AXION] Couldn't map: "${q}"
  
  Try asking about:
    about · projects · skills · experience · education
    achievements · talks · contact · nvidia · mit/phd
    indonesian ai · data sorcerers · cybersecurity · stats
  
  Or name a specific project: "ARUNA 7B", "Arutala Aksara", "MANDALA", "SABDARANA"...`;
  }
  
  /* ── FORMATTERS ── */
  function fmtProject(p) {
    return `[PROJECT] ${p.title}  [${p.tag}]
  
  ${p.desc}
  
  Stack : ${p.stack.join(', ')}
  Event : ${p.event}
  Year  : ${p.year}`;
  }
  
  function fmtExperience(e) {
    return `[EXP] ${e.role}
  
  Company  : ${e.company}
  Location : ${e.location}
  Period   : ${e.period}
  
  ${e.desc}
  
  Tags: ${e.tags.join(', ')}`;
  }
  
  /* ══════════════════════════════════════════════
     CHAT UI
     ══════════════════════════════════════════════ */
  
  function initChat() {
    const input   = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  }
  
  function initSuggestions() {
    document.querySelectorAll('.sug-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('chat-input').value = btn.textContent.trim();
        sendMessage();
      });
    });
  }
  
  function sendMessage() {
    const input = document.getElementById('chat-input');
    const text  = input.value.trim();
    if (!text) return;
    input.value = '';
    appendMessage('user', text);
    setStatus('THINKING...', true);
    const tid = showTyping();
    setTimeout(() => {
      removeTyping(tid);
      appendMessage('ai', buildResponse(text));
      setStatus('READY', false);
    }, 350 + Math.random() * 350);
  }
  
  function appendMessage(role, text) {
    const c   = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `msg msg-${role}`;
    if (role === 'user') {
      div.innerHTML = `<div class="msg-prefix">you@terminal:~$</div><div class="msg-body">${escHtml(text)}</div>`;
    } else if (role === 'ai') {
      div.innerHTML = `<div class="msg-prefix">AXION@sys:~$</div><div class="msg-body">${escHtml(text)}</div>`;
    } else {
      div.innerHTML = `<div class="msg-body">${escHtml(text)}</div>`;
    }
    c.appendChild(div);
    c.scrollTop = c.scrollHeight;
  }
  
  function showTyping() {
    const c   = document.getElementById('chat-messages');
    const div = document.createElement('div');
    const id  = 'typing-' + Date.now();
    div.id = id; div.className = 'msg msg-ai';
    div.innerHTML = `<div class="msg-prefix">AXION@sys:~$</div><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
    c.appendChild(div); c.scrollTop = c.scrollHeight;
    return id;
  }
  
  function removeTyping(id) { document.getElementById(id)?.remove(); }
  
  function setStatus(text, thinking) {
    const el = document.getElementById('chat-status');
    if (!el) return;
    el.textContent = text;
    el.className = 'chat-status' + (thinking ? ' thinking' : '');
  }
  
  function escHtml(str) {
    return str
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/\n/g,'<br>');
  }