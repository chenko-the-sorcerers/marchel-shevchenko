/* ── CURSOR — uses same #cursor-dot / #cursor-ring as crt.js ── */
(function() {
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;
    let mx = -100, my = -100, rx = -100, ry = -100;
    const lerp = (a, b, t) => a + (b - a) * t;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    (function tick() {
      rx = lerp(rx, mx, 0.12); ry = lerp(ry, my, 0.12);
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(tick);
    })();
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
    document.addEventListener('mouseover', e => {
      const hover = !!e.target.closest('a, button, .ctrl-btn, .diff-btn, .promo-piece, .t-card, [onclick]');
      document.body.classList.toggle('cursor-hover', hover);
    });
  })();
  
  /* ── NAVBAR hamburger ── */
  document.getElementById('nav-hamburger').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
  });
  
  /* ── REVEAL ── */
  new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i * 60); }
    });
  }, { threshold: 0.08 }).observe || (function() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => { if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 60); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  })();
  (function() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => { if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 60); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  })();
  
  /* ── BG CANVAS ── */
  (function() {
    const c = document.getElementById('bg-canvas'), ctx = c.getContext('2d');
    function rsz() { c.width = innerWidth; c.height = innerHeight; }
    rsz(); window.addEventListener('resize', rsz);
    const pts = Array.from({length: 48}, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.2 + 0.4, a: Math.random() * 0.22 + 0.05
    }));
    (function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,255,65,' + p.a + ')'; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) for (let j = i+1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx*dx + dy*dy);
        if (d < 85) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = 'rgba(0,255,65,' + (0.05 * (1 - d/85)) + ')'; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      requestAnimationFrame(draw);
    })();
  })();
  
  /* ═══════════════════════════
     CHESS ENGINE
     ═══════════════════════════ */
  const GLYPHS = { wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙', bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟' };
  const VALS = { P:100, N:320, B:330, R:500, Q:900, K:20000 };
  const PST = {
    P:[[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
    N:[[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
    B:[[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
    R:[[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]],
    Q:[[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
    K:[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]]
  };
  
  let G = {};
  
  function ib(r,c) { return r>=0&&r<8&&c>=0&&c<8; }
  function dc(b) { return b.map(r => r.slice()); }
  function fk(b,col) { for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(b[r][c]===col+'K') return [r,c]; return null; }
  
  function rawMoves(b,r,c,ep,cast) {
    const p=b[r][c]; if(!p) return [];
    const col=p[0], t=p[1], op=col==='w'?'b':'w', mv=[];
    const push=(tr,tc,f='')=>{ if(ib(tr,tc)) mv.push([tr,tc,f]); };
    const slide=(dr,dc)=>{ let nr=r+dr,nc=c+dc; while(ib(nr,nc)){ if(!b[nr][nc]){mv.push([nr,nc,'']);nr+=dr;nc+=dc;}else{if(b[nr][nc][0]===op)mv.push([nr,nc,'']);break;} } };
    if(t==='P'){ const d=col==='w'?-1:1,s=col==='w'?6:1; if(ib(r+d,c)&&!b[r+d][c]){push(r+d,c);if(r===s&&!b[r+2*d][c])push(r+2*d,c);} for(const dc of[-1,1]){if(ib(r+d,c+dc)&&b[r+d][c+dc]?.[0]===op)push(r+d,c+dc);if(ep&&ep[0]===r+d&&ep[1]===c+dc)push(r+d,c+dc,'ep');} }
    if(t==='N'){ for(const[dr,dc]of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])if(ib(r+dr,c+dc)&&b[r+dr][c+dc]?.[0]!==col)push(r+dr,c+dc); }
    if(t==='B') for(const[dr,dc]of[[-1,-1],[-1,1],[1,-1],[1,1]])slide(dr,dc);
    if(t==='R') for(const[dr,dc]of[[-1,0],[1,0],[0,-1],[0,1]])slide(dr,dc);
    if(t==='Q') for(const[dr,dc]of[[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]])slide(dr,dc);
    if(t==='K'){
      for(const[dr,dc]of[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]])if(ib(r+dr,c+dc)&&b[r+dr][c+dc]?.[0]!==col)push(r+dr,c+dc);
      const row=col==='w'?7:0;
      if(r===row&&c===4&&cast[col+'K']){
        if(!b[row][5]&&!b[row][6]&&b[row][7]===col+'R'&&cast[col+'R_k']&&!sqAtk(b,row,4,op,ep)&&!sqAtk(b,row,5,op,ep))push(row,6,'castle_k');
        if(!b[row][3]&&!b[row][2]&&!b[row][1]&&b[row][0]===col+'R'&&cast[col+'R_q']&&!sqAtk(b,row,4,op,ep)&&!sqAtk(b,row,3,op,ep))push(row,2,'castle_q');
      }
    }
    return mv;
  }
  
  function sqAtk(b,r,c,byCol,ep) {
    for(let rr=0;rr<8;rr++) for(let cc=0;cc<8;cc++) if(b[rr][cc]?.[0]===byCol) {
      if(rawMoves(b,rr,cc,ep,{wK:false,wR_k:false,wR_q:false,bK:false,bR_k:false,bR_q:false}).some(m=>m[0]===r&&m[1]===c)) return true;
    }
    return false;
  }
  
  function inChk(b,col,ep,cast) { const k=fk(b,col); return k?sqAtk(b,k[0],k[1],col==='w'?'b':'w',ep):false; }
  
  function applyM(b,r1,c1,r2,c2,flag,promo) {
    const nb=dc(b), p=nb[r1][c1];
    nb[r2][c2]=p; nb[r1][c1]=null;
    if(flag==='ep') nb[r1][c2]=null;
    if(flag==='castle_k'){nb[r2][5]=nb[r2][7];nb[r2][7]=null;}
    if(flag==='castle_q'){nb[r2][3]=nb[r2][0];nb[r2][0]=null;}
    if(promo&&((p==='wP'&&r2===0)||(p==='bP'&&r2===7))) nb[r2][c2]=promo;
    return nb;
  }
  
  function getLegal(b,r,c,col,ep,cast) {
    if(!b[r][c]||b[r][c][0]!==col) return [];
    return rawMoves(b,r,c,ep,cast).filter(([tr,tc,f])=>{
      const nb=applyM(b,r,c,tr,tc,f,col+'Q');
      return !inChk(nb,col,null,{wK:false,wR_k:false,wR_q:false,bK:false,bR_k:false,bR_q:false});
    });
  }
  
  function allLegal(b,col,ep,cast) {
    const m=[];
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(b[r][c]?.[0]===col) getLegal(b,r,c,col,ep,cast).forEach(x=>m.push([r,c,...x]));
    return m;
  }
  
  function isMate(b,col,ep,cast) { return inChk(b,col,ep,cast)&&allLegal(b,col,ep,cast).length===0; }
  function isStal(b,col,ep,cast) { return !inChk(b,col,ep,cast)&&allLegal(b,col,ep,cast).length===0; }
  
  function evalB(b) {
    let s=0;
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){
      const p=b[r][c]; if(!p) continue;
      const col=p[0],t=p[1],ti=col==='b'?r:7-r;
      s += (col==='b'?1:-1)*((VALS[t]||0)+((PST[t]||[])[ti]?.[c]||0));
    }
    return s;
  }
  
  function updCast(cast,p,r,c) {
    const nc={...cast};
    if(p==='wK'){nc.wK=false;nc.wR_k=false;nc.wR_q=false;}
    if(p==='bK'){nc.bK=false;nc.bR_k=false;nc.bR_q=false;}
    if(r===7&&c===7)nc.wR_k=false; if(r===7&&c===0)nc.wR_q=false;
    if(r===0&&c===7)nc.bR_k=false; if(r===0&&c===0)nc.bR_q=false;
    return nc;
  }
  
  function minimax(b,depth,a,be,isMax,col,ep,cast) {
    const op=col==='w'?'b':'w';
    if(depth===0) return evalB(b);
    const moves=allLegal(b,col,ep,cast);
    if(!moves.length) return inChk(b,col,ep,cast)?(isMax?-999999:999999):0;
    if(isMax){
      let best=-Infinity;
      for(const m of moves){
        const nc=updCast(cast,b[m[0]][m[1]],m[0],m[1]),nb=applyM(b,m[0],m[1],m[2],m[3],m[4],col+'Q');
        let ne=null; if(b[m[0]][m[1]]?.[1]==='P'&&Math.abs(m[2]-m[0])===2)ne=[(m[0]+m[2])/2,m[1]];
        best=Math.max(best,minimax(nb,depth-1,a,be,false,op,ne,nc)); a=Math.max(a,best); if(be<=a)break;
      }
      return best;
    } else {
      let best=Infinity;
      for(const m of moves){
        const nc=updCast(cast,b[m[0]][m[1]],m[0],m[1]),nb=applyM(b,m[0],m[1],m[2],m[3],m[4],col+'Q');
        let ne=null; if(b[m[0]][m[1]]?.[1]==='P'&&Math.abs(m[2]-m[0])===2)ne=[(m[0]+m[2])/2,m[1]];
        best=Math.min(best,minimax(nb,depth-1,a,be,true,op,ne,nc)); be=Math.min(be,best); if(be<=a)break;
      }
      return best;
    }
  }
  
  function bestMove(b,col,ep,cast,depth) {
    const moves=allLegal(b,col,ep,cast); if(!moves.length) return null;
    let best=null, bv=col==='b'?-Infinity:Infinity;
    for(const m of [...moves].sort(()=>Math.random()-0.5)){
      const nc=updCast(cast,b[m[0]][m[1]],m[0],m[1]),nb=applyM(b,m[0],m[1],m[2],m[3],m[4],col+'Q');
      let ne=null; if(b[m[0]][m[1]]?.[1]==='P'&&Math.abs(m[2]-m[0])===2)ne=[(m[0]+m[2])/2,m[1]];
      const op=col==='w'?'b':'w', v=minimax(nb,depth-1,-Infinity,Infinity,col==='b'?false:true,op,ne,nc);
      if((col==='b'&&v>bv)||(col==='w'&&v<bv)){bv=v;best=m;}
    }
    return best;
  }
  
  function toSAN(b,r1,c1,r2,c2,flag,pt,nb2) {
    const p=b[r1][c1]; if(!p) return '?';
    const f='abcdefgh',t=p[1],col=p[0],op=col==='w'?'b':'w';
    if(flag==='castle_k') return 'O-O'; if(flag==='castle_q') return 'O-O-O';
    let s=''; if(t!=='P')s+=t; else if(b[r2][c2]||flag==='ep')s+=f[c1];
    if(b[r2][c2]||flag==='ep')s+='x'; s+=f[c2]+(8-r2);
    if(pt&&pt!==t)s+='='+pt;
    if(isMate(nb2,op,null,{wK:false,wR_k:false,wR_q:false,bK:false,bR_k:false,bR_q:false}))s+='#';
    else if(inChk(nb2,op,null,{wK:false,wR_k:false,wR_q:false,bK:false,bR_k:false,bR_q:false}))s+='+';
    return s;
  }
  
  /* ── RENDER ── */
  function renderBoard() {
    const grid = document.getElementById('board-grid');
    if (!grid) return;
    const lgl = G.sel ? getLegal(G.board,G.sel[0],G.sel[1],G.turn,G.ep,G.cast) : [];
    const lset = new Set(lgl.map(m=>m[0]+','+m[1]));
    const last = G.hist[G.hist.length-1];
    const chk = inChk(G.board,G.turn,G.ep,G.cast);
    const kpos = chk ? fk(G.board,G.turn) : null;
  
    let html = '<table style="width:100%;border-collapse:collapse;table-layout:fixed"><tbody>';
    for (let r=0; r<8; r++) {
      html += '<tr>';
      html += `<td style="width:18px;padding:0;text-align:center;font-size:0.58rem;color:var(--text-dim);vertical-align:middle;user-select:none;font-family:var(--font-mono)">${8-r}</td>`;
      for (let c=0; c<8; c++) {
        const isLt=(r+c)%2===0, key=r+','+c, piece=G.board[r][c];
        let bg=isLt?'#1a2e1c':'#0d1a0e', ex='', dot='';
        if(last){if(last.from[0]===r&&last.from[1]===c)bg='rgba(255,179,0,0.12)';if(last.to[0]===r&&last.to[1]===c)bg='rgba(255,179,0,0.22)';}
        if(kpos&&kpos[0]===r&&kpos[1]===c)bg='rgba(255,68,68,0.32)';
        if(G.sel&&G.sel[0]===r&&G.sel[1]===c){bg='rgba(0,255,65,0.25)';ex='outline:2px solid #00ff41;outline-offset:-2px;';}
        if(G.hint&&G.hint[0]===r&&G.hint[1]===c){bg='rgba(0,229,255,0.18)';ex='outline:2px solid #00e5ff;outline-offset:-2px;';}
        if(lset.has(key)){
          if(piece)ex='box-shadow:inset 0 0 0 3px rgba(0,255,65,0.45);';
          else dot='<div style="width:30%;height:30%;border-radius:50%;background:rgba(0,255,65,0.4);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:1"></div>';
        }
        const gl = piece ? `<span style="position:relative;z-index:2;line-height:1;pointer-events:none;font-size:clamp(16px,3.3vw,34px)">${GLYPHS[piece]}</span>` : '';
        html += `<td onclick="handleClick(${r},${c})" style="padding:0;background:${bg};${ex}cursor:pointer;position:relative;text-align:center;vertical-align:middle;transition:background 0.08s">${dot}${gl}</td>`;
      }
      html += '</tr>';
    }
    html += '<tr><td style="height:16px;padding:0"></td>';
    for(let c=0;c<8;c++) html += `<td style="height:16px;padding:0;text-align:center;font-size:0.58rem;color:var(--text-dim);font-family:var(--font-mono)">${'abcdefgh'[c]}</td>`;
    html += '</tr></tbody></table>';
    grid.innerHTML = html;
  
    requestAnimationFrame(() => {
      const tds = grid.querySelectorAll('td[onclick]');
      if (tds.length) { const w = tds[0].offsetWidth; tds.forEach(td => td.style.height = w + 'px'); }
    });
  }
  
  window.addEventListener('resize', () => {
    const tds = document.querySelectorAll('#board-grid td[onclick]');
    if (tds.length) { const w = tds[0].offsetWidth; tds.forEach(td => td.style.height = w + 'px'); }
  });
  
  function renderPlayers() {
    const pw={P:'♟',N:'♞',B:'♝',R:'♜',Q:'♛'}, pb={P:'♙',N:'♘',B:'♗',R:'♖',Q:'♕'};
    document.getElementById('cap-white').textContent = G.capW.map(p=>pw[p]||p).join('');
    document.getElementById('cap-black').textContent = G.capB.map(p=>pb[p]||p).join('');
    const sw=G.capW.reduce((s,p)=>s+(VALS[p]||0),0), sb=G.capB.reduce((s,p)=>s+(VALS[p]||0),0), diff=sw-sb;
    const scw=document.getElementById('score-white'), scb=document.getElementById('score-black');
    scw.textContent=diff>0?'+'+diff:''; scw.className='player-score'+(diff>0?' ahead':'');
    scb.textContent=diff<0?'+'+Math.abs(diff):''; scb.className='player-score'+(diff<0?' ahead':'');
    document.getElementById('bar-user').classList.toggle('active', G.turn==='w'&&!G.over);
    const bai=document.getElementById('bar-ai'); bai.classList.toggle('active',G.turn==='b'&&!G.over); bai.classList.toggle('ai',true);
  }
  
  function handleClick(r,c) {
    if (G.over||G.turn!=='w') return;
    G.hint = null;
    if (G.sel) {
      const lgl = getLegal(G.board,G.sel[0],G.sel[1],G.turn,G.ep,G.cast);
      const m = lgl.find(x=>x[0]===r&&x[1]===c);
      if (m) {
        if (G.board[G.sel[0]][G.sel[1]]==='wP'&&r===0) { showPromo(G.sel[0],G.sel[1],r,c,m[2]); return; }
        commit(G.sel[0],G.sel[1],r,c,m[2],null); G.sel=null; return;
      }
    }
    G.sel = G.board[r][c]?.[0]==='w' ? [r,c] : null;
    renderBoard();
  }
  
  function showPromo(r1,c1,r2,c2,flag) {
    const ov=document.getElementById('promo-overlay'); ov.classList.add('show');
    ov.querySelectorAll('.promo-piece').forEach(el => {
      el.onclick = () => { ov.classList.remove('show'); commit(r1,c1,r2,c2,flag,el.dataset.piece); G.sel=null; };
    });
  }
  
  /* ── SFX helper — safe call, only fires if audio.js is loaded ── */
  function sfx(name) { if(typeof SFX !== 'undefined' && typeof SFX[name] === 'function') SFX[name](); }
  
  function commit(r1,c1,r2,c2,flag,pch) {
    const p=G.board[r1][c1], cap=G.board[r2][c2], col=p[0];
    if(cap)(col==='w'?G.capW:G.capB).push(cap[1]);
    if(flag==='ep'){const ec=G.board[r1][c2];if(ec)(col==='w'?G.capW:G.capB).push(ec[1]);}
    const isP=(p==='wP'&&r2===0)||(p==='bP'&&r2===7), pf=isP?(col+(pch||'Q')):null;
    const nb=applyM(G.board,r1,c1,r2,c2,flag,pf||p), nc=updCast(G.cast,p,r1,c1);
    let ne=null; if(p[1]==='P'&&Math.abs(r2-r1)===2)ne=[(r1+r2)/2,c1];
    const san=toSAN(G.board,r1,c1,r2,c2,flag,pch||'Q',nb);
    G.hist.push({from:[r1,c1],to:[r2,c2],san,p,cap,board:dc(G.board),cast:{...G.cast},ep:G.ep});
  
    /* ── move sound (before board changes) ── */
    if      (flag==='castle_k'||flag==='castle_q') sfx('playCastle');
    else if (isP)                                   sfx('playPromotion');
    else if (cap||flag==='ep')                      sfx('playPieceCapture');
    else                                            sfx('playPieceMove');
  
    G.board=nb; G.cast=nc; G.ep=ne; G.turn=G.turn==='w'?'b':'w';
    renderBoard(); renderPlayers(); updateLog();
    const op=G.turn;
  
    if(isMate(G.board,op,G.ep,G.cast)){
      G.over=true;
      setSt(op==='b'?'You win by checkmate!':'AI wins by checkmate!',op==='b'?'win':'mate');
      setTimeout(()=>sfx('playCheckmate'), 150); /* slight delay after move sound */
      return;
    }
    if(isStal(G.board,op,G.ep,G.cast)){
      G.over=true;
      setSt('Stalemate — draw!','draw');
      setTimeout(()=>sfx('playDraw'), 150);
      return;
    }
    if(inChk(G.board,op,G.ep,G.cast)){
      setSt(op==='w'?'You are in check!':'AI is in check!','chk');
      setTimeout(()=>sfx('playCheck'), 100);
    } else {
      setSt(op==='w'?'marchel@sys:~$ your-turn':'marchel@sys:~$ ai.think()','');
    }
    if(G.turn==='b'&&!G.over)setTimeout(aiTurn, 260);
  }
  
  function aiTurn() {
    document.getElementById('thinking-row').style.display='flex';
    setTimeout(()=>{
      const m=bestMove(G.board,'b',G.ep,G.cast,G.depth);
      document.getElementById('thinking-row').style.display='none';
      if(m){ sfx('playAIDone'); commit(m[0],m[1],m[2],m[3],m[4],null); }
    }, 80);
  }
  
  function setSt(msg,type) {
    const im={win:'✓',chk:'⚠',mate:'✗',draw:'◈','':'◆'};
    document.getElementById('status-icon').textContent=im[type]||'◆';
    const tx=document.getElementById('status-text'); tx.textContent=msg; tx.className='status-text '+(type||'');
  }
  
  function updateLog() {
    const g=document.getElementById('move-log-grid'); g.innerHTML='';
    for(let i=0;i<G.hist.length;i+=2){
      const mn=document.createElement('span'); mn.className='ml-num'; mn.textContent=(Math.floor(i/2)+1)+'.';
      const mw=document.createElement('span'); mw.className='ml-mv'+(i===G.hist.length-1?' cur':''); mw.textContent=G.hist[i]?.san||'';
      const mb=document.createElement('span'); mb.className='ml-mv'+(i+1===G.hist.length-1?' cur':''); mb.textContent=G.hist[i+1]?.san||'';
      g.appendChild(mn); g.appendChild(mw); g.appendChild(mb);
    }
    const s=document.getElementById('move-log-scroll'); s.scrollTop=s.scrollHeight;
  }
  
  function initGame() {
    const b=Array.from({length:8},()=>new Array(8).fill(null));
    const back=['R','N','B','Q','K','B','N','R'];
    for(let c=0;c<8;c++){b[0][c]='b'+back[c];b[1][c]='bP';b[6][c]='wP';b[7][c]='w'+back[c];}
    G={board:b,turn:'w',sel:null,ep:null,cast:{wK:true,wR_k:true,wR_q:true,bK:true,bR_k:true,bR_q:true},hist:[],capW:[],capB:[],over:false,hint:null,depth:3};
    renderBoard(); renderPlayers(); updateLog();
    setSt('marchel@sys:~$ your-turn','');
    document.getElementById('thinking-row').style.display='none';
  }
  
  window.newGame  = () => initGame();
  window.undoMove = () => {
    if(G.hist.length<2)return;
    sfx('playUndo');
    for(let i=0;i<2&&G.hist.length>0;i++){const l=G.hist.pop();G.board=l.board;G.cast=l.cast;G.ep=l.ep;G.turn=G.turn==='w'?'b':'w';if(l.cap)(G.turn==='w'?G.capW:G.capB).pop();}
    G.over=false;G.hint=null;G.sel=null;
    document.getElementById('thinking-row').style.display='none';
    renderBoard();renderPlayers();updateLog();setSt('marchel@sys:~$ your-turn','');
  };
  window.offerDraw = () => {
    if(G.over)return;
    if(Math.abs(evalB(G.board))<150){G.over=true;setSt('Draw agreed!','draw');sfx('playDraw');}
    else {sfx('playIllegalMove');setSt(evalB(G.board)<0?'AI declined — you are behind':'AI declined — you lead','');}
  };
  window.showHint = () => {
    if(G.over||G.turn!=='w')return;
    const m=bestMove(G.board,'w',G.ep,G.cast,2);
    if(m){sfx('playHint');G.hint=[m[0],m[1]];renderBoard();setTimeout(()=>{G.hint=null;renderBoard();},1800);}
  };
  window.setDiff = btn => {
    document.querySelectorAll('.diff-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); G.depth=parseInt(btn.dataset.depth);
  };
  
  initGame();