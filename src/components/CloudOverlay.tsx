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

interface MagicalParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  phase: number;
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
  const [particles, setParticles] = useState<MagicalParticle[]>([]);

  // ✨ MYSTICAL DREAMY CLOUD SYSTEM - 3 ethereal layers with soft glow
  // Layer 1 (Farthest): 0.3x speed, softest glow
  // Layer 2 (Mid): 0.6x speed, medium glow
  // Layer 3 (Nearest): 1.0x speed, brightest highlights
  useEffect(() => {
    const cloudLayers: CloudLayer[] = [];
    const layerSpeeds = [0.3, 0.6, 1.0]; // Parallax multipliers (farthest to nearest)
    const layerOpacities = [0.55, 0.70, 0.85]; // INCREASED for dreamy ethereal visibility
    const layerScales = [2.0, 1.6, 1.2]; // LARGER for more atmospheric presence

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

    // ✨ MYSTICAL PARTICLES - Floating magical orbs
    const magicalParticles: MagicalParticle[] = [];
    for (let i = 0; i < 15; i++) {
      magicalParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 60 + 20, // Upper portion of screen
        size: 2 + Math.random() * 4, // 2-6px
        opacity: 0.3 + Math.random() * 0.4, // 0.3-0.7
        speed: 0.15 + Math.random() * 0.25, // Varied speeds
        phase: Math.random() * Math.PI * 2, // Random starting phase
      });
    }
    setParticles(magicalParticles);

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

  // ✨ Animate magical particles with floating motion
  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    particles.forEach((particle) => {
      const particleElement = document.getElementById(`particle-${particle.id}`);
      if (!particleElement) return;

      // Floating animation: gentle vertical drift + horizontal sway
      const time = scrollProgress * 100 + particle.phase;
      const floatY = Math.sin(time * particle.speed) * 20; // Vertical float
      const swayX = Math.cos(time * particle.speed * 0.7) * 15; // Horizontal sway

      // Fade out as we scroll
      const fadeOpacity = Math.max(0, particle.opacity * (1 - scrollProgress * 1.2));

      gsap.to(particleElement, {
        x: swayX,
        y: floatY,
        opacity: fadeOpacity,
        duration: 0.1,
        ease: 'none',
      });
    });
  }, [scrollProgress, particles, isLoaded]);

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
              mixBlendMode: 'screen', // MYSTICAL: Screen blend for ethereal glow effect
              filter: 'brightness(0.85) contrast(1.1) saturate(0.85) blur(1px)', // Softer, dreamier
            }}
            onError={(e) => {
              // Hide clouds that fail to load
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Soft purple/lavender glow overlay for mystical atmosphere */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(180, 160, 220, 0.25) 0%, rgba(150, 140, 200, 0.15) 50%, transparent 75%)',
              mixBlendMode: 'soft-light',
            }}
          />
        </div>
      ))}

      {/* ✨ MYSTICAL PARTICLES - Floating magical light orbs */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          id={`particle-${particle.id}`}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
          }}
        >
          {/* Particle core */}
          <div
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(200, 180, 255, 0.6) 50%, transparent 100%)',
              boxShadow: '0 0 8px rgba(220, 200, 255, 0.6), 0 0 16px rgba(180, 160, 255, 0.3)',
            }}
          />
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              transform: 'scale(2.5)',
              background: 'radial-gradient(circle, rgba(200, 180, 255, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      ))}
    </div>
  );
}
