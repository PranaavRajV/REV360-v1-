import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [maintenanceScore, setMaintenanceScore] = useState(null);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getVehicles(),
      api.getBookings(),
      api.getNotifications(),
      api.getMaintenanceScore(),
      api.getServiceRecords(),
    ]).then(([v, b, n, m, svc]) => {
      setVehicles(v);
      setBookings(b);
      setNotifications(n.filter((x) => !x.isRead));
      setMaintenanceScore(m);
      setServiceRecords(svc);
    }).catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const upcomingBookings = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'completed');
  const vehicleTypeIcon = (type) => ({ bike: '🏍️', car: '🚗', scooter: '🛵' }[type] || '🏍️');
  const statusColor = (s) => ({ pending: 'warning', confirmed: 'info', in_progress: 'primary', completed: 'success', cancelled: 'danger' }[s] || 'info');

  // Bike record summary data
  const lastService = serviceRecords[0];
  const nextServiceKm = vehicles[0]?.nextServiceDueKm;
  const currentKm = vehicles[0]?.currentKm;
  const kmUntilService = nextServiceKm && currentKm ? Math.max(0, nextServiceKm - currentKm) : null;

  const scoreColor = (s) => {
    if (!s) return 'var(--text-muted)';
    if (s.label === 'Excellent') return 'var(--success)';
    if (s.label === 'Good') return 'var(--secondary)';
    if (s.label === 'Poor') return 'var(--danger)';
    return 'var(--amber)';
  };

  if (loading) {
    return (
      <div className="page-active container">
        <div className="dashboard-skeleton">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-active container">
      {/* ── Greeting ── */}
      <div className="dashboard-greeting">
        <div>
          <h1 className="greeting-name">
            <span className="greeting-hey">Hey,</span> {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="greeting-sub">Your bikes are ready. Let's ride.</p>
        </div>
        <Link to="/bookings" className="btn btn-primary">+ New Booking</Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-cards">
        <div className="stat-card glass-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(255, 107, 44, 0.12)', border: '1px solid rgba(255, 107, 44, 0.2)' }}>
            <span>🏍️</span>
          </div>
          <div>
            <div className="stat-value">{vehicles.length}</div>
            <div className="stat-label">My Vehicles</div>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(74, 158, 255, 0.12)', border: '1px solid rgba(74, 158, 255, 0.2)' }}>
            <span>📅</span>
          </div>
          <div>
            <div className="stat-value">{upcomingBookings.length}</div>
            <div className="stat-label">Upcoming Bookings</div>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(245, 166, 35, 0.12)', border: '1px solid rgba(245, 166, 35, 0.2)' }}>
            <span>🔔</span>
          </div>
          <div>
            <div className="stat-value">{notifications.length}</div>
            <div className="stat-label">Unread Alerts</div>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrap" style={{
            background: maintenanceScore?.label === 'Excellent' ? 'rgba(62, 207, 142, 0.12)' :
              maintenanceScore?.label === 'Poor' ? 'rgba(229, 83, 75, 0.12)' : 'rgba(245, 166, 35, 0.12)',
            border: `1px solid ${scoreColor(maintenanceScore)}30`,
          }}>
            <span>⚡</span>
          </div>
          <div>
            <div className="stat-value" style={{ color: scoreColor(maintenanceScore) }}>
              {typeof maintenanceScore?.score === 'number' && !isNaN(maintenanceScore.score) ? (
                <>{Math.round(maintenanceScore.score)}<span style={{ fontSize: 16, opacity: 0.8 }}>/100</span></>
              ) : (
                <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>N/A</span>
              )}
            </div>
            <div className="stat-label">Health Score</div>
          </div>
        </div>
      </div>

      {/* ── Bike Record Quick-Access Banner ── */}
      <Link to="/bike-record" className="bike-record-banner metal-card">
        <div className="br-banner-left">
          <div className="br-banner-icon">📋</div>
          <div>
            <div className="br-banner-title">Digital Bike Record</div>
            <div className="br-banner-sub">Service logs · Maintenance · Upgrades · Resale Score</div>
          </div>
        </div>
        <div className="br-banner-right">
          {lastService ? (
            <div className="br-banner-stats">
              <div className="br-banner-stat">
                <span className="br-stat-v">{serviceRecords.length}</span>
                <span className="br-stat-l">Records</span>
              </div>
              {kmUntilService !== null && (
                <div className="br-banner-stat">
                  <span className="br-stat-v" style={{ color: kmUntilService < 500 ? 'var(--danger)' : kmUntilService < 1500 ? 'var(--amber)' : 'var(--success)' }}>
                    {kmUntilService.toLocaleString()}
                  </span>
                  <span className="br-stat-l">km to service</span>
                </div>
              )}
              <div className="br-banner-stat">
                <span className="br-stat-v">
                  {lastService?.serviceDate ? new Date(lastService.serviceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                </span>
                <span className="br-stat-l">Last service</span>
              </div>
            </div>
          ) : (
            <span className="br-banner-cta">Start logging →</span>
          )}
          <span className="br-banner-arrow">→</span>
        </div>
      </Link>

      {/* ── Main Grid ── */}
      <div className="dashboard-grid">
        {/* Vehicles */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>My Vehicles</h2>
            <Link to="/vehicles" className="btn btn-sm btn-ghost">View All →</Link>
          </div>
          {vehicles.length === 0 ? (
            <div className="empty-state glass-card">
              <div className="empty-icon">🏍️</div>
              <p>No vehicles added yet.</p>
              <Link to="/vehicles" className="btn btn-primary btn-sm">Add Vehicle</Link>
            </div>
          ) : (
            <div className="vehicle-list-dash">
              {vehicles.slice(0, 3).map((v) => (
                <Link to="/vehicles" key={v._id} className="vehicle-dash-card glass-card">
                  <div className="vehicle-dash-icon-wrap">
                    <span>{vehicleTypeIcon(v.vehicleType)}</span>
                  </div>
                  <div className="vehicle-dash-info">
                    <strong>{v.make} {v.model}</strong>
                    <span>{v.registrationNumber} · {v.year}</span>
                  </div>
                  <div className="vehicle-dash-km">
                    <span className="km-value">{v.currentKm.toLocaleString()}</span>
                    <span className="km-label">km</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Upcoming Bookings</h2>
            <Link to="/bookings" className="btn btn-sm btn-ghost">View All →</Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <div className="empty-state glass-card">
              <div className="empty-icon">📅</div>
              <p>No upcoming bookings.</p>
              <Link to="/bookings" className="btn btn-primary btn-sm">Book Now</Link>
            </div>
          ) : (
            <div className="booking-list-dash">
              {upcomingBookings.slice(0, 3).map((b) => (
                <div key={b._id} className="booking-dash-card glass-card">
                  <div className="booking-dash-top">
                    <span className={`badge badge-${statusColor(b.status)}`}>{b.status.replace('_', ' ')}</span>
                    <span className="booking-type">{b.bookingType?.replace('_', ' ')}</span>
                  </div>
                  <div className="booking-dash-details">
                    <strong>{b.vehicle?.make} {b.vehicle?.model || 'Vehicle'}</strong>
                    <span>📍 {b.serviceCenter?.name || 'TBD'}</span>
                    <span>📅 {new Date(b.scheduledDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions Row ── */}
      <div className="quick-actions">
        <div className="qa-label label-caps">Quick Actions</div>
        <div className="qa-grid">
          <Link to="/customize" className="qa-card glass-card">
            <span className="qa-icon">⚙️</span>
            <span>Customizer</span>
          </Link>
          <Link to="/bike-record" className="qa-card glass-card">
            <span className="qa-icon">📋</span>
            <span>Bike Record</span>
          </Link>
          <Link to="/marketplace" className="qa-card glass-card">
            <span className="qa-icon">🛒</span>
            <span>Marketplace</span>
          </Link>
          <Link to="/analytics" className="qa-card glass-card">
            <span className="qa-icon">📊</span>
            <span>Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
