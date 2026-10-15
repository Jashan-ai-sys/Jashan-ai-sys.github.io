import * as THREE from "three";

import { createBlobCreature } from "./blobCreature.js";
import { createGPUFurSystem } from "./furSystem.js";
import { createGPUFurPhysics } from "./gpuPhysics.js";

// The site's teal at the roots, fading to the hero's mint tint at the tips
const COAT = {
  baseColor: "#0b5e56",
  tipColor: "#c9ece5",
  furLength: 0.31,
  furDensity: 0.6,
  roughness: 0.77,
  specular: 0.24,
  clumping: 0.35,
  curliness: 0.23,
  lightIntensity: 1.35,
  rimIntensity: 1.1,
  windStrength: 0.6,
};
const KEY_LIGHT = "#fffaf0";
const RIM_LIGHT = "#bfe9e2";
const KEY_ANGLE = (-74 * Math.PI) / 180;
// Fur is soft enough that 1.5x looks the same as 2x on a retina screen, for far less GPU work
const MAX_PIXEL_RATIO = 1.5;
// A press that moves less than this is a boop, not a stroke
const BOOP_SLOP = 6;

// Draws the furry Mochi-Puff into `host`: it breathes, follows the pointer with its eyes, its fur
// parts under a stroke and it hops when booped. With `still` it draws one frame and stops there.
// Returns a function that tears it all down.
export const mountPuff = (host: HTMLElement, { still = false } = {}) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  camera.position.set(0, 0.4, 7.2);
  camera.lookAt(0, 0.14, 0);

  const key = new THREE.Vector3(Math.sin(KEY_ANGLE) * 2.8, 2.1, Math.cos(KEY_ANGLE) * 2.8);
  const keyLight = new THREE.DirectionalLight(KEY_LIGHT, COAT.lightIntensity * 1.35);
  keyLight.position.copy(key);
  const rimLight = new THREE.DirectionalLight(RIM_LIGHT, COAT.rimIntensity * 1.15);
  rimLight.position.set(-2.4, 1.8, -3.2);
  scene.add(keyLight, rimLight, new THREE.HemisphereLight("#ffffff", "#0e3b37", 0.85));

  const creature = createBlobCreature();
  creature.skinMaterial.color.set(COAT.baseColor).multiplyScalar(0.55);
  scene.add(creature.root);

  const physics = createGPUFurPhysics(renderer);
  const fur = createGPUFurSystem(creature.bodyGeometry, {
    ...COAT,
    gpuFurEnabled: physics.isGPGPUActive,
  });
  creature.root.add(fur.shellMesh, fur.strandMesh);

  const u = fur.sharedUniforms;
  u.uKeyLightColor.value.set(KEY_LIGHT);
  u.uKeyLightDir.value.copy(key).normalize();
  u.uRimLightColor.value.set(RIM_LIGHT);

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = host;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  const resizer = new ResizeObserver(resize);
  resizer.observe(host);

  // Pointer, in the canvas's own -1..1 space. The eyes follow it anywhere on the page, clamped to
  // the canvas edge; the fur only reacts while it is over the creature.
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const local = new THREE.Vector3(0, 0, 2);
  const previous = new THREE.Vector3(0, 0, 2);
  const velocity = new THREE.Vector3();
  let overCreature = false;
  let downAt = { x: 0, y: 0 };
  let boop = 0;
  let visible = true;

  const onMove = (e: PointerEvent) => {
    if (!visible) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const inside = Math.abs(x) <= 1 && Math.abs(y) <= 1;
    pointer.set(THREE.MathUtils.clamp(x, -1, 1), THREE.MathUtils.clamp(y, -1, 1));

    raycaster.setFromCamera(pointer, camera);
    const hit = inside ? raycaster.intersectObject(creature.bodyMesh, false)[0] : undefined;
    if (!hit) {
      overCreature = false;
      host.style.cursor = "";
      return;
    }
    previous.copy(local);
    local.copy(creature.root.worldToLocal(hit.point));
    if (overCreature) velocity.subVectors(local, previous).multiplyScalar(32);
    overCreature = true;
    host.style.cursor = "pointer";
  };

  // A tap sends no move first, so the press does its own hit test
  const onDown = (e: PointerEvent) => {
    onMove(e);
    downAt = { x: e.clientX, y: e.clientY };
  };

  const onUp = (e: PointerEvent) => {
    if (overCreature && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < BOOP_SLOP) {
      creature.triggerBoop();
      boop = 1;
    }
    // A finger has left the screen, so the fur under it springs back
    if (e.pointerType !== "mouse") release();
  };

  const release = () => {
    overCreature = false;
    host.style.cursor = "";
  };

  let last = performance.now();
  let elapsed = 0;
  let frame = 0;

  const draw = () => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;
    elapsed += dt;
    boop = boop > 0.001 ? boop * Math.exp(-dt * 2.8) : 0;
    velocity.multiplyScalar(Math.exp(-dt * 12));

    creature.update(dt, pointer, null, false);
    u.uPhysicsTex.value = physics.isGPGPUActive
      ? physics.step({
          time: elapsed,
          dt,
          windStrength: COAT.windStrength,
          creatureVelocity: creature.animState.velocity,
          creatureAngularVel: creature.animState.angularVelocity,
          pointerLocalPos: local,
          pointerVelocity: velocity,
          pointerActive: overCreature,
          boopShockwave: boop,
        })
      : physics.fallbackTexture;
    u.uTime.value = elapsed;
    u.uPointerLocalPos.value.copy(local);
    u.uPointerActive.value = overCreature ? 1 : 0;
    u.uBoopShockwave.value = boop;

    renderer.render(scene, camera);
  };

  const loop = () => {
    draw();
    frame = visible ? requestAnimationFrame(loop) : 0;
  };

  // Only animate while it is on screen, so the rest of the page scrolls on an idle GPU
  const watcher = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible && !frame && !still) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
  });

  if (still) {
    draw();
  } else {
    watcher.observe(host);
    window.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", release);
  }

  return () => {
    cancelAnimationFrame(frame);
    watcher.disconnect();
    resizer.disconnect();
    window.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerdown", onDown);
    host.removeEventListener("pointerup", onUp);
    host.removeEventListener("pointercancel", release);
    // Dropping the context frees every GPU buffer at once, the fur physics' render targets included
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
};
