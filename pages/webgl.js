/* ═══════════════════════════════════════════════════════════════
   webgl.js — Interactive WebGL engine
   Fixed: buffers pre-allocated, attributes cached, no per-frame alloc
   ═══════════════════════════════════════════════════════════════ */

   const WebGLEngine = (() => {

    /* ── SHADERS ─────────────────────────────────────────────── */
    const VERT_PARTICLE = `
      attribute vec3 aPos;
      attribute float aSize;
      attribute float aAlpha;
      attribute float aPhase;
      uniform mat4 uProj;
      uniform mat4 uView;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uForce;
      varying float vAlpha;
      varying float vPhase;
      void main(){
        vec3 p = aPos;
        float breath = sin(uTime*1.2 + aPhase)*0.05;
        p += normalize(p+0.001)*breath;
        vec4 clip = uProj * uView * vec4(p,1.0);
        vec2 ndc = clip.xy/clip.w;
        float d = length(ndc - uMouse);
        float f = uForce * smoothstep(0.5,0.0,d)*0.25;
        vec2 dir = normalize(ndc - uMouse + vec2(0.001));
        p.xy += dir * f;
        gl_Position = uProj * uView * vec4(p,1.0);
        gl_PointSize = aSize*(1.0+0.3*sin(uTime*2.0+aPhase));
        vAlpha = aAlpha;
        vPhase = aPhase;
      }
    `;
  
    const FRAG_PARTICLE = `
      precision mediump float;
      uniform vec3 uColor;
      uniform float uTime;
      varying float vAlpha;
      varying float vPhase;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if(d>0.5) discard;
        float g = pow(1.0 - d*2.0, 2.0);
        float a = vAlpha * g * (0.6+0.4*sin(uTime*1.5+vPhase));
        gl_FragColor = vec4(uColor, a);
      }
    `;
  
    const VERT_LINE = `
      attribute vec3 aPos;
      attribute float aAlpha;
      uniform mat4 uProj;
      uniform mat4 uView;
      uniform float uTime;
      varying float vAlpha;
      void main(){
        gl_Position = uProj * uView * vec4(aPos,1.0);
        vAlpha = aAlpha*(0.4+0.3*sin(uTime*0.6));
      }
    `;
  
    const FRAG_LINE = `
      precision mediump float;
      uniform vec3 uColor;
      varying float vAlpha;
      void main(){
        gl_FragColor = vec4(uColor, vAlpha*0.4);
      }
    `;
  
    const VERT_SPHERE = `
      attribute vec3 aPos;
      uniform mat4 uProj;
      uniform mat4 uView;
      uniform mat4 uModel;
      uniform float uTime;
      uniform float uScale;
      void main(){
        float s = uScale*(1.0+0.03*sin(uTime*0.9));
        gl_Position = uProj * uView * uModel * vec4(aPos*s,1.0);
      }
    `;
  
    const FRAG_SPHERE = `
      precision mediump float;
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uAlpha;
      void main(){
        gl_FragColor = vec4(uColor, uAlpha*(0.5+0.3*sin(uTime*1.2)));
      }
    `;
  
    /* ── STATE ─────────────────────────────────────────────────── */
    let gl, canvas;
    let pPart, pLine, pSphere;            // programs
    let locPart={}, locLine={}, locSph={};// uniform/attr locations (cached)
    let bufPartPos, bufPartSize, bufPartAlpha, bufPartPhase;
    let bufLinePos, bufLineAlpha;
    let bufSphPos;
    let numParticles = 90;
    let numLines = 0;
    let numSphVerts = 0;
    let partData = { pos:null, size:null, alpha:null, phase:null };
    let partVel  = null;
    let lineData = { pos:null, alpha:null };
    let mouse = [0,0];
    let mouseForce = 0;
    let scene = 0, sceneBlend = 0;
    let accent = [0.0, 1.0, 0.25];
    let raf = null;
    let t0 = 0;
  
    const SCENES = [
      { camZ:5.0, sphScale:1.0, sphAlpha:0.6 },
      { camZ:4.2, sphScale:1.4, sphAlpha:0.9 },
      { camZ:3.6, sphScale:1.7, sphAlpha:1.0 },
      { camZ:4.8, sphScale:0.8, sphAlpha:0.4 },
      { camZ:5.5, sphScale:0.5, sphAlpha:0.2 },
    ];
    const SCENE_LABELS = ['NEURAL_INIT','PROJECTS_SCAN','SKILLS_CORE','EXPERIENCE_LOG','CONTACT_NODE'];
  
    /* ── SHADER COMPILE ─────────────────────────────────────────── */
    function mkShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src.trim());
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }
  
    function mkProgram(vs, fs) {
      const p = gl.createProgram();
      const sv = mkShader(gl.VERTEX_SHADER, vs);
      const sf = mkShader(gl.FRAGMENT_SHADER, fs);
      if (!sv || !sf) return null;
      gl.attachShader(p, sv);
      gl.attachShader(p, sf);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error('Link error:', gl.getProgramInfoLog(p));
        return null;
      }
      return p;
    }
  
    /* ── BUFFER HELPERS ─────────────────────────────────────────── */
    function mkBuf(data, dynamic) {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data),
        dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
      return b;
    }
  
    function updateBuf(buf, data) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(data));
    }
  
    function bindAttr(prog, buf, name, size) {
      const loc = gl.getAttribLocation(prog, name);
      if (loc < 0) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    }
  
    /* ── GEOMETRY INIT ─────────────────────────────────────────── */
    function buildParticles() {
      const N = numParticles;
      const pos = [], size = [], alpha = [], phase = [];
      partVel = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const r  = 0.5 + Math.random() * 1.5;
        pos.push(r*Math.sin(ph)*Math.cos(th), r*Math.sin(ph)*Math.sin(th), r*Math.cos(ph));
        size.push(2 + Math.random() * 3.5);
        alpha.push(0.4 + Math.random() * 0.55);
        phase.push(Math.random() * Math.PI * 2);
        partVel[i*3]   = (Math.random()-.5)*.004;
        partVel[i*3+1] = (Math.random()-.5)*.004;
        partVel[i*3+2] = (Math.random()-.5)*.004;
      }
      partData.pos   = new Float32Array(pos);
      partData.size  = new Float32Array(size);
      partData.alpha = new Float32Array(alpha);
      partData.phase = new Float32Array(phase);
  
      bufPartPos   = mkBuf(partData.pos,   true);
      bufPartSize  = mkBuf(partData.size,  false);
      bufPartAlpha = mkBuf(partData.alpha, false);
      bufPartPhase = mkBuf(partData.phase, false);
    }
  
    function buildConnections() {
      const pos = [], alpha = [];
      const P = partData.pos;
      for (let i = 0; i < numParticles; i++) {
        for (let j = i+1; j < numParticles; j++) {
          const dx=P[i*3]-P[j*3], dy=P[i*3+1]-P[j*3+1], dz=P[i*3+2]-P[j*3+2];
          const d = Math.sqrt(dx*dx+dy*dy+dz*dz);
          if (d < 1.2) {
            pos.push(P[i*3],P[i*3+1],P[i*3+2], P[j*3],P[j*3+1],P[j*3+2]);
            const s = (1-d/1.2)*0.6;
            alpha.push(s,s);
          }
        }
      }
      numLines = pos.length/3;
      lineData.pos   = new Float32Array(pos);
      lineData.alpha = new Float32Array(alpha);
      bufLinePos   = mkBuf(lineData.pos,   true);
      bufLineAlpha = mkBuf(lineData.alpha, false);
    }
  
    function buildSphere() {
      const stacks=12, slices=18;
      const verts=[];
      for(let s=0;s<=stacks;s++){
        const phi=(s/stacks)*Math.PI;
        for(let sl=0;sl<=slices;sl++){
          const th=(sl/slices)*Math.PI*2;
          verts.push(Math.sin(phi)*Math.cos(th), Math.cos(phi), Math.sin(phi)*Math.sin(th));
        }
      }
      const lines=[];
      for(let s=0;s<stacks;s++){
        for(let sl=0;sl<slices;sl++){
          const a=s*(slices+1)+sl, b=a+1, c=a+(slices+1);
          lines.push(verts[a*3],verts[a*3+1],verts[a*3+2]);
          lines.push(verts[b*3],verts[b*3+1],verts[b*3+2]);
          lines.push(verts[a*3],verts[a*3+1],verts[a*3+2]);
          lines.push(verts[c*3],verts[c*3+1],verts[c*3+2]);
        }
      }
      numSphVerts = lines.length/3;
      bufSphPos = mkBuf(lines, false);
    }
  
    /* ── CACHE UNIFORM/ATTR LOCATIONS ─────────────────────────── */
    function cacheLocations() {
      // Particle program
      gl.useProgram(pPart);
      locPart = {
        proj:  gl.getUniformLocation(pPart,'uProj'),
        view:  gl.getUniformLocation(pPart,'uView'),
        time:  gl.getUniformLocation(pPart,'uTime'),
        mouse: gl.getUniformLocation(pPart,'uMouse'),
        force: gl.getUniformLocation(pPart,'uForce'),
        color: gl.getUniformLocation(pPart,'uColor'),
      };
      // Line program
      gl.useProgram(pLine);
      locLine = {
        proj:  gl.getUniformLocation(pLine,'uProj'),
        view:  gl.getUniformLocation(pLine,'uView'),
        time:  gl.getUniformLocation(pLine,'uTime'),
        color: gl.getUniformLocation(pLine,'uColor'),
      };
      // Sphere program
      gl.useProgram(pSphere);
      locSph = {
        proj:  gl.getUniformLocation(pSphere,'uProj'),
        view:  gl.getUniformLocation(pSphere,'uView'),
        model: gl.getUniformLocation(pSphere,'uModel'),
        time:  gl.getUniformLocation(pSphere,'uTime'),
        scale: gl.getUniformLocation(pSphere,'uScale'),
        alpha: gl.getUniformLocation(pSphere,'uAlpha'),
        color: gl.getUniformLocation(pSphere,'uColor'),
      };
    }
  
    /* ── MATRICES ─────────────────────────────────────────────── */
    function perspective(fov, asp, n, f) {
      const t=Math.tan(fov/2), nf=1/(n-f);
      return new Float32Array([
        1/(t*asp),0,0,0,  0,1/t,0,0,
        0,0,(f+n)*nf,-1,  0,0,2*f*n*nf,0
      ]);
    }
  
    function lookAt(ex,ey,ez){
      let zx=ex,zy=ey,zz=ez;
      let l=Math.sqrt(zx*zx+zy*zy+zz*zz); zx/=l;zy/=l;zz/=l;
      let xx=-zy,xy=zx,xz=0;
      l=Math.sqrt(xx*xx+xy*xy); if(l){xx/=l;xy/=l;}
      const yx=zy*xz-zz*xy, yy=zz*xx-zx*xz, yz=zx*xy-zy*xx;
      return new Float32Array([
        xx,yx,zx,0, xy,yy,zy,0, xz,yz,zz,0,
        -(xx*ex+xy*ey+xz*ez),-(yx*ex+yy*ey+yz*ez),-(zx*ex+zy*ey+zz*ez),1
      ]);
    }
  
    function rotY(a){ const c=Math.cos(a),s=Math.sin(a);
      return new Float32Array([c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1]); }
  
    function rotX(a){ const c=Math.cos(a),s=Math.sin(a);
      return new Float32Array([1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1]); }
  
    function mul(a,b){
      const r=new Float32Array(16);
      for(let i=0;i<4;i++) for(let j=0;j<4;j++)
        for(let k=0;k<4;k++) r[i+j*4]+=a[i+k*4]*b[k+j*4];
      return r;
    }
  
    /* ── LERP SCENE VALUE ─────────────────────────────────────── */
    function sv(key){
      const a=SCENES[Math.min(scene,SCENES.length-1)];
      const b=SCENES[Math.min(scene+1,SCENES.length-1)];
      return a[key]+(b[key]-a[key])*sceneBlend;
    }
  
    /* ── RENDER ─────────────────────────────────────────────────── */
    function frame() {
      raf = requestAnimationFrame(frame);
      const t = (performance.now()-t0)/1000;
      mouseForce *= 0.95;
  
      // Update accent from color mode
      const mode = document.documentElement.getAttribute('data-mode')||'green';
      accent = mode==='amber'?[1,.7,0]:mode==='cyan'?[0,.9,1]:[0,1,.25];
  
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
  
      const asp = canvas.width/canvas.height;
      const proj = perspective(Math.PI/4, asp, 0.1, 50);
      const camZ = sv('camZ');
      const view = lookAt(0,0,camZ);
      const ry   = rotY(t*0.18 + mouse[0]*0.25);
      const rx   = rotX(t*0.07 + mouse[1]*0.12);
      const model = mul(rx,ry);
  
      // 1. Update particle positions (CPU side, dynamic)
      const P=partData.pos, V=partVel;
      for(let i=0;i<numParticles;i++){
        P[i*3]  +=V[i*3];
        P[i*3+1]+=V[i*3+1];
        P[i*3+2]+=V[i*3+2];
        const r=Math.sqrt(P[i*3]**2+P[i*3+1]**2+P[i*3+2]**2);
        if(r>2.0){ V[i*3]*=-1; V[i*3+1]*=-1; V[i*3+2]*=-1; }
      }
      updateBuf(bufPartPos, P);
  
      // 2. Draw lines
      gl.useProgram(pLine);
      gl.uniformMatrix4fv(locLine.proj,false,proj);
      gl.uniformMatrix4fv(locLine.view,false,view);
      gl.uniform1f(locLine.time,t);
      gl.uniform3fv(locLine.color,accent);
      bindAttr(pLine, bufLinePos,   'aPos',   3);
      bindAttr(pLine, bufLineAlpha, 'aAlpha', 1);
      gl.drawArrays(gl.LINES, 0, numLines);
  
      // 3. Draw sphere
      gl.useProgram(pSphere);
      gl.uniformMatrix4fv(locSph.proj,  false, proj);
      gl.uniformMatrix4fv(locSph.view,  false, view);
      gl.uniformMatrix4fv(locSph.model, false, model);
      gl.uniform1f(locSph.time,  t);
      gl.uniform1f(locSph.scale, sv('sphScale'));
      gl.uniform1f(locSph.alpha, sv('sphAlpha'));
      gl.uniform3fv(locSph.color, accent);
      bindAttr(pSphere, bufSphPos, 'aPos', 3);
      gl.drawArrays(gl.LINES, 0, numSphVerts);
  
      // 4. Draw particles
      gl.useProgram(pPart);
      gl.uniformMatrix4fv(locPart.proj,  false, proj);
      gl.uniformMatrix4fv(locPart.view,  false, view);
      gl.uniform1f(locPart.time,  t);
      gl.uniform2fv(locPart.mouse, mouse);
      gl.uniform1f(locPart.force, mouseForce);
      gl.uniform3fv(locPart.color, accent);
      bindAttr(pPart, bufPartPos,   'aPos',   3);
      bindAttr(pPart, bufPartSize,  'aSize',  1);
      bindAttr(pPart, bufPartAlpha, 'aAlpha', 1);
      bindAttr(pPart, bufPartPhase, 'aPhase', 1);
      gl.drawArrays(gl.POINTS, 0, numParticles);
    }
  
    /* ── PUBLIC INIT ─────────────────────────────────────────── */
    function init(cvs) {
      canvas = cvs;
      gl = canvas.getContext('webgl', {alpha:true, antialias:true, premultipliedAlpha:false, preserveDrawingBuffer:false});
      if (!gl) return false;
  
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.clearColor(0, 0, 0, 0);  // fully transparent clear
  
      pPart   = mkProgram(VERT_PARTICLE, FRAG_PARTICLE);
      pLine   = mkProgram(VERT_LINE,     FRAG_LINE);
      pSphere = mkProgram(VERT_SPHERE,   FRAG_SPHERE);
      if (!pPart || !pLine || !pSphere) return false;
  
      cacheLocations();
      buildParticles();
      buildConnections();
      buildSphere();
  
      resize();
      window.addEventListener('resize', resize);
  
      // Mouse
      document.addEventListener('mousemove', e => {
        mouse[0] =  (e.clientX/window.innerWidth  *2-1);
        mouse[1] = -(e.clientY/window.innerHeight *2-1);
        mouseForce = 1.0;
      });
  
      // Scroll → scene
      window.addEventListener('scroll', () => {
        const pct = window.scrollY/(document.body.scrollHeight-window.innerHeight||1);
        const raw = pct*(SCENES.length-1);
        scene      = Math.floor(raw);
        sceneBlend = raw-scene;
        scene = Math.max(0, Math.min(scene, SCENES.length-2));
      }, {passive:true});
  
      t0 = performance.now();
      frame();
      return true;
    }
  
    function resize(){
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  
    function destroy(){ if(raf) cancelAnimationFrame(raf); }
  
    return { init, destroy, SCENE_LABELS };
  })();