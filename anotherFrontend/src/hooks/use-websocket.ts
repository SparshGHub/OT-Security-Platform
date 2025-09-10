'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { WebSocketMessage } from '@/lib/types';

export type WebSocketStatus = 'connecting' | 'open' | 'closed';

const getWebSocketUrl = (): string => {
  if (typeof window === 'undefined') {
    // This should not happen in a client-side hook, but as a fallback.
    return '';
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBaseUrl) {
    console.error('NEXT_PUBLIC_API_BASE is not set. WebSocket cannot connect.');
    return '';
  }
  
  try {
    const url = new URL(apiBaseUrl);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${url.host}/live`;
  } catch (e) {
    console.error('Invalid NEXT_PUBLIC_API_BASE URL for WebSocket:', apiBaseUrl);
    return '';
  }
};

const MAX_RECONNECT_DELAY = 10000; // 10 seconds

export const useWebSocket = (
  onMessage: (data: any) => void,
) => {
  const [status, setStatus] = useState<WebSocketStatus>('connecting');
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    const wsUrl = getWebSocketUrl();
    if (!wsUrl) {
      setStatus('closed');
      return;
    }

    setStatus('connecting');
    
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
        ws.current.close();
    }

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setStatus('open');
        reconnectAttempts.current = 0; // Reset on successful connection
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          if (message.type === 'alert') {
            onMessage(message.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setStatus('closed');
        
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }

        const delay = Math.min(MAX_RECONNECT_DELAY, 1000 * Math.pow(2, reconnectAttempts.current));
        reconnectAttempts.current += 1;
        
        console.log(`Attempting to reconnect in ${delay / 1000}s...`);
        reconnectTimeout.current = setTimeout(connect, delay);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.current?.close();
      };
    } catch(e) {
      console.error("Failed to create websocket", e);
      setStatus('closed');
    }
  }, [onMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect logic on unmount
        ws.current.close();
      }
    };
  }, [connect]);

  return status;
};

