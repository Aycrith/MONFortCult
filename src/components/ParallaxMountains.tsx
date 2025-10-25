'use client';

import { useEffect, useRef, ReactNode, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CloudOverlay from './CloudOverlay';

gsap.registerPlugin(ScrollTrigger);

interface MountainLayer {
  id: string;
  src: string;
  speed: number; // Parallax multiplier (lower = slower/farther)
  zIndex: number;
  scale: number;
  yPosition: string; // Bottom position (e.g., "-10%", "0%", "10%")
  opacity: number;
}

interface ParallaxMountainsProps {
  children?: ReactNode;
}

export default function ParallaxMountains({ children }: ParallaxMountainsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);

  // Define mountain layers (back to front)
  const mountainLayers = useMemo<MountainLayer[]>(
    () => [
      {
        id: 'green-mountain',
        src: '/assets/mountains/PNG-Green-Mountain.png',
        speed: 0.3, // Slowest (farthest)
        zIndex: 1,
        scale: 0.8,
        yPosition: '20%', // Lower in viewport
        opacity: 0.7,
      },
      {
        id: 'red-mountain',
        src: '/assets/mountains/PNG-Red-Snowcap-Mountain.png',
        speed: 0.6, // Medium
        zIndex: 2,
        scale: 1.0,
        yPosition: '10%',
        opacity: 0.85,
      },
      {
        id: 'closerange-mountain',
        src: '/assets/mountains/PNG-Mountain_CLOSERANGE. png.png',
        speed: 1.0, // Fastest (closest)
        zIndex: 3,
        scale: 1.2,
        yPosition: '0%',
        opacity: 1.0,
      },
    ],
    []
  );

  // Setup parallax scroll effect
  useEffect(() => {
    if (!containerRef.current) return;

    // Create ScrollTrigger for the container
    const scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: `+=${window.innerHeight * 2}`, // 2x viewport height for scroll range
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;

        // Animate each mountain layer based on scroll progress
        mountainLayers.forEach((layer) => {
          const element = document.getElementById(`mountain-${layer.id}`);
          if (!element) return;

          // Calculate parallax offset (mountains move down as we scroll)
          const offset = self.progress * layer.speed * 100;

          gsap.to(element, {
            y: offset,
            duration: 0.1,
            ease: 'none',
          });
        });
      },
    });

    return () => {
      scrollTrigger.kill();
    };
  }, [mountainLayers]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden"
      >
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, #0a1128 0%, #1c2541 40%, #3a506b 100%)',
            zIndex: 0,
          }}
        />

        {/* Mountain Layers */}
        {mountainLayers.map((layer) => (
          <div
            key={layer.id}
            id={`mountain-${layer.id}`}
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              zIndex: layer.zIndex,
              opacity: layer.opacity,
              bottom: layer.yPosition,
              width: '100%',
              height: 'auto',
              maxWidth: '1400px',
              transform: `translateX(-50%) scale(${layer.scale})`,
            }}
          >
            <img
              src={layer.src}
              alt=""
              className="w-full h-auto object-contain"
              style={{
                display: 'block',
                objectPosition: 'bottom center',
              }}
            />
          </div>
        ))}

        {/* Cloud Overlay (reduced to 2-3 clouds) */}
        <CloudOverlay
          cloudCount={3}
          scrollProgress={scrollProgressRef.current}
        />

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
          {children}
        </div>
      </div>
    </>
  );
}
