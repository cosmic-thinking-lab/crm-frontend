import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
    ArrowLeft,
    MessageSquare,
    Send,
    Clock,
    User,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Phone,
    Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddNotePage = () => {
    const { projectId, id: leadId } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [note, setNote] = useState('');
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchDetails = async () => {
        try {
            const { data: leadData } = await API.get(`/projects/${projectId}/leads/${leadId}`);
            setLead(leadData.data || leadData);

            const { data: notesData } = await API.get(`/projects/${projectId}/leads/${leadId}/notes`);
            setNotes(notesData.data || notesData);
        } catch (error) {
            console.error("Failed to fetch lead details", error);
            setError('Failed to load lead details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId && leadId) {
            fetchDetails();
        }
    }, [projectId, leadId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!note.trim()) return;
        
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await API.post(`/projects/${projectId}/leads/${leadId}/notes`, { content: note });
            setNote('');
            setSuccess('Note added successfully!');
            
            // Refresh notes list
            const { data: notesData } = await API.get(`/projects/${projectId}/leads/${leadId}/notes`);
            setNotes(notesData.data || notesData);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error("Failed to add note", error);
            setError(error.response?.data?.message || 'Failed to add note');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                    onClick={() => navigate(-1)} 
                    className="btn btn-secondary" 
                    style={{ padding: '10px', borderRadius: '12px' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '4px' }}>Lead Interaction</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Add follow-up notes for {lead?.name}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
                {/* Left Column: Lead Info Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Lead Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <Phone size={16} />
                                </div>
                                <span style={{ fontSize: '14px' }}>{lead?.phone}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                                    <Mail size={16} />
                                </div>
                                <span style={{ fontSize: '14px' }}>{lead?.email}</span>
                            </div>
                            <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                                <span style={{ 
                                    padding: '4px 10px', 
                                    borderRadius: '20px', 
                                    fontSize: '11px', 
                                    fontWeight: '600', 
                                    background: 'rgba(14, 165, 233, 0.1)', 
                                    color: 'var(--primary)' 
                                }}>
                                    {lead?.status?.toUpperCase()?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Note Form and History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Add Note Form */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={18} color="var(--primary)" /> New Interaction Note
                        </h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <textarea
                                className="input-field"
                                style={{ minHeight: '120px', fontSize: '15px', lineHeight: '1.6', paddingTop: '12px' }}
                                placeholder="Describe the interaction, next steps, or any important details..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                autoFocus
                            />
                            
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ padding: '12px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <AlertCircle size={16} /> {error}
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ padding: '12px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <CheckCircle2 size={16} /> {success}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={submitting || !note.trim()}
                                    style={{ padding: '12px 24px' }}
                                >
                                    {submitting ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            <span>Save Interaction</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Previous Notes */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Note History</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {notes.length > 0 ? (
                                notes.map((n, idx) => (
                                    <motion.div 
                                        key={n._id || idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        style={{ 
                                            padding: '16px', 
                                            background: 'var(--glass)', 
                                            borderRadius: '12px', 
                                            border: '1px solid var(--glass-border)',
                                            position: 'relative'
                                        }}
                                    >
                                        <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>{n.content}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>
                                                    {n.addedBy?.name?.charAt(0) || 'U'}
                                                </div>
                                                <span>{n.addedBy?.name || 'Assigned BDA'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} />
                                                <span>{new Date(n.createdAt || n.addedAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    <MessageSquare size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                    <p>No previous notes found for this lead.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AddNotePage;
