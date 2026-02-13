'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

interface UseAdminSocketOptions {
  autoConnect?: boolean;
  onDashboardUpdate?: (data: any) => void;
  onAnalyticsUpdate?: (data: any) => void;
  onNewActivity?: (activity: any) => void;
  onEncodingProgress?: (data: { videoId: string; progress: number; status: string }) => void;
}

export function useAdminSocket(options: UseAdminSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(`${SOCKET_URL}/ws`, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setConnected(true);
      // Join admin dashboard room for realtime updates
      socket.emit('joinAdminRoom');

      // Authenticate if token available
      const token = localStorage.getItem('admin_token');
      if (token) {
        socket.emit('authenticate', { token });
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Dashboard realtime events
    socket.on('dashboard:update', (data: any) => {
      options.onDashboardUpdate?.(data);
    });

    socket.on('analytics:update', (data: any) => {
      options.onAnalyticsUpdate?.(data);
    });

    socket.on('dashboard:newActivity', (activity: any) => {
      options.onNewActivity?.(activity);
    });

    socket.on('encoding:progress', (data: any) => {
      options.onEncodingProgress?.(data);
    });

    socketRef.current = socket;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    if (options.autoConnect !== false) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    connected,
    connect,
    disconnect,
  };
}
