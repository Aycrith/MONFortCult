'use client';

import Link from 'next/link';

const offices = [
  {
    city: 'GENEVA',
    country: 'SWITZERLAND',
    address: [
      '3rd & 4th floor',
      'Rue du Mont-Blanc 14',
      '1201 Geneva, Switzerland',
    ],
    phone: '+41 227415900',
    email: 'gva.reception@mont-fort.com',
  },
  {
    city: 'DUBAI',
    country: 'UAE',
    address: [
      '1104 ICD Brookfield Place',
      'Dubai International Financial Centre',
      'Dubai, United Arab Emirates',
    ],
    phone: '+971 45914032',
    email: 'uae.reception@mont-fort.com',
  },
  {
    city: 'SINGAPORE',
    country: '',
    address: [
      '0804 Marina One East Tower',
      '7 Straits View',
      '018936, Singapore',
    ],
    phone: '+65 62286490',
    email: 'sing.reception@mont-fort.com',
  },
];

const sitemapLinks = [
  { label: 'MONTFORT GROUP', href: '/' },
  { label: 'MONTFORT TRADING', href: '/trading' },
  { label: 'MONTFORT CAPITAL', href: '/capital' },
  { label: 'MONTFORT MARITIME', href: '/maritime' },
  { label: 'FORT ENERGY', href: '/fort-energy' },
];

export default function Footer() {
  return (
    <footer className="bg-white py-16 px-4 md:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Sitemap and Office Locations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Column 1: Sitemap */}
          <div className="space-y-4">
            <h2 className="text-montfort-blue text-sm tracking-widest mb-4 font-['Josefin_Sans']">
              SITEMAP
            </h2>
            <nav className="flex flex-col space-y-3" aria-label="Footer Sitemap">
              {sitemapLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-montfort-gray text-xs hover:text-montfort-blue transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Columns 2-4: Office Locations */}
          {offices.map((office) => (
            <div key={office.city} className="space-y-6">
              <div>
                <h2 className="text-montfort-blue text-sm tracking-widest mb-1 font-['Josefin_Sans']">
                  {office.city}
                  {office.country && ','}
                </h2>
                {office.country && (
                  <h2 className="text-montfort-blue text-sm tracking-widest font-['Josefin_Sans']">
                    {office.country}
                  </h2>
                )}
              </div>

              <div className="text-montfort-gray text-xs leading-relaxed space-y-1">
                {office.address.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>

              <div className="space-y-2">
                <a
                  href={`tel:${office.phone.replace(/\s/g, '')}`}
                  className="block text-[#1A202C] text-xs hover:text-montfort-blue transition-colors"
                >
                  P : {office.phone}
                </a>
                <a
                  href={`mailto:${office.email}`}
                  className="block text-montfort-blue text-xs hover:text-montfort-blue-dark transition-colors"
                >
                  {office.email}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Logo and Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pt-8 border-t border-[#c8d2dc]/30">
          <div className="flex items-center gap-3">
            {/* Montfort Logo SVG */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-montfort-blue"
            >
              <circle cx="24" cy="6" r="2" fill="currentColor" />
              <circle cx="18" cy="12" r="2" fill="currentColor" />
              <circle cx="30" cy="12" r="2" fill="currentColor" />
              <circle cx="14" cy="18" r="2" fill="currentColor" />
              <circle cx="24" cy="18" r="2" fill="currentColor" />
              <circle cx="34" cy="18" r="2" fill="currentColor" />
              <circle cx="10" cy="24" r="2" fill="currentColor" />
              <circle cx="18" cy="24" r="2" fill="currentColor" />
              <circle cx="30" cy="24" r="2" fill="currentColor" />
              <circle cx="38" cy="24" r="2" fill="currentColor" />
              <circle cx="14" cy="30" r="2" fill="currentColor" />
              <circle cx="24" cy="30" r="2" fill="currentColor" />
              <circle cx="34" cy="30" r="2" fill="currentColor" />
              <circle cx="18" cy="36" r="2" fill="currentColor" />
              <circle cx="30" cy="36" r="2" fill="currentColor" />
              <circle cx="24" cy="42" r="2" fill="currentColor" />
            </svg>
            <span className="text-montfort-blue text-xl tracking-[0.3em] font-['Josefin_Sans']">
              MONTFORT
            </span>
          </div>

          <p className="text-montfort-gray text-xs">
            © 2021 | Montfort - All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
