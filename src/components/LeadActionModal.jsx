import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    Loader2,
    MessageSquare,
    Calendar as CalendarIcon,
    TrendingUp,
    UserPlus
} from 'lucide-react';
import API from '../api/axios';
import { motion } from 'framer-motion';

const LeadActionModal = ({ lead, onClose, onComplete, isAdmin = false }) => {
    const [status, setStatus] = useState(lead.status || 'New');
    const [note, setNote] = useState('');
    const [followUpDate, setFollowUpDate] = useState(lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : '');
    const [assignedTo, setAssignedTo] = useState(lead.assignedTo?._id || lead.assignedTo || '');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isAdmin) {
            const fetchUsers = async () => {
                try {
                    const { data } = await API.get('/admin/users');
                    setUsers((data || []).filter(u => u.isActive !== false));
                } catch (err) {
                    console.error('Failed to load team members');
                }
            };
            fetchUsers();
        }
    }, [isAdmin]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const baseUrl = isAdmin ? '/admin' : '/bda';

            // 1. Update Status
            if (status !== lead.status) {
                await API.patch(`${baseUrl}/leads/${lead._id}/status`, { status });
            }

            // 2. Add Note
            if (note.trim()) {
                await API.post(`${baseUrl}/leads/${lead._id}/notes`, { content: note });
            }

            // 3. Update Follow-up Date
            if (followUpDate !== (lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : '')) {
                await API.patch(`${baseUrl}/leads/${lead._id}/followup`, { followUpDate });
            }

            // 4. Update Assignment (Admin only)
            if (isAdmin && assignedTo !== (lead.assignedTo?._id || lead.assignedTo || '')) {
                await API.patch(`/admin/leads/${lead._id}/assign`, { assignedTo });
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

    return (
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Lead Name:</p>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>{lead.name}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={14} /> Lead Status
                    </label>
                    <select
                        className="input-field"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Converted">Converted</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Junk">Junk</option>
                    </select>
                </div>

                {isAdmin && (
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                    style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <CheckCircle2 size={16} /> {success}
                </motion.div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{ flex: 1, justifyContent: 'center' }}
                >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default LeadActionModal;
