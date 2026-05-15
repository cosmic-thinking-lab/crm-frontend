import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
    Users,
    Target,
    TrendingUp,
    PieChart as PieIcon,
    BarChart as BarIcon,
    ArrowLeft,
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
    Cell
} from 'recharts';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color }) => (
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
        </div>
        <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '4px' }}>{title}</h3>
        <p style={{ fontSize: '28px', fontWeight: '700' }}>{value}</p>
    </motion.div>
);

const LmsDashboard = () => {
    const { lmsType } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // 1. Get all projects to find the ID for the current lmsType
                const { data: projectsRes } = await API.get('/projects');
                const foundProject = projectsRes.data.find(p => p.name === lmsType);
                
                if (foundProject) {
                    setProject(foundProject);
                    // 2. Fetch project-specific stats
                    const { data: statsRes } = await API.get(`/dashboard/projects/${foundProject._id}`);
                    setStats(statsRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [lmsType]);

    if (loading) return <div style={{ color: 'var(--text-main)', padding: '40px' }}>Loading {lmsType} Dashboard...</div>;

    const COLORS = ['#8b5cf6', '#a78bfa', '#c084fc', '#6366f1', '#7c3aed'];

    const productCount = stats?.totalLeads || 0;
    const totalBdaCount = stats?.totalBdas || 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="btn btn-secondary"
                    style={{ padding: '8px', borderRadius: '10px' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '4px' }}>{lmsType} Overview</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Performance metrics for {lmsType}</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <StatCard title="Product Leads" value={productCount} icon={Target} color="139, 92, 246" />
                <StatCard title="Total BDAs" value={totalBdaCount} icon={Users} color="124, 58, 237" />
                <StatCard title="Conversion Rate" value={stats?.conversionRate || '0%'} icon={TrendingUp} color="167, 139, 250" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarIcon size={20} color="var(--primary)" />
                        BDA Performance ({lmsType})
                    </h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.bdaPerformance?.map(b => ({
                                bdaName: b._id?.name || 'Unknown',
                                totalLeads: b.total,
                                convertedLeads: b.converted
                            })) || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="bdaName" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                    itemStyle={{ color: 'var(--text-main)' }}
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
                                    contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LmsDashboard;
