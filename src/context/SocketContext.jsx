import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);

  // Handle socket connection lifecycle based on authentication status
  useEffect(() => {
    let activeSocket = null;

    if (isAuthenticated && user) {
      // Connect to the socket server
      activeSocket = io('http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      activeSocket.on('connect', () => {
        console.log('Real-time websocket connected:', activeSocket.id);
        
        // Join personalized room
        activeSocket.emit('join_user', user.id);

        // Join admin room if role matches
        if (user.role === 'admin') {
          activeSocket.emit('join_admin');
        }
      });

      // Handle real-time push alerts
      activeSocket.on('new_notification', (notification) => {
        console.log('Socket notification received:', notification);
        setNotifications((prev) => [notification, ...prev]);

        // Push premium slide toast alert
        const alertType = notification.type === 'alert' ? 'error' : notification.type === 'status_change' ? 'success' : 'info';
        addToast(notification.message, alertType, 5000);
      });

      setSocket(activeSocket);
    } else {
      // Clear socket if user logs out
      if (socket) {
        socket.disconnect();
      }
      setSocket(null);
      setNotifications([]);
    }

    return () => {
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
