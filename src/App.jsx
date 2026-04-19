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
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" />;
    if (user.role === 'Manager') return <Navigate to="/admin/dashboard" />; // Managers currently share dashboard view
    return <Navigate to="/bda/dashboard" />;
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
import LmsDashboard from './pages/admin/LmsDashboard';
import LmsBdas from './pages/admin/LmsBdas';
import LmsBdaLeads from './pages/admin/LmsBdaLeads';

function AppContent() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            {user?.role === 'Admin' || user?.role === 'Manager' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/bda/dashboard" />}
          </Layout>
        </ProtectedRoute>
      } />



      {/* Admin Routes with sidebar */}
      <Route path="/admin/*" element={
        <ProtectedRoute role="Admin">
          <Layout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/:id/leads" element={<BDALeads />} />
              <Route path="leads" element={<LeadManagement />} />
              <Route path="projects/:projectId/leads/:id" element={<LeadDetail role="Admin" />} />
              <Route path="lms/:lmsType/dashboard" element={<LmsDashboard />} />
              <Route path="lms/:lmsType/bdas" element={<LmsBdas />} />
              <Route path="lms/:lmsType/bda/:bdaId/leads" element={<LmsBdaLeads />} />
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
              <Route path="projects/:projectId/leads/:id" element={<LeadDetail role="BDA" />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

