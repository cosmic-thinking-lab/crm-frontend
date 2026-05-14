import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    Loader2,
    MessageSquare,
    Calendar as CalendarIcon,
    TrendingUp,
    UserPlus,
    Trash2
} from 'lucide-react';
import API from '../api/axios';
import { motion } from 'framer-motion';
import ConfirmModal from './ConfirmModal';

const LeadActionModal = ({ lead, onClose, onComplete, isAdmin = false, projectId }) => {
    const [status, setStatus] = useState(lead.status?.toLowerCase() || 'new');
    const [priority, setPriority] = useState(lead.priority?.toLowerCase() || 'medium');
    const [note, setNote] = useState('');
    const [followUpDate, setFollowUpDate] = useState(lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : '');
    const [assignedTo, setAssignedTo] = useState(lead.assignedTo?._id || lead.assignedTo || '');
    const [users, setUsers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const resolvedProjectId = projectId || lead.projectId?._id || lead.projectId || lead.project?._id;
                
                let endpoint = '/users';
                if (resolvedProjectId) {
                    endpoint = `/projects/${resolvedProjectId}/members`;
                }

                const { data } = await API.get(endpoint);
                const rawData = data.data || (Array.isArray(data) ? data : []);
                
                const processedUsers = resolvedProjectId 
                    ? rawData.map(m => ({
                        ...m.userId,
                        projectRole: m.role
                    })).filter(u => u._id) // Ensure we have a valid user object
                    : rawData;

                // Priority: Show BDAs. Fallback: Show all project members if no BDAs or if current assignee is a Manager.
                const bdas = processedUsers.filter(u => u.projectRole === 'bda' && u.isActive !== false);
                
                // Always include the current assignee in the list so the dropdown doesn't reset
                const currentId = lead.assignedTo?._id || lead.assignedTo;
                const currentAssignee = processedUsers.find(u => u._id === currentId);
                
                let finalUsers = bdas;
                if (currentAssignee && !bdas.find(u => u._id === currentId)) {
                    finalUsers = [currentAssignee, ...bdas];
                }
                
                // If still empty or if we want to allow assigning to anyone in project
                if (finalUsers.length === 0 && processedUsers.length > 0) {
                    finalUsers = processedUsers.filter(u => u.isActive !== false);
                }

                setUsers(finalUsers);
            } catch (err) {
                console.error('Failed to load team members', err);
            }
        };

        fetchUsers();
    }, [isAdmin, projectId, lead]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const resolvedProjectId = projectId || lead.projectId?._id || lead.projectId || lead.project?._id;

            if (!resolvedProjectId) {
                setError('Project ID is missing for this lead');
                setSubmitting(false);
                return;
            }

            const updateData = {
                status,
                priority,
                followUpDate,
                assignedTo: assignedTo || null
            };

            await API.patch(`/projects/${resolvedProjectId}/leads/${lead._id}`, updateData);

            if (note.trim()) {
                await API.post(`/projects/${resolvedProjectId}/leads/${lead._id}/notes`, { content: note });
            }

            setSuccess('Lead updated successfully!');
            setTimeout(() => {
                onComplete();
                onClose();
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update lead');
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setError('');
        try {
            const resolvedProjectId = projectId || lead.projectId?._id || lead.projectId || lead.project?._id;
            await API.delete(`/projects/${resolvedProjectId}/leads/${lead._id}`);
            setSuccess('Lead deleted successfully!');
            setTimeout(() => {
                onComplete();
                onClose();
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete lead');
            setDeleting(false);
            setIsConfirmDeleteOpen(false);
        }
    };

    // Anyone using this modal (Admin or Manager) can assign leads if they are in this portal
    const canAssign = true; 

    return (
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Lead Name:</p>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>{lead.name}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={14} /> Lead Status
                    </label>
                    <select
                        className="input-field"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal_sent">Proposal Sent</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                        <option value="junk">Junk</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={14} /> Priority
                    </label>
                    <select
                        className="input-field"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                {canAssign && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UserPlus size={14} /> Assign To
                        </label>
                        <select
                            className="input-field"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                        >
                            <option value="">Unassigned</option>
                            {users.map(user => (
                                <option key={user._id} value={user._id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: canAssign ? 'unset' : 'span 2' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarIcon size={14} /> Next Follow-up
                    </label>
                    <input
                        type="date"
                        className="input-field"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={14} /> Add Note
                </label>
                <textarea
                    className="input-field"
                    style={{ minHeight: '80px', paddingTop: '10px' }}
                    placeholder="Record interaction details..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <AlertCircle size={16} /> {error}
                </motion.div>
            )}

            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <CheckCircle2 size={16} /> {success}
                </motion.div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || deleting}
                    style={{ flex: 1, justifyContent: 'center' }}
                >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                </button>
            </div>

            {isAdmin && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    <button
                        type="button"
                        onClick={() => setIsConfirmDeleteOpen(true)}
                        className="btn"
                        disabled={submitting || deleting}
                        style={{ 
                            width: '100%', 
                            justifyContent: 'center', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}
                    >
                        {deleting ? <Loader2 className="animate-spin" size={18} /> : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Trash2 size={16} /> Delete Lead
                            </div>
                        )}
                    </button>
                </div>
            )}

            <ConfirmModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Delete Lead"
                message={`Are you sure you want to delete lead "${lead.name}"?`}
                confirmText="Delete"
            />
        </form>
    );
};

export default LeadActionModal;
