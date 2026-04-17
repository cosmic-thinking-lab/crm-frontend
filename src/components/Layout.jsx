import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    LayoutDashboard,
    LogOut,
    Menu,
    Bell,
    ChevronRight,
    Target,
    Sun,
    Moon,
    ArrowLeft
} from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Notifications from './Notifications';
import { useTheme } from '../context/ThemeContext';

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }) => (

    <Link
        to={path}
        className={`sidebar-item ${active ? 'active' : ''}`}
        style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            margin: '4px 12px',
            borderRadius: '12px',
            color: active ? 'white' : 'var(--text-muted)',
            background: active ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
            textDecoration: 'none',
            gap: '12px',
            transition: 'var(--transition)',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <Icon size={20} />
        {!collapsed && <span style={{ fontWeight: '500', fontSize: '14px' }}>{label}</span>}
        {active && !collapsed && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
    </Link>
);

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [collapsed, setCollapsed] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const location = useLocation();
    const { lmsType: urlLmsType } = useParams();

    // Determine if we are in a product context
    const searchParams = new URLSearchParams(location.search);
    const pathMatch = location.pathname.match(/\/admin\/lms\/([^/]+)/);
    const currentLmsTypeFromPath = pathMatch ? decodeURIComponent(pathMatch[1]) : null;
    const currentLmsType = urlLmsType || searchParams.get('lmsType') || currentLmsTypeFromPath;

    const adminMenu = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Teams', path: '/admin/users' },
        { icon: Target, label: 'All Leads', path: '/admin/leads' },
    ];

    const productMenu = currentLmsType ? [
        { 
            icon: LayoutDashboard, 
            label: 'Dashboard', 
            path: `/admin/lms/${encodeURIComponent(currentLmsType)}/dashboard` 
        },
        { 
            icon: Target, 
            label: 'All Leads', 
            path: `/admin/leads?lmsType=${encodeURIComponent(currentLmsType)}` 
        },
        { 
            icon: Users, 
            label: 'Teams', 
            path: `/admin/lms/${encodeURIComponent(currentLmsType)}/bdas` 
        },
        { 
            icon: ArrowLeft, 
            label: 'Back to Products', 
            path: '/admin/dashboard',
            isBack: true
        }
    ] : null;

    const bdaMenu = [
        { icon: LayoutDashboard, label: 'My Dashboard', path: '/bda/dashboard' },
        { icon: Target, label: 'My Leads', path: '/bda/leads' },
    ];

    const menu = productMenu || (user?.role === 'Admin' ? adminMenu : bdaMenu);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
            {/* Sidebar */}
            <aside className="glass-card" style={{
                width: collapsed ? '80px' : 'var(--sidebar-width)',
                height: 'calc(100vh - 32px)',
                margin: '16px',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
                zIndex: 100,
                position: 'fixed'
            }}>
                <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        minWidth: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Target size={20} color="white" />
                    </div>
                    {!collapsed && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>COSMIC CRM</span>
                            {currentLmsType && (
                                <span style={{ 
                                    fontSize: '10px', 
                                    color: 'var(--primary)', 
                                    fontWeight: '700', 
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginTop: '-2px'
                                }}>
                                    {currentLmsType}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <nav style={{ flex: 1, marginTop: '12px' }}>
                    {menu.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                            collapsed={collapsed}
                        />
                    ))}
                </nav>

                <div style={{ padding: collapsed ? '16px 0' : '16px', borderTop: '1px solid var(--glass-border)' }}>
                    <button
                        onClick={logout}
                        className="sidebar-item"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            width: collapsed ? '40px' : 'calc(100% - 24px)',
                            margin: '0 auto',
                            padding: '12px',
                            borderRadius: '12px',
                            color: '#fb7185',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            gap: collapsed ? '0' : '12px',
                            transition: 'var(--transition)'
                        }}
                    >
                        <LogOut size={20} />
                        {!collapsed && <span style={{ fontWeight: '500', fontSize: '14px' }}>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: collapsed ? '112px' : 'calc(var(--sidebar-width) + 48px)',
                transition: 'margin-left 0.3s ease',
                padding: '16px 32px 32px'
            }}>
                {/* Navbar */}
                <header style={{
                    height: 'var(--nav-height)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
                    position: 'relative'
                }}>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                        <Menu size={24} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button
                            className="glass-card"
                            onClick={toggleTheme}
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)'
                            }}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button
                            className="glass-card"
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: 'pointer',
                                color: showNotifications ? 'var(--primary)' : 'var(--text-muted)',
                                position: 'relative'
                            }}
                        >
                            <Bell size={20} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', border: '2px solid var(--bg-dark)' }} />
                        </button>

                        <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '14px', fontWeight: '600' }}>{user?.name}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.role}</p>
                            </div>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--secondary), var(--accent))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                color: 'white',
                                fontSize: '14px'
                            }}>
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ width: '100%' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
