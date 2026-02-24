import { useEffect, useRef, useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/env";

export type RunUpdateEvent = {
  runId: string;
  status: string;
  log?: string;
};

type WebSocketMessage = {
  channel: string;
  payload: any;
};

type Listener = (payload: any) => void;

// Simple exponential backoff for reconnection
const RECONNECT_INTERVAL = 3000;

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<Listener>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    // Replace http/https with ws/wss
    const wsUrl = API_BASE_URL.replace(/^http/, "ws") + "/ws";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("[WS] Connected");
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected, reconnecting...");
      setIsConnected(false);
      socketRef.current = null;
      reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_INTERVAL);
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
      ws.close();
    };

    ws.onmessage = (event) => {
      try {
        const msg: WebSocketMessage = JSON.parse(event.data);
        const { channel, payload } = msg;
        
        const listeners = listenersRef.current.get(channel);
        if (listeners) {
          listeners.forEach((listener: Listener) => listener(payload));
        }
      } catch (e) {
        console.error("[WS] Failed to parse message", e);
      }
    };

    socketRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connect]);

  const subscribe = useCallback((channel: string, listener: Listener) => {
    if (!listenersRef.current.has(channel)) {
      listenersRef.current.set(channel, new Set());
    }
    listenersRef.current.get(channel)?.add(listener);

    return () => {
      listenersRef.current.get(channel)?.delete(listener);
    };
  }, []);

  return { isConnected, subscribe };
}
