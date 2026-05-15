import React, { useState, useRef, useEffect } from 'react';
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
    ArrowLeft,
    Folder
} from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Notifications from './Notifications';
import { useTheme } from '../context/ThemeContext';

// Breakpoints
const MOBILE_BREAKPOINT = 768;    // ≤ 768  → full-screen drawer
const TABLET_BREAKPOINT = 1280;   // 769–1280 → icon-only collapsed rail

const getInitialState = () => {
    const w = window.innerWidth;
    return {
        isMobile:   w <= MOBILE_BREAKPOINT,
        collapsed:  w > MOBILE_BREAKPOINT && w <= TABLET_BREAKPOINT,
    };
};

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }) => (
    <Link
        to={path}
        className={`sidebar-item ${active ? 'active' : ''}`}
        title={collapsed ? label : undefined}
        style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            margin: '4px 12px',
            borderRadius: '12px',
            color: active ? 'white' : 'var(--text-main)',
            background: active ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
            textDecoration: 'none',
            gap: '12px',
            transition: 'var(--transition)',
            position: 'relative',
            overflow: 'hidden',
            justifyContent: collapsed ? 'center' : 'flex-start',
        }}
    >
        <Icon size={20} style={{ flexShrink: 0 }} />
        {!collapsed && <span style={{ fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}>{label}</span>}
        {active && !collapsed && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
    </Link>
);

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const init = getInitialState();
    const [isMobile,   setIsMobile]   = useState(init.isMobile);
    const [collapsed,  setCollapsed]  = useState(init.collapsed);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu,   setShowProfileMenu]   = useState(false);

    const profileRef = useRef(null);
    const location   = useLocation();
    const { lmsType: urlLmsType } = useParams();

    // ---------- resize + outside-click ----------
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const mobile  = w <= MOBILE_BREAKPOINT;
            const tablet  = w > MOBILE_BREAKPOINT && w <= TABLET_BREAKPOINT;
            setIsMobile(mobile);
            // Only auto-toggle if the user hasn't manually changed; easiest: always follow breakpoint
            if (mobile) {
                setCollapsed(false); // drawer handles visibility; rail collapsed state irrelevant
                setMobileOpen(false);
            } else if (tablet) {
                setCollapsed(true);
            } else {
                setCollapsed(false);
            }
        };

        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Close mobile drawer + profile menu on navigation
    useEffect(() => {
        setMobileOpen(false);
        setShowProfileMenu(false);
    }, [location.pathname]);

    // ---------- menus ----------
    const searchParams = new URLSearchParams(location.search);
    const pathMatch = location.pathname.match(/\/admin\/lms\/([^/]+)/);
    const currentLmsTypeFromPath = pathMatch ? decodeURIComponent(pathMatch[1]) : null;
    const currentLmsType = urlLmsType || searchParams.get('lmsType') || currentLmsTypeFromPath;

    const adminMenu = [
        { icon: LayoutDashboard, label: 'Overview',  path: '/admin/overview' },
        { icon: Folder,          label: 'Projects',  path: '/admin/dashboard' },
        { icon: Users,           label: 'Teams',     path: '/admin/users' },
    ];

    const managerMenu = [
        { icon: LayoutDashboard, label: 'Overview',  path: '/manager/overview' },
        { icon: Target,          label: 'Leads',     path: '/manager/leads' },
        { icon: Users,           label: 'My Team',   path: '/manager/team' },
    ];

    const productMenu = currentLmsType ? [
        { icon: LayoutDashboard, label: 'Dashboard',        path: `/admin/lms/${encodeURIComponent(currentLmsType)}/dashboard` },
        { icon: Target,          label: 'All Leads',        path: `/admin/leads?lmsType=${encodeURIComponent(currentLmsType)}` },
        { icon: Users,           label: 'Teams',            path: `/admin/lms/${encodeURIComponent(currentLmsType)}/bdas` },
        { icon: ArrowLeft,       label: 'Back to Products', path: '/admin/dashboard', isBack: true },
    ] : null;

    const bdaMenu = [
        { icon: LayoutDashboard, label: 'My Dashboard', path: '/bda/dashboard' },
        { icon: Target,          label: 'My Leads',     path: '/bda/leads' },
    ];

    const menu = productMenu || (user?.role === 'Admin' ? adminMenu : user?.role === 'Manager' ? managerMenu : bdaMenu);

    // ---------- derived layout values ----------
    const sidebarWidth = isMobile ? '280px' : (collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)');
    const mainMargin   = isMobile ? '0' : (collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)');

    // On mobile the sidebar is a fixed overlay; on desktop it's a fixed rail
    const sidebarTransform = isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)';

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', background: 'transparent', position: 'relative' }}>

            {/* Mobile Overlay */}
            {isMobile && mobileOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
            )}

            {/* ───────── Sidebar ───────── */}
            <aside
                className="glass-card sidebar"
                style={{
                    width: sidebarWidth,
                    height: '100%',
                    margin: 0,
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                    zIndex: 1000,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    overflow: 'hidden',
                    transform: sidebarTransform,
                }}
            >
                {/* Logo row */}
                <div style={{
                    padding: (collapsed && !isMobile) ? '20px 0' : '20px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: (collapsed && !isMobile) ? 'center' : 'space-between',
                    gap: '10px',
                    minHeight: '68px',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <div style={{
                            minWidth: '32px', width: '32px', height: '32px',
                            borderRadius: '8px', background: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <Target size={18} color="white" />
                        </div>
                        {(!collapsed || isMobile) && (
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <span style={{ fontWeight: '800', fontSize: '16px', letterSpacing: '-0.5px', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                                    COSMIC CRM
                                </span>
                                {currentLmsType && (
                                    <span style={{
                                        fontSize: '10px', color: 'var(--primary)', fontWeight: '700',
                                        textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '-2px',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>
                                        {currentLmsType}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Toggle button — visible when sidebar is expanded OR on mobile */}
                    {(!collapsed || isMobile) && (
                        <button
                            onClick={() => isMobile ? setMobileOpen(false) : setCollapsed(true)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '8px', flexShrink: 0 }}
                        >
                            <Menu size={20} />
                        </button>
                    )}
                </div>

                {/* Expand button — visible when sidebar is collapsed (icon rail) */}
                {collapsed && !isMobile && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        <button
                            onClick={() => setCollapsed(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                )}

                {/* Nav items */}
                <nav style={{ flex: 1, marginTop: '4px', overflowY: 'auto', overflowX: 'hidden' }}>
                    {menu.map((item) => {
                        const [pathPart] = item.path.split('?');
                        const isItemActive =
                            (location.pathname === pathPart ||
                                (item.label === 'All Leads' && location.pathname.includes('/leads/'))) &&
                            (item.path.includes('?') ? location.search.includes(item.path.split('?')[1]) : true);

                        return (
                            <SidebarItem
                                key={item.path}
                                {...item}
                                active={isItemActive}
                                collapsed={collapsed && !isMobile}
                            />
                        );
                    })}
                </nav>
            </aside>

            {/* ───────── Main Content ───────── */}
            <main
                className="main-content"
                style={{
                    flex: 1,
                    marginLeft: mainMargin,
                    transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
                    padding: isMobile ? '16px' : '16px 32px 32px',
                    width: '100%',
                    minWidth: 0,
                    height: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
            >
                {/* ── Navbar ── */}
                <header style={{
                    height: 'var(--nav-height)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
                    position: 'relative',
                }}>
                    {/* Left — hamburger on mobile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {isMobile && (
                            <button
                                onClick={() => setMobileOpen(true)}
                                style={{
                                    background: 'var(--glass)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    width: '42px', height: '42px',
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <Menu size={20} />
                            </button>
                        )}
                    </div>

                    {/* Right — actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Theme toggle */}
                        <button
                            className="glass-card"
                            onClick={toggleTheme}
                            style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                            }}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Notifications */}
                        <button
                            className="glass-card"
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: 'none', cursor: 'pointer',
                                color: showNotifications ? 'var(--primary)' : 'var(--text-muted)',
                                position: 'relative',
                            }}
                        >
                            <Bell size={20} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', border: '2px solid var(--bg-dark)' }} />
                        </button>

                        <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

                        {/* Profile + dropdown */}
                        <div ref={profileRef} style={{ position: 'relative' }}>
                            <div
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    cursor: 'pointer', padding: '4px 8px', borderRadius: '12px',
                                    transition: 'var(--transition)',
                                    background: showProfileMenu ? 'var(--glass-hover)' : 'transparent',
                                }}
                            >
                                {!isMobile && (
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{user?.name}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.role}</p>
                                    </div>
                                )}
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    background: 'linear-gradient(135deg, var(--secondary), var(--accent))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: '700', color: 'white', fontSize: '14px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', flexShrink: 0,
                                }}>
                                    {user?.name?.charAt(0)}
                                </div>
                            </div>

                            {showProfileMenu && (
                                <div className="profile-dropdown">
                                    <div className="profile-dropdown-header">
                                        <div className="profile-dropdown-avatar">
                                            {user?.name?.charAt(0)}
                                        </div>
                                        <div className="profile-dropdown-info">
                                            <p>{user?.name}</p>
                                            <p>{user?.email || user?.role}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="profile-dropdown-btn"
                                        onClick={() => { setShowProfileMenu(false); logout(); }}
                                    >
                                        <LogOut size={15} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
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
