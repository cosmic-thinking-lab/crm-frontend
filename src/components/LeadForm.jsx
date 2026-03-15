import React, { useState } from 'react';

const LeadForm = ({ onSubmit, initialData, loading, hideLmsType = false }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        email: '',
        phone: '',
        source: 'Website',
        priority: 'Medium',
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
                        required
                    />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Source</label>
                    <select
                        name="source"
                        className="input-field"
                        value={formData.source}
                        onChange={handleChange}
                    >
                        <option value="Website">Website</option>
                        <option value="Direct">Direct</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Referral">Referral</option>
                    </select>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Priority</label>
                    <select
                        name="priority"
                        className="input-field"
                        value={formData.priority}
                        onChange={handleChange}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', marginTop: '12px' }}>
                {loading ? 'Processing...' : (initialData ? 'Update Lead' : 'Create Lead')}
            </button>
        </form>
    );
};

export default LeadForm;
