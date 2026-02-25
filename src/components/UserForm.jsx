import React, { useState } from 'react';

const UserForm = ({ onSubmit, initialData, loading }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        email: '',
        password: ''
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
                <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Full Name</label>
                <input
                    name="name"
                    className="input-field"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>
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
            {!initialData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Password</label>
                    <input
                        name="password"
                        type="password"
                        className="input-field"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', marginTop: '12px' }}>
                {loading ? 'Processing...' : (initialData ? 'Update User' : 'Create BDA')}
            </button>
        </form>
    );
};

export default UserForm;
