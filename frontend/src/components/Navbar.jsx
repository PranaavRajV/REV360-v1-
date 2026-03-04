import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';
import './Navbar.css';

const navLinks = [
  { path: '/', label: 'Dashboard' },
  { path: '/vehicles', label: 'Vehicles' },
  { path: '/bookings', label: 'Bookings' },
  { path: '/services', label: 'Services' },
  { path: '/bike-record', label: 'Bike Record' },
  { path: '/customize', label: 'Customize' },
  { path: '/marketplace', label: 'Marketplace' },
  { path: '/analytics', label: 'Analytics' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.getNotifications().then(setNotifications).catch(() => { });
    }
  }, [user, location.pathname]);

  const unread = notifications.filter((n) => !n.isRead).length;
  const handleLogout = () => { logout(); navigate('/login'); };
  const markAllRead = () => {
    api.markAllAsRead().then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });
  };

  // Get initials for avatar
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo">⚡</div>
          <div>
            <span className="brand-text">REV360</span>
            <span className="brand-sub">Bike Intelligence</span>
          </div>
        </Link>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              id={`nav-${link.path.replace('/', '') || 'dashboard'}`}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <div className="notif-wrapper">
            <button className="notif-btn" onClick={() => setShowNotif(!showNotif)} title="Notifications">
              🔔
              {unread > 0 && <span className="notif-badge">{unread}</span>}
            </button>

            {showNotif && (
              <div className="notif-dropdown glass-card">
                <div className="notif-header">
                  <h4>Notifications</h4>
                  {unread > 0 && (
                    <button className="btn btn-sm btn-ghost" onClick={markAllRead}>Mark all read</button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="notif-empty">No notifications yet</p>
                ) : (
                  <div className="notif-list">
                    {notifications.slice(0, 8).map((n) => (
                      <div key={n._id} className={`notif-item ${n.isRead ? '' : 'unread'}`}>
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <span className="user-name">{user.name?.split(' ')[0]}</span>
          </div>

          <button className="btn btn-sm btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
