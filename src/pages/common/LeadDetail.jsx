import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
    ArrowLeft,
    Calendar,
    MessageSquare,
    Clock,
    User as UserIcon,
    Phone,
    Mail,
    Edit2,
    Trash2,
    History,
    Send
} from 'lucide-react';
import { motion } from 'framer-motion';

const LeadDetail = ({ role }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState('');

    const fetchLeadData = async () => {
        setLoading(true);
        try {
            const endpoint = role === 'Admin' ? `/admin/leads/${id}` : `/bda/leads/${id}`;
            const { data: leadData } = await API.get(endpoint);
            setLead(leadData);

            const { data: historyData } = await API.get(`/leads/${id}/history`);
            setHistory(historyData);
        } catch (error) {
            console.error("Failed to fetch lead details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeadData();
    }, [id, role]);

    const addNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        try {
            await API.post(`/bda/leads/${id}/notes`, { content: newNote });
            setNewNote('');
            fetchLeadData(); // Refresh to show new note and history
        } catch (error) {
            console.error("Failed to add note", error);
        }
    };

    if (loading) return <div style={{ color: 'white' }}>Loading lead details...</div>;
    if (!lead) return <div style={{ color: 'white' }}>Lead not found.</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-secondary"
                    style={{ padding: '8px', borderRadius: '12px' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '28px' }}>{lead.name}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Lead ID: {lead._id}</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                    {role === 'Admin' && (
                        <>
                            <button className="btn btn-secondary"><Edit2 size={18} /> Edit</button>
                            <button className="btn btn-secondary" style={{ color: 'var(--accent)' }}><Trash2 size={18} /> Delete</button>
                        </>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
                {/* Left Column: Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>Contact Information</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--primary)' }}>
                                    <div style={{ margin: 'auto' }}><Phone size={18} /></div>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phone Number</p>
                                    <p style={{ fontSize: '15px' }}>{lead.phone}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--secondary)' }}>
                                    <div style={{ margin: 'auto' }}><Mail size={18} /></div>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email Address</p>
                                    <p style={{ fontSize: '15px' }}>{lead.email}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#10b981' }}>
                                    <div style={{ margin: 'auto' }}><Clock size={18} /></div>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Source</p>
                                    <p style={{ fontSize: '15px' }}>{lead.source}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>Engagement Status</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Status</span>
                                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{lead.status}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Priority</span>
                                <span style={{ fontWeight: '600', color: lead.priority === 'High' ? 'var(--accent)' : 'inherit' }}>{lead.priority}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Assigned To</span>
                                <span style={{ fontWeight: '600' }}>{lead.assignedTo?.name || 'Unassigned'}</span>
                            </div>
                        </div>
                        {role === 'BDA' && (
                            <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}>
                                Update Status
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column: Timeline & Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-card" style={{ padding: '24px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                            <History size={20} color="var(--primary)" />
                            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Activity Timeline</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
                            {history.map((item, index) => (
                                <div key={item._id} style={{ display: 'flex', gap: '16px', paddingBottom: '24px', position: 'relative' }}>
                                    {index !== history.length - 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            left: '7px',
                                            top: '24px',
                                            bottom: '0',
                                            width: '2px',
                                            background: 'var(--glass-border)'
                                        }} />
                                    )}
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        background: 'var(--primary)',
                                        border: '4px solid var(--bg-darker)',
                                        zIndex: 1,
                                        marginTop: '4px'
                                    }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.actionType.replace('_', ' ')}</span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(item.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.details}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '4px' }}>by {item.userId?.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Interaction Notes</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                            {lead.notes?.map((note, idx) => (
                                <div key={idx} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                                    <p style={{ fontSize: '13px', marginBottom: '6px' }}>{note.content}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            {(!lead.notes || lead.notes.length === 0) && <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No notes yet.</p>}
                        </div>

                        <form onSubmit={addNote} style={{ position: 'relative' }}>
                            <textarea
                                placeholder="Add a followup note..."
                                className="input-field"
                                style={{ height: '80px', resize: 'none', paddingRight: '50px' }}
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                            />
                            <button
                                type="submit"
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    bottom: '12px',
                                    background: 'var(--primary)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadDetail;
