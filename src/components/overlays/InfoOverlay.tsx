"use client";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

interface InfoOverlayProps {
  progress: number | null;
  opacity: number;
  isVisible: boolean;
}

const stats = [
  { label: "Global Hubs", value: "3" },
  { label: "Divisions", value: "4" },
  { label: "Countries", value: "50+" },
  { label: "Operations", value: "24/7" },
];

const divisionHighlights = [
  {
    title: "Montfort Trading",
    copy:
      "Physical commodity trading across crude, refined products, and transition fuels with disciplined execution and risk management.",
    tags: ["Global Reach", "Innovation", "Efficient Supply"],
  },
  {
    title: "Montfort Capital",
    copy:
      "Strategic investments in infrastructure, storage, and integrated energy systems that unlock resilient long-term value.",
    tags: ["Asset Growth", "Structured Finance", "Value Creation"],
  },
  {
    title: "Montfort Maritime",
    copy:
      "Integrated maritime capabilities ensuring secure, compliant product movement along critical global routes.",
    tags: ["Logistics", "Fleet", "Compliance"],
  },
  {
    title: "Fort Energy",
    copy:
      "Forward-looking energy ventures accelerating low-carbon innovation, renewables, and technology partnerships.",
    tags: ["Transition", "Partnerships", "Innovation"],
  },
];

const deliveryPillars = [
  {
    phase: "Discovery",
    description: "Market mapping, asset intelligence, and scenario modelling across commodities and geographies.",
  },
  {
    phase: "Execution",
    description: "Coordinated trading, finance, and logistics desks deliver reliable supply with best-in-class governance.",
  },
  {
    phase: "Stewardship",
    description: "Embedded ESG, rigorous compliance, and long-term asset care sustain performance beyond each cycle.",
  },
];

const smoothRangeOpacity = (value: number, start: number, end: number, fade = 0.18) => {
  if (value < start || value > end) return 0;
  if (value < start + fade) return clamp((value - start) / fade);
  if (value > end - fade) return clamp((end - value) / fade);
  return 1;
};

export default function InfoOverlay({ progress, opacity, isVisible }: InfoOverlayProps) {
  if (progress === null) return null;

  const whoOpacity = smoothRangeOpacity(progress, 0, 0.46);
  const whatOpacity = smoothRangeOpacity(progress, 0.28, 0.74);
  const howOpacity = smoothRangeOpacity(progress, 0.58, 1.05);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        visibility: isVisible ? "visible" : "hidden",
        opacity,
        transition: "opacity 0.4s ease",
        background: "linear-gradient(180deg, rgba(255,255,255,0.36) 0%, rgba(240,246,252,0.18) 55%, rgba(228,236,244,0.12) 100%)",
        backdropFilter: "blur(9px)",
        WebkitBackdropFilter: "blur(9px)",
        color: "#374851",
      }}
    >
      <div
        className="absolute inset-0 overflow-hidden px-6 md:px-12 lg:px-20 py-24 md:py-28"
        style={{ pointerEvents: "auto" }}
      >
        <section
          className="max-w-6xl mx-auto"
          style={{
            opacity: whoOpacity,
            transform: `translateY(${(1 - whoOpacity) * 90}px)`,
            transition: "opacity 0.45s ease, transform 0.45s ease",
          }}
        >
          <p className="text-xs tracking-[0.55em] uppercase text-[#7d8c95] mb-6">Who We Are</p>
          <h2 className="text-[38px] md:text-[54px] leading-tight font-light tracking-[0.28em] uppercase mb-8">
            Montfort is a global commodity trading and asset investment group.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#6d7a81] text-lg leading-8">
            <p>
              We trade, refine, store, and transport energy and commodities while investing in the critical infrastructure
              that keeps supply chains moving. Our teams operate from Geneva, Dubai, and Singapore, covering the market
              around the clock with integrated risk and compliance frameworks.
            </p>
            <p>
              Founded with a mandate to blend disciplined execution with long-term stewardship, Montfort has become a
              trusted partner for governments, national energy companies, and industrial counterparts across more than fifty countries.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            {stats.map((item) => (
              <div key={item.label} className="text-center">
                <span className="block text-[40px] md:text-[48px] text-[#82b3c9] font-light mb-2">
                  {item.value}
                </span>
                <span className="text-[11px] tracking-[0.38em] uppercase text-[#819097]">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          className="max-w-6xl mx-auto mt-24"
          style={{
            opacity: whatOpacity,
            transform: `translateY(${(1 - whatOpacity) * 90}px)`,
            transition: "opacity 0.45s ease, transform 0.45s ease",
          }}
        >
          <p className="text-xs tracking-[0.55em] uppercase text-[#7d8c95] mb-6">What We Do</p>
          <h3 className="text-[36px] md:text-[48px] leading-tight font-light tracking-[0.28em] uppercase mb-10">
            Integrated energy solutions across four specialised divisions.
          </h3>
          <p className="text-[#6d7a81] text-lg leading-8 max-w-4xl">
            Each division operates with its own expertise while sharing intelligence, logistics, and governance. Together they
            accelerate reliable supply, structured finance, maritime logistics, and transition-ready investments for our partners.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            {divisionHighlights.map((division) => (
              <div
                key={division.title}
                className="bg-white/90 border border-[#dde4ea] p-8 rounded-3xl shadow-[0_30px_80px_rgba(15,26,46,0.08)]"
              >
                <h4 className="text-sm tracking-[0.4em] uppercase text-[#374851] mb-4">{division.title}</h4>
                <p className="text-[#6d7a81] leading-7 text-sm mb-5">{division.copy}</p>
                <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.32em] text-[#7d8c95]">
                  {division.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-[#82b3c9]/12 border border-[#82b3c9]/30">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className="max-w-6xl mx-auto mt-24"
          style={{
            opacity: howOpacity,
            transform: `translateY(${(1 - howOpacity) * 90}px)`,
            transition: "opacity 0.45s ease, transform 0.45s ease",
          }}
        >
          <p className="text-xs tracking-[0.55em] uppercase text-[#7d8c95] mb-6">How We Deliver</p>
          <h3 className="text-[32px] md:text-[44px] leading-tight font-light tracking-[0.26em] uppercase mb-10">
            A coordinated operating system that connects discovery, execution, and stewardship.
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {deliveryPillars.map((pillar) => (
              <div
                key={pillar.phase}
                className="bg-[#f6f9fb] border border-[#dbe3ea] rounded-3xl p-8 flex flex-col gap-4"
              >
                <span className="text-[11px] tracking-[0.38em] uppercase text-[#7d8c95]">{pillar.phase}</span>
                <p className="text-[#4d5a62] leading-7 text-sm">{pillar.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 text-[#6d7a81] text-sm leading-7">
            <div>
              <h4 className="text-xs tracking-[0.45em] uppercase text-[#7d8c95] mb-3">Governance Pillars</h4>
              <ul className="space-y-2">
                {[
                  "Global trade compliance and real-time risk supervision.",
                  "Dedicated ESG diligence integrated into every investment stage.",
                  "Operational continuity with 24/7 control rooms across three continents.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-[#82b3c9]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs tracking-[0.45em] uppercase text-[#7d8c95] mb-3">Partner Outcomes</h4>
              <ul className="space-y-2">
                {[
                  "Reliable access to diversified energy supply and financing structures.",
                  "Transparency from transaction origination through logistics execution.",
                  "Collaborative teams that embed partner goals into long-term strategies.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-[#82b3c9]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
