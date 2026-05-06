import React, { useState, useEffect } from 'react';
import { UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import API from '../api/axios';
import { motion } from 'framer-motion';

const BulkAssignModal = ({ leadIds, projectId, onClose, onComplete }) => {
    const [users, setUsers] = useState([]);
    const [assignedTo, setAssignedTo] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const { data } = await API.get(`/projects/${projectId}/members`);
                const members = data.data || [];
                // Filter for BDAs only
                const bdas = members
                    .filter(m => m.role === 'bda' && m.userId?.isActive !== false)
                    .map(m => m.userId);
                setUsers(bdas);
            } catch (err) {
                console.error('Failed to load project members', err);
                setError('Failed to load team members');
            } finally {
                setFetching(false);
            }
        };
        fetchMembers();
    }, [projectId]);

    const handleBulkAssign = async (e) => {
        e.preventDefault();
        if (!assignedTo) {
            setError('Please select a team member');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await API.post(`/projects/${projectId}/leads/assign`, {
                leadIds,
                assignedTo
            });
            setSuccess(`Successfully assigned ${leadIds.length} leads!`);
            setTimeout(() => {
                onComplete();
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Bulk assignment failed', err);
            setError(err.response?.data?.message || 'Failed to assign leads');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleBulkAssign} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserPlus size={14} /> Assign {leadIds.length} Leads To
                </label>
                {fetching ? (
                    <div style={{ padding: '12px', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={20} />
                    </div>
                ) : (
                    <select
                        className="input-field"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        required
                    >
                        <option value="">Select a BDA...</option>
                        {users.map(user => (
                            <option key={user._id} value={user._id}>{user.name}</option>
                        ))}
                    </select>
                )}
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
                    disabled={loading || fetching}
                    style={{ flex: 1, justifyContent: 'center' }}
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Assignment'}
                </button>
            </div>
        </form>
    );
};

export default BulkAssignModal;
