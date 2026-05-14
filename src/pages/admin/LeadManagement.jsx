import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
    BadgeAlert,
    UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../components/Modal';
import LeadForm from '../../components/LeadForm';
import ImportLeadsModal from '../../components/ImportLeadsModal';
import LeadActionModal from '../../components/LeadActionModal';
import AssignLeadModal from '../../components/AssignLeadModal';

const LeadManagement = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const lmsType = searchParams.get('lmsType') || 'School LMS'; // Default fallback
    
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [updatingLead, setUpdatingLead] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedLeadIds, setSelectedLeadIds] = useState([]);
    const [formLoading, setFormLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        priority: ''
    });
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLeads, setTotalLeads] = useState(0);
    const [resolvedProject, setResolvedProject] = useState(null);
    const [projectsLoading, setProjectsLoading] = useState(true);

    // First, resolve the project ID from lmsType
    useEffect(() => {
        const resolveProject = async () => {
            setProjectsLoading(true);
            try {
                const { data } = await API.get('/projects');
                const allProjects = data.data || [];
                const matched = allProjects.find(p => p.name === lmsType);
                if (matched) {
                    setResolvedProject(matched);
                } else {
                    console.error("No project found matching lmsType:", lmsType);
                }
            } catch (error) {
                console.error("Failed to fetch projects for resolution", error);
            } finally {
                setProjectsLoading(false);
            }
        };
        resolveProject();
    }, [lmsType]);

    const fetchLeads = async () => {
        if (!resolvedProject) return;
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (filters.status) query.append('status', filters.status);
            if (filters.priority) query.append('priority', filters.priority);
            if (searchTerm) query.append('search', searchTerm);
            query.append('page', page);
            query.append('limit', limit);
            query.append('sort', '-createdAt');

            const { data } = await API.get(`/projects/${resolvedProject._id}/leads?${query.toString()}`);
            setLeads(data.data || []);
            setTotalLeads(data.total || 0);
            setTotalPages(data.pagination?.pages || 1);
        } catch (error) {
            console.error("Failed to fetch leads", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (resolvedProject) {
            setPage(1); // Reset to page 1 on filter/search change
            fetchLeads();
        }
    }, [filters, searchTerm, resolvedProject]);

    useEffect(() => {
        if (resolvedProject) {
            fetchLeads();
        }
    }, [page]);

    const handleCreateLead = async (formData) => {
        if (!resolvedProject) return;
        setFormLoading(true);
        try {
            await API.post(`/projects/${resolvedProject._id}/leads`, formData);
            setIsModalOpen(false);
            fetchLeads();
        } catch (error) {
            console.error("Failed to create lead", error);
            alert(error.response?.data?.message || "Failed to create lead");
        } finally {
            setFormLoading(false);
        }
    };

    const handleExport = async () => {
        if (!resolvedProject) return;
        try {
            const response = await API.get(`/projects/${resolvedProject._id}/leads/export`, {
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
        const p = priority?.toLowerCase();
        switch (p) {
            case 'high':
            case 'urgent': return '#f43f5e';
            case 'medium': return '#f59e0b';
            case 'low': return '#c084fc';
            default: return '#94a3b8';
        }
    };

    const getStatusColor = (status) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'new': return '#0ea5e9';
            case 'contacted': return '#6366f1';
            case 'qualified': return '#a78bfa';
            case 'proposal_sent':
            case 'negotiation':
            case 'converted': return '#8b5cf6';
            case 'lost':
            case 'junk': return '#ef4444';
            default: return '#94a3b8';
        }
    };



    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ minWidth: '200px' }}>
                    <h1 className="text-gradient" style={{ fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: '4px' }}>Lead Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage and track all customer inquiries</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {selectedLeadIds.length > 0 && (
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => setIsAssignModalOpen(true)}
                            style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--secondary)', color: 'var(--secondary)' }}
                        >
                            <UserPlus size={18} />
                            Assign ({selectedLeadIds.length})
                        </button>
                    )}
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
                        projectId={resolvedProject?._id}
                    />
                )}
            </Modal>

            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Bulk Import Leads"
            >
                <ImportLeadsModal
                    projectId={resolvedProject?._id}
                    onClose={() => setIsImportModalOpen(false)}
                    onComplete={fetchLeads}
                />
            </Modal>

            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title="Bulk Assign Leads"
            >
                <AssignLeadModal
                    leads={selectedLeadIds}
                    projectId={resolvedProject?._id}
                    onClose={() => {
                        setIsAssignModalOpen(false);
                        setSelectedLeadIds([]);
                    }}
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
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                    <option value="junk">Junk</option>
                </select>
                <select
                    className="input-field"
                    style={{ width: '160px' }}
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="urgent">Urgent</option>
                </select>
                <button className="btn btn-secondary" onClick={() => setFilters({ status: '', priority: '' })}>
                    Reset
                </button>
            </div>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '16px 24px', width: '40px' }}>
                                <input 
                                    type="checkbox" 
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                    checked={leads.length > 0 && selectedLeadIds.length === leads.filter(l => !l.assignedTo).length && leads.some(l => !l.assignedTo)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedLeadIds(leads.filter(l => !l.assignedTo).map(l => l._id));
                                        } else {
                                            setSelectedLeadIds([]);
                                        }
                                    }}
                                />
                            </th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>LEAD NAME</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>STATUS</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>PRIORITY</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>ASSIGNED TO</th>
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
                                        <input 
                                            type="checkbox" 
                                            style={{ width: '16px', height: '16px', cursor: lead.assignedTo ? 'not-allowed' : 'pointer', opacity: lead.assignedTo ? 0.4 : 1 }}
                                            checked={selectedLeadIds.includes(lead._id)}
                                            disabled={!!lead.assignedTo}
                                            title={lead.assignedTo ? 'Already assigned' : 'Select to assign'}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedLeadIds([...selectedLeadIds, lead._id]);
                                                } else {
                                                    setSelectedLeadIds(selectedLeadIds.filter(id => id !== lead._id));
                                                }
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span 
                                                onClick={() => navigate(`/admin/projects/${resolvedProject._id}/leads/${lead._id}`)}
                                                style={{ 
                                                    fontWeight: '600', 
                                                    marginBottom: '4px', 
                                                    cursor: 'pointer',
                                                    color: 'var(--primary)',
                                                }}
                                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                            >
                                                {lead.name}
                                            </span>
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
                                                border: `1px solid ${getStatusColor(lead.status)}40`,
                                                textTransform: 'capitalize'
                                            }}>
                                                {lead.status?.replace('_', ' ')}
                                            </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getPriorityColor(lead.priority) }} />
                                            <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{lead.priority}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {lead.assignedTo ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: '26px', height: '26px', borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '11px', fontWeight: '700', color: 'white', flexShrink: 0
                                                }}>
                                                    {lead.assignedTo?.name?.charAt(0)}
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: '500' }}>{lead.assignedTo?.name}</span>
                                            </div>
                                        ) : (
                                            <span style={{
                                                padding: '3px 8px', borderRadius: '6px', fontSize: '11px',
                                                fontWeight: '600', background: 'rgba(148,163,184,0.1)',
                                                color: 'var(--text-muted)', border: '1px solid var(--glass-border)'
                                            }}>
                                                Unassigned
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                onClick={() => setUpdatingLead(lead)}
                                            >
                                                Update
                                            </button>

                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                </div>

                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        Showing {leads.length} of {totalLeads} leads
                        {totalPages > 1 && ` — Page ${page} of ${totalPages}`}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px' }}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    className={page === pageNum ? 'btn btn-primary' : 'btn btn-secondary'}
                                    style={{ padding: '6px 12px', fontSize: '13px', minWidth: '36px' }}
                                    onClick={() => setPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px' }}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadManagement;
