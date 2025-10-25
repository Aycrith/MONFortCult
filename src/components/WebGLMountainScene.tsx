'use client';

import { useEffect, useRef, ReactNode, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MountainSceneProvider, MountainSceneControls } from '@/context/MountainSceneContext';
import { useMenu } from '@/context/MenuContext';
import MenuPanel, { type SceneTone } from './MenuPanel';

gsap.registerPlugin(ScrollTrigger);

const textureCache = new Map<string, THREE.Texture>();

const createRadialAlphaTexture = (size = 256) => {
  const data = new Uint8Array(size * size);
  const center = size / 2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x - center) / center;
      const dy = (y - center) / center;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const alpha = Math.pow(Math.max(0, 1 - distance), 1.8);
      data[y * size + x] = Math.min(255, Math.max(0, Math.floor(alpha * 255)));
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.AlphaFormat);
  texture.needsUpdate = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
};

const RADIAL_ALPHA_TEXTURE = createRadialAlphaTexture();

interface WebGLMountainSceneProps {
  children?: ReactNode;
  progress?: number; // Global progress from MasterScrollContainer (0-1)
  opacity?: number; // Scene opacity for crossfading (0-1)
  isVisible?: boolean; // Whether scene is currently visible
  soundEnabled?: boolean;
  onSoundToggle?: () => void;
  soundNotice?: string | null;
  soundLocked?: boolean;
}

// Time of day presets
type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

interface TimePreset {
  name: TimeOfDay;
  skyColor: THREE.Color;
  fogColor: THREE.Color;
  fogDensity: number;
  ambientLight: { color: THREE.Color; intensity: number };
  directionalLight: { color: THREE.Color; intensity: number; position: THREE.Vector3 };
  mountainTints: THREE.Color[];
}

// Time of day configurations
const TIME_PRESETS: Record<TimeOfDay, TimePreset> = {
  dawn: {
    name: 'dawn',
    skyColor: new THREE.Color('#1f2d3e'),
    fogColor: new THREE.Color('#3a4c63'),
    fogDensity: 0.016,
    ambientLight: { color: new THREE.Color('#f2caa5'), intensity: 0.42 },
    directionalLight: {
      color: new THREE.Color('#f7b98d'),
      intensity: 0.35,
      position: new THREE.Vector3(-14, 7, 12),
    },
    mountainTints: [
      new THREE.Color('#4f5e73'),
      new THREE.Color('#6a778b'),
      new THREE.Color('#a3b0c2'),
    ],
  },
  day: {
    name: 'day',
    skyColor: new THREE.Color('#0c1b2d'),
    fogColor: new THREE.Color('#1c2c3d'),
    fogDensity: 0.01,
    ambientLight: { color: new THREE.Color('#d7e2f1'), intensity: 0.55 },
    directionalLight: {
      color: new THREE.Color('#eff7ff'),
      intensity: 0.65,
      position: new THREE.Vector3(16, 20, 14),
    },
    mountainTints: [
      new THREE.Color('#5c6f86'),
      new THREE.Color('#7c8ea5'),
      new THREE.Color('#cfd9e6'),
    ],
  },
  dusk: {
    name: 'dusk',
    skyColor: new THREE.Color('#1b1d35'),
    fogColor: new THREE.Color('#2f2b46'),
    fogDensity: 0.018,
    ambientLight: { color: new THREE.Color('#f0b4a1'), intensity: 0.32 },
    directionalLight: {
      color: new THREE.Color('#ff8c6a'),
      intensity: 0.42,
      position: new THREE.Vector3(9, 4, -9),
    },
    mountainTints: [
      new THREE.Color('#423a5c'),
      new THREE.Color('#695076'),
      new THREE.Color('#a77d75'),
    ],
  },
  night: {
    name: 'night',
    skyColor: new THREE.Color('#070d1a'),
    fogColor: new THREE.Color('#111a2a'),
    fogDensity: 0.024,
    ambientLight: { color: new THREE.Color('#3f4e63'), intensity: 0.18 },
    directionalLight: {
      color: new THREE.Color('#92a4c4'),
      intensity: 0.18,
      position: new THREE.Vector3(-8, 12, -6),
    },
    mountainTints: [
      new THREE.Color('#1a2234'),
      new THREE.Color('#2b3547'),
      new THREE.Color('#3d475a'),
    ],
  },
};

const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  dawn: 'DAWN',
  day: 'DAY',
  dusk: 'DUSK',
  night: 'NIGHT',
};

// Cloud particle interface
interface CloudParticle {
  mesh: THREE.Mesh;
  baseZ: number;
  driftSpeed: number;
  rotationSpeed: number;
  baseY: number;
  baseOpacity: number;
}

interface FogLayer {
  mesh: THREE.Mesh;
  baseOpacity: number;
  parallaxOffset: number;
  basePosition: THREE.Vector3;
}

// Snow particle interface
interface SnowParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  swayOffset: number;
  swaySpeed: number;
}

// Mountain peak data interface
interface MountainPeakData {
  name: string;
  elevation: string;
  description: string;
  region: string;
}

// Mountain texture paths with enhanced depth properties and peak data
// Each mountain has BOTH a snow texture (initial) and rock texture (morph target)
const MOUNTAIN_TEXTURES = [
  {
    snowPath: '/assets/mountains/vecteezy_frozen-alpine-mountain-range-with-heavy-snow-transparent_66179315.png',
    rockPath: '/assets/mountains/PNG-Green-Mountain.png',
    z: -50, // Far back
    scale: 1.5,
    y: -10,
    opacity: 0.6, // Faded for distance
    tint: new THREE.Color(0.7, 0.75, 0.85), // Cool blue tint
    peakData: {
      name: 'Mont Blanc',
      elevation: '4,808m',
      description: 'The highest peak in the Alps, a majestic symbol of natural grandeur.',
      region: 'French-Italian Alps',
    },
  },
  {
    snowPath: '/assets/mountains/vecteezy_huge-mountains-on-isolated-transparent-background_44808904.png',
    rockPath: '/assets/mountains/vecteezy_dramatic-alpine-mountain-landscape-with-sharp-peaks-and-snow_53348606.png',
    z: -30, // Mid
    scale: 2.0,
    y: -5,
    opacity: 0.8,
    tint: new THREE.Color(0.85, 0.88, 0.95),
    peakData: {
      name: 'Matterhorn',
      elevation: '4,478m',
      description: 'An iconic pyramidal peak straddling the Swiss-Italian border.',
      region: 'Pennine Alps',
    },
  },
  {
    snowPath: '/assets/mountains/vecteezy_majestic-mountain-peaks-covered-in-snow-isolated-on_50038367.png',
    rockPath: '/assets/mountains/PNG-Red-Snowcap-Mountain.png',
    z: -15, // Close
    scale: 2.5,
    y: 0,
    opacity: 1.0,
    tint: new THREE.Color(1.0, 1.0, 1.0), // Full color
    peakData: {
      name: 'Eiger',
      elevation: '3,970m',
      description: 'Famous for its formidable north face, one of the most challenging climbs in the Alps.',
      region: 'Bernese Alps',
    },
  },
];

// Custom GLSL shaders for dual-texture snow→rock morphing
const DUAL_TEXTURE_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DUAL_TEXTURE_FRAGMENT_SHADER = `
  uniform sampler2D snowTexture;
  uniform sampler2D rockTexture;
  uniform float mixProgress; // 0.0 = full snow, 1.0 = full rock
  uniform float opacity;
  uniform vec3 tintColor;
  uniform vec3 fogColor;
  uniform float fogDensity;

  varying vec2 vUv;

  void main() {
    // Sample both textures
    vec4 snowColor = texture2D(snowTexture, vUv);
    vec4 rockColor = texture2D(rockTexture, vUv);

    // Mix textures based on progress
    vec4 mixedColor = mix(snowColor, rockColor, mixProgress);

    // Apply tint color
    mixedColor.rgb *= tintColor;

    // Apply fog (simple depth-based fog approximation)
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = 1.0 - exp(-fogDensity * depth);
    mixedColor.rgb = mix(mixedColor.rgb, fogColor, fogFactor);

    // Apply opacity
    mixedColor.a *= opacity;

    gl_FragColor = mixedColor;
  }
`;

// Water plane configuration for mist-to-ocean transformation
const WATER_PLANE_CONFIG = {
  position: { x: 0, y: -20, z: -35 }, // Below mountains
  scale: { width: 120, height: 120 }, // Wide ocean surface
  color: new THREE.Color(0x1a4d5c), // Deep ocean blue-green
  waveSpeed: 0.0003, // Slow, calm waves
  waveAmplitude: 0.3, // Subtle wave height
  opacity: 0.85, // Semi-transparent for depth
};

// GLSL shaders for animated water surface
const WATER_VERTEX_SHADER = `
  uniform float time;
  uniform float waveAmplitude;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying float vElevation;

  void main() {
    vUv = uv;
    vNormal = normal;

    // Animated wave displacement using multiple sine waves for natural look
    float wave1 = sin(position.x * 0.5 + time * 0.5) * waveAmplitude;
    float wave2 = sin(position.z * 0.3 + time * 0.3) * waveAmplitude * 0.5;
    float wave3 = cos(position.x * 0.8 - position.z * 0.4 + time * 0.4) * waveAmplitude * 0.3;

    vElevation = wave1 + wave2 + wave3;

    vec3 newPosition = position;
    newPosition.y += vElevation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const WATER_FRAGMENT_SHADER = `
  uniform vec3 waterColor;
  uniform float opacity;
  uniform vec3 fogColor;
  uniform float fogDensity;
  uniform float time;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying float vElevation;

  void main() {
    // Base water color
    vec3 color = waterColor;

    // Add subtle variation based on wave elevation
    float elevationFactor = vElevation * 0.5 + 0.5; // Normalize to 0-1
    color = mix(color * 0.8, color * 1.2, elevationFactor);

    // Simple fresnel effect for highlights on wave crests
    float fresnel = pow(1.0 - abs(vElevation) / 0.5, 2.0);
    color = mix(color, vec3(0.6, 0.8, 0.9), fresnel * 0.2);

    // Animated shimmer using UV coordinates
    float shimmer = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time * 0.7) * 0.05;
    color += shimmer;

    // Apply fog
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = 1.0 - exp(-fogDensity * depth * 0.5); // Less fog on water
    color = mix(color, fogColor, fogFactor);

  gl_FragColor = vec4(color, opacity);
}
`;

const FOG_LAYER_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const FOG_LAYER_FRAGMENT_SHADER = `
  uniform vec3 fogColor;
  uniform float opacity;
  uniform float time;
  uniform float noiseScale;
  uniform float noiseIntensity;
  uniform float gradientStrength;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    float gradient = pow(1.0 - clamp(vUv.y, 0.0, 1.0), gradientStrength);
    vec2 uv = vUv * noiseScale + vec2(time * 0.02, time * 0.015);
    float n = noise(uv);
    float softenedNoise = mix(0.5, n, noiseIntensity);

    float density = gradient * softenedNoise;
    float alpha = opacity * clamp(density, 0.0, 1.0);

    if (alpha <= 0.01) {
      discard;
    }

    gl_FragColor = vec4(fogColor, alpha);
  }
`;

const FOG_LAYER_CONFIGS = [
  {
    width: 130,
    height: 70,
    position: { x: 0, y: -6, z: -22 },
    opacity: 0.55,
    noiseScale: 2.4,
    noiseIntensity: 0.65,
    gradientStrength: 1.4,
    parallax: 12,
  },
  {
    width: 150,
    height: 80,
    position: { x: 0, y: -4, z: -18 },
    opacity: 0.42,
    noiseScale: 2.0,
    noiseIntensity: 0.55,
    gradientStrength: 1.25,
    parallax: 18,
  },
  {
    width: 170,
    height: 90,
    position: { x: 0, y: -2, z: -12 },
    opacity: 0.35,
    noiseScale: 1.6,
    noiseIntensity: 0.5,
    gradientStrength: 1.1,
    parallax: 26,
  },
] as const;

// Select random cloud textures (8-12 clouds on desktop, 5-8 on mobile)
const CLOUD_STRATA = [
  {
    anchors: [
      { x: -24, y: -6, z: -26 },
      { x: 4, y: -4, z: -24 },
      { x: 24, y: -8, z: -28 },
    ],
    jitter: { x: 6, y: 2, z: 4 },
    scale: { min: 1.2, max: 1.8 },
    opacity: { min: 0.22, max: 0.28 },
  },
  {
    anchors: [
      { x: -30, y: 0, z: -38 },
      { x: 8, y: 2, z: -40 },
      { x: 28, y: -1, z: -42 },
      { x: -6, y: 4, z: -45 },
    ],
    jitter: { x: 10, y: 4, z: 6 },
    scale: { min: 1.5, max: 2.2 },
    opacity: { min: 0.18, max: 0.24 },
  },
  {
    anchors: [
      { x: -18, y: 8, z: -52 },
      { x: 16, y: 10, z: -55 },
      { x: 0, y: 12, z: -58 },
    ],
    jitter: { x: 14, y: 6, z: 6 },
    scale: { min: 1.8, max: 2.6 },
    opacity: { min: 0.14, max: 0.2 },
  },
];

const generateCloudConfigs = (isMobile: boolean, isLowPerformance: boolean) => {
  const maxIndex = isLowPerformance ? 80 : 150;
  const configs: Array<{
    path: string;
    x: number;
    y: number;
    z: number;
    scale: number;
    opacity: number;
    driftSpeed: number;
    rotationSpeed: number;
  }> = [];

  CLOUD_STRATA.forEach((stratum, layerIndex) => {
    const densityModifier = isMobile ? 0.6 : 1;
    const count = Math.ceil(stratum.anchors.length * densityModifier);
    for (let i = 0; i < count; i += 1) {
      const anchor = stratum.anchors[i % stratum.anchors.length];
      const jitterX = (Math.random() * 2 - 1) * stratum.jitter.x;
      const jitterY = (Math.random() * 2 - 1) * stratum.jitter.y;
      const jitterZ = (Math.random() * 2 - 1) * stratum.jitter.z;

      const baseScale =
        stratum.scale.min + Math.random() * (stratum.scale.max - stratum.scale.min);
      const baseOpacity =
        stratum.opacity.min + Math.random() * (stratum.opacity.max - stratum.opacity.min);

      configs.push({
        path: `/assets/clouds/${String(Math.floor(Math.random() * maxIndex) + 1).padStart(
          2,
          '0'
        )}.png`,
        x: anchor.x + jitterX,
        y: anchor.y + jitterY,
        z: anchor.z + jitterZ,
        scale: baseScale * (isLowPerformance ? 0.9 : 1),
        opacity: baseOpacity * (isLowPerformance ? 0.85 : 1),
        driftSpeed: 0.006 + layerIndex * 0.003 + Math.random() * 0.006,
        rotationSpeed: (Math.random() - 0.5) * 0.0003,
      });
    }
  });

  return configs;
};

export default function WebGLMountainScene({
  children,
  progress = 0,
  opacity = 1,
  isVisible = true,
  soundEnabled = false,
  onSoundToggle,
  soundNotice = null,
  soundLocked = false,
}: WebGLMountainSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cloudParticlesRef = useRef<CloudParticle[]>([]);
  const fogLayersRef = useRef<FogLayer[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const frameIdRef = useRef<number | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouse2DRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Time of day system refs
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const mountainMeshesRef = useRef<THREE.Mesh[]>([]);
  const snowParticlesRef = useRef<SnowParticle[]>([]);
  const waterPlaneRef = useRef<THREE.Mesh | null>(null);
  const mistToOceanProgressRef = useRef(0);

  const [currentTime, setCurrentTime] = useState<TimeOfDay>('day');
  const [snowEnabled, setSnowEnabled] = useState(false);
  const [hoveredPeak, setHoveredPeak] = useState<MountainPeakData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [selectedPeak, setSelectedPeak] = useState<number | null>(null);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const { menuOpen, setMenuOpen } = useMenu();
  const tourTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const zoomScrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const currentTimeRef = useRef<TimeOfDay>('day');
  const snowEnabledRef = useRef(false);
  const handleMountainClickRef = useRef<(peakIndex: number) => void>(() => {});

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    snowEnabledRef.current = snowEnabled;
  }, [snowEnabled]);

  // Function to smoothly transition to a new time of day
  const transitionToTime = (newTime: TimeOfDay) => {
    const preset = TIME_PRESETS[newTime];
    const duration = 2; // 2 seconds transition

    if (!sceneRef.current || !ambientLightRef.current || !directionalLightRef.current) return;

    // Animate scene background and fog
    gsap.to(sceneRef.current.background as THREE.Color, {
      r: preset.skyColor.r,
      g: preset.skyColor.g,
      b: preset.skyColor.b,
      duration,
      ease: 'power2.inOut',
    });

    if (sceneRef.current.fog && sceneRef.current.fog instanceof THREE.FogExp2) {
      gsap.to(sceneRef.current.fog.color, {
        r: preset.fogColor.r,
        g: preset.fogColor.g,
        b: preset.fogColor.b,
        duration,
        ease: 'power2.inOut',
      });
      gsap.to(sceneRef.current.fog, {
        density: preset.fogDensity,
        duration,
        ease: 'power2.inOut',
      });
    }

    // Animate ambient light
    gsap.to(ambientLightRef.current.color, {
      r: preset.ambientLight.color.r,
      g: preset.ambientLight.color.g,
      b: preset.ambientLight.color.b,
      duration,
      ease: 'power2.inOut',
    });
    gsap.to(ambientLightRef.current, {
      intensity: preset.ambientLight.intensity,
      duration,
      ease: 'power2.inOut',
    });

    // Animate directional light
    gsap.to(directionalLightRef.current.color, {
      r: preset.directionalLight.color.r,
      g: preset.directionalLight.color.g,
      b: preset.directionalLight.color.b,
      duration,
      ease: 'power2.inOut',
    });
    gsap.to(directionalLightRef.current, {
      intensity: preset.directionalLight.intensity,
      duration,
      ease: 'power2.inOut',
    });
    gsap.to(directionalLightRef.current.position, {
      x: preset.directionalLight.position.x,
      y: preset.directionalLight.position.y,
      z: preset.directionalLight.position.z,
      duration,
      ease: 'power2.inOut',
    });

    // Animate mountain tints (for ShaderMaterial uniforms)
    mountainMeshesRef.current.forEach((mesh, index) => {
      const tint = preset.mountainTints[index];
      if (mesh.material instanceof THREE.ShaderMaterial && tint && mesh.material.uniforms.tintColor) {
        gsap.to(mesh.material.uniforms.tintColor.value, {
          r: tint.r,
          g: tint.g,
          b: tint.b,
          duration,
          ease: 'power2.inOut',
        });
      }
    });

    setCurrentTime(newTime);
  };

  // Function to start cinematic fly-through tour
  const startCinematicTour = () => {
    if (!cameraRef.current || isTourPlaying) return;

    setIsTourPlaying(true);

    // Create GSAP timeline for smooth camera path
    const timeline = gsap.timeline({
      onComplete: () => {
        setIsTourPlaying(false);
        // Return to default position (close-up for zoom-out reveal)
        if (cameraRef.current) {
          gsap.to(cameraRef.current.position, {
            z: -15,
            y: 0,
            x: 0,
            duration: 2,
            ease: 'power2.inOut',
          });
        }
      },
    });

    tourTimelineRef.current = timeline;

    // Cinematic camera path through mountains
    timeline
      .to(cameraRef.current.position, {
        z: -40,
        y: 8,
        x: -15,
        duration: 3,
        ease: 'power1.inOut',
      })
      .to(cameraRef.current.position, {
        z: -25,
        y: 3,
        x: 10,
        duration: 2.5,
        ease: 'power1.inOut',
      }, '+=0.5')
      .to(cameraRef.current.position, {
        z: -10,
        y: 1,
        x: 0,
        duration: 2.5,
        ease: 'power1.inOut',
      }, '+=0.5');

    // Also animate the look-at target for dynamic perspective
    const lookAtTarget = { x: 0, y: 0, z: 0 };
    timeline.to(lookAtTarget, {
      z: -30,
      y: 5,
      duration: 3,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (cameraRef.current) {
          cameraRef.current.lookAt(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z);
        }
      },
    }, 0);
  };

  // Function to stop tour
  const stopCinematicTour = () => {
    if (tourTimelineRef.current) {
      tourTimelineRef.current.kill();
      setIsTourPlaying(false);
    }
  };

  // Function to handle mountain click with zoom
  const handleMountainClick = (peakIndex: number) => {
    if (!cameraRef.current || !sceneRef.current) return;

    const targetMountain = MOUNTAIN_TEXTURES[peakIndex];

    // Toggle zoom
    if (isZoomedIn && selectedPeak === peakIndex) {
      // Zoom out to default close-up position
      gsap.to(cameraRef.current.position, {
        z: -15,
        duration: 1.5,
        ease: 'power2.inOut',
      });
      setIsZoomedIn(false);
      setSelectedPeak(null);
    } else {
      // Zoom in
      gsap.to(cameraRef.current.position, {
        z: targetMountain.z + 10,
        duration: 1.5,
        ease: 'power2.inOut',
      });
      setIsZoomedIn(true);
      setSelectedPeak(peakIndex);
    }
  };

  handleMountainClickRef.current = handleMountainClick;

  // Function to toggle snow particles
  const toggleSnow = () => {
    if (!sceneRef.current) return;

    if (snowEnabled) {
      // Remove snow particles
      snowParticlesRef.current.forEach((particle) => {
        sceneRef.current?.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        if (particle.mesh.material instanceof THREE.Material) {
          particle.mesh.material.dispose();
        }
      });
      snowParticlesRef.current = [];
      setSnowEnabled(false);
      snowEnabledRef.current = false;
    } else {
      // Create snow particles
      const snowCount = 300;
      const snowGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const snowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
      });

      for (let i = 0; i < snowCount; i++) {
        const snowMesh = new THREE.Mesh(snowGeometry, snowMaterial);

        // Random position spread across the scene
        snowMesh.position.set(
          (Math.random() - 0.5) * 100, // X spread
          Math.random() * 50 + 10, // Y height (top of scene)
          (Math.random() - 0.5) * 100 - 30 // Z depth (-80 to 20)
        );

        sceneRef.current.add(snowMesh);

        snowParticlesRef.current.push({
          mesh: snowMesh,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02, // Slight horizontal drift
            -0.05 - Math.random() * 0.05, // Falling speed
            0
          ),
          swayOffset: Math.random() * Math.PI * 2,
          swaySpeed: 0.001 + Math.random() * 0.002,
        });
      }
      setSnowEnabled(true);
      snowEnabledRef.current = true;
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2841); // Dark blue background

    // Add exponential fog for atmospheric depth
    scene.fog = new THREE.FogExp2(0x1a2841, 0.015); // Blue-tinted fog
    sceneRef.current = scene;

    // Camera setup with zoom-out reveal (starts close, zooms out on scroll)
    const camera = new THREE.PerspectiveCamera(
      50, // Start with narrow FOV for close-up
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Start close to mountains for zoom-out reveal
    camera.position.set(0, 2, -15);
    camera.lookAt(0, 0, -30);
    cameraRef.current = camera;

    // Detect mobile for performance optimizations
    const isMobile = window.innerWidth < 768;

    // Renderer setup with performance optimizations
    const hardwareThreads = navigator.hardwareConcurrency ?? 8;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const isLowPerformanceDevice = isMobile || hardwareThreads <= 4 || devicePixelRatio <= 1;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: !isLowPerformanceDevice, // disable AA on low-powered devices
      alpha: false,
      powerPreference: isLowPerformanceDevice ? 'low-power' : 'high-performance',
      stencil: false,
      depth: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const targetPixelRatio = Math.min(
      devicePixelRatio,
      isLowPerformanceDevice ? 1.15 : isMobile ? 1.6 : 2
    );
    renderer.setPixelRatio(targetPixelRatio);
    rendererRef.current = renderer;

    // Enhanced lighting with color temperature (using day preset initially)
    const defaultPreset = TIME_PRESETS[currentTimeRef.current];
    const ambientLight = new THREE.AmbientLight(
      defaultPreset.ambientLight.color,
      defaultPreset.ambientLight.intensity
    );
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Directional light
    const directionalLight = new THREE.DirectionalLight(
      defaultPreset.directionalLight.color,
      defaultPreset.directionalLight.intensity
    );
    directionalLight.position.copy(defaultPreset.directionalLight.position);
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    // Texture loader
    const textureLoader = new THREE.TextureLoader();
    const loadTexture = (url: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        const cached = textureCache.get(url);
        if (cached) {
          resolve(cached);
          return;
        }
        textureLoader.load(
          url,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = Math.min(
              renderer.capabilities.getMaxAnisotropy(),
              isLowPerformanceDevice ? 2 : 6
            );
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            textureCache.set(url, texture);
            resolve(texture);
          },
          undefined,
          (error) => {
            reject(error);
          }
        );
      });

    // Create mountain planes with dual-texture system (snow→rock morphing)
    MOUNTAIN_TEXTURES.forEach((mountain, index) => {
      // Load BOTH snow and rock textures
      Promise.all([
        new Promise<THREE.Texture>((resolve, reject) => {
          textureLoader.load(mountain.snowPath, resolve, undefined, reject);
        }),
        new Promise<THREE.Texture>((resolve, reject) => {
          textureLoader.load(mountain.rockPath, resolve, undefined, reject);
        }),
      ])
        .then(([snowTexture, rockTexture]) => {
          // Configure textures
          [snowTexture, rockTexture].forEach((texture) => {
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
          });

          // Preserve aspect ratio (use snow texture dimensions)
          const aspectRatio = snowTexture.image.width / snowTexture.image.height;
          const planeGeometry = new THREE.PlaneGeometry(
            mountain.scale * aspectRatio * 10,
            mountain.scale * 10
          );

          // Use time-of-day tint
          const tint = defaultPreset.mountainTints[index] || mountain.tint;

          // Create ShaderMaterial with dual-texture support
          const material = new THREE.ShaderMaterial({
            uniforms: {
              snowTexture: { value: snowTexture },
              rockTexture: { value: rockTexture },
              mixProgress: { value: 0.0 }, // Start with full snow
              opacity: { value: mountain.opacity },
              tintColor: { value: tint },
              fogColor: { value: scene.fog instanceof THREE.FogExp2 ? scene.fog.color : new THREE.Color(0x1a2841) },
              fogDensity: { value: scene.fog instanceof THREE.FogExp2 ? scene.fog.density : 0.015 },
            },
            vertexShader: DUAL_TEXTURE_VERTEX_SHADER,
            fragmentShader: DUAL_TEXTURE_FRAGMENT_SHADER,
            transparent: true,
            side: THREE.DoubleSide,
          });

          const plane = new THREE.Mesh(planeGeometry, material);
          plane.position.set(0, mountain.y, mountain.z);
          scene.add(plane);

          // Store mesh for time-of-day transitions and morphing
          mountainMeshesRef.current.push(plane);
        })
        .catch((error) => {
          console.error(`Failed to load mountain textures for layer ${index}:`, error);
        });
    });

    // Create cloud particle system
    const cloudTextures = generateCloudConfigs(isMobile, isLowPerformanceDevice);
    const cloudParticles: CloudParticle[] = [];

    const fogTint =
      scene.fog instanceof THREE.FogExp2
        ? scene.fog.color.clone()
        : new THREE.Color(0x7a6aa8);

    Promise.all(
      cloudTextures.map((cloud) =>
        loadTexture(cloud.path)
          .then((texture) => {
            const aspectRatio = texture.image.width / texture.image.height;
            const geometry = new THREE.PlaneGeometry(
              cloud.scale * aspectRatio * 15,
              cloud.scale * 15
            );

            const baseOpacity = Math.min(cloud.opacity, isLowPerformanceDevice ? 0.35 : 0.45);
            const material = new THREE.MeshBasicMaterial({
              map: texture,
              color: fogTint.clone().lerp(new THREE.Color(0xf4f8ff), 0.55),
              transparent: true,
              opacity: baseOpacity,
              side: THREE.DoubleSide,
              fog: true,
              depthWrite: false,
            });
            material.userData.baseOpacity = baseOpacity;
            material.depthTest = false;
            material.alphaMap = RADIAL_ALPHA_TEXTURE;
            material.alphaMap.needsUpdate = true;

            const mesh = new THREE.Mesh(geometry, material);
            const frontLayerBoost = cloud.z > -30 ? 0.6 : 0;
            mesh.position.set(cloud.x * 0.85, cloud.y + 6 + frontLayerBoost * 12, cloud.z - 4);
            const depthFactor = THREE.MathUtils.clamp((mesh.position.z + 64) / 48, 0, 1);
            const softness = 0.65 + depthFactor * 0.25;
            material.opacity = baseOpacity * softness;
            mesh.scale.set(1.2 + depthFactor * 0.4, 0.9 + depthFactor * 0.3, 1);
            scene.add(mesh);

            cloudParticles.push({
              mesh,
              baseZ: mesh.position.z,
              driftSpeed: cloud.driftSpeed,
              rotationSpeed: cloud.rotationSpeed,
              baseY: mesh.position.y,
              baseOpacity,
            });
          })
          .catch((error) => {
            console.error(`Failed to load cloud texture: ${cloud.path}`, error);
          })
      )
    ).then(() => {
      cloudParticlesRef.current = cloudParticles;
    });

    // Create atmospheric fog layers to soften foreground contrast
    const fogLayers: FogLayer[] = [];
    FOG_LAYER_CONFIGS.forEach((config, index) => {
      const geometry = new THREE.PlaneGeometry(config.width, config.height, 1, 1);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          fogColor: {
            value:
              scene.fog instanceof THREE.FogExp2
                ? scene.fog.color.clone()
                : new THREE.Color(0x7484a0),
          },
          opacity: { value: config.opacity },
          time: { value: 0 },
          noiseScale: { value: config.noiseScale },
          noiseIntensity: { value: config.noiseIntensity },
          gradientStrength: { value: config.gradientStrength },
        },
        vertexShader: FOG_LAYER_VERTEX_SHADER,
        fragmentShader: FOG_LAYER_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.renderOrder = 2 + index;
      const basePosition = new THREE.Vector3(
        config.position.x,
        config.position.y,
        config.position.z
      );
      mesh.position.copy(basePosition);
      scene.add(mesh);

      fogLayers.push({
        mesh,
        baseOpacity: config.opacity,
        parallaxOffset: config.parallax,
        basePosition,
      });
    });
    fogLayersRef.current = fogLayers;

    // Create water plane for mist-to-ocean transformation (Phase 2D)
    const waterGeometry = new THREE.PlaneGeometry(
      WATER_PLANE_CONFIG.scale.width,
      WATER_PLANE_CONFIG.scale.height,
      64, // Width segments for wave detail
      64  // Height segments for wave detail
    );
    waterGeometry.rotateX(-Math.PI / 2); // Rotate to horizontal

    const waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        waveAmplitude: { value: WATER_PLANE_CONFIG.waveAmplitude },
        waterColor: { value: WATER_PLANE_CONFIG.color },
        opacity: { value: 0.0 }, // Start hidden, will fade in during transformation
        fogColor: { value: scene.fog instanceof THREE.FogExp2 ? scene.fog.color : new THREE.Color(0x1a2841) },
        fogDensity: { value: scene.fog instanceof THREE.FogExp2 ? scene.fog.density : 0.015 },
      },
      vertexShader: WATER_VERTEX_SHADER,
      fragmentShader: WATER_FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const waterPlane = new THREE.Mesh(waterGeometry, waterMaterial);
    waterPlane.position.set(
      WATER_PLANE_CONFIG.position.x,
      WATER_PLANE_CONFIG.position.y,
      WATER_PLANE_CONFIG.position.z
    );
    scene.add(waterPlane);
    waterPlaneRef.current = waterPlane;

    // Mouse tracking for parallax interaction and raycasting
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      mouseRef.current.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update 2D mouse for raycasting
      mouse2DRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse2DRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Raycast to detect mountain hover
      if (cameraRef.current && mountainMeshesRef.current.length > 0) {
        raycasterRef.current.setFromCamera(mouse2DRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(mountainMeshesRef.current);

        if (intersects.length > 0) {
          const mountainIndex = mountainMeshesRef.current.indexOf(intersects[0].object as THREE.Mesh);
          if (mountainIndex !== -1) {
            setHoveredPeak(MOUNTAIN_TEXTURES[mountainIndex].peakData);
            setTooltipPosition({ x: event.clientX, y: event.clientY });
            document.body.style.cursor = 'pointer';
            return;
          }
        }
      }

      // No hover
      setHoveredPeak(null);
      document.body.style.cursor = 'default';
    };

    // Mouse click for mountain selection
    const handleClick = (event: MouseEvent) => {
      if (cameraRef.current && mountainMeshesRef.current.length > 0) {
        mouse2DRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse2DRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycasterRef.current.setFromCamera(mouse2DRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(mountainMeshesRef.current);

        if (intersects.length > 0) {
          const mountainIndex = mountainMeshesRef.current.indexOf(intersects[0].object as THREE.Mesh);
          if (mountainIndex !== -1) {
            handleMountainClickRef.current(mountainIndex);
          }
        }
      }
    };

    // Touch support for mobile
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouseRef.current.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.targetY = -(touch.clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('click', handleClick);

    // Enhanced animation loop with cloud animations and mouse parallax
    let lastTime = performance.now();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        // Smooth lerp for mouse parallax (60fps interpolation)
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

        // Apply subtle camera rotation based on mouse position
        const rotationInfluence = 0.08; // Reduced influence for subtlety
        cameraRef.current.rotation.y = mouseRef.current.x * rotationInfluence;
        cameraRef.current.rotation.x = mouseRef.current.y * rotationInfluence * 0.5;

        // Animate cloud particles (drift and rotate)
        // Per reference: clouds drift "slowly and continuously from right to left"
        cloudParticlesRef.current.forEach((particle) => {
          // Horizontal drift (right to left = negative X direction)
          particle.mesh.position.x -= particle.driftSpeed;

          // Wrap around when cloud goes too far
          if (particle.mesh.position.x < -50) {
            particle.mesh.position.x = 50;
          } else if (particle.mesh.position.x > 50) {
            particle.mesh.position.x = -50;
          }

          // Slow rotation for organic movement
          particle.mesh.rotation.z += particle.rotationSpeed;

          // Subtle vertical floating (sine wave)
          particle.mesh.position.y = particle.baseY + Math.sin(currentTime * 0.0003 + particle.baseZ) * 0.5;
        });

        // Animate fog layers for atmospheric depth
        fogLayersRef.current.forEach((layer, index) => {
          if (layer.mesh.material instanceof THREE.ShaderMaterial) {
            const uniforms = layer.mesh.material.uniforms;
            if (uniforms.time) {
              uniforms.time.value += deltaTime * 0.35;
            }
            if (uniforms.opacity) {
              const targetOpacity =
                layer.baseOpacity * (1 - mistToOceanProgressRef.current * 0.85);
              uniforms.opacity.value = THREE.MathUtils.lerp(
                uniforms.opacity.value,
                Math.max(0, targetOpacity),
                0.08
              );
            }
          }

          const mouseInfluence = mouseRef.current.x * (layer.parallaxOffset * 0.02);
          const descent = -mistToOceanProgressRef.current * (1.5 + index * 0.6);
          layer.mesh.position.x = layer.basePosition.x + mouseInfluence;
          layer.mesh.position.y =
            layer.basePosition.y +
            descent +
            Math.sin(currentTime * 0.00025 + index) * 0.4;
        });

        // Animate snow particles (falling with sway)
        if (snowEnabledRef.current) {
          snowParticlesRef.current.forEach((particle) => {
            // Apply velocity (falling + drift)
            particle.mesh.position.add(particle.velocity);

            // Add horizontal sway (sine wave)
            particle.swayOffset += particle.swaySpeed;
            particle.mesh.position.x += Math.sin(particle.swayOffset) * 0.01;

            // Reset snow particle when it falls below the scene
            if (particle.mesh.position.y < -10) {
              particle.mesh.position.y = 50 + Math.random() * 10;
              particle.mesh.position.x = (Math.random() - 0.5) * 100;
            }

            // Depth-based opacity (far snow = more transparent)
            const distanceFromCamera = particle.mesh.position.z - (cameraRef.current?.position.z || 0);
            const opacity = THREE.MathUtils.clamp(1 - distanceFromCamera / 100, 0.3, 0.9);
            if (particle.mesh.material instanceof THREE.MeshBasicMaterial) {
              particle.mesh.material.opacity = opacity;
            }
          });
        }

        // Animate water surface (update time uniform for waves)
        if (waterPlaneRef.current?.material instanceof THREE.ShaderMaterial) {
          // Increment time uniform for continuous wave animation
          waterPlaneRef.current.material.uniforms.time.value = currentTime * WATER_PLANE_CONFIG.waveSpeed;
        }

        // Only render when needed (optimization)
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // NOTE: Zoom-out reveal is now controlled by parent MasterScrollContainer via progress prop
    // No independent ScrollTrigger needed - this is a persistent canvas component

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('click', handleClick);
      document.body.style.cursor = 'default'; // Reset cursor

      // Kill cinematic tour timeline if running
      if (tourTimelineRef.current) {
        tourTimelineRef.current.kill();
      }

      // No ScrollTrigger to kill - controlled by parent MasterScrollContainer

      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      // Clean up fog layers
      fogLayersRef.current.forEach((layer) => {
        sceneRef.current?.remove(layer.mesh);
        layer.mesh.geometry.dispose();
        if (layer.mesh.material instanceof THREE.Material) {
          layer.mesh.material.dispose();
        }
      });
      fogLayersRef.current = [];

      // Clean up water plane
      if (waterPlaneRef.current) {
        sceneRef.current?.remove(waterPlaneRef.current);
        waterPlaneRef.current.geometry?.dispose();
        if (waterPlaneRef.current.material instanceof THREE.Material) {
          waterPlaneRef.current.material.dispose();
        }
        waterPlaneRef.current = null;
      }

      // Clean up cloud particles
      cloudParticlesRef.current.forEach((particle) => {
        if (particle.mesh.geometry) particle.mesh.geometry.dispose();
        if (particle.mesh.material instanceof THREE.Material) {
          particle.mesh.material.dispose();
        }
      });
      cloudParticlesRef.current = [];
      mistToOceanProgressRef.current = 0;
    };
  }, []);

  // Handle progress prop changes (zoom-out reveal controlled by parent)
  useEffect(() => {
    if (!cameraRef.current) return;

    // Zoom-out reveal based on progress prop
    // Progress 0-1 maps to camera z from -15 (close) to 20 (wide)
    const startZ = -15;
    const endZ = 20;
    cameraRef.current.position.z = startZ + (endZ - startZ) * progress;

    // FOV widens from 50 to 80 for dramatic reveal
    const startFOV = 50;
    const endFOV = 80;
    cameraRef.current.fov = startFOV + (endFOV - startFOV) * progress;
    cameraRef.current.updateProjectionMatrix();
  }, [progress]);

  // Handle opacity prop changes (for scene crossfading)
  useEffect(() => {
    if (!containerRef.current) return;

    gsap.to(containerRef.current, {
      opacity,
      duration: 0.5,
      ease: 'power2.inOut',
    });
  }, [opacity]);

  // Control methods for Scene 2 transformations
  const rotateMountains = useCallback((rotationY: number, tiltX: number) => {
    if (!cameraRef.current) return;

    // Apply subtle rotation and tilt to camera for 3D effect
    // This creates the "rotate slightly to the left and tilt forward" effect from the breakdown
    gsap.to(cameraRef.current.rotation, {
      y: rotationY,
      x: tiltX,
      duration: 0.1,
      ease: 'none',
    });
  }, []);

  const morphSnowToRock = useCallback((progress: number) => {
    // Update mixProgress uniform for all mountain meshes
    // Progress: 0 = full snow, 1 = full rock
    mountainMeshesRef.current.forEach((mesh) => {
      if (mesh.material instanceof THREE.ShaderMaterial && mesh.material.uniforms.mixProgress) {
        // Clamp progress to 0-1 range
        const clampedProgress = Math.max(0, Math.min(1, progress));
        mesh.material.uniforms.mixProgress.value = clampedProgress;
      }
    });
  }, []);

  const transformMistToOcean = useCallback((progress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    mistToOceanProgressRef.current = clampedProgress;

    // Animate clouds downward and fade them
    cloudParticlesRef.current.forEach((particle) => {
      if (particle.mesh.material instanceof THREE.MeshBasicMaterial) {
        // Move clouds down as progress increases
        const downwardMovement = clampedProgress * 24; // Move down 24 units
        particle.mesh.position.y = particle.baseY - downwardMovement;

        // Fade out clouds
        const nextOpacity = particle.baseOpacity * (1 - clampedProgress);
        particle.mesh.material.opacity = THREE.MathUtils.clamp(nextOpacity, 0, particle.baseOpacity);
      }
    });

    // Adjust fog density layers inversely to maintain visibility
    fogLayersRef.current.forEach((layer, index) => {
      if (layer.mesh.material instanceof THREE.ShaderMaterial) {
        const base = layer.baseOpacity;
        const falloff = 1 - clampedProgress * (0.65 + index * 0.1);
        layer.mesh.material.uniforms.opacity.value = Math.max(0, base * falloff);
      }
    });

    // Reveal water plane below (Phase 2D complete!)
    if (waterPlaneRef.current?.material instanceof THREE.ShaderMaterial) {
      // Fade in water as clouds fade out (inverse relationship)
      // Max opacity is WATER_PLANE_CONFIG.opacity (0.85)
      const targetOpacity = WATER_PLANE_CONFIG.opacity;
      waterPlaneRef.current.material.uniforms.opacity.value = clampedProgress * targetOpacity;
    }
  }, []);

  const updateAtmosphere = useCallback((skyColor: THREE.Color, fogDensity: number) => {
    if (!sceneRef.current) return;

    const cloudTargetColor = new THREE.Color(0xf0f6ff).lerp(skyColor.clone(), 0.35);
    const fogLayerColor = skyColor.clone().lerp(new THREE.Color(0xdce4f5), 0.45);

    // Animate background color
    if (sceneRef.current.background instanceof THREE.Color) {
      gsap.to(sceneRef.current.background, {
        r: skyColor.r,
        g: skyColor.g,
        b: skyColor.b,
        duration: 1,
        ease: 'power2.inOut',
      });
    }

    // Animate fog
    if (sceneRef.current.fog instanceof THREE.FogExp2) {
      gsap.to(sceneRef.current.fog.color, {
        r: skyColor.r,
        g: skyColor.g,
        b: skyColor.b,
        duration: 1,
        ease: 'power2.inOut',
      });
      gsap.to(sceneRef.current.fog, {
        density: fogDensity,
        duration: 1,
        ease: 'power2.inOut',
      });
    }

    // Update fog uniforms in mountain shader materials
    mountainMeshesRef.current.forEach((mesh) => {
      if (mesh.material instanceof THREE.ShaderMaterial) {
        if (mesh.material.uniforms.fogColor) {
          gsap.to(mesh.material.uniforms.fogColor.value, {
            r: skyColor.r,
            g: skyColor.g,
            b: skyColor.b,
            duration: 1,
            ease: 'power2.inOut',
          });
        }
        if (mesh.material.uniforms.fogDensity) {
          gsap.to(mesh.material.uniforms.fogDensity, {
            value: fogDensity,
            duration: 1,
            ease: 'power2.inOut',
          });
        }
      }
    });

    // Harmonize fog layer color with new sky tint
    fogLayersRef.current.forEach((layer) => {
      if (layer.mesh.material instanceof THREE.ShaderMaterial) {
        const uniforms = layer.mesh.material.uniforms;
        if (uniforms.fogColor && uniforms.fogColor.value instanceof THREE.Color) {
          gsap.to(uniforms.fogColor.value, {
            r: fogLayerColor.r,
            g: fogLayerColor.g,
            b: fogLayerColor.b,
            duration: 1,
            ease: 'power2.inOut',
          });
        }
      }
    });

    // Subtly retint clouds to avoid harsh silhouettes
    cloudParticlesRef.current.forEach((particle) => {
      if (particle.mesh.material instanceof THREE.MeshBasicMaterial) {
        gsap.to(particle.mesh.material.color, {
          r: cloudTargetColor.r,
          g: cloudTargetColor.g,
          b: cloudTargetColor.b,
          duration: 1,
          ease: 'power1.out',
        });
        const targetOpacity = particle.baseOpacity * 0.9;
        gsap.to(particle.mesh.material, {
          opacity: Math.max(0.18, targetOpacity),
          duration: 0.8,
          ease: 'power1.out',
        });
      }
    });

    // Update fog uniforms in water plane shader material
    if (waterPlaneRef.current?.material instanceof THREE.ShaderMaterial) {
      if (waterPlaneRef.current.material.uniforms.fogColor) {
        gsap.to(waterPlaneRef.current.material.uniforms.fogColor.value, {
          r: skyColor.r,
          g: skyColor.g,
          b: skyColor.b,
          duration: 1,
          ease: 'power2.inOut',
        });
      }
      if (waterPlaneRef.current.material.uniforms.fogDensity) {
        gsap.to(waterPlaneRef.current.material.uniforms.fogDensity, {
          value: fogDensity,
          duration: 1,
          ease: 'power2.inOut',
        });
      }
    }
  }, []);

  // Create context value with all control methods
  const contextValue: MountainSceneControls = useMemo(
    () => ({
      scene: sceneRef.current,
      camera: cameraRef.current,
      renderer: rendererRef.current,
      mountainMeshes: mountainMeshesRef.current,
      cloudParticles: cloudParticlesRef.current,
      rotateMountains,
      morphSnowToRock,
      transformMistToOcean,
      updateAtmosphere,
    }),
    [rotateMountains, morphSnowToRock, transformMistToOcean, updateAtmosphere]
  );

  return (
    <MountainSceneProvider value={contextValue}>
      <div
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden"
        style={{ background: '#1a2841' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: 0 }}
        />

        {/* Experience Control Dock */}
        <div
          className="absolute top-6 right-6 sm:top-8 sm:right-8 pointer-events-auto flex flex-col items-end gap-3"
          style={{ zIndex: 40 }}
        >
          {soundNotice && (
            <div className="max-w-[260px] rounded-xl border border-white/12 bg-[#0b1728]/85 px-4 py-2 text-[11px] leading-relaxed text-white/75 shadow-[0_20px_45px_rgba(3,9,18,0.55)] backdrop-blur-xl">
              {soundNotice}
            </div>
          )}

          <div className="flex items-center gap-2 rounded-full border border-white/12 bg-[#0b1728]/80 px-2 py-2 shadow-[0_22px_48px_rgba(3,9,18,0.6)] backdrop-blur-2xl">
            <button
              onClick={soundLocked ? undefined : () => onSoundToggle?.()}
              disabled={soundLocked}
              className={`flex items-center gap-2 rounded-full px-3 py-[10px] text-[10px] uppercase tracking-[0.32em] transition-all duration-300 ${
                soundEnabled
                  ? 'bg-white text-[#0f1a2e] shadow-[0_12px_26px_rgba(255,255,255,0.35)]'
                  : 'text-white/75 hover:text-white'
              } ${soundLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span>Sound</span>
              <span className="text-[10px] tracking-[0.32em]">
                {soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            <span className="hidden sm:block h-8 w-px bg-white/15" />

            <button
              onClick={toggleSnow}
              className={`flex items-center gap-2 rounded-full px-3 py-[10px] text-[10px] uppercase tracking-[0.32em] transition-all duration-300 ${
                snowEnabled
                  ? 'bg-white/15 text-white shadow-[0_12px_26px_rgba(13,33,55,0.6)]'
                  : 'text-white/75 hover:text-white'
              }`}
            >
              <span>Snow</span>
              <span className="text-[10px] tracking-[0.32em]">
                {snowEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            <span className="hidden sm:block h-8 w-px bg-white/15" />

            <button
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-2 rounded-full px-3 py-[10px] text-[10px] uppercase tracking-[0.32em] text-white/80 transition-all duration-300 hover:text-white hover:bg-white/12"
            >
              <span>Menu</span>
              <span className="hidden sm:inline text-white/50">OPEN</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 rounded-full border border-white/12 bg-[#0b1728]/75 px-2 py-2 shadow-[0_18px_38px_rgba(3,9,18,0.55)] backdrop-blur-2xl">
            {(Object.keys(TIME_OF_DAY_LABELS) as TimeOfDay[]).map((value) => {
              const isActive = currentTime === value;
              return (
                <button
                  key={value}
                  onClick={() => transitionToTime(value)}
                  className={`rounded-full px-3 py-[10px] text-[10px] uppercase tracking-[0.32em] transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-[#0f1a2e] shadow-[0_12px_24px_rgba(255,255,255,0.35)]'
                      : 'text-white/65 hover:text-white'
                  }`}
                >
                  {TIME_OF_DAY_LABELS[value]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Panel */}
        <MenuPanel
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          tone={currentTime as SceneTone}
          onToneChange={(tone) => transitionToTime(tone as TimeOfDay)}
          snowEnabled={snowEnabled}
          onSnowToggle={toggleSnow}
          onCinematicTour={() => {
            if (!isTourPlaying) {
              startCinematicTour();
            }
          }}
          soundEnabled={soundEnabled}
          onSoundToggle={onSoundToggle ?? (() => {})}
          soundNotice={soundNotice}
          soundLocked={soundLocked}
        />

        {/* Mountain Peak Tooltip */}
        {hoveredPeak && (
          <div
            className="absolute bg-black/80 text-white px-4 py-3 rounded-lg pointer-events-none backdrop-blur-sm border border-white/20"
            style={{
              zIndex: 25,
              left: `${tooltipPosition.x + 15}px`,
              top: `${tooltipPosition.y + 15}px`,
              transition: 'opacity 0.2s ease',
            }}
          >
            <h3 className="text-lg font-semibold mb-1">{hoveredPeak.name}</h3>
            <p className="text-sm text-white/70 mb-1">{hoveredPeak.elevation}</p>
            <p className="text-xs text-white/60 mb-1 max-w-xs">{hoveredPeak.description}</p>
            <p className="text-xs text-blue-300">{hoveredPeak.region}</p>
            <p className="text-xs text-white/50 mt-2 italic">Click to zoom</p>
          </div>
        )}

        {/* Zoom Out Button */}
        {isZoomedIn && (
          <button
            onClick={() => handleMountainClick(selectedPeak!)}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-300"
            style={{ zIndex: 25 }}
          >
            Reset View
          </button>
        )}

        {/* Hero Content Overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 20 }}
        >
          {children}
        </div>
      </div>
    </MountainSceneProvider>
  );
}
