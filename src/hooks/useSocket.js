import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export const useSocket = () => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      socketRef.current = io(import.meta.env.VITE_API_URL, {
        auth: {
          token
        }
      });

      // Join appropriate room based on user role
      socketRef.current.emit('join-room', {
        userId: user.id,
        role: user.role,
        roomId: user.assignedRoom?._id
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, token]);

  return socketRef.current;
};