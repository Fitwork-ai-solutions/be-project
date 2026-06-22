import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

export function getSocket(token) {
  if (socket?.connected) return socket;
  if (!token) return null;
  socket = io(socketUrl, {
    auth: { token },
    path: '/socket.io',
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
