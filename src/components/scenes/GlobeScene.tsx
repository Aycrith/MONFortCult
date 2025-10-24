'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

interface GlobeSceneProps {
  progress: number;
  opacity: number;
  isVisible: boolean;
}

const MODEL_PATH = '/assets/globe/earthquakes_-_2000_to_2019.glb';

export default function GlobeScene({ progress, opacity, isVisible }: GlobeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pivotRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050910);
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
    renderer.toneMappingExposure = 0.8;
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0x0d1724, 0.6));

    const keyLight = new THREE.DirectionalLight(0xbfd8ff, 1.1);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x4a7cff, 0.8);
    rimLight.position.set(-3.5, 2.5, -3);
    scene.add(rimLight);

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

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

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
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
          Loading globe…
        </div>
      )}
    </div>
  );
}
