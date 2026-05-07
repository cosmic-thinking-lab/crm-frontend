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
    const [formError, setFormError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useState([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignmentData, setAssignmentData] = useState({ projectId: '', role: 'bda' });
    const [userMemberships, setUserMemberships] = useState([]);
    const [membershipLoading, setMembershipLoading] = useState(false);
    const [membershipError, setMembershipError] = useState('');
    const [membershipSuccess, setMembershipSuccess] = useState('');
    const [editingMembership, setEditingMembership] = useState(null); // { memberId, projectId, currentRole }

    const fetchUserMemberships = async (userId) => {
        setMembershipLoading(true);
        setMembershipError('');
        try {
            const { data } = await API.get(`/users/${userId}/memberships`);
            setUserMemberships(data.data || []);
        } catch {
            // Fallback: build from user's projectMemberships already loaded
            setUserMemberships([]);
        } finally {
            setMembershipLoading(false);
        }
    };

    const handleAssignProject = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setMembershipError('');
        setMembershipSuccess('');
        try {
            await API.post(`/projects/${assignmentData.projectId}/members`, {
                userId: selectedUser._id,
                role: assignmentData.role
            });
            setMembershipSuccess('User added to project successfully!');
            setAssignmentData({ projectId: '', role: 'bda' });
            fetchUsers(false);
            // Refresh memberships panel
            await loadMembershipsForUser(selectedUser._id);
        } catch (error) {
            setMembershipError(error.response?.data?.message || 'Failed to assign project');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateMembership = async (memberId, projectId, newRole) => {
        setMembershipError('');
        setMembershipSuccess('');
        try {
            await API.patch(`/projects/${projectId}/members/${memberId}`, { role: newRole });
            setMembershipSuccess('Role updated successfully!');
            setEditingMembership(null);
            fetchUsers(false);
            await loadMembershipsForUser(selectedUser._id);
        } catch (error) {
            setMembershipError(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleRemoveMembership = async (memberId, projectId) => {
        if (!window.confirm('Remove this user from the project?')) return;
        setMembershipError('');
        setMembershipSuccess('');
        try {
            await API.delete(`/projects/${projectId}/members/${memberId}`);
            setMembershipSuccess('Removed from project.');
            fetchUsers(false);
            await loadMembershipsForUser(selectedUser._id);
        } catch (error) {
            setMembershipError(error.response?.data?.message || 'Failed to remove from project');
        }
    };

    const loadMembershipsForUser = async (userId) => {
        setMembershipLoading(true);
        try {
            // Fetch all projects and filter those where this user is a member
            const { data: projectsData } = await API.get('/projects');
            const allProjects = projectsData.data || [];
            const memberships = [];
            for (const project of allProjects) {
                try {
                    const { data: memberData } = await API.get(`/projects/${project._id}/members`);
                    const members = memberData.data || [];
                    const match = members.find(m => m.userId?._id === userId || m.userId === userId);
                    if (match) {
                        memberships.push({
                            memberId: match._id,
                            projectId: project._id,
                            projectName: project.name,
                            role: match.role
                        });
                    }
                } catch { /* skip projects we can't access */ }
            }
            setUserMemberships(memberships);
        } finally {
            setMembershipLoading(false);
        }
    };

    const openAssignModal = async (e, user) => {
        e.stopPropagation();
        setSelectedUser(user);
        setMembershipError('');
        setMembershipSuccess('');
        setAssignmentData({ projectId: '', role: 'bda' });
        setEditingMembership(null);
        setIsAssignModalOpen(true);
        await loadMembershipsForUser(user._id);
    };



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
        setFormError(null);
        try {
            await API.post('/users', formData);
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Failed to create user", error);
            const errData = error.response?.data;
            if (errData?.errors) {
                setFormError(errData.errors.map(e => e.message).join(', '));
            } else {
                setFormError(errData?.message || 'Failed to create user. Please check all fields and try again.');
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateUser = async (formData) => {
        setFormLoading(true);
        setFormError(null);
        try {
            await API.patch(`/users/${selectedUser._id}`, formData);
            setIsModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Failed to update user", error);
            const errData = error.response?.data;
            if (errData?.errors) {
                setFormError(errData.errors.map(e => e.message).join(', '));
            } else {
                setFormError(errData?.message || 'Failed to update user. Please check all fields and try again.');
            }
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
        setFormError(null);
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
                {formError && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        color: '#f87171',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '16px', lineHeight: '1.2' }}>⚠️</span>
                        <span>{formError}</span>
                    </div>
                )}
                <UserForm 
                    onSubmit={selectedUser ? handleUpdateUser : handleCreateUser} 
                    loading={formLoading} 
                    initialData={selectedUser} 
                    showRole={true}
                />
            </Modal>

            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => { setIsAssignModalOpen(false); setSelectedUser(null); setUserMemberships([]); setMembershipError(''); setMembershipSuccess(''); }}
                title={`Manage Projects — ${selectedUser?.name}`}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Feedback messages */}
                    {membershipError && (
                        <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ⚠️ {membershipError}
                        </div>
                    )}
                    {membershipSuccess && (
                        <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ✓ {membershipSuccess}
                        </div>
                    )}

                    {/* Current Memberships */}
                    <div>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                            Current Project Assignments
                        </h3>
                        {membershipLoading ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Loading memberships...</div>
                        ) : userMemberships.length === 0 ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                No project assignments yet
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {userMemberships.map((m) => (
                                    <div key={m.memberId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{m.projectName}</div>
                                        </div>
                                        {editingMembership?.memberId === m.memberId ? (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <select
                                                    className="input-field"
                                                    style={{ padding: '6px 12px', fontSize: '13px', minWidth: '140px' }}
                                                    defaultValue={m.role}
                                                    id={`role-select-${m.memberId}`}
                                                >
                                                    <option value="bda">BDA</option>
                                                    <option value="manager">Manager</option>
                                                </select>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '6px 14px', fontSize: '13px' }}
                                                    onClick={() => {
                                                        const sel = document.getElementById(`role-select-${m.memberId}`);
                                                        handleUpdateMembership(m.memberId, m.projectId, sel.value);
                                                    }}
                                                >Save</button>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 12px', fontSize: '13px' }}
                                                    onClick={() => setEditingMembership(null)}
                                                >✕</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span className={`badge badge-${m.role === 'manager' ? 'primary' : 'success'}`} style={{ textTransform: 'capitalize' }}>{m.role}</span>
                                                <button
                                                    title="Edit role"
                                                    onClick={() => setEditingMembership({ memberId: m.memberId, projectId: m.projectId })}
                                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    title="Remove from project"
                                                    onClick={() => handleRemoveMembership(m.memberId, m.projectId)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '4px' }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

                    {/* Add to new project */}
                    <div>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                            Add to Another Project
                        </h3>
                        <form onSubmit={handleAssignProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <select
                                    className="input-field"
                                    style={{ flex: 2 }}
                                    value={assignmentData.projectId}
                                    onChange={(e) => setAssignmentData({ ...assignmentData, projectId: e.target.value })}
                                    required
                                >
                                    <option value="">Choose a project...</option>
                                    {projects
                                        .filter(p => !userMemberships.find(m => m.projectId === p._id))
                                        .map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))
                                    }
                                </select>
                                <select
                                    className="input-field"
                                    style={{ flex: 1 }}
                                    value={assignmentData.role}
                                    onChange={(e) => setAssignmentData({ ...assignmentData, role: e.target.value })}
                                >
                                    <option value="bda">BDA</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={formLoading} style={{ justifyContent: 'center' }}>
                                {formLoading ? 'Assigning...' : '+ Add to Project'}
                            </button>
                        </form>
                    </div>
                </div>
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

            <div className="glass-table-container">
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Contact</th>
                            <th>Assignment</th>
                            <th>Projects & Roles</th>
                            <th>Account Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Loading team members...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No BDA accounts found.
                                </td>
                            </tr>
                        ) : users.map((u) => (
                            <motion.tr
                                key={u._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ opacity: u.isActive !== false ? 1 : 0.6 }}
                            >
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar">
                                            {u.profileImage ? (
                                                <img 
                                                    src={`http://localhost:5000${u.profileImage}`} 
                                                    alt={u.name} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} 
                                                />
                                            ) : u.name.charAt(0)}
                                        </div>
                                        <div className="user-details">
                                            <span className="user-name">{u.name}</span>
                                            <span className="user-email">{u.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ color: 'var(--text-main)', fontSize: '13px' }}>{u.phone || 'N/A'}</span>
                                </td>
                                <td>
                                    {u.projectMemberships && u.projectMemberships.length > 0 ? (
                                        <span className="badge badge-success">Assigned</span>
                                    ) : (
                                        <span className="badge badge-muted">Unassigned</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {u.projectMemberships && u.projectMemberships.length > 0 ? (
                                            u.projectMemberships.map((pm, idx) => (
                                                <span key={idx} className="badge badge-primary">
                                                    {pm.projectName} <span style={{ opacity: 0.7, marginLeft: '4px', fontSize: '10px' }}>({pm.role})</span>
                                                </span>
                                            ))
                                        ) : (
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Open for projects</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {u.globalRole !== 'admin' ? (
                                            <button
                                                onClick={() => toggleStatus(u._id, u.isActive)}
                                                style={{ background: 'none', border: 'none', color: u.isActive !== false ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
                                            >
                                                {u.isActive !== false ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                            </button>
                                        ) : (
                                            <span className="badge badge-primary" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                                System Admin
                                            </span>
                                        )}
                                        <span style={{ fontSize: '12px', color: u.isActive !== false ? '#a78bfa' : 'var(--text-muted)' }}>
                                            {u.isActive !== false ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={(e) => openAssignModal(e, u)}
                                            title="Assign to Project"
                                            style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}
                                        >
                                            <LinkIcon size={18} />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(u)}
                                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                                        >
                                            <Edit2 size={18} />
                                        </button>

                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
