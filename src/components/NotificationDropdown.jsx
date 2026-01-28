import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';
import { HiOutlineCheckCircle, HiOutlineExclamation, HiOutlineClock } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        setInitialNotifications
    } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch notifications on mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const [notifRes, countRes] = await Promise.all([
                api.get('/notifications?limit=10'),
                api.get('/notifications/unread-count')
            ]);
            setInitialNotifications(
                notifRes.data.notifications || [],
                countRes.data.unreadCount || 0
            );
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleMarkAsRead = async (notificationId, e) => {
        e.stopPropagation();
        try {
            await api.put(`/notifications/${notificationId}/read`);
            markAsRead(notificationId);
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all/read');
            markAllAsRead();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (notificationId, e) => {
        e.stopPropagation();
        try {
            await api.delete(`/notifications/${notificationId}`);
            removeNotification(notificationId);
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Navigate to the action URL if provided
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            setIsOpen(false);
        }
        // Mark as read
        if (!notification.isRead) {
            try {
                await api.put(`/notifications/${notification._id}/read`);
                markAsRead(notification._id);
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }
    };

    const getNotificationIcon = (type) => {
        const iconMap = {
            // Order notifications
            order_submitted: <HiOutlineClock className="w-5 h-5 text-amber-400" />,
            task_assigned: <HiOutlineCheckCircle className="w-5 h-5 text-blue-400" />,
            task_completed: <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400" />,

            // Payment notifications
            payment_verified: <HiOutlineCheckCircle className="w-5 h-5 text-green-400" />,
            qr_payment_submitted: <HiOutlineExclamation className="w-5 h-5 text-orange-400" />,
            released_to_admin: <HiOutlineCheckCircle className="w-5 h-5 text-violet-400" />,

            // Quote notifications
            quote_received: <HiOutlineClock className="w-5 h-5 text-blue-400" />,
            quote_viewed: <HiOutlineCheckCircle className="w-5 h-5 text-cyan-400" />,
            quote_accepted: <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400" />,
            quote_rejected: <HiOutlineExclamation className="w-5 h-5 text-red-400" />,
            quote_negotiation: <HiOutlineExclamation className="w-5 h-5 text-amber-400" />,

            // Contract notifications
            contract_ready: <HiOutlineClock className="w-5 h-5 text-violet-400" />,
            contract_viewed: <HiOutlineCheckCircle className="w-5 h-5 text-cyan-400" />,
            contract_signed: <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400" />,
            contract_completed: <HiOutlineCheckCircle className="w-5 h-5 text-blue-400" />,
            contract_terminated: <HiOutlineExclamation className="w-5 h-5 text-red-400" />,
            amendment_requested: <HiOutlineExclamation className="w-5 h-5 text-amber-400" />,
            amendment_response: <HiOutlineCheckCircle className="w-5 h-5 text-blue-400" />,

            // Team notifications
            team_request: <HiOutlineExclamation className="w-5 h-5 text-amber-400" />,
            module_assigned: <HiOutlineCheckCircle className="w-5 h-5 text-blue-400" />,
        };
        return iconMap[type] || <FaBell className="w-5 h-5 text-gray-400" />;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:bg-white/5 rounded-xl transition-colors"
            >
                <FaBell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 max-h-[500px] bg-[#0f0f14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[380px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <FaBell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-500/5' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex flex-col gap-1">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(notification._id, e)}
                                                    className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <FaCheck className="w-3 h-3" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(notification._id, e)}
                                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-white/10 text-center">
                            <button
                                onClick={() => {
                                    navigate('/notifications');
                                    setIsOpen(false);
                                }}
                                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
