import React, { useState } from 'react';

const LeadForm = ({ onSubmit, initialData, loading, hideLmsType = false }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        email: '',
        phone: '',
        organization: '',
        status: 'new',
        priority: 'medium',
        lmsType: 'School LMS'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Lead Full Name</label>
                <input
                    name="name"
                    className="input-field"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Email Address</label>
                    <input
                        name="email"
                        type="email"
                        className="input-field"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        required
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Phone Number</label>
                    <input
                        name="phone"
                        className="input-field"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
                        required
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Organization / School</label>
                <input
                    name="organization"
                    className="input-field"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Enter organization name"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Status</label>
                    <select
                        name="status"
                        className="input-field"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal_sent">Proposal Sent</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Priority</label>
                    <select
                        name="priority"
                        className="input-field"
                        value={formData.priority}
                        onChange={handleChange}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
            </div>

            {!hideLmsType && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Product / LMS Type</label>
                    <select
                        name="lmsType"
                        className="input-field"
                        value={formData.lmsType}
                        onChange={handleChange}
                        required
                    >
                        <option value="School LMS">School LMS</option>
                        <option value="Institute LMS">Institute LMS</option>
                        <option value="University LMS">University LMS</option>
                        <option value="SAAS">SAAS</option>
                    </select>
                </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', marginTop: '12px' }}>
                {loading ? 'Processing...' : (initialData ? 'Update Lead' : 'Create Lead')}
            </button>
        </form>
    );
};



export default LeadForm;
