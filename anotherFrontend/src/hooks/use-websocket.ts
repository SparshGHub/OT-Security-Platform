'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { WebSocketMessage } from '@/lib/types';

export type WebSocketStatus = 'connecting' | 'open' | 'closed';

const WS_PATH = '/live';
const MAX_RECONNECT_DELAY = 30000; // 30s max

function resolveApiBase(): string {
  // Prefer build-time env
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE;
  if (fromEnv) return fromEnv;

  // Fallback: same host, backend on 8080
  if (typeof window !== 'undefined') {
    const proto = window.location.protocol; // http: | https:
    const host = window.location.hostname;  // e.g. localhost
    const port = 8080;
    return `${proto}//${host}:${port}`;
  }
  return 'http://localhost:8080'; // SSR fallback (shouldn’t be used)
}

function toWsUrl(apiBase: string): string {
  try {
    const u = new URL(apiBase);
    const wsProto = u.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProto}//${u.host}${WS_PATH}`;
  } catch {
    // last resort
    return apiBase.replace(/^http/i, 'ws') + WS_PATH;
  }
}

export const useWebSocket = (onMessage: (data: any) => void) => {
  const [status, setStatus] = useState<WebSocketStatus>('connecting');
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const mounted = useRef(true);

  // Keep the message handler stable
  const handlerRef = useRef(onMessage);
  useEffect(() => { handlerRef.current = onMessage; }, [onMessage]);

  const connect = useCallback(() => {
    if (!mounted.current) return;

    const wsUrl = toWsUrl(resolveApiBase());
    if (!wsUrl) {
      setStatus('closed');
      return;
    }

    // Already have a socket that’s OPEN or CONNECTING? Don’t create another.
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus('connecting');
    try {
      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        if (!mounted.current) return;
        reconnectAttempts.current = 0;
        setStatus('open');
        // console.debug('WS connected:', wsUrl);
      };

      socket.onmessage = (event) => {
        if (!mounted.current) return;
        try {
          const msg: WebSocketMessage = JSON.parse(event.data);
          if ((msg as any)?.type === 'alert') {
            handlerRef.current((msg as any).data);
          }
        } catch {
          // ignore bad payloads
        }
      };

      socket.onclose = () => {
        if (!mounted.current) return;
        setStatus('closed');
        // Exponential backoff with jitter
        reconnectAttempts.current = Math.min(reconnectAttempts.current + 1, 10);
        const base = Math.min(1000 * 2 ** reconnectAttempts.current, MAX_RECONNECT_DELAY);
        const jitter = Math.random() * 500;
        const delay = Math.round(base + jitter);

        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        reconnectTimer.current = setTimeout(() => {
          reconnectTimer.current = null;
          connect();
        }, delay);
      };

      socket.onerror = () => {
        // Don’t call close() here; let onclose drive reconnection.
        // console.warn('WS error');
      };
    } catch (e) {
      setStatus('closed');
      // Try again later
      reconnectAttempts.current = Math.min(reconnectAttempts.current + 1, 10);
      const delay = Math.min(1000 * 2 ** reconnectAttempts.current, MAX_RECONNECT_DELAY);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      reconnectTimer.current = setTimeout(() => {
        reconnectTimer.current = null;
        connect();
      }, delay);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    connect();
    return () => {
      mounted.current = false;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      if (ws.current) {
        try { ws.current.close(); } catch {}
        ws.current = null;
      }
      setStatus('closed');
    };
  }, [connect]);

  return status;
};

