/**
 * BACKGROUND.js — lightweight Three.js ambient scene for the countdown page
 * (stars + moon + aurora ribbons only — no islands/cursor/day-night, since
 * this is a single static scene, not a multi-chapter journey).
 */
const Background3D = (() => {
  let renderer, scene, camera, stars, moon, aurora;
  let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function init() {
    const canvas = document.getElementById("three-bg");
    if (!canvas || typeof THREE === "undefined") return;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.z = 20;

    buildStarfield();
    buildMoon();
    buildAurora();

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    animate();
  }

  function buildStarfield() {
    const count = window.innerWidth < 700 ? 700 : 1800;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 10;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xf3e9ff, size: 0.28, transparent: true, opacity: 0.85 });
    stars = new THREE.Points(geo, mat);
    scene.add(stars);
  }

  function buildMoon() {
    const geo = new THREE.SphereGeometry(3, 48, 48);
    const mat = new THREE.MeshBasicMaterial({ color: 0xfff3d6 });
    moon = new THREE.Mesh(geo, mat);
    moon.position.set(13, 9, -30);
    scene.add(moon);
  }

  function buildAurora() {
    aurora = new THREE.Group();
    [0x8fd3fe, 0x6e56cf, 0xf5b8ce].forEach((color, i) => {
      const geo = new THREE.PlaneGeometry(60, 14, 40, 8);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false });
      const ribbon = new THREE.Mesh(geo, mat);
      ribbon.position.set(0, 14 + i * 4, -40 - i * 4);
      ribbon.rotation.x = -0.2;
      aurora.add(ribbon);
    });
    scene.add(aurora);
  }

  function onResize() {
    if (!renderer || !camera) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  function onMouseMove(e) {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  }

  let clock = null;
  function animate() {
    requestAnimationFrame(animate);
    if (!clock && window.THREE && THREE.Clock) clock = new THREE.Clock();
    const t = clock ? clock.getElapsedTime() : Date.now() / 1000;
    if (stars && !reduced) stars.rotation.y = t * 0.006;
    if (moon && !reduced) moon.position.y = 9 + Math.sin(t * 0.2) * 0.4;
    if (aurora) aurora.children.forEach((ribbon, i) => {
      ribbon.rotation.z = Math.sin(t * 0.1 + i) * 0.05;
      ribbon.position.x = Math.sin(t * 0.08 + i * 2) * 4;
    });
    targetRotX += (mouseY * 0.12 - targetRotX) * 0.02;
    targetRotY += (mouseX * 0.12 - targetRotY) * 0.02;
    if (camera && !reduced) { camera.rotation.x = targetRotX * 0.3; camera.rotation.y = targetRotY * 0.3; }
    renderer.render(scene, camera);
  }

  return { init };
})();
