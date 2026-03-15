import React, { useState } from 'react';

const UserForm = ({ onSubmit, initialData, loading }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        email: ''
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
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        if (selectedFile) data.append('profileImage', selectedFile);
        
        onSubmit(data);
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
{/* Password generated automatically by backend */}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', marginTop: '12px' }}>
                {loading ? 'Processing...' : (initialData ? 'Update User' : 'Create BDA')}
            </button>
        </form>
    );
};

export default UserForm;
