'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CloudLayer {
  id: number;
  src: string;
  x: number;
  y: number;
  scale: number;
  speed: number; // Parallax speed multiplier
  opacity: number;
}

interface CloudOverlayProps {
  cloudCount?: number;
  cloudsPath?: string;
  scrollProgress?: number;
}

export default function CloudOverlay({
  cloudCount = 3, // Reduced from 15 to 3
  cloudsPath = '/assets/clouds',
  scrollProgress = 0,
}: CloudOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clouds, setClouds] = useState<CloudLayer[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ✨ MULTI-LAYER CLOUD SYSTEM - 3 distinct layers per ASSET_SPEC_SCENE1_MOUNTAIN.md
  // Layer 1 (Farthest): 0.3x speed, lowest opacity
  // Layer 2 (Mid): 0.6x speed, medium opacity
  // Layer 3 (Nearest): 1.0x speed, highest opacity
  useEffect(() => {
    const cloudLayers: CloudLayer[] = [];
    const layerSpeeds = [0.3, 0.6, 1.0]; // Parallax multipliers (farthest to nearest)
    const layerOpacities = [0.45, 0.60, 0.75]; // INCREASED for better visibility (was 0.35, 0.45, 0.55)
    const layerScales = [1.8, 1.4, 1.0]; // LARGER clouds for more atmospheric presence

    for (let i = 1; i <= cloudCount; i++) {
      const frameNumber = String(i).padStart(2, '0');
      const layerIndex = (i - 1) % 3; // Cycle through 3 layers

      cloudLayers.push({
        id: i,
        src: `${cloudsPath}/${frameNumber}.png`,
        x: Math.random() * 140 - 70, // Wider spread: -70% to 70%
        y: Math.random() * 40 - 5, // Upper 40% of frame per spec
        scale: layerScales[layerIndex] * (0.9 + Math.random() * 0.2), // Slight variation
        speed: layerSpeeds[layerIndex],
        opacity: layerOpacities[layerIndex] * (0.85 + Math.random() * 0.3), // Variation
      });
    }

    setClouds(cloudLayers);
    setIsLoaded(true);
  }, [cloudCount, cloudsPath]);

  // Animate clouds based on scroll progress
  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    clouds.forEach((cloud) => {
      const cloudElement = document.getElementById(`cloud-${cloud.id}`);
      if (!cloudElement) return;

      // Calculate parallax offset
      const parallaxOffset = scrollProgress * cloud.speed * 100;

      // Fade out clouds as we progress
      const fadeOpacity = Math.max(0, cloud.opacity * (1 - scrollProgress * 1.5));

      // Apply transformations
      gsap.to(cloudElement, {
        y: parallaxOffset,
        opacity: fadeOpacity,
        duration: 0.1,
        ease: 'none',
      });
    });
  }, [scrollProgress, clouds, isLoaded]);

  if (!isLoaded) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          id={`cloud-${cloud.id}`}
          className="absolute"
          style={{
            left: `${50 + cloud.x}%`,
            top: `${50 + cloud.y}%`,
            transform: `translate(-50%, -50%) scale(${cloud.scale})`,
            opacity: cloud.opacity,
            width: '400px',
            height: '400px',
          }}
        >
          <img
            src={cloud.src}
            alt=""
            className="w-full h-full object-contain"
            style={{
              mixBlendMode: 'multiply', // Changed from 'normal' - darkens and integrates better
              filter: 'brightness(0.35) contrast(1.3) saturate(0.7)', // MUCH darker, more contrast
              // Dark navy tint applied via background overlay below
            }}
            onError={(e) => {
              // Hide clouds that fail to load
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Dark navy overlay for proper atmospheric color */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(42, 58, 74, 0.8) 0%, rgba(42, 58, 74, 0.6) 50%, transparent 75%)',
              mixBlendMode: 'multiply',
            }}
          />
        </div>
      ))}
    </div>
  );
}
