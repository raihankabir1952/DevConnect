'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

const socket = io(API_URL);

export default function WebSocketTest() {
  const [connected, setConnected] =
    useState(false);

  const [message, setMessage] =
    useState('');

  useEffect(() => {
    // ========================================
    // CONNECT
    // ========================================

    socket.on('connect', () => {
      console.log(
        'WebSocket connected:',
        socket.id,
      );

      setConnected(true);
    });

    // ========================================
    // RECEIVE TEST RESPONSE
    // ========================================

    socket.on('test', (data) => {
      console.log(
        'Received from server:',
        data,
      );

      setMessage(data.message);
    });

    // ========================================
    // DISCONNECT
    // ========================================

    socket.on('disconnect', () => {
      console.log(
        'WebSocket disconnected',
      );

      setConnected(false);
    });

    // ========================================
    // CLEANUP
    // ========================================

    return () => {
      socket.off('connect');
      socket.off('test');
      socket.off('disconnect');
    };
  }, []);

  // ========================================
  // SEND TEST EVENT
  // ========================================

  const sendTestMessage = () => {
    socket.emit('test');
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">
        WebSocket Test
      </h2>

      <p className="mb-4">
        Status:{' '}
        <span
          className={
            connected
              ? 'font-semibold text-green-600'
              : 'font-semibold text-red-600'
          }
        >
          {connected
            ? 'Connected'
            : 'Disconnected'}
        </span>
      </p>

      <button
        onClick={sendTestMessage}
        disabled={!connected}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send Test
      </button>

      {message && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-green-700">
          {message}
        </p>
      )}
    </div>
  );
}