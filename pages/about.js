/* pages/about.js */
    document.addEventListener('DOMContentLoaded', () => {
      Navbar.render();
  Terminal.init();
  Wayang.init();
      Footer.render();
      CRT.init({ clockId: 'nav-clock' });

      // Bio text
      document.getElementById('bio-text').textContent = CV.summary;

      // Tech badges
      const tags = ['Python','PyTorch','LLM','Computer Vision','NLP','Multimodal','MLOps','Bioinformatics'];
      document.getElementById('tag-badges').innerHTML =
        tags.map(t => `<span class="badge badge-green">${t}</span>`).join('');

      // Skill quick list
      const topSkills = CV.skills.slice(0,6).map(s => s.name.split(' ')[0]);
      document.getElementById('skill-badges').innerHTML =
        topSkills.map(t => `<span class="badge badge-dim">${t}</span>`).join('');

      // Education
      const eduEl = document.getElementById('edu-list');
      CV.education.forEach((e, i) => {
        const div = document.createElement('div');
        div.className = 'edu-item reveal';
        div.style.transitionDelay = (i * 0.08) + 's';
        div.innerHTML = `
          <div class="edu-year">${e.period}</div>
          <div>
            <div class="edu-degree">${e.degree}</div>
            <div class="edu-school">${e.school} — ${e.location}</div>
            <div class="edu-focus">${e.focus}</div>
          </div>`;
        eduEl.appendChild(div);
      });

      // Counters on visible
      CRT.onVisible(document.querySelector('.stat-row'), () => {
        document.querySelectorAll('.counter').forEach(el => {
          CRT.animateCounter(el, parseInt(el.dataset.target), 1400);
        });
      });

      // Uptime
      const start = Date.now();
      setInterval(() => {
        const s = Math.floor((Date.now()-start)/1000);
        const hh = String(Math.floor(s/3600)).padStart(2,'0');
        const mm = String(Math.floor((s%3600)/60)).padStart(2,'0');
        const ss = String(s%60).padStart(2,'0');
        document.getElementById('uptime').textContent = `${hh}:${mm}:${ss}`;
      }, 1000);

      // Trigger reveals
      setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      }, 50);
    });
