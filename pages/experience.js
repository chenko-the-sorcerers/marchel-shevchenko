/* pages/experience.js */
document.addEventListener('DOMContentLoaded', () => {
  Navbar.render();
  Footer.render();
  CRT.init({ clockId: 'nav-clock' });
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  renderTimeline();
});

function renderTimeline() {
  const el = document.getElementById('timeline');

  CV.experience.forEach((exp, i) => {
    const isCurrent = exp.period.toLowerCase().includes('present');

    // Parse start year from period string e.g. "Jul 2025 – Nov 2025" or "Apr 2024 – Present"
    const yearMatch = exp.period.match(/(\d{4})/g);
    const startYear = yearMatch ? yearMatch[0] : '';
    const endYear   = isCurrent ? 'NOW' : (yearMatch && yearMatch[1] ? yearMatch[1] : '');

    const item = document.createElement('div');
    item.className = `tl-item reveal${isCurrent ? ' current' : ''}`;
    item.style.transitionDelay = (i * 0.1) + 's';

    item.innerHTML = `
      <div class="tl-year-col">
        <span class="tl-year">${startYear}</span>
        <span class="tl-year-end">${endYear}</span>
      </div>
      <div class="tl-dot"></div>
      <div class="tl-connector"></div>
      <div class="tl-card">
        <div class="tl-role">
          ${exp.role}
          ${isCurrent ? '<span class="tl-badge-now">● ACTIVE</span>' : ''}
        </div>
        <div class="tl-company">${exp.company}</div>
        <div class="tl-location">📍 ${exp.location} &nbsp;·&nbsp; ${exp.period}</div>
        <div class="tl-desc">${exp.desc}</div>
        <div class="tl-tags">${exp.tags.map(t => `<span class="badge badge-green">${t}</span>`).join('')}</div>
      </div>`;

    el.appendChild(item);
  });

  setTimeout(() => {
    el.querySelectorAll('.reveal').forEach(e => e.classList.add('visible'));
  }, 60);
}