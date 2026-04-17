import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import {
    UserPlus,
    Search,
    MoreVertical,
    Shield,
    ToggleLeft,
    ToggleRight,
    Mail,
    Edit2,
    Trash2,
    Link as LinkIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../../components/Modal';
import UserForm from '../../components/UserForm';

const UserManagement = () => {
    const navigate = useNavigate();
    const { productType } = useParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useState([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignmentData, setAssignmentData] = useState({ projectId: '', role: 'bda' });

    const fetchProjects = async () => {
        try {
            const { data } = await API.get('/projects');
            setProjects(data.data || []);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchUsers = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const endpoint = productType 
                ? `/users?productType=${productType}&search=${searchTerm}`
                : `/users?search=${searchTerm}`;
            const response = await API.get(endpoint);
            setUsers(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(searchTerm === ''); // Only show full loading on initial or cleared search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);



    const handleCreateUser = async (formData) => {
        setFormLoading(true);
        try {
            await API.post('/users', formData);
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Failed to create BDA account", error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateUser = async (formData) => {
        setFormLoading(true);
        try {
            await API.patch(`/users/${selectedUser._id}`, formData);
            setIsModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Failed to update BDA account", error);
        } finally {
            setFormLoading(false);
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const toggleStatus = async (userId, currentStatus) => {
        try {
            if (currentStatus) {
                await API.delete(`/users/${userId}`);
            } else {
                await API.patch(`/users/${userId}`, { isActive: true });
            }
            fetchUsers(false);
        } catch (error) {
            console.error("Failed to toggle status", error);
        }
    };

    const handleAssignProject = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await API.post(`/projects/${assignmentData.projectId}/members`, {
                userId: selectedUser._id,
                role: assignmentData.role
            });
            setIsAssignModalOpen(false);
            setSelectedUser(null);
            alert("User assigned to project successfully!");
        } catch (error) {
            console.error("Failed to assign project", error);
            alert(error.response?.data?.message || "Failed to assign project");
        } finally {
            setFormLoading(false);
        }
    };

    const openAssignModal = (e, user) => {
        e.stopPropagation();
        setSelectedUser(user);
        setIsAssignModalOpen(true);
    };

    const deleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to remove this user from the system?")) {
            try {
                await API.delete(`/users/${userId}`);
                fetchUsers(false);
            } catch (error) {
                console.error("Failed to delete user", error);
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '4px' }}>Business Development Team</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage BDA accounts and monitor their activity</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={18} />
                    Create Team
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={selectedUser ? "Edit BDA Account" : "Create New BDA Account"}
            >
                <UserForm 
                    onSubmit={selectedUser ? handleUpdateUser : handleCreateUser} 
                    loading={formLoading} 
                    initialData={selectedUser} 
                />
            </Modal>

            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => { setIsAssignModalOpen(false); setSelectedUser(null); }}
                title={`Assign ${selectedUser?.name} to Project`}
            >
                <form onSubmit={handleAssignProject} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Select Project</label>
                        <select 
                            className="input-field" 
                            style={{ background: 'var(--bg-dark)' }}
                            value={assignmentData.projectId}
                            onChange={(e) => setAssignmentData({ ...assignmentData, projectId: e.target.value })}
                            required
                        >
                            <option value="">Choose a project...</option>
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Assign Role</label>
                        <select 
                            className="input-field" 
                            style={{ background: 'var(--bg-dark)' }}
                            value={assignmentData.role}
                            onChange={(e) => setAssignmentData({ ...assignmentData, role: e.target.value })}
                            required
                        >
                            <option value="bda">BDA (Team Member)</option>
                            <option value="manager">Project Manager</option>
                        </select>
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={formLoading} style={{ justifyContent: 'center', marginTop: '12px' }}>
                        {formLoading ? 'Assigning...' : 'Confirm Assignment'}
                    </button>
                </form>
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
                ) : users.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No BDA accounts found.</div>
                ) : users.map((u) => (
                    <motion.div
                        key={u._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card"
                        style={{ padding: '24px', opacity: u.isActive !== false ? 1 : 0.6, cursor: 'pointer' }}
                        onClick={() => {
                            const path = productType 
                                ? `/admin/${productType}/users/${u._id}/leads`
                                : `/admin/users/${u._id}/leads`;
                            navigate(path);
                        }}
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
                                color: 'white',
                                overflow: 'hidden'
                            }}>
                                {u.profileImage ? (
                                    <img 
                                        src={`http://localhost:5000${u.profileImage}`} 
                                        alt={u.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                ) : u.name.charAt(0)}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {u.globalRole !== 'admin' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleStatus(u._id, u.isActive);
                                        }}
                                        title={u.isActive !== false ? "Deactivate" : "Activate"}
                                        style={{ background: 'none', border: 'none', color: u.isActive !== false ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        {u.isActive !== false ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                    </button>
                                )}
                                <button
                                    onClick={(e) => openAssignModal(e, u)}
                                    title="Assign to Project"
                                    style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}
                                >
                                    <LinkIcon size={20} />
                                </button>
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
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(u);
                                    }}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                                >
                                    <Edit2 size={16} />
                                </button>
                                {u.globalRole !== 'admin' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteUser(u._id);
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default UserManagement;
