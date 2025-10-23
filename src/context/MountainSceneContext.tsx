'use client';

import { createContext, useContext, RefObject } from 'react';
import * as THREE from 'three';

/**
 * MountainSceneContext
 *
 * Shared context that allows Scene 2 (TextMorphScene) to control the 3D mountain scene
 * from Scene 1 (WebGLMountainScene) during scroll-driven transformations.
 *
 * This enables the complex Scene 2 sequence described in the Visual Animation Breakdown:
 * - 3D mountain rotation/tilt
 * - Snow-to-rock texture morphing
 * - Mist-to-water transformation
 */

export interface MountainSceneControls {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  mountainMeshes: THREE.Mesh[];
  cloudParticles: Array<{
    mesh: THREE.Mesh;
    baseZ: number;
    baseY: number;
    driftSpeed: number;
  }>;

  // Control methods for Scene 2 transformations
  rotateMountains: (rotationY: number, tiltX: number) => void;
  morphSnowToRock: (progress: number) => void;
  transformMistToOcean: (progress: number) => void;
  updateAtmosphere: (skyColor: THREE.Color, fogDensity: number) => void;
}

const MountainSceneContext = createContext<MountainSceneControls | null>(null);

export const useMountainScene = () => {
  const context = useContext(MountainSceneContext);
  if (!context) {
    // Return a safe default instead of throwing, since TextMorphScene might render before WebGLMountainScene is ready
    return null;
  }
  return context;
};

export const MountainSceneProvider = MountainSceneContext.Provider;
