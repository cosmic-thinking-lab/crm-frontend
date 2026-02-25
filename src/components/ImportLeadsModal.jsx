import React, { useState } from 'react';
import { Upload, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';

const ImportLeadsModal = ({ onClose, onComplete }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.name.endsWith('.xlsx'))) {
            setFile(selectedFile);
            setError('');
        } else {
            setError('Please select a valid Excel (.xlsx) file.');
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            await API.post('/admin/leads/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
            setTimeout(() => {
                onComplete();
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Import failed. High probability of duplicate leads or invalid format.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadSample = async () => {
        try {
            const response = await API.get('/admin/leads/export', {
                params: { sample: true },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'leads_sample.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to download sample', err);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!success ? (
                <>
                    <div
                        style={{
                            border: '2px dashed var(--glass-border)',
                            borderRadius: '16px',
                            padding: '40px 20px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'rgba(255,255,255,0.02)',
                            cursor: 'pointer'
                        }}
                        onClick={() => document.getElementById('file-upload').click()}
                    >
                        <Upload size={32} color="var(--primary)" />
                        <div>
                            <p style={{ fontWeight: '600' }}>{file ? file.name : 'Click to select Excel file'}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Only .xlsx files are supported</p>
                        </div>
                        <input
                            id="file-upload"
                            type="file"
                            hidden
                            accept=".xlsx"
                            onChange={handleFileChange}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                        <button
                            className="btn btn-primary"
                            onClick={handleUpload}
                            disabled={!file || loading}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            {loading ? 'Importing...' : 'Start Import'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(14, 165, 233, 0.05)', padding: '12px', borderRadius: '10px' }}>
                        <FileText size={14} />
                        <span>Need a template? <span
                            style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={handleDownloadSample}
                        >
                            Download Sample Excel
                        </span></span>
                    </div>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}
                    >
                        <CheckCircle2 size={32} />
                    </motion.div>
                    <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Import Successful!</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Your leads have been imported and are being processed.</p>
                </div>
            )}
        </div>
    );
};

export default ImportLeadsModal;
