'use client';

import GlobeScene from './GlobeScene';
import ForestScene from './ForestScene';
import type { SceneTone } from '../MenuPanel';

interface SceneWrapperProps {
  progress: number;
  opacity: number;
  isVisible: boolean;
  tone: SceneTone;
}

/**
 * Temporary wrappers for GlobeScene and ForestScene
 * These wrap the existing scene components and control their visibility/opacity
 * based on props from MasterScrollContainer
 */

export function GlobeSceneWrapper({ progress, opacity, isVisible, tone }: SceneWrapperProps) {
  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{
        visibility: isVisible ? 'visible' : 'hidden',
        zIndex: 1,
      }}
    >
      <GlobeScene progress={progress} opacity={opacity} isVisible={isVisible} tone={tone} />
    </div>
  );
}

export function ForestSceneWrapper({ progress, opacity, isVisible, tone }: SceneWrapperProps) {
  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{
        visibility: isVisible ? 'visible' : 'hidden',
        zIndex: 1,
      }}
    >
      <ForestScene progress={progress} opacity={opacity} isVisible={isVisible} tone={tone} />
    </div>
  );
}
