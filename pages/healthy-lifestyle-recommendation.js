/* ═══════════════════════════════════════════════════════
   pages/healthy-lifestyle-recommendation.js
   Healthy Lifestyle Recommendation System
   LightFM WARP + Surprise SVD Demo
   ═══════════════════════════════════════════════════════ */

   document.addEventListener('DOMContentLoaded', () => {

    try { Navbar.render();   } catch(e) { console.warn('Navbar:', e); }
    try { Terminal.init();   } catch(e) { console.warn('Terminal:', e); }
    try { Wayang.init();     } catch(e) { console.warn('Wayang:', e); }
    try { Footer.render();   } catch(e) { console.warn('Footer:', e); }
    try { CRT.init();        } catch(e) { console.warn('CRT:', e); }
  
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }, 50);
  
    /* ── Tabs (all tab groups on the page) ── */
    document.querySelectorAll('.tabs-bar').forEach(bar => {
      bar.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          bar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const panel = btn.closest('.t-card-body') || btn.closest('.page-wrap');
          if (!panel) return;
          panel.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
          const target = panel.querySelector('#tab-' + btn.dataset.tab);
          if (target) target.classList.add('active');
          setTimeout(() => Object.values(charts).forEach(c => c && c.resize()), 50);
        });
      });
    });
  
    /* ── Slider ── */
    document.getElementById('slider-topk').addEventListener('input', function () {
      document.getElementById('val-topk').textContent = this.value;
    });
  
    /* ──────────────────────────────────────────────
       FOOD DATABASE (simulated USDA data)
    ────────────────────────────────────────────── */
    const FOODS = [
      { id: 'F001', name: 'Whole Grain Oatmeal',          category: 'Grains',       protein: 5,  carbs: 27, fat: 3,  fiber: 4,  calories: 150, tags: ['diabetic','heart','weight'] },
      { id: 'F002', name: 'Salmon, Atlantic (grilled)',   category: 'Seafood',      protein: 25, carbs: 0,  fat: 13, fiber: 0,  calories: 208, tags: ['diabetic','heart','muscle'] },
      { id: 'F003', name: 'Lentil Soup (cooked)',         category: 'Legumes',      protein: 9,  carbs: 20, fat: 1,  fiber: 8,  calories: 130, tags: ['diabetic','vegan','weight'] },
      { id: 'F004', name: 'Greek Yogurt (non-fat)',       category: 'Dairy',        protein: 17, carbs: 6,  fat: 0,  fiber: 0,  calories: 100, tags: ['diabetic','weight','muscle'] },
      { id: 'F005', name: 'Broccoli (steamed)',           category: 'Vegetables',   protein: 4,  carbs: 11, fat: 0,  fiber: 5,  calories: 55,  tags: ['diabetic','vegan','weight','heart'] },
      { id: 'F006', name: 'Almonds (raw)',                category: 'Nuts & Seeds', protein: 6,  carbs: 6,  fat: 14, fiber: 4,  calories: 164, tags: ['diabetic','heart','vegan'] },
      { id: 'F007', name: 'Quinoa (cooked)',              category: 'Grains',       protein: 8,  carbs: 39, fat: 4,  fiber: 5,  calories: 222, tags: ['vegan','weight','muscle'] },
      { id: 'F008', name: 'Spinach Salad w/ Olive Oil',  category: 'Salads',       protein: 3,  carbs: 4,  fat: 7,  fiber: 3,  calories: 90,  tags: ['diabetic','vegan','heart','weight'] },
      { id: 'F009', name: 'Chicken Breast (baked)',      category: 'Poultry',      protein: 31, carbs: 0,  fat: 4,  fiber: 0,  calories: 165, tags: ['diabetic','weight','muscle'] },
      { id: 'F010', name: 'Black Beans (boiled)',         category: 'Legumes',      protein: 15, carbs: 41, fat: 1,  fiber: 15, calories: 227, tags: ['diabetic','vegan','heart'] },
      { id: 'F011', name: 'Sweet Potato (baked)',         category: 'Vegetables',   protein: 4,  carbs: 41, fat: 0,  fiber: 6,  calories: 180, tags: ['diabetic','vegan','weight'] },
      { id: 'F012', name: 'Chia Seeds',                  category: 'Nuts & Seeds', protein: 5,  carbs: 12, fat: 9,  fiber: 10, calories: 137, tags: ['vegan','heart','diabetic'] },
      { id: 'F013', name: 'Blueberries (fresh)',          category: 'Fruits',       protein: 1,  carbs: 21, fat: 0,  fiber: 4,  calories: 84,  tags: ['diabetic','vegan','heart'] },
      { id: 'F014', name: 'Tofu (firm, stir-fried)',     category: 'Soy Products', protein: 17, carbs: 3,  fat: 11, fiber: 1,  calories: 177, tags: ['vegan','weight','muscle'] },
      { id: 'F015', name: 'Avocado (half)',               category: 'Fruits',       protein: 2,  carbs: 9,  fat: 15, fiber: 7,  calories: 161, tags: ['vegan','heart','diabetic'] },
    ];
  
    /* User profiles — priorities drive simulated scores */
    const USER_PROFILES = [
      { label: 'user_1 — Diabetic',     tags: ['diabetic'],        prefer_low_carb: true  },
      { label: 'user_2 — Weight Loss',  tags: ['weight'],          prefer_low_carb: false },
      { label: 'user_3 — Muscle Gain',  tags: ['muscle'],          prefer_protein: true   },
      { label: 'user_4 — Heart Health', tags: ['heart'],           prefer_fiber: true     },
      { label: 'user_5 — Vegan',        tags: ['vegan','diabetic'],prefer_plant: true     },
    ];
  
    /* ──────────────────────────────────────────────
       SCORING ENGINES (simulated ML models)
    ────────────────────────────────────────────── */
    function scoreLightFM(food, profile) {
      /* WARP-style ranking score — emphasis on item relevance to user embedding */
      let score = 0;
      const tagMatches = food.tags.filter(t => profile.tags.includes(t)).length;
      score += tagMatches * 1.8;
      if (profile.prefer_low_carb) score += Math.max(0, (40 - food.carbs) / 40) * 2;
      if (profile.prefer_protein)  score += (food.protein / 35) * 2.5;
      if (profile.prefer_fiber)    score += (food.fiber / 15) * 2;
      if (profile.prefer_plant)    score += food.tags.includes('vegan') ? 1.5 : 0;
      /* Add pseudo-random latent factor noise (deterministic per food) */
      const seed = food.id.charCodeAt(1) + food.id.charCodeAt(2);
      score += (((seed * 7919) % 100) / 100) * 0.6;
      return score;
    }
  
    function scoreSVD(food, profile) {
      /* SVD-style predicted rating (1–5 scale) */
      const globalMean = 3.1;
      const tagMatches = food.tags.filter(t => profile.tags.includes(t)).length;
      const userBias = profile.prefer_protein ? 0.3 : profile.prefer_low_carb ? 0.2 : 0.1;
      let itemBias = (tagMatches / 3) * 0.8;
      if (food.fiber > 5) itemBias += 0.25;
      if (food.protein > 15) itemBias += 0.2;
      /* Latent factor dot product (simulated) */
      const seed = food.id.charCodeAt(1) * 13 + food.id.charCodeAt(2) * 7;
      const latent = (((seed * 3571) % 100) / 100) * 0.7 - 0.35;
      const rating = Math.min(5, Math.max(1, globalMean + userBias + itemBias + latent));
      return rating;
    }
  
    /* ──────────────────────────────────────────────
       INTERACTION MATRIX (simulated)
    ────────────────────────────────────────────── */
    function buildInteractionMatrix() {
      const users = USER_PROFILES.map(p => p.label.split(' ')[0]);
      const foods  = FOODS.slice(0, 8).map(f => f.name.split(' ')[0]);
      const matrix = users.map((_, ui) =>
        FOODS.slice(0, 8).map((food, fi) => {
          const profile = USER_PROFILES[ui];
          const tagMatch = food.tags.filter(t => profile.tags.includes(t)).length;
          const seed = (ui * 8 + fi) * 2531 + 1729;
          const base = tagMatch > 0 ? 3 + tagMatch : 2;
          return Math.min(5, Math.max(1, Math.round(base + ((seed % 100) / 100) * 2 - 1)));
        })
      );
      return { users, foods, matrix };
    }
  
    /* ──────────────────────────────────────────────
       CHART.JS SETUP
    ────────────────────────────────────────────── */
    Chart.defaults.color       = '#3d8048';
    Chart.defaults.borderColor = '#0a2912';
    Chart.defaults.font.family = "'Share Tech Mono', monospace";
    Chart.defaults.font.size   = 11;
  
    const charts = {};
    function makeChart(id, cfg) {
      if (charts[id]) charts[id].destroy();
      const el = document.getElementById(id);
      if (!el) return;
      charts[id] = new Chart(el.getContext('2d'), cfg);
      return charts[id];
    }
  
    /* Interaction matrix heatmap */
    function renderMatrixChart() {
      const { users, foods, matrix } = buildInteractionMatrix();
      const datasets = users.map((user, ui) => ({
        label: user,
        data: matrix[ui],
        backgroundColor: matrix[ui].map(v => {
          const alpha = v / 5;
          return `rgba(0,255,65,${alpha * 0.8})`;
        }),
        borderColor: 'rgba(0,255,65,0.2)',
        borderWidth: 1,
      }));
  
      makeChart('chart-matrix', {
        type: 'bar',
        data: { labels: foods, datasets },
        options: {
          responsive: true, maintainAspectRatio: true, aspectRatio: 2,
          scales: {
            x: { stacked: false, title: { display: true, text: 'Food Items', color: '#3d8048' }, grid: { color: '#0a2912' } },
            y: { min: 0, max: 5, title: { display: true, text: 'Rating', color: '#3d8048' }, grid: { color: '#0a2912' } }
          },
          plugins: {
            legend: { labels: { color: '#3d8048', boxWidth: 10, font: { size: 10 } } }
          }
        }
      });
    }
  
    /* ──────────────────────────────────────────────
       RENDER RECOMMENDATION CARDS
    ────────────────────────────────────────────── */
    function renderRecCards(containerId, recs, modelType) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const maxScore = Math.max(...recs.map(r => r.score));
  
      container.innerHTML = recs.map((rec, i) => {
        const pct = modelType === 'svd'
          ? ((rec.score - 1) / 4) * 100
          : (rec.score / maxScore) * 100;
        const color = modelType === 'lightfm' ? 'var(--green)' : 'var(--cyan)';
        const scoreLabel = modelType === 'svd'
          ? rec.score.toFixed(2)
          : rec.score.toFixed(3);
  
        return `<div class="rec-item">
          <div class="rec-rank">#${i + 1}</div>
          <div style="flex:1;min-width:0">
            <div class="rec-name">${rec.food.name}</div>
            <div class="rec-category">${rec.food.category} &nbsp;·&nbsp; ${rec.food.calories} kcal</div>
            <div style="display:flex;gap:.5rem;margin-top:.2rem;flex-wrap:wrap">
              ${rec.food.tags.map(t => `<span style="font-size:.6rem;color:var(--text-dim);border:1px solid var(--border);padding:.05rem .3rem">${t}</span>`).join('')}
            </div>
          </div>
          <div class="rec-score-bar">
            <div class="rec-score-val" style="color:${color}">${scoreLabel}</div>
            <div class="rec-score-track">
              <div class="rec-score-fill" style="width:${pct.toFixed(0)}%;background:${color}"></div>
            </div>
            <div style="font-size:.62rem;color:var(--text-dim);text-align:right;margin-top:.1rem">
              ${modelType === 'svd' ? 'pred. rating' : 'warp score'}
            </div>
          </div>
        </div>`;
      }).join('');
    }
  
    /* ──────────────────────────────────────────────
       LOG
    ────────────────────────────────────────────── */
    function log(msg, cls = '') {
      const el = document.getElementById('log-terminal');
      if (!el) return;
      const sp = document.createElement('span');
      sp.className = cls;
      sp.textContent = `[${new Date().toTimeString().slice(0, 8)}] ${msg}`;
      el.appendChild(sp);
      el.appendChild(document.createElement('br'));
      el.scrollTop = el.scrollHeight;
    }
  
    /* ──────────────────────────────────────────────
       MAIN: GENERATE RECOMMENDATIONS
    ────────────────────────────────────────────── */
    function generateRecs() {
      const userIdx  = parseInt(document.getElementById('sel-user').value);
      const modelKey = document.getElementById('sel-model').value;
      const topK     = parseInt(document.getElementById('slider-topk').value);
      const profile  = USER_PROFILES[userIdx];
  
      document.getElementById('log-terminal').innerHTML = '';
      log(`Loading model: ${modelKey === 'lightfm' ? 'LightFM (WARP)' : 'Surprise SVD'}...`, 'info');
      log(`User: ${profile.label}`);
      log(`Computing scores for ${FOODS.length} food items...`);
  
      const scoreFn = modelKey === 'lightfm' ? scoreLightFM : scoreSVD;
      const scored  = FOODS
        .map(food => ({ food, score: scoreFn(food, profile) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
  
      /* Update labels */
      document.getElementById('active-model-label').textContent =
        modelKey === 'lightfm' ? 'LightFM (WARP)' : 'Surprise SVD';
      document.getElementById('active-user-label').textContent = profile.label.split(' ')[0];
      document.getElementById('rec-count').textContent = `${scored.length} items`;
  
      renderRecCards('rec-list', scored, modelKey);
  
      log(`Top-${topK} generated. Highest score: ${scored[0].score.toFixed(3)} (${scored[0].food.name})`, 'ok');
      log(`Model evaluation: ${modelKey === 'svd' ? 'RMSE = 0.7184' : 'WARP loss converged @ epoch 30'}`, 'ok');
  
      /* Nutrient chart */
      renderNutrientChart(scored.slice(0, 5));
  
      return { scored, modelKey, profile };
    }
  
    /* ──────────────────────────────────────────────
       NUTRIENT PROFILE CHART
    ────────────────────────────────────────────── */
    function renderNutrientChart(recs) {
      const labels = recs.map(r => r.food.name.split(' ').slice(0, 2).join(' '));
      makeChart('chart-nutrient', {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Protein (g)',    data: recs.map(r => r.food.protein), backgroundColor: 'rgba(0,255,65,0.7)',   borderColor: '#00ff41', borderWidth: 1 },
            { label: 'Carbs (g)',      data: recs.map(r => r.food.carbs),   backgroundColor: 'rgba(255,179,0,0.7)',  borderColor: '#ffb300', borderWidth: 1 },
            { label: 'Fat (g)',        data: recs.map(r => r.food.fat),     backgroundColor: 'rgba(0,229,255,0.7)',  borderColor: '#00e5ff', borderWidth: 1 },
            { label: 'Fiber (g)',      data: recs.map(r => r.food.fiber),   backgroundColor: 'rgba(255,64,64,0.7)',  borderColor: '#ff4040', borderWidth: 1 },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: true, aspectRatio: 2,
          scales: {
            x: { grid: { color: '#0a2912' } },
            y: { title: { display: true, text: 'grams', color: '#3d8048' }, grid: { color: '#0a2912' } }
          },
          plugins: { legend: { labels: { color: '#3d8048', boxWidth: 12 } } }
        }
      });
    }
  
    /* ──────────────────────────────────────────────
       COMPARE MODELS
    ────────────────────────────────────────────── */
    function compareModels() {
      const userIdx = parseInt(document.getElementById('sel-user').value);
      const topK    = parseInt(document.getElementById('slider-topk').value);
      const profile = USER_PROFILES[userIdx];
  
      log(`Comparing LightFM vs SVD for ${profile.label}...`, 'info');
  
      const lfmRecs = FOODS
        .map(food => ({ food, score: scoreLightFM(food, profile) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
  
      const svdRecs = FOODS
        .map(food => ({ food, score: scoreSVD(food, profile) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
  
      renderRecCards('compare-lightfm', lfmRecs, 'lightfm');
      renderRecCards('compare-svd',     svdRecs, 'svd');
  
      /* Agreement analysis */
      const lfmIds = new Set(lfmRecs.map(r => r.food.id));
      const svdIds = new Set(svdRecs.map(r => r.food.id));
      const overlap = [...lfmIds].filter(id => svdIds.has(id)).length;
      log(`Model agreement: ${overlap}/${topK} items in common (${((overlap/topK)*100).toFixed(0)}% overlap)`, overlap >= topK/2 ? 'ok' : 'warn');
  
      /* Comparison chart */
      const allFoods  = FOODS.slice(0, 8);
      const lfmScores = allFoods.map(f => scoreLightFM(f, profile));
      const svdScores = allFoods.map(f => (scoreSVD(f, profile) - 1) / 4); // normalize to 0-1
      const maxLfm    = Math.max(...lfmScores);
      const lfmNorm   = lfmScores.map(s => s / maxLfm);
  
      makeChart('chart-compare', {
        type: 'radar',
        data: {
          labels: allFoods.map(f => f.name.split(' ')[0]),
          datasets: [
            { label: 'LightFM (WARP)', data: lfmNorm,   borderColor: '#00ff41', backgroundColor: 'rgba(0,255,65,0.12)',   pointBackgroundColor: '#00ff41', borderWidth: 2 },
            { label: 'Surprise SVD',   data: svdScores,  borderColor: '#00e5ff', backgroundColor: 'rgba(0,229,255,0.12)',  pointBackgroundColor: '#00e5ff', borderWidth: 2 },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: true, aspectRatio: 1.6,
          scales: {
            r: {
              min: 0, max: 1,
              angleLines: { color: '#0a2912' },
              grid:        { color: '#0a2912' },
              pointLabels: { color: '#3d8048', font: { size: 10 } },
              ticks:       { color: '#3d8048', backdropColor: 'transparent', stepSize: 0.25 }
            }
          },
          plugins: { legend: { labels: { color: '#3d8048', boxWidth: 12 } } }
        }
      });
  
      /* Switch to compare tab */
      document.querySelectorAll('.tabs-bar').forEach(bar => {
        const compareBtn = bar.querySelector('[data-tab="compare"]');
        if (compareBtn) compareBtn.click();
      });
    }
  
    /* ──────────────────────────────────────────────
       BUTTONS
    ────────────────────────────────────────────── */
    document.getElementById('btn-recommend').addEventListener('click', generateRecs);
    document.getElementById('btn-compare').addEventListener('click', compareModels);
  
    /* ──────────────────────────────────────────────
       INIT
    ────────────────────────────────────────────── */
    renderMatrixChart();
    generateRecs();
  
  });