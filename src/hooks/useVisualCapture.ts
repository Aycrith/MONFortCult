'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import { useScroll } from '@/components/smoothscroll';

export interface VisualSnapshot {
  timestamp: string;
  scrollPosition: number;
  viewport: {
    width: number;
    height: number;
  };
  imageDataUrl: string;
  url: string;
  userAgent: string;
}

export function useVisualCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState<VisualSnapshot | null>(null);
  const { scrollY } = useScroll();

  const captureScreen = async (element?: HTMLElement): Promise<VisualSnapshot | null> => {
    if (isCapturing) return null;

    setIsCapturing(true);

    try {
      const targetElement = element || document.body;

      // Capture the screen with html2canvas
      const canvas = await html2canvas(targetElement, {
        allowTaint: true,
        useCORS: true,
        logging: false,
        backgroundColor: null,
        scale: window.devicePixelRatio || 1,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });

      const imageDataUrl = canvas.toDataURL('image/png');

      const snapshot: VisualSnapshot = {
        timestamp: new Date().toISOString(),
        scrollPosition: scrollY,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        imageDataUrl,
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      setLastSnapshot(snapshot);
      return snapshot;
    } catch (error) {
      console.error('Failed to capture screen:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadSnapshot = (snapshot: VisualSnapshot, filename?: string) => {
    const link = document.createElement('a');
    link.download = filename || `snapshot-${Date.now()}.png`;
    link.href = snapshot.imageDataUrl;
    link.click();
  };

  const exportSnapshotData = (snapshot: VisualSnapshot) => {
    const data = {
      ...snapshot,
      // Remove large image data from JSON export
      imageDataUrl: '[image data - use downloadSnapshot to get image]',
    };

    return JSON.stringify(data, null, 2);
  };

  return {
    captureScreen,
    downloadSnapshot,
    exportSnapshotData,
    isCapturing,
    lastSnapshot,
  };
}
