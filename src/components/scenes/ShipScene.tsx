'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { gsap } from 'gsap';

interface ShipSceneProps {
  progress: number;
  opacity: number;
  isVisible: boolean;
}

const MODEL_PATH = '/assets/3dmodel/Engine/v8_motorbike_engine_optimized.glb';

export default function ShipScene({ progress, opacity, isVisible }: ShipSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const engineRootRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const progressRef = useRef(progress);
  const smoothedProgressRef = useRef(progress);
  const engineMotionRef = useRef<gsap.core.Timeline | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    gsap.to(containerRef.current, {
      opacity: isVisible ? opacity : 0,
      duration: 0.6,
      ease: 'power2.inOut',
    });
  }, [opacity, isVisible]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const clock = clockRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070f);
    scene.fog = null;
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

    const basePixelRatio = window.devicePixelRatio || 1;
    const prefersLowPerformance =
      (window.navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency &&
      (window.navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency! <= 4;
    const targetPixelRatio = Math.min(prefersLowPerformance ? 1.1 : 1.6, basePixelRatio);
    renderer.setPixelRatio(targetPixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMappingExposure = prefersLowPerformance ? 0.92 : 1.08;
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    camera.position.set(6.5, 3.6, 6.8);
    cameraRef.current = camera;

    const hemiLight = new THREE.HemisphereLight(0x8fb7ff, 0x061320, 0.75);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xf3f6ff, 1.55);
    keyLight.position.set(3.8, 6.6, 2.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    const rimLight = new THREE.SpotLight(0x6ab8ff, 1.8, 50, Math.PI / 7, 0.45, 1.05);
    rimLight.position.set(-4.5, 6, -3.6);
    rimLight.target.position.set(0, 1.4, 0);
    rimLight.castShadow = true;
    rimLight.shadow.mapSize.set(1024, 1024);
    scene.add(rimLight);
    scene.add(rimLight.target);

    const fillLight = new THREE.PointLight(0x4aa9ff, 0.85, 14);
    fillLight.position.set(1.2, 2.6, 4);
    scene.add(fillLight);

    const platformGlow = new THREE.PointLight(0x8acfff, 0.45, 9, 2.6);
    platformGlow.position.set(0, 0.9, 0);
    scene.add(platformGlow);

    const ambientFill = new THREE.AmbientLight(0x0a101a, 0.45);
    scene.add(ambientFill);

    const platformGeometry = new THREE.TorusGeometry(4.2, 0.18, 32, 160);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2840,
      roughness: 0.8,
      metalness: 0.22,
      emissive: 0x122037,
      emissiveIntensity: 0.1,
    });
    const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
    platformMesh.rotation.x = Math.PI / 2;
    platformMesh.position.y = 0.0;
    platformMesh.receiveShadow = true;
    scene.add(platformMesh);

    const rimAccent = new THREE.Mesh(
      new THREE.RingGeometry(4.35, 4.75, 96),
      new THREE.MeshBasicMaterial({
        color: 0x70b7ff,
        opacity: 0.25,
        transparent: true,
        depthWrite: false
      })
    );
    rimAccent.rotation.x = -Math.PI / 2;
    rimAccent.position.y = 0.02;
    scene.add(rimAccent);

    const innerGlow = new THREE.Mesh(
      new THREE.CircleGeometry(4.1, 80),
      new THREE.MeshBasicMaterial({
        color: 0x2b4d7a,
        opacity: 0.25,
        transparent: true,
        depthWrite: false
      })
    );
    innerGlow.rotation.x = -Math.PI / 2;
    innerGlow.position.y = 0.01;
    if (innerGlow.material instanceof THREE.MeshBasicMaterial) {
      innerGlow.material.opacity = 0.18;
    }
    scene.add(innerGlow);

    const enginePivot = new THREE.Group();
    enginePivot.position.set(0, 0.55, 0);
    scene.add(enginePivot);
    engineRootRef.current = enginePivot;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.05);
    scene.environment = envRenderTarget.texture;
    (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = 0.8;

    const loader = new GLTFLoader();
    if ('setMeshoptDecoder' in loader && typeof (loader as unknown as { setMeshoptDecoder: (decoder: typeof MeshoptDecoder) => void }).setMeshoptDecoder === 'function') {
      (loader as unknown as { setMeshoptDecoder: (decoder: typeof MeshoptDecoder) => void }).setMeshoptDecoder(
        MeshoptDecoder
      );
    } else if (
      'setMeshoptDecoder' in GLTFLoader &&
      typeof (GLTFLoader as unknown as { setMeshoptDecoder: (decoder: typeof MeshoptDecoder) => void }).setMeshoptDecoder ===
        'function'
    ) {
      (GLTFLoader as unknown as { setMeshoptDecoder: (decoder: typeof MeshoptDecoder) => void }).setMeshoptDecoder(
        MeshoptDecoder
      );
    }
    loader.load(
      MODEL_PATH,
      (gltf: GLTF) => {
        const model = gltf.scene;
        const boundingBox = new THREE.Box3().setFromObject(model);
        const size = boundingBox.getSize(new THREE.Vector3());
        const center = boundingBox.getCenter(new THREE.Vector3());

        model.position.sub(center);

        const targetHeight = 7.4;
        const largestAxis = Math.max(size.x, size.y, size.z);
        const scale = targetHeight / largestAxis;
        model.scale.setScalar(scale);
        model.position.y += targetHeight * 0.06;

        model.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => {
                if (mat && 'toneMapped' in mat) {
                  const material = mat as THREE.MeshStandardMaterial;
                  material.toneMapped = true;
                  material.metalness = Math.min(1, (material.metalness ?? 0.45) + 0.12);
                  material.roughness = Math.max(0.25, (material.roughness ?? 0.65) * 0.85);
                  material.envMapIntensity = 1.0;
                  material.needsUpdate = true;
                }
              });
            } else if (mesh.material && 'toneMapped' in mesh.material) {
              const material = mesh.material as THREE.MeshStandardMaterial;
              material.toneMapped = true;
              material.metalness = Math.min(1, (material.metalness ?? 0.45) + 0.12);
              material.roughness = Math.max(0.25, (material.roughness ?? 0.65) * 0.85);
              material.envMapIntensity = 1.0;
              material.needsUpdate = true;
            }
          }
        });

        enginePivot.add(model);

        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip: THREE.AnimationClip) => {
            const action = mixer.clipAction(clip);
            action.reset();
            action.setLoop(THREE.LoopPingPong, Infinity);
            action.clampWhenFinished = true;
            action.enabled = true;
            action.setEffectiveTimeScale(1.1);
            action.setEffectiveWeight(1);
            action.play();
          });
          mixer.setTime(0);
          mixerRef.current = mixer;
        }

        if (engineMotionRef.current) {
          engineMotionRef.current.kill();
        }
        const motion = gsap.timeline({ repeat: -1, yoyo: true });
        motion.to(enginePivot.rotation, { y: '+=0.28', duration: 8.5, ease: 'sine.inOut' }, 0);
        motion.to(enginePivot.position, { y: '+=0.06', duration: 4.25, ease: 'sine.inOut' }, 0);
        motion.to(enginePivot.rotation, { x: '+=0.04', duration: 4.25, ease: 'sine.inOut' }, 0);
        engineMotionRef.current = motion;

        setIsLoaded(true);
      },
      undefined,
      (error: unknown) => {
        console.error('Failed to load engine GLB', error);
        setLoadError('Engine model failed to load. See console for details.');
      }
    );

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomResolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    const bloomPass = new UnrealBloomPass(
      bloomResolution,
      prefersLowPerformance ? 0.9 : 1.45,
      0.32,
      0.9
    );
    bloomPass.threshold = 0.18;
    bloomPass.strength = prefersLowPerformance ? 0.75 : 1.2;
    bloomPass.radius = 0.55;
    composer.addPass(bloomPass);
    composerRef.current = composer;
    bloomPassRef.current = bloomPass;

    const updateCamera = (t: number) => {
      if (!cameraRef.current) return;
      const orbitRadius = THREE.MathUtils.lerp(4.8, 2.6, t);
      const orbitAngle = THREE.MathUtils.lerp(Math.PI * 0.22, -Math.PI * 0.4, t);
      const height = THREE.MathUtils.lerp(2.4, 1.6, t);

      const x = Math.cos(orbitAngle) * orbitRadius;
      const z = Math.sin(orbitAngle) * orbitRadius;

      cameraRef.current.position.set(x, height, z);
      cameraRef.current.lookAt(0, 0.9, 0);
    };

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      smoothedProgressRef.current = THREE.MathUtils.damp(
        smoothedProgressRef.current,
        progressRef.current,
        4,
        delta
      );
      updateCamera(smoothedProgressRef.current);

      const targetExposure = prefersLowPerformance
        ? 0.9 + smoothedProgressRef.current * 0.08
        : 1.02 + smoothedProgressRef.current * 0.18;
      renderer.toneMappingExposure = THREE.MathUtils.lerp(
        renderer.toneMappingExposure,
        targetExposure,
        0.06
      );
      if (bloomPassRef.current) {
        bloomPassRef.current.strength = THREE.MathUtils.lerp(
          bloomPassRef.current.strength,
          prefersLowPerformance ? 0.5 + smoothedProgressRef.current * 0.25 : 0.85 + smoothedProgressRef.current * 0.4,
          0.08
        );
      }

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      } else if (engineRootRef.current) {
        engineRootRef.current.rotation.y += delta * 0.35;
      }

      if (composerRef.current) {
        composerRef.current.render(delta);
      } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const { innerWidth, innerHeight } = window;
      const ratio = Math.min(targetPixelRatio, window.devicePixelRatio || 1);
      rendererRef.current.setPixelRatio(ratio);
      rendererRef.current.setSize(innerWidth, innerHeight);
      cameraRef.current.aspect = innerWidth / innerHeight;
      cameraRef.current.updateProjectionMatrix();
      if (composerRef.current) {
        composerRef.current.setSize(innerWidth, innerHeight);
      }
      if (bloomPassRef.current) {
        bloomPassRef.current.setSize(innerWidth, innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }

      if (engineMotionRef.current) {
        engineMotionRef.current.kill();
        engineMotionRef.current = null;
      }

      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }

      if (sceneRef.current) {
        sceneRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => {
                if (mat && 'dispose' in mat) {
                  (mat as THREE.Material).dispose();
                }
              });
            } else if (mesh.material && 'dispose' in mesh.material) {
              (mesh.material as THREE.Material).dispose();
            }
          }
        });
      }

      renderer.dispose();
      scene.clear();
      clock.stop();
      engineRootRef.current = null;
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      composerRef.current = null;
      bloomPassRef.current = null;
      envRenderTarget.dispose();
      pmremGenerator.dispose();
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
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {!isLoaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center text-sm tracking-wide text-white/70">
          Loading V8 engine...
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center text-center px-6 text-sm text-red-300">
          {loadError}
        </div>
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(28,46,70,0.18) 0%, rgba(12,20,32,0.4) 55%, rgba(5,10,18,0.6) 100%)',
          opacity: 0.35,
        }}
      />
    </div>
  );
}
