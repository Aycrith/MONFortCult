"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ProgressSnapshot = {
  global: number;
  hero: number;
  ship: number;
  forest: number;
};

type AdaptiveSoundscapeOptions = {
  enabled: boolean;
  onBlocked?: () => void;
};

type AdaptiveSoundscapeReturn = {
  updateProgress: (snapshot: Partial<ProgressSnapshot>) => void;
  isReady: boolean;
  isAutoplayBlocked: boolean;
};

type LayerHandle = {
  stop: () => void;
  update: (ctx: AudioContext, snapshot: ProgressSnapshot, dt: number) => void;
};

type LayerFactory = (ctx: AudioContext, master: GainNode) => LayerHandle | null;

const DEFAULT_PROGRESS: ProgressSnapshot = {
  global: 0,
  hero: 0,
  ship: 0,
  forest: 0,
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const createPadLayer: LayerFactory = (ctx, master) => {
  try {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 52;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain).connect(master);
    osc.start();
    return {
      stop: () => {
        try {
          osc.stop();
        } catch (error) {
          // ignore stop errors
        }
      },
      update: (context, snapshot) => {
        const target = clamp(0.08 + snapshot.global * 0.22 + snapshot.hero * 0.3, 0, 0.5);
        gain.gain.linearRampToValueAtTime(target, context.currentTime + 0.6);
        osc.frequency.linearRampToValueAtTime(48 + snapshot.hero * 14 + snapshot.ship * 8, context.currentTime + 0.8);
      },
    };
  } catch (error) {
    console.warn("useAdaptiveSoundscape: failed to create pad layer", error);
    return null;
  }
};

const createWindLayer: LayerFactory = (ctx, master) => {
  try {
    const bufferSize = ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.4;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(filter).connect(gain).connect(master);
    source.start();

    return {
      stop: () => {
        try {
          source.stop();
        } catch (error) {
          // ignore stop errors
        }
      },
      update: (context, snapshot) => {
        const intensity = clamp(snapshot.global * 0.2 + snapshot.ship * 0.5 + snapshot.forest * 0.45, 0, 1);
        const target = clamp(intensity * 0.6, 0, 0.55);
        gain.gain.linearRampToValueAtTime(target, context.currentTime + 0.5);
        filter.frequency.linearRampToValueAtTime(650 + intensity * 900, context.currentTime + 0.6);
      },
    };
  } catch (error) {
    console.warn("useAdaptiveSoundscape: failed to create wind layer", error);
    return null;
  }
};

const LAYER_FACTORIES: LayerFactory[] = [createPadLayer, createWindLayer];

export function useAdaptiveSoundscape({ enabled, onBlocked }: AdaptiveSoundscapeOptions): AdaptiveSoundscapeReturn {
  const contextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const layersRef = useRef<LayerHandle[]>([]);
  const rafRef = useRef<number | null>(null);
  const progressRef = useRef<ProgressSnapshot>(DEFAULT_PROGRESS);
  const lastTickRef = useRef<number | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);

  const cleanupLayers = useCallback(() => {
    layersRef.current.forEach((layer) => {
      try {
        layer.stop();
      } catch (error) {
        // ignore layer stop errors
      }
    });
    layersRef.current = [];
  }, []);

  const ensureContext = useCallback(async () => {
    if (typeof window === "undefined") {
      return null;
    }

    if (!contextRef.current) {
      const AudioCtx = (window as typeof window & { webkitAudioContext?: typeof AudioContext }).AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        console.warn("useAdaptiveSoundscape: AudioContext unavailable");
        return null;
      }
      contextRef.current = new AudioCtx();
    }

    if (!masterGainRef.current && contextRef.current) {
      const master = contextRef.current.createGain();
      master.gain.value = 0;
      master.connect(contextRef.current.destination);
      masterGainRef.current = master;
    }

    const ctx = contextRef.current;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch (error) {
        console.warn("useAdaptiveSoundscape: unable to resume audio context", error);
      }
    }
    return ctx;
  }, []);

  const initializeLayers = useCallback(async () => {
    const ctx = await ensureContext();
    if (!ctx || !masterGainRef.current) {
      return false;
    }

    if (layersRef.current.length === 0) {
      LAYER_FACTORIES.forEach((factory) => {
        const layer = factory(ctx, masterGainRef.current!);
        if (layer) {
          layersRef.current.push(layer);
        }
      });
    }

    if (layersRef.current.length > 0) {
      setIsReady(true);
      return true;
    }

    return false;
  }, [ensureContext]);

  const updateProgress = useCallback((snapshot: Partial<ProgressSnapshot>) => {
    progressRef.current = { ...progressRef.current, ...snapshot };
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsAutoplayBlocked(false);
      setIsReady(false);
      cleanupLayers();
      if (masterGainRef.current && contextRef.current) {
        const ctx = contextRef.current;
        masterGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      }
      return;
    }

    let disposed = false;

    const startPlayback = async () => {
      const initOk = await initializeLayers();
      if (!initOk || disposed) {
        return;
      }

      const ctx = contextRef.current;
      const master = masterGainRef.current;
      if (!ctx || !master) {
        return;
      }

      try {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.0);
      } catch (error) {
        // ignore scheduling issues
      }

      const tick = (timestamp: number) => {
        if (!ctx || !master || disposed) {
          return;
        }

        if (lastTickRef.current === null) {
          lastTickRef.current = timestamp;
        }
        const previous = lastTickRef.current;
        const dt = Math.min((timestamp - previous) / 1000, 0.5);
        lastTickRef.current = timestamp;

        const snapshot = progressRef.current;
        layersRef.current.forEach((layer) => {
          try {
            layer.update(ctx, snapshot, dt);
          } catch (error) {
            console.warn("useAdaptiveSoundscape: layer update failed", error);
          }
        });

        rafRef.current = requestAnimationFrame(tick);
      };

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const attemptStart = () => {
      startPlayback().catch((error) => {
        console.warn("useAdaptiveSoundscape: playback start failed", error);
      });
    };

    if (typeof window !== "undefined") {
      const ctx = contextRef.current;
      if (ctx && ctx.state === "running" && layersRef.current.length > 0) {
        attemptStart();
        setIsAutoplayBlocked(false);
      } else {
        const handleGesture = () => {
          window.removeEventListener("pointerdown", handleGesture);
          window.removeEventListener("keydown", handleGesture);
          setIsAutoplayBlocked(false);
          attemptStart();
        };
        window.addEventListener("pointerdown", handleGesture, { once: true });
        window.addEventListener("keydown", handleGesture, { once: true });
        setIsAutoplayBlocked(true);
        onBlocked?.();
        attemptStart();

        return () => {
          disposed = true;
          window.removeEventListener("pointerdown", handleGesture);
          window.removeEventListener("keydown", handleGesture);
        };
      }
    }

    return () => {
      disposed = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled, initializeLayers, cleanupLayers, onBlocked]);

  useEffect(() => () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    cleanupLayers();
    if (masterGainRef.current) {
      masterGainRef.current.disconnect();
      masterGainRef.current = null;
    }
    if (contextRef.current) {
      contextRef.current.close().catch(() => undefined);
      contextRef.current = null;
    }
  }, [cleanupLayers]);

  return {
    updateProgress,
    isReady,
    isAutoplayBlocked,
  };
}
