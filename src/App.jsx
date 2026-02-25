import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-darker)',
        color: 'white'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/bda/dashboard'} />;
  }

  return children;
};

import AdminDashboard from './pages/admin/AdminDashboard';
import LeadManagement from './pages/admin/LeadManagement';
import UserManagement from './pages/admin/UserManagement';
import BDADashboard from './pages/bda/BDADashboard';
import MyLeads from './pages/bda/MyLeads';
import BDALeads from './pages/admin/BDALeads';
import LeadDetail from './pages/common/LeadDetail';

function AppContent() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            {user?.role === 'Admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/bda/dashboard" />}
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute role="Admin">
          <Layout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/:id/leads" element={<BDALeads />} />
              <Route path="leads" element={<LeadManagement />} />
              <Route path="leads/:id" element={<LeadDetail role="Admin" />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      {/* BDA Routes */}
      <Route path="/bda/*" element={
        <ProtectedRoute role="BDA">
          <Layout>
            <Routes>
              <Route path="dashboard" element={<BDADashboard />} />
              <Route path="leads" element={<MyLeads />} />
              <Route path="leads/:id" element={<LeadDetail role="BDA" />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

