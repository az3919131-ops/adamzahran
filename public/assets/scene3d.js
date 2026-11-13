// WebGL hero scene: a small 33/13.8 kV line with travelling energy pulses, a substation and a 3D schedule (Gantt) chart.
// Loaded on demand from cv.js. Throws if WebGL is unavailable so the caller can show the static fallback.
// Project Manager | Eng. Ahmed Zahran
import * as THREE from "../vendor/three.module.min.js";

const COL = { bg: 0x081322, card: 0x12243a, gold: 0xd4af6a, blue: 0x4d8dff, steel: 0x8fa3bd, ink: 0x0c1a2c };

export function mount(host, { reduced = false } = {}) {
  const probe = document.createElement("canvas");
  if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) throw new Error("no webgl");

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COL.bg, 52, 84);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);

  scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x081322, 1.0));
  const sun = new THREE.DirectionalLight(0xffe2b0, 1.5);
  sun.position.set(8, 14, 7);
  scene.add(sun);
  const rim = new THREE.PointLight(COL.blue, 30, 45);
  rim.position.set(-8, 5, 5);
  scene.add(rim);

  const disposables = [];
  const keep = (o) => { disposables.push(o); return o; };
  const std = (color, extra = {}) => keep(new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.35, ...extra }));
  const steel = std(COL.steel, { metalness: 0.7, roughness: 0.38 });
  const goldMat = std(COL.gold, { metalness: 0.8, roughness: 0.3, emissive: 0x3a2c10 });
  const blueMat = std(COL.blue, { metalness: 0.4, roughness: 0.4, emissive: 0x0b2150 });
  const darkMat = std(COL.card, { roughness: 0.8, metalness: 0.1 });

  // ground + grid
  const ground = new THREE.Mesh(keep(new THREE.PlaneGeometry(36, 24)), keep(new THREE.MeshStandardMaterial({ color: COL.ink, roughness: 1, metalness: 0, transparent: true, opacity: 0.85 })));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const grid = new THREE.GridHelper(36, 36, COL.blue, 0x1d3555);
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  grid.position.y = 0.01;
  scene.add(grid);
  disposables.push(grid.geometry, grid.material);

  // towers
  const towerPos = [[-10, -3], [-3.6, -5], [3.4, -4.6], [10, -2]];
  const insulX = [-1.5, 0, 1.5];
  const towerG = keep(new THREE.CylinderGeometry(0.1, 0.26, 7, 4));
  const armG = keep(new THREE.BoxGeometry(3.8, 0.14, 0.14));
  const insG = keep(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 6));
  const insMat = std(0xe8eef7, { roughness: 0.3, metalness: 0.1 });
  const tops = [];
  towerPos.forEach(([x, z]) => {
    const g = new THREE.Group();
    const mast = new THREE.Mesh(towerG, steel);
    mast.position.y = 3.5; mast.rotation.y = Math.PI / 4;
    const arm = new THREE.Mesh(armG, steel);
    arm.position.y = 6.2;
    const arm2 = new THREE.Mesh(armG, steel);
    arm2.position.y = 4.9; arm2.scale.x = 0.7;
    g.add(mast, arm, arm2);
    const pts = insulX.map((ix) => {
      const ins = new THREE.Mesh(insG, insMat);
      ins.position.set(ix, 5.9, 0);
      g.add(ins);
      return new THREE.Vector3(x + ix, 5.6, z);
    });
    tops.push(pts);
    g.position.set(x, 0, z);
    scene.add(g);
  });

  // cables + pulses
  const cableMat = std(COL.gold, { metalness: 0.9, roughness: 0.25, emissive: 0x4a3813 });
  const pulseMat = keep(new THREE.MeshBasicMaterial({ color: 0xffe3a6 }));
  const haloMat = keep(new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.28, depthWrite: false }));
  const pulseG = keep(new THREE.SphereGeometry(0.13, 10, 10));
  const haloG = keep(new THREE.SphereGeometry(0.34, 10, 10));
  const curves = [];
  const pulses = [];
  const addCable = (a, b, sag, offsets) => {
    const mid = a.clone().lerp(b, 0.5);
    mid.y -= sag;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const tube = new THREE.Mesh(keep(new THREE.TubeGeometry(curve, 28, 0.035, 5, false)), cableMat);
    scene.add(tube);
    curves.push(curve);
    offsets.forEach((o) => {
      const p = new THREE.Mesh(pulseG, pulseMat);
      p.add(new THREE.Mesh(haloG, haloMat));
      scene.add(p);
      pulses.push({ mesh: p, curve, o, speed: 0.07 + Math.random() * 0.02 });
    });
  };
  for (let t = 0; t < tops.length - 1; t++) for (let k = 0; k < 3; k++) addCable(tops[t][k], tops[t + 1][k], 0.9, k === 1 ? [0.1, 0.6] : [k * 0.2 + 0.3]);

  // substation (front right)
  const sub = new THREE.Group();
  sub.position.set(3.2, 0, 3.6);
  const slab = new THREE.Mesh(keep(new THREE.BoxGeometry(7, 0.16, 4.4)), darkMat);
  slab.position.y = 0.08;
  sub.add(slab);
  const trG = keep(new THREE.BoxGeometry(1.7, 1.4, 1.3));
  [-2, 0.1].forEach((x, i) => {
    const tr = new THREE.Mesh(trG, i ? blueMat : steel);
    tr.position.set(x, 0.86, -0.5);
    sub.add(tr);
    for (let b = -1; b <= 1; b++) {
      const bush = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.07, 0.09, 0.5, 8)), insMat);
      bush.position.set(x + b * 0.5, 1.85, -0.5);
      sub.add(bush);
    }
  });
  const rmu = new THREE.Mesh(keep(new THREE.BoxGeometry(1.2, 1.1, 0.9)), steel);
  rmu.position.set(2.3, 0.7, 0.6);
  const rmuStripe = new THREE.Mesh(keep(new THREE.BoxGeometry(1.22, 0.14, 0.92)), goldMat);
  rmuStripe.position.set(2.3, 1.02, 0.6);
  sub.add(rmu, rmuStripe);
  scene.add(sub);
  addCable(new THREE.Vector3(tops[2][1].x, 5.6, tops[2][1].z), new THREE.Vector3(3.2 - 1.5, 2.1, 3.1), 0.2, [0.25, 0.7]);

  // 3D schedule chart (front left)
  const gantt = new THREE.Group();
  gantt.position.set(-11.2, 0, 2.2);
  gantt.rotation.y = -0.12;
  const base = new THREE.Mesh(keep(new THREE.BoxGeometry(9, 0.14, 4.6)), darkMat);
  base.position.set(4.5, 0.07, 1.9);
  gantt.add(base);
  const gl = keep(new THREE.BoxGeometry(0.03, 0.04, 4.4));
  const glMat = std(COL.blue, { emissive: 0x112a55 });
  for (let i = 0; i <= 8; i++) { const l = new THREE.Mesh(gl, glMat); l.position.set(0.3 + i, 0.17, 1.9); gantt.add(l); }
  const rows = [[0, 4.2, goldMat], [1.0, 3.6, blueMat], [2.2, 3.4, blueMat], [3.6, 2.8, goldMat], [4.8, 3.0, blueMat]];
  const bars = rows.map(([start, len, mat], i) => {
    const g = keep(new THREE.BoxGeometry(len, 0.34, 0.48));
    g.translate(len / 2, 0, 0);
    const m = new THREE.Mesh(g, mat);
    m.position.set(0.3 + start * 0.85, 0.34, 0.25 + i * 0.78);
    m.scale.x = reduced ? 1 : 0.001;
    gantt.add(m);
    return { m, delay: i * 0.35 };
  });
  const mile = new THREE.Mesh(keep(new THREE.OctahedronGeometry(0.34)), goldMat);
  const last = rows[rows.length - 1];
  mile.position.set(0.3 + last[0] * 0.85 + last[1] + 0.5, 0.55, 0.25 + 4 * 0.78);
  mile.visible = reduced;
  gantt.add(mile);
  scene.add(gantt);

  // camera framing
  const target = new THREE.Vector3(0.4, 1.2, 0.6);
  let aspect = 1;
  const frame = (t) => {
    const swing = reduced ? 0 : Math.sin(t * 0.00018) * 0.12;
    const dist = Math.max(47, 52 / Math.min(aspect, 1.25));
    camera.position.set(Math.sin(0.78 + swing + px * 0.18) * dist * 0.8, dist * 0.38 - py * 1.4, Math.cos(0.78 + swing + px * 0.18) * dist * 0.8);
    camera.lookAt(target);
  };
  let px = 0, py = 0, tpx = 0, tpy = 0;
  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    tpx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    tpy = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  const fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine && !reduced) host.addEventListener("pointermove", onMove);

  const resize = () => {
    const w = Math.max(host.clientWidth, 1), h = Math.max(host.clientHeight, 1);
    aspect = w / h;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  let raf = 0, running = false, visible = true, t0 = performance.now();
  const ease = (x) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
  const draw = (now) => {
    const t = now - t0;
    px += (tpx - px) * 0.06; py += (tpy - py) * 0.06;
    pulses.forEach((p) => { p.mesh.position.copy(p.curve.getPoint((p.o + (reduced ? 0 : (t / 1000) * p.speed)) % 1)); });
    if (!reduced) {
      bars.forEach(({ m, delay }) => { m.scale.x = Math.max(0.001, ease((t / 1000 - 0.4 - delay) / 1.1)); });
      mile.visible = t / 1000 > 0.4 + 4 * 0.35 + 1.1;
      mile.rotation.y = t / 700;
    }
    frame(t);
    renderer.render(scene, camera);
  };
  const loop = (now) => { if (!running) return; draw(now); raf = requestAnimationFrame(loop); };
  const start = () => { if (reduced || running || !visible || document.hidden) return; running = true; raf = requestAnimationFrame(loop); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; visible ? start() : stop(); }, { rootMargin: "60px" });
  io.observe(host);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);

  draw(performance.now() + 4500); // first frame in its final state, so the scene is complete even before animation starts
  start();
  host.dataset.frames = "1";

  return {
    destroy() {
      stop(); io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointermove", onMove);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose();
      try { renderer.forceContextLoss(); } catch {}
      canvas.remove();
    },
  };
}
