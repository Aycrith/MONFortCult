"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { SceneTone } from "@/components/MenuPanel";
import MasterScrollContainer, {
  SCENE_TIMING,
  getSceneOpacity,
  getSceneProgress,
} from "@/components/MasterScrollContainer";
import { GlobeSceneWrapper, ForestSceneWrapper } from "@/components/scenes/SceneWrappers";

/**
 * Debug route: /forest-debug
 *
 * Purpose: Minimal harness to validate Globe → Forest crossfade and
 * tone-specific overlay/vignette gradients in ForestScene.
 *
 * Usage:
 *   /forest-debug?tone=dawn|day|dusk|night
 */
function ForestDebugInner() {
  const params = useSearchParams();
  const qpTone = (params.get("tone") ?? "dusk").toLowerCase();

  const tone: SceneTone = useMemo(() => {
    return ["dawn", "day", "dusk", "night"].includes(qpTone) ? (qpTone as SceneTone) : ("dusk" as SceneTone);
  }, [qpTone]);

  return (
    <div className="relative">
      <MasterScrollContainer>
        {(globalProgress) => {
          const globeProgress = getSceneProgress(globalProgress, SCENE_TIMING.globe.start, SCENE_TIMING.globe.end);
          const globeOpacity = getSceneOpacity(globalProgress, SCENE_TIMING.globe.start, SCENE_TIMING.globe.end, 0.035);

          const forestProgress = getSceneProgress(globalProgress, SCENE_TIMING.forest.start, SCENE_TIMING.forest.end);
          const forestOpacity = getSceneOpacity(globalProgress, SCENE_TIMING.forest.start, SCENE_TIMING.forest.end, 0.045);

          return (
            <div className="absolute inset-0">
              {/* Keep layers minimal: Globe then Forest */}
              {globeProgress !== null && (
                <GlobeSceneWrapper
                  progress={globeProgress}
                  opacity={globeOpacity}
                  isVisible={globeProgress !== null}
                  tone={tone}
                />
              )}

              {forestProgress !== null && (
                <ForestSceneWrapper
                  progress={forestProgress}
                  opacity={forestOpacity}
                  isVisible={forestProgress !== null}
                  tone={tone}
                />
              )}

              {/* Tiny HUD for manual debug if needed */}
              <div className="fixed top-2 left-2 z-[99] rounded bg-black/70 text-white text-xs px-2 py-1 font-mono">
                prog: {globalProgress.toFixed(4)} tone: {tone}
              </div>
            </div>
          );
        }}
      </MasterScrollContainer>
    </div>
  );
}

export default function ForestDebugPage() {
  return (
    <Suspense fallback={null}>
      <ForestDebugInner />
    </Suspense>
  );
}
