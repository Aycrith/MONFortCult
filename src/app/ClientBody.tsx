"use client";

import { useEffect, type ReactNode } from "react";
import SmoothScroll from "@/components/smoothscroll";
import { MenuProvider } from "@/context/MenuContext";

export default function ClientBody({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Add loaded class after mount
    document.body.classList.add('loaded');
  }, []);

  return (
    <body suppressHydrationWarning className="antialiased loading">
      <MenuProvider>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </MenuProvider>
    </body>
  );
}
