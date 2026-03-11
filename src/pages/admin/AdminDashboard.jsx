import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { GraduationCap, Building2, University, Cloud, X, LayoutDashboard, Target, Users, ChevronRight, LogOut, Sun, Moon, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';



const productCards = [
    {
        title: 'School LMS',
        icon: GraduationCap,
        color: '14, 165, 233',
        lmsType: 'School LMS',
        description: 'K-12 Educational platform leads and management',
        gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(14, 165, 233, 0.03))'
    },
    {
        title: 'Institute LMS',
        icon: Building2,
        color: '139, 92, 246',
        lmsType: 'Institute LMS',
        description: 'Coaching centers and training institute inquiries',
        gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.03))'
    },
    {
        title: 'University LMS',
        icon: University,
        color: '236, 72, 153',
        lmsType: 'University LMS',
        description: 'Higher education and university scale deployments',
        gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(236, 72, 153, 0.03))'
    },
    {
        title: 'SAAS Solutions',
        icon: Cloud,
        color: '245, 158, 11',
        lmsType: 'SAAS',
        description: 'Subscription-based cloud learning management',
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.03))'
    },
];

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/admin/dashboard');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const getLeadCount = (lmsType) => {
        if (!stats?.productLeads) return 0;
        switch (lmsType) {
            case 'School LMS': return stats.productLeads.schoolLMS || 0;
            case 'Institute LMS': return stats.productLeads.instituteLMS || 0;
            case 'University LMS': return stats.productLeads.universityLMS || 0;
            case 'SAAS': return stats.productLeads.saas || 0;
            default: return 0;
        }
    };

    const handleCardClick = (card) => {
        navigate(`/admin/lms/${encodeURIComponent(card.lmsType)}/dashboard`);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '16px'
            }}>
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    Loading...
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 40px'
        }}>
            {/* Top Bar */}
            <header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 0',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Target size={20} color="white" />
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '-0.5px' }}>COSMIC CRM</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        className="glass-card"
                        onClick={toggleTheme}
                        style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)'
                        }}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '14px', fontWeight: '600' }}>{user?.name}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.role}</p>
                        </div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--secondary), var(--accent))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            color: 'white',
                            fontSize: '14px'
                        }}>
                            {user?.name?.charAt(0)}
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            color: '#fb7185',
                            background: 'rgba(251, 113, 133, 0.08)',
                            border: '1px solid rgba(251, 113, 133, 0.15)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'var(--transition)'
                        }}
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Center Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: '60px'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ textAlign: 'center', marginBottom: '48px' }}
                >
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: '800',
                        letterSpacing: '-1.5px',
                        background: 'linear-gradient(135deg, var(--text-main) 0%, var(--text-muted) 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '12px'
                    }}>
                        Select a Product
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '500px' }}>
                        Choose a product to view its dashboard, manage leads, and track BDA performance
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '24px',
                    width: '100%',
                    maxWidth: '1200px'
                }}>
                    {productCards.map((card, index) => {
                        const Icon = card.icon;
                        const leadCount = getLeadCount(card.lmsType);

                        return (
                            <motion.div
                                key={card.lmsType}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                whileHover={{ y: -10, scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="glass-card"
                                onClick={() => handleCardClick(card)}
                                style={{
                                    padding: '32px 24px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    gap: '20px',
                                    background: card.gradient,
                                    border: '1px solid var(--glass-border)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    minHeight: '260px'
                                }}
                            >
                                {/* Background glow */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-40px',
                                    right: '-40px',
                                    width: '160px',
                                    height: '160px',
                                    background: `radial-gradient(circle, rgba(${card.color}, 0.15) 0%, transparent 70%)`,
                                    zIndex: 0
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-40px',
                                    left: '-40px',
                                    width: '120px',
                                    height: '120px',
                                    background: `radial-gradient(circle, rgba(${card.color}, 0.08) 0%, transparent 70%)`,
                                    zIndex: 0
                                }} />

                                {/* Icon */}
                                <div style={{
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '20px',
                                    background: `rgba(${card.color}, 0.12)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: `rgb(${card.color})`,
                                    boxShadow: `0 8px 24px rgba(${card.color}, 0.12)`,
                                    zIndex: 1
                                }}>
                                    <Icon size={36} />
                                </div>

                                {/* Title */}
                                <div style={{ zIndex: 1 }}>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        marginBottom: '8px',
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {card.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '13px',
                                        color: 'var(--text-muted)',
                                        lineHeight: '1.5'
                                    }}>
                                        {card.description}
                                    </p>
                                </div>

                                {/* Lead count */}
                                <div style={{
                                    marginTop: 'auto',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    background: `rgba(${card.color}, 0.08)`,
                                    border: `1px solid rgba(${card.color}, 0.15)`,
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: `rgb(${card.color})`,
                                    zIndex: 1
                                }}>
                                    {leadCount} Leads
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
