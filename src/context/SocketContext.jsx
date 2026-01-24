import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initialize socket connection
    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        const socketURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        console.log('Connecting to Socket.io at:', socketURL);

        const socketInstance = io(socketURL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            reconnectionAttempts: Infinity,
            autoConnect: true,
            forceNew: false,
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setConnected(true);

            // Join user-specific room
            socketInstance.emit('join', user._id);

            // Join role-based room
            if (user.role) {
                socketInstance.emit('joinRole', user.role);
            }
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('Socket disconnected - Reason:', reason);
            setConnected(false);
        });

        socketInstance.on('reconnect', () => {
            console.log('Socket reconnected:', socketInstance.id);
            setConnected(true);

            // Rejoin rooms after reconnection
            socketInstance.emit('join', user._id);
            if (user.role) {
                socketInstance.emit('joinRole', user.role);
            }
        });

        socketInstance.on('reconnect_attempt', (attempt) => {
            console.log('Socket reconnect attempt:', attempt);
        });

        socketInstance.on('reconnect_error', (error) => {
            console.error('Socket reconnection error:', error);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        // Handle incoming notifications
        socketInstance.on('notification', (data) => {
            console.log('New notification:', data);
            if (data.type === 'new' && data.notification) {
                setNotifications(prev => [data.notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            }
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [user]);

    // Add notification locally (for optimistic updates)
    const addNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
    }, []);

    // Mark notification as read
    const markAsRead = useCallback((notificationId) => {
        setNotifications(prev =>
            prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    }, []);

    // Remove notification
    const removeNotification = useCallback((notificationId) => {
        setNotifications(prev => {
            const notification = prev.find(n => n._id === notificationId);
            if (notification && !notification.isRead) {
                setUnreadCount(c => Math.max(0, c - 1));
            }
            return prev.filter(n => n._id !== notificationId);
        });
    }, []);

    // Set initial notifications (from API)
    const setInitialNotifications = useCallback((notifs, count) => {
        setNotifications(notifs);
        setUnreadCount(count);
    }, []);

    const value = {
        socket,
        connected,
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        setInitialNotifications,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;

