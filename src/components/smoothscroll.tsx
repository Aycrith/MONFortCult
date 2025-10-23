'use client';

import { useEffect, ReactNode, createContext, useContext, useState, useRef } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: ReactNode;
}

interface ScrollContextValue {
  scrollY: number;
  lenis: Lenis | null;
}

const ScrollContext = createContext<ScrollContextValue>({
  scrollY: 0,
  lenis: null,
});

export const useScroll = () => useContext(ScrollContext);

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const [scrollY, setScrollY] = useState(0);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const rootElement = document.documentElement;
    const lenis = new Lenis({
      duration: 1.25,
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false,
      gestureOrientation: 'vertical',
      touchMultiplier: 1,
    });

    setLenisInstance(lenis);
    setScrollY(lenis.scroll);

    const handleLenisScroll = ({ scroll }: { scroll: number }) => {
      setScrollY(scroll);
      ScrollTrigger.update();
    };

    lenis.on('scroll', handleLenisScroll);

    ScrollTrigger.scrollerProxy(rootElement, {
      scrollTop(value) {
        if (typeof value === 'number') {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      fixedMarkers: true,
    });

    ScrollTrigger.defaults({ scroller: rootElement });

    const raf = (time: number) => {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    };
    rafIdRef.current = requestAnimationFrame(raf);

    const resizeHandler = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', resizeHandler);
    const handleScrollTriggerRefresh = () => {
      lenis.resize();
    };
    ScrollTrigger.addEventListener('refresh', handleScrollTriggerRefresh);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.removeEventListener('resize', resizeHandler);
      ScrollTrigger.removeEventListener('refresh', handleScrollTriggerRefresh);
      lenis.off('scroll', handleLenisScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      lenis.destroy();
      setLenisInstance(null);
      ScrollTrigger.defaults({ scroller: window });
    };
  }, []);

  return <ScrollContext.Provider value={{ scrollY, lenis: lenisInstance }}>{children}</ScrollContext.Provider>;
}
