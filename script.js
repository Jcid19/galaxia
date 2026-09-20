/* ================= JS — script.js ================= */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 6000);
camera.position.set(0, 60, 900);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.minDistance = 60;
controls.maxDistance = 450;
controls.enablePan = false;
controls.enabled = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.28;
controls.target.set(0, 10, 0);

/* ---------- Generadores de Partículas de Luz ---------- */
function dot(inner = 'rgba(255,240,205,1)') {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, 'rgba(255,205,110,0.85)');
  g.addColorStop(0.6, 'rgba(255,160,50,0.22)');
  g.addColorStop(1, 'rgba(255,150,30,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function whiteDot() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,250,235,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function labelTex(text, fs = 64) {
  const m = document.createElement('canvas').getContext('2d');
  m.font = `bold ${fs}px "Trebuchet MS","Segoe UI",sans-serif`;
  const w = Math.ceil(m.measureText(text).width) + 70, h = fs * 2;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.font = `bold ${fs}px "Trebuchet MS","Segoe UI",sans-serif`;
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.shadowColor = 'rgba(255,170,40,0.9)'; x.shadowBlur = 30;
  x.fillStyle = '#fff8e8';
  x.fillText(text, w / 2, h / 2);
  x.shadowBlur = 12; x.fillText(text, w / 2, h / 2);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8;
  return { texture: t, ratio: w / h };
}

const SPARK = dot(), STAR = whiteDot();

/* ---------- RAMOS BOTÁNICOS REALES PROCEDURALES (512x512 HD) ---------- */
function createRealBotanicalBouquet(type) {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');

  function drawStem(x1, y1, x2, y2, w = 6) {
    ctx.save();
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, '#3f6212');
    g.addColorStop(0.5, '#65a30d');
    g.addColorStop(1, '#233808');
    ctx.strokeStyle = g;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2 + 10, (y1 + y2) / 2, x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function drawLeaf(x, y, angle, w = 18, h = 45) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const lg = ctx.createLinearGradient(0, 0, 0, -h);
    lg.addColorStop(0, '#1e3a0f');
    lg.addColorStop(0.5, '#4d7c0f');
    lg.addColorStop(1, '#84cc16');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-w, -h * 0.4, 0, -h);
    ctx.quadraticCurveTo(w, -h * 0.4, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  function drawSingleSunflower(cx, cy, radius, scale = 1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    const petals = 22;
    for (let layer = 0; layer < 2; layer++) {
      const pLen = radius * (layer === 0 ? 1.0 : 0.85);
      const pW = radius * 0.22;
      const c1 = layer === 0 ? '#ca8a04' : '#eab308';
      const c2 = layer === 0 ? '#facc15' : '#fef08a';
      for (let i = 0; i < petals; i++) {
        ctx.save();
        ctx.rotate((i / petals) * Math.PI * 2 + (layer * Math.PI / petals));
        const pg = ctx.createLinearGradient(0, 0, 0, -pLen);
        pg.addColorStop(0, c1);
        pg.addColorStop(0.6, c2);
        pg.addColorStop(1, '#fffbeb');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-pW, -pLen * 0.4, -pW * 0.7, -pLen * 0.85, 0, -pLen);
        ctx.bezierCurveTo(pW * 0.7, -pLen * 0.85, pW, -pLen * 0.4, 0, 0);
        ctx.fill();
        ctx.restore();
      }
    }
    const coreR = radius * 0.42;
    const cg = ctx.createRadialGradient(0, 0, coreR * 0.1, 0, 0, coreR);
    cg.addColorStop(0, '#1c0a00');
    cg.addColorStop(0.45, '#3b1702');
    cg.addColorStop(0.8, '#5e2605');
    cg.addColorStop(1, '#854d0e');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(0, 0, coreR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
    for (let s = 0; s < 110; s++) {
      const a = s * 2.399;
      const r = Math.sqrt(s) * (coreR / 11);
      ctx.fillRect(Math.cos(a) * r - 1, Math.sin(a) * r - 1, 2, 2);
    }
    ctx.restore();
  }

  if (type === 0) {
    // Ramo de Girasoles con Lazo Rosa
    drawStem(240, 280, 230, 440, 8);
    drawStem(256, 280, 256, 450, 9);
    drawStem(272, 280, 280, 440, 8);

    drawLeaf(200, 310, -0.6, 26, 65);
    drawLeaf(310, 310, 0.6, 26, 65);
    drawLeaf(170, 240, -1.1, 24, 60);
    drawLeaf(340, 240, 1.1, 24, 60);

    drawSingleSunflower(190, 210, 75, 0.82);
    drawSingleSunflower(322, 210, 75, 0.82);
    drawSingleSunflower(256, 175, 92, 1.0);

    ctx.save();
    ctx.translate(256, 325);
    const rg = ctx.createLinearGradient(-30, 0, 30, 0);
    rg.addColorStop(0, '#fbcfe8');
    rg.addColorStop(0.5, '#f472b6');
    rg.addColorStop(1, '#db2777');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.ellipse(-24, -6, 22, 12, -0.3, 0, Math.PI * 2);
    ctx.ellipse(24, -6, 22, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -4, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-6, 2);
    ctx.quadraticCurveTo(-22, 45, -34, 75);
    ctx.moveTo(6, 2);
    ctx.quadraticCurveTo(22, 45, 34, 75);
    ctx.stroke();
    ctx.restore();
  } 
  else if (type === 1) {
    // Cono de Tulipanes
    drawStem(245, 230, 250, 320, 6);
    drawStem(265, 230, 255, 320, 6);
    drawLeaf(215, 220, -0.35, 16, 85);
    drawLeaf(295, 220, 0.35, 16, 85);

    ctx.save();
    const paperG = ctx.createLinearGradient(180, 230, 330, 230);
    paperG.addColorStop(0, '#ffe4e6');
    paperG.addColorStop(0.5, '#fbcfe8');
    paperG.addColorStop(1, '#f472b6');
    ctx.fillStyle = paperG;
    ctx.beginPath();
    ctx.moveTo(195, 220);
    ctx.lineTo(317, 220);
    ctx.lineTo(256, 440);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fdf2f8';
    ctx.beginPath();
    ctx.ellipse(256, 220, 61, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    function drawTulip(tx, ty, rot, sz) {
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(rot);
      ctx.scale(sz, sz);
      const tg = ctx.createLinearGradient(0, -35, 0, 10);
      tg.addColorStop(0, '#fffbeb');
      tg.addColorStop(0.4, '#fde047');
      tg.addColorStop(1, '#eab308');
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.ellipse(-12, 0, 12, 28, -0.2, 0, Math.PI * 2);
      ctx.ellipse(12, 0, 12, 28, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, -4, 13, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    drawTulip(226, 195, -0.18, 0.95);
    drawTulip(286, 195, 0.18, 0.95);
    drawTulip(256, 170, 0, 1.1);
  } 
  else if (type === 2) {
    // Rosas Amarillas con Lazo Dorado
    drawStem(235, 290, 240, 440, 7);
    drawStem(275, 290, 270, 440, 7);
    drawLeaf(175, 280, -0.7, 22, 55);
    drawLeaf(335, 280, 0.7, 22, 55);

    function drawRose(rx, ry, rScale) {
      ctx.save();
      ctx.translate(rx, ry);
      ctx.scale(rScale, rScale);
      for (let l = 6; l >= 1; l--) {
        const rad = l * 12;
        const count = l * 3 + 2;
        for (let p = 0; p < count; p++) {
          ctx.save();
          ctx.rotate((p / count) * Math.PI * 2);
          const roG = ctx.createRadialGradient(0, -rad, 2, 0, -rad, rad * 0.7);
          roG.addColorStop(0, '#fffde7');
          roG.addColorStop(0.5, '#facc15');
          roG.addColorStop(1, '#ca8a04');
          ctx.fillStyle = roG;
          ctx.beginPath();
          ctx.arc(0, -rad * 0.75, rad * 0.52, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawRose(205, 225, 0.85);
    drawRose(305, 225, 0.85);
    drawRose(256, 175, 1.05);

    ctx.save();
    ctx.translate(256, 320);
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.ellipse(-18, 0, 16, 10, -0.2, 0, Math.PI * 2);
    ctx.ellipse(18, 0, 16, 10, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } 
  else if (type === 3) {
    // Narcisos y Margaritas
    drawStem(240, 270, 245, 430, 6);
    drawStem(270, 270, 265, 430, 6);
    drawLeaf(190, 290, -0.5, 14, 75);
    drawLeaf(320, 290, 0.5, 14, 75);

    function drawNarcissus(nx, ny, nScale) {
      ctx.save();
      ctx.translate(nx, ny);
      ctx.scale(nScale, nScale);
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((i / 6) * Math.PI * 2);
        const ng = ctx.createLinearGradient(0, 0, 0, -45);
        ng.addColorStop(0, '#fef08a');
        ng.addColorStop(0.7, '#fde047');
        ng.addColorStop(1, '#ffffff');
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.ellipse(0, -26, 14, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      const corG = ctx.createRadialGradient(0, 0, 4, 0, 0, 18);
      corG.addColorStop(0, '#ea580c');
      corG.addColorStop(0.75, '#f97316');
      corG.addColorStop(1, '#fde047');
      ctx.fillStyle = corG;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c2410c';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    drawNarcissus(205, 215, 0.85);
    drawNarcissus(305, 215, 0.85);
    drawNarcissus(256, 165, 1.0);
  } 
  else {
    // Fresias y Mimosas
    drawStem(240, 260, 230, 440, 6);
    drawStem(256, 260, 256, 440, 7);
    drawStem(270, 260, 280, 440, 6);
    drawLeaf(180, 280, -0.8, 12, 70);
    drawLeaf(330, 280, 0.8, 12, 70);

    function drawFreesiaBell(fx, fy, ang, sz) {
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(ang);
      ctx.scale(sz, sz);
      const fg = ctx.createRadialGradient(0, 0, 2, 0, -15, 20);
      fg.addColorStop(0, '#ffffff');
      fg.addColorStop(0.5, '#fef08a');
      fg.addColorStop(1, '#eab308');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.quadraticCurveTo(-18, -25, 0, -32);
      ctx.quadraticCurveTo(18, -25, 14, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawFreesiaBell(210, 220, -0.35, 0.9);
    drawFreesiaBell(235, 185, -0.2, 0.95);
    drawFreesiaBell(256, 150, 0, 1.05);
    drawFreesiaBell(277, 185, 0.2, 0.95);
    drawFreesiaBell(302, 220, 0.35, 0.9);

    ctx.fillStyle = '#fde047';
    for (let m = 0; m < 26; m++) {
      const mx = 256 + Math.cos(m * 1.3) * (70 + (m % 5) * 12);
      const my = 220 + Math.sin(m * 1.5) * (45 + (m % 4) * 10);
      ctx.beginPath();
      ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(235, 340);
    ctx.lineTo(275, 340);
    ctx.stroke();
  }

  ctx.save();
  ctx.shadowColor = 'rgba(255, 215, 0, 0.85)';
  ctx.shadowBlur = 35;
  ctx.strokeStyle = 'rgba(255, 255, 220, 0.1)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}

const flowerTextures = [
  createRealBotanicalBouquet(0),
  createRealBotanicalBouquet(1),
  createRealBotanicalBouquet(2),
  createRealBotanicalBouquet(3),
  createRealBotanicalBouquet(4)
];

/* ---------- Campo de estrellas (fondo) ---------- */
const starGeo = new THREE.BufferGeometry();
const SN = 6000, sp = new Float32Array(SN * 3);
for (let i = 0; i < SN; i++) {
  const r = 700 + Math.random() * 2200;
  const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
  sp[i*3]   = r * Math.sin(ph) * Math.cos(th);
  sp[i*3+1] = r * Math.cos(ph);
  sp[i*3+2] = r * Math.sin(ph) * Math.sin(th);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
const starMat = new THREE.PointsMaterial({
  size: 5, map: STAR, color: 0xffffff, transparent: true, opacity: 0.9,
  depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
});
scene.add(new THREE.Points(starGeo, starMat));

/* ---------- Disco galáctico (espiral dorada) ---------- */
const GC = 30000, R = 90, ARMS = 3;
const gg = new THREE.BufferGeometry();
const gp = new Float32Array(GC * 3), gc = new Float32Array(GC * 3), gd = [];
const c1 = new THREE.Color(0xfff6dc), c2 = new THREE.Color(0xffc04d), c3 = new THREE.Color(0xff8412);
for (let i = 0; i < GC; i++) {
  const t = Math.pow(Math.random(), 0.55);
  const rad = t * R + 1;
  const arm = Math.floor(Math.random() * ARMS) * (Math.PI * 2 / ARMS);
  const ang = arm + rad * 0.13 + (Math.random() - 0.5) * 0.5;
  const thick = (1 - t) * 3.2 + 0.4;
  const ox = (Math.random() - 0.5) * (1 - t) * 6;
  const oy = (Math.random() - 0.5) * thick;
  const oz = (Math.random() - 0.5) * (1 - t) * 6;
  gd.push({ rad, ang, ox, oy, oz, sp: 0.5 / (rad * 0.13 + 1) });
  gp[i*3] = Math.cos(ang) * rad + ox; gp[i*3+1] = oy; gp[i*3+2] = Math.sin(ang) * rad + oz;
  const col = c1.clone().lerp(c2, Math.min(t * 1.6, 1)).lerp(c3, Math.max(0, t - 0.5) * 2);
  gc[i*3] = col.r; gc[i*3+1] = col.g; gc[i*3+2] = col.b;
}
gg.setAttribute('position', new THREE.BufferAttribute(gp, 3));
gg.setAttribute('color', new THREE.BufferAttribute(gc, 3));
scene.add(new THREE.Points(gg, new THREE.PointsMaterial({
  size: 1.6, map: SPARK, vertexColors: true, transparent: true, opacity: 0.95,
  depthWrite: false, blending: THREE.AdditiveBlending
})));

/* Núcleo de resplandor */
const core = new THREE.Sprite(new THREE.SpriteMaterial({
  map: dot('rgba(255,255,250,1)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
}));
core.scale.set(70, 70, 1);
scene.add(core);

/* ---------- Polvo volumétrico orbital ---------- */
const DUST = 9000;
const dustGeo = new THREE.BufferGeometry();
const dp = new Float32Array(DUST * 3);
const dc = new Float32Array(DUST * 3);
const dData = [];
const dInner = new THREE.Color(0xffe9b0);
const dOuter = new THREE.Color(0xff9a3c);

for (let i = 0; i < DUST; i++) {
  const rad = 60 + Math.pow(Math.random(), 0.7) * 200;
  const th = Math.random() * Math.PI * 2;
  const ph = Math.acos(2 * Math.random() - 1);
  const flat = 0.42;

  const x = rad * Math.sin(ph) * Math.cos(th);
  const y = rad * Math.cos(ph) * flat;
  const z = rad * Math.sin(ph) * Math.sin(th);

  dData.push({
    baseAng: th, baseRad: Math.sqrt(x * x + z * z),
    y, driftSpeed: (Math.random() - 0.5) * 0.05,
    twinklePh: Math.random() * Math.PI * 2
  });

  dp[i*3] = x; dp[i*3+1] = y; dp[i*3+2] = z;

  const t = (rad - 60) / 200;
  const col = dInner.clone().lerp(dOuter, Math.min(t * 1.3, 1));
  dc[i*3] = col.r; dc[i*3+1] = col.g; dc[i*3+2] = col.b;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
dustGeo.setAttribute('color', new THREE.BufferAttribute(dc, 3));

const dustMat = new THREE.PointsMaterial({
  size: 2.2, map: SPARK, vertexColors: true, transparent: true, opacity: 0.55,
  depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
});
const dustCloud = new THREE.Points(dustGeo, dustMat);
scene.add(dustCloud);

/* ---------- 4 Anillos orbitales limpios y espaciados ---------- */
const RINGS = [
  { r: 125, y: -3 },
  { r: 185, y: 2 },
  { r: 250, y: -2 },
  { r: 325, y: 3 }
];
const ringGroup = new THREE.Group();
ringGroup.rotation.x = 0.06;
scene.add(ringGroup);

RINGS.forEach(ring => {
  const pts = [];
  for (let i = 0; i <= 256; i++) {
    const a = (i / 256) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * ring.r, ring.y, Math.sin(a) * ring.r));
  }
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({
    color: 0xffb347, transparent: true, opacity: 0.20, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  ringGroup.add(l);
});

/* ---------- Corazón superior de chispas ---------- */
const heartGroup = new THREE.Group();
heartGroup.position.set(0, 135, 0);
scene.add(heartGroup);
const HP = 900, hg = new THREE.BufferGeometry(), hp = new Float32Array(HP * 3);
for (let i = 0; i < HP; i++) {
  const t = Math.random() * Math.PI * 2, j = (Math.random() - 0.5) * 2.4;
  const s = 2.6;
  hp[i*3]   = (16 * Math.pow(Math.sin(t), 3)) * s + j;
  hp[i*3+1] = (13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t)) * s + j;
  hp[i*3+2] = (Math.random() - 0.5) * 8;
}
hg.setAttribute('position', new THREE.BufferAttribute(hp, 3));
const hMat = new THREE.PointsMaterial({
  size: 3.4, map: SPARK, color: 0xffd479, transparent: true, opacity: 0.95,
  depthWrite: false, blending: THREE.AdditiveBlending
});
heartGroup.add(new THREE.Points(hg, hMat));

const ml = labelTex('Te Quiero Mucho 💗', 96);
const mainLbl = new THREE.Sprite(new THREE.SpriteMaterial({
  map: ml.texture, transparent: true, depthWrite: false, depthTest: false
}));
mainLbl.scale.set(24 * ml.ratio, 24, 1);
mainLbl.position.set(0, 4, 6);
heartGroup.add(mainLbl);

/* ---------- Ramos con frases (18 unidades en balance) ---------- */
const DATA = [
  [0, 'Mi Amor 💗'],
  [1, 'Eres mi sol ☀️'],
  [2, 'Te adoro 💗'],
  [3, 'Eres preciosa 🌻'],
  [4, 'Siempre juntos 💗'],
  [1, 'Me encantas ✨'],
  [0, 'Eres mi todo 🌻'],
  [3, 'Eres única 💗'],
  [2, 'Mi calabazita 💛'],
  [4, 'Mi Vida 💗'],
  [1, 'Te Quiero 💛'],
  [2, 'Mi cielo ☀️'],
  [0, 'Eres mi luz 🌻'],
  [4, '💗'],
  [3, 'Te quiero infinito 💛'],
  [1, 'Mi sol radiante ☀️'],
  [2, 'Mi galletita de vainilla 💛'],
  [0, 'Mi primavera 🌻']
];

const flowers = [];
DATA.forEach((d, i) => {
  const ring = RINGS[i % RINGS.length];
  const scale = 34 - (i % RINGS.length) * 2;
  const g = new THREE.Group();

  const tex = flowerTextures[d[0] % flowerTextures.length];
  const flowerSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false
  }));
  flowerSprite.scale.set(scale, scale, 1);
  g.add(flowerSprite);

  const lb = labelTex(d[1], 64);
  const ls = new THREE.Sprite(new THREE.SpriteMaterial({
    map: lb.texture, transparent: true, depthWrite: false, depthTest: false
  }));
  const lh = scale * 0.28;
  ls.scale.set(lh * lb.ratio, lh, 1);
  ls.position.y = -scale * 0.58;
  g.add(ls);

  ringGroup.add(g);
  flowers.push({
    g, flowerSprite, r: ring.r, y: ring.y,
    a: (i / DATA.length) * Math.PI * 2,
    sp: 0.045 + (i % RINGS.length) * -0.005,
    base: scale, ph: Math.random() * Math.PI * 2
  });
});

/* ---------- Flores ambientales sutiles (45 flores) ---------- */
const ambientFlowers = [];
for (let i = 0; i < 45; i++) {
  const tex = flowerTextures[Math.floor(Math.random() * flowerTextures.length)];
  const spMat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    opacity: 0.82,
    depthWrite: false
  });
  const spFlor = new THREE.Sprite(spMat);
  const sz = 12 + Math.random() * 12;
  spFlor.scale.set(sz, sz, 1);

  const radius = 80 + Math.pow(Math.random(), 0.85) * 270;
  const angle = Math.random() * Math.PI * 2;
  const ySpread = (Math.random() - 0.5) * 30;

  ringGroup.add(spFlor);
  ambientFlowers.push({
    sprite: spFlor,
    rad: radius,
    ang: angle,
    baseY: ySpread,
    speed: (0.018 + Math.random() * 0.03) * (Math.random() > 0.4 ? 1 : -1),
    wobblePh: Math.random() * Math.PI * 2,
    baseSize: sz
  });
}

/* ---------- Túnel de hiperespacio ---------- */
const HN = 2600;
const hyGeo = new THREE.BufferGeometry();
const hyPos = new Float32Array(HN * 6);
const hyData = [];
for (let i = 0; i < HN; i++) {
  const a = Math.random() * Math.PI * 2;
  const rad = 25 + Math.random() * 400;
  hyData.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad, z: -Math.random() * 4000 });
}
hyGeo.setAttribute('position', new THREE.BufferAttribute(hyPos, 3));
const hyMat = new THREE.LineBasicMaterial({
  color: 0xffe6b8, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false
});
const hyper = new THREE.LineSegments(hyGeo, hyMat);
scene.add(hyper);

/* ---------- Bucle de Render ---------- */
const INTRO = 3500;
const Z0 = 900, Z1 = 300, Y0 = 60, Y1 = 90;
const clock = new THREE.Clock();
let t0 = null, done = false;
const loader = document.getElementById('loader'), hint = document.getElementById('hint');
const ease = t => 1 - Math.pow(1 - t, 4);
setTimeout(() => loader.classList.add('hide'), 300);

function frame(now) {
  requestAnimationFrame(frame);
  if (t0 === null) t0 = now;
  const el = now - t0, dt = Math.min(clock.getDelta(), 0.05), T = clock.elapsedTime;

  if (!done) {
    const k = Math.min(el / INTRO, 1), e = ease(k);
    camera.position.z = Z0 + (Z1 - Z0) * e;
    camera.position.y = Y0 + (Y1 - Y0) * e;
    camera.lookAt(0, 20, 0);

    const p = hyGeo.attributes.position.array;
    const spd = 3400 * (1 - k * 0.85) * dt;
    const tail = 60 + (1 - k) * 340;
    for (let i = 0; i < HN; i++) {
      const d = hyData[i];
      d.z += spd;
      if (d.z > camera.position.z) {
        d.z = -4000;
        const a = Math.random() * Math.PI * 2, rad = 25 + Math.random() * 400;
        d.x = Math.cos(a) * rad; d.y = Math.sin(a) * rad;
      }
      p[i*6]   = d.x; p[i*6+1] = d.y; p[i*6+2] = d.z;
      p[i*6+3] = d.x; p[i*6+4] = d.y; p[i*6+5] = d.z - tail;
    }
    hyGeo.attributes.position.needsUpdate = true;
    hyMat.opacity = k < 0.75 ? 1 : (1 - (k - 0.75) / 0.25);

    if (k >= 1) {
      done = true;
      scene.remove(hyper); hyGeo.dispose(); hyMat.dispose();
      controls.enabled = true;
      hint.classList.add('show');
      setTimeout(() => hint.classList.remove('show'), 7000);
    }
  }

  const a = gg.attributes.position.array;
  for (let i = 0; i < GC; i++) {
    const d = gd[i]; d.ang += d.sp * dt;
    a[i*3] = Math.cos(d.ang) * d.rad + d.ox;
    a[i*3+1] = d.oy;
    a[i*3+2] = Math.sin(d.ang) * d.rad + d.oz;
  }
  gg.attributes.position.needsUpdate = true;
  core.scale.setScalar(66 + Math.sin(T * 1.5) * 7);
  starMat.opacity = 0.75 + Math.sin(T * 1.8) * 0.15;

  const dpArr = dustGeo.attributes.position.array;
  for (let i = 0; i < DUST; i++) {
    const d = dData[i];
    d.baseAng += d.driftSpeed * dt;
    dpArr[i*3]   = Math.cos(d.baseAng) * d.baseRad;
    dpArr[i*3+2] = Math.sin(d.baseAng) * d.baseRad;
  }
  dustGeo.attributes.position.needsUpdate = true;
  dustMat.opacity = 0.45 + Math.sin(T * 0.6) * 0.12;

  const pulse = 1 + Math.sin(T * 1.9) * 0.05;
  heartGroup.scale.setScalar(pulse);
  hMat.opacity = 0.75 + Math.sin(T * 2.6) * 0.22;
  hMat.size = 3.2 + Math.sin(T * 3.2) * 0.8;
  mainLbl.scale.set(24 * ml.ratio * pulse, 24 * pulse, 1);

  flowers.forEach(f => {
    f.a += f.sp * dt;
    f.g.position.set(Math.cos(f.a) * f.r, f.y + Math.sin(T * 0.7 + f.ph) * 4, Math.sin(f.a) * f.r);
    const s = f.base * (1 + Math.sin(T * 1.8 + f.ph) * 0.05);
    f.flowerSprite.scale.set(s, s, 1);
  });

  ambientFlowers.forEach(af => {
    af.ang += af.speed * dt;
    const yPos = af.baseY + Math.sin(T * 1.2 + af.wobblePh) * 3;
    af.sprite.position.set(Math.cos(af.ang) * af.rad, yPos, Math.sin(af.ang) * af.rad);
    const sz = af.baseSize * (1 + Math.sin(T * 2 + af.wobblePh) * 0.08);
    af.sprite.scale.set(sz, sz, 1);
  });

  if (done) controls.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);

function resize() {
  const w = innerWidth, h = innerHeight;
  camera.aspect = w / h;
  camera.fov = w < 700 ? 72 : 58;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(w, h);
}
addEventListener('resize', resize);
resize();
