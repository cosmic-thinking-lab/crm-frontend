import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: type === 'danger' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: type === 'danger' ? 'var(--accent)' : 'var(--primary)',
                    marginBottom: '8px'
                }}>
                    <AlertTriangle size={32} />
                </div>
                
                <div>
                    <p style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                        {message}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        This action cannot be undone.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '10px' }}>
                    <button 
                        className="btn btn-secondary" 
                        onClick={onClose}
                        style={{ flex: 1, justifyContent: 'center' }}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className="btn" 
                        onClick={onConfirm}
                        style={{ 
                            flex: 1, 
                            justifyContent: 'center',
                            background: type === 'danger' ? 'var(--accent)' : 'var(--primary)',
                            color: 'white'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
