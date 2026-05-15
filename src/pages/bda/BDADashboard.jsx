import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import {
    Target,
    Calendar,
    CheckCircle,
    Clock,
    TrendingUp,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const MiniStat = ({ title, value, icon: Icon, color }) => (
    <div className="glass-card" style={{
        padding: '16px',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        minWidth: '200px'
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `rgba(${color}, 0.1)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: `rgb(${color})`
        }}>
            <Icon size={20} />
        </div>
        <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{title}</p>
            <p style={{ fontSize: '18px', fontWeight: '700' }}>{value}</p>
        </div>
    </div>
);

const BDADashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/dashboard/me');
                setStats(data.data); // Backend returns { success: true, data: { ... } }
            } catch (error) {
                console.error("Failed to fetch BDA stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{ color: 'var(--text-main)' }}>Loading Dashboard...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '4px' }}>Welcome back!</h1>
                <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your leads today.</p>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <MiniStat title="My Total Leads" value={stats?.myLeads || 0} icon={Target} color="139, 92, 246" />
                <MiniStat title="Today's Follow-ups" value={stats?.todayFollowUpsCount || 0} icon={Calendar} color="124, 58, 237" />
                <MiniStat title="Conversions" value={stats?.myConversions || 0} icon={CheckCircle} color="167, 139, 250" />
                <MiniStat title="Conversion Rate" value={stats?.conversionRate || '0%'} icon={TrendingUp} color="192, 132, 252" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card"
                    style={{ padding: '32px', background: 'var(--glass)' }}
                >
                    <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Ready to convert?</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
                        You have {stats?.todayFollowUpsCount} leads scheduled for today.
                        Timed responses increase conversion rates by up to 40%.
                    </p>
                    <button className="btn btn-primary">
                        Start Calling Now
                        <ArrowRight size={18} />
                    </button>
                </motion.div>

                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>Lead Pipeline</h3>
                        <span style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer' }}>View All</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stats?.statusCounts?.map((status, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '100px', fontSize: '13px', color: 'var(--text-muted)' }}>{status._id}</div>
                                <div style={{ flex: 1, height: '8px', background: 'var(--bg-darker)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(status.count / stats.totalLeads) * 100}%` }}
                                        transition={{ duration: 1, delay: index * 0.1 }}
                                        style={{ height: '100%', background: 'var(--primary)' }}
                                    />
                                </div>
                                <div style={{ width: '30px', fontSize: '13px', textAlign: 'right' }}>{status.count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BDADashboard;
