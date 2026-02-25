import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Bell, Check, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/common/notifications');
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const markAsRead = async (id) => {
        try {
            await API.patch(`/common/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await API.delete(`/common/notifications/${id}`);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 'calc(var(--nav-height) + 12px)',
            right: '20px',
            width: '360px',
            maxHeight: '480px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card"
                style={{ padding: '0', overflow: 'hidden' }}
            >
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Notifications</h3>
                    <span style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer' }}>Mark all as read</span>
                </div>

                <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                    <AnimatePresence>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Bell size={32} style={{ marginBottom: '12px', opacity: 0.2, display: 'block', margin: '0 auto' }} />
                                <p>No new notifications</p>
                            </div>
                        ) : notifications.map((n) => (
                            <motion.div
                                key={n._id}
                                layout
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0, x: 20 }}
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: '1px solid var(--glass-border)',
                                    background: n.read ? 'transparent' : 'rgba(14, 165, 233, 0.05)',
                                    position: 'relative',
                                    display: 'flex',
                                    gap: '12px'
                                }}
                            >
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: n.read ? 'transparent' : 'var(--primary)',
                                    marginTop: '6px'
                                }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '13px', fontWeight: n.read ? '400' : '600', marginBottom: '4px', lineHeight: '1.4' }}>
                                        {n.message}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <Clock size={12} />
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {!n.read && (
                                        <button
                                            onClick={() => markAsRead(n._id)}
                                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(n._id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default Notifications;
