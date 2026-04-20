import { useEffect, useRef, useCallback } from 'react';

// Automatically determine WebSocket protocol based on current HTTP protocol
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  // If the React app is served by a different port in dev (like Vite on 5173), we might need to point to the backend directly.
  // Assuming the Vite proxy handles /api/events, but WebSocket proxies need specific setup.
  // Using relative path for WS is not supported in the standard browser WebSocket API, we must use absolute URL.
  return `${protocol}//${host}/api/events`;
};

const RECONNECT_DELAY = 3000;

export type RealtimeEvent = {
  type: 'data_changed';
  collection: string;
};

/**
 * Connects to the backend WebSocket stream.
 * Calls onEvent whenever the server broadcasts a change.
 * Auto-reconnects on disconnect, pauses when tab is hidden.
 */
export function useRealtime(onEvent: (e: RealtimeEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();

    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as RealtimeEvent;
        onEventRef.current(data);
      } catch { /* ignore parse errors */ }
    };

    ws.onclose = () => {
      wsRef.current = null;
      // Reconnect after delay
      reconnectTimer.current = setTimeout(() => {
        if (!document.hidden) connect();
      }, RECONNECT_DELAY);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    // Connect when visible
    const handleVisibility = () => {
      if (document.hidden) {
        wsRef.current?.close();
        wsRef.current = null;
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
      wsRef.current?.close();
    };
  }, [connect]);
}
