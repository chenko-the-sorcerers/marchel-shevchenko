/* pages/projects.js */
document.addEventListener('DOMContentLoaded', () => {
  Navbar.render();
  Terminal.init();
  Wayang.init();
  Footer.render();
  CRT.init({ clockId: 'nav-clock' });
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  renderProjects();
  initFilters();
});

const COLOR_MAP = { green: 'badge-green', amber: 'badge-amber', cyan: 'badge-cyan' };

function renderProjects() {
  const grid = document.getElementById('projects-grid');
  CV.projects.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'proj-card reveal';
    card.dataset.tag = p.tag;
    card.style.transitionDelay = (i * 0.04) + 's';
    const viewBtn = p.href
      ? `<a href="${p.href}" class="proj-link" style="display:inline-flex;align-items:center;gap:.3rem;font-family:var(--font-pixel);font-size:.4rem;color:var(--green);border:1px solid var(--green-dark);padding:.2rem .5rem;margin-top:.5rem;letter-spacing:.06em;transition:all .2s;background:rgba(0,255,65,.04)">VIEW ▶</a>`
      : '';
    card.innerHTML = `
      <div class="proj-head">
        <span class="proj-num">// ${p.num}</span>
        <span class="badge ${COLOR_MAP[p.color] || 'badge-dim'}">${p.tag}</span>
      </div>
      <div class="proj-body">
        <div class="proj-title">${p.title}</div>
        <div class="proj-desc">${p.desc}</div>
        <div class="proj-stack">${p.stack.map(t => `<span class="badge badge-dim">${t}</span>`).join('')}</div>
        <div class="proj-footer"><span class="event">${p.event}</span> &nbsp;·&nbsp; ${p.year}</div>
        ${viewBtn}
      </div>`;
    card.addEventListener('mouseenter', () => {
      const t = card.querySelector('.proj-title');
      t.classList.remove('glitch'); void t.offsetWidth; t.classList.add('glitch');
    });
    grid.appendChild(card);
  });
  setTimeout(() => grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')), 50);
  updateCount();
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tag = btn.dataset.tag;
      document.querySelectorAll('.proj-card').forEach(card => {
        card.classList.toggle('hidden', tag !== 'ALL' && card.dataset.tag !== tag);
      });
      updateCount();
    });
  });
}

function updateCount() {
  const visible = document.querySelectorAll('.proj-card:not(.hidden)').length;
  const el = document.getElementById('proj-count');
  if (el) el.textContent = visible;
}