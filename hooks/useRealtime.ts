import { useEffect, useRef, useCallback } from 'react';

const SSE_URL = '/api/events';
const RECONNECT_DELAY = 3000;

export type RealtimeEvent = {
  type: 'data_changed';
  collection: string;
};

/**
 * Connects to the backend SSE stream.
 * Calls onEvent whenever the server broadcasts a change.
 * Auto-reconnects on disconnect, pauses when tab is hidden.
 */
export function useRealtime(onEvent: (e: RealtimeEvent) => void) {
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    const es = new EventSource(SSE_URL);
    esRef.current = es;

    es.addEventListener('message', (e) => {
      try {
        const data = JSON.parse(e.data) as RealtimeEvent;
        onEventRef.current(data);
      } catch { /* ignore parse errors */ }
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
      // Reconnect after delay
      reconnectTimer.current = setTimeout(() => {
        if (!document.hidden) connect();
      }, RECONNECT_DELAY);
    };
  }, []);

  useEffect(() => {
    // Connect when visible
    const handleVisibility = () => {
      if (document.hidden) {
        esRef.current?.close();
        esRef.current = null;
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      } else {
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    connect();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      esRef.current?.close();
    };
  }, [connect]);
}
