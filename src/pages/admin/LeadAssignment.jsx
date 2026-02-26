import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
    Search,
    User as UserIcon,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../components/Modal';
import AssignLeadModal from '../../components/AssignLeadModal';
import LeadActionModal from '../../components/LeadActionModal';

const LeadAssignment = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingLead, setUpdatingLead] = useState(null);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUnassignedLeads = async () => {
        setLoading(true);
        try {
            // Fetch leads where assignedTo is null (backend handling)
            // The adminController.getLeads handles assignedTo=null filter
            const query = new URLSearchParams();
            query.append('assignedTo', 'null');
            if (searchTerm) query.append('search', searchTerm);

            const { data } = await API.get(`/admin/leads?${query.toString()}`);
            setLeads(data);
        } catch (error) {
            console.error("Failed to fetch unassigned leads", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnassignedLeads();
    }, [searchTerm]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return '#f43f5e';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#10b981';
            default: return '#94a3b8';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '4px' }}>Lead Assignment Hub</h1>
                <p style={{ color: 'var(--text-muted)' }}>Assign incoming unassigned leads to your BDA team</p>
            </div>

            {selectedLeads.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{
                        padding: '12px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(14, 165, 233, 0.1)',
                        borderColor: 'var(--primary)'
                    }}
                >
                    <span style={{ fontWeight: '600' }}>{selectedLeads.length} leads selected</span>
                    <button className="btn btn-primary" onClick={() => setIsBulkAssignModalOpen(true)}>
                        <UserIcon size={18} />
                        Bulk Assign
                    </button>
                </motion.div>
            )}

            <Modal
                isOpen={!!updatingLead}
                onClose={() => setUpdatingLead(null)}
                title="Assign Lead"
            >
                {updatingLead && (
                    <LeadActionModal
                        lead={updatingLead}
                        onClose={() => setUpdatingLead(null)}
                        onComplete={fetchUnassignedLeads}
                        isAdmin={true}
                    />
                )}
            </Modal>

            <Modal
                isOpen={isBulkAssignModalOpen}
                onClose={() => setIsBulkAssignModalOpen(false)}
                title="Bulk Assign Leads"
            >
                <AssignLeadModal
                    leads={selectedLeads}
                    onClose={() => setIsBulkAssignModalOpen(false)}
                    onComplete={() => {
                        setSelectedLeads([]);
                        fetchUnassignedLeads();
                    }}
                />
            </Modal>

            <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search unassigned leads..."
                        className="input-field"
                        style={{ paddingLeft: '44px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '16px 24px', width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedLeads.length === leads.length && leads.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedLeads(leads.map(l => l._id));
                                        else setSelectedLeads([]);
                                    }}
                                />
                            </th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>LEAD NAME</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>PRIORITY</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>DATE ADDED</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading leads...</td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No unassigned leads found.</td>
                                </tr>
                            ) : leads.map((lead) => (
                                <motion.tr
                                    key={lead._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{ borderBottom: '1px solid var(--glass-border)', transition: 'var(--transition)' }}
                                    className="table-row-hover"
                                >
                                    <td style={{ padding: '16px 24px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.includes(lead._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedLeads([...selectedLeads, lead._id]);
                                                else setSelectedLeads(selectedLeads.filter(id => id !== lead._id));
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600', marginBottom: '4px' }}>{lead.name}</span>
                                            <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} />{lead.phone}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} />{lead.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getPriorityColor(lead.priority) }} />
                                            <span style={{ fontSize: '13px' }}>{lead.priority}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '6px 16px', fontSize: '12px' }}
                                            onClick={() => setUpdatingLead(lead)}
                                        >
                                            Assign Now
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeadAssignment;
