/* ═══════════════════════════════════════════════════════
   pages/milk-spray-drying.js
   Milk Spray Drying — Interactive CFD/ML Simulator
   ═══════════════════════════════════════════════════════ */

   document.addEventListener('DOMContentLoaded', () => {
    /* ── Bootstrap shared components (defensive — page still works if any fail) ── */
    try { Navbar.render();   } catch(e) { console.warn('Navbar:', e); }
    try { Terminal.init();  } catch(e) { console.warn('Terminal:', e); }
    try { Wayang.init();    } catch(e) { console.warn('Wayang:', e); }
    try { Footer.render();  } catch(e) { console.warn('Footer:', e); }
    try { CRT.init();       } catch(e) { console.warn('CRT:', e); }
  
    /* ── Force-reveal all elements regardless of IntersectionObserver ── */
    const showAll = () => document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    setTimeout(showAll, 60);
  
    /* ── Tabs ── */
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        setTimeout(() => Object.values(charts).forEach(c => c && c.resize()), 50);
      });
    });
  
    /* ──────────────────────────────────────────────
       PARAMETERS
    ────────────────────────────────────────────── */
    const DEFAULTS = { T_inlet: 180, v_air: 9, humidity: 0.009, T_feed: 27, T_sim: 10, d_um: 70 };
    const OPTIMAL  = { T_inlet: 195, v_air: 9.08, humidity: 0.009, T_feed: 27, T_sim: 10, d_um: 70.5 };
  
    const PARAMS_DEF = [
      { id: 'T_inlet',  sym: 'T_in', name: 'Inlet Air Temperature (°C)', min: 140,   max: 220,  step: 1,     def: 180   },
      { id: 'v_air',    sym: 'v',    name: 'Air Velocity (m/s)',          min: 5,     max: 15,   step: 0.1,   def: 9     },
      { id: 'humidity', sym: 'Y',    name: 'Inlet Humidity (kg/kg)',      min: 0.005, max: 0.02, step: 0.001, def: 0.009 },
      { id: 'T_feed',   sym: 'T_f',  name: 'Feed Temperature (°C)',       min: 20,    max: 40,   step: 1,     def: 27    },
    ];
  
    let params = { ...DEFAULTS };
  
    const grid = document.getElementById('controls-grid');
    PARAMS_DEF.forEach(p => {
      const div = document.createElement('div');
      div.className = 'ctrl-group';
      div.innerHTML = `
        <div class="ctrl-label">
          <span><span class="ctrl-sym">${p.sym}</span> <span class="ctrl-name">${p.name}</span></span>
          <span class="ctrl-val" id="val-${p.id}">${p.def}</span>
        </div>
        <input type="range" id="slider-${p.id}" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.def}">`;
      grid.appendChild(div);
    });
  
    function bindSlider(id, key, dec = 2) {
      const s = document.getElementById(`slider-${id}`);
      const l = document.getElementById(`val-${id}`);
      if (!s) return;
      s.addEventListener('input', () => {
        params[key] = parseFloat(s.value);
        l.textContent = params[key] % 1 === 0 ? params[key] : params[key].toFixed(dec);
      });
    }
    PARAMS_DEF.forEach(p => bindSlider(p.id, p.id, p.step < 0.01 ? 4 : p.step < 1 ? 2 : 0));
    bindSlider('T', 'T_sim', 0);
    bindSlider('d', 'd_um', 0);
  
    function setParams(preset) {
      Object.entries(preset).forEach(([k, v]) => {
        params[k] = v;
        const s = document.getElementById(`slider-${k}`);
        const l = document.getElementById(`val-${k}`);
        if (s) s.value = v;
        if (l) l.textContent = (typeof v === 'number' && v % 1 !== 0) ? v.toFixed(v < 0.1 ? 4 : 2) : v;
      });
    }
  
    document.getElementById('btn-reset').addEventListener('click',   () => { setParams(DEFAULTS); runSim(); });
    document.getElementById('btn-optimal').addEventListener('click', () => { setParams(OPTIMAL);  runSim(); });
    document.getElementById('btn-run').addEventListener('click',     runSim);
  
    /* ──────────────────────────────────────────────
       PHYSICS ENGINE
    ────────────────────────────────────────────── */
    const MILK = {
      water_init: 0.87, rho_liquid: 1030, rho_solid: 1450,
      cp_liquid: 3900,  cp_solid: 1500,   latent: 2.26e6, X_crit: 0.3
    };
    const R_air = 287, cp_air = 1009, g = 9.81;
  
    function airProps(T) {
      return {
        rho: 101325 / (R_air * T),
        mu:  1.458e-6 * T ** 1.5 / (T + 110.4),
        k:   0.0241  * (T / 273) ** 0.9,
        D:   2.2e-5  * (T / 273) ** 1.8
      };
    }
  
    function simulate(p) {
      const T_in_K = p.T_inlet + 273.15;
      const T_f_K  = p.T_feed  + 273.15;
      const d0     = p.d_um * 1e-6;
      const dt = 0.02, steps = Math.round(p.T_sim / dt);
      const X0 = MILK.water_init / (1 - MILK.water_init);
      let d = d0, T = T_f_K, X = X0, vz = 0;
  
      const t = [0], dArr = [d], Tarr = [T], Xarr = [X], evapArr = [0];
  
      for (let i = 0; i < steps; i++) {
        const T_air = T_in_K - 60 * (i * dt / p.T_sim);
        const air   = airProps(T_air);
        const v_rel = Math.abs(p.v_air - vz);
        const Re    = air.rho * v_rel * d / air.mu;
        const Nu    = 2 + 0.6 * Re ** 0.5 * (cp_air * air.mu / air.k) ** (1 / 3);
        const Sh    = 2 + 0.6 * Re ** 0.5 * (air.mu / (air.rho * air.D)) ** (1 / 3);
        const h     = Nu * air.k / d;
        const k_m   = Sh * air.D / d;
        const A     = Math.PI * d ** 2;
        const m_sol = (Math.PI * d ** 3 / 6) * MILK.rho_solid * (1 - MILK.water_init);
        const m_tot = m_sol * (1 + X);
  
        let evap = 0, dT_dt = 0, dX_dt = 0, dd_dt = 0;
  
        if (X > 0.001) {
          const P_sat  = 101325 * Math.exp(13.3185 - 5160 / T);
          const a_w    = X > MILK.X_crit ? 1.0 : X / MILK.X_crit;
          const P_bulk = p.humidity * 101325 * 0.622 / (0.622 + p.humidity);
          evap         = Math.max(0, k_m * A * (a_w * P_sat - P_bulk) * 18.015 / (8314 * T_air));
          const Q_net  = h * A * (T_air - T) - evap * MILK.latent;
          const cp_mix = (m_sol * MILK.cp_solid + X * m_sol * MILK.cp_liquid) / m_tot;
          dT_dt = Q_net / (m_tot * cp_mix);
          dX_dt = -evap / m_sol;
          dd_dt = -evap / (MILK.rho_liquid * Math.PI * d ** 2);
        } else {
          dT_dt = (h * A * (T_air - T)) / (m_tot * MILK.cp_solid);
        }
  
        const Cd = Re < 0.1 ? (Re > 0 ? 24 / Re : 0) : Re < 1000 ? 24 / Re * (1 + 0.15 * Re ** 0.687) : 0.44;
        const az = -g + 0.5 * Cd * air.rho * v_rel ** 2 * Math.PI * (d / 2) ** 2 * Math.sign(p.v_air - vz) / m_tot;
  
        d = Math.max(1e-8, d + dd_dt * dt);
        T += dT_dt * dt;
        X = Math.max(0, X + dX_dt * dt);
        vz += az * dt;
  
        t.push(+(i * dt).toFixed(3));
        dArr.push(d); Tarr.push(T); Xarr.push(X); evapArr.push(evap);
      }
      return { t, d: dArr, T: Tarr, X: Xarr, evap: evapArr };
    }
  
    function qualityScore(mc_wb, T_C) {
      const ms = mc_wb >= 0.02 && mc_wb <= 0.05 ? 100
        : mc_wb < 0.02 ? Math.max(0, 100 - (0.02 - mc_wb) * 2000)
        : Math.max(0, 100 - (mc_wb - 0.05) * 1000);
      const ts = T_C <= 60 ? 100 : Math.max(0, 100 - (T_C - 60) * 2);
      return 0.7 * ms + 0.3 * ts;
    }
  
    /* ──────────────────────────────────────────────
       CHART.JS
    ────────────────────────────────────────────── */
    Chart.defaults.color       = '#3d8048';
    Chart.defaults.borderColor = '#0a2912';
    Chart.defaults.font.family = "'Share Tech Mono', monospace";
    Chart.defaults.font.size   = 11;
  
    const charts = {};
    function makeChart(id, cfg) {
      if (charts[id]) charts[id].destroy();
      charts[id] = new Chart(document.getElementById(id).getContext('2d'), cfg);
      return charts[id];
    }
  
    /* ── Static: Heat & Mass Transfer ── */
    function initTransferCharts() {
      const vels   = [5, 15, 30, 59];
      const colors = ['#ff4040', '#ffb300', '#00ff41', '#00e5ff'];
      const diams  = Array.from({ length: 40 }, (_, i) => 10 + i * 3.5);
      const nuDS = [], shDS = [];
      vels.forEach((v, vi) => {
        const nu = [], sh = [];
        diams.forEach(d_um => {
          const d = d_um * 1e-6, air = airProps(468);
          const Re = air.rho * v * d / air.mu;
          nu.push({ x: Re, y: 2 + 0.6 * Re ** 0.5 * (cp_air * air.mu / air.k) ** (1 / 3) });
          sh.push({ x: Re, y: 2 + 0.6 * Re ** 0.5 * (air.mu / (air.rho * air.D)) ** (1 / 3) });
        });
        const base = { borderColor: colors[vi], backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0, showLine: true, tension: 0.2 };
        nuDS.push({ ...base, data: nu }); shDS.push({ ...base, data: sh });
      });
      const sOpts = (xl, yl) => ({
        type: 'scatter', data: { datasets: [] },
        options: {
          responsive: true, maintainAspectRatio: true, aspectRatio: 1.6,
          scales: {
            x: { type: 'logarithmic', title: { display: true, text: xl, color: '#3d8048' }, grid: { color: '#0a2912' } },
            y: { title: { display: true, text: yl, color: '#3d8048' }, grid: { color: '#0a2912' } }
          },
          plugins: { legend: { display: false } }
        }
      });
      const nuCfg = sOpts('Reynolds Number', 'Nusselt Number');
      nuCfg.data.datasets = nuDS;
      const shCfg = sOpts('Reynolds Number', 'Sherwood Number');
      shCfg.data.datasets = shDS;
      makeChart('chart-nu', nuCfg);
      makeChart('chart-sh', shCfg);
    }
  
    /* ── Static: Rosin-Rammler ── */
    function initRosinChart() {
      const d_mean = parseFloat(document.getElementById('slider-dmean').value);
      const n      = parseFloat(document.getElementById('slider-spread').value);
      const ds     = Array.from({ length: 100 }, (_, i) => 10 + i * 1.3);
      makeChart('chart-rosin', {
        type: 'line',
        data: {
          labels: ds.map(d => d.toFixed(0)),
          datasets: [
            { data: ds.map(d => (n / d_mean) * (d / d_mean) ** (n - 1) * Math.exp(-((d / d_mean) ** n))), borderColor: '#00aaff', backgroundColor: 'rgba(0,170,255,0.1)', borderWidth: 2, pointRadius: 0, fill: true, yAxisID: 'y', tension: 0.3 },
            { data: ds.map(d => 1 - Math.exp(-((d / d_mean) ** n))),                                       borderColor: '#00ff41', backgroundColor: 'transparent',          borderWidth: 2, pointRadius: 0, fill: false, yAxisID: 'y2', tension: 0.3 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: true, aspectRatio: 2.2,
          animation: { duration: 300 },
          scales: {
            x:  { title: { display: true, text: 'Droplet Diameter (μm)', color: '#3d8048' }, grid: { color: '#0a2912' } },
            y:  { position: 'left',  title: { display: true, text: 'PDF', color: '#3d8048' }, grid: { color: '#0a2912' } },
            y2: { position: 'right', title: { display: true, text: 'CDF', color: '#3d8048' }, grid: { drawOnChartArea: false } }
          },
          plugins: { legend: { display: false } }
        }
      });
      const d10 = d_mean * ((-Math.log(0.9)) ** (1 / n));
      const d50 = d_mean * ((-Math.log(0.5)) ** (1 / n));
      const d90 = d_mean * ((-Math.log(0.1)) ** (1 / n));
      document.getElementById('rosin-stats').innerHTML =
        [['D10', d10], ['D50', d50], ['D90', d90], ['D̄', d_mean]].map(([lbl, v]) =>
          `<div class="metric-box"><div class="metric-label">${lbl}</div><div class="metric-val" style="color:var(--cyan)">${v.toFixed(1)} μm</div></div>`
        ).join('');
    }
  
    ['slider-dmean', 'slider-spread'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        document.getElementById('val-dmean').textContent  = parseFloat(document.getElementById('slider-dmean').value).toFixed(1);
        document.getElementById('val-spread').textContent = parseFloat(document.getElementById('slider-spread').value).toFixed(2);
        initRosinChart();
      });
    });
  
    /* ── Chamber Canvas ── */
    function drawChamber(result) {
      const canvas = document.getElementById('chart-chamber');
      const dpr    = window.devicePixelRatio || 1;
      const W      = canvas.parentElement.clientWidth - 16;
      const H      = 320;
      canvas.width  = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
  
      const r_cyl = 0.5, h_cyl = 1.5, h_cone = 1.0, r_cone = 0.15;
      const margin = 30, sR = (W * 0.4) / r_cyl, sZ = (H - margin * 2) / (h_cyl + h_cone);
      const ox = W * 0.35, oy = margin;
      const px = r => ox + r * sR, pz = z => oy + z * sZ;
  
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, 'rgba(0,255,65,0.03)'); bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  
      for (let z = 0; z < h_cyl + h_cone; z += 0.04) {
        const f = z / (h_cyl + h_cone);
        const rl = z <= h_cyl ? r_cyl : r_cyl - (r_cyl - r_cone) * (z - h_cyl) / h_cone;
        ctx.fillStyle = `rgba(${Math.round(f * 200)},${Math.round(255 - f * 100)},0,${0.06 - f * 0.04})`;
        ctx.fillRect(ox, pz(z), rl * sR, 0.04 * sZ + 1);
      }
  
      ctx.strokeStyle = '#155a28'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px(0), pz(0)); ctx.lineTo(px(r_cyl), pz(0));
      ctx.lineTo(px(r_cyl), pz(h_cyl)); ctx.lineTo(px(r_cone), pz(h_cyl + h_cone));
      ctx.lineTo(px(0), pz(h_cyl + h_cone)); ctx.stroke();
  
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#0a2912'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px(0), pz(0)); ctx.lineTo(px(0), pz(h_cyl + h_cone)); ctx.stroke();
      ctx.setLineDash([]);
  
      ctx.strokeStyle = '#00aaff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px(0.15), pz(0) - 25); ctx.lineTo(px(0.30), pz(0) - 25); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px(0.22), pz(0)); ctx.lineTo(px(0.22), pz(0) - 20);
      ctx.lineTo(px(0.17), pz(0) - 10); ctx.moveTo(px(0.22), pz(0) - 20); ctx.lineTo(px(0.27), pz(0) - 10);
      ctx.stroke();
  
      ctx.fillStyle = '#ff4040';
      ctx.beginPath(); ctx.arc(px(0), pz(0), 5, 0, Math.PI * 2); ctx.fill();
  
      const sr = 0.35 * Math.tan(Math.PI * 38 / 180);
      ctx.fillStyle = 'rgba(255,64,64,0.08)'; ctx.strokeStyle = 'rgba(255,64,64,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px(0), pz(0)); ctx.lineTo(px(sr), pz(0.35)); ctx.lineTo(px(0), pz(0.35));
      ctx.closePath(); ctx.fill(); ctx.stroke();
  
      if (result) {
        const N = result.t.length, step = Math.max(1, Math.floor(N / 60));
        for (let i = 0; i < N - step; i += step) {
          const f = i / N, Tn = Math.min(1, (result.T[i] - 300) / 200);
          const rp = Math.min(r_cyl * 0.9, 0.08 + f * 0.3 + Math.sin(f * 15) * 0.04);
          const zp = Math.min(h_cyl + h_cone - 0.1, f * (h_cyl + h_cone));
          ctx.fillStyle = `rgba(${Math.round(Tn * 255)},${Math.round((1 - Tn) * 180)},65,0.8)`;
          ctx.beginPath(); ctx.arc(px(rp), pz(zp), Math.max(2, (1 - f) * 5), 0, Math.PI * 2); ctx.fill();
        }
      }
  
      ctx.fillStyle = '#3d8048'; ctx.font = '10px Share Tech Mono';
      ctx.fillText('AIR IN', px(0.15), pz(0) - 28);
      ctx.fillText('NOZZLE', px(0.02), pz(0) + 14);
      ctx.fillStyle = '#ffb300'; ctx.fillText('PRODUCT', px(r_cone + 0.02), pz(h_cyl + h_cone) - 5);
      ctx.fillStyle = '#00e5ff'; ctx.fillText('AIR OUT', px(r_cyl * 0.4), pz(h_cyl + h_cone * 0.5));
    }
  
    /* ── Log helper ── */
    function log(msg, cls = '') {
      const el = document.getElementById('log-terminal');
      const sp = document.createElement('span');
      sp.className = cls;
      sp.textContent = `[${new Date().toTimeString().slice(0, 8)}] ${msg}`;
      el.appendChild(sp);
      el.appendChild(document.createElement('br'));
      el.scrollTop = el.scrollHeight;
    }
  
    /* ──────────────────────────────────────────────
       MAIN SIMULATION
    ────────────────────────────────────────────── */
    let lastResult = null;
  
    function runSim() {
      document.getElementById('log-terminal').innerHTML = '';
      log('Initializing spray dryer simulation...', 'info');
      log(`T_inlet=${params.T_inlet}°C  v_air=${params.v_air}m/s  d=${params.d_um}μm  T_feed=${params.T_feed}°C`);
      log(`Humidity=${params.humidity}  T_sim=${params.T_sim}s`);
  
      const result = simulate(params);
      lastResult = result;
  
      const N   = result.t.length;
      const sub = Math.max(1, Math.floor(N / 150));
      const ts  = result.t.filter((_, i) => i % sub === 0);
      const Xs  = result.X.filter((_, i) => i % sub === 0).map(x => x / (1 + x) * 100);
      const Ts  = result.T.filter((_, i) => i % sub === 0).map(t => t - 273.15);
      const Es  = result.evap.filter((_, i) => i % sub === 0);
  
      const X_final   = result.X[N - 1];
      const mc_wb     = X_final / (1 + X_final);
      const T_final_C = result.T[N - 1] - 273.15;
      const d_um      = result.d[N - 1] * 1e6;
      const qs        = qualityScore(mc_wb, T_final_C);
  
      document.getElementById('stat-mc').textContent   = (mc_wb * 100).toFixed(2) + '%';
      document.getElementById('stat-temp').textContent  = T_final_C.toFixed(1) + '°C';
      document.getElementById('stat-diam').textContent  = d_um.toFixed(1) + 'μm';
      document.getElementById('stat-qs').textContent    = qs.toFixed(1);
  
      const fill = document.getElementById('quality-fill');
      const verd = document.getElementById('quality-verdict');
      fill.style.width = qs + '%';
      if (mc_wb < 0.02) {
        fill.style.background = 'linear-gradient(90deg,#3d0000,#ff4040)';
        verd.textContent = '✗ OVERDRIED (<2%)'; verd.style.color = '#ff4040';
      } else if (mc_wb > 0.05) {
        fill.style.background = 'linear-gradient(90deg,#3d2200,#ffb300)';
        verd.textContent = '⚠ UNDERDRIED (>5%)'; verd.style.color = 'var(--amber)';
      } else {
        fill.style.background = 'linear-gradient(90deg,var(--green-dark),var(--green))';
        verd.textContent = '✓ OPTIMAL (2–5% wb)'; verd.style.color = 'var(--green)';
      }
  
      log(`Final: moisture=${(mc_wb * 100).toFixed(2)}%wb  T=${T_final_C.toFixed(1)}°C  d=${d_um.toFixed(1)}μm  QS=${qs.toFixed(1)}`, qs > 70 ? 'ok' : 'warn');
  
      const E_max   = Math.max(...Es);
      const E_scale = E_max > 0 ? Es.map(e => e / E_max * Math.max(...Xs)) : Es;
      makeChart('chart-drying', {
        type: 'line',
        data: {
          labels: ts.map(v => v.toFixed(1)),
          datasets: [
            { data: Xs,               borderColor: '#ffb300', backgroundColor: 'rgba(255,179,0,0.1)', borderWidth: 2,   pointRadius: 0, fill: true,  tension: 0.3 },
            { data: Ts.map(t => t/5), borderColor: '#ff4040', backgroundColor: 'transparent',          borderWidth: 1.5, pointRadius: 0, borderDash: [4,2], tension: 0.3 },
            { data: E_scale,          borderColor: '#00e5ff', backgroundColor: 'transparent',          borderWidth: 1.5, pointRadius: 0, borderDash: [2,4], tension: 0.3 },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: true, aspectRatio: 2,
          animation: { duration: 500, easing: 'easeInOutQuart' },
          scales: {
            x: { title: { display: true, text: 'Time (s)', color: '#3d8048' }, grid: { color: '#0a2912' } },
            y: { title: { display: true, text: 'Moisture (%wb) / scaled', color: '#3d8048' }, grid: { color: '#0a2912' } }
          },
          plugins: { legend: { display: false } }
        }
      });
  
      drawChamber(result);
      log('Chamber visualization updated.', 'ok');
    }
  
    /* ──────────────────────────────────────────────
       INVERSE MODEL
    ────────────────────────────────────────────── */
    document.getElementById('slider-target').addEventListener('input', function () {
      document.getElementById('val-target').textContent = parseFloat(this.value).toFixed(1);
    });
  
    document.getElementById('btn-predict').addEventListener('click', () => {
      const target = parseFloat(document.getElementById('slider-target').value) / 100;
      log(`Inverse model: target moisture = ${(target * 100).toFixed(1)}%`, 'info');
  
      const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
      const recs = {
        'T_INLET_C':        { val: clamp(220 - target * 800,       140, 220),  unit: '°C',    color: '#ff4040' },
        'V_AIR_MS':         { val: clamp(5 + (1 - target/0.08)*10, 5,   15),   unit: 'm/s',   color: '#00e5ff' },
        'DROPLET_DIAM_μM':  { val: clamp(40 + target * 600,        20,  150),  unit: 'μm',    color: '#00aaff' },
        'HUMIDITY_INLET':   { val: clamp(0.005 + target * 0.1,     0.005,0.02),unit: 'kg/kg', color: 'var(--amber)' },
        'T_FEED_C':         { val: 27,                                           unit: '°C',    color: 'var(--text-bright)' },
        'RESIDENCE_TIME_S': { val: clamp(3 + (1-target/0.08)*12,   3,   15),   unit: 's',     color: 'var(--green)' },
      };
  
      const ig = document.getElementById('inverse-grid');
      ig.innerHTML = '';
      Object.entries(recs).forEach(([k, v]) => {
        const div = document.createElement('div');
        div.style.cssText = 'background:var(--bg2);border:1px solid var(--border-hi);padding:.7rem';
        div.innerHTML = `
          <div style="font-size:.65rem;color:var(--text-dim);letter-spacing:.06em;margin-bottom:.3rem">${k}</div>
          <div style="font-family:var(--font-vt);font-size:1.5rem;color:${v.color}">
            ${v.val.toFixed(2)} <span style="font-size:.9rem;color:var(--text-dim)">${v.unit}</span>
          </div>`;
        ig.appendChild(div);
      });
  
      const targets = Array.from({ length: 30 }, (_, i) => 1 + i * 0.25);
      makeChart('chart-recommendation', {
        type: 'line',
        data: {
          labels: targets.map(t => t.toFixed(1)),
          datasets: [
            { data: targets.map(t => clamp(220-(t/100)*800,140,220)), borderColor:'#ff4040', backgroundColor:'rgba(255,64,64,0.1)',  borderWidth:2, pointRadius:0, fill:true, tension:0.4, yAxisID:'y',  label:'T_inlet (°C)' },
            { data: targets.map(t => clamp(5+(1-(t/100)/0.08)*10,5,15)), borderColor:'#00e5ff', backgroundColor:'rgba(0,229,255,0.08)', borderWidth:2, pointRadius:0, fill:true, tension:0.4, yAxisID:'y2', label:'v_air (m/s)' }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: true, aspectRatio: 2.5,
          animation: { duration: 400 },
          scales: {
            x:  { title:{display:true,text:'Target Moisture (%wb)',color:'#3d8048'}, grid:{color:'#0a2912'} },
            y:  { position:'left',  title:{display:true,text:'T_inlet (°C)', color:'#ff4040'}, grid:{color:'#0a2912'} },
            y2: { position:'right', title:{display:true,text:'v_air (m/s)',  color:'#00e5ff'}, grid:{drawOnChartArea:false} }
          },
          plugins: { legend:{ labels:{color:'#3d8048',boxWidth:12} } }
        }
      });
  
      document.getElementById('inverse-results').style.display = 'block';
      log(`Predicted: T_in=${recs['T_INLET_C'].val.toFixed(1)}°C  v=${recs['V_AIR_MS'].val.toFixed(2)}m/s  t_res=${recs['RESIDENCE_TIME_S'].val.toFixed(1)}s`, 'ok');
    });
  
    /* ── Init ── */
    initRosinChart();
    initTransferCharts();
    runSim();
  
    window.addEventListener('resize', () => { if (lastResult) drawChamber(lastResult); });
  });