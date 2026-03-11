import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
    ChevronLeft,
    Mail,
    Phone,
    ArrowLeft,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../components/Modal';
import LeadActionModal from '../../components/LeadActionModal';

const LmsBdaLeads = () => {
    const { lmsType, bdaId } = useParams();
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [bdaInfo, setBdaInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingLead, setUpdatingLead] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch BDA info
                const { data: bdaData } = await API.get(`/admin/users/${bdaId}`);
                setBdaInfo(bdaData);

                // Fetch leads assigned to this BDA and filtered by lmsType
                const { data: leadsData } = await API.get(`/admin/leads?assignedTo=${bdaId}&lmsType=${encodeURIComponent(lmsType)}`);
                setLeads(leadsData);
            } catch (error) {
                console.error("Failed to fetch BDA leads data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [lmsType, bdaId]);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => navigate(`/admin/lms/${encodeURIComponent(lmsType)}/bdas`)}
                    className="btn btn-secondary"
                    style={{ padding: '8px', borderRadius: '10px' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '4px' }}>
                        {bdaInfo ? `${bdaInfo.name}'s ${lmsType} Leads` : 'Team Member Leads'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Detailed view of leads for {lmsType}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(14, 165, 233, 0.1)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Target size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total {lmsType} Leads</p>
                        <h3 style={{ fontSize: '24px', fontWeight: '700' }}>{leads.length} Active Leads</h3>
                    </div>
                </div>
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
                                    style={{ borderBottom: '1px solid var(--glass-border)' }}
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
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: lead.priority === 'High' ? '#f43f5e' : lead.priority === 'Medium' ? '#f59e0b' : '#10b981'
                                            }} />
                                            <span style={{ fontSize: '13px' }}>{lead.priority}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '6px 12px', fontSize: '12px' }}
                                            onClick={() => setUpdatingLead(lead)}
                                        >
                                            Transfer
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={!!updatingLead}
                onClose={() => setUpdatingLead(null)}
                title="Transfer Lead"
            >
                {updatingLead && (
                    <LeadActionModal
                        lead={updatingLead}
                        onClose={() => setUpdatingLead(null)}
                        onComplete={() => {
                            fetchData();
                        }}
                        isAdmin={true}
                    />
                )}
            </Modal>
        </div>
    );
};

export default LmsBdaLeads;
