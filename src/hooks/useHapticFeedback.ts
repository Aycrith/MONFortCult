import { useCallback, useRef } from "react";

type HapticStrength = "light" | "medium" | "heavy";

const HAPTIC_PATTERNS: Record<HapticStrength, number[]> = {
  light: [10],
  medium: [18, 40, 18],
  heavy: [30, 60, 30],
};

export function useHapticFeedback() {
  const canVibrateRef = useRef<boolean | null>(null);

  const ensureCapability = useCallback(() => {
    if (canVibrateRef.current === null) {
      canVibrateRef.current = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
    }
    return canVibrateRef.current;
  }, []);

  const triggerHaptic = useCallback(
    (strength: HapticStrength = "light") => {
      if (!ensureCapability()) return;
      const pattern = HAPTIC_PATTERNS[strength] ?? HAPTIC_PATTERNS.light;
      navigator.vibrate(pattern);
    },
    [ensureCapability]
  );

  return { triggerHaptic };
}
