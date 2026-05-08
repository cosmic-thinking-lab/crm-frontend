import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
    UserPlus,
    Search,
    MoreVertical,
    Shield,
    ToggleLeft,
    ToggleRight,
    Mail,
    ArrowLeft,
    Users,
    Edit2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../../components/Modal';
import UserForm from '../../components/UserForm';

const LmsBdas = () => {
    const { lmsType } = useParams();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    const fetchProjectAndMembers = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // 1. Fetch current project to get its ID
            const projectsRes = await API.get('/projects');
            const foundProject = projectsRes.data.data.find(p => p.name === lmsType || p.slug === lmsType);
            
            if (!foundProject) {
                console.error("Project not found");
                setLoading(false);
                return;
            }
            setProject(foundProject);

            // 2. Fetch members for this project
            const membersRes = await API.get(`/projects/${foundProject._id}/members`);
            setMembers(membersRes.data.data || []);
        } catch (error) {
            console.error("Failed to fetch project or members", error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectAndMembers();
    }, [lmsType]); // Refetch if lmsType changes

    const handleCreateUser = async (formData) => {
        if (!project) return;
        setFormLoading(true);
        try {
            // First create the user
            const userRes = await API.post('/users', formData);
            const newUser = userRes.data.data;

            // Then assign them to the current project
            await API.post(`/projects/${project._id}/members`, {
                userId: newUser._id,
                role: formData.globalRole || 'bda'
            });

            setIsModalOpen(false);
            fetchProjectAndMembers(false);
        } catch (error) {
            console.error("Failed to create and assign user", error);
            alert(error.response?.data?.message || "Failed to create user");
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateUser = async (formData) => {
        if (!selectedMember) return;
        console.log("Updating user:", selectedMember.userId._id, formData);
        setFormLoading(true);
        try {
            // Update user profile (strip globalRole - handled separately via project member)
            const profileUpdate = { ...formData };
            delete profileUpdate.globalRole;
            
            await API.patch(`/users/${selectedMember.userId._id}`, profileUpdate);
            
            // Update project member role if it changed
            if (formData.globalRole && formData.globalRole !== selectedMember.role) {
                await API.patch(`/projects/${project._id}/members/${selectedMember._id}`, {
                    role: formData.globalRole
                });
            }

            console.log("User and role updated successfully");
            setIsModalOpen(false);
            setSelectedMember(null);
            fetchProjectAndMembers(false);
        } catch (error) {
            console.error("Failed to update user", error);
            alert(error?.response?.data?.message || "Failed to update user");
        } finally {
            setFormLoading(false);
        }
    };

    const openEditModal = (e, member) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMember(null);
    };



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
                    <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '4px' }}>{lmsType} BDA Team</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and monitor BDAs for {lmsType}</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-8px' }}>
                <button 
                    className="btn btn-primary" 
                    onClick={() => {
                        setSelectedMember(null);
                        setIsModalOpen(true);
                    }}
                    style={{ padding: '10px 16px', borderRadius: '12px' }}
                >
                    <UserPlus size={18} />
                    Add User
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={selectedMember ? "Edit User" : "Add New User"}
            >
                <UserForm 
                    onSubmit={selectedMember ? handleUpdateUser : handleCreateUser} 
                    loading={formLoading} 
                    initialData={selectedMember ? { ...selectedMember.userId, globalRole: selectedMember.role } : null}
                    showRole={true}
                />
            </Modal>

            <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search team members..."
                        className="input-field"
                        style={{ paddingLeft: '44px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {loading ? (
                    <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Loading team members...</div>
                ) : !project ? (
                    <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Project not found or loading...</div>
                ) : members.filter(m => m.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.userId.email.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No assigned members found matching your search.</div>
                ) : members.filter(m => m.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.userId.email.toLowerCase().includes(searchTerm.toLowerCase())).map((m) => (
                    <motion.div
                        key={m._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card"
                        style={{ padding: '24px', opacity: m.userId.isActive !== false ? 1 : 0.6, cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/lms/${encodeURIComponent(lmsType)}/bda/${m.userId._id}/leads`)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: m.userId.isActive !== false ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--glass-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: '700',
                                color: 'white'
                            }}>
                                {m.userId.name.charAt(0)}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedMember(m);
                                        setIsModalOpen(true);
                                    }}
                                    title="Edit User"
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                                >
                                    <Edit2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{m.userId.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                <Mail size={14} />
                                {m.userId.email}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '16px',
                            borderTop: '1px solid var(--glass-border)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                <Shield size={14} color="var(--primary)" />
                                <span style={{ color: 'var(--text-muted)' }}>Role:</span>
                                <span style={{ fontWeight: '600' }}>{m.role}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', color: 'var(--primary)', fontWeight: '600', fontSize: '13px' }}>
                                View Leads
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const ChevronRight = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

export default LmsBdas;
