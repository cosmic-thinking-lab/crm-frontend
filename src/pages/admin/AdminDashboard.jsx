import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import {
    Users,
    Target,
    TrendingUp,
    PieChart as PieIcon,
    BarChart as BarIcon,
    Activity
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card"
        style={{ padding: '24px', flex: 1, minWidth: '240px' }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `rgba(${color}, 0.1)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: `rgb(${color})`
            }}>
                <Icon size={24} />
            </div>
            {trend && (
                <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: trend.startsWith('+') ? '#10b981' : '#ef4444',
                    background: trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    height: 'fit-content'
                }}>
                    {trend}
                </span>
            )}
        </div>
        <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '4px' }}>{title}</h3>
        <p style={{ fontSize: '28px', fontWeight: '700' }}>{value}</p>
    </motion.div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div style={{ color: 'white' }}>Loading Dashboard...</div>;

    const COLORS = ['#0ea5e9', '#6366f1', '#f43f5e', '#10b981', '#f59e0b'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '4px' }}>System Overview</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time performance metrics</p>
                </div>
                <button className="btn btn-primary">
                    <Activity size={18} />
                    View Live Logs
                </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <StatCard title="Total Leads" value={stats?.totalLeads || 0} icon={Target} color="14, 165, 233" trend="+12%" />
                <StatCard title="Total BDAs" value={stats?.bdaPerformance?.length || 0} icon={Users} color="99, 102, 241" trend="0%" />
                <StatCard title="Conversion Rate" value="24.5%" icon={TrendingUp} color="16, 185, 129" trend="+5.2%" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarIcon size={20} color="var(--primary)" />
                        BDA Performance
                    </h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.bdaPerformance || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="bdaName" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="totalLeads" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                                <Bar dataKey="convertedLeads" fill="var(--secondary)" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PieIcon size={20} color="var(--accent)" />
                        Lead Status
                    </h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.statusCounts || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {(stats?.statusCounts || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
