/* ═══════════════════════════════════════════════════════
   components/navbar.js
   Responsive navbar with retro hamburger drawer on mobile.
   ═══════════════════════════════════════════════════════ */

   const Navbar = (() => {

    const LINKS = [
      { href: 'index.html',      label: '[HOME]'       },
      { href: 'about.html',      label: '[ABOUT]'      },
      { href: 'projects.html',   label: '[PROJECTS]'   },
      { href: 'skills.html',     label: '[SKILLS]'     },
      { href: 'experience.html', label: '[EXPERIENCE]' },
      { href: 'talks.html',      label: '[TALKS]'      },
      { href: 'contact.html',    label: '[CONTACT]'    },
      { href: 'publications.html', label: '[RESEARCH]'  },
      { href: 'chat.html',       label: '[AI_CHAT ▶]'  },
    ];
  
    function render() {
      const linksHTML = LINKS.map(l =>
        `<li><a href="${l.href}" class="nav-link">${l.label}</a></li>`
      ).join('');
  
      const drawerLinksHTML = LINKS.map(l =>
        `<a href="${l.href}" class="nav-link">${l.label}</a>`
      ).join('');
  
      // Navbar
      const nav = document.createElement('nav');
      nav.id = 'navbar';
      nav.innerHTML = `
        <div class="nav-logo">SYS://MARCHEL</div>
        <ul class="nav-links">${linksHTML}</ul>
        <div class="nav-right">
          <span class="nav-status font-mono" style="font-size:0.7rem">ONLINE</span>
          <span class="nav-time" id="nav-clock">--:--:--</span>
          <button class="nav-burger" id="nav-burger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>`;
      document.body.prepend(nav);
  
      // Mobile drawer (separate element, sits below navbar)
      const drawer = document.createElement('div');
      drawer.id = 'nav-drawer';
      drawer.className = 'nav-drawer';
      drawer.innerHTML = `
        ${drawerLinksHTML}
        <div class="nav-drawer-bottom">
          <span class="text-dim">SYS://MARCHEL</span>
          <span class="nav-time" id="nav-clock-mobile">--:--:--</span>
        </div>`;
      document.body.insertBefore(drawer, nav.nextSibling);
  
      // Burger toggle
      const burger = document.getElementById('nav-burger');
      burger.addEventListener('click', () => {
        const open = drawer.classList.toggle('open');
        burger.classList.toggle('open', open);
      });
  
      // Close drawer on link click (handled by transition, but close visually too)
      drawer.querySelectorAll('.nav-link').forEach(a => {
        a.addEventListener('click', () => {
          drawer.classList.remove('open');
          burger.classList.remove('open');
        });
      });
  
      // Close drawer on outside click
      document.addEventListener('click', e => {
        if (!nav.contains(e.target) && !drawer.contains(e.target)) {
          drawer.classList.remove('open');
          burger.classList.remove('open');
        }
      });
  
      // Mark active link (both desktop + drawer)
      const currentFile = location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav-link').forEach(a => {
        const hrefFile = a.getAttribute('href').split('/').pop();
        const isHome  = hrefFile === 'index.html' && (currentFile === 'index.html' || currentFile === '');
        const isMatch = hrefFile !== 'index.html' && hrefFile === currentFile;
        if (isHome || isMatch) a.classList.add('active');
      });
  
      // Clock — sync both desktop and mobile
      const tick = () => {
        const t = new Date().toTimeString().slice(0, 8);
        const d = document.getElementById('nav-clock');
        const m = document.getElementById('nav-clock-mobile');
        if (d) d.textContent = t;
        if (m) m.textContent = t;
      };
      tick(); setInterval(tick, 1000);
    }
  
    return { render };
  })();