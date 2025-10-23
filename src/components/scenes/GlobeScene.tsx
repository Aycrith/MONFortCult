'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * GlobeScene (Scene 5) - NOW A CANVAS LAYER
 *
 * Earth from space view focused on Europe/Middle East region.
 * Features:
 * - Rotating Three.js sphere with Earth texture
 * - Semi-transparent cloud layer
 * - Glowing dots for trade hubs (Geneva, Dubai, Singapore)
 * - Location labels with fade-in animation
 *
 * ARCHITECTURAL NOTE:
 * This component NO LONGER creates its own ScrollTrigger with pin: true.
 * It receives progress from MasterScrollContainer and updates accordingly.
 */

interface TradeHub {
  name: string;
  lat: number;
  lon: number;
  x: number;
  y: number;
}

interface GlobeSceneProps {
  progress: number; // Scene-local progress (0-1)
  opacity: number; // Scene opacity for crossfading (0-1)
  isVisible: boolean; // Whether scene is currently visible
}

export default function GlobeScene({ progress, opacity, isVisible }: GlobeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const markerMeshesRef = useRef<THREE.Mesh[]>([]);

  const [markersVisible, setMarkersVisible] = useState(false);

  // Trade hub locations (latitude, longitude)
  const tradeHubs: TradeHub[] = [
    { name: 'SWITZERLAND', lat: 46.2044, lon: 6.1432, x: 0, y: 0 }, // Geneva
    { name: 'DUBAI', lat: 25.2048, lon: 55.2708, x: 0, y: 0 }, // Dubai
    { name: 'SINGAPORE', lat: 1.3521, lon: 103.8198, x: 0, y: 0 }, // Singapore
  ];

  // Convert lat/lon to 3D coordinates on sphere surface
  const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180); // Latitude to phi (radians)
    const theta = (lon + 180) * (Math.PI / 180); // Longitude to theta (radians)

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814); // Deep space blue
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3);
    cameraRef.current = camera;

    // Detect mobile for performance optimizations
    const isMobile = window.innerWidth < 768;

    // Renderer setup with performance optimizations
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: !isMobile, // Disable antialiasing on mobile
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Reduce pixel ratio on mobile for better performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Create Earth sphere
    const globeGeometry = new THREE.SphereGeometry(1, 64, 64);

    // Earth texture using local high-quality world map
    const textureLoader = new THREE.TextureLoader();
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: null,
      emissive: 0x0a0a0a,
      emissiveIntensity: 0.1,
      shininess: 15,
      specular: 0x333333,
    });

    // Load Earth texture (local high-quality world map)
    textureLoader.load(
      '/assets/globe/earth-texture.png',
      (texture) => {
        earthMaterial.map = texture;
        earthMaterial.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.warn('Earth texture loading failed, using fallback:', error);
        // Fallback to upscaled static image
        textureLoader.load(
          '/assets/globe/fallback-upscaled.png',
          (fallbackTexture) => {
            earthMaterial.map = fallbackTexture;
            earthMaterial.needsUpdate = true;
          },
          undefined,
          () => {
            // Final fallback to color
            earthMaterial.color = new THREE.Color(0x2244aa);
            earthMaterial.emissive = new THREE.Color(0x1a3a2a);
          }
        );
      }
    );

    const globe = new THREE.Mesh(globeGeometry, earthMaterial);
    globe.rotation.y = -Math.PI / 6; // Rotate to show Europe/Middle East
    scene.add(globe);
    globeRef.current = globe;

    // Create cloud layer
    const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: null,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
      color: 0xffffff,
    });

    // Load semi-transparent cloud texture (local)
    textureLoader.load(
      '/assets/globe/clouds-texture.png',
      (texture) => {
        cloudMaterial.alphaMap = texture;
        cloudMaterial.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.warn('Cloud texture loading failed:', error);
      }
    );

    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);
    cloudsRef.current = clouds;

    // Create 3D markers on globe surface for trade hubs
    const globeRadius = 1.02; // Slightly above globe surface
    tradeHubs.forEach((hub) => {
      // Convert lat/lon to 3D position
      const position = latLonToVector3(hub.lat, hub.lon, globeRadius);

      // Create glowing marker sphere
      const markerGeometry = new THREE.SphereGeometry(0.015, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff, // Cyan glow
        transparent: true,
        opacity: 0, // Start hidden, will animate in
      });
      const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
      markerMesh.position.copy(position);

      // Add glow effect (point light at marker position)
      const markerLight = new THREE.PointLight(0x00ffff, 0.5, 0.2);
      markerLight.position.copy(position);
      scene.add(markerLight);

      scene.add(markerMesh);
      markerMeshesRef.current.push(markerMesh);
    });

    // Animation loop
    let time = 0;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Slow rotation of Earth
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.001;
      }

      // Cloud layer rotates slightly faster
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += 0.0012;
      }

      // Animate marker pulsing effect
      if (markersVisible) {
        markerMeshesRef.current.forEach((marker, index) => {
          // Pulse animation using sine wave (each marker slightly offset)
          const pulseSpeed = 0.002;
          const pulsePhase = time + index * 0.5; // Offset each marker
          const pulseScale = 1 + Math.sin(pulsePhase * pulseSpeed) * 0.15; // Pulse between 0.85 and 1.15

          if (marker.material instanceof THREE.MeshBasicMaterial && marker.material.opacity > 0) {
            marker.scale.setScalar(pulseScale);
          }
        });
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      globeGeometry.dispose();
      earthMaterial.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
    };
  }, []);

  // Handle progress-based animations
  useEffect(() => {
    if (!containerRef.current || !isVisible) return;

    const container = containerRef.current;

    // Smooth fade-in at scene start (complementing ship scene fade-out)
    if (progress < 0.15) {
      const fadeInProgress = progress / 0.15; // Fade in first 15%
      container.style.opacity = String(fadeInProgress * opacity);
    } else if (progress > 0.85) {
      // Fade out and zoom in effect at end of scene (preparing for forest transition)
      const fadeProgress = (progress - 0.85) / 0.15; // Fade in last 15%
      container.style.opacity = String((1 - fadeProgress * 0.5) * opacity); // Fade to 50% opacity
    } else {
      container.style.opacity = String(opacity);
    }

    // Enhanced zoom effect toward end (zooming into Earth before forest transition)
    if (cameraRef.current) {
      const baseZoom = 3 - progress * 0.5; // Base zoom
      // Dramatic zoom acceleration in final 10% for pronounced forest transition
      const endZoomBoost = progress > 0.9 ? (progress - 0.9) / 0.1 * 2.2 : 0; // Dramatic zoom in final 10%
      cameraRef.current.position.z = baseZoom - endZoomBoost;
    }

    // Animate 3D markers appearing on globe surface after 30% scroll
    if (progress > 0.3) {
      if (!markersVisible) {
        setMarkersVisible(true);
      }

      // Stagger marker fade-in animation
      markerMeshesRef.current.forEach((marker, index) => {
        const markerDelay = index * 0.1; // Stagger each marker
        const markerStart = 0.3 + markerDelay;
        const markerEnd = markerStart + 0.2;

        if (progress >= markerStart && progress <= markerEnd) {
          const markerProgress = (progress - markerStart) / (markerEnd - markerStart);
          if (marker.material instanceof THREE.MeshBasicMaterial) {
            marker.material.opacity = markerProgress;
          }
          // Animate scale for "pop-in" effect
          const scale = 0.5 + markerProgress * 0.5; // Scale from 0.5 to 1.0
          marker.scale.setScalar(scale);
        } else if (progress > markerEnd) {
          if (marker.material instanceof THREE.MeshBasicMaterial) {
            marker.material.opacity = 1;
          }
          marker.scale.setScalar(1);
        }
      });
    }
  }, [progress, opacity, isVisible, markersVisible]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ background: '#000814' }}
    >
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Content Overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-white px-8"
        style={{ zIndex: 10 }}
      >
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-light tracking-widest text-center mb-12 max-w-4xl"
          style={{ fontFamily: '"Josefin Sans", sans-serif' }}
        >
          ESTABLISHED IN THE WORLD'S MAJOR TRADE HUBS
        </h2>

        {/* Trade Hub Markers */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          {tradeHubs.map((hub, index) => (
            <div
              key={hub.name}
              className={`flex items-center gap-3 transition-all duration-700 ${
                markersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{
                transitionDelay: `${index * 200}ms`,
              }}
            >
              {/* Glowing dot */}
              <div className="relative">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-cyan-400 rounded-full blur-md opacity-70" />
              </div>

              {/* Location label */}
              <span className="text-sm md:text-base tracking-widest font-light">
                {hub.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
