/* pages/talks.js */
document.addEventListener('DOMContentLoaded', () => {
  Navbar.render();
  Terminal.init();
  Wayang.init();
  Footer.render();
  CRT.init({ clockId: 'nav-clock' });
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));

  // Stats
  document.getElementById('sc-sem').textContent = CV.talks.seminars.length;
  document.getElementById('sc-ws').textContent  = CV.talks.workshops.length;
  document.getElementById('sc-pl').textContent  = CV.talks.publicLectures.length;
  document.getElementById('sc-jm').textContent  = CV.talks.judgeAndMentor.length;

  renderTalkList('tab-seminars',  CV.talks.seminars);
  renderTalkList('tab-workshops', CV.talks.workshops);
  renderTalkList('tab-lectures',  CV.talks.publicLectures);
  renderJudgeMentor('tab-judge',  CV.talks.judgeAndMentor);

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
});

function renderTalkList(containerId, items) {
  const el = document.getElementById(containerId);
  el.innerHTML = items.map(t => `
    <div class="talk-item">
      <span class="talk-year">${t.year}</span>
      <div>
        <div class="talk-title">${t.title}</div>
        <div class="talk-host">${t.host}</div>
      </div>
    </div>`).join('');
}

function renderJudgeMentor(containerId, items) {
  const el = document.getElementById(containerId);
  el.innerHTML = items.map(t => `
    <div class="talk-item ${t.type}">
      <span class="talk-year">${t.year}</span>
      <div>
        <div class="talk-title">
          <span class="badge ${t.type === 'judge' ? 'badge-cyan' : 'badge-green'}" style="margin-right:0.4rem">${t.type.toUpperCase()}</span>
          ${t.title}
        </div>
        <div class="talk-host">${t.host}</div>
      </div>
    </div>`).join('');
}
