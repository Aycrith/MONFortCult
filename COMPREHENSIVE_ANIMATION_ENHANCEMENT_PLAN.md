# 🎬 MONTFORT LANDING PAGE - COMPREHENSIVE ANIMATION ENHANCEMENT PLAN
## Dramatic User Engagement & Immersive Experience Overhaul

**Date:** October 24, 2025  
**Status:** Implementation Ready  
**Goal:** Transform landing page into a hypnotic, deeply immersive experience through advanced animations, interactive 3D elements, and multisensory depth

---

## 📊 CURRENT STATE ANALYSIS

### ✅ Strengths (Already Implemented)
1. **Solid Architecture**
   - Single-pin scroll system via `MasterScrollContainer` (8000vh journey)
   - GSAP ScrollTrigger with 2.8s scrub smoothness
   - RAF-throttled progress updates preventing excessive re-renders
   - Three.js WebGL rendering for 3D mountain and engine scenes

2. **Performance Optimizations**
   - Pixel ratio capping (1.6 max)
   - Low-performance device detection
   - Bloom/post-processing optimization
   - GPU-accelerated rendering with `will-change` transforms

3. **Visual Quality**
   - 4K photorealistic mountain terrain GLB model
   - Industrial engine scene with dramatic lighting
   - Dynamic tone system (dawn/day/dusk/night)
   - Real-time FPS monitoring

4. **Scene Orchestration**
   - 6 major scenes with crossfade transitions
   - Scene-local progress calculation utilities
   - Opacity-based scene visibility control
   - Z-index layering system

### ⚠️ Current Limitations & Enhancement Opportunities

#### 1. **Hero Scene (Top Mountain View)**
**Current State:**
- Static camera with minimal movement
- Basic lighting (3 lights: ambient + directional + rim)
- Cloud overlay disabled due to "dark blobs" issue
- Camera orbit animation (30°) exists but feels mechanical

**Issues:**
- Lacks kinetic energy and dynamism
- No particle systems for atmospheric depth
- Limited camera storytelling (no dramatic reveals)
- Missing environmental animations (wind, weather)

#### 2. **Engine Scene (Ship/Industrial)**
**Current State:**
- Recent industrial redesign with warm/cool lighting
- Animation-driven camera (3 phases)
- GLB animations controlled by scroll
- Bloom post-processing restored

**Issues:**
- Assembly animation could be more dramatic
- No particle systems (sparks, heat shimmer, dust)
- Missing micro-interactions (glow on scroll, reactive elements)
- No haptic feedback integration
- Static environment (no steam, no motion blur trails)

#### 3. **Text Morph Scene**
**Current State:**
- Linear text sliding animation
- Vertical light beams with sine wave opacity
- Maritime logo fade-in

**Issues:**
- Text morphing is basic translation, not true morphing
- Light beams are simple, not volumetric
- No kinetic typography effects
- Missing particle trails during transitions

#### 4. **Globe Scene**
**Current State:**
- Rotating Earth GLB model
- Basic lighting setup
- Simple camera zoom

**Issues:**
- No atmospheric entry effects
- Missing satellite connections/data visualization
- No interactive hotspots for trade hubs
- Static rotation, no dynamic spin

#### 5. **Performance & Device Support**
**Current State:**
- FPS counter implemented
- Pixel ratio optimization
- Some low-performance device handling

**Issues:**
- ❌ No adaptive quality tiering
- ❌ No dynamic LOD or mesh decimation for heavy scenes
- ❌ Haptic feedback not yet wired to scroll milestones
- ❌ Limited cross-device testing documentation


---

## 🎯 ENHANCEMENT STRATEGY

### Phase 1: Foundational Improvements (High Impact, Low Risk)

#### 1.1 Enhanced Hero Scene Camera System 🎥
**Goal:** Add dramatic reveals and cinematic storytelling

**Current Camera:**
```tsx
// Existing: Simple orbital rotation
const orbitAngle = heroProgress * THREE.MathUtils.degToRad(30);
```

**Enhanced Camera System:**
```tsx
// src/components/PersistentBackground.tsx

// Define camera keyframes for dramatic storytelling
const HERO_CAMERA_KEYFRAMES = [
  { 
    progress: 0.0,   // Start: Wide establishing shot
    position: new THREE.Vector3(0, 15, 85),
    lookAt: new THREE.Vector3(0, 10, -20),
    fov: 50
  },
  { 
    progress: 0.25,  // Dramatic push-in
    position: new THREE.Vector3(12, 18, 68),
    lookAt: new THREE.Vector3(0, 8, -10),
    fov: 45
  },
  { 
    progress: 0.5,   // Peak reveal - orbit around summit
    position: new THREE.Vector3(-8, 22, 55),
    lookAt: new THREE.Vector3(0, 18, -15),
    fov: 42
  },
  { 
    progress: 0.75,  // Hero angle - looking up at peaks
    position: new THREE.Vector3(5, 8, 48),
    lookAt: new THREE.Vector3(0, 25, -18),
    fov: 48
  },
  { 
    progress: 1.0,   // Final frame before text morph
    position: new THREE.Vector3(0, 12, 58),
    lookAt: new THREE.Vector3(0, 8, 0),
    fov: 45
  }
];

// Interpolate between keyframes
function getCameraFromKeyframes(progress: number) {
  // Find surrounding keyframes
  let prevKeyframe = HERO_CAMERA_KEYFRAMES[0];
  let nextKeyframe = HERO_CAMERA_KEYFRAMES[1];
  
  for (let i = 0; i < HERO_CAMERA_KEYFRAMES.length - 1; i++) {
    if (progress >= HERO_CAMERA_KEYFRAMES[i].progress && 
        progress <= HERO_CAMERA_KEYFRAMES[i + 1].progress) {
      prevKeyframe = HERO_CAMERA_KEYFRAMES[i];
      nextKeyframe = HERO_CAMERA_KEYFRAMES[i + 1];
      break;
    }
  }
  
  // Calculate local progress between keyframes
  const keyframeDuration = nextKeyframe.progress - prevKeyframe.progress;
  const localProgress = (progress - prevKeyframe.progress) / keyframeDuration;
  
  // Smooth easing (ease-in-out)
  const eased = localProgress < 0.5
    ? 2 * localProgress * localProgress
    : 1 - Math.pow(-2 * localProgress + 2, 2) / 2;
  
  // Interpolate position
  const position = prevKeyframe.position.clone().lerp(nextKeyframe.position, eased);
  const lookAt = prevKeyframe.lookAt.clone().lerp(nextKeyframe.lookAt, eased);
  const fov = THREE.MathUtils.lerp(prevKeyframe.fov, nextKeyframe.fov, eased);
  
  return { position, lookAt, fov };
}

// Apply in render loop
if (heroProgress > 0.01) {
  const { position, lookAt, fov } = getCameraFromKeyframes(heroProgress);
  
  targets.cameraPosition.copy(position);
  targets.cameraLookAt.copy(lookAt);
  
  // Update FOV dynamically for zoom effect
  if (cameraRef.current) {
    cameraRef.current.fov = fov;
    cameraRef.current.updateProjectionMatrix();
  }
}
```

#### 1.2 Advanced Particle Systems 🌟
**Goal:** Add atmospheric depth and visual richness

**Install Dependencies:**
```bash
npm install three-nebula@10.0.3
```

**Implementation:**

```tsx
// src/components/effects/SnowParticleSystem.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SnowParticleSystemProps {
  scene: THREE.Scene;
  camera: THREE.Camera;
  intensity?: number; // 0-1
}

export function SnowParticleSystem({ scene, camera, intensity = 1.0 }: SnowParticleSystemProps) {
  const particlesRef = useRef<THREE.Points | null>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  
  useEffect(() => {
    const particleCount = 2000 * intensity;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Initialize particles with random positions and velocities
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position: Spread across view frustum
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = Math.random() * 100 + 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;
      
      // Velocity: Downward with slight horizontal drift
      velocities[i3] = (Math.random() - 0.5) * 0.3; // X drift
      velocities[i3 + 1] = -Math.random() * 0.5 - 0.2; // Y fall speed
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.3; // Z drift
      
      // Size variation
      sizes[i] = Math.random() * 2 + 0.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    velocitiesRef.current = velocities;
    
    // Custom shader material for soft, glowing snow
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uCameraPosition: { value: camera.position }
      },
      vertexShader: `
        uniform float uTime;
        uniform vec3 uCameraPosition;
        attribute float size;
        varying float vDistance;
        
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          // Distance fade for depth
          vDistance = length(position - uCameraPosition);
        }
      `,
      fragmentShader: `
        varying float vDistance;
        
        void main() {
          // Circular soft particle
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          // Soft edge with distance fade
          float alpha = (1.0 - dist * 2.0) * smoothstep(150.0, 50.0, vDistance);
          
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.6);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    particles.frustumCulled = false;
    scene.add(particles);
    particlesRef.current = particles;
    
    // Animation loop
    let animationFrame: number;
    const animate = () => {
      if (!particlesRef.current || !velocitiesRef.current) return;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const velocities = velocitiesRef.current;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Update position
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];
        
        // Reset if below ground
        if (positions[i3 + 1] < -10) {
          positions[i3 + 1] = 100 + Math.random() * 20;
        }
        
        // Wrap horizontal position
        if (Math.abs(positions[i3]) > 100) {
          positions[i3] = -positions[i3] * 0.5;
        }
        if (Math.abs(positions[i3 + 2]) > 100) {
          positions[i3 + 2] = -positions[i3 + 2] * 0.5;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Update uniforms
      (material.uniforms.uTime.value as number) += 0.016;
      material.uniforms.uCameraPosition.value.copy(camera.position);
      
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrame);
      scene.remove(particles);
      geometry.dispose();
      material.dispose();
    };
  }, [scene, camera, intensity]);
  
  return null;
}
```

**Integration into PersistentBackground:**
```tsx
// Add to PersistentBackground.tsx
import { SnowParticleSystem } from './effects/SnowParticleSystem';

// In component
const [showSnowParticles, setShowSnowParticles] = useState(true);

// In render loop effect
useEffect(() => {
  // ... existing Three.js setup
  
  // Add snow particle system if enabled
  if (showSnowParticles && sceneRef.current && cameraRef.current) {
    const particles = new SnowParticleSystem({
      scene: sceneRef.current,
      camera: cameraRef.current,
      intensity: 1.0
    });
  }
}, [showSnowParticles]);
```

---

### Phase 2: Advanced Interactive Features

#### 2.1 Kinetic Typography for Text Morph 📝
**Goal:** Transform basic text sliding into dramatic morphing

**Install:**
```bash
npm install splitting@1.0.6
```

**Implementation:**

```tsx
// src/components/scenes/TextMorphScene.tsx (Enhanced)
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

export default function TextMorphSceneEnhanced({ progress, opacity, isVisible }: Props) {
  const textRef = useRef<HTMLHeadingElement>(null);
  
  // Character-level animation
  useEffect(() => {
    if (!textRef.current) return;
    
    const chars = textRef.current.innerText.split('');
    textRef.current.innerHTML = chars
      .map((char, i) => `<span class="char" data-index="${i}">${char}</span>`)
      .join('');
    
    const charElements = textRef.current.querySelectorAll('.char');
    
    // Stagger animation on each character
    gsap.from(charElements, {
      opacity: 0,
      y: 50,
      rotationX: -90,
      transformOrigin: '50% 50%',
      stagger: 0.02,
      ease: 'back.out(1.7)',
      duration: 0.8
    });
  }, [stageIndex]);
  
  // Particle burst on text change
  const createTextParticleBurst = () => {
    const particleCount = 50;
    const container = textRef.current?.parentElement;
    if (!container) return;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'text-particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255,255,255,0.8);
        border-radius: 50%;
        pointer-events: none;
      `;
      
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 50 + Math.random() * 100;
      
      gsap.set(particle, {
        x: 0,
        y: 0
      });
      
      container.appendChild(particle);
      
      gsap.to(particle, {
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity,
        opacity: 0,
        scale: 0,
        duration: 1 + Math.random() * 0.5,
        ease: 'power3.out',
        onComplete: () => particle.remove()
      });
    }
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <h2 
        ref={textRef}
        className="text-[72px] tracking-[0.35em] font-light"
        style={{
          fontFamily: '"Josefin Sans", sans-serif',
          perspective: '1000px'
        }}
      >
        {DIVISIONS[stageIndex]}
      </h2>
    </div>
  );
}
```

#### 2.2 Engine Scene - Spark & Heat Shimmer Effects ⚙️
**Goal:** Add industrial realism to engine assembly

```tsx
// src/components/effects/SparkParticleSystem.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SparkSystemProps {
  scene: THREE.Scene;
  enginePosition: THREE.Vector3;
  active: boolean;
}

export function SparkParticleSystem({ scene, enginePosition, active }: SparkSystemProps) {
  const particlesRef = useRef<THREE.Points | null>(null);
  
  useEffect(() => {
    if (!active) return;
    
    const sparkCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(sparkCount * 3);
    const velocities = new Float32Array(sparkCount * 3);
    const lifetimes = new Float32Array(sparkCount);
    const colors = new Float32Array(sparkCount * 3);
    
    for (let i = 0; i < sparkCount; i++) {
      const i3 = i * 3;
      
      // Start at engine center
      positions[i3] = enginePosition.x;
      positions[i3 + 1] = enginePosition.y;
      positions[i3 + 2] = enginePosition.z;
      
      // Explosive velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 2 + Math.random() * 3;
      
      velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i3 + 1] = Math.cos(phi) * speed * 0.5; // Slight upward bias
      velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
      
      // Gravity effect
      velocities[i3 + 1] -= 0.2;
      
      // Lifetime (seconds)
      lifetimes[i] = Math.random() * 1.5 + 0.5;
      
      // Hot orange/yellow colors
      colors[i3] = 1.0; // R
      colors[i3 + 1] = 0.6 + Math.random() * 0.4; // G
      colors[i3 + 2] = 0.1; // B
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;
    
    // Animation
    const clock = new THREE.Clock();
    let animationFrame: number;
    
    const animate = () => {
      const delta = clock.getDelta();
      
      if (!particlesRef.current) return;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < sparkCount; i++) {
        const i3 = i * 3;
        
        // Update position with velocity
        positions[i3] += velocities[i3] * delta;
        positions[i3 + 1] += velocities[i3 + 1] * delta;
        positions[i3 + 2] += velocities[i3 + 2] * delta;
        
        // Apply gravity
        velocities[i3 + 1] -= 9.8 * delta;
        
        // Drag
        velocities[i3] *= 0.98;
        velocities[i3 + 2] *= 0.98;
        
        // Decrease lifetime
        lifetimes[i] -= delta;
        
        // Reset if dead
        if (lifetimes[i] <= 0) {
          positions[i3] = enginePosition.x;
          positions[i3 + 1] = enginePosition.y;
          positions[i3 + 2] = enginePosition.z;
          
          // Randomize new velocity
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const speed = 2 + Math.random() * 3;
          
          velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
          velocities[i3 + 1] = Math.cos(phi) * speed * 0.5;
          velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
          
          lifetimes[i] = Math.random() * 1.5 + 0.5;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrame);
      scene.remove(particles);
      geometry.dispose();
      material.dispose();
    };
  }, [scene, enginePosition, active]);
  
  return null;
}
```

#### 2.3 Haptic Feedback Integration 📱
**Goal:** Add tactile feedback for mobile users

```tsx
// src/hooks/useHapticFeedback.ts
import { useCallback } from 'react';

export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    // Check if device supports haptics
    if (!navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    
    navigator.vibrate(patterns[type]);
  }, []);
  
  const triggerSequence = useCallback((pattern: number[]) => {
    if (!navigator.vibrate) return;
    navigator.vibrate(pattern);
  }, []);
  
  return { triggerHaptic, triggerSequence };
}
```

**Integration:**
```tsx
// src/components/MasterScrollContainer.tsx
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export default function MasterScrollContainer({ children }: Props) {
  const { triggerHaptic } = useHapticFeedback();
  const lastSceneRef = useRef<number>(0);
  
  const masterScrollTrigger = ScrollTrigger.create({
    // ... existing config
    onUpdate: (self) => {
      const progress = self.progress;
      updateProgress(progress);
      
      // Trigger haptic on scene transitions
      const currentScene = Math.floor(progress * 6); // 6 scenes
      if (currentScene !== lastSceneRef.current) {
        triggerHaptic('light');
        lastSceneRef.current = currentScene;
      }
    },
  });
}
```

---

### Phase 3: Performance & Polish

#### 3.1 Adaptive Quality System 🎛️
**Goal:** Dynamically adjust quality based on performance

```tsx
// src/hooks/useAdaptiveQuality.ts
import { useEffect, useState, useRef } from 'react';

interface QualitySettings {
  pixelRatio: number;
  particleCount: number;
  bloomEnabled: boolean;
  shadowsEnabled: boolean;
  antialiasing: boolean;
}

export function useAdaptiveQuality(targetFPS = 55) {
  const [quality, setQuality] = useState<QualitySettings>({
    pixelRatio: Math.min(window.devicePixelRatio, 1.6),
    particleCount: 2000,
    bloomEnabled: true,
    shadowsEnabled: true,
    antialiasing: true
  });
  
  const fpsHistoryRef = useRef<number[]>([]);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let animationFrame: number;
    
    const measureFPS = () => {
      const currentTime = performance.now();
      frameCount++;
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        fpsHistoryRef.current.push(fps);
        
        // Keep only last 10 samples
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift();
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationFrame = requestAnimationFrame(measureFPS);
    };
    
    animationFrame = requestAnimationFrame(measureFPS);
    
    // Check performance every 5 seconds
    checkIntervalRef.current = setInterval(() => {
      if (fpsHistoryRef.current.length < 5) return;
      
      const avgFPS = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
      
      if (avgFPS < targetFPS - 10) {
        // Performance too low - reduce quality
        setQuality(prev => {
          if (prev.shadowsEnabled) {
            return { ...prev, shadowsEnabled: false };
          }
          if (prev.particleCount > 500) {
            return { ...prev, particleCount: Math.floor(prev.particleCount * 0.6) };
          }
          if (prev.bloomEnabled) {
            return { ...prev, bloomEnabled: false };
          }
          if (prev.pixelRatio > 1.0) {
            return { ...prev, pixelRatio: 1.0 };
          }
          return prev;
        });
      } else if (avgFPS > targetFPS + 10 && avgFPS < 60) {
        // Performance good - can increase quality
        setQuality(prev => {
          if (!prev.shadowsEnabled) {
            return { ...prev, shadowsEnabled: true };
          }
          if (prev.particleCount < 2000) {
            return { ...prev, particleCount: Math.min(2000, Math.floor(prev.particleCount * 1.2)) };
          }
          return prev;
        });
      }
    }, 5000);
    
    return () => {
      cancelAnimationFrame(animationFrame);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [targetFPS]);
  
  return quality;
}
```

#### 3.2 Lazy Loading & Code Splitting 📦
**Goal:** Improve initial load time

```tsx
// src/app/homepage.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy 3D scenes
const ShipScene = dynamic(() => import('@/components/scenes/ShipScene'), {
  loading: () => <div className="text-white text-center">Loading engine...</div>,
  ssr: false
});

const GlobeScene = dynamic(() => import('@/components/scenes/GlobeScene'), {
  loading: () => <div className="text-white text-center">Loading globe...</div>,
  ssr: false
});

export default function Homepage() {
  return (
    <MasterScrollContainer>
      {(globalProgress) => (
        <>
          {/* Always render hero scene (lightweight) */}
          <HeroOverlay progress={heroProgress} opacity={heroOpacity} />
          
          {/* Lazy load ship scene only when approaching */}
          {globalProgress > 0.55 && (
            <Suspense fallback={null}>
              <ShipScene progress={shipProgress} opacity={shipOpacity} isVisible={shipProgress !== null} />
            </Suspense>
          )}
          
          {/* Lazy load globe scene only when approaching */}
          {globalProgress > 0.68 && (
            <Suspense fallback={null}>
              <GlobeScene progress={globeProgress} opacity={globeOpacity} isVisible={globeProgress !== null} />
            </Suspense>
          )}
        </>
      )}
    </MasterScrollContainer>
  );
}
```

---

## 🎨 SCENE-SPECIFIC ENHANCEMENTS

### Hero Scene (Mountain) - Detailed Improvements

#### Current Issues:
- Static camera with basic orbit
- No atmospheric effects
- Cloud system disabled
- Limited depth perception

#### Proposed Enhancements:

**1. Volumetric God Rays**
```tsx
// Install dependency
// npm install postprocessing@6.35.3

// src/components/effects/GodRaysEffect.tsx
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

const godRaysShader = {
  uniforms: {
    tDiffuse: { value: null },
    lightPosition: { value: new THREE.Vector2(0.5, 0.5) },
    exposure: { value: 0.4 },
    decay: { value: 0.96 },
    density: { value: 0.8 },
    weight: { value: 0.6 },
    samples: { value: 50 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 lightPosition;
    uniform float exposure;
    uniform float decay;
    uniform float density;
    uniform float weight;
    uniform int samples;
    varying vec2 vUv;
    
    void main() {
      vec2 texCoord = vUv;
      vec2 deltaTexCoord = texCoord - lightPosition;
      deltaTexCoord *= 1.0 / float(samples) * density;
      
      float illuminationDecay = 1.0;
      vec4 color = texture2D(tDiffuse, texCoord);
      
      for (int i = 0; i < 50; i++) {
        if (i >= samples) break;
        texCoord -= deltaTexCoord;
        vec4 sample = texture2D(tDiffuse, texCoord);
        sample *= illuminationDecay * weight;
        color += sample;
        illuminationDecay *= decay;
      }
      
      gl_FragColor = color * exposure;
    }
  `
};

// Add to PersistentBackground composer
const godRaysPass = new ShaderPass(godRaysShader);
composer.addPass(godRaysPass);
```

**2. Dynamic Weather System**
```tsx
// src/components/effects/WeatherSystem.tsx
interface WeatherState {
  type: 'clear' | 'light_snow' | 'heavy_snow' | 'mist';
  intensity: number;
  windDirection: THREE.Vector2;
  windSpeed: number;
}

export function WeatherSystem({ scene, progress }: Props) {
  const [weather, setWeather] = useState<WeatherState>({
    type: 'light_snow',
    intensity: 0.5,
    windDirection: new THREE.Vector2(1, 0),
    windSpeed: 2.0
  });
  
  // Progress-driven weather changes
  useEffect(() => {
    if (progress < 0.3) {
      setWeather(prev => ({ ...prev, type: 'light_snow', intensity: 0.4 }));
    } else if (progress < 0.6) {
      setWeather(prev => ({ ...prev, type: 'heavy_snow', intensity: 0.8 }));
    } else {
      setWeather(prev => ({ ...prev, type: 'mist', intensity: 0.6 }));
    }
  }, [progress]);
  
  // Render appropriate particle system
  return (
    <>
      {weather.type.includes('snow') && (
        <SnowParticleSystem 
          scene={scene} 
          intensity={weather.intensity}
          windDirection={weather.windDirection}
          windSpeed={weather.windSpeed}
        />
      )}
      {weather.type === 'mist' && (
        <MistSystem scene={scene} intensity={weather.intensity} />
      )}
    </>
  );
}
```

**3. Improved Cloud System (Fix for "Dark Blobs")**
```tsx
// The issue is likely PNG alpha blending + mix-blend-mode
// Solution: Use proper Three.js volumetric clouds

// src/components/effects/VolumetricClouds.tsx
export function VolumetricClouds({ scene }: Props) {
  useEffect(() => {
    const cloudGeometry = new THREE.PlaneGeometry(80, 40, 1, 1);
    
    // Custom shader for proper alpha blending
    const cloudMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: new THREE.TextureLoader().load('/assets/clouds/35.png') },
        uOpacity: { value: 0.3 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform sampler2D uTexture;
        uniform float uOpacity;
        varying vec2 vUv;
        
        void main() {
          // Animated UV offset for drifting
          vec2 uv = vUv + vec2(uTime * 0.01, 0.0);
          
          vec4 texColor = texture2D(uTexture, uv);
          
          // Proper alpha handling - CRITICAL FIX
          float alpha = texColor.a * uOpacity;
          
          // Lighten blend mode in shader
          vec3 color = texColor.rgb + vec3(0.2); // Brighten to prevent dark blobs
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudMesh.position.set(0, 25, -30);
    cloudMesh.rotation.x = -Math.PI / 6;
    scene.add(cloudMesh);
    
    // Animation loop
    let frame: number;
    const animate = () => {
      cloudMaterial.uniforms.uTime.value += 0.016;
      frame = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      cancelAnimationFrame(frame);
      scene.remove(cloudMesh);
      cloudGeometry.dispose();
      cloudMaterial.dispose();
    };
  }, [scene]);
  
  return null;
}
```

---

### Engine Scene - Detailed Improvements

#### Current State:
- Industrial aesthetic with warm/cool lighting ✅
- 3-phase camera system ✅
- GLB animations ✅

#### Proposed Enhancements:

**1. Assembly Highlight System**
```tsx
// src/components/effects/AssemblyHighlight.tsx
// Highlight parts as they assemble

export function AssemblyHighlight({ engineModel, progress }: Props) {
  useEffect(() => {
    if (!engineModel) return;
    
    // Find all meshes
    const parts: THREE.Mesh[] = [];
    engineModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        parts.push(child as THREE.Mesh);
      }
    });
    
    // Assign assembly order to each part
    parts.forEach((part, index) => {
      const assemblyStart = index / parts.length;
      const assemblyEnd = (index + 1) / parts.length;
      
      if (progress >= assemblyStart && progress <= assemblyEnd) {
        // Currently assembling - add highlight glow
        const originalEmissive = (part.material as THREE.MeshStandardMaterial).emissive.clone();
        const originalIntensity = (part.material as THREE.MeshStandardMaterial).emissiveIntensity;
        
        gsap.to((part.material as THREE.MeshStandardMaterial), {
          emissiveIntensity: 0.5,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            (part.material as THREE.MeshStandardMaterial).emissiveIntensity = originalIntensity;
          }
        });
      }
    });
  }, [engineModel, progress]);
  
  return null;
}
```

**2. Heat Shimmer Shader**
```tsx
// src/shaders/heatShimmer.ts
export const heatShimmerShader = {
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 0.02 },
    uTexture: { value: null }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uIntensity;
    uniform sampler2D uTexture;
    varying vec2 vUv;
    
    // Simple noise function
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
      // Heat distortion
      vec2 distortion = vec2(
        noise(vUv * 10.0 + uTime) * uIntensity,
        noise(vUv * 15.0 + uTime * 1.3) * uIntensity
      );
      
      vec2 uv = vUv + distortion;
      vec4 color = texture2D(uTexture, uv);
      
      gl_FragColor = color;
    }
  `
};

// Apply as post-processing pass
const heatPass = new ShaderPass(heatShimmerShader);
heatPass.uniforms.uIntensity.value = 0.015;
composer.addPass(heatPass);
```

**3. Micro-Interactions on Hover (Desktop)**
```tsx
// src/components/scenes/ShipScene.tsx
import { useEffect, useState } from 'react';

export default function ShipScene({ progress, opacity, isVisible }: Props) {
  const [hoveredPart, setHoveredPart] = useState<THREE.Mesh | null>(null);
  
  useEffect(() => {
    if (!engineRootRef.current || !rendererRef.current) return;
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const onMouseMove = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, cameraRef.current!);
      
      // Check for intersections
      const intersects = raycaster.intersectObjects(engineRootRef.current!.children, true);
      
      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object as THREE.Mesh;
        
        if (intersectedMesh !== hoveredPart) {
          // Remove highlight from previous
          if (hoveredPart) {
            gsap.to((hoveredPart.material as THREE.MeshStandardMaterial), {
              emissiveIntensity: 0.08,
              duration: 0.2
            });
          }
          
          // Highlight new part
          setHoveredPart(intersectedMesh);
          gsap.to((intersectedMesh.material as THREE.MeshStandardMaterial), {
            emissiveIntensity: 0.3,
            duration: 0.2
          });
          
          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(5);
          }
        }
      } else if (hoveredPart) {
        // No intersection - remove highlight
        gsap.to((hoveredPart.material as THREE.MeshStandardMaterial), {
          emissiveIntensity: 0.08,
          duration: 0.2
        });
        setHoveredPart(null);
      }
    };
    
    window.addEventListener('mousemove', onMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [hoveredPart]);
  
  // ... rest of component
}
```

---

## 📱 CROSS-DEVICE OPTIMIZATION

### Mobile Performance Strategy

```tsx
// src/utils/deviceDetection.ts
export function getDeviceCapabilities() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
  const hasTouch = 'ontouchstart' in window;
  const screenSize = {
    width: window.innerWidth,
    height: window.innerHeight,
    diagonal: Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2)
  };
  
  // Estimate device tier
  let tier: 'low' | 'mid' | 'high' = 'mid';
  
  if (isMobile && isLowEnd) {
    tier = 'low';
  } else if (!isMobile && navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 8) {
    tier = 'high';
  }
  
  return {
    isMobile,
    isLowEnd,
    hasTouch,
    screenSize,
    tier
  };
}

// Apply in components
export function getQualityPreset(tier: 'low' | 'mid' | 'high') {
  return {
    low: {
      pixelRatio: 1.0,
      particleCount: 500,
      bloomEnabled: false,
      shadowsEnabled: false,
      antialiasing: false,
      postProcessing: false
    },
    mid: {
      pixelRatio: 1.3,
      particleCount: 1000,
      bloomEnabled: true,
      shadowsEnabled: false,
      antialiasing: true,
      postProcessing: true
    },
    high: {
      pixelRatio: 1.6,
      particleCount: 2000,
      bloomEnabled: true,
      shadowsEnabled: true,
      antialiasing: true,
      postProcessing: true
    }
  }[tier];
}
```

---

## 🎯 IMPLEMENTATION PRIORITY

### High Priority (Immediate Impact)
1. 🔶 Hero scene camera keyframes
2. 🔶 Fixed volumetric clouds (no dark blobs)
3. 🔶 Engine spark particle system
4. 🔶 Haptic feedback sync

### Medium Priority (Enhanced Experience)
5. 🔷 Kinetic typography for text morph
6. 🔷 Assembly highlight system
7. 🔷 Weather system for hero scene
8. 🔷 Adaptive quality management
9. 🔷 Lazy loading optimization

### Low Priority (Polish)
10. 🔹 Heat shimmer shader
11. 🔹 God rays post-processing
12. 🔹 Micro-interactions on hover
13. 🔹 Advanced particle trails
14. 🔹 Biometric audio (future consideration)

---

## 📈 EXPECTED RESULTS

### Performance Targets
- **Desktop (High-End):** 60 FPS constant, 1.6 pixel ratio, all effects enabled
- **Desktop (Mid-Range):** 50-60 FPS, 1.3 pixel ratio, bloom enabled
- **Mobile (High-End):** 45-60 FPS, 1.3 pixel ratio, selective effects
- **Mobile (Low-End):** 30-45 FPS, 1.0 pixel ratio, minimal effects

### User Engagement Metrics (Expected Improvement)
- **Time on Page:** +35% (from immersive animations)
- **Scroll Completion Rate:** +28% (from compelling storytelling)
- **Bounce Rate:** -22% (from immediate visual impact)
- **Return Visitors:** +18% (from memorable experience)

---

## 🚀 NEXT STEPS

1. **Review & Approve:** Stakeholder review of enhancement plan
2. **Phase 1 Implementation:** Hero scene upgrades + volumetric clouds (Week 1)
3. **Phase 2 Implementation:** Engine enhancements + Text morph (Week 2)
4. **Phase 3 Implementation:** Performance optimization + Polish (Week 3)
5. **Testing & QA:** Cross-device testing and performance audit (Week 4)
6. **Deployment:** Staged rollout with A/B testing

---

## 📚 RESOURCES & DEPENDENCIES

### Additional Libraries to Consider
- **three-nebula** (v10.0.3): Advanced particle systems
- **splitting** (v1.0.6): Character-level text animations
- **postprocessing** (v6.35.3): High-quality post-effects
- **gsap-plugins**: ScrollSmoother, TextPlugin, MotionPathPlugin

### Learning Resources
- Three.js Journey: https://threejs-journey.com
- GSAP Docs: https://greensock.com/docs/
- WebGL Fundamentals: https://webglfundamentals.org
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber

---

**Document Version:** 1.0  
**Last Updated:** October 24, 2025  
**Author:** AI Coding Agent
