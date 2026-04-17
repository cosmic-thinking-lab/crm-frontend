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
    Trash2,
    Edit2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../../components/Modal';
import UserForm from '../../components/UserForm';

const LmsBdas = () => {
    const { lmsType } = useParams();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // Fetch all users using the generic backend API
            const response = await API.get('/users');
            // the response from /api/users returns { success, count, data: [...] }
            setUsers(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [searchTerm]);

    const handleCreateUser = async (formData) => {
        setFormLoading(true);
        try {
            await API.post('/users', formData);
            setIsModalOpen(false);
            fetchUsers(false);
        } catch (error) {
            console.error("Failed to create user", error);
            alert(error.response?.data?.message || "Failed to create user");
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateUser = async (formData) => {
        console.log("Updating user:", selectedUser._id, formData);
        setFormLoading(true);
        try {
            await API.patch(`/users/${selectedUser._id}`, formData);
            console.log("User updated successfully");
            setIsModalOpen(false);
            setSelectedUser(null);
            fetchUsers(false);
        } catch (error) {
            console.error("Failed to update user", error);
            alert(error?.response?.data?.message || "Failed to update user");
        } finally {
            setFormLoading(false);
        }
    };

    const openEditModal = (e, user) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleToggleActive = async (bdaId, currentStatus, e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Toggling activation state for:", bdaId, "currentStatus:", currentStatus);
        try {
            if (currentStatus) {
                await API.delete(`/users/${bdaId}`);
                console.log("Requested deactivation");
            } else {
                await API.patch(`/users/${bdaId}`, { isActive: true });
                console.log("Requested activation");
            }
            fetchUsers(false);
        } catch (error) {
            console.error("Failed to toggle activation", error);
        }
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
                        setSelectedUser(null);
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
                title={selectedUser ? "Edit User" : "Add New User"}
            >
                <UserForm 
                    onSubmit={selectedUser ? handleUpdateUser : handleCreateUser} 
                    loading={formLoading} 
                    initialData={selectedUser} 
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
                ) : users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No BDA accounts found matching your search.</div>
                ) : users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                    <motion.div
                        key={u._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card"
                        style={{ padding: '24px', opacity: u.isActive !== false ? 1 : 0.6, cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/lms/${encodeURIComponent(lmsType)}/bda/${u._id}/leads`)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: u.isActive !== false ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--glass-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: '700',
                                color: 'white'
                            }}>
                                {u.name.charAt(0)}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {u.globalRole !== 'admin' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => handleToggleActive(u._id, u.isActive !== false, e)}
                                            title={u.isActive !== false ? "Deactivate Account" : "Activate Account"}
                                            style={{ background: 'none', border: 'none', color: u.isActive !== false ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
                                        >
                                            {u.isActive !== false ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => openEditModal(e, u)}
                                            title="Edit User"
                                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{u.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                <Mail size={14} />
                                {u.email}
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
                                <span style={{ fontWeight: '600' }}>{u.role}</span>
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
