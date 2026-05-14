import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { GraduationCap, Building2, University, Cloud, X, LayoutDashboard, Target, Users, ChevronRight, LogOut, Sun, Moon, Bell, Plus, Folder, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../../components/Modal';
import LeadForm from '../../components/LeadForm';
import ConfirmModal from '../../components/ConfirmModal';



const productStyles = {
    'School LMS': { icon: GraduationCap, color: '139, 92, 246' }, // Purple
    'Institute LMS': { icon: Building2, color: '124, 58, 237' }, // Darker Purple
    'University LMS': { icon: University, color: '167, 139, 250' }, // Lighter Purple
    'SAAS': { icon: Cloud, color: '192, 132, 252' } // Violet
};

const defaultStyle = { icon: Folder, color: '139, 92, 246' };

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
    const [addingLeadToProject, setAddingLeadToProject] = useState(null);
    const [leadCreateLoading, setLeadCreateLoading] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

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

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await API.patch(`/projects/${editingProject._id}`, {
                name: editingProject.name,
                description: editingProject.description
            });
            setEditingProject(null);
            fetchData();
        } catch (error) {
            console.error("Failed to update project", error);
            alert(error.response?.data?.message || "Failed to update project");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;
        setCreateLoading(true);
        try {
            await API.delete(`/projects/${projectToDelete._id}`);
            setIsConfirmDeleteOpen(false);
            setProjectToDelete(null);
            fetchData();
        } catch (error) {
            console.error("Failed to delete project", error);
            alert(error.response?.data?.message || "Failed to delete project");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleCreateLeadForProject = async (formData) => {
        setLeadCreateLoading(true);
        try {
            await API.post(`/projects/${addingLeadToProject._id}/leads`, formData);
            setAddingLeadToProject(null);
            fetchData(); // Refresh to see updated count
        } catch (error) {
            console.error("Failed to create lead", error);
            alert(error.response?.data?.message || "Failed to create lead");
        } finally {
            setLeadCreateLoading(false);
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
                paddingBottom: '60px',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Global Stats Section */}
                {!loading && stats && (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                        gap: '24px',
                        width: '100%',
                        marginBottom: '60px'
                    }}>
                        {[
                            { title: 'Total Leads', value: stats.totals?.leads || 0, icon: Target, color: '139, 92, 246' },
                            { title: 'Active Users', value: stats.totals?.bdas || 0, icon: Users, color: '124, 58, 237' },
                            { title: 'Total Projects', value: projects.length, icon: Folder, color: '167, 139, 250' }
                        ].map((s, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                className="glass-card"
                                style={{
                                    padding: '28px 32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '24px',
                                    background: `linear-gradient(135deg, rgba(${s.color}, 0.1) 0%, rgba(${s.color}, 0.02) 100%)`,
                                    border: `1px solid rgba(${s.color}, 0.2)`,
                                    borderRadius: '24px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    right: '-20px',
                                    width: '120px',
                                    height: '120px',
                                    background: `radial-gradient(circle, rgba(${s.color}, 0.15) 0%, transparent 70%)`,
                                    filter: 'blur(20px)',
                                    zIndex: 0
                                }} />
                                
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '18px',
                                    background: `rgba(${s.color}, 0.15)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: `rgb(${s.color})`,
                                    border: `1px solid rgba(${s.color}, 0.25)`,
                                    zIndex: 1,
                                    boxShadow: `0 8px 20px rgba(${s.color}, 0.15)`
                                }}>
                                    <s.icon size={28} />
                                </div>
                                
                                <div style={{ zIndex: 1 }}>
                                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.title}</p>
                                    <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.03em', color: 'white' }}>{s.value || 0}</h2>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
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
                    isOpen={isCreateModalOpen || !!editingProject}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setEditingProject(null);
                    }}
                    title={editingProject ? "Edit Project" : "Create New Project"}
                >
                    <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Project Name</label>
                            <input 
                                className="input-field"
                                value={editingProject ? editingProject.name : newProject.name}
                                onChange={(e) => editingProject 
                                    ? setEditingProject({ ...editingProject, name: e.target.value })
                                    : setNewProject({ ...newProject, name: e.target.value })
                                }
                                placeholder="e.g. Health LMS"
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Description</label>
                            <textarea 
                                className="input-field"
                                style={{ minHeight: '100px', resize: 'vertical' }}
                                value={editingProject ? editingProject.description : newProject.description}
                                onChange={(e) => editingProject
                                    ? setEditingProject({ ...editingProject, description: e.target.value })
                                    : setNewProject({ ...newProject, description: e.target.value })
                                }
                                placeholder="Describe the purpose of this project..."
                                required
                            />
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={createLoading} style={{ justifyContent: 'center' }}>
                            {createLoading ? 'Processing...' : (editingProject ? 'Update Project' : 'Create Project')}
                        </button>
                    </form>
                </Modal>

                <ConfirmModal
                    isOpen={isConfirmDeleteOpen}
                    onClose={() => setIsConfirmDeleteOpen(false)}
                    onConfirm={handleDeleteProject}
                    title="Delete Project"
                    message={`Are you sure you want to delete "${projectToDelete?.name}"? This will remove all associated data.`}
                    confirmText="Delete Project"
                />

                <Modal
                    isOpen={!!addingLeadToProject}
                    onClose={() => setAddingLeadToProject(null)}
                    title={`Add New Lead to ${addingLeadToProject?.name}`}
                >
                    <LeadForm 
                        onSubmit={handleCreateLeadForProject} 
                        loading={leadCreateLoading} 
                        hideLmsType={true} 
                    />
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
                                whileHover={{ 
                                    y: -12,
                                    scale: 1.02,
                                    transition: { duration: 0.2, ease: "easeOut" }
                                }}
                                className="glass-card"
                                onClick={() => handleCardClick(card.name)}
                                style={{
                                    padding: '16px 20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    gap: '12px',
                                    background: `linear-gradient(165deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)`,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    minHeight: '200px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                    borderRadius: '28px'
                                }}
                            >
                                {/* Top Accent Glow Line */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: `linear-gradient(90deg, transparent, rgb(${card.color}), transparent)`,
                                    opacity: 0.6
                                }} />

                                {/* Project Actions */}
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    display: 'flex',
                                    gap: '8px',
                                    zIndex: 10
                                }}>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingProject(p);
                                        }}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            borderRadius: '10px', 
                                            padding: '6px',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer'
                                        }}
                                        title="Edit Project"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setProjectToDelete(p);
                                            setIsConfirmDeleteOpen(true);
                                        }}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            borderRadius: '10px', 
                                            padding: '6px',
                                            color: 'var(--accent)',
                                            cursor: 'pointer'
                                        }}
                                        title="Delete Project"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {/* Floating Background Glows */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-10%',
                                    right: '-10%',
                                    width: '180px',
                                    height: '180px',
                                    background: `radial-gradient(circle, rgba(${card.color}, 0.15) 0%, transparent 70%)`,
                                    zIndex: 0,
                                    filter: 'blur(30px)'
                                }} />

                                {/* Icon Wrapper with Soft Glow */}
                                <div style={{ position: 'relative', zIndex: 1, marginBottom: '0px' }}>
                                    <div style={{
                                        position: 'absolute',
                                        inset: '-12px',
                                        background: `rgba(${card.color}, 0.25)`,
                                        borderRadius: '28px',
                                        filter: 'blur(12px)',
                                        opacity: 0.4
                                    }} />
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '24px',
                                        background: `linear-gradient(135deg, rgba(${card.color}, 0.25), rgba(${card.color}, 0.05))`,
                                        border: `1px solid rgba(${card.color}, 0.3)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: `rgb(${card.color})`,
                                        position: 'relative',
                                        zIndex: 2,
                                        boxShadow: `inset 0 0 25px rgba(${card.color}, 0.15)`
                                    }}>
                                        <Icon size={24} />
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div style={{ zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '800',
                                        color: 'white',
                                        letterSpacing: '-0.03em',
                                        lineHeight: 1.2
                                    }}>
                                        {card.name}
                                    </h3>
                                    <p style={{
                                        fontSize: '13px',
                                        color: 'rgba(255,255,255,0.4)',
                                        lineHeight: '1.4',
                                        maxWidth: '200px',
                                        margin: '0 auto'
                                    }}>
                                        {card.description}
                                    </p>
                                </div>

                                {/* Footer Stats and Quick Action */}
                                <div style={{
                                    marginTop: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    zIndex: 1,
                                    paddingTop: '8px',
                                    borderTop: '1px solid rgba(255,255,255,0.06)'
                                }}>
                                    <div style={{
                                        flex: 1,
                                        padding: '10px 14px',
                                        borderRadius: '16px',
                                        background: `rgba(${card.color}, 0.08)`,
                                        border: `1px solid rgba(${card.color}, 0.12)`,
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: `rgb(${card.color})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: `rgb(${card.color})` }} />
                                        {leadCount} Leads
                                    </div>
                                    <motion.button 
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="btn btn-primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setAddingLeadToProject(p);
                                        }}
                                        style={{
                                            width: '46px',
                                            height: '46px',
                                            padding: 0,
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: `linear-gradient(135deg, rgb(${card.color}), rgba(${card.color}, 0.8))`,
                                            boxShadow: `0 8px 20px rgba(${card.color}, 0.3)`,
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                        title="Add Lead"
                                    >
                                        <Plus size={22} color="white" />
                                    </motion.button>
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
