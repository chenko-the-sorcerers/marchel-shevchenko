/* pages/skills.js */
document.addEventListener('DOMContentLoaded', () => {
  Navbar.render();
  Terminal.init();
  Wayang.init();
  Footer.render();
  CRT.init({ clockId: 'nav-clock' });
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  renderSkillBars();
  renderToolTree();
  renderCerts();
  renderAchievements();
});

function renderSkillBars() {
  const el = document.getElementById('skill-bars');
  CV.skills.forEach(s => {
    const div = document.createElement('div');
    div.className = 'skill-item';
    div.innerHTML = `
      <div class="skill-label-row">
        <span class="skill-name">${s.name}</span>
        <span class="skill-pct">${s.pct}%</span>
      </div>
      <div class="skill-track">
        <div class="skill-fill ${s.color}" data-pct="${s.pct}"></div>
      </div>`;
    el.appendChild(div);
  });
  // Animate bars after a tick so CSS transition fires
  requestAnimationFrame(() => requestAnimationFrame(() => CRT.animateSkillBars()));
}

function renderToolTree() {
  const el = document.getElementById('tool-tree');
  let html = '';
  for (const [cat, tools] of Object.entries(CV.tools)) {
    html += `<div class="tool-category">▶ ${cat}</div>`;
    tools.forEach(t => { html += `<div class="tool-item">${t}</div>`; });
  }
  el.innerHTML = html;
}

function renderCerts() {
  const el = document.getElementById('cert-list');
  el.innerHTML = CV.certifications.map(c => `
    <div class="cert-item">
      <span class="cert-year">${c.year}</span>
      <div>
        <div class="cert-title">${c.title}</div>
        <div class="cert-org">${c.org}</div>
      </div>
    </div>`).join('');
}

function renderAchievements() {
  const el = document.getElementById('ach-list');
  el.innerHTML = CV.achievements.map(a => `
    <div class="ach-item">
      <span class="ach-year">${a.year}</span>
      <div>
        <div class="ach-title">${a.title}</div>
        <div class="ach-org">${a.org}</div>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════════════════════════════
   SKILL CHALLENGE — Guess the tech stack from project desc
   ══════════════════════════════════════════════════════ */

function initSkillChallenge() {
  const wrap = document.getElementById('skill-challenge');
  if (!wrap) return;

  const QUESTIONS = CV.projects.map(p => ({
    title: p.title,
    desc:  p.desc,
    stack: p.stack,
    tag:   p.tag,
    event: p.event,
  })).filter(p => p.stack.length >= 2);

  let qIdx = 0, score = 0, streak = 0, total = 0;
  let shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  let answered = false;

  function getQuestion() {
    return shuffled[qIdx % shuffled.length];
  }

  function getOptions(correct) {
    // Pool all unique stack items
    const allItems = [...new Set(CV.projects.flatMap(p => p.stack))];
    // Pick 3 wrong options
    const wrong = allItems
      .filter(i => !correct.includes(i))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    // Pick 1 correct
    const correctPick = correct[Math.floor(Math.random() * correct.length)];
    // Mix
    const opts = [correctPick, ...wrong].sort(() => Math.random() - 0.5);
    return { opts, correctPick };
  }

  function render() {
    const q = getQuestion();
    const { opts, correctPick } = getOptions(q.stack);
    answered = false;

    wrap.innerHTML = `
      <div class="ch-header">
        <span class="ch-label">SKILL CHALLENGE</span>
        <span class="ch-score">SCORE: <span id="ch-score">${score}</span> &nbsp;|&nbsp; STREAK: <span id="ch-streak">${streak}</span></span>
      </div>
      <div class="ch-body">
        <div class="ch-q-label">Which tech was used in this project?</div>
        <div class="ch-desc">${q.desc}</div>
        <div class="ch-tag">[${q.tag}] &nbsp;·&nbsp; ${q.event}</div>
        <div class="ch-opts" id="ch-opts">
          ${opts.map(o => `<button class="ch-btn" data-val="${o}">${o}</button>`).join('')}
        </div>
        <div class="ch-feedback" id="ch-feedback"></div>
        <button class="ch-next btn btn-ghost" id="ch-next" style="display:none;margin-top:0.8rem">NEXT QUESTION →</button>
      </div>
      <div class="ch-footer">
        Q${(qIdx % shuffled.length) + 1} / ${shuffled.length} &nbsp;|&nbsp;
        Correct answer is one of: <span style="color:var(--cyan)">${q.stack.join(', ')}</span>
      </div>`;

    wrap.querySelectorAll('.ch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        total++;
        const val = btn.dataset.val;
        const isCorrect = q.stack.includes(val);
        const fb = wrap.querySelector('#ch-feedback');
        const nextBtn = wrap.querySelector('#ch-next');

        if (isCorrect) {
          score += 10 + streak * 2;
          streak++;
          btn.classList.add('ch-correct');
          fb.innerHTML = `<span class="g-ok">✓ CORRECT! +${10 + (streak-1)*2} pts ${streak > 1 ? '🔥 x'+streak+' streak' : ''}</span>`;
        } else {
          streak = 0;
          btn.classList.add('ch-wrong');
          // Highlight a correct one
          wrap.querySelectorAll('.ch-btn').forEach(b => {
            if (q.stack.includes(b.dataset.val)) b.classList.add('ch-correct');
          });
          fb.innerHTML = `<span class="g-err">✗ Wrong. "${val}" is not in this project's stack.</span>`;
        }

        wrap.querySelector('#ch-score').textContent = score;
        wrap.querySelector('#ch-streak').textContent = streak;
        nextBtn.style.display = 'inline-flex';
        nextBtn.addEventListener('click', () => { qIdx++; render(); });
      });
    });
  }

  render();
}

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Small delay so CV is loaded
  setTimeout(initSkillChallenge, 100);
});