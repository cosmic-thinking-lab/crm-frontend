import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const normalizeUser = (userData) => {
        if (!userData) return null;
        let role = 'BDA'; // Default
        if (userData.globalRole === 'admin') role = 'Admin';
        else if (userData.globalRole === 'manager') role = 'Manager';
        return { ...userData, role };
    };

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await API.get('/auth/me');
                    setUser(normalizeUser(data.user)); 
                } catch (error) {
                    console.error("Auth initialization failed", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        const { data } = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        const normalizedUser = normalizeUser(data.user);
        setUser(normalizedUser);
        return normalizedUser;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
