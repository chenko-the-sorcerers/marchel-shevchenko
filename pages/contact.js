/* pages/contact.js */
document.addEventListener('DOMContentLoaded', () => {
  Navbar.render();
  Terminal.init();
  Wayang.init();
  Footer.render();
  CRT.init({ clockId: 'nav-clock' });
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  initForm();
  initTerminal();
});

/* ── CONTACT FORM ── */
function initForm() {
  document.getElementById('cf-send').addEventListener('click', () => {
    const name    = document.getElementById('cf-name').value.trim();
    const email   = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    const status  = document.getElementById('form-status');
    const btn     = document.getElementById('cf-send');

    if (!name || !email || !message) {
      status.className = 'form-status err';
      status.textContent = '>> ERROR: ALL FIELDS REQUIRED';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'TRANSMITTING...';
    status.className = 'form-status';

    let dots = 0;
    const iv = setInterval(() => {
      dots = (dots + 1) % 4;
      status.textContent = '>> ENCODING PACKET' + '.'.repeat(dots);
    }, 280);

    setTimeout(() => {
      clearInterval(iv);
      btn.disabled = false;
      btn.textContent = 'TRANSMIT MESSAGE →';
      status.className = 'form-status ok';
      status.textContent = '>> TRANSMISSION SUCCESSFUL. MESSAGE DELIVERED.';
      document.getElementById('cf-name').value = '';
      document.getElementById('cf-email').value = '';
      document.getElementById('cf-message').value = '';
    }, 2200);
  });
}

/* ── MINI TERMINAL ── */
const TERM_CMDS = {
  help: () => [
    { t: 'resp', v: 'AVAILABLE COMMANDS:' },
    { t: 'resp', v: '  help       — show this list' },
    { t: 'resp', v: '  about      — who is Marchel' },
    { t: 'resp', v: '  skills     — top skills list' },
    { t: 'resp', v: '  projects   — recent projects' },
    { t: 'resp', v: '  contact    — contact info' },
    { t: 'resp', v: '  whoami     — operator identity' },
    { t: 'resp', v: '  date       — current timestamp' },
    { t: 'resp', v: '  clear      — clear terminal' },
    { t: 'resp', v: '  sudo love  — ❤' },
  ],
  about: () => [
    { t: 'resp', v: CV.summary.slice(0, 120) + '...' },
  ],
  skills: () => CV.skills.slice(0, 5).map(s => ({
    t: 'resp', v: `  ${s.name.padEnd(30)} ${s.pct}%`
  })),
  projects: () => CV.projects.slice(0, 4).map(p => ({
    t: 'resp', v: `  [${p.tag}] ${p.title}`
  })),
  contact: () => [
    { t: 'ok',   v: `EMAIL:    ${CV.email}` },
    { t: 'resp', v: 'GITHUB:   github.com/marchel-shevchenko' },
    { t: 'resp', v: 'LOCATION: Yogyakarta, Indonesia' },
  ],
  whoami: () => [
    { t: 'ok',   v: `OPERATOR: ${CV.fullName}` },
    { t: 'resp', v: 'CLEARANCE: ALPHA-7' },
    { t: 'resp', v: 'AFFILIATION: MIT REAP / Data Sorcerers / NVIDIA Inception' },
  ],
  date: () => [{ t: 'resp', v: new Date().toString() }],
  'sudo love': () => [
    { t: 'ok', v: 'Permission granted ❤' },
    { t: 'resp', v: 'All systems nominal.' },
  ],
  clear: () => '__CLEAR__',
};

function initTerminal() {
  const input  = document.getElementById('mt-input');
  const output = document.getElementById('mt-output');
  if (!input || !output) return;

  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const raw = input.value.trim().toLowerCase();
    input.value = '';
    if (!raw) return;

    addLine(output, raw, 'cmd', '$> ');

    const handler = TERM_CMDS[raw];
    if (!handler) {
      addLine(output, `command not found: ${raw}. Type 'help'.`, 'err');
    } else {
      const result = handler();
      if (result === '__CLEAR__') { output.innerHTML = ''; return; }
      result.forEach(r => addLine(output, r.v, r.t));
    }
    output.scrollTop = output.scrollHeight;
  });
}

function addLine(container, text, cls, prefix = '') {
  const div = document.createElement('div');
  div.className = `mt-line ${cls}`;
  div.textContent = prefix + text;
  container.appendChild(div);
}
