import { useEffect, useRef, useState, useCallback } from 'react';
import { config } from '../config/environment';

export interface WebSocketMessage<T = unknown> {
  event: 'telemetry_tick' | 'anomaly_detected' | 'incident_created' | 'remediation_updated' | 'model_retrained';
  data: T;
  timestamp: string;
}

export const useWebSocket = <T = unknown>(
  eventFilter?: string,
  onMessage?: (data: WebSocketMessage<T>) => void
) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage<T> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (config.useMockData) {
      setIsConnected(true);
      return;
    }

    try {
      const socket = new WebSocket(config.wsBaseUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const parsed: WebSocketMessage<T> = JSON.parse(event.data);
          if (!eventFilter || parsed.event === eventFilter) {
            setLastMessage(parsed);
            if (onMessage) onMessage(parsed);
          }
        } catch (err) {
          console.error('WebSocket parse error:', err);
        }
      };

      socket.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
        setIsConnected(false);
      };

      socket.onclose = () => {
        setIsConnected(false);
      };
    } catch (e) {
      console.warn('WebSocket failed to initialize:', e);
      setIsConnected(false);
    }
  }, [eventFilter, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, lastMessage, reconnect: connect };
};
