'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { gsap } from 'gsap';

interface ShipSceneProps {
  progress: number;
  opacity: number;
  isVisible: boolean;
  reducedMotion: boolean;
}

type FocusFrame = {
  progress: number;
  target: THREE.Vector3;
  roll: number;
  focus: number;
  aperture: number;
  lightBoost: number;
};

type LightingRig = {
  key: THREE.SpotLight;
  rim: THREE.DirectionalLight;
  fill: THREE.PointLight;
  kicker: THREE.PointLight;
  accent: THREE.SpotLight;
  floor: THREE.Mesh;
};

const MODEL_PATH = '/assets/3dmodel/Engine/v8_motorbike_engine_optimized.glb';
const SPARK_COUNT = 1200;

const FOCUS_FRAMES: FocusFrame[] = [
  {
    progress: 0.0,
    target: new THREE.Vector3(-1.6, 0.8, 0.2),
    roll: THREE.MathUtils.degToRad(-3.5),
    focus: 6.5,
    aperture: 0.012,
    lightBoost: 0.55,
  },
  {
    progress: 0.33,
    target: new THREE.Vector3(-0.15, 1.05, 0.05),
    roll: THREE.MathUtils.degToRad(-0.8),
    focus: 4.5,
    aperture: 0.01,
    lightBoost: 0.82,
  },
  {
    progress: 0.66,
    target: new THREE.Vector3(0.24, 1.22, -0.1),
    roll: THREE.MathUtils.degToRad(1.4),
    focus: 3.2,
    aperture: 0.009,
    lightBoost: 1.0,
  },
  {
    progress: 1.0,
    target: new THREE.Vector3(-0.18, 0.98, 0.08),
    roll: THREE.MathUtils.degToRad(-2.6),
    focus: 2.8,
    aperture: 0.008,
    lightBoost: 0.7,
  },
];

const focusForProgress = (progress: number): FocusFrame => {
  if (progress <= FOCUS_FRAMES[0].progress) return FOCUS_FRAMES[0];
  if (progress >= FOCUS_FRAMES[FOCUS_FRAMES.length - 1].progress) {
    return FOCUS_FRAMES[FOCUS_FRAMES.length - 1];
  }

  for (let i = 0; i < FOCUS_FRAMES.length - 1; i += 1) {
    const current = FOCUS_FRAMES[i];
    const next = FOCUS_FRAMES[i + 1];
    if (progress >= current.progress && progress <= next.progress) {
      const local = (progress - current.progress) / Math.max(0.0001, next.progress - current.progress);
      const eased = local * local * (3 - 2 * local);
      return {
        progress,
        target: current.target.clone().lerp(next.target, eased),
        roll: THREE.MathUtils.lerp(current.roll, next.roll, eased),
        focus: THREE.MathUtils.lerp(current.focus, next.focus, eased),
        aperture: THREE.MathUtils.lerp(current.aperture, next.aperture, eased),
        lightBoost: THREE.MathUtils.lerp(current.lightBoost, next.lightBoost, eased),
      };
    }
  }

  return FOCUS_FRAMES[FOCUS_FRAMES.length - 1];
};

const buildLighting = (scene: THREE.Scene): LightingRig => {
  const hemi = new THREE.HemisphereLight(0x16263d, 0x040506, 0.48);
  scene.add(hemi);

  const key = new THREE.SpotLight(0xffb37a, 1.35, 30, Math.PI / 4.8, 0.45, 1.35);
  key.position.set(6.2, 8.0, 6.1);
  key.target.position.set(0, 1.1, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.00018;
  scene.add(key);
  scene.add(key.target);

  const rim = new THREE.DirectionalLight(0x6ac3ff, 0.85);
  rim.position.set(-5.6, 3.2, -6.1);
  scene.add(rim);

  const fill = new THREE.PointLight(0x4a6d93, 0.28, 16);
  fill.position.set(2.8, 1.8, 3.2);
  scene.add(fill);

  const kicker = new THREE.PointLight(0xffd8aa, 0.4, 8.5);
  kicker.position.set(-2.4, 1.2, 2.0);
  scene.add(kicker);

  const accent = new THREE.SpotLight(0xfff0c8, 0.7, 16, Math.PI / 5.4, 0.5, 1.1);
  accent.position.set(0.5, 0.55, 2.0);
  accent.target.position.set(0, 1.0, 0);
  scene.add(accent);
  scene.add(accent.target);

  const floorGeometry = new THREE.CircleGeometry(7.5, 128);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x1c2029,
    roughness: 0.94,
    metalness: 0.22,
    emissive: 0x101316,
    emissiveIntensity: 0.1,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.05;
  floor.receiveShadow = true;
  scene.add(floor);

  return { key, rim, fill, kicker, accent, floor };
};

export default function ShipScene({ progress, opacity, isVisible, reducedMotion }: ShipSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationDurationRef = useRef(1);
  const engineRootRef = useRef<THREE.Group | null>(null);

  // Pointer orbit override
  // pointer orbit override handled by manualControlRef (below)

  // Sparks particle system
  const sparkStatesRef = useRef<{ velocity: THREE.Vector3; life: number }[]>([]);

  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const bokehPassRef = useRef<BokehPass | null>(null);
  const lightingRigRef = useRef<LightingRig | null>(null);

  const frameRef = useRef<number | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const progressRef = useRef(progress);
  const smoothedProgressRef = useRef(progress);
  const sparkMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const sparkPointsRef = useRef<THREE.Points | null>(null);
  const manualControlRef = useRef({
    active: false,
    pointerId: null as number | null,
    lastX: 0,
    lastY: 0,
    yaw: 0,
    pitch: 0,
    targetYaw: 0,
    targetPitch: 0,
  });
  const reducedMotionRef = useRef(reducedMotion);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    if (sparkMaterialRef.current) {
      sparkMaterialRef.current.uniforms.uMotionScale.value = reducedMotion ? 0 : 1;
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.to(containerRef.current, {
      opacity: isVisible ? opacity : 0,
      duration: 0.5,
      ease: 'power2.inOut',
    });
  }, [opacity, isVisible]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const clock = clockRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080b);
    scene.fog = new THREE.FogExp2(0x06080b, 0.006);
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const baseRatio = window.devicePixelRatio || 1;
    const prefersLowPerf = (navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth < 768;
    const targetRatio = Math.min(prefersLowPerf ? 1.1 : 1.6, baseRatio);
    renderer.setPixelRatio(targetRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMappingExposure = prefersLowPerf ? 0.6 : 0.76;
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(8.1, 5.2, 8.4);
    cameraRef.current = camera;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = 0.32;

    const lightingRig = buildLighting(scene);
    lightingRigRef.current = lightingRig;

    const sparkGeometry = new THREE.BufferGeometry();
    const basePositions = new Float32Array(SPARK_COUNT * 3);
    const offsets = new Float32Array(SPARK_COUNT * 3);
    const seeds = new Float32Array(SPARK_COUNT);
    const phases = new Float32Array(SPARK_COUNT);
    const lives = new Float32Array(SPARK_COUNT);

    for (let i = 0; i < SPARK_COUNT; i += 1) {
      const i3 = i * 3;
      basePositions[i3] = 0;
      basePositions[i3 + 1] = 0;
      basePositions[i3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.65;
      offsets[i3] = Math.cos(angle) * radius;
      offsets[i3 + 1] = Math.random() * 0.32 + 0.35;
      offsets[i3 + 2] = Math.sin(angle) * radius;
      seeds[i] = Math.random();
      phases[i] = Math.random();
      lives[i] = Math.random();
    }

    sparkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(basePositions, 3));
    sparkGeometry.setAttribute('aOffset', new THREE.Float32BufferAttribute(offsets, 3));
    sparkGeometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    sparkGeometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
    sparkGeometry.setAttribute('aLife', new THREE.Float32BufferAttribute(lives, 1));

    const sparkVertexShader = /* glsl */ `
      precision mediump float;
      uniform float uTime;
      uniform float uScroll;
      uniform float uMotionScale;
      uniform float uInteraction;
      attribute vec3 aOffset;
      attribute float aSeed;
      attribute float aPhase;
      attribute float aLife;
      varying float vAlpha;
      varying float vGlow;

      void main() {
        float motion = clamp(uMotionScale, 0.0, 1.0);
        float loopT = fract(uTime * (0.45 + aSeed * 0.25) + aPhase);
        float travel = pow(loopT, 0.6);
        vec3 offset = aOffset;
        offset.y += travel * (1.2 + aLife * 1.6) * (0.6 + uScroll * 0.7);
        offset.x += sin(loopT * 6.28318 + aSeed * 9.7) * (0.08 + aLife * 0.15) * (0.65 + motion * 0.9);
        offset.z += cos(loopT * 6.28318 + aSeed * 8.1) * (0.05 + aLife * 0.12) * (0.65 + motion * 0.9);
        offset.y += uInteraction * 0.25;

        vec4 mvPosition = modelViewMatrix * vec4(offset, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        float sizeBase = mix(3.5, 10.0, aLife);
        float interactionBoost = mix(1.0, 1.6, clamp(uInteraction, 0.0, 1.0));
        gl_PointSize = sizeBase * interactionBoost * (1.0 / -mvPosition.z);

        vAlpha = (1.0 - loopT) * (0.6 + uScroll * 0.4);
        vGlow = aLife;
      }
    `;

    const sparkFragmentShader = /* glsl */ `
      precision mediump float;
      uniform float uMotionScale;
      uniform float uInteraction;
      varying float vAlpha;
      varying float vGlow;

      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float dist = length(uv);
        float falloff = smoothstep(0.5, 0.0, dist);
        float inner = smoothstep(0.25, 0.0, dist);
        vec3 cold = vec3(0.96, 0.58, 0.26);
        vec3 hot = vec3(1.0, 0.86, 0.6);
        float motionTint = mix(0.12, 0.45, clamp(uMotionScale, 0.0, 1.0));
        vec3 color = mix(cold, hot, vGlow) + motionTint * inner;
        float alpha = falloff * vAlpha;
        if (alpha <= 0.001) discard;
        float interaction = mix(0.6, 1.0, clamp(uInteraction, 0.0, 1.0));
        gl_FragColor = vec4(color * (0.6 + inner * 0.6) * interaction, alpha);
      }
    `;

    const sparkMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uMotionScale: { value: reducedMotionRef.current ? 0 : 1 },
        uInteraction: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: sparkVertexShader,
      fragmentShader: sparkFragmentShader,
    });

    const sparkPoints = new THREE.Points(sparkGeometry, sparkMaterial);
    sparkPoints.position.set(0.35, 0.6, 0);
    sparkPoints.renderOrder = 3;
    scene.add(sparkPoints);
    sparkMaterialRef.current = sparkMaterial;
    sparkPointsRef.current = sparkPoints;

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      MODEL_PATH,
      (gltf: GLTF) => {
        const engineRoot = new THREE.Group();
        engineRoot.position.set(0, 0, 0);
        engineRoot.scale.setScalar(1.0);
        engineRootRef.current = engineRoot;

        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone();
          }
        });

        engineRoot.add(gltf.scene);
        scene.add(engineRoot);

        if (gltf.animations.length) {
          const mixer = new THREE.AnimationMixer(engineRoot);
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
          mixerRef.current = mixer;
          animationDurationRef.current = Math.max(0.01, ...gltf.animations.map((clip) => clip.duration || 0.01));
        }

        const idleTimeline = gsap.timeline({ repeat: -1, yoyo: true });
        idleTimeline.to(engineRoot.rotation, { y: '+=0.24', duration: 7.5, ease: 'sine.inOut' }, 0);
        idleTimeline.to(engineRoot.position, { y: '+=0.08', duration: 3.5, ease: 'sine.inOut' }, 0);

        

        setIsLoaded(true);
      },
      undefined,
      (error: unknown) => {
        console.error('Failed to load engine GLB', error);
        setLoadError('Engine model failed to load. See console for details.');
      }
    );

    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(targetRatio);
    composer.addPass(new RenderPass(scene, camera));

    const bokehPass = new BokehPass(scene, camera, { focus: 5, aperture: 0.01, maxblur: 0.0035 });
    composer.addPass(bokehPass);
    bokehPassRef.current = bokehPass;

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      prefersLowPerf ? 0.28 : 0.4,
      0.2,
      0.87
    );
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;
    composerRef.current = composer;

    const cameraClock = { value: 0 };
    const tmpTarget = new THREE.Vector3();
    const tmpForward = new THREE.Vector3();
    const tmpMatrix = new THREE.Matrix4();
    const baseUp = new THREE.Vector3(0, 1, 0);
    const baseQuaternion = new THREE.Quaternion();
    const rollQuaternion = new THREE.Quaternion();

    const updateCamera = (progressValue: number, elapsed: number): FocusFrame => {
      if (!cameraRef.current) return focusForProgress(progressValue);

      let orbitRadius: number;
      let orbitAngle: number;
      let height: number;
      let fov: number;
      const motionScale = reducedMotionRef.current ? 0.35 : 1;
      const manual = manualControlRef.current;
      const manualYaw = manual.yaw;
      const manualPitch = manual.pitch;

      if (progressValue < 0.3) {
        const phase = progressValue / 0.3;
        orbitRadius = THREE.MathUtils.lerp(8.6, 7.1, phase);
        orbitAngle = THREE.MathUtils.lerp(Math.PI * 0.28, Math.PI * 0.18, phase);
        height = THREE.MathUtils.lerp(5.0, 4.0, phase);
        fov = THREE.MathUtils.lerp(50, 46.5, phase);
      } else if (progressValue < 0.7) {
        const phase = (progressValue - 0.3) / 0.4;
        const eased = phase * phase * (3 - 2 * phase);
        orbitRadius = THREE.MathUtils.lerp(7.1, 3.1, eased);
        orbitAngle = THREE.MathUtils.lerp(Math.PI * 0.18, -Math.PI * 0.54, eased);
        height = THREE.MathUtils.lerp(4.0, 1.95, eased);
        fov = THREE.MathUtils.lerp(46.5, 38.5, eased);
      } else {
        const phase = (progressValue - 0.7) / 0.3;
        orbitRadius = THREE.MathUtils.lerp(3.1, 2.5, phase);
        orbitAngle = THREE.MathUtils.lerp(-Math.PI * 0.54, -Math.PI * 0.7, phase);
        height = THREE.MathUtils.lerp(1.95, 1.3, phase);
        fov = THREE.MathUtils.lerp(38.5, 36.8, phase);
      }

      orbitAngle += manualYaw * 0.55;
      height += manualPitch * 1.4;
      orbitRadius += manualPitch * -0.35;

      cameraRef.current.fov = fov;
      cameraRef.current.updateProjectionMatrix();

      const baseX = Math.cos(orbitAngle) * orbitRadius;
      const baseZ = Math.sin(orbitAngle) * orbitRadius;
      const driftX = Math.sin(elapsed * 0.24) * 0.07 * motionScale;
      const driftY = Math.cos(elapsed * 0.2) * 0.05 * motionScale;
      const driftZ = Math.sin(elapsed * 0.18) * 0.06 * motionScale;
      cameraRef.current.position.set(baseX + driftX, height + driftY, baseZ + driftZ);

      const focusState = focusForProgress(progressValue);
      tmpTarget.copy(focusState.target);
      tmpTarget.x += Math.sin(elapsed * 0.24) * 0.014 * motionScale + manualYaw * 0.25;
      tmpTarget.y += Math.sin(elapsed * 0.28) * 0.02 * motionScale + manualPitch * 0.4;

      tmpForward.subVectors(tmpTarget, cameraRef.current.position).normalize();
      tmpMatrix.lookAt(cameraRef.current.position, tmpTarget, baseUp);
      baseQuaternion.setFromRotationMatrix(tmpMatrix);
      rollQuaternion.setFromAxisAngle(
        tmpForward,
        focusState.roll +
          Math.sin(elapsed * 0.16) * THREE.MathUtils.degToRad(0.7) * motionScale +
          manualYaw * THREE.MathUtils.degToRad(2.5)
      );
      cameraRef.current.quaternion.copy(baseQuaternion).multiply(rollQuaternion);
      cameraRef.current.updateMatrixWorld(true);
      return focusState;
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      cameraClock.value += delta;

      const targetProgress = THREE.MathUtils.clamp(progressRef.current, 0, 1);
      smoothedProgressRef.current = THREE.MathUtils.lerp(smoothedProgressRef.current, targetProgress, 0.18);

      const manual = manualControlRef.current;
      if (!manual.active) {
        manual.targetYaw *= 0.92;
        manual.targetPitch *= 0.88;
      }
      manual.yaw = THREE.MathUtils.lerp(manual.yaw, manual.targetYaw, manual.active ? 0.22 : 0.12);
      manual.pitch = THREE.MathUtils.lerp(manual.pitch, manual.targetPitch, manual.active ? 0.22 : 0.12);
      if (reducedMotionRef.current) {
        manual.yaw = THREE.MathUtils.clamp(manual.yaw, -0.8, 0.8);
        manual.pitch = THREE.MathUtils.clamp(manual.pitch, -0.5, 0.5);
      }

      const focusState = updateCamera(smoothedProgressRef.current, cameraClock.value);

      if (rendererRef.current) {
        const motionMultiplier = reducedMotionRef.current ? 0.85 : 1;
        const targetExposure = prefersLowPerf
          ? THREE.MathUtils.lerp(0.56, 0.76, smoothedProgressRef.current)
          : THREE.MathUtils.lerp(0.6, 0.86, smoothedProgressRef.current);
        rendererRef.current.toneMappingExposure = THREE.MathUtils.lerp(
          rendererRef.current.toneMappingExposure,
          targetExposure * motionMultiplier,
          0.06
        );
      }

      if (bloomPassRef.current) {
        const motionMultiplier = reducedMotionRef.current ? 0.6 : 1;
        const bloomTarget = prefersLowPerf
          ? THREE.MathUtils.lerp(0.22, 0.34, smoothedProgressRef.current)
          : THREE.MathUtils.lerp(0.28, 0.4, smoothedProgressRef.current);
        bloomPassRef.current.strength = THREE.MathUtils.lerp(
          bloomPassRef.current.strength,
          bloomTarget * motionMultiplier,
          0.08
        );
      }

      if (bokehPassRef.current) {
        const uniforms = bokehPassRef.current.materialBokeh.uniforms;
        uniforms.focus.value = THREE.MathUtils.lerp(uniforms.focus.value, focusState.focus, 0.08);
        const targetAperture = reducedMotionRef.current ? focusState.aperture * 0.7 : focusState.aperture;
        uniforms.aperture.value = THREE.MathUtils.lerp(uniforms.aperture.value, targetAperture, 0.1);
      }

      if (lightingRigRef.current) {
        const { key, rim, fill, kicker, accent, floor } = lightingRigRef.current;
        const manualBoost = Math.min(0.4, Math.abs(manual.yaw) * 0.3 + Math.abs(manual.pitch) * 0.2);
        const boost = focusState.lightBoost + manualBoost;

        key.intensity = THREE.MathUtils.lerp(key.intensity, 1.05 + boost * 0.55, 0.07);
        rim.intensity = THREE.MathUtils.lerp(rim.intensity, 0.72 + boost * 0.28, 0.07);
        fill.intensity = THREE.MathUtils.lerp(fill.intensity, 0.26 + boost * 0.18, 0.07);
        kicker.intensity = THREE.MathUtils.lerp(kicker.intensity, 0.32 + boost * 0.25, 0.07);

        accent.position.lerp(new THREE.Vector3(0.4, 0.4 + boost * 0.4, 1.9), 0.08);
        accent.intensity = THREE.MathUtils.lerp(accent.intensity, 0.5 + boost * 0.65, 0.08);
        accent.target.position.lerp(new THREE.Vector3(focusState.target.x * 0.35, 1.0, focusState.target.z * 0.35), 0.1);

        const floorMaterial = floor.material as THREE.MeshStandardMaterial;
        floorMaterial.emissiveIntensity = THREE.MathUtils.lerp(
          floorMaterial.emissiveIntensity,
          0.1 + boost * 0.2,
          0.06
        );
      }

      if (sparkMaterialRef.current) {
        const uniforms = sparkMaterialRef.current.uniforms;
        uniforms.uTime.value += delta * (reducedMotionRef.current ? 0.45 : 1.0);
        uniforms.uScroll.value = THREE.MathUtils.lerp(uniforms.uScroll.value, smoothedProgressRef.current, 0.1);
        const interactionLevel = Math.min(1, Math.abs(manual.yaw) + Math.abs(manual.pitch));
        uniforms.uInteraction.value = THREE.MathUtils.lerp(uniforms.uInteraction.value, interactionLevel, 0.12);
      }

      if (containerRef.current) {
        containerRef.current.style.setProperty('--ship-focus', focusState.lightBoost.toFixed(3));
      }

      if (mixerRef.current) {
        const duration = animationDurationRef.current;
        const targetTime = smoothedProgressRef.current * duration;
        const currentTime = mixerRef.current.time;
        const nextTime = THREE.MathUtils.lerp(currentTime, targetTime, 0.12);
        mixerRef.current.setTime(nextTime);
      }

      if (composerRef.current) {
        composerRef.current.render(delta);
      } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current || !composerRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ratio = Math.min(targetRatio, window.devicePixelRatio || 1);

      rendererRef.current.setPixelRatio(ratio);
      rendererRef.current.setSize(width, height);

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      composerRef.current.setSize(width, height);
      bloomPassRef.current?.setSize(width, height);
      if (bokehPassRef.current) {
        bokehPassRef.current.renderTargetColor.setSize(width, height);
        bokehPassRef.current.renderTargetDepth.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

      composerRef.current?.dispose();
      rendererRef.current?.dispose();
      clock.stop();

      if (sceneRef.current) {
        sceneRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => mat && 'dispose' in mat && (mat as THREE.Material).dispose());
            } else if (mesh.material && 'dispose' in mesh.material) {
              (mesh.material as THREE.Material).dispose();
            }
          }
        });
        sceneRef.current.clear();
      }

      if (sparkPointsRef.current) {
        sceneRef.current?.remove(sparkPointsRef.current);
        sparkPointsRef.current.geometry.dispose();
        const material = sparkPointsRef.current.material;
        if (Array.isArray(material)) {
          material.forEach((mat) => mat && 'dispose' in mat && (mat as THREE.Material).dispose());
        } else if (material && 'dispose' in material) {
          (material as THREE.Material).dispose();
        }
        sparkPointsRef.current = null;
      }
      sparkMaterialRef.current = null;

      envTarget.dispose();
      pmrem.dispose();

      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      composerRef.current = null;
      bloomPassRef.current = null;
      bokehPassRef.current = null;
      lightingRigRef.current = null;
      mixerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || reducedMotion) {
      return undefined;
    }

    const manual = manualControlRef.current;
    const previousTouchAction = element.style.touchAction;
    element.style.touchAction = 'none';
    element.style.cursor = 'grab';

    const handlePointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || manual.active) {
        return;
      }
      manual.active = true;
      manual.pointerId = event.pointerId;
      manual.lastX = event.clientX;
      manual.lastY = event.clientY;
      element.setPointerCapture(event.pointerId);
      element.style.cursor = 'grabbing';
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!manual.active || manual.pointerId !== event.pointerId) {
        return;
      }
      const dx = (event.clientX - manual.lastX) / Math.max(window.innerWidth, 1);
      const dy = (event.clientY - manual.lastY) / Math.max(window.innerHeight, 1);
      manual.lastX = event.clientX;
      manual.lastY = event.clientY;
      manual.targetYaw = THREE.MathUtils.clamp(manual.targetYaw + dx * 4.5, -1.4, 1.4);
      manual.targetPitch = THREE.MathUtils.clamp(manual.targetPitch + dy * 3.2, -0.9, 0.9);
    };

    const releasePointer = (event: PointerEvent) => {
      if (manual.pointerId !== event.pointerId) {
        return;
      }
      manual.active = false;
      manual.pointerId = null;
      manual.lastX = 0;
      manual.lastY = 0;
      manual.targetYaw *= 0.5;
      manual.targetPitch *= 0.5;
      element.releasePointerCapture(event.pointerId);
      element.style.cursor = 'grab';
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', releasePointer);
    element.addEventListener('pointercancel', releasePointer);

    return () => {
      element.style.touchAction = previousTouchAction;
      element.style.cursor = '';
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', releasePointer);
      element.removeEventListener('pointercancel', releasePointer);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        visibility: isVisible ? 'visible' : 'hidden',
        zIndex: 4,
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {!isLoaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center text-sm tracking-wide text-white/70">
          Calibrating engine scene…
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-red-300">
          {loadError}
        </div>
      )}
    </div>
  );
}
