'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CloudOverlay from './CloudOverlay';

gsap.registerPlugin(ScrollTrigger);

interface CanvasSequenceProps {
  totalFrames?: number;
  framesPath?: string;
  initialFramesToLoad?: number;
  onSequenceComplete?: () => void;
  children?: ReactNode;
}

export default function CanvasSequence({
  totalFrames = 200,
  framesPath = '/assets/atmosphere',
  initialFramesToLoad = 30,
  onSequenceComplete,
  children,
}: CanvasSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number>();
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Preload frames
  useEffect(() => {
    const frames: HTMLImageElement[] = [];
    let loadedCount = 0;

    // Load initial frames first (for immediate display)
    const loadInitialFrames = async () => {
      const initialPromises = [];

      for (let i = 1; i <= Math.min(initialFramesToLoad, totalFrames); i++) {
        const img = new Image();
        const frameNumber = String(i).padStart(2, '0');
        img.src = `${framesPath}/${frameNumber}.jpg`;
        frames[i - 1] = img;

        const promise = new Promise<void>((resolve) => {
          img.onload = () => {
            loadedCount++;
            setLoadingProgress((loadedCount / totalFrames) * 100);
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load frame ${frameNumber}`);
            resolve();
          };
        });

        initialPromises.push(promise);
      }

      await Promise.all(initialPromises);
      setIsReady(true);
      framesRef.current = frames;

      // Load remaining frames in background
      if (totalFrames > initialFramesToLoad) {
        loadRemainingFrames();
      }
    };

    const loadRemainingFrames = () => {
      for (let i = initialFramesToLoad + 1; i <= totalFrames; i++) {
        const img = new Image();
        const frameNumber = String(i).padStart(2, '0');
        img.src = `${framesPath}/${frameNumber}.jpg`;
        frames[i - 1] = img;

        img.onload = () => {
          loadedCount++;
          setLoadingProgress((loadedCount / totalFrames) * 100);
        };
        img.onerror = () => {
          console.warn(`Failed to load frame ${frameNumber}`);
        };
      }
    };

    loadInitialFrames();

    return () => {
      // Cleanup
      frames.forEach(img => {
        img.src = '';
      });
    };
  }, [totalFrames, framesPath, initialFramesToLoad]);

  // Render frame
  const renderFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = framesRef.current[frameIndex];
    if (!frame || !frame.complete) return;

    // Clear and draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
  };

  // Handle scroll with GSAP ScrollTrigger (viewport pinning)
  useEffect(() => {
    if (!isReady || !containerRef.current) return;

    // Initial render
    renderFrame(0);

    // Create ScrollTrigger animation
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: `+=${window.innerHeight * 3}`, // 3x viewport height for smooth scrolling
      pin: true,
      scrub: 0.5, // Smooth scrubbing
      onUpdate: (self) => {
        // Map scroll progress (0-1) to frame index (0-199)
        const progress = self.progress;
        setScrollProgress(progress); // Update scroll progress for cloud overlay

        const frameIndex = Math.min(
          Math.floor(progress * (totalFrames - 1)),
          totalFrames - 1
        );

        // Only render if frame changed
        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;

          // Use requestAnimationFrame for smooth rendering
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
          }

          rafRef.current = requestAnimationFrame(() => {
            renderFrame(frameIndex);
          });
        }

        // Call completion callback when reaching end
        if (progress >= 0.99 && onSequenceComplete) {
          onSequenceComplete();
        }
      },
    });

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isReady, totalFrames, onSequenceComplete]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set canvas size to match window
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Re-render current frame
      renderFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isReady]);

  return (
    <>
      <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: 0 }}
        />

        {/* Cloud overlay with parallax */}
        {isReady && <CloudOverlay scrollProgress={scrollProgress} />}

        {/* Hero overlay content */}
        {isReady && children}
      </div>

      {/* Loading indicator */}
      {!isReady && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
            <p className="text-white text-sm tracking-widest">
              LOADING {Math.round(loadingProgress)}%
            </p>
          </div>
        </div>
      )}
    </>
  );
}
