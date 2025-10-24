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
  const videoRef = useRef<HTMLVideoElement>(null);
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
    scene.background = new THREE.Color(0x000000); // ✨ Pure black void for industrial drama

    // ✨ INDUSTRIAL ATMOSPHERE: Subtle volumetric fog for light ray definition
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.015); // Very subtle, just to catch light
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
      50, // ✨ Start with wider FOV for dramatic assembly reveal
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    camera.position.set(7.0, 4.5, 7.0); // ✨ Initial position - will be animated based on progress
    cameraRef.current = camera;

    // ✨ INDUSTRIAL DRAMATIC LIGHTING - Workshop aesthetic with strong contrast

    // 1. Very Low Ambient: Deep shadows for drama
    const ambientLight = new THREE.AmbientLight(0x1a1a1a, 0.15); // ✨ Minimal ambient for deep blacks
    scene.add(ambientLight);

    // 2. WARM KEY LIGHT: Main industrial work lamp from top-left (orange/amber)
    const keyLight = new THREE.DirectionalLight(0xff9955, 3.5); // ✨ Warm orange industrial light
    keyLight.position.set(8, 12, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -20;
    keyLight.shadow.camera.right = 20;
    keyLight.shadow.camera.top = 20;
    keyLight.shadow.camera.bottom = -20;
    keyLight.shadow.bias = -0.0002;
    scene.add(keyLight);

    // 3. COOL RIM LIGHT: Edge definition from behind-right (cyan/blue)
    const rimLight = new THREE.DirectionalLight(0x4da6ff, 2.0); // ✨ Cool blue rim for metallic edges
    rimLight.position.set(-6, 4, -8);
    rimLight.castShadow = false; // No shadow for rim light
    scene.add(rimLight);

    // 4. ACCENT SPOTLIGHT: Underlight for chrome reflections (warm white)
    const accentLight = new THREE.SpotLight(0xfff5e6, 2.5, 30, Math.PI / 4, 0.3, 1.5);
    accentLight.position.set(0, -3, 5);
    accentLight.target.position.set(0, 1, 0);
    scene.add(accentLight);
    scene.add(accentLight.target);

    // 5. FILL LIGHT: Very subtle side fill for shadow detail
    const fillLight = new THREE.DirectionalLight(0x88aacc, 0.4); // ✨ Cool fill from opposite side
    fillLight.position.set(-8, 2, 4);
    scene.add(fillLight);

    // ✨ REMOVED: Platform geometry (torus, ring, circle) - engine floats in space
    // Platform was too large and distracting, making engine look tiny
    // Now engine is the hero element without competing visual elements

    /* DISABLED PLATFORM CODE:
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
    */

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

        const targetHeight = 24.0; // ✨ INCREASED to 24.0 for dramatic close-up framing
        const largestAxis = Math.max(size.x, size.y, size.z);
        const scale = targetHeight / largestAxis;
        model.scale.setScalar(scale);
        model.position.y += targetHeight * 0.02; // Centered positioning

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

                  // ✨ INDUSTRIAL METAL MATERIALS: High metalness, varied roughness
                  material.metalness = Math.min(1, (material.metalness ?? 0.45) + 0.45); // 0.85-0.9 range
                  material.roughness = Math.max(0.35, Math.min(0.65, (material.roughness ?? 0.5))); // Industrial worn metal
                  material.envMapIntensity = 1.8; // ✨ Strong environment reflections

                  // ✨ Subtle emissive for "hot metal" effect on certain parts
                  if (material.color && (material.color.r > 0.3 || material.metalness > 0.8)) {
                    material.emissive = new THREE.Color(0x331100);
                    material.emissiveIntensity = 0.08;
                  }

                  material.needsUpdate = true;
                }
              });
            } else if (mesh.material && 'toneMapped' in mesh.material) {
              const material = mesh.material as THREE.MeshStandardMaterial;
              material.toneMapped = true;

              // ✨ INDUSTRIAL METAL MATERIALS: High metalness, varied roughness
              material.metalness = Math.min(1, (material.metalness ?? 0.45) + 0.45); // 0.85-0.9 range
              material.roughness = Math.max(0.35, Math.min(0.65, (material.roughness ?? 0.5))); // Industrial worn metal
              material.envMapIntensity = 1.8; // ✨ Strong environment reflections

              // ✨ Subtle emissive for "hot metal" effect on certain parts
              if (material.color && (material.color.r > 0.3 || material.metalness > 0.8)) {
                material.emissive = new THREE.Color(0x331100);
                material.emissiveIntensity = 0.08;
              }

              material.needsUpdate = true;
            }
          }
        });

        enginePivot.add(model);

        // ✨ CRITICAL: Setup GLB baked animations (assembly/disassembly)
        if (gltf.animations && gltf.animations.length > 0) {
          console.log(`[ShipScene] Found ${gltf.animations.length} animations in GLB:`, gltf.animations.map(a => a.name));

          const mixer = new THREE.AnimationMixer(model);

          // Play all animations but control with progress (disassembled → assembled)
          gltf.animations.forEach((clip: THREE.AnimationClip) => {
            const action = mixer.clipAction(clip);
            action.reset();
            action.setLoop(THREE.LoopOnce, 1); // ✨ Play once, no looping
            action.clampWhenFinished = true; // ✨ Hold final frame
            action.enabled = true;
            action.setEffectiveTimeScale(0); // ✨ Manual control via mixer.setTime
            action.setEffectiveWeight(1);
            action.play();

            console.log(`[ShipScene] Animation "${clip.name}" duration: ${clip.duration}s`);
          });

          // Set initial time based on current progress
          const initialTime = progress * (gltf.animations[0]?.duration || 1);
          mixer.setTime(initialTime);
          mixerRef.current = mixer;

          console.log('[ShipScene] Animation mixer initialized with scroll-controlled playback');
        } else {
          console.warn('[ShipScene] No animations found in GLB - using fallback rotation');
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

    // ✨ INDUSTRIAL BLOOM: Selective glow for highlights and hot spots
    const bloomPass = new UnrealBloomPass(
      bloomResolution,
      prefersLowPerformance ? 0.7 : 0.9, // ✨ Restored strength for dramatic highlights
      0.4, // Medium radius for soft glow
      0.6  // Threshold catches bright reflections and emissive parts
    );
    bloomPass.threshold = 0.6; // ✨ Only brightest parts bloom (chrome reflections, emissive)
    bloomPass.strength = prefersLowPerformance ? 0.7 : 0.9; // ✨ Strong bloom for industrial drama
    bloomPass.radius = 0.4; // Soft falloff
    composer.addPass(bloomPass);
    composerRef.current = composer;
    bloomPassRef.current = bloomPass;

    // ✨ ANIMATION-DRIVEN CAMERA SYSTEM - Three distinct phases
    const cameraTimeRef = { value: 0 };
    const updateCamera = (t: number, elapsedTime: number) => {
      if (!cameraRef.current) return;

      // Define animation phases
      let orbitRadius, orbitAngle, height, fov;

      if (t < 0.3) {
        // PHASE 1 (0.0-0.3): Wide establishing shot - see disassembled parts
        const phase1Progress = t / 0.3;
        orbitRadius = THREE.MathUtils.lerp(10.0, 9.0, phase1Progress);
        orbitAngle = THREE.MathUtils.lerp(Math.PI * 0.35, Math.PI * 0.28, phase1Progress);
        height = THREE.MathUtils.lerp(5.5, 5.0, phase1Progress);
        fov = THREE.MathUtils.lerp(52, 50, phase1Progress); // Wide FOV
      } else if (t < 0.7) {
        // PHASE 2 (0.3-0.7): DRAMATIC PUSH-IN as parts assemble
        const phase2Progress = (t - 0.3) / 0.4;
        const eased = phase2Progress * phase2Progress * (3.0 - 2.0 * phase2Progress); // Smooth ease
        orbitRadius = THREE.MathUtils.lerp(9.0, 4.5, eased);
        orbitAngle = THREE.MathUtils.lerp(Math.PI * 0.28, -Math.PI * 0.42, eased);
        height = THREE.MathUtils.lerp(5.0, 2.5, eased);
        fov = THREE.MathUtils.lerp(50, 42, eased); // Tightening FOV
      } else {
        // PHASE 3 (0.7-1.0): Hero angle - low, close, dramatic
        const phase3Progress = (t - 0.7) / 0.3;
        orbitRadius = THREE.MathUtils.lerp(4.5, 3.8, phase3Progress);
        orbitAngle = THREE.MathUtils.lerp(-Math.PI * 0.42, -Math.PI * 0.55, phase3Progress);
        height = THREE.MathUtils.lerp(2.5, 1.8, phase3Progress); // Low angle looking up
        fov = THREE.MathUtils.lerp(42, 40, phase3Progress); // Tight, dramatic
      }

      // Update camera FOV
      cameraRef.current.fov = fov;
      cameraRef.current.updateProjectionMatrix();

      // Calculate base position from orbit
      const baseX = Math.cos(orbitAngle) * orbitRadius;
      const baseZ = Math.sin(orbitAngle) * orbitRadius;

      // ✨ SUBTLE BREATHING: Minimal drift for organic feel
      const driftX = Math.sin(elapsedTime * 0.25) * 0.08;
      const driftY = Math.cos(elapsedTime * 0.2) * 0.05;
      const driftZ = Math.sin(elapsedTime * 0.18) * 0.06;

      // Apply camera position
      cameraRef.current.position.set(
        baseX + driftX,
        height + driftY,
        baseZ + driftZ
      );

      // Look at engine center with subtle vertical offset
      const lookAtY = 1.2 + Math.sin(elapsedTime * 0.3) * 0.03;
      cameraRef.current.lookAt(0, lookAtY, 0);
    };

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      cameraTimeRef.value += delta; // ✨ Track elapsed time for camera drift

      smoothedProgressRef.current = THREE.MathUtils.damp(
        smoothedProgressRef.current,
        progressRef.current,
        4,
        delta
      );
      updateCamera(smoothedProgressRef.current, cameraTimeRef.value);

      // ✨ DYNAMIC EXPOSURE: Darker at start, brighter as engine assembles
      const targetExposure = prefersLowPerformance
        ? THREE.MathUtils.lerp(0.7, 1.25, smoothedProgressRef.current)
        : THREE.MathUtils.lerp(0.8, 1.45, smoothedProgressRef.current);
      renderer.toneMappingExposure = THREE.MathUtils.lerp(
        renderer.toneMappingExposure,
        targetExposure,
        0.05
      );

      // ✨ DYNAMIC BLOOM: Increases during assembly for drama
      if (bloomPassRef.current) {
        const targetBloom = prefersLowPerformance
          ? THREE.MathUtils.lerp(0.6, 0.85, smoothedProgressRef.current)
          : THREE.MathUtils.lerp(0.75, 1.0, smoothedProgressRef.current);
        bloomPassRef.current.strength = THREE.MathUtils.lerp(
          bloomPassRef.current.strength,
          targetBloom,
          0.06
        );
      }

      // ✨ ANIMATION CONTROL: Drive animations with scroll progress
      if (mixerRef.current) {
        // Get longest animation duration
        const animations = mixerRef.current._actions || [];
        const maxDuration = animations.reduce((max: number, action: { _clip?: { duration?: number } }) => {
          const duration = action._clip?.duration || 0;
          return Math.max(max, duration);
        }, 1);

        // Map progress (0→1) to animation time (0→duration)
        const targetTime = smoothedProgressRef.current * maxDuration;

        // Smooth time transition
        const currentTime = mixerRef.current.time || 0;
        const smoothTime = THREE.MathUtils.lerp(currentTime, targetTime, 0.08);

        // Set mixer time directly (not update with delta)
        mixerRef.current.setTime(smoothTime);
      } else if (engineRootRef.current) {
        // Fallback: simple rotation if no animations
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
      {/* ✨ REMOVED: Video background was causing blur and muddiness */}
      {/* Clean gradient background built into Three.js scene.background instead */}

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

      {/* ✨ INDUSTRIAL VIGNETTE - Warm-tinted edges for workshop feel */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 25%, rgba(20,10,5,0.45) 100%)',
          opacity: 0.5, // ✨ Stronger vignette for focus
          pointerEvents: 'none',
        }}
      />

      {/* ✨ SUBTLE WARM GRADIENT - Industrial workshop glow from bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(255,120,40,0.08) 0%, transparent 50%)',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
