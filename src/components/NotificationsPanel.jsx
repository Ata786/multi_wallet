import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, Spinner } from 'react-bootstrap';
import { FaBell, FaArrowDown, FaArrowUp, FaExchangeAlt, FaCheck, FaCheckDouble } from 'react-icons/fa';
import authService from '../services/authService';

const NotificationsPanel = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (userId) {
            loadNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(loadUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const [notifs, countData] = await Promise.all([
                authService.getNotifications(userId),
                authService.getUnreadNotificationCount(userId)
            ]);
            setNotifications(notifs.slice(0, 10)); // Show last 10
            setUnreadCount(countData.count || 0);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const data = await authService.getUnreadNotificationCount(userId);
            setUnreadCount(data.count || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkRead = async (notificationId) => {
        try {
            await authService.markNotificationRead(notificationId);
            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await authService.markAllNotificationsRead(userId);
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'TRANSFER_RECEIVED':
            case 'DEPOSIT':
                return <FaArrowDown className="text-success" />;
            case 'TRANSFER_SENT':
                return <FaArrowUp className="text-danger" />;
            case 'CONVERSION':
                return <FaExchangeAlt className="text-info" />;
            default:
                return <FaBell className="text-primary" />;
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
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
        <Dropdown align="end" show={show} onToggle={(isOpen) => {
            setShow(isOpen);
            if (isOpen) loadNotifications();
        }}>
            <Dropdown.Toggle
                variant="light"
                className="position-relative border-0 bg-transparent p-2"
                id="notifications-dropdown"
            >
                <FaBell size={20} className="text-muted" />
                {unreadCount > 0 && (
                    <Badge
                        bg="danger"
                        pill
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{ fontSize: '0.65rem' }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu
                className="shadow-lg border-0 py-0"
                style={{ width: '360px', maxHeight: '450px', overflowY: 'auto' }}
            >
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center sticky-top bg-white">
                    <h6 className="fw-bold mb-0">Notifications</h6>
                    {unreadCount > 0 && (
                        <button
                            className="btn btn-link btn-sm text-primary text-decoration-none p-0 d-flex align-items-center gap-1"
                            onClick={handleMarkAllRead}
                        >
                            <FaCheckDouble size={12} /> Mark all read
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-4">
                        <Spinner size="sm" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <FaBell size={32} className="mb-2 opacity-50" />
                        <p className="mb-0 small">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div
                            key={notif.id}
                            className={`p-3 border-bottom d-flex gap-3 ${!notif.read ? 'bg-primary bg-opacity-10' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => !notif.read && handleMarkRead(notif.id)}
                        >
                            <div className="rounded-circle bg-light p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start">
                                    <h6 className="fw-semibold mb-1 small">{notif.title}</h6>
                                    {!notif.read && (
                                        <span className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></span>
                                    )}
                                </div>
                                <p className="text-muted small mb-1">{notif.message}</p>
                                <small className="text-muted">{formatTime(notif.createdAt)}</small>
                            </div>
                        </div>
                    ))
                )}

                {notifications.length > 0 && (
                    <div className="p-2 text-center border-top">
                        <a href="/transactions" className="text-primary text-decoration-none small fw-semibold">
                            View All Transactions
                        </a>
                    </div>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default NotificationsPanel;
