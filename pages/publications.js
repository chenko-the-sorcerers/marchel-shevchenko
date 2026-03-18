/* pages/publications.js */

/* ── PUBLICATIONS DATA ──
   Derived from CV projects, talks, and achievements.
   Format: real-world academic/technical publication style. */
   const PUBS = [
    {
      type: 'conference',
      year: 2025,
      title: 'Concurrency-Aware Python Data Pipelines: Benchmarking Threading, Multiprocessing and Asynchronous Execution in Large-Scale ML Models',
      authors: ['Marchel A. Shevchenko'],
      venue: 'PyCon Indonesia 2025',
      tags: ['Python', 'Concurrency', 'MLOps', 'Benchmarking'],
      intl: false,
    },
    {
      type: 'conference',
      year: 2025,
      title: 'SABDARANA: A Web3 & NFT-Based Cultural Learn-to-Earn Application for Indonesian Heritage Preservation',
      authors: ['Marchel A. Shevchenko'],
      venue: 'Garuda Hacks 2025',
      tags: ['Web3', 'NFT', 'Cultural AI', 'EdTech'],
      intl: false,
    },
    {
      type: 'conference',
      year: 2025,
      title: 'MANDALA: Monitoring Safety and Railway Navigation System Using Computer Vision',
      authors: ['Marchel A. Shevchenko'],
      venue: 'Presented to PT. KAI (Indonesia Railway Company), 2025',
      tags: ['Computer Vision', 'Safety', 'Railway', 'Real-time'],
      intl: false,
    },
    {
      type: 'conference',
      year: 2024,
      title: 'Neural Soundscapes: Audio Restoration for Reconstructing and Composing Traditional Instruments of the Yogyakarta Palace Guard',
      authors: ['Marchel A. Shevchenko'],
      venue: 'Javanese Cultural Symposium 2024',
      tags: ['Audio ML', 'Cultural Preservation', 'Neural Network'],
      intl: false,
    },
    {
      type: 'conference',
      year: 2024,
      title: 'Construction Safety Equipment and Helmet Color Multi-task Classification Based on ResNet-15',
      authors: ['Marchel A. Shevchenko'],
      venue: 'PyCon Indonesia 2024',
      tags: ['Computer Vision', 'Multi-task Learning', 'Safety'],
      intl: false,
    },
    {
      type: 'conference',
      year: 2024,
      title: 'IndoLLNet: A Novel Convolutional Neural Network for Indonesian Indigenous Script Handwritten Character Recognition',
      authors: ['Marchel A. Shevchenko'],
      venue: 'Sorcery Gathering 4.0 & 5.0',
      tags: ['CNN', 'OCR', 'Indonesian NLP', 'Nusantara Scripts'],
      intl: false,
    },
    {
      type: 'journal',
      year: 2023,
      title: 'Machine Learning-Driven Drug Recommendation System in Healthcare: A Case Study of the BIOBOT Framework in a Multilingual Environment',
      authors: ['Marchel A. Shevchenko'],
      venue: '8th International Conference on Pharmacy & Advanced Pharmaceutical Sciences (ICPAPS 2023)',
      tags: ['ML', 'Healthcare', 'NLP', 'Drug Recommendation'],
      intl: true,
    },
    {
      type: 'conference',
      year: 2023,
      title: 'Health Consultation Chatbot Development Using LSTM and BERT',
      authors: ['Marchel A. Shevchenko'],
      venue: 'Final Thesis Defence & MIT Hacking Medicine 2023',
      tags: ['LSTM', 'BERT', 'NLP', 'Healthcare'],
      intl: true,
    },
    {
      type: 'conference',
      year: 2023,
      title: 'KERTI KAWISTA: Construction Site Presence App with Facial Recognition for Attendance, Safety Gear Validation, and Real-time CCTV Monitoring',
      authors: ['Marchel A. Shevchenko'],
      venue: 'Garuda Hacks 2023',
      tags: ['Face Recognition', 'Computer Vision', 'Safety'],
      intl: false,
    },
    {
      type: 'workshop',
      year: 2023,
      title: '2nd Place: Upstream: Pharmaceutical and Biotechnology — Biofarma × MIT Hacking Medicine',
      authors: ['Marchel A. Shevchenko'],
      venue: 'MIT Hacking Medicine 2023 — Biofarma × MIT',
      tags: ['Healthcare AI', 'Biotech', 'MIT'],
      intl: true,
    },
    {
      type: 'conference',
      year: 2022,
      title: 'Analyzing Route Data Correlation to Maintain Agriculture Distribution Partnership for Sub-Districts in Magelang Regency, Central Java, for Food Security',
      authors: ['Marchel A. Shevchenko'],
      venue: 'UNSD International Conference on Big Data and Data Science for Official Statistics 2022 — United Nations, New York',
      tags: ['Big Data', 'GIS', 'Food Security', 'UN'],
      intl: true,
    },
    {
      type: 'thesis',
      year: 2021,
      title: 'Optimizing DVH and Radiomic Evaluation from IMRT with Neural Network Approach',
      authors: ['Marchel A. Shevchenko'],
      venue: 'Final Project — NVIDIA × UGM Deep Learning for Healthcare Scholarship',
      tags: ['Medical Imaging', 'Neural Network', 'IMRT', 'NVIDIA'],
      intl: false,
    },
    {
      type: 'conference',
      year: 2022,
      title: 'Automatic Feeding System Based on Cat Face Recognition Using Feature Extraction Pyramid HOG and K-Nearest Neighbor',
      authors: ['Marchel A. Shevchenko'],
      venue: 'Final Capstone Project — University of Technology Yogyakarta',
      tags: ['Face Recognition', 'HOG', 'KNN', 'Computer Vision'],
      intl: false,
    },
    {
      type: 'conference',
      year: 2022,
      title: 'Dota 2 Game Results Classification with Multilayer Perceptron',
      authors: ['Marchel A. Shevchenko'],
      venue: 'Final Capstone Project — University of Technology Yogyakarta',
      tags: ['MLP', 'Classification', 'Game Analytics'],
      intl: false,
    },
  ];
  
  const TYPE_LABELS = { conference:'CONFERENCE', journal:'JOURNAL', workshop:'WORKSHOP / AWARD', thesis:'THESIS / PROJECT' };
  
  document.addEventListener('DOMContentLoaded', () => {
    Navbar.render();
  Terminal.init();
  Wayang.init();
    Footer.render();
    CRT.init({ clockId: 'nav-clock' });
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  
    // Stats
    const intl  = PUBS.filter(p => p.intl).length;
    const years = new Set(PUBS.map(p => p.year)).size;
    animCount('ps-total', PUBS.length);
    animCount('ps-conf',  PUBS.filter(p => p.type === 'conference').length);
    animCount('ps-intl',  intl);
    animCount('ps-years', years);
  
    // Filters
    const types = ['ALL', ...new Set(PUBS.map(p => p.type))];
    const filterEl = document.getElementById('pub-filter');
    types.forEach(type => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (type === 'ALL' ? ' active' : '');
      btn.textContent = type === 'ALL' ? 'ALL' : TYPE_LABELS[type] || type.toUpperCase();
      btn.dataset.type = type;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterPubs(type);
      });
      filterEl.appendChild(btn);
    });
  
    renderPubs(PUBS);
  });
  
  function filterPubs(type) {
    const filtered = type === 'ALL' ? PUBS : PUBS.filter(p => p.type === type);
    document.getElementById('pub-grid').innerHTML = '';
    renderPubs(filtered);
  }
  
  function renderPubs(list) {
    const grid = document.getElementById('pub-grid');
    list.forEach((pub, i) => {
      const card = document.createElement('div');
      card.className = 'pub-card reveal';
      card.style.transitionDelay = (i * 0.05) + 's';
      const authorsHtml = pub.authors
        .map(a => a.includes('Marchel') ? `<span class="me">${a}</span>` : a)
        .join(', ');
      card.innerHTML = `
        <div class="pub-head">
          <span class="pub-type ${pub.type}">${TYPE_LABELS[pub.type] || pub.type.toUpperCase()}</span>
          <span class="pub-year">${pub.year}</span>
          ${pub.intl ? '<span class="badge badge-amber" style="font-size:0.65rem;">🌐 INTERNATIONAL</span>' : ''}
        </div>
        <div class="pub-body">
          <div class="pub-title">${pub.title}</div>
          <div class="pub-authors">${authorsHtml}</div>
          <div class="pub-venue">${pub.venue}</div>
          <div class="pub-tags">${pub.tags.map(t => `<span class="badge badge-dim">${t}</span>`).join('')}</div>
        </div>`;
      grid.appendChild(card);
    });
    setTimeout(() => grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')), 40);
  }
  
  function animCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let cur = 0;
    const iv = setInterval(() => {
      cur = Math.min(cur + Math.ceil(target/30), target);
      el.textContent = cur;
      if (cur >= target) clearInterval(iv);
    }, 30);
  }