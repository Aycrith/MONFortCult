'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useScroll } from './smoothscroll';

const navigationItems = [
  { label: 'MONTFORT GROUP', href: '/' },
  { label: 'MONTFORT TRADING', href: '/trading' },
  { label: 'MONTFORT CAPITAL', href: '/capital' },
  { label: 'MONTFORT MARITIME', href: '/maritime' },
  { label: 'FORT ENERGY', href: '/fort-energy' },
];

export default function Header() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Header background changes when scrolled
  const isScrolled = scrollY > 50;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 md:px-8 py-4 md:py-6">
        <div className="flex items-center justify-between">
          {/* Primary Navigation - Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative group"
                >
                  <span
                    className={`text-xs tracking-widest transition-colors duration-300 ${
                      isScrolled
                        ? isActive
                          ? 'text-[#374851]'
                          : 'text-[#929ea6] hover:text-[#374851]'
                        : isActive
                        ? 'text-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className={`absolute -bottom-2 left-0 right-0 h-[2px] ${isScrolled ? 'bg-montfort-blue' : 'bg-white'}`} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden">
            <span className="text-xs tracking-widest text-montfort-blue-dark">MONTFORT</span>
          </Link>

          {/* Right Side - News & Menu */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="/news"
              className={`flex items-center gap-2 text-xs tracking-widest transition-colors ${
                isScrolled
                  ? 'text-montfort-gray hover:text-montfort-blue-dark'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span>NEWS</span>
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-montfort-blue text-white text-[10px]">
                15
              </span>
            </Link>

            <button
              onClick={() => setMobileOpen((open) => !open)}
              className={`flex items-center gap-2 text-xs tracking-widest transition-colors ${
                isScrolled
                  ? 'text-montfort-gray hover:text-montfort-blue-dark'
                  : 'text-white/70 hover:text-white'
              }`}
              aria-label="Toggle menu"
            >
              <span className="hidden md:inline">MENU</span>
              <div className="flex flex-col gap-[3px]">
                <span className={`w-4 h-[1.5px] ${isScrolled ? 'bg-montfort-gray' : 'bg-white'}`} />
                <span className={`w-4 h-[1.5px] ${isScrolled ? 'bg-montfort-gray' : 'bg-white'}`} />
                <span className={`w-4 h-[1.5px] ${isScrolled ? 'bg-montfort-gray' : 'bg-white'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ${
            mobileOpen ? 'max-h-96 mt-6' : 'max-h-0'
          }`}
        >
          <nav className="flex flex-col space-y-4 pb-4" aria-label="Mobile">
            {navigationItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-xs tracking-widest transition-colors ${
                    isActive
                      ? 'text-montfort-blue-dark font-bold'
                      : 'text-montfort-gray hover:text-montfort-blue-dark'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </nav>

      {/* Cinematic controls handled separately */}
    </header>
  );
}
