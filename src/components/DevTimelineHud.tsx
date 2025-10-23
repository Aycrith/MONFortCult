"use client";

import { SCENE_TIMING } from "./MasterScrollContainer";

interface DevTimelineHudProps {
  progress: number;
}

function resolveStage(progress: number) {
  const entries = Object.entries(SCENE_TIMING);
  for (const [name, timing] of entries) {
    if (progress >= timing.start && progress <= timing.end) {
      const local = (progress - timing.start) / (timing.end - timing.start || 1);
      return `${name} (${local.toFixed(2)})`;
    }
  }
  return "out-of-range";
}

export default function DevTimelineHud({ progress }: DevTimelineHudProps) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: 16,
        zIndex: 1000,
        padding: "12px 16px",
        background: "rgba(14,23,39,0.85)",
        color: "#e0f0ff",
        fontFamily: "monospace",
        fontSize: "13px",
        borderRadius: 8,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        pointerEvents: "none",
        minWidth: 220,
      }}
    >
      <div>progress: {progress.toFixed(4)}</div>
      <div>stage: {resolveStage(progress)}</div>
      <div style={{ marginTop: 6, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 999 }}>
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #5de0ff 0%, #5a7dff 100%)",
            width: `${Math.min(100, Math.max(0, progress * 100))}%`,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}
