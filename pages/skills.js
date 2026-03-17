/* pages/skills.js */
document.addEventListener('DOMContentLoaded', () => {
  Navbar.render();
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
