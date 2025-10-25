"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from 'gsap';
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { SCENE_TIMING, getSceneProgress } from "./MasterScrollContainer";

declare global {
  interface Window {
    __MONTFORT_DEBUG?: {
      scene: THREE.Scene;
      fallback?: THREE.Group;
      mountain?: THREE.Object3D;
    };
  }
}

interface PersistentBackgroundProps {
  progress: number;
  tone: "dawn" | "day" | "dusk" | "night";
  islandBlend: number;
  shipBlend: number;
  globeBlend: number;
  forestBlend: number;
  reducedMotion?: boolean;
}

type ToneConfig = {
  sky: THREE.ColorRepresentation;
  fog: THREE.ColorRepresentation;
  ambient: THREE.ColorRepresentation;
  ambientIntensity: number;
  directional: THREE.ColorRepresentation;
  directionalIntensity: number;
  rimLight: THREE.ColorRepresentation;
  rimLightIntensity: number;
  overlay: THREE.ColorRepresentation;
  snowTint: THREE.ColorRepresentation;
  rockTint: THREE.ColorRepresentation;
};

const TONE_CONFIG: Record<PersistentBackgroundProps["tone"], ToneConfig> = {
  dawn: {
    sky: 0x7388a6,
    fog: 0x6f8096,
    ambient: 0xf0d0a8,
    ambientIntensity: 0.45,
    directional: 0xffc299,
    directionalIntensity: 0.85,
    rimLight: 0xffddaa,
    rimLightIntensity: 0.5,
    overlay: "rgba(112, 148, 186, 0.22)",
    snowTint: 0xf7f0e4,
    rockTint: 0xa98872,
  },
  day: {
    sky: 0xb7c6d8,
    fog: 0xaec1d7,
    ambient: 0xf6f8fb,
    ambientIntensity: 1.5, // BOOSTED from 0.75 - much brighter ambient
    directional: 0xffffff,
    directionalIntensity: 2.0, // BOOSTED from 1.05 - strong directional light
    rimLight: 0xd0e8ff,
    rimLightIntensity: 1.2, // BOOSTED from 0.65 - strong rim light
    overlay: "rgba(255, 255, 255, 0.12)",
    snowTint: 0xffffff,
    rockTint: 0x9c9185,
  },
  dusk: {
    sky: 0x2f1b3d,
    fog: 0x3e2b52,
    ambient: 0xd7a8d8,
    ambientIntensity: 0.4,
    directional: 0xff8a5a,
    directionalIntensity: 0.9,
    rimLight: 0xff9966,
    rimLightIntensity: 0.55,
    overlay: "rgba(142, 103, 169, 0.24)",
    snowTint: 0xfce3ff,
    rockTint: 0x74566a,
  },
  night: {
    sky: 0x0a0e1e,
    fog: 0x111a2b,
    ambient: 0x3d4b5f,
    ambientIntensity: 0.25,
    directional: 0x8fa9cf,
    directionalIntensity: 0.65,
    rimLight: 0x6688bb,
    rimLightIntensity: 0.45,
    overlay: "rgba(15, 26, 46, 0.32)",
    snowTint: 0xdfe6ff,
    rockTint: 0x4f5664,
  },
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

type SnowParticleState = {
  velocity: THREE.Vector3;
  initialOffset: number;
};

type HeroCameraKeyframe = {
  progress: number;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
};

const HERO_CAMERA_KEYFRAMES: HeroCameraKeyframe[] = [
  {
    progress: 0,
    position: new THREE.Vector3(0, 16, 96),
    lookAt: new THREE.Vector3(0, 8, -38),
    fov: 46,
  },
  {
    progress: 0.25,
    position: new THREE.Vector3(12, 20, 74),
    lookAt: new THREE.Vector3(-3, 12, -28),
    fov: 44,
  },
  {
    progress: 0.5,
    position: new THREE.Vector3(-18, 24, 62),
    lookAt: new THREE.Vector3(2, 20, -26),
    fov: 42,
  },
  {
    progress: 0.75,
    position: new THREE.Vector3(6, 14, 52),
    lookAt: new THREE.Vector3(-1, 26, -18),
    fov: 45,
  },
  {
    progress: 1,
    position: new THREE.Vector3(0, 12, 58),
    lookAt: new THREE.Vector3(0, 10, -8),
    fov: 43,
  },
];

const sampleHeroCamera = (progress: number): HeroCameraKeyframe => {
  if (progress <= HERO_CAMERA_KEYFRAMES[0].progress) {
    return HERO_CAMERA_KEYFRAMES[0];
  }
  if (progress >= HERO_CAMERA_KEYFRAMES[HERO_CAMERA_KEYFRAMES.length - 1].progress) {
    return HERO_CAMERA_KEYFRAMES[HERO_CAMERA_KEYFRAMES.length - 1];
  }

  for (let i = 0; i < HERO_CAMERA_KEYFRAMES.length - 1; i += 1) {
    const current = HERO_CAMERA_KEYFRAMES[i];
    const next = HERO_CAMERA_KEYFRAMES[i + 1];
    if (progress >= current.progress && progress <= next.progress) {
      const range = next.progress - current.progress;
      const localProgress = range > 0 ? (progress - current.progress) / range : 0;
      const eased = localProgress < 0.5
        ? 2 * localProgress * localProgress
        : 1 - Math.pow(-2 * localProgress + 2, 2) / 2;
      const position = current.position.clone().lerp(next.position, eased);
      const lookAt = current.lookAt.clone().lerp(next.lookAt, eased);
      const fov = THREE.MathUtils.lerp(current.fov, next.fov, eased);
      return {
        progress,
        position,
        lookAt,
        fov,
      };
    }
  }

  return HERO_CAMERA_KEYFRAMES[HERO_CAMERA_KEYFRAMES.length - 1];
};

type CloudLayerConfig = {
  texture: string;
  position: THREE.Vector3;
  scale: THREE.Vector2;
  horizontalAmplitude: number;
  verticalAmplitude: number;
  speed: number;
  phase: number;
  parallaxFactor: number;
  baseOpacity: number;
};

const CLOUD_LAYER_CONFIG: CloudLayerConfig[] = [
  {
    texture: "/assets/clouds/35.png",
    position: new THREE.Vector3(-52, 24, -54),
    scale: new THREE.Vector2(220, 132),
    horizontalAmplitude: 8,
    verticalAmplitude: 2.4,
    speed: 0.065,
    phase: 0.0,
    parallaxFactor: 0.12,
    baseOpacity: 0.18,
  },
  {
    texture: "/assets/clouds/62.png",
    position: new THREE.Vector3(-8, 26, -48),
    scale: new THREE.Vector2(200, 118),
    horizontalAmplitude: 7.5,
    verticalAmplitude: 2.0,
    speed: 0.082,
    phase: 1.2,
    parallaxFactor: 0.14,
    baseOpacity: 0.21,
  },
  {
    texture: "/assets/clouds/71.png",
    position: new THREE.Vector3(34, 28, -46),
    scale: new THREE.Vector2(210, 124),
    horizontalAmplitude: 6.8,
    verticalAmplitude: 1.8,
    speed: 0.095,
    phase: 2.4,
    parallaxFactor: 0.16,
    baseOpacity: 0.19,
  },
  {
    texture: "/assets/clouds/76.png",
    position: new THREE.Vector3(-2, 32, -60),
    scale: new THREE.Vector2(260, 150),
    horizontalAmplitude: 10.5,
    verticalAmplitude: 3.2,
    speed: 0.07,
    phase: 3.6,
    parallaxFactor: 0.18,
    baseOpacity: 0.16,
  },
];

interface CloudBillboard {
  sprite: THREE.Sprite;
  basePosition: THREE.Vector3;
  horizontalAmplitude: number;
  verticalOffset: number;
  speed: number;
  phase: number;
  parallaxFactor: number;
  baseOpacity: number;
}

export default function PersistentBackground({
  progress,
  tone,
  islandBlend,
  shipBlend,
  globeBlend,
  forestBlend,
  reducedMotion,
}: PersistentBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const clockRef = useRef(new THREE.Clock());

  const heroLoopStateRef = useRef({
    camX: 0,
    camY: 0,
    camZ: 0,
    lookX: 0,
    lookY: 0,
    lookZ: 0,
    rotation: 0,
  });
  const heroLoopTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const pointerTargetsRef = useRef({ x: 0, y: 0 });
  const pointerCurrentRef = useRef({ x: 0, y: 0 });
  const reducedMotionRef = useRef(reducedMotion);
  const tempVecA = useMemo(() => new THREE.Vector3(), []);
  const tempVecB = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    if (reducedMotion) {
      const pointerTarget = pointerTargetsRef.current;
      const pointerCurrent = pointerCurrentRef.current;
      pointerTarget.x = 0;
      pointerTarget.y = 0;
      pointerCurrent.x = 0;
      pointerCurrent.y = 0;
      const heroLoopState = heroLoopStateRef.current;
      heroLoopState.camX = 0;
      heroLoopState.camY = 0;
      heroLoopState.camZ = 0;
      heroLoopState.lookX = 0;
      heroLoopState.lookY = 0;
      heroLoopState.lookZ = 0;
      heroLoopState.rotation = 0;
      heroLoopTimelineRef.current?.pause(0);
    }
  }, [reducedMotion]);

  useEffect(() => {
    heroLoopTimelineRef.current?.kill();
    heroLoopTimelineRef.current = null;

    const heroLoopState = heroLoopStateRef.current;
    heroLoopState.camX = 0;
    heroLoopState.camY = 0;
    heroLoopState.camZ = 0;
    heroLoopState.lookX = 0;
    heroLoopState.lookY = 0;
    heroLoopState.lookZ = 0;
    heroLoopState.rotation = 0;

    if (reducedMotion) {
      return () => undefined;
    }

    const timeline = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } });
    timeline
      .to(heroLoopState, {
        camX: 1.4,
        camY: 0.65,
        camZ: -1.2,
        lookX: -0.48,
        lookY: 0.3,
        lookZ: -0.6,
        rotation: 0.08,
        duration: 7.5,
      })
      .to(heroLoopState, {
        camX: -1.2,
        camY: -0.55,
        camZ: 1.05,
        lookX: 0.42,
        lookY: -0.26,
        lookZ: 0.55,
        rotation: -0.09,
        duration: 7.5,
      });

    heroLoopTimelineRef.current = timeline;

    return () => {
      timeline.kill();
      heroLoopTimelineRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      return () => undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const { innerWidth, innerHeight } = window;
      if (!innerWidth || !innerHeight) {
        return;
      }
      const normalizedX = (event.clientX / innerWidth - 0.5) * 2;
      const normalizedY = (event.clientY / innerHeight - 0.5) * 2;
      pointerTargetsRef.current.x = normalizedX;
      pointerTargetsRef.current.y = normalizedY;
    };

    const resetPointer = () => {
      pointerTargetsRef.current.x = 0;
      pointerTargetsRef.current.y = 0;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", resetPointer);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", resetPointer);
    };
  }, [reducedMotion]);

const mountainMaterialRef = useRef<THREE.MeshStandardMaterial[]>([]);
const mountainFallbackRef = useRef<THREE.Group | null>(null);
const cloudGroupRef = useRef<THREE.Group | null>(null);
const cloudBillboardsRef = useRef<CloudBillboard[]>([]);
const cloudTimeRef = useRef(0);
const snowTimeRef = useRef(0);
const mistMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
const waterMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
const snowPointsRef = useRef<THREE.Points | null>(null);
const snowStatesRef = useRef<SnowParticleState[]>([]);
const snowBoundsRef = useRef({ width: 180, height: 120, depth: 140 });
const shipMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
const globeMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
const forestMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
const rimLightRef = useRef<THREE.DirectionalLight | null>(null);

const mountainGroupRef = useRef<THREE.Group | null>(null);
const shipGroupRef = useRef<THREE.Group | null>(null);
const globeGroupRef = useRef<THREE.Group | null>(null);
const forestGroupRef = useRef<THREE.Group | null>(null);

  const overlayRef = useRef<HTMLDivElement | null>(null);

  const targetsRef = useRef({
    cameraPosition: new THREE.Vector3(0, 12, 72),
    cameraLookAt: new THREE.Vector3(0, 8, 0),
    cameraFov: 45,
    mountainRotation: 0,
    mountainOpacity: 1,
    mountainBlend: 0,
    mistOpacity: 1,
    waterOpacity: 0,
    shipOpacity: 0,
    shipProgress: 0,
    globeOpacity: 0,
    forestOpacity: 0,
    heroProgress: 0,
  });

  const stateRef = useRef({
    cameraPosition: new THREE.Vector3(0, 12, 72),
    cameraLookAt: new THREE.Vector3(0, 8, 0),
    cameraFov: 45,
    mountainRotation: 0,
    mountainOpacity: 1,
    mountainBlend: 0,
    mistOpacity: 1,
    waterOpacity: 0,
    shipOpacity: 0,
    shipProgress: 0,
    globeOpacity: 0,
    forestOpacity: 0,
    heroProgress: 0,
  });

  const shaders = useMemo(() => {
    const mountainVertex = /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalMatrix * normal;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const mountainFragment = /* glsl */ `
      uniform vec3 uSnowColor;
      uniform vec3 uRockColor;
      uniform float uBlend;
      uniform float uOpacity;
      uniform vec3 uLightDirection;
      varying vec3 vNormal;
      void main() {
        vec3 base = mix(uSnowColor, uRockColor, clamp(uBlend, 0.0, 1.0));
        vec3 normal = normalize(vNormal);
        float diffuse = max(dot(normal, normalize(uLightDirection)), 0.0);
        float rim = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
        vec3 color = base * (0.35 + diffuse * 0.6) + rim * 0.2;
        gl_FragColor = vec4(color, uOpacity);
      }
    `;
    const mistVertex = /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;
    const mistFragment = /* glsl */ `
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uColor;
      varying vec2 vUv;
      float noise(vec2 p) {
        return sin(p.x * 1.3) * sin(p.y * 1.7);
      }
      void main() {
        float n = noise(vUv * 3.0 + uTime * 0.03);
        float alpha = smoothstep(0.2, 0.8, 0.5 + n * 0.5);
        gl_FragColor = vec4(uColor, alpha * uOpacity);
      }
    `;
    const waterVertex = /* glsl */ `
      uniform float uTime;
      uniform float uWaveAmplitude;
      uniform vec2 uWaveFrequency;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vWaveMix;
      void main() {
        vec3 pos = position;
        float waveX = sin(pos.x * uWaveFrequency.x + uTime * 0.8);
        float waveZ = cos(pos.z * uWaveFrequency.y + uTime * 0.65);
        float crossWave = sin((pos.x + pos.z) * (uWaveFrequency.x * 0.5) + uTime * 0.35);
        float displacement = (waveX + waveZ * 0.6 + crossWave * 0.4) * uWaveAmplitude;
        pos.y += displacement;
        vWaveMix = clamp(displacement * 0.5 + 0.5, 0.0, 1.0);

        vec3 tangentX = vec3(1.0, uWaveAmplitude * uWaveFrequency.x * cos(pos.x * uWaveFrequency.x + uTime * 0.8), 0.0);
        vec3 tangentZ = vec3(0.0, -uWaveAmplitude * uWaveFrequency.y * sin(pos.z * uWaveFrequency.y + uTime * 0.65), 1.0);
        vec3 normal = normalize(cross(tangentZ, tangentX));
        vNormal = normalMatrix * normal;

        vec4 world = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `;
    const waterFragment = /* glsl */ `
      uniform vec3 uDepthColor;
      uniform vec3 uSurfaceColor;
      uniform vec3 uHighlightColor;
      uniform vec3 uFoamColor;
      uniform float uOpacity;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vWaveMix;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
        float foam = smoothstep(0.55, 0.85, vWaveMix);
        vec3 baseColor = mix(uDepthColor, uSurfaceColor, vWaveMix);
        baseColor = mix(baseColor, uFoamColor, foam * 0.6);
        vec3 highlight = uHighlightColor * (0.25 + fresnel * 0.75);
        vec3 color = baseColor + highlight * 0.35;
        gl_FragColor = vec4(color, uOpacity);
      }
    `;
    return { mountainVertex, mountainFragment, mistVertex, mistFragment, waterVertex, waterFragment };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

   const scene = new THREE.Scene();
   scene.fog = new THREE.Fog(TONE_CONFIG[tone].fog, 40, 260);
   sceneRef.current = scene;
   if (typeof window !== 'undefined') {
     (window as typeof window & { __MONTFORT_DEBUG?: { scene: THREE.Scene } }).__MONTFORT_DEBUG = {
       scene,
     };
   }

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 400);
    camera.position.copy(stateRef.current.cameraPosition);
    cameraRef.current = camera;

    const ambient = new THREE.AmbientLight(TONE_CONFIG[tone].ambient, TONE_CONFIG[tone].ambientIntensity);
    const directional = new THREE.DirectionalLight(TONE_CONFIG[tone].directional, TONE_CONFIG[tone].directionalIntensity);
    directional.position.set(-35, 45, 25);
    
    // Add rim light from opposite side for better separation
    const rimLight = new THREE.DirectionalLight(TONE_CONFIG[tone].rimLight, TONE_CONFIG[tone].rimLightIntensity);
    rimLight.position.set(40, 25, -20);
    
    ambientLightRef.current = ambient;
    directionalLightRef.current = directional;
    rimLightRef.current = rimLight;
    scene.add(ambient);
    scene.add(directional);
    scene.add(rimLight);

    const mountainGroup = new THREE.Group();
    mountainGroupRef.current = mountainGroup;
    scene.add(mountainGroup);

    const tonePreset = TONE_CONFIG[tone];

    const fallbackGroup = new THREE.Group();
    const fallbackMaterialPrimary = new THREE.MeshStandardMaterial({
      color: new THREE.Color(tonePreset.snowTint).multiplyScalar(1.1),
      metalness: 0.08,
      roughness: 0.42,
      transparent: true,
      opacity: 1,
      envMapIntensity: 0.3,
    });
    fallbackMaterialPrimary.userData = {
      snowRoughness: 0.42,
      rockRoughness: 0.68,
      snowTint: new THREE.Color(tonePreset.snowTint),
      rockTint: new THREE.Color(tonePreset.rockTint),
      workingColor: new THREE.Color(tonePreset.snowTint),
      baseDisplacement: 3.2,
      rockDisplacement: 2.1,
    };
    const fallbackGeometry = new THREE.IcosahedronGeometry(22, 4);
    const primaryFallback = new THREE.Mesh(fallbackGeometry, fallbackMaterialPrimary);
    primaryFallback.position.set(0, -4, -40);
    fallbackGroup.add(primaryFallback);

    const secondaryMaterial = fallbackMaterialPrimary.clone();
    secondaryMaterial.userData = {
      snowRoughness: 0.44,
      rockRoughness: 0.7,
      snowTint: new THREE.Color(tonePreset.snowTint),
      rockTint: new THREE.Color(tonePreset.rockTint),
      workingColor: new THREE.Color(tonePreset.snowTint),
      baseDisplacement: 3.2,
      rockDisplacement: 2.1,
    };
    const secondaryFallback = new THREE.Mesh(fallbackGeometry, secondaryMaterial);
    secondaryFallback.scale.set(0.52, 0.7, 0.52);
    secondaryFallback.position.set(-18, -6, -32);
    fallbackGroup.add(secondaryFallback);

    const tertiaryMaterial = fallbackMaterialPrimary.clone();
    tertiaryMaterial.userData = {
      snowRoughness: 0.45,
      rockRoughness: 0.72,
      snowTint: new THREE.Color(tonePreset.snowTint),
      rockTint: new THREE.Color(tonePreset.rockTint),
      workingColor: new THREE.Color(tonePreset.snowTint),
      baseDisplacement: 3.2,
      rockDisplacement: 2.1,
    };
    const tertiaryFallback = new THREE.Mesh(fallbackGeometry, tertiaryMaterial);
    tertiaryFallback.scale.set(0.38, 0.48, 0.38);
    tertiaryFallback.position.set(16, -1, -34);
    fallbackGroup.add(tertiaryFallback);

    mountainGroup.add(fallbackGroup);
    mountainFallbackRef.current = fallbackGroup;
    mountainMaterialRef.current = [fallbackMaterialPrimary, secondaryMaterial, tertiaryMaterial];
    if (typeof window !== 'undefined' && window.__MONTFORT_DEBUG) {
      (window.__MONTFORT_DEBUG as { scene: THREE.Scene; fallback?: THREE.Group }).fallback = fallbackGroup;
    }

    const textureLoader = new THREE.TextureLoader();
    const anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 16);
    const toneForAssets = tonePreset;

    const loadTexture = (path: string, colorSpace?: THREE.ColorSpace) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        textureLoader.load(
          path,
          (texture) => {
            texture.flipY = false;
            texture.anisotropy = anisotropy;
            if (colorSpace) {
              texture.colorSpace = colorSpace;
            }
            resolve(texture);
          },
          undefined,
          (error: unknown) => reject(error)
        );
      });

    // Load NEW high-quality terrain model (textures embedded in GLB)
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "/assets/3dmodel/mountain2/snowy_mountain_v2_-_terrain.glb",
      (gltf: GLTF) => {
        if (disposed) return;
        console.debug('[PersistentBackground] NEW high-quality terrain GLB loaded');
        const materials: THREE.MeshStandardMaterial[] = [];
        
        gltf.scene.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            
            // PERFORMANCE: Optimize render flags
            mesh.castShadow = false; // No shadows needed
            mesh.receiveShadow = false;
            mesh.frustumCulled = true; // Enable culling for performance
            mesh.renderOrder = 0;
            
            // PERFORMANCE: Optimize geometry if high poly count
            if (mesh.geometry) {
              mesh.geometry.computeBoundingSphere();
              mesh.geometry.computeBoundingBox();
              
              // Log poly count for monitoring
              const vertexCount = mesh.geometry.attributes.position?.count || 0;
              if (vertexCount > 100000) {
                console.warn(`[Performance] High poly mesh detected: ${vertexCount.toLocaleString()} vertices`);
              }
            }

            // Enhance the embedded material for web rendering
            let material: THREE.MeshStandardMaterial;
            
            if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              // Use and enhance the existing material from GLB
              material = mesh.material as THREE.MeshStandardMaterial;
              
              // OPTIMIZED BRIGHTNESS: Boost emissive for dramatic lighting
              material.emissive = new THREE.Color(0xffffff);
              material.emissiveIntensity = 0.6; // Increased from 0.3 for brighter snow highlights
              material.emissiveMap = material.map; // Use base texture as emissive for brightness
              
              // Optimize material properties for cinematic look
              material.metalness = 0.0; // No metallic (rock/snow)
              material.roughness = 0.4; // Lower for more reflective snow (was 0.6)
              material.transparent = false;
              material.side = THREE.DoubleSide;
              
              // PERFORMANCE: Enable anisotropic filtering for sharper textures at angles
              if (material.map) {
                material.map.anisotropy = anisotropy;
                material.map.generateMipmaps = true; // Ensure mipmaps for distance rendering
                material.map.minFilter = THREE.LinearMipmapLinearFilter;
                material.map.magFilter = THREE.LinearFilter;
              }
              
              // PERFORMANCE: Optimize normal map if present
              if (material.normalMap) {
                material.normalMap.anisotropy = Math.min(anisotropy, 8); // Lower aniso for normal maps
              }
              
              material.needsUpdate = true;
            } else {
              // Fallback: create new material if GLB doesn't have one
              material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.0,
                roughness: 0.6,
                transparent: false,
                side: THREE.DoubleSide,
              });
            }

            // Store material reference for animation
            material.userData = {
              snowRoughness: 0.28,
              rockRoughness: 0.82,
              snowTint: new THREE.Color(toneForAssets.snowTint),
              rockTint: new THREE.Color(toneForAssets.rockTint),
              workingColor: new THREE.Color(toneForAssets.snowTint),
            };

            // ENHANCED: Height-based lighting and color grading shader
            // Preserves photorealistic textures while adding dramatic cinematic lighting
            material.onBeforeCompile = (shader) => {
              shader.uniforms.uIslandBlend = { value: 0.0 }; // For snow→rock morph animation
              shader.uniforms.uSnowBrightness = { value: 1.4 }; // Peak brightness boost
              shader.uniforms.uRockDarken = { value: 0.7 }; // Base darkening for contrast
              shader.uniforms.uSnowLine = { value: 15.0 }; // Height threshold for snow/rock
              
              shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `#include <common>
                varying vec3 vWorldPosition;`
              );
              
              shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                `#include <worldpos_vertex>
                vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`
              );
              
              shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                `#include <common>
                uniform float uIslandBlend;
                uniform float uSnowBrightness;
                uniform float uRockDarken;
                uniform float uSnowLine;
                varying vec3 vWorldPosition;`
              );
              
              // ENHANCED: Height-based lighting with dramatic contrast
              shader.fragmentShader = shader.fragmentShader.replace(
                '#include <tonemapping_fragment>',
                `
                // Height-based brightness adjustment for cinematic drama
                float heightFactor = smoothstep(0.0, uSnowLine, vWorldPosition.y);
                
                // Brighten high peaks (snow), darken low areas (rock) for contrast
                float brightnessMult = mix(uRockDarken, uSnowBrightness, heightFactor);
                
                // Apply brightness while preserving texture detail
                gl_FragColor.rgb = gl_FragColor.rgb * brightnessMult;
                
                // Subtle blue tint at peaks for icy snow effect (optional)
                vec3 snowTint = vec3(0.95, 0.98, 1.0);
                gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * snowTint, heightFactor * 0.15);
                
                #include <tonemapping_fragment>`
              );
              
              material.userData.shader = shader;
            };

            mesh.material = material;
            materials.push(material);
          }
        });

        gltf.scene.position.set(0, 0, 0);
        gltf.scene.rotation.set(0, 0, 0);
        gltf.scene.updateMatrixWorld(true);

        const originalBox = new THREE.Box3().setFromObject(gltf.scene);
        const originalSize = originalBox.getSize(new THREE.Vector3());

        // OPTIMIZED SCALE: Fill viewport dramatically (cinematic hero framing)
        const targetHeight = 45; // Increased for more imposing presence
        const scale = (targetHeight / originalSize.y) * 0.9; // Adjusted multiplier
        gltf.scene.scale.setScalar(scale);
        gltf.scene.updateMatrixWorld(true);

        // Center horizontally
        const centeredBox = new THREE.Box3().setFromObject(gltf.scene);
        const centerOffset = centeredBox.getCenter(new THREE.Vector3());
        gltf.scene.position.sub(centerOffset);
        gltf.scene.updateMatrixWorld(true);

        // OPTIMIZED POSITIONING: Lower base for "looking up at peaks" effect
        const shiftedBox = new THREE.Box3().setFromObject(gltf.scene);
        const baseShift = -12.0 - shiftedBox.min.y; // Lowered from -9.5 for more dramatic angle
        gltf.scene.position.y += baseShift;
        
        // Z-depth: Closer to camera for more presence
        gltf.scene.position.z = -20; // Moved from -24 (closer)
        
        // Slight rotation for dynamic composition
        gltf.scene.rotation.y = THREE.MathUtils.degToRad(-8); // Increased from -6

        gltf.scene.updateMatrixWorld(true);
        const finalBox = new THREE.Box3().setFromObject(gltf.scene);
        console.debug('[PersistentBackground] NEW terrain mountain positioned', {
          scale,
          position: gltf.scene.position.toArray(),
          finalBounds: {
            min: finalBox.min.toArray(),
            max: finalBox.max.toArray(),
          },
        });

        mountainGroup.add(gltf.scene);
        if (mountainFallbackRef.current) {
          mountainFallbackRef.current.visible = false;
        }
        mountainMaterialRef.current = materials;
        if (typeof window !== 'undefined' && window.__MONTFORT_DEBUG) {
          (window.__MONTFORT_DEBUG as { scene: THREE.Scene; mountain?: THREE.Object3D }).mountain = gltf.scene;
        }
      },
      undefined,
      (error: unknown) => {
        console.error("Failed to load NEW terrain mountain GLB", error);
      }
    );

    const mistGeometry = new THREE.PlaneGeometry(220, 140, 1, 1);
    const mistMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.18 }, // Reduced from 0.4 to prevent washing out
        uColor: { value: new THREE.Color(0xe3edf6) },
      },
      vertexShader: shaders.mistVertex,
      fragmentShader: shaders.mistFragment,
      transparent: true,
      depthWrite: false,
    });
    const mistMesh = new THREE.Mesh(mistGeometry, mistMaterial);
    mistMesh.rotation.x = -Math.PI / 2.2;
    mistMesh.position.set(0, -8, -50); // Moved from -30 to -50, behind mountain at -24
    mistMesh.renderOrder = 1; // Render after mountain
    scene.add(mistMesh);
    mistMaterialRef.current = mistMaterial;

    const waterGeometry = new THREE.PlaneGeometry(220, 220, 120, 120);
    const waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uWaveAmplitude: { value: 0.55 },
        uWaveFrequency: { value: new THREE.Vector2(0.24, 0.32) },
        uDepthColor: { value: new THREE.Color(0x0f1e2d) },
        uSurfaceColor: { value: new THREE.Color(0x1b3f58) },
        uHighlightColor: { value: new THREE.Color(0x7fc7ff) },
        uFoamColor: { value: new THREE.Color(0xd6e9ff) },
      },
      transparent: true,
      depthWrite: false,
      vertexShader: shaders.waterVertex,
      fragmentShader: shaders.waterFragment,
    });
    const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, -18, -20);
    scene.add(waterMesh);
    waterMaterialRef.current = waterMaterial;

    // Snow particle volume
    const particleCount = 2000;
    const snowGeometry = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(particleCount * 3);
    const snowSizes = new Float32Array(particleCount);
    const snowStates: SnowParticleState[] = [];

    const snowBounds = snowBoundsRef.current;

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      snowPositions[i3] = (Math.random() - 0.5) * snowBounds.width;
      snowPositions[i3 + 1] = Math.random() * snowBounds.height * 0.8 + 12;
      snowPositions[i3 + 2] = (Math.random() - 0.5) * snowBounds.depth;
      snowSizes[i] = 0.6 + Math.random() * 1.4;
      snowStates.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.12,
          -0.25 - Math.random() * 0.35,
          (Math.random() - 0.5) * 0.12
        ),
        initialOffset: Math.random() * Math.PI * 2,
      });
    }

    snowGeometry.setAttribute("position", new THREE.Float32BufferAttribute(snowPositions, 3));
    snowGeometry.setAttribute("size", new THREE.Float32BufferAttribute(snowSizes, 1));

    const snowMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(0xffffff),
      size: 0.65,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const snowPoints = new THREE.Points(snowGeometry, snowMaterial);
    snowPoints.position.set(0, 0, -24);
    snowPoints.renderOrder = 4;
    scene.add(snowPoints);

    snowPointsRef.current = snowPoints;
    snowStatesRef.current = snowStates;

    const cloudGroup = new THREE.Group();
    cloudGroup.position.set(0, 18, -48);
    cloudGroupRef.current = cloudGroup;
    scene.add(cloudGroup);

    const loadCloudTexture = (path: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        textureLoader.load(
          path,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = anisotropy;
            resolve(texture);
          },
          undefined,
          (error: unknown) => reject(error)
        );
      });

    Promise.all(CLOUD_LAYER_CONFIG.map((layer) => loadCloudTexture(layer.texture)))
      .then((textures) => {
        if (disposed) return;
        textures.forEach((texture, index) => {
          const layer = CLOUD_LAYER_CONFIG[index];
          const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.18,
            depthWrite: false,
            depthTest: false,
            color: new THREE.Color(0xc7d8ff),
            blending: THREE.AdditiveBlending,
          });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(layer.scale.x, layer.scale.y, 1);
          const basePosition = layer.position.clone();
          sprite.position.copy(basePosition);
          sprite.renderOrder = 2 + index;
          cloudGroup.add(sprite);
          cloudBillboardsRef.current.push({
            sprite,
            basePosition,
            horizontalAmplitude: layer.horizontalAmplitude,
            verticalOffset: layer.verticalAmplitude,
            speed: layer.speed,
            phase: layer.phase,
            parallaxFactor: layer.parallaxFactor,
            baseOpacity: layer.baseOpacity,
          });
        });
      })
      .catch((error) => {
        console.error("Failed to load cloud textures", error);
      });

    const shipGroup = new THREE.Group();
    const shipHullGeometry = new THREE.BoxGeometry(14, 3.5, 4);
    const shipMaterial = new THREE.MeshStandardMaterial({
      color: 0x25354a,
      metalness: 0.55,
      roughness: 0.35,
      transparent: true,
      opacity: 0,
    });
    const shipMesh = new THREE.Mesh(shipHullGeometry, shipMaterial);
    shipMesh.position.set(0, 0, 0);
    const bridgeGeometry = new THREE.BoxGeometry(5, 2.2, 3);
    const bridgeMaterial = shipMaterial.clone();
    bridgeMaterial.color = new THREE.Color(0x3c4f6c);
    const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    bridge.position.set(-1.8, 2.1, 0);
    shipGroup.add(shipMesh);
    shipGroup.add(bridge);
    shipGroup.position.set(48, -10, -8);
    shipGroup.visible = false;
    shipMaterialRef.current = shipMaterial;
    shipGroupRef.current = shipGroup;
    scene.add(shipGroup);

    const globeGroup = new THREE.Group();
    const globeGeometry = new THREE.SphereGeometry(16, 48, 48);
    const globeMaterial = new THREE.MeshStandardMaterial({
      color: 0x5384c5,
      metalness: 0.2,
      roughness: 0.55,
      transparent: true,
      opacity: 0,
      emissive: new THREE.Color(0x2c6dd1),
      emissiveIntensity: 0.1,
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeMesh.position.set(0, 6, -46);
    globeGroup.add(globeMesh);
    globeGroup.visible = false;
    globeGroupRef.current = globeGroup;
    globeMaterialRef.current = globeMaterial;
    scene.add(globeGroup);

    const forestGroup = new THREE.Group();
    const forestGeometry = new THREE.PlaneGeometry(220, 150, 1, 1);
    const forestMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f2a20,
      roughness: 0.95,
      metalness: 0.05,
      transparent: true,
      opacity: 0,
      emissive: new THREE.Color(0x12382b),
      emissiveIntensity: 0.15,
    });
    const forestMesh = new THREE.Mesh(forestGeometry, forestMaterial);
    forestMesh.position.set(0, 18, -68);
    forestGroup.add(forestMesh);
    forestGroup.visible = false;
    forestGroupRef.current = forestGroup;
    scene.add(forestGroup);
    forestMaterialRef.current = forestMaterial;

    let animationFrame = 0;
    const renderLoop = () => {
      const delta = clockRef.current.getDelta();
      const state = stateRef.current;
      const targets = targetsRef.current;

      if (!reducedMotionRef.current) {
        pointerCurrentRef.current.x = THREE.MathUtils.lerp(pointerCurrentRef.current.x, pointerTargetsRef.current.x, 0.06);
        pointerCurrentRef.current.y = THREE.MathUtils.lerp(pointerCurrentRef.current.y, pointerTargetsRef.current.y, 0.06);
      } else {
        pointerCurrentRef.current.x = 0;
        pointerCurrentRef.current.y = 0;
      }

      state.cameraPosition.lerp(targets.cameraPosition, 0.065);
      state.cameraLookAt.lerp(targets.cameraLookAt, 0.065);
      state.cameraFov = THREE.MathUtils.lerp(state.cameraFov, targets.cameraFov, 0.08);
      state.mountainRotation = THREE.MathUtils.lerp(state.mountainRotation, targets.mountainRotation, 0.06);
      state.mountainOpacity = THREE.MathUtils.lerp(state.mountainOpacity, targets.mountainOpacity, 0.08);
      state.mountainBlend = THREE.MathUtils.lerp(state.mountainBlend, targets.mountainBlend, 0.08);
      state.mistOpacity = THREE.MathUtils.lerp(state.mistOpacity, targets.mistOpacity, 0.08);
      state.waterOpacity = THREE.MathUtils.lerp(state.waterOpacity, targets.waterOpacity, 0.08);
      state.shipOpacity = THREE.MathUtils.lerp(state.shipOpacity, targets.shipOpacity, 0.1);
      state.shipProgress = THREE.MathUtils.lerp(state.shipProgress, targets.shipProgress, 0.08);
      state.globeOpacity = THREE.MathUtils.lerp(state.globeOpacity, targets.globeOpacity, 0.08);
      state.forestOpacity = THREE.MathUtils.lerp(state.forestOpacity, targets.forestOpacity, 0.08);
      state.heroProgress = THREE.MathUtils.lerp(state.heroProgress, targets.heroProgress, 0.12);

      if (cameraRef.current) {
        const camera = cameraRef.current;
        camera.position.copy(state.cameraPosition);
        camera.lookAt(state.cameraLookAt);
        if (Math.abs(camera.fov - state.cameraFov) > 0.05) {
          camera.fov = state.cameraFov;
          camera.updateProjectionMatrix();
        }
      }

      if (mountainGroupRef.current) {
        mountainGroupRef.current.rotation.y = state.mountainRotation;
        mountainGroupRef.current.visible = state.mountainOpacity > 0.005;
      }

      if (mountainMaterialRef.current.length) {
        mountainMaterialRef.current.forEach((material) => {
          const snowRoughness = (material.userData?.snowRoughness as number) ?? 0.28;
          const rockRoughness = (material.userData?.rockRoughness as number) ?? 0.82;

          material.opacity = state.mountainOpacity;
          material.transparent = state.mountainOpacity < 1.0;

          // OPTIMIZED: Animate roughness for snow→rock transition
          material.roughness = THREE.MathUtils.lerp(snowRoughness, rockRoughness, state.mountainBlend * 0.8);
          
          // OPTIMIZED: Update shader uniforms for smooth animation
          if (material.userData.shader) {
            const shader = material.userData.shader;
            
            // Animate island blend for snow→rock morph
            shader.uniforms.uIslandBlend.value = state.mountainBlend;
            
            // Adjust brightness dynamically during transition
            // Snow phase (0.0): Bright peaks (1.4)
            // Rock phase (1.0): Darker, more uniform (1.0)
            shader.uniforms.uSnowBrightness.value = THREE.MathUtils.lerp(1.4, 1.0, state.mountainBlend);
            shader.uniforms.uRockDarken.value = THREE.MathUtils.lerp(0.7, 0.85, state.mountainBlend);
            
            // Adjust snow line height during morph (lowers as it becomes island)
            shader.uniforms.uSnowLine.value = THREE.MathUtils.lerp(15.0, 5.0, state.mountainBlend);
          }

          material.needsUpdate = false;
        });
      }

      if (mistMaterialRef.current) {
        mistMaterialRef.current.uniforms.uTime.value += delta * 60;
        mistMaterialRef.current.uniforms.uOpacity.value = state.mistOpacity * 0.18; // Reduced multiplier
      }

      if (waterMaterialRef.current) {
        waterMaterialRef.current.uniforms.uTime.value += delta * 45;
        waterMaterialRef.current.uniforms.uOpacity.value = state.waterOpacity;
      }

      if (cloudBillboardsRef.current.length && cloudGroupRef.current) {
        cloudTimeRef.current += delta;
        const visibility = Math.max(state.mistOpacity, 0.1) * state.mountainOpacity;
        const cinematicBoost = THREE.MathUtils.smoothstep(state.heroProgress, 0, 1);
        cloudBillboardsRef.current.forEach((cloud) => {
          const t = cloudTimeRef.current * cloud.speed + cloud.phase;
          const horizontalDrift = Math.sin(t) * cloud.horizontalAmplitude * (1 + cinematicBoost * 0.65);
          const verticalDrift = Math.cos(t * 0.6) * cloud.verticalOffset;
          cloud.sprite.position.x = cloud.basePosition.x + horizontalDrift;
          cloud.sprite.position.y = cloud.basePosition.y + verticalDrift;
          cloud.sprite.position.z = cloud.basePosition.z - cinematicBoost * cloud.parallaxFactor * 18;
          const material = cloud.sprite.material as THREE.SpriteMaterial;
          const targetOpacity = (cloud.baseOpacity + visibility * 0.5) * (0.6 + cinematicBoost * 0.55);
          const clampedOpacity = Math.max(0.05, Math.min(0.42, targetOpacity));
          material.opacity = THREE.MathUtils.lerp(material.opacity, clampedOpacity, 0.12);
          material.rotation += delta * 0.05;
        });
        cloudGroupRef.current.visible = state.mountainOpacity > 0.02;
      }

      if (snowPointsRef.current) {
        const snowPoints = snowPointsRef.current;
        const positions = snowPoints.geometry.getAttribute("position") as THREE.BufferAttribute;
        const data = positions.array as Float32Array;
        const states = snowStatesRef.current;
        const bounds = snowBoundsRef.current;
        const windStrength = 0.35 * (0.5 + 0.5 * state.heroProgress);
        snowTimeRef.current += delta;
        const wind = Math.sin(snowTimeRef.current * 0.18) * windStrength;

        for (let i = 0; i < states.length; i += 1) {
          const i3 = i * 3;
          data[i3] += (states[i].velocity.x + wind * 0.02) * (1 + state.heroProgress * 0.6);
          data[i3 + 1] += states[i].velocity.y;
          data[i3 + 2] += (states[i].velocity.z + wind * 0.01);

          if (data[i3 + 1] < -6) {
            data[i3] = (Math.random() - 0.5) * bounds.width;
            data[i3 + 1] = Math.random() * bounds.height * 0.8 + 20;
            data[i3 + 2] = (Math.random() - 0.5) * bounds.depth;
          }

          if (data[i3] > bounds.width * 0.5) data[i3] = -bounds.width * 0.5;
          if (data[i3] < -bounds.width * 0.5) data[i3] = bounds.width * 0.5;
          if (data[i3 + 2] > bounds.depth * 0.5) data[i3 + 2] = -bounds.depth * 0.5;
          if (data[i3 + 2] < -bounds.depth * 0.5) data[i3 + 2] = bounds.depth * 0.5;
        }
        positions.needsUpdate = true;

        const snowMaterial = snowPoints.material as THREE.PointsMaterial;
        const visibility = THREE.MathUtils.clamp(state.heroProgress * 1.2, 0, 1);
        snowMaterial.opacity = THREE.MathUtils.lerp(snowMaterial.opacity, visibility * 0.55, 0.08);
        snowPoints.visible = state.mountainOpacity > 0.05;
      }

      if (shipGroupRef.current && shipMaterialRef.current) {
        const shipVisible = state.shipOpacity > 0.01;
        shipGroupRef.current.visible = shipVisible;
        shipMaterialRef.current.opacity = state.shipOpacity;
        const shipPathStart = new THREE.Vector3(38, -6, 12);
        const shipPathEnd = new THREE.Vector3(-42, -4, -18);
        const currentShipPosition = shipPathStart.clone().lerp(shipPathEnd, state.shipProgress);
        shipGroupRef.current.position.copy(currentShipPosition);
        shipGroupRef.current.rotation.y = THREE.MathUtils.degToRad(-18 + state.shipProgress * -32);
      }

      if (globeGroupRef.current && globeMaterialRef.current) {
        globeGroupRef.current.visible = state.globeOpacity > 0.02;
        globeMaterialRef.current.opacity = state.globeOpacity;
        globeGroupRef.current.rotation.y += delta * 0.24;
      }

      if (forestGroupRef.current && forestMaterialRef.current) {
        forestGroupRef.current.visible = state.forestOpacity > 0.02;
        forestMaterialRef.current.opacity = state.forestOpacity;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationFrame = requestAnimationFrame(renderLoop);
    };

    animationFrame = requestAnimationFrame(renderLoop);

    const handleResize = () => {
      const newContainer = containerRef.current;
      if (!newContainer || !rendererRef.current || !cameraRef.current) {
        return;
      }
      const width = newContainer.clientWidth;
      const height = newContainer.clientHeight;
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrame);
      cloudBillboardsRef.current.forEach((cloud) => {
        cloud.sprite.material.map?.dispose();
        cloud.sprite.material.dispose();
      });
      cloudBillboardsRef.current = [];
      if (cloudGroupRef.current && sceneRef.current) {
        sceneRef.current.remove(cloudGroupRef.current);
      }
      cloudGroupRef.current = null;
      if (snowPointsRef.current && sceneRef.current) {
        sceneRef.current.remove(snowPointsRef.current);
        snowPointsRef.current.geometry.dispose();
        if (snowPointsRef.current.material instanceof THREE.Material) {
          snowPointsRef.current.material.dispose();
        }
      }
      snowPointsRef.current = null;
      snowStatesRef.current = [];
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement.parentElement) {
          rendererRef.current.domElement.parentElement.removeChild(rendererRef.current.domElement);
        }
      }
      if (overlayRef.current && overlayRef.current.parentElement) {
        overlayRef.current.parentElement.removeChild(overlayRef.current);
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tonePreset = TONE_CONFIG[tone];
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(tonePreset.sky);
      if (sceneRef.current.fog instanceof THREE.Fog) {
        sceneRef.current.fog.color.set(tonePreset.fog);
      }
    }
    if (ambientLightRef.current) {
      ambientLightRef.current.color.lerp(new THREE.Color(tonePreset.ambient), 0.5);
      ambientLightRef.current.intensity = tonePreset.ambientIntensity;
    }
    if (directionalLightRef.current) {
      directionalLightRef.current.color.lerp(new THREE.Color(tonePreset.directional), 0.5);
      directionalLightRef.current.intensity = tonePreset.directionalIntensity;
    }
    if (rimLightRef.current) {
      rimLightRef.current.color.lerp(new THREE.Color(tonePreset.rimLight), 0.5);
      rimLightRef.current.intensity = tonePreset.rimLightIntensity;
    }
    if (mountainMaterialRef.current.length) {
      const snowTint = new THREE.Color(tonePreset.snowTint);
      const rockTint = new THREE.Color(tonePreset.rockTint);
      mountainMaterialRef.current.forEach((material) => {
        const workingColor =
          (material.userData?.workingColor as THREE.Color) ?? new THREE.Color().copy(snowTint);
        workingColor.copy(snowTint);
        material.userData.snowTint = snowTint.clone();
        material.userData.rockTint = rockTint.clone();
        material.userData.workingColor = workingColor;
        material.color.copy(workingColor);
      });
    }
    if (!overlayRef.current && containerRef.current) {
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.pointerEvents = "none";
      overlay.style.background = tonePreset.overlay as string;
      overlay.style.mixBlendMode = tone === "night" ? "screen" : "soft-light";
      overlayRef.current = overlay;
      containerRef.current.appendChild(overlay);
    } else if (overlayRef.current) {
      overlayRef.current.style.background = tonePreset.overlay as string;
      overlayRef.current.style.mixBlendMode = tone === "night" ? "screen" : "soft-light";
    }
  }, [tone]);

  useEffect(() => {
    const heroRange = SCENE_TIMING.hero;
    const heroProgress = clamp01((progress - heroRange.start) / heroRange.duration);
    const morphProgress = getSceneProgress(progress, SCENE_TIMING.textMorph.start, SCENE_TIMING.textMorph.end) ?? 0;
    const infoProgress = getSceneProgress(progress, SCENE_TIMING.infoSections.start, SCENE_TIMING.infoSections.end) ?? 0;
    const shipSceneProgress =
      getSceneProgress(progress, SCENE_TIMING.ship.start, SCENE_TIMING.ship.end) ?? clamp01(shipBlend);
    const globeSceneProgress =
      getSceneProgress(progress, SCENE_TIMING.globe.start, SCENE_TIMING.globe.end) ?? clamp01(globeBlend);
    const forestSceneProgress =
      getSceneProgress(progress, SCENE_TIMING.forest.start, SCENE_TIMING.forest.end) ?? clamp01(forestBlend);

    const targets = targetsRef.current;


    const heroState = sampleHeroCamera(heroProgress);
    const heroCameraPosition = heroState.position.clone();
    const heroLookTarget = heroState.lookAt.clone();

    const cameraMorphTarget = new THREE.Vector3(6, 9, 54);
    const cameraInfoTarget = new THREE.Vector3(10, 11, 62);
    const cameraShipTarget = new THREE.Vector3(2, 14, 70);
    const cameraGlobeTarget = new THREE.Vector3(0, 8, 56);
    const cameraForestTarget = new THREE.Vector3(0, 14, 68);

    const lookMorphTarget = new THREE.Vector3(4, 4, -18);
    const lookInfoTarget = new THREE.Vector3(2, 6, -30);
    const lookShipTarget = new THREE.Vector3(0, 2, -10);
    const lookGlobeTarget = new THREE.Vector3(0, 6, -36);
    const lookForestTarget = new THREE.Vector3(0, 12, -40);

    const morphCamera = heroCameraPosition.clone().lerp(cameraMorphTarget, morphProgress);
    const infoCamera = morphCamera.clone().lerp(cameraInfoTarget, infoProgress);
    const shipCamera = infoCamera.clone().lerp(cameraShipTarget, shipSceneProgress);
    const globeCamera = shipCamera.clone().lerp(cameraGlobeTarget, globeSceneProgress);
    const forestCamera = globeCamera.clone().lerp(cameraForestTarget, forestSceneProgress);

    targets.cameraPosition.copy(forestCamera);

    const morphLook = heroLookTarget.clone().lerp(lookMorphTarget, morphProgress);
    const infoLook = morphLook.clone().lerp(lookInfoTarget, infoProgress);
    const shipLook = infoLook.clone().lerp(lookShipTarget, shipSceneProgress);
    const globeLook = shipLook.clone().lerp(lookGlobeTarget, globeSceneProgress);
    const forestLook = globeLook.clone().lerp(lookForestTarget, forestSceneProgress);
    targets.cameraLookAt.copy(forestLook);

    const heroFov = heroState.fov;
    const morphFov = THREE.MathUtils.lerp(heroFov, 47, morphProgress);
    const infoFov = THREE.MathUtils.lerp(morphFov, 49, infoProgress);
    const shipFov = THREE.MathUtils.lerp(infoFov, 46, shipSceneProgress);
    const globeFov = THREE.MathUtils.lerp(shipFov, 44, globeSceneProgress);
    const forestFov = THREE.MathUtils.lerp(globeFov, 43, forestSceneProgress);
    targets.cameraFov = forestFov;
    targets.heroProgress = heroProgress;

    let heroRotationOffset = 0;

    if (!reducedMotion) {
      const heroLoopStrength = Math.max(0, 1 - heroProgress);
      if (heroLoopStrength > 0.0001) {
        const heroLoopState = heroLoopStateRef.current;
        tempVecA
          .set(heroLoopState.camX, heroLoopState.camY, heroLoopState.camZ)
          .multiplyScalar(heroLoopStrength * 0.85);
        tempVecB
          .set(heroLoopState.lookX, heroLoopState.lookY, heroLoopState.lookZ)
          .multiplyScalar(heroLoopStrength * 0.72);
        targets.cameraPosition.add(tempVecA);
        targets.cameraLookAt.add(tempVecB);
        heroRotationOffset = heroLoopState.rotation * heroLoopStrength;

        const pointer = pointerCurrentRef.current;
        targets.cameraPosition.x += pointer.x * heroLoopStrength * 2.4;
        targets.cameraPosition.y += pointer.y * heroLoopStrength * 1.4;
        targets.cameraLookAt.x += pointer.x * heroLoopStrength * 1.1;
        targets.cameraLookAt.y += pointer.y * heroLoopStrength * 0.6;
      }
    }

    const mountainRotation =
      -Math.PI / 12 +
      heroProgress * 0.18 +
      morphProgress * 0.4 -
      infoProgress * 0.2 -
      shipSceneProgress * 0.1;
    targets.mountainRotation = mountainRotation + heroRotationOffset;

    const morphBlend = clamp01(islandBlend);
    const infoFade =
      infoProgress > 0.65 ? THREE.MathUtils.smoothstep(1 - (infoProgress - 0.65) / 0.35, 0, 1) : 1;
    const shipFade = THREE.MathUtils.smoothstep(1 - shipSceneProgress * 1.2, 0, 1);
    const globeFade = THREE.MathUtils.smoothstep(1 - globeSceneProgress * 1.3, 0, 1);
    const forestFade = THREE.MathUtils.smoothstep(1 - forestSceneProgress * 1.6, 0, 1);
    targets.mountainOpacity = clamp01(infoFade * shipFade * globeFade * forestFade);

    targets.mountainBlend = morphBlend;
    targets.mistOpacity = clamp01(1 - morphBlend * 1.1);
    targets.waterOpacity = clamp01(morphBlend * 1.12);

    targets.shipProgress = clamp01(shipSceneProgress);
    targets.shipOpacity = clamp01(shipBlend * 1.2);

    targets.globeOpacity = clamp01(globeBlend * 1.4);
    targets.forestOpacity = clamp01(forestBlend * 1.5);
  }, [progress, islandBlend, shipBlend, globeBlend, forestBlend, reducedMotion, tempVecA, tempVecB]);

  // ✨ CRITICAL FIX: Calculate container opacity to fade out mountain during later scenes
  const containerOpacity = useMemo(() => {
    // Scene 1 & 2 (Hero + Text Morph): 0-30% → Fully visible
    if (progress < 0.30) return 1;
    
    // Scene 3 transition (Info Sections): 30-35% → Fade out
    if (progress < 0.35) {
      return 1 - (progress - 0.30) / 0.05;
    }
    
    // Scene 4-7 (Ship, Globe, Forest, Footer): 35%+ → Hidden
    return 0;
  }, [progress]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none" 
      style={{ 
        zIndex: 1,  // ← Fixed from 0 to 1 (background layer)
        opacity: containerOpacity, // ← Dynamic opacity control
      }} 
    />
  );
}
