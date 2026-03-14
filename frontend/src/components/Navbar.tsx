import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/" style={styles.brandLink}>Weekly Commit</Link>
      </div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>My Commits</Link>
        {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
          <Link to="/dashboard" style={styles.link}>Team Dashboard</Link>
        )}
        <span style={styles.userInfo}>{user?.fullName} ({user?.role})</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    height: '56px',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  brand: { fontWeight: 'bold', fontSize: '18px' },
  brandLink: { color: '#fff', textDecoration: 'none' },
  links: { display: 'flex', alignItems: 'center', gap: '16px' },
  link: { color: '#ccc', textDecoration: 'none', fontSize: '14px' },
  userInfo: { color: '#888', fontSize: '13px' },
  logoutBtn: {
    background: 'transparent',
    color: '#ff6b6b',
    border: '1px solid #ff6b6b',
    padding: '4px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
};
