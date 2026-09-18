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
controls.maxDistance = 420;
controls.enablePan = false;
controls.enabled = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.28;
controls.target.set(0, 10, 0);

/* ---------- Texturas ---------- */
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
function emojiTex(e, size = 512) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `${Math.floor(size * 0.7)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif`;
  x.shadowColor = 'rgba(255,190,70,0.95)';
  x.shadowBlur = size * 0.20; x.fillText(e, size / 2, size * 0.54);
  x.shadowBlur = size * 0.10; x.fillText(e, size / 2, size * 0.54);
  x.shadowBlur = 0;           x.fillText(e, size / 2, size * 0.54);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t;
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

/* ---------- Campo de estrellas real (fondo lejano) ---------- */
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

/* ---------- Disco galáctico plano (espiral) ---------- */
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

/* Núcleo + destello */
const core = new THREE.Sprite(new THREE.SpriteMaterial({
  map: dot('rgba(255,255,250,1)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
}));
core.scale.set(70, 70, 1);
scene.add(core);

/* ---------- Polvo estelar volumétrico ALREDEDOR de la galaxia ---------- */
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

/* ---------- Anillos orbitales dorados visibles ---------- */
const RINGS = [
  { r: 120, y: 0 }, { r: 175, y: 0 }, { r: 235, y: 0 }, { r: 300, y: 0 }
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
    color: 0xffb347, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  ringGroup.add(l);
});

/* ---------- Corazón de chispas arriba ---------- */
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

const ml = labelTex('Te Quiero Muchoo 🤍🌻', 96);
const mainLbl = new THREE.Sprite(new THREE.SpriteMaterial({
  map: ml.texture, transparent: true, depthWrite: false, depthTest: false
}));
mainLbl.scale.set(24 * ml.ratio, 24, 1);
mainLbl.position.set(0, 4, 6);
heartGroup.add(mainLbl);

/* ---------- Ramos en los anillos (nada en el centro) ---------- */
const DATA = [
  ['💐','Mi Amor '], ['🌻','Eres mi sol '], ['💐','Te adoro '],
  ['🌻','Eres preciosa '], ['💐','Mi princesa '], ['🌻','Me encantas '],
  ['🌻','Eres mi todo 🌻'],
  ['🌼','Mi calabazita '], ['🌻',' Me encantas '], ['🌼','Mi Vida '],
  ['🌻','Te Quiero '], ['🌼','Mi cielo '], ['🌻','La mejor diseñadora']
];
const flowers = [];
DATA.forEach((d, i) => {
  const ring = RINGS[i % RINGS.length];
  const scale = 34 - (i % RINGS.length) * 2;
  const g = new THREE.Group();

  const em = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTex(d[0]), transparent: true, depthWrite: false }));
  em.scale.set(scale, scale, 1);
  g.add(em);

  const lb = labelTex(d[1], 64);
  const ls = new THREE.Sprite(new THREE.SpriteMaterial({
    map: lb.texture, transparent: true, depthWrite: false, depthTest: false
  }));
  const lh = scale * 0.30;
  ls.scale.set(lh * lb.ratio, lh, 1);
  ls.position.y = -scale * 0.55;
  g.add(ls);

  ringGroup.add(g);
  flowers.push({
    g, em, r: ring.r, y: ring.y,
    a: (i / DATA.length) * Math.PI * 2 * 1.7,
    sp: 0.055 + (i % RINGS.length) * -0.008,
    base: scale, ph: Math.random() * Math.PI * 2
  });
});

/* ---------- Túnel de hiperespacio (3.5 s, con estelas) ---------- */
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

/* ---------- Animación ---------- */
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

  /* Galaxia con rotación diferencial */
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

  /* Deriva lenta del polvo alrededor de la galaxia */
  const dpArr = dustGeo.attributes.position.array;
  for (let i = 0; i < DUST; i++) {
    const d = dData[i];
    d.baseAng += d.driftSpeed * dt;
    dpArr[i*3]   = Math.cos(d.baseAng) * d.baseRad;
    dpArr[i*3+2] = Math.sin(d.baseAng) * d.baseRad;
  }
  dustGeo.attributes.position.needsUpdate = true;
  dustMat.opacity = 0.45 + Math.sin(T * 0.6) * 0.12;

  /* Corazón */
  const pulse = 1 + Math.sin(T * 1.9) * 0.05;
  heartGroup.scale.setScalar(pulse);
  hMat.opacity = 0.75 + Math.sin(T * 2.6) * 0.22;
  hMat.size = 3.2 + Math.sin(T * 3.2) * 0.8;
  mainLbl.scale.set(24 * ml.ratio * pulse, 24 * pulse, 1);

  /* Ramos orbitando sobre los anillos */
  flowers.forEach(f => {
    f.a += f.sp * dt;
    f.g.position.set(Math.cos(f.a) * f.r, f.y + Math.sin(T * 0.7 + f.ph) * 4, Math.sin(f.a) * f.r);
    const s = f.base * (1 + Math.sin(T * 1.8 + f.ph) * 0.05);
    f.em.scale.set(s, s, 1);
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
