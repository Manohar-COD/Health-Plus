import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Droplet, 
  Moon, 
  Dumbbell, 
  LineChart, 
  MessageSquareHeart, 
  User as UserIcon, 
  LogOut,
  HeartPulse
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hydration', label: 'Hydration', icon: Droplet },
    { to: '/sleep', label: 'Sleep', icon: Moon },
    { to: '/workouts', label: 'Workouts', icon: Dumbbell },
    { to: '/analytics', label: 'Analytics', icon: LineChart },
    { to: '/ai-coach', label: 'AI Coach', icon: MessageSquareHeart },
    { to: '/profile', label: 'Profile', icon: UserIcon }
  ];

  return (
    <aside style={styles.sidebar} className="glass-panel">
      {/* Brand logo */}
      <div style={styles.brand} onClick={() => navigate('/')}>
        <HeartPulse size={32} color="var(--primary)" />
        <span style={styles.brandText}>Health Plus</span>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                ...styles.navLink,
                backgroundColor: isActive ? 'var(--primary-glow)' : 'transparent',
                borderColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
              })}
              className="sidebar-link"
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User profile & logout */}
      {user && (
        <div style={styles.profileSection}>
          <div style={styles.profileInfo}>
            <div style={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userStreak}>🔥 {user.streak || 0} Day Streak</div>
            </div>
          </div>
          <button onClick={logout} style={styles.logoutBtn} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      )}
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    height: 'calc(100vh - 40px)',
    position: 'fixed',
    top: '20px',
    left: '20px',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    zIndex: 100,
    borderRadius: 'var(--radius-lg)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 8px 24px 8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
  },
  brandText: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '24px',
    flexGrow: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.95rem',
    transition: 'var(--transition)',
    borderLeft: '3px solid transparent',
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 8px 0 8px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    marginTop: 'auto',
  },
  profileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    overflow: 'hidden',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userStreak: {
    fontSize: '0.75rem',
    color: 'var(--warning)',
    fontWeight: '500',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition)',
  },
};

export default Sidebar;
