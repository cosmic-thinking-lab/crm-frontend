import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
    Search,
    Filter,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    MessageSquare,
    Calendar,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyLeads = () => {
    const [leads, setLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        priority: ''
    });

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (filters.status) query.append('status', filters.status);
            if (filters.priority) query.append('priority', filters.priority);
            if (searchTerm) query.append('search', searchTerm);

            const { data } = await API.get(`/bda/leads?${query.toString()}`);
            setLeads(data);
        } catch (error) {
            console.error("Failed to fetch my leads", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [filters, searchTerm]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return '#f43f5e';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#10b981';
            default: return '#94a3b8';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return '#0ea5e9';
            case 'Contacted': return '#6366f1';
            case 'Qualified': return '#10b981';
            case 'Converted': return '#8b5cf6';
            case 'Junk': return '#ef4444';
            default: return '#94a3b8';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '4px' }}>My Assignments</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Leads assigned to you for follow-up and conversion</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search within my leads..."
                        className="input-field"
                        style={{ paddingLeft: '44px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="input-field"
                    style={{ width: '160px' }}
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                </select>
                <button className="btn btn-secondary" onClick={() => setFilters({ status: '', priority: '' })}>
                    Reset
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {loading ? (
                    <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Loading leads...</div>
                ) : leads.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No assignments found.</div>
                ) : leads.map((lead) => (
                    <motion.div
                        key={lead._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card"
                        style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    background: `${getPriorityColor(lead.priority)}20`,
                                    color: getPriorityColor(lead.priority),
                                    marginBottom: '10px',
                                    textTransform: 'uppercase'
                                }}>
                                    {lead.priority} Priority
                                </span>
                                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{lead.name}</h3>
                            </div>
                            <span style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: `${getStatusColor(lead.status)}20`,
                                color: getStatusColor(lead.status),
                                border: `1px solid ${getStatusColor(lead.status)}40`
                            }}>
                                {lead.status}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                <Phone size={14} />
                                {lead.phone}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                <Mail size={14} />
                                {lead.email}
                            </div>
                        </div>

                        <div style={{
                            marginTop: '8px',
                            padding: '12px',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.02)',
                            fontSize: '13px',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={14} color="var(--primary)" />
                                <span>Next Follow-up: {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : 'Not scheduled'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={14} color="var(--secondary)" />
                                <span>Last Note: {lead.notes?.length > 0 ? lead.notes[lead.notes.length - 1].content.substring(0, 30) + '...' : 'No notes yet'}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                            <button className="btn btn-secondary" style={{ flex: 1, fontSize: '13px' }}>
                                View Full Detail
                            </button>
                            <button className="btn btn-primary" style={{ padding: '10px', borderRadius: '10px' }}>
                                <Calendar size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default MyLeads;
