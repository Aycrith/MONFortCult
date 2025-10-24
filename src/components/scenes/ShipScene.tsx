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

export default function ShipScene({ progress, opacity, isVisible }: ShipSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationDurationRef = useRef(1);

  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const bokehPassRef = useRef<BokehPass | null>(null);
  const lightingRigRef = useRef<LightingRig | null>(null);

  const frameRef = useRef<number | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const progressRef = useRef(progress);
  const smoothedProgressRef = useRef(progress);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

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

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      MODEL_PATH,
      (gltf: GLTF) => {
        const engineRoot = new THREE.Group();
        engineRoot.position.set(0, 0, 0);
        engineRoot.scale.setScalar(1.0);

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

      cameraRef.current.fov = fov;
      cameraRef.current.updateProjectionMatrix();

      const baseX = Math.cos(orbitAngle) * orbitRadius;
      const baseZ = Math.sin(orbitAngle) * orbitRadius;
      const driftX = Math.sin(elapsed * 0.24) * 0.07;
      const driftY = Math.cos(elapsed * 0.2) * 0.05;
      const driftZ = Math.sin(elapsed * 0.18) * 0.06;
      cameraRef.current.position.set(baseX + driftX, height + driftY, baseZ + driftZ);

      const focusState = focusForProgress(progressValue);
      tmpTarget.copy(focusState.target);
      tmpTarget.x += Math.sin(elapsed * 0.24) * 0.014;
      tmpTarget.y += Math.sin(elapsed * 0.28) * 0.02;

      tmpForward.subVectors(tmpTarget, cameraRef.current.position).normalize();
      tmpMatrix.lookAt(cameraRef.current.position, tmpTarget, baseUp);
      baseQuaternion.setFromRotationMatrix(tmpMatrix);
      rollQuaternion.setFromAxisAngle(tmpForward, focusState.roll + Math.sin(elapsed * 0.16) * THREE.MathUtils.degToRad(0.7));
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

      const focusState = updateCamera(smoothedProgressRef.current, cameraClock.value);

      if (rendererRef.current) {
        const targetExposure = prefersLowPerf
          ? THREE.MathUtils.lerp(0.56, 0.76, smoothedProgressRef.current)
          : THREE.MathUtils.lerp(0.6, 0.86, smoothedProgressRef.current);
        rendererRef.current.toneMappingExposure = THREE.MathUtils.lerp(
          rendererRef.current.toneMappingExposure,
          targetExposure,
          0.06
        );
      }

      if (bloomPassRef.current) {
        const bloomTarget = prefersLowPerf
          ? THREE.MathUtils.lerp(0.22, 0.34, smoothedProgressRef.current)
          : THREE.MathUtils.lerp(0.28, 0.4, smoothedProgressRef.current);
        bloomPassRef.current.strength = THREE.MathUtils.lerp(
          bloomPassRef.current.strength,
          bloomTarget,
          0.08
        );
      }

      if (bokehPassRef.current) {
        const uniforms = bokehPassRef.current.materialBokeh.uniforms;
        uniforms.focus.value = THREE.MathUtils.lerp(uniforms.focus.value, focusState.focus, 0.08);
        uniforms.aperture.value = THREE.MathUtils.lerp(uniforms.aperture.value, focusState.aperture, 0.1);
      }

      if (lightingRigRef.current) {
        const { key, rim, fill, kicker, accent, floor } = lightingRigRef.current;
        const boost = focusState.lightBoost;

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
