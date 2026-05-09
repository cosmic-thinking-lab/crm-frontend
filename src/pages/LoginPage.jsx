import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), transparent), radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.15), transparent), var(--bg-darker)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Elements */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    top: '10%',
                    right: '15%',
                    width: '300px',
                    height: '300px',
                    background: 'var(--primary)',
                    filter: 'blur(100px)',
                    borderRadius: '50%',
                    zIndex: 0
                }}
            />
            <motion.div 
                animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                style={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '10%',
                    width: '250px',
                    height: '250px',
                    background: 'var(--secondary)',
                    filter: 'blur(80px)',
                    borderRadius: '50%',
                    zIndex: 0
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    padding: '48px',
                    position: 'relative',
                    zIndex: 1,
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            inset: '-4px',
                            borderRadius: '24px',
                            border: '2px solid rgba(139, 92, 246, 0.3)',
                            animation: 'pulse 2s infinite'
                        }} />
                        <LogIn size={36} color="white" />
                    </motion.div>
                    
                    <h1 className="text-gradient" style={{ 
                        fontSize: '32px', 
                        fontWeight: '800', 
                        marginBottom: '12px',
                        letterSpacing: '-0.5px'
                    }}>
                        Cosmic Tech CRM
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                        Empowering your business reach
                    </p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            padding: '14px',
                            borderRadius: '12px',
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                            color: '#fb7185',
                            fontSize: '14px',
                            marginBottom: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>⚠️</span> {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', marginLeft: '4px' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ 
                                position: 'absolute', 
                                left: '16px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: 'rgba(255,255,255,0.3)' 
                            }} />
                            <input
                                type="email"
                                className="input-field"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ 
                                    paddingLeft: '48px',
                                    height: '52px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '14px',
                                    color: 'var(--text-main)'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', marginLeft: '4px' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ 
                                position: 'absolute', 
                                left: '16px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: 'rgba(255,255,255,0.3)' 
                            }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ 
                                    paddingLeft: '48px',
                                    paddingRight: '48px',
                                    height: '52px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '14px',
                                    color: 'var(--text-main)'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.3)',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <a href="#" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ 
                            width: '100%', 
                            height: '52px',
                            justifyContent: 'center', 
                            fontSize: '16px', 
                            fontWeight: '700',
                            borderRadius: '14px',
                            marginTop: '8px',
                            boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ 
                    marginTop: '40px', 
                    paddingTop: '24px', 
                    borderTop: '1px solid rgba(255,255,255,0.05)', 
                    textAlign: 'center' 
                }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Secure login for authorized personnel only
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
