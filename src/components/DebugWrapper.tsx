'use client';

import { useState, useEffect, type ReactNode } from 'react';
import DebugPanel from './DebugPanel';

interface DebugWrapperProps {
  children: ReactNode;
}

export default function DebugWrapper({ children }: DebugWrapperProps) {
  const [debugOpen, setDebugOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check if debug mode is enabled via URL parameter
    const params = new URLSearchParams(window.location.search);
    const debugParam = params.get('debug');

    if (debugParam === 'true') {
      setIsEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    // Keyboard shortcut: Ctrl+Shift+D or Cmd+Shift+D
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDebugOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEnabled]);

  return (
    <>
      {children}
      {isEnabled && (
        <DebugPanel isOpen={debugOpen} onClose={() => setDebugOpen(false)} />
      )}
      {isEnabled && !debugOpen && (
        <div className="fixed bottom-4 right-4 z-[9998] pointer-events-auto">
          <button
            onClick={() => setDebugOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg text-xs font-mono font-bold transition-colors"
            title="Open Debug Panel (Ctrl+Shift+D)"
          >
            DEBUG
          </button>
        </div>
      )}
    </>
  );
}
