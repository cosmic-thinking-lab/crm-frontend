import React, { useState } from 'react';

const UserForm = ({ onSubmit, initialData, loading, showRole = false }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        role: initialData?.role || 'bda',
        password: ''
    });
    const [imagePreview, setImagePreview] = useState(initialData?.profileImage || null);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
        };
        if (showRole) {
            payload.role = formData.role;
        }
        if (formData.password) {
            payload.password = formData.password;
        }
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'var(--glass)',
                    border: '2px dashed var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {imagePreview ? (
                        <img 
                            src={imagePreview.startsWith('data:') ? imagePreview : `http://localhost:5000${imagePreview}`} 
                            alt="Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Photo</span>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                        }}
                    />
                </div>
                <label style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>
                    Click to upload photo
                </label>
            </div>
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
                    <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Project Role</label>
                    <select
                        name="role"
                        className="input-field"
                        style={{ background: 'var(--bg-dark)' }}
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="bda">BDA (Team Member)</option>
                        <option value="manager">Project Manager</option>
                    </select>
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Password</label>
                <input
                    name="password"
                    type="password"
                    className="input-field"
                    value={formData.password}
                    onChange={handleChange}
                    required={!initialData}
                />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', marginTop: '12px' }}>
                {loading ? 'Processing...' : (initialData ? 'Update User' : 'Create User')}
            </button>
        </form>
    );
};

export default UserForm;
