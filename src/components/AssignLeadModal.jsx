import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import API from '../api/axios';
import { motion } from 'framer-motion';

const AssignLeadModal = ({ lead, leads, onClose, onComplete, projectId }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');
    const [error, setError] = useState('');

    const leadDisplayName = leads ? `${leads.length} selected leads` : (lead ? lead.name : '');
    const leadIds = leads ? leads : (lead ? [lead._id] : []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await API.get('/users');
                // Only show active team members (v2.0 uses data.data)
                const activeUsers = (data.data || data || []).filter(u => u.isActive !== false);
                setUsers(activeUsers);
            } catch (err) {
                setError('Failed to load team members');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleAssign = async () => {
        if (!selectedUser || leadIds.length === 0 || !projectId) {
            if (!projectId) setError('Project ID is required for assignment');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            // Unified assignment endpoint for both single and bulk
            await API.post(`/projects/${projectId}/leads/assign`, { 
                leadIds, 
                assignedTo: selectedUser 
            });
            
            onComplete();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign leads');
            setSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Assigning:</p>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>{leadDisplayName}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Select Team Member</label>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', padding: '10px' }}>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Loading team...</span>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                        {users.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => setSelectedUser(user._id)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '10px',
                                    background: selectedUser === user._id ? 'rgba(14, 165, 233, 0.1)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${selectedUser === user._id ? 'var(--primary)' : 'var(--glass-border)'}`,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'var(--transition)'
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'var(--secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '12px'
                                }}>
                                    {user.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '14px', fontWeight: '600' }}>{user.name}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</p>
                                </div>
                                {selectedUser === user._id && <CheckCircle2 size={18} color="var(--primary)" />}
                            </div>
                        ))}
                        {users.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No team members available</p>}
                    </div>
                )}
            </div>

            {error && (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button
                    className="btn btn-primary"
                    onClick={handleAssign}
                    disabled={!selectedUser || submitting}
                    style={{ flex: 1, justifyContent: 'center' }}
                >
                    {submitting ? 'Assigning...' : 'Confirm Assignment'}
                </button>
            </div>
        </div>
    );
};

export default AssignLeadModal;
