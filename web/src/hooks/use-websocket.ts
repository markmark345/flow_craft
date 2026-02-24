import { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/env";
import { getAuthToken } from "@/lib/auth";
import { constants } from "@/lib/constants";

export type RunUpdateEvent = {
  runId: string;
  status: string;
  log?: string;
};

type WebSocketMessage = {
  channel: string;
  payload: unknown;
};

type Listener = (payload: unknown) => void;

// --- Module-level singleton ---
// A single WebSocket is shared across all hook instances so that mounting
// multiple components does not open duplicate connections.

let _socket: WebSocket | null = null;
let _isConnected = false;
let _reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
const _listeners = new Map<string, Set<Listener>>();
const _stateListeners = new Set<(connected: boolean) => void>();

function _notifyState(connected: boolean) {
  _isConnected = connected;
  _stateListeners.forEach((fn) => fn(connected));
}

function _connect() {
  if (
    _socket?.readyState === WebSocket.OPEN ||
    _socket?.readyState === WebSocket.CONNECTING
  ) {
    return;
  }

  const token = getAuthToken();
  if (!token) {
    // No auth token yet; retry after the reconnect interval
    _reconnectTimeout = setTimeout(_connect, constants.wsReconnectIntervalMs);
    return;
  }

  const wsUrl =
    API_BASE_URL.replace(/^http/, "ws") +
    "/ws?token=" +
    encodeURIComponent(token);
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    if (_reconnectTimeout) clearTimeout(_reconnectTimeout);
    _notifyState(true);
  };

  ws.onclose = () => {
    _notifyState(false);
    _socket = null;
    _reconnectTimeout = setTimeout(_connect, constants.wsReconnectIntervalMs);
  };

  ws.onerror = () => {
    ws.close();
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data as string) as WebSocketMessage;
      const channelListeners = _listeners.get(msg.channel);
      if (channelListeners) {
        channelListeners.forEach((fn) => fn(msg.payload));
      }
    } catch {
      // ignore malformed messages
    }
  };

  _socket = ws;
}

// --- Hook ---
// Multiple components can call useWebSocket(); they all share the same
// underlying connection.  State changes (connect/disconnect) are fanned out
// to every mounted instance via _stateListeners.

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(_isConnected);

  useEffect(() => {
    _stateListeners.add(setIsConnected);
    _connect();
    return () => {
      _stateListeners.delete(setIsConnected);
    };
  }, []);

  const subscribe = useCallback((channel: string, listener: Listener) => {
    if (!_listeners.has(channel)) {
      _listeners.set(channel, new Set());
    }
    _listeners.get(channel)!.add(listener);
    return () => {
      _listeners.get(channel)?.delete(listener);
    };
  }, []);

  return { isConnected, subscribe };
}
