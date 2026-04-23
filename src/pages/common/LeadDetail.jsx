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
    Send,
    Check,
    X
} from 'lucide-react';
import { motion } from 'framer-motion';

const LeadDetail = ({ role }) => {
    const { id, projectId } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [notes, setNotes] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notesLoading, setNotesLoading] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [error, setError] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        phone: '',
        organization: '',
        priority: ''
    });

    const fetchNotes = async () => {
        if (!id || !projectId) return;
        setNotesLoading(true);
        try {
            const { data } = await API.get(`/projects/${projectId}/leads/${id}/notes`);
            setNotes(data.data || data);
        } catch (error) {
            console.error("Failed to fetch notes", error);
        } finally {
            setNotesLoading(false);
        }
    };

    const fetchLeadData = async () => {
        setLoading(true);
        try {
            // Use project-scoped endpoint for lead details
            const { data: leadData } = await API.get(`/projects/${projectId}/leads/${id}`);
            const leadObj = leadData.data || leadData;
            setLead(leadObj);
            setEditData({
                name: leadObj.name,
                email: leadObj.email,
                phone: leadObj.phone,
                organization: leadObj.organization || '',
                priority: leadObj.priority
            });

            // Use project-scoped endpoint for history
            const { data: historyData } = await API.get(`/projects/${projectId}/leads/${id}/history`);
            setHistory(historyData.data || historyData);
            
            // Also fetch notes using dedicated endpoint
            fetchNotes();
        } catch (error) {
            console.error("Failed to fetch lead details", error);
            setError(error.response?.data?.message || "Failed to load lead details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && projectId) {
            fetchLeadData();
        }
    }, [id, projectId]);

    const handleUpdateLead = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.patch(`/projects/${projectId}/leads/${id}`, editData);
            setLead(data.data);
            setIsEditing(false);
            fetchLeadData(); // Refresh to get history entry
        } catch (error) {
            console.error("Failed to update lead", error);
            const errorMsg = error.response?.data?.message || 
                           (error.response?.data?.errors ? error.response.data.errors.map(e => e.message).join(', ') : null) || 
                           "Failed to update lead";
            alert(errorMsg);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            const { data } = await API.patch(`/projects/${projectId}/leads/${id}`, { status: newStatus });
            setLead(data.data);
            setIsUpdatingStatus(false);
            fetchLeadData(); // Refresh to get history entry
        } catch (error) {
            console.error("Failed to update status", error);
            const errorMsg = error.response?.data?.message || 
                           (error.response?.data?.errors ? error.response.data.errors.map(e => e.message).join(', ') : null) || 
                           "Failed to update status";
            alert(errorMsg);
        }
    };

    const handleDeleteLead = async () => {
        if (!window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
        try {
            await API.delete(`/projects/${projectId}/leads/${id}`);
            navigate(-1);
        } catch (error) {
            console.error("Failed to delete lead", error);
            alert(error.response?.data?.message || "Failed to delete lead");
        }
    };

    const addNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        try {
            // Use project-scoped endpoint for notes
            await API.post(`/projects/${projectId}/leads/${id}/notes`, { content: newNote });
            setNewNote('');
            fetchNotes(); // Refresh only notes list for better UX
            fetchLeadData(); // Also refresh lead to get updated noteCount if displayed
        } catch (error) {
            console.error("Failed to add note", error);
            alert(error.response?.data?.message || "Failed to add note");
        }
    };

    const handleUpdateNote = async (noteId) => {
        if (!editingContent.trim()) return;
        try {
            await API.patch(`/projects/${projectId}/leads/${id}/notes/${noteId}`, { content: editingContent });
            setEditingNoteId(null);
            fetchNotes();
        } catch (error) {
            console.error("Failed to update note", error);
            alert(error.response?.data?.message || "Failed to update note");
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) return;
        try {
            await API.delete(`/projects/${projectId}/leads/${id}/notes/${noteId}`);
            fetchNotes(); // Refresh list
            fetchLeadData(); // Also refresh lead to update noteCount
        } catch (error) {
            console.error("Failed to delete note", error);
            alert(error.response?.data?.message || "Failed to delete note");
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Loading lead details...</div>;
    
    if (error) return (
        <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--accent)', marginBottom: '10px' }}>Error</h2>
            <p>{error}</p>
            <button className="btn btn-secondary" style={{ marginTop: '20px' }} onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );

    if (!lead) return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Lead not found.</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
            {/* Edit Modal */}
            {isEditing && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card" 
                        style={{ width: '100%', maxWidth: '500px', padding: '32px' }}
                    >
                        <h2 className="text-gradient" style={{ fontSize: '24px', marginBottom: '24px' }}>Edit Lead Details</h2>
                        <form onSubmit={handleUpdateLead} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Full Name</label>
                                <input 
                                    className="input-field" 
                                    value={editData.name} 
                                    onChange={(e) => setEditData({...editData, name: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Email</label>
                                    <input 
                                        type="email" 
                                        className="input-field" 
                                        value={editData.email} 
                                        onChange={(e) => setEditData({...editData, email: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Phone</label>
                                    <input 
                                        className="input-field" 
                                        value={editData.phone} 
                                        onChange={(e) => setEditData({...editData, phone: e.target.value})} 
                                        required 
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Organization</label>
                                <input 
                                    className="input-field" 
                                    value={editData.organization} 
                                    onChange={(e) => setEditData({...editData, organization: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Priority</label>
                                <select 
                                    className="input-field" 
                                    value={editData.priority} 
                                    onChange={(e) => setEditData({...editData, priority: e.target.value})}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsEditing(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Changes</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Status Modal */}
            {isUpdatingStatus && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card" 
                        style={{ width: '100%', maxWidth: '400px', padding: '32px' }}
                    >
                        <h2 className="text-gradient" style={{ fontSize: '22px', marginBottom: '20px' }}>Update Lead Status</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                            {['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'converted', 'lost'].map(status => (
                                <button 
                                    key={status}
                                    className={`btn ${lead.status === status ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ justifyContent: 'flex-start', padding: '12px 20px' }}
                                    onClick={() => handleUpdateStatus(status)}
                                >
                                    {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    {lead.status === status && <Check size={16} style={{ marginLeft: 'auto' }} />}
                                </button>
                            ))}
                            <button className="btn btn-secondary" style={{ marginTop: '10px', justifyContent: 'center' }} onClick={() => setIsUpdatingStatus(false)}>Cancel</button>
                        </div>
                    </motion.div>
                </div>
            )}

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
                    {(role === 'Admin' || role === 'Manager' || role === 'BDA') && (
                        <button className="btn btn-secondary" onClick={() => setIsEditing(true)}><Edit2 size={18} /> Edit</button>
                    )}
                    {(role === 'Admin' || role === 'Manager') && (
                        <button className="btn btn-secondary" style={{ color: 'var(--accent)' }} onClick={handleDeleteLead}><Trash2 size={18} /> Delete</button>
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
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <div style={{ margin: 'auto' }}><Phone size={18} /></div>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phone Number</p>
                                    <p style={{ fontSize: '15px' }}>{lead.phone}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                                    <div style={{ margin: 'auto' }}><Mail size={18} /></div>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email Address</p>
                                    <p style={{ fontSize: '15px' }}>{lead.email}</p>
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
                        {(role === 'BDA' || role === 'Manager' || role === 'Admin') && (
                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}
                                onClick={() => setIsUpdatingStatus(true)}
                            >
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
                                            <span style={{ fontWeight: '600', fontSize: '14px' }}>
                                                {(item.actionType || 'Lead Assignment').replace('_', ' ')}
                                            </span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                {new Date(item.createdAt || item.assignedAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                            {item.details || (item.assignedTo ? `Lead assigned to ${item.assignedTo.name}` : 'A lead action was performed')}
                                        </p>
                                        <p style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '4px' }}>
                                            by {item.userId?.name || item.assignedBy?.name || 'System'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Interaction Notes</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                            {notesLoading && notes.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading notes...</p>
                            ) : notes.map((note, idx) => (
                                <div key={note._id || idx} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                    {editingNoteId === note._id ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <textarea
                                                className="input-field"
                                                style={{ minHeight: '60px', fontSize: '14px', resize: 'none' }}
                                                value={editingContent}
                                                onChange={(e) => setEditingContent(e.target.value)}
                                                autoFocus
                                            />
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button 
                                                    className="btn btn-secondary" 
                                                    style={{ padding: '4px 8px', fontSize: '11px' }}
                                                    onClick={() => setEditingNoteId(null)}
                                                >
                                                    <X size={14} /> Cancel
                                                </button>
                                                <button 
                                                    className="btn btn-primary" 
                                                    style={{ padding: '4px 8px', fontSize: '11px' }}
                                                    onClick={() => handleUpdateNote(note._id)}
                                                >
                                                    <Check size={14} /> Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <p style={{ fontSize: '14px', marginBottom: '8px', lineHeight: '1.5', flex: 1 }}>{note.content}</p>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button 
                                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6 }}
                                                        onClick={() => {
                                                            setEditingNoteId(note._id);
                                                            setEditingContent(note.content);
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                                                        title="Edit Note"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button 
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}
                                                        onClick={() => handleDeleteNote(note._id)}
                                                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                                                        title="Delete Note"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white' }}>
                                                        {note.addedBy?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <span>{note.addedBy?.name || 'User'}</span>
                                                </div>
                                                <span>{new Date(note.addedAt || note.createdAt).toLocaleString()}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            {(!notesLoading && notes.length === 0) && <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No notes recorded for this lead yet.</p>}
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
