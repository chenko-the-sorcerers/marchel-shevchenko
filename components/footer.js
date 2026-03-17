/* ═══════════════════════════════════════════════════════
   components/footer.js
   Footer with visitor analytics counter via countapi.xyz
   ═══════════════════════════════════════════════════════ */

   const Footer = (() => {
    function render() {
      const ft = document.createElement('footer');
      ft.id = 'footer';
      ft.innerHTML = `
        <span class="footer-logo">SYS://MARCHEL</span>
        <span class="footer-center">── CRAFTED_IN_CYBERSPACE ──</span>
        <span class="footer-right">
          © <span id="footer-year"></span>
          &nbsp;|&nbsp;
          <span class="text-dim">VISITORS:</span>
          <span class="text-green" id="visitor-count" style="margin-left:0.3rem">...</span>
          &nbsp;|&nbsp;
          <span class="text-green">v1.0.0</span>
        </span>`;
      document.body.appendChild(ft);
      document.getElementById('footer-year').textContent = new Date().getFullYear();
      fetchVisitorCount();
    }
  
    function fetchVisitorCount() {
      // countapi.xyz — free, no auth, persists across visits
      // namespace: marchel-portfolio, key: visitors
      fetch('https://api.countapi.xyz/hit/marchel-shevchenko-portfolio/visits')
        .then(r => r.json())
        .then(data => {
          const el = document.getElementById('visitor-count');
          if (el && data.value) {
            animateCount(el, data.value);
          }
        })
        .catch(() => {
          const el = document.getElementById('visitor-count');
          if (el) el.textContent = '--';
        });
    }
  
    function animateCount(el, target) {
      const duration = 1200;
      const step = 16;
      const inc = target / (duration / step);
      let cur = 0;
      const iv = setInterval(() => {
        cur = Math.min(cur + inc, target);
        el.textContent = Math.floor(cur).toLocaleString();
        if (cur >= target) clearInterval(iv);
      }, step);
    }
  
    return { render };
  })();