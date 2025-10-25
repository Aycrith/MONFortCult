'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { SceneTone } from '../MenuPanel';

/**
 * ForestScene (Scene 6) - NOW A CANVAS LAYER
 *
 * Lush forest background with god rays and sustainability/CSR content.
 * Features:
 * - Static forest background image
 * - Animated god ray particles (light shafts)
 * - ESG Interactive Tabs (Environmental, Social, Governance)
 * - Text sections that appear based on scroll progress
 *
 * ARCHITECTURAL NOTE:
 * This component NO LONGER creates its own ScrollTrigger with pin: true.
 * It receives progress from MasterScrollContainer and updates accordingly.
 * Content sections fade in/out based on progress milestones.
 */

interface ForestSceneProps {
  progress: number; // Scene-local progress (0-1)
  opacity: number; // Scene opacity for crossfading (0-1)
  isVisible: boolean; // Whether scene is currently visible
  tone: SceneTone;
}

type ESGCategory = 'environmental' | 'social' | 'governance';

interface ESGIcon {
  label: string;
  icon: string; // Emoji or icon character for now
}

const ESG_DATA: Record<ESGCategory, ESGIcon[]> = {
  environmental: [
    { label: 'Clean Energy', icon: 'ΓÜí' },
    { label: 'Climate Change', icon: '≡ƒîì' },
    { label: 'Renewable Resources', icon: 'ΓÖ╗∩╕Å' },
    { label: 'Carbon Reduction', icon: '≡ƒî▒' },
    { label: 'Sustainability', icon: '≡ƒìâ' },
  ],
  social: [
    { label: 'Community Support', icon: '≡ƒñ¥' },
    { label: 'Employee Wellbeing', icon: '≡ƒÆ╝' },
    { label: 'Diversity & Inclusion', icon: '≡ƒîê' },
    { label: 'Health & Safety', icon: '≡ƒ¢í∩╕Å' },
    { label: 'Education', icon: '≡ƒôÜ' },
  ],
  governance: [
    { label: 'Transparency', icon: '≡ƒôè' },
    { label: 'Ethics & Compliance', icon: 'ΓÜû∩╕Å' },
    { label: 'Risk Management', icon: '≡ƒÄ»' },
    { label: 'Accountability', icon: 'Γ£ô' },
    { label: 'Board Oversight', icon: '≡ƒæÑ' },
  ],
};

type ForestTonePreset = {
  brightness: number;
  overlay: { background: string; opacity: number };
  vignette: { background: string; opacity: number };
  rayGradient: string;
  dustColor: string;
};

const FOREST_TONE_PRESETS: Record<SceneTone, ForestTonePreset> = {
  dawn: {
    brightness: 0.68,
    overlay: {
      background:
        'linear-gradient(180deg, rgba(106,82,54,0.36) 0%, rgba(72,96,76,0.74) 55%, rgba(46,64,54,0.86) 100%)',
      opacity: 0.85,
    },
    vignette: {
      background: 'radial-gradient(circle at 45% 0%, rgba(255,214,164,0.38) 0%, rgba(33,46,39,0.78) 70%)',
      opacity: 0.9,
    },
    rayGradient: 'linear-gradient(180deg, rgba(242,206,153,0) 0%, rgba(242,206,153,0.4) 45%, rgba(242,206,153,0) 100%)',
    dustColor: 'rgba(242,206,153,0.55)',
  },
  day: {
    brightness: 0.78,
    overlay: {
      background:
        'linear-gradient(180deg, rgba(124,178,139,0.28) 0%, rgba(66,112,84,0.68) 58%, rgba(42,74,56,0.8) 100%)',
      opacity: 0.82,
    },
    vignette: {
      background: 'radial-gradient(circle at 50% 0%, rgba(168,224,186,0.24) 0%, rgba(34,52,40,0.7) 72%)',
      opacity: 0.85,
    },
    rayGradient: 'linear-gradient(180deg, rgba(176,226,190,0) 0%, rgba(176,226,190,0.34) 45%, rgba(176,226,190,0) 100%)',
    dustColor: 'rgba(176,226,190,0.48)',
  },
  dusk: {
    brightness: 0.52,
    overlay: {
      background:
        'linear-gradient(180deg, rgba(54,94,130,0.32) 0%, rgba(30,52,74,0.78) 60%, rgba(18,32,48,0.9) 100%)',
      opacity: 0.88,
    },
    vignette: {
      background: 'radial-gradient(circle at 42% 0%, rgba(116,164,210,0.32) 0%, rgba(14,24,36,0.82) 72%)',
      opacity: 0.92,
    },
    rayGradient: 'linear-gradient(180deg, rgba(126,182,226,0) 0%, rgba(126,182,226,0.38) 45%, rgba(126,182,226,0) 100%)',
    dustColor: 'rgba(126,182,226,0.45)',
  },
  night: {
    brightness: 0.44,
    overlay: {
      background:
        'linear-gradient(180deg, rgba(42,68,102,0.4) 0%, rgba(18,36,60,0.84) 58%, rgba(10,22,40,0.95) 100%)',
      opacity: 0.92,
    },
    vignette: {
      background: 'radial-gradient(circle at 50% 0%, rgba(96,150,204,0.3) 0%, rgba(6,12,20,0.88) 74%)',
      opacity: 0.96,
    },
    rayGradient: 'linear-gradient(180deg, rgba(106,164,226,0) 0%, rgba(106,164,226,0.36) 45%, rgba(106,164,226,0) 100%)',
    dustColor: 'rgba(110,174,226,0.42)',
  },
};

export default function ForestScene({ progress, opacity, isVisible, tone }: ForestSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const photoStripRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<ESGCategory>('environmental');
  const [godRays, setGodRays] = useState<Array<{ left: string; delay: number; duration: number }>>([]);
  const [dustParticles, setDustParticles] = useState<
    Array<{
      left: string;
      top: string;
      size: number;
      duration: number;
      delay: number;
      opacity: number;
    }>
  >([]);

  const palette = FOREST_TONE_PRESETS[tone];

  useEffect(() => {
    // Generate random god ray particles
    const rays = Array.from({ length: 8 }, () => ({
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }));
    setGodRays(rays);

    // Generate random dust mote particles (more particles for organic feel)
    const particles = Array.from({ length: 30 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 3, // 1-4px
      duration: 4 + Math.random() * 6, // 4-10s float duration
      delay: Math.random() * 5,
      opacity: 0.2 + Math.random() * 0.4, // 0.2-0.6 opacity
    }));
    setDustParticles(particles);
  }, []);

  // Handle progress-based animations and content visibility
  useEffect(() => {
    if (!containerRef.current || !isVisible) return;

    const container = containerRef.current;
    const background = backgroundRef.current;
    const photoStrip = photoStripRef.current;

    // Smooth fade-in at scene start (crossfade from globe)
    if (progress < 0.15) {
      const fadeInProgress = progress / 0.15;
      if (container) {
        container.style.opacity = String(fadeInProgress * opacity);
      }
    } else if (progress > 0.85) {
      // Background fade-out as user scrolls toward footer (last 15% of scene)
      const fadeOutProgress = (progress - 0.85) / 0.15;
      if (container) {
        container.style.opacity = String((1 - fadeOutProgress) * opacity);
      }
      if (background) {
        background.style.opacity = String(1 - fadeOutProgress);
      }
    } else {
      if (container) {
        container.style.opacity = String(opacity);
      }
      if (background) {
        background.style.opacity = '1';
      }
    }

    // CSR Photo strip fade-in animation at 70% progress
    if (photoStrip && progress > 0.7) {
      const photos = photoStrip.querySelectorAll('.csr-photo');
      const photoProgress = (progress - 0.7) / 0.3; // 0ΓåÆ1 over last 30%

      photos.forEach((photo, index) => {
        const staggerDelay = index * 0.05;
        const photoStart = staggerDelay;
        const photoEnd = photoStart + 0.15;

        if (photoProgress >= photoStart && photoProgress <= photoEnd) {
          const localProgress = (photoProgress - photoStart) / (photoEnd - photoStart);
          gsap.set(photo, {
            opacity: localProgress,
            y: 40 - localProgress * 40,
          });
        } else if (photoProgress > photoEnd) {
          gsap.set(photo, { opacity: 1, y: 0 });
        } else {
          gsap.set(photo, { opacity: 0, y: 40 });
        }
      });
    }
  }, [progress, opacity, isVisible]);

  return (
    <div ref={containerRef} className="relative w-full min-h-screen">
      {/* Forest Background with God Rays */}
      {/* Using 4K 16:9 upscaled PNG for maximum quality */}
      <div
        ref={backgroundRef}
        className="fixed top-0 left-0 w-full h-screen bg-cover bg-center -z-10"
        data-testid="forest-bg"
        style={{
          backgroundImage: 'url(/assets/backgrounds/Asset_6_Forest_Background16x9_Upscale.png)',
          filter: `brightness(${palette.brightness}) blur(8px)`, // tone-aware depth-of-field effect
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          data-testid="forest-overlay"
          style={{ background: palette.overlay.background, opacity: palette.overlay.opacity }}
        />
        <div
          className="absolute inset-0 pointer-events-none mix-blend-soft-light"
          data-testid="forest-vignette"
          style={{ background: palette.vignette.background, opacity: palette.vignette.opacity }}
        />
        {/* God Ray Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {godRays.map((ray, index) => (
            <div
              key={`ray-${index}`}
              className="absolute top-0 w-1 h-full animate-pulse"
              style={{
                left: ray.left,
                animationDelay: `${ray.delay}s`,
                animationDuration: `${ray.duration}s`,
                filter: 'blur(2px)',
                background: palette.rayGradient,
              }}
            />
          ))}
        </div>

        {/* Floating Dust Motes/Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {dustParticles.map((particle, index) => (
            <div
              key={`dust-${index}`}
              className="absolute rounded-full"
              style={{
                left: particle.left,
                top: particle.top,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                animation: `dustFloat ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
                filter: 'blur(0.5px)',
                backgroundColor: palette.dustColor,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm">
        {/* Ethics & Compliance Framework */}
        <section className="py-24 px-8">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#374851] mb-12 tracking-widest font-light uppercase text-center">
              Ethics & Compliance Framework
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-[#929ea6] text-lg leading-relaxed mb-6">
                At Montfort, we are committed to the highest standards of ethics and compliance. Our framework ensures transparency, accountability, and integrity in all our operations across global markets.
              </p>
              <p className="text-[#929ea6] text-lg leading-relaxed mb-8">
                We adhere to international regulations and best practices, fostering a culture of responsibility and sustainable business conduct. Our compliance programs are regularly audited and updated to reflect evolving global standards.
              </p>

              {/* Compliance Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-lg">
                  <div className="text-3xl mb-3">ΓÜû∩╕Å</div>
                  <h3 className="text-[#374851] font-medium mb-2 tracking-wide">Regulatory Compliance</h3>
                  <p className="text-[#929ea6] text-sm">Full adherence to international trade laws and regulations</p>
                </div>
                <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-lg">
                  <div className="text-3xl mb-3">≡ƒöÆ</div>
                  <h3 className="text-[#374851] font-medium mb-2 tracking-wide">Data Protection</h3>
                  <p className="text-[#929ea6] text-sm">Stringent security measures for client and corporate data</p>
                </div>
                <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-lg">
                  <div className="text-3xl mb-3">≡ƒÄ»</div>
                  <h3 className="text-[#374851] font-medium mb-2 tracking-wide">Risk Management</h3>
                  <p className="text-[#929ea6] text-sm">Proactive identification and mitigation of operational risks</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Delivering Sustainable Energy Solutions */}
        <section className="py-24 px-8 bg-[#f8f9fa]">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#374851] mb-12 tracking-widest font-light uppercase text-center">
              Delivering Sustainable Energy Solutions
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-[#929ea6] text-lg leading-relaxed text-center mb-8">
                As the global energy landscape evolves, Montfort is committed to supporting the transition toward cleaner, more sustainable energy sources. We actively invest in renewable energy projects and promote responsible practices throughout our supply chain.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div className="text-center">
                  <div className="text-4xl text-[#82b3c9] mb-2">≡ƒî₧</div>
                  <div className="text-sm text-[#929ea6] tracking-wide">Solar Energy</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl text-[#82b3c9] mb-2">≡ƒÆ¿</div>
                  <div className="text-sm text-[#929ea6] tracking-wide">Wind Power</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl text-[#82b3c9] mb-2">ΓÜí</div>
                  <div className="text-sm text-[#929ea6] tracking-wide">Clean Tech</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl text-[#82b3c9] mb-2">≡ƒöï</div>
                  <div className="text-sm text-[#929ea6] tracking-wide">Energy Storage</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ESG Interactive Tabs */}
        <section className="py-24 px-8">
          <div className="container mx-auto max-w-6xl">
            {/* Tab Navigation */}
            <div className="flex justify-center gap-8 mb-16">
              {(['environmental', 'social', 'governance'] as ESGCategory[]).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`text-sm md:text-base tracking-widest uppercase font-medium transition-all duration-300 pb-2 ${
                    activeTab === category
                      ? 'text-[#82b3c9] border-b-2 border-[#82b3c9]'
                      : 'text-[#929ea6] hover:text-[#374851]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-4xl mx-auto">
              {ESG_DATA[activeTab].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-3 transition-all duration-500"
                  style={{
                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Circular Icon */}
                  <div className="w-20 h-20 rounded-full bg-white border-2 border-[#82b3c9]/30 flex items-center justify-center text-4xl shadow-lg backdrop-blur-sm">
                    {item.icon}
                  </div>

                  {/* Label */}
                  <span className="text-xs md:text-sm text-[#374851] text-center tracking-wide">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commitment to Equality */}
        <section className="py-24 px-8 bg-[#f8f9fa]">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#374851] mb-12 tracking-widest font-light uppercase text-center md:text-left">
              Commitment to Equality
            </h2>
            <div className="max-w-4xl">
              <p className="text-[#929ea6] text-lg leading-relaxed mb-6">
                We believe in fostering an inclusive workplace that values diversity and promotes equal opportunities for all. Our commitment extends beyond our organization to the communities we serve.
              </p>
              <p className="text-[#929ea6] text-lg leading-relaxed mb-8">
                Through fair practices and transparent policies, we strive to create an environment where everyone can thrive and contribute to our shared success.
              </p>

              {/* Equality Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 bg-white/60 backdrop-blur-sm p-8 rounded-lg">
                <div className="text-center md:text-left">
                  <div className="text-3xl font-light text-[#82b3c9] mb-1">40%</div>
                  <div className="text-sm text-[#929ea6] tracking-wide">Women in Leadership</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-3xl font-light text-[#82b3c9] mb-1">25+</div>
                  <div className="text-sm text-[#929ea6] tracking-wide">Nationalities</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-3xl font-light text-[#82b3c9] mb-1">100%</div>
                  <div className="text-sm text-[#929ea6] tracking-wide">Equal Pay Commitment</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pledge to Corporate Social Responsibility */}
        <section className="py-24 px-8">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#374851] mb-12 tracking-widest font-light uppercase text-center md:text-left">
              Pledge to Corporate Social Responsibility
            </h2>
            <div className="max-w-4xl mb-12">
              <p className="text-[#929ea6] text-lg leading-relaxed mb-6">
                Our commitment to social responsibility drives every decision we make. We invest in communities, support local initiatives, and work towards creating positive, lasting impact.
              </p>
              <p className="text-[#929ea6] text-lg leading-relaxed mb-8">
                From education programs to environmental conservation, we partner with organizations that share our vision for a sustainable and equitable future.
              </p>

              {/* CSR Initiatives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 mb-16">
                <div className="flex gap-4 items-start bg-white/50 backdrop-blur-sm p-6 rounded-lg">
                  <div className="text-3xl flex-shrink-0">≡ƒôÜ</div>
                  <div>
                    <h3 className="text-[#374851] font-medium mb-2 tracking-wide">Education & Training</h3>
                    <p className="text-[#929ea6] text-sm leading-relaxed">Supporting youth education programs and vocational training in energy sector skills across our operating regions.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-white/50 backdrop-blur-sm p-6 rounded-lg">
                  <div className="text-3xl flex-shrink-0">≡ƒî│</div>
                  <div>
                    <h3 className="text-[#374851] font-medium mb-2 tracking-wide">Conservation Projects</h3>
                    <p className="text-[#929ea6] text-sm leading-relaxed">Active participation in reforestation initiatives and biodiversity protection programs in partnership with local NGOs.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-white/50 backdrop-blur-sm p-6 rounded-lg">
                  <div className="text-3xl flex-shrink-0">Γ¥ñ∩╕Å</div>
                  <div>
                    <h3 className="text-[#374851] font-medium mb-2 tracking-wide">Community Health</h3>
                    <p className="text-[#929ea6] text-sm leading-relaxed">Healthcare infrastructure support and medical outreach programs in underserved communities where we operate.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-white/50 backdrop-blur-sm p-6 rounded-lg">
                  <div className="text-3xl flex-shrink-0">≡ƒÆ╝</div>
                  <div>
                    <h3 className="text-[#374851] font-medium mb-2 tracking-wide">Local Employment</h3>
                    <p className="text-[#929ea6] text-sm leading-relaxed">Prioritizing local hiring and supplier partnerships to strengthen regional economies and create sustainable livelihoods.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Strip - CSR & Community Impact */}
            <div ref={photoStripRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              {/* Photo 1: Community & Environment */}
              <div className="csr-photo h-64 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 relative">
                <img
                  src="/assets/atmosphere/45.jpg"
                  alt="Community Development"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                  <span className="text-white text-sm font-light tracking-wide">
                    Community Development
                  </span>
                </div>
              </div>

              {/* Photo 2: Environmental Stewardship */}
              <div className="csr-photo h-64 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 relative">
                <img
                  src="/assets/atmosphere/78.jpg"
                  alt="Environmental Impact"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                  <span className="text-white text-sm font-light tracking-wide">
                    Environmental Impact
                  </span>
                </div>
              </div>

              {/* Photo 3: Sustainable Initiatives */}
              <div className="csr-photo h-64 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 relative">
                <img
                  src="/assets/atmosphere/120.jpg"
                  alt="Sustainable Progress"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                  <span className="text-white text-sm font-light tracking-wide">
                    Sustainable Progress
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dustFloat {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(15px, -20px) rotate(90deg);
          }
          50% {
            transform: translate(-10px, -40px) rotate(180deg);
          }
          75% {
            transform: translate(20px, -60px) rotate(270deg);
          }
          100% {
            transform: translate(0, -80px) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
