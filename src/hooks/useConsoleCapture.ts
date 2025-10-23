'use client';

import { useEffect, useRef, useState } from 'react';

export interface ConsoleLog {
  timestamp: number;
  type: 'log' | 'warn' | 'error' | 'info';
  args: unknown[];
  stack?: string;
}

const MAX_LOGS = 1000;

export function useConsoleCapture(enabled: boolean = false) {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const originalConsole = useRef<{
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    info: typeof console.info;
  } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Store original console methods
    originalConsole.current = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    };

    const addLog = (type: ConsoleLog['type'], args: unknown[]) => {
      const stack = type === 'error' ? new Error().stack : undefined;

      setLogs((prevLogs) => {
        const newLog: ConsoleLog = {
          timestamp: Date.now(),
          type,
          args,
          stack,
        };

        // Keep only last MAX_LOGS entries (circular buffer)
        const updatedLogs = [...prevLogs, newLog];
        if (updatedLogs.length > MAX_LOGS) {
          updatedLogs.shift();
        }

        return updatedLogs;
      });
    };

    // Override console methods
    console.log = ((...args: Parameters<typeof console.log>) => {
      originalConsole.current?.log(...args);
      addLog('log', args as unknown[]);
    }) as typeof console.log;

    console.warn = ((...args: Parameters<typeof console.warn>) => {
      originalConsole.current?.warn(...args);
      addLog('warn', args as unknown[]);
    }) as typeof console.warn;

    console.error = ((...args: Parameters<typeof console.error>) => {
      originalConsole.current?.error(...args);
      addLog('error', args as unknown[]);
    }) as typeof console.error;

    console.info = ((...args: Parameters<typeof console.info>) => {
      originalConsole.current?.info(...args);
      addLog('info', args as unknown[]);
    }) as typeof console.info;

    // Cleanup: restore original console methods
    return () => {
      if (originalConsole.current) {
        console.log = originalConsole.current.log;
        console.warn = originalConsole.current.warn;
        console.error = originalConsole.current.error;
        console.info = originalConsole.current.info;
      }
    };
  }, [enabled]);

  const clearLogs = () => setLogs([]);

  const exportLogs = () => {
    return {
      timestamp: new Date().toISOString(),
      logs: logs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp).toISOString(),
        args: log.args.map((arg) => {
          try {
            if (typeof arg === 'object' && arg !== null) {
              return JSON.stringify(arg);
            }

            return String(arg);
          } catch {
            return String(arg);
          }
        }),
      })),
    };
  };

  return {
    logs,
    clearLogs,
    exportLogs,
  };
}
