import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { 
    LayoutDashboard, 
    Target, 
    Users, 
    Folder, 
    TrendingUp, 
    BarChart3,
    ArrowUpRight,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="glass-card"
        style={{
            padding: '24px',
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            minWidth: '240px',
            background: `linear-gradient(135deg, rgba(${color}, 0.1), rgba(${color}, 0.02))`,
            border: `1px solid rgba(${color}, 0.15)`
        }}
    >
        <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: `radial-gradient(circle, rgba(${color}, 0.15) 0%, transparent 70%)`,
            zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `rgba(${color}, 0.12)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: `rgb(${color})`,
                marginBottom: '16px'
            }}>
                <Icon size={24} />
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                {title}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>
                    {value || '0'}
                </h2>
                <span style={{ color: '#a78bfa', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <ArrowUpRight size={14} />
                    Active
                </span>
            </div>
        </div>
    </motion.div>
);

const Overview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await API.get('/dashboard/global');
            setStats(data.data);
        } catch (error) {
            console.error("Failed to fetch global stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    Loading Performance Metrics...
                </motion.div>
            </div>
        );
    }

    const totals = stats?.totals || { projects: 0, leads: 0, bdas: 0 };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '36px', marginBottom: '8px' }}>Global Overview</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time statistics across all products and teams</p>
                </div>
                <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <Activity size={14} color="#a78bfa" />
                    <span>System Live</span>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <StatCard 
                    title="Total Projects" 
                    value={totals.projects} 
                    icon={Folder} 
                    color="139, 92, 246" 
                    delay={0.1}
                />
                <StatCard 
                    title="System Leads" 
                    value={totals.leads} 
                    icon={Target} 
                    color="167, 139, 250" 
                    delay={0.2}
                />
                <StatCard 
                    title="Team Members" 
                    value={totals.bdas} 
                    icon={Users} 
                    color="124, 58, 237" 
                    delay={0.3}
                />
                <StatCard 
                    title="Conversion Rate" 
                    value={totals.conversionRate} 
                    icon={TrendingUp} 
                    color="192, 132, 252" 
                    delay={0.4}
                />
            </div>

            {/* Distribution Charts Visual (Static Mock for now or using Aggregate data) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card" 
                    style={{ padding: '24px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <BarChart3 size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Project Distribution</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {stats?.projectDistribution?.map((proj, idx) => (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span>{proj._id?.name || 'Unknown Project'}</span>
                                    <span style={{ fontWeight: '600' }}>{proj.count} Leads</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(proj.count / totals.leads) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.8 }}
                                        style={{ height: '100%', background: 'var(--primary-gradient)' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card" 
                    style={{ padding: '24px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <TrendingUp size={20} color="var(--secondary)" />
                        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Lead Status</h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {stats?.statusDistribution?.map((stat, idx) => (
                            <div key={idx} className="glass-card" style={{ 
                                padding: '12px 20px', 
                                flex: '1 1 140px', 
                                textAlign: 'center',
                                background: 'rgba(255,255,255,0.03)'
                            }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{stat._id}</p>
                                <p style={{ fontSize: '20px', fontWeight: '700' }}>{stat.count}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Overview;
