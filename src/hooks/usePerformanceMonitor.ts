'use client';

import { useEffect, useState, useRef } from 'react';

export interface PerformanceMetrics {
  fps: number;
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    limit: number;
  };
  longTasks: number;
  layoutShifts: number;
  paintMetrics?: {
    firstPaint?: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
  };
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

type PaintMetrics = NonNullable<PerformanceMetrics['paintMetrics']>;

export function usePerformanceMonitor(enabled: boolean = false) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    longTasks: 0,
    layoutShifts: 0,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const longTasksRef = useRef(0);
  const layoutShiftsRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    // FPS monitoring
    let rafId: number;
    const measureFPS = () => {
      const now = performance.now();
      frameCountRef.current++;

      if (now >= lastTimeRef.current + 1000) {
        const fps = Math.round(
          (frameCountRef.current * 1000) / (now - lastTimeRef.current)
        );

        setMetrics((prev) => ({
          ...prev,
          fps,
        }));

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafId = requestAnimationFrame(measureFPS);
    };

    rafId = requestAnimationFrame(measureFPS);

    // Memory monitoring (if available)
    const updateMemory = () => {
      const perf = performance as PerformanceWithMemory;
      const memory = perf.memory;

      if (!memory) {
        return;
      }

      setMetrics((prev) => ({
        ...prev,
        memory: {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        },
      }));
    };

    const memoryInterval = setInterval(updateMemory, 2000);

    // Long tasks observer
    let longTaskObserver: PerformanceObserver | null = null;
    try {
      longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            longTasksRef.current++;
            setMetrics((prev) => ({
              ...prev,
              longTasks: longTasksRef.current,
            }));
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task API not supported
    }

    // Layout shift observer
    let layoutShiftObserver: PerformanceObserver | null = null;
    try {
      layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType !== 'layout-shift') continue;

          const layoutShift = entry as LayoutShiftEntry;
          if (!layoutShift.hadRecentInput) {
            layoutShiftsRef.current++;
            setMetrics((prev) => ({
              ...prev,
              layoutShifts: layoutShiftsRef.current,
            }));
          }
        }
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Layout shift API not supported
    }

    // Paint metrics observer
    let paintObserver: PerformanceObserver | null = null;
    try {
      paintObserver = new PerformanceObserver((list) => {
        const snapshot: Partial<PaintMetrics> = {};

        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-paint') {
              snapshot.firstPaint = entry.startTime;
            } else if (entry.name === 'first-contentful-paint') {
              snapshot.firstContentfulPaint = entry.startTime;
            }
          }

          if (entry.entryType === 'largest-contentful-paint') {
            snapshot.largestContentfulPaint = entry.startTime;
          }
        }

        setMetrics((prev) => ({
          ...prev,
          paintMetrics: {
            ...(prev.paintMetrics ?? {}),
            ...snapshot,
          },
        }));
      });

      paintObserver.observe({
        entryTypes: ['paint', 'largest-contentful-paint'],
      });
    } catch (e) {
      // Paint API not supported
    }

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(memoryInterval);
      longTaskObserver?.disconnect();
      layoutShiftObserver?.disconnect();
      paintObserver?.disconnect();
    };
  }, [enabled]);

  const resetMetrics = () => {
    longTasksRef.current = 0;
    layoutShiftsRef.current = 0;
    setMetrics({
      fps: 0,
      longTasks: 0,
      layoutShifts: 0,
    });
  };

  return {
    metrics,
    resetMetrics,
  };
}
