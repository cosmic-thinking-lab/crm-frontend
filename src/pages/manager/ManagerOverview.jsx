import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { 
    LayoutDashboard, 
    Target, 
    Users, 
    TrendingUp, 
    BarChart3,
    Activity,
    ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ delay, duration: 0.5 }}
        className="glass-card"
        style={{
            padding: '28px',
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            minWidth: '260px',
            background: `linear-gradient(135deg, rgba(${color}, 0.08) 0%, rgba(${color}, 0.02) 100%)`,
            border: `1px solid rgba(${color}, 0.2)`,
            borderRadius: '24px',
            boxShadow: `0 15px 35px rgba(0,0,0,0.2)`
        }}
    >
        {/* Background Glow */}
        <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '120px',
            height: '120px',
            background: `radial-gradient(circle, rgba(${color}, 0.2) 0%, transparent 70%)`,
            zIndex: 0,
            filter: 'blur(20px)'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '16px',
                    background: `rgba(${color}, 0.15)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: `rgb(${color})`,
                    boxShadow: `0 8px 16px rgba(${color}, 0.1)`,
                    border: `1px solid rgba(${color}, 0.2)`
                }}>
                    <Icon size={28} />
                </div>
                <div style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: `rgba(${color}, 0.1)`,
                    fontSize: '11px',
                    fontWeight: '700',
                    color: `rgb(${color})`,
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                }}>
                    Real-time
                </div>
            </div>
            
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                {title}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'white', letterSpacing: '-1.5px' }}>
                    {value || '0'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(139, 92, 246, 0.1)', padding: '4px 8px', borderRadius: '8px', color: '#a78bfa', fontSize: '11px', fontWeight: '700' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 8px #a78bfa' }} />
                    Active
                </div>
            </div>
        </div>
    </motion.div>
);

const ManagerOverview = () => {
    const [project, setProject] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Get assigned project
            const { data: projectsData } = await API.get('/managers/my-projects');
            if (!projectsData.data || projectsData.data.length === 0) {
                setError("No projects assigned yet.");
                setLoading(false);
                return;
            }

            const assignedProject = projectsData.data[0]; // Take first project
            setProject(assignedProject);

            // 2. Get project stats
            const { data: statsData } = await API.get(`/dashboard/projects/${assignedProject._id}`);
            setStats(statsData.data);
        } catch (error) {
            console.error("Failed to fetch manager data", error);
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    Loading Project Overview...
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '20px', marginBottom: '12px' }}>{error}</p>
                    <p style={{ fontSize: '14px' }}>Please contact admin if you think this is a mistake.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '36px', marginBottom: '8px' }}>{project?.name} Overview</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time statistics for your assigned project</p>
                </div>
                <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <Activity size={14} color="#a78bfa" />
                    <span>Project Active</span>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <StatCard 
                    title="Total Leads" 
                    value={stats?.totalLeads} 
                    icon={Target} 
                    color="139, 92, 246" 
                    delay={0.1}
                />
                <StatCard 
                    title="Converted Leads" 
                    value={stats?.convertedLeads} 
                    icon={TrendingUp} 
                    color="167, 139, 250" 
                    delay={0.2}
                />
                <StatCard 
                    title="Conversion Rate" 
                    value={stats?.conversionRate} 
                    icon={LayoutDashboard} 
                    color="124, 58, 237" 
                    delay={0.3}
                />
                <StatCard 
                    title="Team Performance" 
                    value={stats?.bdaPerformance?.length || 0} 
                    icon={Users} 
                    color="192, 132, 252" 
                    delay={0.4}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {/* Status Distribution */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card" 
                    style={{ padding: '24px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <BarChart3 size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Lead Status Distribution</h3>
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

                {/* BDA Performance */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card" 
                    style={{ padding: '24px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <Users size={20} color="var(--secondary)" />
                        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Team Activity</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {stats?.bdaPerformance?.slice(0, 5).map((bda, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: '700' }}>
                                        {bda._id?.name?.charAt(0)}
                                    </div>
                                    <span>{bda._id?.name}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontWeight: '600' }}>{bda.total} Leads</span>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bda.converted} Converted</p>
                                </div>
                            </div>
                        ))}
                        {(!stats?.bdaPerformance || stats.bdaPerformance.length === 0) && (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No BDA activity recorded.</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ManagerOverview;
