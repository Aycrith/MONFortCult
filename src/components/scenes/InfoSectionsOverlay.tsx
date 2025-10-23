'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface InfoSectionsOverlayProps {
  progress: number; // Scene-local progress (0-1)
  opacity: number; // Scene opacity for crossfading (0-1)
  isVisible: boolean; // Whether scene is currently visible
}

/**
 * InfoSectionsOverlay (Scene 3)
 *
 * "Who We Are" and "What We Do" informational sections.
 * Now rendered as an overlay that fades in/out based on scroll progress.
 *
 * Per Visual Breakdown:
 * - Appears after text morph scene
 * - Clean white background
 * - Sequential fade-in animations for content
 * - Crossfades to ship scene
 *
 * ARCHITECTURAL NOTE:
 * This is now an overlay component that receives progress from MasterScrollContainer.
 * No independent ScrollTrigger or traditional scrolling.
 */
export default function InfoSectionsOverlay({ progress, opacity, isVisible }: InfoSectionsOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const whoWeAreRef = useRef<HTMLDivElement>(null);
  const whatWeDoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !isVisible) return;

    const container = containerRef.current;
    const whoWeAre = whoWeAreRef.current;
    const whatWeDo = whatWeDoRef.current;

    // Control visibility based on progress within this scene
    // Progress 0-0.5: "Who We Are" visible
    // Progress 0.4-1.0: "What We Do" visible (0.1 overlap for smooth transition)

    if (whoWeAre) {
      if (progress < 0.5) {
        const sectionProgress = progress / 0.5; // 0→1 as progress goes 0→0.5
        gsap.set(whoWeAre, {
          opacity: Math.min(sectionProgress * 2, 1), // Quick fade in
          y: 20 - sectionProgress * 20, // Slide up effect
        });
      } else {
        // Fade out after 50%
        const fadeOut = 1 - ((progress - 0.5) / 0.2); // Fade over 0.5-0.7
        gsap.set(whoWeAre, {
          opacity: Math.max(0, fadeOut),
          y: -20 * (1 - fadeOut), // Continue sliding up as it fades
        });
      }
    }

    if (whatWeDo) {
      if (progress < 0.4) {
        // Hidden before 40%
        gsap.set(whatWeDo, { opacity: 0, y: 40 });
      } else {
        const sectionProgress = (progress - 0.4) / 0.6; // 0→1 as progress goes 0.4→1.0
        gsap.set(whatWeDo, {
          opacity: Math.min(sectionProgress * 2, 1), // Quick fade in
          y: 40 - sectionProgress * 40, // Slide up effect
        });
      }
    }

    // Apply overall container opacity
    gsap.set(container, { opacity });
  }, [progress, opacity, isVisible]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{
        background: 'white',
        opacity: 0,
        visibility: isVisible ? 'visible' : 'hidden',
        zIndex: 10,
      }}
    >
      {/* Who We Are Section */}
      <div
        ref={whoWeAreRef}
        className="absolute inset-0 flex items-center justify-center px-8"
        style={{ opacity: 0 }}
      >
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#374851] mb-12 tracking-widest font-light uppercase text-center md:text-left">
            Montfort is a global commodity trading and asset investment company.
          </h2>
          <div className="max-w-3xl">
            <p className="text-[#929ea6] text-lg leading-relaxed mb-8">
              We trade, refine, store, and transport energy and commodities. We also invest in related assets and provide innovative services with integrity and efficiency to create long-term value for our clients.
            </p>
            <p className="text-[#929ea6] text-lg leading-relaxed mb-12">
              Founded with a vision to become a leading player in the global energy and commodity markets, Montfort has established itself as a trusted partner across three continents. Our integrated approach combines deep market expertise with cutting-edge technology and sustainable practices.
            </p>

            {/* Key Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 mb-16">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-light text-[#6194b0] mb-2">3</div>
                <div className="text-sm text-[#929ea6] tracking-wider uppercase">Global Hubs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-light text-[#6194b0] mb-2">4</div>
                <div className="text-sm text-[#929ea6] tracking-wider uppercase">Divisions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-light text-[#6194b0] mb-2">50+</div>
                <div className="text-sm text-[#929ea6] tracking-wider uppercase">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-light text-[#6194b0] mb-2">24/7</div>
                <div className="text-sm text-[#929ea6] tracking-wider uppercase">Operations</div>
              </div>
            </div>

            <p className="text-[#929ea6] text-lg leading-relaxed">
              Operating from strategic locations in Switzerland, Dubai, and Singapore, we maintain a constant pulse on global markets. Our teams work around the clock to identify opportunities, manage risks, and deliver exceptional value to our stakeholders.
            </p>
          </div>
        </div>
      </div>

      {/* What We Do Section */}
      <div
        ref={whatWeDoRef}
        className="absolute inset-0 flex items-center justify-center px-8"
        style={{ opacity: 0, background: '#f8f9fa' }}
      >
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#374851] mb-12 tracking-widest font-light uppercase">
            We provide energy solutions with integrity and efficiency through our different business divisions.
          </h2>
          <div className="max-w-4xl mb-16">
            <p className="text-[#929ea6] text-lg leading-relaxed mb-8">
              Montfort's interlinked divisions complement each other, providing integrated services that leverage their combined expertise. This synergy enhances our operational efficiency, enabling us to drive collective success in the global market.
            </p>
            <p className="text-[#929ea6] text-lg leading-relaxed">
              Each division operates with autonomy while benefiting from shared infrastructure, market intelligence, and strategic coordination. This unique structure allows us to respond rapidly to market changes while maintaining the specialized focus required for excellence in each domain.
            </p>
          </div>

          {/* Division Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Montfort Trading */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl text-[#374851] tracking-widest font-light uppercase">
                  Montfort Trading
                </h3>
                <div className="w-12 h-12 bg-[#6194b0]/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <p className="text-[#929ea6] leading-relaxed mb-4">
                Physical commodity trading across global markets with a focus on energy products, refined petroleum, and base metals.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 bg-[#6194b0]/10 text-[#374851] rounded-full">Global Reach</span>
                <span className="text-xs px-3 py-1 bg-[#6194b0]/10 text-[#374851] rounded-full">Innovation</span>
                <span className="text-xs px-3 py-1 bg-[#6194b0]/10 text-[#374851] rounded-full">Efficiency</span>
              </div>
            </div>

            {/* Montfort Capital */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl text-[#374851] tracking-widest font-light uppercase">
                  Montfort Capital
                </h3>
                <div className="w-12 h-12 bg-[#6194b0]/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              <p className="text-[#929ea6] leading-relaxed mb-4">
                Strategic investments in energy infrastructure, storage facilities, and commodity-related assets that maximize long-term value.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 bg-[#6194b0]/10 text-[#374851] rounded-full">Asset Management</span>
                <span className="text-xs px-3 py-1 bg-[#6194b0]/10 text-[#374851] rounded-full">Growth</span>
                <span className="text-xs px-3 py-1 bg-[#6194b0]/10 text-[#374851] rounded-full">Value Creation</span>
              </div>
            </div>

            {/* Montfort Maritime */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl text-[#374851] tracking-widest font-light uppercase">
                  Montfort Maritime
                </h3>
                <div className="w-12 h-12 bg-[#6194b0]/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚢</span>
                </div>
              </div>
              <p className="text-[#929ea6] leading-relaxed mb-4">
                Integrated maritime logistics and transportation services ensuring reliable delivery of energy products across global trade routes.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 bg-[#6194b0]/10 text-[#374851] rounded-full">Logistics</span>
                <span className="text-xs px-3 py-1 bg-[#6194b0]/10 text-[#374851] rounded-full">Reliability</span>
                <span className="text-xs px-3 py-1 bg-[#6194b0]/10 text-[#374851] rounded-full">Energy Delivery</span>
              </div>
            </div>

            {/* Fort Energy */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl text-[#374851] tracking-widest font-light uppercase">
                  Fort Energy
                </h3>
                <div className="w-12 h-12 bg-[#6194b0]/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
              <p className="text-[#929ea6] leading-relaxed mb-4">
                Forward-thinking energy investments focusing on sustainable solutions and innovative technologies for the energy transition.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 bg-[#6194b0]/10 text-[#374851] rounded-full">Sustainability</span>
                <span className="text-xs px-3 py-1 bg-[#6194b0]/10 text-[#374851] rounded-full">Innovation</span>
                <span className="text-xs px-3 py-1 bg-[#6194b0]/10 text-[#374851] rounded-full">Future Energy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
