'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { SceneTone } from '../MenuPanel';

interface GlobeSceneProps {
  progress: number;
  opacity: number;
  isVisible: boolean;
  tone: SceneTone;
}

const MODEL_PATH = '/assets/globe/earthquakes_-_2000_to_2019.glb';

type GlobeTonePreset = {
  background: number;
  exposure: number;
  ambient: { color: number; intensity: number };
  key: { color: number; intensity: number };
  rim: { color: number; intensity: number };
  fill: { color: number; intensity: number };
  overlay: string;
};

const GLOBE_TONE_PRESETS: Record<SceneTone, GlobeTonePreset> = {
  dawn: {
    background: 0x071225,
    exposure: 0.92,
    ambient: { color: 0x14233a, intensity: 0.72 },
    key: { color: 0xcbdfff, intensity: 1.05 },
    rim: { color: 0x7cbcff, intensity: 0.92 },
    fill: { color: 0x1a2d47, intensity: 0.6 },
    overlay:
      'radial-gradient(circle at 40% 15%, rgba(116,170,255,0.38) 0%, rgba(7,18,37,0) 55%), linear-gradient(165deg, rgba(10,22,40,0.82) 0%, rgba(7,15,30,0.94) 45%, rgba(4,8,20,0.97) 100%)',
  },
  day: {
    background: 0x091b2f,
    exposure: 0.98,
    ambient: { color: 0x1a2f4a, intensity: 0.78 },
    key: { color: 0xe4f1ff, intensity: 1.1 },
    rim: { color: 0x94caff, intensity: 0.88 },
    fill: { color: 0x1f3a63, intensity: 0.7 },
    overlay:
      'radial-gradient(circle at 48% 18%, rgba(114,173,255,0.42) 0%, rgba(9,27,47,0) 60%), linear-gradient(150deg, rgba(16,36,62,0.8) 0%, rgba(8,20,39,0.9) 45%, rgba(5,12,26,0.95) 100%)',
  },
  dusk: {
    background: 0x040a18,
    exposure: 0.86,
    ambient: { color: 0x0d1626, intensity: 0.66 },
    key: { color: 0xb3ccff, intensity: 1.02 },
    rim: { color: 0x5e9cff, intensity: 1.1 },
    fill: { color: 0x182445, intensity: 0.55 },
    overlay:
      'radial-gradient(circle at 35% 12%, rgba(104,139,255,0.4) 0%, rgba(4,10,24,0) 58%), linear-gradient(175deg, rgba(6,14,32,0.92) 0%, rgba(4,9,22,0.97) 60%, rgba(2,6,16,0.98) 100%)',
  },
  night: {
    background: 0x02060f,
    exposure: 0.78,
    ambient: { color: 0x050b18, intensity: 0.62 },
    key: { color: 0x9ec0ff, intensity: 0.94 },
    rim: { color: 0x4d85ff, intensity: 1.05 },
    fill: { color: 0x0f1b37, intensity: 0.48 },
    overlay:
      'radial-gradient(circle at 50% 10%, rgba(96,140,255,0.36) 0%, rgba(2,6,15,0) 55%), linear-gradient(185deg, rgba(4,10,24,0.9) 0%, rgba(2,6,14,0.96) 60%, rgba(1,4,10,0.98) 100%)',
  },
};

export default function GlobeScene({ progress, opacity, isVisible, tone }: GlobeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pivotRef = useRef<THREE.Group | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.PointLight | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const initialTone = useRef(tone);
  const [isLoaded, setIsLoaded] = useState(false);

  const applyTonePreset = (preset: GlobeTonePreset) => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(preset.background);
    }

    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = preset.exposure;
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(preset.ambient.color);
      ambientLightRef.current.intensity = preset.ambient.intensity;
    }

    if (keyLightRef.current) {
      keyLightRef.current.color.setHex(preset.key.color);
      keyLightRef.current.intensity = preset.key.intensity;
    }

    if (rimLightRef.current) {
      rimLightRef.current.color.setHex(preset.rim.color);
      rimLightRef.current.intensity = preset.rim.intensity;
    }

    if (fillLightRef.current) {
      fillLightRef.current.color.setHex(preset.fill.color);
      fillLightRef.current.intensity = preset.fill.intensity;
    }

    if (overlayRef.current) {
      overlayRef.current.style.background = preset.overlay;
    }
  };

  useEffect(() => {
    const preset = GLOBE_TONE_PRESETS[initialTone.current];

    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 50);
    camera.position.set(0, 0.4, 6.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(preset.ambient.color, preset.ambient.intensity);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const keyLight = new THREE.DirectionalLight(preset.key.color, preset.key.intensity);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const rimLight = new THREE.DirectionalLight(preset.rim.color, preset.rim.intensity);
    rimLight.position.set(-3.5, 2.5, -3);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    const fillLight = new THREE.PointLight(preset.fill.color, preset.fill.intensity, 18);
    fillLight.position.set(-2.4, -0.4, 4.2);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const pivot = new THREE.Group();
    scene.add(pivot);
    pivotRef.current = pivot;

    const loader = new GLTFLoader();
    if ('setMeshoptDecoder' in loader && typeof (loader as unknown as { setMeshoptDecoder: (decoder: typeof MeshoptDecoder) => void }).setMeshoptDecoder === 'function') {
      (loader as unknown as { setMeshoptDecoder: (decoder: typeof MeshoptDecoder) => void }).setMeshoptDecoder(MeshoptDecoder);
    } else if ('setMeshoptDecoder' in GLTFLoader && typeof (GLTFLoader as unknown as { setMeshoptDecoder: (decoder: typeof MeshoptDecoder) => void }).setMeshoptDecoder === 'function') {
      (GLTFLoader as unknown as { setMeshoptDecoder: (decoder: typeof MeshoptDecoder) => void }).setMeshoptDecoder(MeshoptDecoder);
    }

    loader.load(
      MODEL_PATH,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            if (mesh.material && 'toneMapped' in mesh.material) {
              const material = mesh.material as THREE.MeshStandardMaterial;
              material.toneMapped = true;
              material.roughness = Math.min(0.9, (material.roughness ?? 0.8) * 1.1);
              material.metalness = Math.max(0.1, (material.metalness ?? 0.3) * 0.8);
              material.envMapIntensity = 0.6;
            }
          }
        });
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const scale = 3.4 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.y = -0.3;
        pivot.add(model);

        if (gltf.animations && gltf.animations.length) {
          const mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
            action.setEffectiveWeight(1);
            action.setEffectiveTimeScale(1);
          });
          mixerRef.current = mixer;
        }

        setIsLoaded(true);
      },
      undefined,
      (error) => {
        console.error('Failed to load globe model', error);
      }
    );

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      if (pivotRef.current) {
        pivotRef.current.rotation.y += delta * 0.08;
      }
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const { innerWidth, innerHeight } = window;
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      rendererRef.current.setSize(innerWidth, innerHeight);
      cameraRef.current.aspect = innerWidth / innerHeight;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    applyTonePreset(preset);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      renderer.dispose();
      scene.clear();
      ambientLightRef.current = null;
      keyLightRef.current = null;
      rimLightRef.current = null;
      fillLightRef.current = null;
    };
  }, []);

  useEffect(() => {
    applyTonePreset(GLOBE_TONE_PRESETS[tone]);
  }, [tone]);

  useEffect(() => {
    if (!containerRef.current) return;
    const easedOpacity = opacity * (isVisible ? 1 : 0);
    containerRef.current.style.opacity = String(easedOpacity);

    if (cameraRef.current) {
      const zoom = THREE.MathUtils.lerp(6, 4.3, progress);
      cameraRef.current.position.z = zoom;
      cameraRef.current.position.y = THREE.MathUtils.lerp(0.4, 0.8, progress);
      cameraRef.current.lookAt(0, 0, 0);
    }

    if (pivotRef.current) {
      pivotRef.current.rotation.x = THREE.MathUtils.degToRad(
        THREE.MathUtils.lerp(15, 25, progress)
      );
    }
  }, [progress, opacity, isVisible]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0, transition: 'opacity 0.6s ease', zIndex: 3 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none mix-blend-screen transition-[background] duration-500"
        style={{ opacity: 0.9 }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
          Loading globe…
        </div>
      )}
    </div>
  );
}
