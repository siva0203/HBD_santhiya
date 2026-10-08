/**
 * BACKGROUND.js — Three.js ambient scene (runs behind every section)
 * Layers: starfield, drifting aurora ribbon, glowing moon, floating islands,
 * gentle parallax on scroll/mouse. Kept intentionally lightweight for 60fps.
 */

const Background3D = (() => {
  let renderer, scene, camera, stars, moon, aurora, islandGroup, castle, fairyLight;
  let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
  let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let running = false;

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
    buildIslands();
    buildCastle();
    buildFairyLight();

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    running = true;
    animate();
  }

  function buildStarfield() {
    const count = window.innerWidth < 700 ? 900 : 2200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 10;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xf3e9ff,
      size: 0.28,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true
    });
    stars = new THREE.Points(geo, mat);
    scene.add(stars);
  }

  function buildMoon() {
    const geo = new THREE.SphereGeometry(3.2, 48, 48);
    const mat = new THREE.MeshBasicMaterial({ color: 0xfff3d6 });
    moon = new THREE.Mesh(geo, mat);
    moon.position.set(14, 10, -30);
    const glow = new THREE.PointLight(0xffe9b0, 1.2, 60);
    moon.add(glow);
    scene.add(moon);
  }

  function buildAurora() {
    aurora = new THREE.Group();
    const colors = [0x8fd3fe, 0x6e56cf, 0xf5b8ce];
    colors.forEach((color, i) => {
      const geo = new THREE.PlaneGeometry(60, 14, 40, 8);
      const mat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.09,
        side: THREE.DoubleSide, depthWrite: false
      });
      const ribbon = new THREE.Mesh(geo, mat);
      ribbon.position.set(0, 14 + i * 4, -40 - i * 4);
      ribbon.rotation.x = -0.2;
      ribbon.userData.offset = i;
      aurora.add(ribbon);
    });
    scene.add(aurora);
  }

  function buildIslands() {
    islandGroup = new THREE.Group();
    const positions = [
      [-16, -6, -18], [15, -10, -26], [-10, 6, -34], [9, 9, -20]
    ];
    positions.forEach((pos, i) => {
      const body = new THREE.ConeGeometry(2.4, 1.6, 6);
      const mat = new THREE.MeshStandardMaterial({ color: 0x2c2a5c, roughness: 1 });
      const island = new THREE.Mesh(body, mat);
      island.position.set(...pos);
      island.rotation.x = Math.PI;
      island.userData.bob = Math.random() * Math.PI * 2;
      islandGroup.add(island);
    });
    const light = new THREE.AmbientLight(0x8fa0ff, 0.6);
    scene.add(light);
    scene.add(islandGroup);

    // Rim light so silhouettes (castle, islands) actually read as shapes,
    // not flat blobs — this is what makes camera movement visible.
    const rim = new THREE.DirectionalLight(0xffe3a8, 0.9);
    rim.position.set(-10, 14, 8);
    scene.add(rim);
  }

  /** A large, close-ish castle silhouette — the concrete foreground anchor
   *  that makes camera dolly/orbit/crane moves actually visible. Without
   *  something solid in the near-frame, moving through empty starfield
   *  barely reads as "movement" at all. */
  function buildCastle() {
    castle = new THREE.Group();
    const dark = new THREE.MeshStandardMaterial({ color: 0x1a1440, roughness: 0.9 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xf0c86e, roughness: 0.5, emissive: 0x3a2a08, emissiveIntensity: 0.4 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(9, 6, 4), dark);
    base.position.set(0, -1, 0);
    castle.add(base);

    [[-5.2, 0], [5.2, 0]].forEach(([x]) => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 9, 8), dark);
      tower.position.set(x, 1.5, 0);
      castle.add(tower);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.7, 2.2, 8), gold);
      roof.position.set(x, 7.1, 0);
      castle.add(roof);
    });

    const keep = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 6, 8), dark);
    keep.position.set(0, 3.4, 0);
    castle.add(keep);
    const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 2.6, 8), gold);
    keepRoof.position.set(0, 7.7, 0);
    castle.add(keepRoof);

    castle.position.set(0, -10, -18);
    castle.scale.set(1.4, 1.4, 1.4);
    scene.add(castle);
  }

  /** A single warm point-light "firefly" that can be flown around the
   *  scene with GSAP (used by Hero to give a sense of a living companion
   *  flitting through the world, without a full rigged 3D character). */
  function buildFairyLight() {
    fairyLight = new THREE.PointLight(0xffe9b0, 1.4, 14);
    fairyLight.position.set(-8, 2, 8);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfff6dd }));
    fairyLight.add(core);
    scene.add(fairyLight);
  }

  function onResize() {
    if (!renderer || !camera) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  }

  let clock = null;
  let frozen = false;
  let directorMode = false; // when true, ambient mouse-parallax is suspended so GSAP camera moves aren't fought
  let wanderEnabled = false;

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    if (frozen) return; // skip all updates + re-render — canvas holds its last frame, a true visual freeze
    if (!clock && window.THREE && THREE.Clock) clock = new THREE.Clock();
    const t = clock ? clock.getElapsedTime() : Date.now() / 1000;

    if (stars && !reduced) stars.rotation.y = t * 0.006;
    if (moon && !reduced) moon.position.y = 10 + Math.sin(t * 0.2) * 0.4;

    if (aurora) {
      aurora.children.forEach((ribbon, i) => {
        ribbon.rotation.z = Math.sin(t * 0.1 + i) * 0.05;
        ribbon.position.x = Math.sin(t * 0.08 + i * 2) * 4;
      });
    }
    if (islandGroup) {
      islandGroup.children.forEach((island) => {
        island.position.y += Math.sin(t * 0.5 + island.userData.bob) * 0.001;
        island.rotation.y = t * 0.05;
      });
    }
    if (castle && !reduced) {
      castle.rotation.y = Math.sin(t * 0.04) * 0.03;
    }
    if (fairyLight && wanderEnabled && !reduced) {
      fairyLight.position.x = -8 + Math.sin(t * 0.35) * 5;
      fairyLight.position.y = 2 + Math.sin(t * 0.6) * 1.4;
      fairyLight.position.z = 8 + Math.cos(t * 0.3) * 3;
    }

    if (!directorMode) {
      targetRotX += (mouseY * 0.15 - targetRotX) * 0.02;
      targetRotY += (mouseX * 0.15 - targetRotY) * 0.02;
      if (camera && !reduced) {
        camera.rotation.x = targetRotX * 0.3;
        camera.rotation.y = targetRotY * 0.3;
      }
    }

    renderer.render(scene, camera);
  }

  /** Called by main.js scroll-linked GSAP timeline to drift camera forward (cinematic feel) */
  function setDepth(z) {
    if (camera) camera.position.z = 20 - z;
  }

  /* -------------------- Camera Director API (trailer / hero cinematics) -------------------- */
  function setFrozen(val) { frozen = val; }
  function enableDirector() { directorMode = true; }
  function disableDirector() { directorMode = false; }

  function flyCamera(props, duration = 2, ease = "power2.inOut") {
    return new Promise((resolve) => {
      if (!camera || !window.gsap) { resolve(); return; }
      const tl = gsap.timeline({ onComplete: resolve });
      if (props.position) tl.to(camera.position, { ...props.position, duration, ease }, 0);
      if (props.rotation) tl.to(camera.rotation, { ...props.rotation, duration, ease }, 0);
      if (props.fov) tl.to(camera, { fov: props.fov, duration, ease, onUpdate: () => camera.updateProjectionMatrix() }, 0);
    });
  }

  // Named cinematic moves — each returns a Promise so trailer.js can await/sequence them.
  const CameraDirector = {
    dolly: (zDelta, duration = 2.2) => {
      if (!camera) return Promise.resolve();
      return flyCamera({ position: { z: camera.position.z - zDelta } }, duration, "power2.inOut");
    },
    pushIn: (duration = 1.8) => {
      if (!camera) return Promise.resolve();
      return flyCamera({ position: { z: camera.position.z - 6 }, fov: 46 }, duration, "power3.inOut");
    },
    pullBack: (duration = 1.8) => {
      if (!camera) return Promise.resolve();
      return flyCamera({ position: { z: camera.position.z + 6 }, fov: 60 }, duration, "power3.inOut");
    },
    orbit: (angle = 0.6, duration = 2.4) => {
      if (!camera) return Promise.resolve();
      return flyCamera({
        position: { x: camera.position.x + Math.sin(angle) * 8, y: camera.position.y + 1.5 },
        rotation: { y: camera.rotation.y + angle * 0.4 }
      }, duration, "sine.inOut");
    },
    crane: (yDelta = 5, duration = 2.2) => {
      if (!camera) return Promise.resolve();
      return flyCamera({
        position: { y: camera.position.y + yDelta },
        rotation: { x: camera.rotation.x - 0.08 }
      }, duration, "power2.inOut");
    },
    portalTravel: (duration = 1.4) => {
      if (!camera) return Promise.resolve();
      return flyCamera({ position: { z: camera.position.z - 14 }, fov: 78 }, duration, "power4.in");
    },
    settle: (duration = 1.6) => {
      if (!camera) return Promise.resolve();
      return flyCamera({ position: { x: 0, y: 0, z: 20 }, rotation: { x: 0, y: 0, z: 0 }, fov: 60 }, duration, "power2.out");
    }
  };

  function setWander(val) { wanderEnabled = val; }

  return { init, setDepth, setFrozen, enableDirector, disableDirector, flyCamera, CameraDirector, setWander };
})();

/* -------------------- Day/Night/Aurora/Fireworks sky gradient -------------------- */
const SkyGradient = (() => {
  let layer;
  const stops = SITE_CONFIG.skyStops;

  function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToCss([r, g, b]) { return `rgb(${r},${g},${b})`; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpColor(c1, c2, t) {
    return [0, 1, 2].map(i => Math.round(lerp(c1[i], c2[i], t)));
  }

  function init() {
    layer = document.getElementById("sky-gradient");
    if (!layer) return;
    setProgress(0);
  }

  /** progress: 0 (morning) → 1 (fireworks finale) */
  function setProgress(progress) {
    if (!layer) return;
    const segments = stops.length - 1;
    const scaled = Math.min(progress, 0.9999) * segments;
    const idx = Math.floor(scaled);
    const t = scaled - idx;
    const from = stops[idx];
    const to = stops[idx + 1] || stops[idx];

    const top = rgbToCss(lerpColor(hexToRgb(from.top), hexToRgb(to.top), t));
    const bottom = rgbToCss(lerpColor(hexToRgb(from.bottom), hexToRgb(to.bottom), t));
    layer.style.background = `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;
  }

  return { init, setProgress };
})();

/* -------------------- Custom cursor -------------------- */
const CustomCursor = (() => {
  function init() {
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (isTouch) { document.body.classList.add("no-custom-cursor"); return; }

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.append(dot, ring);

    let dx = 0, dy = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", (e) => {
      dx = e.clientX; dy = e.clientY;
      dot.style.left = dx + "px";
      dot.style.top = dy + "px";
    });

    function loop() {
      rx += (dx - rx) * 0.18;
      ry += (dy - ry) * 0.18;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    }
    loop();

    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, .gallery-card, .egg-item, [data-hover]")) {
        ring.classList.add("is-active");
      }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, .gallery-card, .egg-item, [data-hover]")) {
        ring.classList.remove("is-active");
      }
    });
  }
  return { init };
})();
