// 3D background: a city of buildings that rise near your cursor. Tweak CONFIG to change it.
(function () {
  const CONFIG = { grid: 14, spacing: 1.5, accent: 0xffb547, base: 0x4a4f9c, reach: 4.5 };
  const canvas = document.getElementById('scene');
  if (!window.THREE) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 9, 14);

  const city = new THREE.Group(); scene.add(city);
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const edgeGeo = new THREE.EdgesGeometry(geo);
  const buildings = [];
  const half = (CONFIG.grid - 1) * CONFIG.spacing / 2;
  for (let i = 0; i < CONFIG.grid; i++) for (let j = 0; j < CONFIG.grid; j++) {
    const mat = new THREE.MeshBasicMaterial({ color: CONFIG.base, transparent: true, opacity: 0.18 });
    const m = new THREE.Mesh(geo, mat);
    const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: CONFIG.base }));
    m.add(edges);
    const x = i * CONFIG.spacing - half, z = j * CONFIG.spacing - half;
    const h = 0.4 + Math.random() * 1.6;
    m.userData = { x, z, h, cur: h, edges };
    m.position.set(x, h / 2, z); m.scale.set(0.9, h, 0.9);
    city.add(m); buildings.push(m);
  }

  const mouse = { x: 0, y: 0 }, target = new THREE.Vector3(999, 0, 999);
  addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; });
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  const accent = new THREE.Color(CONFIG.accent), base = new THREE.Color(CONFIG.base);

  function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  (function tick(t) {
    const scroll = scrollY / Math.max(1, document.body.scrollHeight - innerHeight);
    city.rotation.y = t * 0.00005 * (still ? 0 : 1) + scroll * Math.PI;      // spins as you scroll
    city.updateMatrixWorld();
    camera.position.x += (mouse.x * 3 - camera.position.x) * 0.04;            // parallax
    camera.position.y += (9 - mouse.y * 2 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    ray.setFromCamera(new THREE.Vector2(mouse.x, -mouse.y), camera);
    if (ray.ray.intersectPlane(plane, hit)) target.copy(city.worldToLocal(hit.clone()));
    for (const b of buildings) {
      const d = Math.hypot(b.userData.x - target.x, b.userData.z - target.z);
      const k = Math.max(0, 1 - d / CONFIG.reach);
      const goal = b.userData.h + k * 3.2;
      b.userData.cur += (goal - b.userData.cur) * 0.08;
      b.scale.y = b.userData.cur; b.position.y = b.userData.cur / 2;
      b.userData.edges.material.color.copy(base).lerp(accent, k);
      b.material.opacity = 0.18 + k * 0.3;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  })(0);
})();
