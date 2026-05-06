import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { 
    Search, 
    Filter, 
    Download, 
    Upload, 
    Plus,
    MoreVertical,
    Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../../components/Modal';
import LeadForm from '../../components/LeadForm';
import LeadActionModal from '../../components/LeadActionModal';
import ImportLeadsModal from '../../components/ImportLeadsModal';
import BulkAssignModal from '../../components/BulkAssignModal';

const ManagerLeads = () => {
    const [project, setProject] = useState(null);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Get assigned project if not already fetched
            let currentProject = project;
            if (!currentProject) {
                const { data: projectsData } = await API.get('/managers/my-projects');
                if (!projectsData.data || projectsData.data.length === 0) {
                    setError("No projects assigned.");
                    setLoading(false);
                    return;
                }
                currentProject = projectsData.data[0];
                setProject(currentProject);
            }

            // 2. Fetch leads for this project
            const { data: leadsData } = await API.get(`/projects/${currentProject._id}/leads`, {
                params: {
                    search: searchTerm,
                    status: statusFilter,
                    page: pagination.page,
                    limit: pagination.limit
                }
            });

            setLeads(leadsData.data);
            setPagination({
                ...pagination,
                total: leadsData.total,
                pages: leadsData.pagination.pages
            });
        } catch (error) {
            console.error("Failed to fetch leads", error);
            setError("Failed to load leads.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchTerm, statusFilter, pagination.page]);

    const handleCreateLead = async (formData) => {
        try {
            await API.post(`/projects/${project._id}/leads`, formData);
            setIsCreateModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Failed to create lead", error);
            alert("Failed to create lead.");
        }
    };

    const handleExport = async () => {
        try {
            const response = await API.get(`/projects/${project._id}/leads/export`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${project.name}_leads.xlsx`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("Export failed", error);
        }
    };

    if (loading && leads.length === 0) {
        return <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>Loading leads...</div>;
    }

    if (error) {
        return <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>{error}</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '4px' }}>Lead Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Managing leads for {project?.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(true)}>
                        <Upload size={18} />
                        Import
                    </button>
                    <button className="btn btn-secondary" onClick={handleExport}>
                        <Download size={18} />
                        Export
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={18} />
                        Add Lead
                    </button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedLeads.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card" 
                    style={{ 
                        padding: '12px 24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        border: '1px solid var(--primary)',
                        background: 'rgba(139, 92, 246, 0.05)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '14px' }}>
                            {selectedLeads.length} leads selected
                        </span>
                        <button 
                            className="btn btn-primary" 
                            style={{ padding: '8px 16px', fontSize: '13px' }}
                            onClick={() => setIsBulkAssignModalOpen(true)}
                        >
                            Bulk Assign
                        </button>
                    </div>
                    <button 
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
                        onClick={() => setSelectedLeads([])}
                    >
                        Clear Selection
                    </button>
                </motion.div>
            )}

            {/* Filters */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: '200px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        className="input-field"
                        style={{ paddingLeft: '44px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <select 
                        className="input-field" 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
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
                </div>
            </div>

            {/* Leads Table */}
            <div className="glass-table-container">
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={leads.length > 0 && selectedLeads.length === leads.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedLeads(leads.map(l => l._id));
                                        } else {
                                            setSelectedLeads([]);
                                        }
                                    }}
                                />
                            </th>
                            <th>Lead Details</th>
                            <th>Status</th>
                            <th>Assigned To</th>
                            <th>Last Activity</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No leads found for this project.
                                </td>
                            </tr>
                        ) : leads.map((lead) => (
                            <motion.tr key={lead._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <td>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedLeads.includes(lead._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedLeads([...selectedLeads, lead._id]);
                                            } else {
                                                setSelectedLeads(selectedLeads.filter(id => id !== lead._id));
                                            }
                                        }}
                                    />
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Link 
                                            to={`/manager/projects/${project?._id}/leads/${lead._id}`}
                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                            className="lead-name-hover"
                                        >
                                            <span style={{ fontWeight: '600' }}>{lead.name}</span>
                                        </Link>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.email}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.phone}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge badge-${lead.status === 'converted' ? 'success' : lead.status === 'lost' ? 'accent' : 'primary'}`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td>
                                    {lead.assignedTo ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white' }}>
                                                {lead.assignedTo.name.charAt(0)}
                                            </div>
                                            <span style={{ fontSize: '13px' }}>{lead.assignedTo.name}</span>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Unassigned</span>
                                    )}
                                </td>
                                <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    {new Date(lead.updatedAt).toLocaleDateString()}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button 
                                        onClick={() => {
                                            setSelectedLead(lead);
                                            setActionModalOpen(true);
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Lead"
            >
                <LeadForm onSubmit={handleCreateLead} hideLmsType={true} />
            </Modal>

            {isImportModalOpen && project && (
                <ImportLeadsModal 
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    projectId={project._id}
                    onImportSuccess={fetchData}
                />
            )}

            {actionModalOpen && selectedLead && (
                <LeadActionModal 
                    isOpen={actionModalOpen}
                    onClose={() => setActionModalOpen(false)}
                    lead={selectedLead}
                    projectId={project._id}
                    onComplete={fetchData}
                />
            )}

            {isBulkAssignModalOpen && (
                <Modal
                    isOpen={isBulkAssignModalOpen}
                    onClose={() => setIsBulkAssignModalOpen(false)}
                    title="Bulk Lead Assignment"
                >
                    <BulkAssignModal 
                        leadIds={selectedLeads}
                        projectId={project._id}
                        onClose={() => setIsBulkAssignModalOpen(false)}
                        onComplete={() => {
                            setSelectedLeads([]);
                            fetchData();
                        }}
                    />
                </Modal>
            )}
        </div>
    );
};

export default ManagerLeads;
