"use client";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const esgStacks = {
  environmental: ['Clean Energy Corridors', 'Climate Resilience Projects', 'Renewable Investments', 'Carbon Abatement'],
  social: ['Community Partnerships', 'Workforce Empowerment', 'Inclusive Leadership', 'Health & Safety'],
  governance: ['Ethics & Compliance', 'Transparent Reporting', 'Risk Stewardship', 'Accountability'],
} as const;

const photoStrip = [
  { src: '/assets/atmosphere/45.jpg', label: 'Community Development' },
  { src: '/assets/atmosphere/78.jpg', label: 'Environmental Impact' },
  { src: '/assets/atmosphere/120.jpg', label: 'Sustainable Progress' },
];

interface ForestOverlayProps {
  progress: number | null;
  opacity: number;
  isVisible: boolean;
}

export default function ForestOverlay({ progress, opacity, isVisible }: ForestOverlayProps) {
  if (progress === null) return null;

  const heroOpacity = clamp(progress * 1.8);
  const solutionsOpacity = clamp((progress - 0.18) * 2.1);
  const esgOpacity = clamp((progress - 0.42) * 2.2);
  const commitmentOpacity = clamp((progress - 0.62) * 2.2);
  const photoStripOpacity = clamp((progress - 0.72) / 0.22);

  const activeTab = progress < 0.45 ? 'environmental' : progress < 0.7 ? 'social' : 'governance';
  const tabSequence = (['environmental', 'social', 'governance'] as const).map((key) => ({
    key,
    label: key.toUpperCase(),
    items: esgStacks[key],
    emphasis: key === activeTab,
  }));

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        visibility: isVisible ? 'visible' : 'hidden',
        opacity,
        transition: 'opacity 0.4s ease',
        background: 'linear-gradient(180deg, rgba(9,33,25,0.88) 0%, rgba(4,14,11,0.9) 100%)',
      }}
    >
      <div
        className="absolute inset-0 overflow-y-auto py-24 px-8 md:px-16 lg:px-24 text-white"
        style={{ pointerEvents: 'auto' }}
      >
        <section
          className="max-w-5xl mx-auto text-center"
          style={{
            opacity: heroOpacity,
            transform: `translateY(${(1 - heroOpacity) * 80}px)`,
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <p className="text-xs tracking-[0.5em] uppercase text-white/55 mb-5">Sustainability</p>
          <h3
            className="text-[38px] md:text-[56px] leading-tight font-light uppercase tracking-[0.28em] mb-8"
            style={{ fontFamily: '"Josefin Sans", sans-serif' }}
          >
            Ethics & compliance framework
          </h3>
          <p className="text-white/75 text-lg leading-8 max-w-3xl mx-auto">
            Transparency and accountability underline every market we serve. Dedicated governance teams align Montfort with
            evolving international standards while embedding stewardship into daily decision-making.
          </p>
        </section>

        <section
          className="max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-10"
          style={{
            pointerEvents: 'auto',
            opacity: solutionsOpacity,
            transform: `translateY(${(1 - solutionsOpacity) * 100}px)`,
            transition: 'opacity 0.45s ease, transform 0.45s ease',
          }}
        >
          {[{
            title: 'Delivering sustainable energy solutions',
            copy: 'We evaluate every asset and route through a sustainability lens, prioritising measurable CO₂ reductions and biodiversity safeguards.',
          }, {
            title: 'Long-term partnerships',
            copy: 'Community programmes across the Middle East, Africa, and Asia support education and skills development with local stakeholders.',
          }, {
            title: 'Continuous monitoring',
            copy: 'Real-time reporting dashboards surface ESG metrics for leadership, ensuring rapid intervention and transparent communications.',
          }].map((card) => (
            <div key={card.title} className="bg-white/8 border border-white/12 rounded-3xl p-8 backdrop-blur">
              <h4 className="text-xs tracking-[0.45em] uppercase text-white/70 mb-4">{card.title}</h4>
              <p className="text-sm leading-7 text-white/70">{card.copy}</p>
            </div>
          ))}
        </section>

        <section
          className="max-w-5xl mx-auto mt-20"
          style={{
            opacity: esgOpacity,
            transform: `translateY(${(1 - esgOpacity) * 120}px)`,
            transition: 'opacity 0.45s ease, transform 0.45s ease',
          }}
        >
          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-wrap justify-center gap-4 text-[11px] tracking-[0.4em] uppercase">
              {tabSequence.map((tab) => (
                <span
                  key={tab.key}
                  className={`px-5 py-2 rounded-full border backdrop-blur transition-all ${
                    tab.emphasis
                      ? 'border-white/30 bg-white/15 text-white'
                      : 'border-white/10 bg-white/6 text-white/45'
                  }`}
                >
                  {tab.label}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
              {tabSequence.map((tab, index) => (
                <div
                  key={tab.key}
                  className={`rounded-3xl border p-8 backdrop-blur transition-all duration-300 ${
                    tab.emphasis
                      ? 'border-white/30 bg-white/12 shadow-[0_30px_70px_rgba(0,0,0,0.35)] scale-[1.02] text-white'
                      : 'border-white/8 bg-white/4 text-white/60'
                  }`}
                  style={{
                    opacity: clamp(esgOpacity - index * 0.15),
                  }}
                >
                  <h5 className="text-xs tracking-[0.42em] uppercase mb-4">{tab.label}</h5>
                  <ul className="space-y-2 text-sm leading-7">
                    {tab.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-white/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="max-w-5xl mx-auto mt-20"
          style={{
            opacity: commitmentOpacity,
            transform: `translateY(${(1 - commitmentOpacity) * 120}px)`,
            transition: 'opacity 0.45s ease, transform 0.45s ease',
          }}
        >
          <h4 className="text-xs tracking-[0.46em] uppercase text-white/65 mb-6 text-center">
            Commitment to equality
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm leading-7 text-white/70">
            <p>
              From recruitment to leadership, Montfort ensures inclusive teams reflect the communities we operate in. Mentorship programmes,
              technical academies, and scholarships create pathways for talent across all locations.
            </p>
            <p>
              Corporate social responsibility pledges focus on education, environmental restoration, and emergency relief. We measure outcomes with partners
              annually and publish impact highlights to stakeholders and regulators.
            </p>
          </div>
        </section>

        <section
          className="max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{
            opacity: photoStripOpacity,
            transform: `translateY(${(1 - photoStripOpacity) * 140}px)`,
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          {photoStrip.map((photo) => (
            <div key={photo.label} className="relative h-64 rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <img src={photo.src} alt={photo.label} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                <span className="text-sm tracking-[0.3em] uppercase text-white">{photo.label}</span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
