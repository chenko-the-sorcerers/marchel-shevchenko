/* pages/home.js */
document.addEventListener('DOMContentLoaded', () => {
  Navbar.render();
  Footer.render();
  CRT.init({ clockId: 'nav-clock' });
  Boot.run(() => requestAnimationFrame(() => requestAnimationFrame(initPage)));
});

function initPage() {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  initCanvas();
  initHeroTyping();
  initStats();
  renderFeatured();
}

/* ══════════════════════════════════════════════════
   SEMANTIC LANGUAGE PARTICLE NETWORK
   Nodes = language tokens, edges = semantic proximity
   ══════════════════════════════════════════════════ */
function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ── SEMANTIC TOKEN CLUSTERS ── */
  /* Each cluster = a semantic group. Tokens within same cluster
     have HIGH connection weight (bright edges).
     Tokens across clusters have LOW weight (dim edges). */
  const CLUSTERS = [
    {
      name: 'model',
      color: [0, 255, 65],   // green — core AI
      tokens: [
        'LLM','Transformer','ARUNA','DIALEKTA','Embedding',
        'Attention','Token','Encoder','Decoder','Softmax',
        'Fine-tune','LoRA','GGUF','ONNX','Inference',
        'Prompt','Context','Logit','Perplexity','RLHF',
      ],
    },
    {
      name: 'language',
      color: [0, 229, 255],  // cyan — Indonesian NLP
      tokens: [
        'Nusantara','Aksara','Dialek','Bahasa','Corpus',
        'Tokenizer','BPE','Morfologi','Translasi','Dialekta',
        'Javanese','Sundanese','Batak','Bugis','Minang',
        'Low-resource','IndoLLNet','SABDA','Script','Unicode',
      ],
    },
    {
      name: 'vision',
      color: [255, 179, 0],  // amber — computer vision
      tokens: [
        'CNN','ResNet','OCR','YOLO','Segmentation',
        'Bounding Box','Feature Map','Convolution','Pooling','Backbone',
        'Anchor','Detection','Keypoint','Depth','Stereo',
        'CCTV','Heatmap','Activation','Stride','Padding',
      ],
    },
    {
      name: 'infra',
      color: [180, 100, 255], // purple — MLOps/infra
      tokens: [
        'CUDA','GPU','Docker','MLOps','Pipeline',
        'Airflow','gRPC','Kubernetes','Triton','TensorRT',
        'Batch','Streaming','Latency','Throughput','Cache',
        'Ray','Celery','Redis','Kafka','S3',
      ],
    },
    {
      name: 'science',
      color: [255, 80, 80],   // red — bioinformatics/science
      tokens: [
        'RNA-Seq','Genomics','IMRT','DVH','Radiomic',
        'Bioinformatics','CFD','RANS','LSTM','XGBoost',
        'Nextflow','Seqera','Protein','Variant','Dosimetry',
        'Biomarker','DICOM','NIfTI','FASTA','Alignment',
      ],
    },
  ];

  /* Flatten all tokens into nodes */
  let W, H, nodes, edges;

  function getAccentRGB() {
    const m = document.documentElement.getAttribute('data-mode') || 'green';
    return m === 'amber' ? [255,179,0] : m === 'cyan' ? [0,229,255] : [0,255,65];
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function buildNodes() {
    nodes = [];
    CLUSTERS.forEach((cluster, ci) => {
      cluster.tokens.forEach((token, ti) => {
        // Scatter within a loose zone per cluster
        const zoneX = (ci % 3) / 2.5;
        const zoneY = ci < 3 ? 0.2 : 0.6;
        nodes.push({
          x:     W * (zoneX + 0.1 + Math.random() * 0.5),
          y:     H * (zoneY + 0.05 + Math.random() * 0.35),
          vx:    (Math.random() - 0.5) * 0.28,
          vy:    (Math.random() - 0.5) * 0.28,
          label: token,
          cluster: ci,
          color: cluster.color,
          r:     1.8 + Math.random() * 2.2,
          phase: Math.random() * Math.PI * 2,
          showLabel: Math.random() > 0.35, // ~65% show label
          labelAlpha: 0,
        });
      });
    });
  }

  function buildEdges() {
    edges = [];
    const SAME_DIST  = 260;  // max dist for same-cluster connection
    const CROSS_DIST = 160;  // max dist for cross-cluster connection
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i+1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const sameCl = a.cluster === b.cluster;
        const maxD   = sameCl ? SAME_DIST : CROSS_DIST;
        const dx = a.x - b.x, dy = a.y - b.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < maxD) {
          edges.push({
            i, j,
            sameCl,
            baseStrength: sameCl ? 0.55 : 0.15,
            dist: d,
            maxD,
          });
        }
      }
    }
  }

  resize();
  buildNodes();
  buildEdges();
  window.addEventListener('resize', () => {
    resize();
    buildNodes();
    buildEdges();
  });

  // Mouse
  let mx = -9999, my = -9999;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  // Hover detection
  let hoveredNode = null;
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const ex = e.clientX - rect.left;
    const ey = e.clientY - rect.top;
    hoveredNode = null;
    for (const n of nodes) {
      if (Math.sqrt((n.x-ex)**2 + (n.y-ey)**2) < 22) { hoveredNode = n; break; }
    }
  });

  let t = 0;
  (function draw() {
    requestAnimationFrame(draw);
    t += 0.01;
    ctx.clearRect(0, 0, W, H);

    // Update positions
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 20 || n.x > W-20) n.vx *= -1;
      if (n.y < 20 || n.y > H-20) n.vy *= -1;

      // Mouse repel
      const dx = n.x - mx, dy = n.y - my;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < 90 && d > 0) {
        n.x += dx/d * 1.4;
        n.y += dy/d * 1.4;
      }
    });

    // Rebuild edges periodically (every ~180 frames) for dynamic connections
    if (Math.floor(t * 100) % 180 === 0) buildEdges();

    // Draw edges
    edges.forEach(e => {
      const a = nodes[e.i], b = nodes[e.j];
      const dx = a.x-b.x, dy = a.y-b.y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (dist > e.maxD) return;

      const [r,g,bl] = e.sameCl
        ? lerpColor(a.color, b.color, 0.5)
        : getAccentRGB();

      const proximity = 1 - dist/e.maxD;
      const pulse = e.sameCl ? 0.5 + 0.5*Math.sin(t*0.8 + a.phase) : 1;
      const alpha = e.baseStrength * proximity * pulse * 0.5;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
      ctx.lineWidth = e.sameCl ? 0.9 : 0.4;
      ctx.stroke();

      // Data pulse: animated dot traveling along same-cluster edges
      if (e.sameCl && Math.random() < 0.003) {
        const prog = (t * 0.6 + e.i * 0.1) % 1;
        const px = a.x + (b.x - a.x) * prog;
        const py = a.y + (b.y - a.y) * prog;
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${r},${g},${bl},0.9)`;
        ctx.fill();
      }
    });

    // Draw nodes
    nodes.forEach(n => {
      const isHovered = n === hoveredNode;
      const pulse = 0.5 + 0.5*Math.sin(t*1.4 + n.phase);
      const [r,g,b] = n.color;
      const baseAlpha = 0.5 + 0.45*pulse;
      const rad = n.r * (isHovered ? 2.5 : 0.9 + 0.4*pulse);

      // Glow halo
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, rad*6);
      grd.addColorStop(0, `rgba(${r},${g},${b},${baseAlpha*0.55})`);
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(n.x, n.y, rad*6, 0, Math.PI*2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, rad, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${r},${g},${b},${baseAlpha})`;
      ctx.fill();

      // Label
      if (n.showLabel || isHovered) {
        n.labelAlpha = Math.min(n.labelAlpha + 0.04, isHovered ? 1 : 0.55);
        const fs = isHovered ? 11 : 9;
        ctx.font = `${fs}px 'Share Tech Mono', monospace`;
        ctx.textAlign = 'center';

        // Label background pill
        const tw = ctx.measureText(n.label).width;
        const lx = n.x, ly = n.y - rad - 10;
        ctx.fillStyle = `rgba(2,9,5,${n.labelAlpha * 0.75})`;
        roundRect(ctx, lx - tw/2 - 3, ly - fs, tw+6, fs+4, 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${r},${g},${b},${n.labelAlpha})`;
        ctx.fillText(n.label, lx, ly);
        ctx.textAlign = 'left';
      } else {
        n.labelAlpha = Math.max(n.labelAlpha - 0.02, 0);
      }
    });

    // Hovered node: show cluster name + all connections highlight
    if (hoveredNode) {
      const [r,g,b] = hoveredNode.color;
      const cn = CLUSTERS[hoveredNode.cluster].name.toUpperCase();
      ctx.font = "10px 'Share Tech Mono', monospace";
      ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
      ctx.fillText(`[${cn}]`, hoveredNode.x + 14, hoveredNode.y + 4);
    }
  })();
}

/* ── Helpers ── */
function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0]-a[0])*t),
    Math.round(a[1] + (b[1]-a[1])*t),
    Math.round(a[2] + (b[2]-a[2])*t),
  ];
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

/* ══════════════════════════════════════
   HERO TYPING
   ══════════════════════════════════════ */
function initHeroTyping() {
  const nameEl = document.getElementById('hero-name');
  const subEl  = document.getElementById('hero-subtitle');
  const tagEl  = document.getElementById('hero-tagline');
  if (nameEl) {
    CRT.typeText(nameEl, 'MARCHEL SHEVCHENKO', 70, () => {
      if (subEl) CRT.cycleType(subEl, CV.subtitles, 55, 30, 2200);
      if (tagEl) setTimeout(() => CRT.typeText(tagEl, CV.tagline, 35), 600);
    });
  }
}

/* ══════════════════════════════════════
   STATS
   ══════════════════════════════════════ */
function initStats() {
  const el = document.getElementById('stats-strip');
  if (!el) return;
  const fire = () => {
    CRT.animateCounter(document.getElementById('st-projects'), 20, 1200);
    CRT.animateCounter(document.getElementById('st-talks'), 40, 1200);
    document.getElementById('st-users').textContent = '600K+';
    document.getElementById('st-grant').textContent = '$362K+';
  };
  el.getBoundingClientRect().top < window.innerHeight ? fire() : CRT.onVisible(el, fire);
}

/* ══════════════════════════════════════
   FEATURED PROJECTS
   ══════════════════════════════════════ */
function renderFeatured() {
  const grid = document.getElementById('feat-grid');
  if (!grid) return;
  const cm = { green:'badge-green', amber:'badge-amber', cyan:'badge-cyan' };
  CV.projects.slice(0,9).forEach((p,i) => {
    const card = document.createElement('div');
    card.className = 't-card reveal';
    card.style.transitionDelay = (i*0.06)+'s';
    card.innerHTML = `
      <div class="t-card-header">
        <div class="t-card-dot"></div>
        <span>// ${p.num}</span>
        <span class="badge ${cm[p.color]||'badge-dim'}" style="margin-left:auto">${p.tag}</span>
      </div>
      <div class="t-card-body">
        <div class="font-vt text-bright" style="font-size:1.3rem;margin-bottom:0.4rem;">${p.title}</div>
        <div class="text-dim" style="font-size:0.82rem;line-height:1.75;margin-bottom:0.8rem;">${p.desc}</div>
        <div style="display:flex;flex-wrap:wrap;gap:0.3rem;">
          ${p.stack.map(t=>`<span class="badge badge-dim">${t}</span>`).join('')}
        </div>
        <div class="text-dim" style="font-size:0.72rem;margin-top:0.7rem;border-top:1px solid var(--border);padding-top:0.5rem;">
          ${p.event} &nbsp;·&nbsp; ${p.year}
        </div>
      </div>`;
    card.addEventListener('mouseenter', () => {
      const t = card.querySelector('.font-vt');
      t.classList.remove('glitch'); void t.offsetWidth; t.classList.add('glitch');
    });
    grid.appendChild(card);
  });
  setTimeout(() => grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')), 50);
}