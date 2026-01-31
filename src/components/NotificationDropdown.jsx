import React, { useState, useEffect, useCallback } from 'react';
import { Dropdown, Badge, Button, Spinner } from 'react-bootstrap';
import { FaBell, FaCheckCircle, FaArrowDown, FaArrowUp, FaExchangeAlt, FaCheckDouble } from 'react-icons/fa';
import { motion } from 'framer-motion';
import authService from '../services/authService';

const NotificationDropdown = () => {
    const [user] = useState(authService.getCurrentUser());
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    const loadNotifications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [notifs, countData] = await Promise.all([
                authService.getNotifications(user.id),
                authService.getUnreadNotificationCount(user.id)
            ]);
            setNotifications(notifs.slice(0, 10)); // Show last 10
            setUnreadCount(countData.count || 0);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial load and polling
    useEffect(() => {
        if (user) {
            loadNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(() => {
                authService.getUnreadNotificationCount(user.id)
                    .then(data => setUnreadCount(data.count || 0))
                    .catch(console.error);
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [user, loadNotifications]);

    const handleNotificationClick = async (notif) => {
        if (!notif.read) {
            try {
                await authService.markNotificationRead(notif.id);
                setNotifications(notifications.map(n =>
                    n.id === notif.id ? { ...n, read: true } : n
                ));
                setUnreadCount(Math.max(0, unreadCount - 1));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const markAllRead = async () => {
        if (!user) return;
        try {
            await authService.markAllNotificationsRead(user.id);
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
                return <FaArrowDown className="text-white" />;
            case 'TRANSFER_SENT':
                return <FaArrowUp className="text-white" />;
            case 'CONVERSION':
                return <FaExchangeAlt className="text-white" />;
            default:
                return <FaCheckCircle className="text-white" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'TRANSFER_RECEIVED':
            case 'DEPOSIT':
                return 'bg-success';
            case 'TRANSFER_SENT':
                return 'bg-danger';
            case 'CONVERSION':
                return 'bg-info';
            default:
                return 'bg-primary';
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

    const handleToggle = (isOpen) => {
        setShow(isOpen);
        if (isOpen) {
            loadNotifications();
        }
    };

    return (
        <Dropdown align="end" className="notification-dropdown" show={show} onToggle={handleToggle}>
            <Dropdown.Toggle variant="link" className="p-0 text-decoration-none text-dark position-relative no-caret" id="dropdown-notif">
                <motion.div
                    animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                    transition={{ repeat: Infinity, repeatDelay: 5, duration: 0.5 }}
                >
                    <FaBell size={20} className="text-secondary" />
                </motion.div>
                {unreadCount > 0 && (
                    <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle border border-light" style={{ fontSize: '0.6rem' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="p-0 border-0 shadow-lg" style={{ width: '380px', maxHeight: '500px', overflow: 'hidden' }}>
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                    <h6 className="fw-bold mb-0">Notifications</h6>
                    {unreadCount > 0 && (
                        <Button variant="link" className="text-decoration-none p-0 small fw-bold d-flex align-items-center gap-1" onClick={markAllRead} style={{ fontSize: '0.8rem' }}>
                            <FaCheckDouble size={12} /> Mark all read
                        </Button>
                    )}
                </div>

                <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                    {loading ? (
                        <div className="p-4 text-center">
                            <Spinner size="sm" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-5 text-center text-muted">
                            <FaBell size={32} className="mb-2 opacity-50" />
                            <p className="mb-0 small">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <Dropdown.Item
                                key={notif.id}
                                className={`p-3 border-bottom position-relative ${!notif.read ? 'bg-primary bg-opacity-10' : ''}`}
                                onClick={() => handleNotificationClick(notif)}
                                style={{ whiteSpace: 'normal' }}
                            >
                                <div className="d-flex gap-3">
                                    <div className={`rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center ${getBgColor(notif.type)}`} style={{ width: '40px', height: '40px' }}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <h6 className={`mb-1 small fw-bold ${!notif.read ? 'text-dark' : 'text-muted'}`}>{notif.title}</h6>
                                            {!notif.read && <span className="bg-primary rounded-circle" style={{ width: '8px', height: '8px', marginTop: '6px' }}></span>}
                                        </div>
                                        <p className="mb-1 text-muted small lh-sm">{notif.message}</p>
                                        {notif.amount > 0 && (
                                            <span className={`fw-bold small ${notif.type === 'TRANSFER_SENT' ? 'text-danger' : 'text-success'}`}>
                                                {notif.type === 'TRANSFER_SENT' ? '-' : '+'}{notif.currency} {notif.amount.toLocaleString()}
                                            </span>
                                        )}
                                        <div>
                                            <small className="text-secondary fw-semibold" style={{ fontSize: '0.7rem' }}>
                                                {formatTime(notif.createdAt)}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </Dropdown.Item>
                        ))
                    )}
                </div>
                <div className="p-2 text-center bg-light border-top">
                    <a href="/transactions" className="text-decoration-none small text-muted fw-bold">View All Transactions</a>
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default NotificationDropdown;
