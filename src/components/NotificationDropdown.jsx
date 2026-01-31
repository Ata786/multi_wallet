import React, { useState } from 'react';
import { Dropdown, Badge, Button } from 'react-bootstrap';
import { FaBell, FaCheckCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import TimeAgo from 'react-timeago';
import FraudAlertModal from './FraudAlertModal';

const NOTIFICATIONS_DATA = [
    { id: 1, type: 'fraud', title: 'Unusual Activity Detected', desc: 'Transaction of $6,000 flagged for review', time: new Date(Date.now() - 1000 * 60 * 30), read: false }, // 30 mins ago
    { id: 2, type: 'success', title: 'Transfer Successful', desc: '€500 transferred to INR wallet', time: new Date(Date.now() - 1000 * 60 * 60 * 2), read: false }, // 2 hours ago
    { id: 3, type: 'info', title: 'New Wallet Created', desc: 'Your GBP wallet is ready to use', time: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true }, // 1 day ago
];

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
    const [showFraudModal, setShowFraudModal] = useState(false);
    const [selectedFraudTx, setSelectedFraudTx] = useState(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = (notif) => {
        // Mark as read
        const updated = notifications.map(n => n.id === notif.id ? { ...n, read: true } : n);
        setNotifications(updated);

        if (notif.type === 'fraud') {
            setSelectedFraudTx({ id: 'TRX-99887766', amount: '$6,000.00', location: 'Lagos, Nigeria' });
            setShowFraudModal(true);
        }
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'fraud': return <FaExclamationTriangle className="text-white" />;
            case 'success': return <FaCheckCircle className="text-white" />;
            default: return <FaInfoCircle className="text-white" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'fraud': return 'bg-danger';
            case 'success': return 'bg-success';
            default: return 'bg-info';
        }
    };

    return (
        <>
            <Dropdown align="end" className="notification-dropdown">
                <Dropdown.Toggle variant="link" className="p-0 text-decoration-none text-dark position-relative no-caret" id="dropdown-notif">
                    <motion.div animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}} transition={{ repeat: Infinity, repeatDelay: 5, duration: 0.5 }}>
                        <FaBell size={20} className="text-secondary" />
                    </motion.div>
                    {unreadCount > 0 && (
                        <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle border border-light" style={{ fontSize: '0.6rem' }}>
                            {unreadCount}
                        </Badge>
                    )}
                </Dropdown.Toggle>

                <Dropdown.Menu className="p-0 border-0 shadow-lg" style={{ width: '380px', maxHeight: '500px', overflow: 'hidden' }}>
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                        <h6 className="fw-bold mb-0">Notifications</h6>
                        {unreadCount > 0 && (
                            <Button variant="link" className="text-decoration-none p-0 small fw-bold" onClick={markAllRead} style={{ fontSize: '0.8rem' }}>
                                Mark all as read
                            </Button>
                        )}
                    </div>

                    <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-muted">No notifications</div>
                        ) : (
                            notifications.map(notif => (
                                <Dropdown.Item
                                    key={notif.id}
                                    className={`p-3 border-bottom position-relative ${!notif.read ? 'bg-primary-subtle bg-opacity-10' : ''}`}
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
                                            <p className="mb-1 text-muted small lh-sm">{notif.desc}</p>
                                            <small className="text-secondary fw-semibold" style={{ fontSize: '0.7rem' }}>
                                                <TimeAgo date={notif.time} />
                                            </small>
                                            {notif.type === 'fraud' && (
                                                <div className="mt-2">
                                                    <Button size="sm" variant="outline-danger" className="py-0 px-2 small" style={{ fontSize: '0.75rem' }}>View Details</Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Dropdown.Item>
                            ))
                        )}
                    </div>
                    <div className="p-2 text-center bg-light border-top">
                        <Button variant="link" className="text-decoration-none small text-muted fw-bold p-0">View All Notifications</Button>
                    </div>
                </Dropdown.Menu>
            </Dropdown>

            <FraudAlertModal
                show={showFraudModal}
                onHide={() => setShowFraudModal(false)}
                transaction={selectedFraudTx}
            />
        </>
    );
};

export default NotificationDropdown;
