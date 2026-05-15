import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { 
    Users, 
    Search, 
    Mail, 
    Phone,
    UserCircle,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ManagerTeam = () => {
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Get assigned project
            const { data: projectsData } = await API.get('/managers/my-projects');
            if (!projectsData.data || projectsData.data.length === 0) {
                setError("No projects assigned.");
                setLoading(false);
                return;
            }
            const currentProject = projectsData.data[0];
            setProject(currentProject);

            // 2. Fetch project members
            const { data: membersData } = await API.get(`/projects/${currentProject._id}/members`);
            setMembers(membersData.data || []);
        } catch (error) {
            console.error("Failed to fetch team", error);
            setError("Failed to load team members.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredMembers = members.filter(m => 
        m.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.userId.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && members.length === 0) {
        return <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>Loading team...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '4px' }}>My BDA Team</h1>
                <p style={{ color: 'var(--text-muted)' }}>Members assigned to {project?.name}</p>
            </div>

            <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search team members..."
                        className="input-field"
                        style={{ paddingLeft: '44px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {filteredMembers.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No team members found.
                    </div>
                ) : filteredMembers.map((member) => (
                    <motion.div
                        key={member._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ 
                            y: -8,
                            scale: 1.01,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                        }}
                        className="glass-card"
                        style={{ 
                            padding: '32px 24px 24px', 
                            cursor: 'pointer',
                            background: 'var(--glass)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '28px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Top Accent Line */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: member.role === 'manager' ? 'linear-gradient(90deg, transparent, #ec4899, transparent)' : 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                            opacity: 0.6
                        }} />

                        <div style={{ display: 'flex', gap: '20px', marginBottom: '28px' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ 
                                    position: 'absolute',
                                    inset: '-8px',
                                    background: member.role === 'manager' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                    borderRadius: '20px',
                                    filter: 'blur(10px)',
                                    opacity: 0.5
                                }} />
                                <div style={{ 
                                    width: '72px', 
                                    height: '72px', 
                                    borderRadius: '18px', 
                                    background: 'var(--primary-gradient)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '28px',
                                    fontWeight: '800',
                                    position: 'relative',
                                    zIndex: 1,
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {member.userId.name.charAt(0)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px', letterSpacing: '-0.02em' }}>{member.userId.name}</h3>
                                <div style={{ 
                                    padding: '4px 12px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    background: member.role === 'manager' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                    color: member.role === 'manager' ? '#ec4899' : 'var(--primary)',
                                    border: member.role === 'manager' ? '1px solid rgba(236, 72, 153, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)',
                                    alignSelf: 'flex-start'
                                }}>
                                    {member.role === 'manager' ? 'Project Manager' : 'Business Development'}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px', background: 'var(--bg-darker)', padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-main)', opacity: 0.7 }}>
                                <div style={{ color: 'var(--primary)' }}><Mail size={16} /></div>
                                {member.userId.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-main)', opacity: 0.7 }}>
                                <div style={{ color: 'var(--primary)' }}><Phone size={16} /></div>
                                {member.userId.phone || 'Contact not listed'}
                            </div>
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            paddingTop: '4px',
                            color: 'var(--primary)',
                            fontWeight: '700',
                            fontSize: '14px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 10px #a78bfa' }} />
                                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Active Member</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(99, 102, 241, 0.1)', padding: '6px 12px', borderRadius: '12px' }}>
                                View Performance
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ManagerTeam;
