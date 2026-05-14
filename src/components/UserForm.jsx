import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const UserForm = ({ onSubmit, initialData, loading, showRole = false }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        globalRole: initialData?.globalRole || 'bda',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
        };
        if (showRole) {
            payload.globalRole = formData.globalRole;
        }
        if (formData.password) {
            payload.password = formData.password;
        }
        onSubmit(payload);
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Phone Number</label>
                <input
                    name="phone"
                    type="tel"
                    className="input-field"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />
            </div>
            {showRole && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Account Global Role</label>
                    <select
                        name="globalRole"
                        className="input-field"
                        style={{ background: 'var(--bg-dark)' }}
                        value={formData.globalRole}
                        onChange={handleChange}
                        required
                    >
                        <option value="bda">BDA (Default User)</option>
                        <option value="manager">Manager (Admin Access)</option>
                    </select>
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="input-field"
                        value={formData.password}
                        onChange={handleChange}
                        required={!initialData}
                        style={{ paddingRight: '45px' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px'
                        }}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', marginTop: '12px' }}>
                {loading ? 'Processing...' : (initialData ? 'Update User' : 'Create User')}
            </button>
        </form>
    );
};

export default UserForm;
