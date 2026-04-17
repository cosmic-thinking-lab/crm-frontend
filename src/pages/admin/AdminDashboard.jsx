import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { GraduationCap, Building2, University, Cloud, X, LayoutDashboard, Target, Users, ChevronRight, LogOut, Sun, Moon, Bell, Plus, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../../components/Modal';



const productStyles = {
    'School LMS': { icon: GraduationCap, color: '14, 165, 233' },
    'Institute LMS': { icon: Building2, color: '139, 92, 246' },
    'University LMS': { icon: University, color: '236, 72, 153' },
    'SAAS': { icon: Cloud, color: '245, 158, 11' }
};

const defaultStyle = { icon: Folder, color: '34, 197, 94' };

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });

    const fetchData = async () => {
        try {
            const [statsRes, projectsRes] = await Promise.all([
                API.get('/dashboard/global'),
                API.get('/projects')
            ]);
            setStats(statsRes.data.data);
            setProjects(projectsRes.data.data || []);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getLeadCount = (lmsType) => {
        if (!stats?.projectDistribution) return 0;
        // Map the product name to the backend project name
        const project = stats.projectDistribution.find(p => p._id?.name === lmsType);
        return project ? project.count : 0;
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await API.post('/projects', newProject);
            setIsCreateModalOpen(false);
            setNewProject({ name: '', description: '' });
            fetchData();
        } catch (error) {
            console.error("Failed to create project", error);
            alert(error.response?.data?.message || "Failed to create project");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleCardClick = (projectName) => {
        navigate(`/admin/lms/${encodeURIComponent(projectName)}/dashboard`);
    };

    const getProjectCard = (p) => {
        const style = productStyles[p.name] || defaultStyle;
        return {
            ...p,
            icon: style.icon,
            color: style.color,
            gradient: `linear-gradient(135deg, rgba(${style.color}, 0.12), rgba(${style.color}, 0.03))`
        };
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
            display: 'flex',
            flexDirection: 'column',
            padding: '0 20px'
        }}>


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
                    style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', width: '100%' }}
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
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '500px', margin: '0 auto 24px' }}>
                        Choose a product to view its dashboard, manage leads, and track BDA performance
                    </p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ padding: '12px 24px', borderRadius: '14px' }}
                    >
                        <Plus size={20} />
                        New Project
                    </button>
                </motion.div>

                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Create New Project"
                >
                    <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Project Name</label>
                            <input 
                                className="input-field"
                                value={newProject.name}
                                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                placeholder="e.g. Health LMS"
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Description</label>
                            <textarea 
                                className="input-field"
                                style={{ minHeight: '100px', resize: 'vertical' }}
                                value={newProject.description}
                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                placeholder="Describe the purpose of this project..."
                                required
                            />
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={createLoading} style={{ justifyContent: 'center' }}>
                            {createLoading ? 'Creating...' : 'Create Project'}
                        </button>
                    </form>
                </Modal>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '24px',
                    width: '100%',
                    maxWidth: '1200px'
                }}>
                    {projects.map((p, index) => {
                        const card = getProjectCard(p);
                        const Icon = card.icon;
                        const leadCount = getLeadCount(card.name);

                        return (
                            <motion.div
                                key={card._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                whileHover={{ y: -10, scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="glass-card"
                                onClick={() => handleCardClick(card.name)}
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
                                        {card.name}
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
