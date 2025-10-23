'use client';

import { useState, useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useConsoleCapture } from '@/hooks/useConsoleCapture';
import { useVisualCapture } from '@/hooks/useVisualCapture';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useScroll } from './smoothscroll';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScrollTriggerSnapshot {
  id: string;
  start: number;
  end: number;
  progress: number;
  isActive: boolean;
}

export default function DebugPanel({ isOpen, onClose }: DebugPanelProps) {
  const [activeTab, setActiveTab] = useState<'console' | 'performance' | 'visual' | 'scroll'>('console');

  const { logs, clearLogs, exportLogs } = useConsoleCapture(isOpen);
  const { metrics } = usePerformanceMonitor(isOpen);
  const { captureScreen, downloadSnapshot, isCapturing, lastSnapshot } = useVisualCapture();
  const { scrollY } = useScroll();

  const [scrollTriggers, setScrollTriggers] = useState<ScrollTriggerSnapshot[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined') return;

    // Update ScrollTrigger info
    const updateScrollTriggers = () => {
      const triggers = ScrollTrigger.getAll();
      setScrollTriggers(
        triggers.map((trigger) => ({
          id: (trigger.vars.id as string | undefined) ?? 'unnamed',
          start: trigger.start,
          end: trigger.end,
          progress: trigger.progress,
          isActive: trigger.isActive,
        }))
      );
    };

    const interval = setInterval(updateScrollTriggers, 500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExportAll = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      console: exportLogs(),
      performance: metrics,
      scroll: {
        scrollY,
        scrollTriggers,
      },
      viewport: {
        width: typeof window === 'undefined' ? 0 : window.innerWidth,
        height: typeof window === 'undefined' ? 0 : window.innerHeight,
      },
      userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
      url: typeof window === 'undefined' ? '' : window.location.href,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCaptureAndDownload = async () => {
    const snapshot = await captureScreen();
    if (snapshot) {
      downloadSnapshot(snapshot);
    }
  };

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div className="absolute bottom-4 right-4 w-[600px] h-[500px] bg-black/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-2xl pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-white font-mono text-sm font-bold">Debug Panel</h2>
          <div className="flex gap-2">
            <button
              onClick={handleCaptureAndDownload}
              disabled={isCapturing}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
            >
              {isCapturing ? 'Capturing...' : 'Screenshot'}
            </button>
            <button
              onClick={handleExportAll}
              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Export All
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {(['console', 'performance', 'visual', 'scroll'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-mono capitalize ${
                activeTab === tab
                  ? 'bg-white/10 text-white border-b-2 border-blue-500'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="h-[calc(100%-120px)] overflow-auto p-4">
          {activeTab === 'console' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/60 text-xs font-mono">
                  {logs.length} logs captured
                </span>
                <button
                  onClick={clearLogs}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Clear
                </button>
              </div>
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`p-2 rounded text-xs font-mono ${
                    log.type === 'error'
                      ? 'bg-red-900/30 text-red-200'
                      : log.type === 'warn'
                      ? 'bg-yellow-900/30 text-yellow-200'
                      : 'bg-white/5 text-white/80'
                  }`}
                >
                  <div className="flex gap-2">
                    <span className="text-white/40">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="font-bold">{log.type}:</span>
                    <span>{log.args.map((arg) => String(arg)).join(' ')}</span>
                  </div>
                  {log.stack && (
                    <pre className="mt-1 text-[10px] text-white/40 overflow-x-auto">
                      {log.stack}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-4 text-white font-mono text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded">
                  <div className="text-white/60 text-xs mb-1">FPS</div>
                  <div className={`text-2xl font-bold ${metrics.fps < 30 ? 'text-red-400' : metrics.fps < 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {metrics.fps}
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded">
                  <div className="text-white/60 text-xs mb-1">Long Tasks</div>
                  <div className={`text-2xl font-bold ${metrics.longTasks > 10 ? 'text-red-400' : 'text-white'}`}>
                    {metrics.longTasks}
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded">
                  <div className="text-white/60 text-xs mb-1">Layout Shifts</div>
                  <div className={`text-2xl font-bold ${metrics.layoutShifts > 5 ? 'text-red-400' : 'text-white'}`}>
                    {metrics.layoutShifts}
                  </div>
                </div>

                {metrics.memory && (
                  <div className="bg-white/5 p-3 rounded">
                    <div className="text-white/60 text-xs mb-1">Memory Used</div>
                    <div className="text-lg font-bold">
                      {formatBytes(metrics.memory.usedJSHeapSize)}
                    </div>
                    <div className="text-xs text-white/40">
                      / {formatBytes(metrics.memory.limit)}
                    </div>
                  </div>
                )}
              </div>

              {metrics.paintMetrics && (
                <div className="bg-white/5 p-3 rounded">
                  <div className="text-white/60 text-xs mb-2">Paint Metrics</div>
                  <div className="space-y-1 text-xs">
                    {metrics.paintMetrics.firstPaint && (
                      <div>FP: {metrics.paintMetrics.firstPaint.toFixed(2)}ms</div>
                    )}
                    {metrics.paintMetrics.firstContentfulPaint && (
                      <div>FCP: {metrics.paintMetrics.firstContentfulPaint.toFixed(2)}ms</div>
                    )}
                    {metrics.paintMetrics.largestContentfulPaint && (
                      <div>LCP: {metrics.paintMetrics.largestContentfulPaint.toFixed(2)}ms</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'visual' && (
            <div className="space-y-4">
              <div className="text-white text-sm font-mono mb-2">
                Visual capture allows you to take screenshots with metadata
              </div>
              {lastSnapshot && (
                <div className="space-y-2">
                  <div className="text-white/60 text-xs">Last Capture:</div>
                  <img
                    src={lastSnapshot.imageDataUrl}
                    alt="Last snapshot"
                    className="w-full rounded border border-white/10"
                  />
                  <div className="bg-white/5 p-2 rounded text-xs font-mono text-white/80">
                    <div>Time: {new Date(lastSnapshot.timestamp).toLocaleString()}</div>
                    <div>Scroll: {lastSnapshot.scrollPosition.toFixed(0)}px</div>
                    <div>Viewport: {lastSnapshot.viewport.width} x {lastSnapshot.viewport.height}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scroll' && (
            <div className="space-y-4 text-white font-mono text-sm">
              <div className="bg-white/5 p-3 rounded">
                <div className="text-white/60 text-xs mb-2">Scroll Status</div>
                <div className="space-y-1 text-xs">
                  <div>Scroll Y: {scrollY.toFixed(2)}px</div>
                  <div>Native Scroll: {window.scrollY}px</div>
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded">
                <div className="text-white/60 text-xs mb-2">
                  ScrollTriggers ({scrollTriggers.length})
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {scrollTriggers.map((trigger, i) => (
                    <div
                      key={i}
                      className={`text-xs p-2 rounded ${
                        trigger.isActive ? 'bg-green-900/30' : 'bg-white/5'
                      }`}
                    >
                      <div>ID: {trigger.id}</div>
                      <div>Progress: {(trigger.progress * 100).toFixed(1)}%</div>
                      <div className="text-white/40">
                        Start: {trigger.start} → End: {trigger.end}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
