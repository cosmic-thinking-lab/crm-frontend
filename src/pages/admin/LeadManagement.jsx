import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import {
    Plus,
    Upload,
    Download,
    Search,
    Filter,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    BadgeAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../components/Modal';
import LeadForm from '../../components/LeadForm';
import ImportLeadsModal from '../../components/ImportLeadsModal';
import LeadActionModal from '../../components/LeadActionModal';

const LeadManagement = () => {
    const [searchParams] = useSearchParams();
    const lmsType = searchParams.get('lmsType') || 'School LMS'; // Default fallback
    
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [updatingLead, setUpdatingLead] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        source: ''
    });

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (filters.status) query.append('status', filters.status);
            if (filters.priority) query.append('priority', filters.priority);
            if (filters.source) query.append('source', filters.source);
            if (searchTerm) query.append('search', searchTerm);

            const { data } = await API.get(`/admin/${encodeURIComponent(lmsType)}/leads?${query.toString()}`);
            setLeads(data);
        } catch (error) {
            console.error("Failed to fetch leads", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [filters, searchTerm, lmsType]);

    const handleCreateLead = async (formData) => {
        setFormLoading(true);
        try {
            await API.post(`/admin/${encodeURIComponent(lmsType)}/leads`, formData);
            setIsModalOpen(false);
            fetchLeads();
        } catch (error) {
            console.error("Failed to create lead", error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await API.get(`/admin/${encodeURIComponent(lmsType)}/leads/export`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${lmsType}_leads_export.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed", error);
        }
    };

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
                    <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '4px' }}>Lead Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and track all customer inquiries</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={handleExport}>
                        <Download size={18} />
                        Export
                    </button>
                    <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(true)}>
                        <Upload size={18} />
                        Bulk Import
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Add Lead
                    </button>
                </div>
            </div>



            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Lead"
            >
                <LeadForm onSubmit={handleCreateLead} loading={formLoading} hideLmsType={true} />
            </Modal>

            <Modal
                isOpen={!!updatingLead}
                onClose={() => setUpdatingLead(null)}
                title="Update Lead Information"
            >
                {updatingLead && (
                    <LeadActionModal
                        lead={updatingLead}
                        onClose={() => setUpdatingLead(null)}
                        onComplete={fetchLeads}
                        isAdmin={true}
                    />
                )}
            </Modal>

            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Bulk Import Leads"
            >
                <ImportLeadsModal
                    productType={lmsType}
                    onClose={() => setIsImportModalOpen(false)}
                    onComplete={fetchLeads}
                />
            </Modal>



            <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search name, email or phone..."
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
                    <option value="Junk">Junk</option>
                </select>
                <select
                    className="input-field"
                    style={{ width: '160px' }}
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                >
                    <option value="">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <button className="btn btn-secondary" onClick={() => setFilters({ status: '', priority: '', source: '' })}>
                    Reset
                </button>
            </div>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>LEAD NAME</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>STATUS</th>
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
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No leads found.</td>
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
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600', marginBottom: '4px' }}>{lead.name}</span>
                                            <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} />{lead.phone}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} />{lead.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            background: `${getStatusColor(lead.status)}20`,
                                            color: getStatusColor(lead.status),
                                            border: `1px solid ${getStatusColor(lead.status)}40`
                                        }}>
                                            {lead.status}
                                        </span>
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
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                onClick={() => setUpdatingLead(lead)}
                                            >
                                                Update
                                            </button>
                                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>

                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Showing {leads.length} leads</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" style={{ padding: '6px 10px' }}><ChevronLeft size={16} /></button>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>1</button>
                        <button className="btn btn-secondary" style={{ padding: '6px 10px' }}><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadManagement;
