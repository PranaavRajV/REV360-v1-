import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from '../components/Toast';
import './Bookings.css';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle: '', serviceCenter: '', bookingType: 'service', scheduledDate: '', scheduledTime: '', notes: '', serviceItems: '', estimatedCost: 0 });

  useEffect(() => {
    Promise.all([api.getBookings(), api.getVehicles(), api.getServiceCenters()])
      .then(([b, v, c]) => { setBookings(b); setVehicles(v); setCenters(c); })
      .catch(() => { }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createBooking({
        ...form,
        serviceItems: form.serviceItems.split(',').map((s) => s.trim()).filter(Boolean),
        estimatedCost: Number(form.estimatedCost),
      });
      toast('Booking created successfully', 'success');
      setShowForm(false);
      const b = await api.getBookings();
      setBookings(b);
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleCancel = async (id) => {
    try { await api.cancelBooking(id); toast('Booking cancelled', 'info'); const b = await api.getBookings(); setBookings(b); }
    catch (err) { toast(err.message, 'error'); }
  };

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const statusColor = (s) => ({ pending: 'warning', confirmed: 'info', in_progress: 'primary', completed: 'success', cancelled: 'danger' }[s] || 'info');
  const typeIcon = (t) => ({ service: '🔧', test_drive: '🏎️', purchase: '🛒' }[t] || '📅');

  return (
    <div className="page-active container">
      <div className="page-header">
        <div>
          <h1>Bookings</h1>
          <p>Schedule services, test drives, and purchases</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Booking'}
        </button>
      </div>

      {showForm && (
        <form className="booking-form glass-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Booking Type</label>
              <select className="form-control" value={form.bookingType} onChange={update('bookingType')}>
                <option value="service">Service</option>
                <option value="test_drive">Test Drive</option>
                <option value="purchase">Vehicle Purchase</option>
              </select>
            </div>
            <div className="form-group">
              <label>Vehicle</label>
              <select className="form-control" value={form.vehicle} onChange={update('vehicle')} required>
                <option value="">Select vehicle</option>
                {vehicles.map((v) => <option key={v._id} value={v._id}>{v.make} {v.model} - {v.registrationNumber}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Service Center</label>
              <select className="form-control" value={form.serviceCenter} onChange={update('serviceCenter')} required>
                <option value="">Select center</option>
                {centers.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.city})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" className="form-control" value={form.scheduledDate} onChange={update('scheduledDate')} required />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" className="form-control" value={form.scheduledTime} onChange={update('scheduledTime')} />
            </div>
            <div className="form-group">
              <label>Estimated Cost (₹)</label>
              <input type="number" className="form-control" value={form.estimatedCost} onChange={update('estimatedCost')} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Service Items (comma separated)</label>
              <input className="form-control" value={form.serviceItems} onChange={update('serviceItems')} placeholder="oil change, brake check, chain lube" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Notes</label>
              <textarea className="form-control" value={form.notes} onChange={update('notes')} rows={2} placeholder="Any special requirements..." />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Book Now</button>
        </form>
      )}

      {loading ? (
        <div className="booking-grid">{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '16px' }}></div>)}</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state glass-card"><p>No bookings yet. Create your first booking!</p></div>
      ) : (
        <div className="booking-grid">
          {bookings.map((b) => (
            <div key={b._id} className="booking-card glass-card">
              <div className="booking-card-top">
                <span className="booking-icon">{typeIcon(b.bookingType)}</span>
                <span className={`badge badge-${statusColor(b.status)}`}>{b.status.replace('_', ' ')}</span>
              </div>
              <h3>{b.bookingType.replace('_', ' ')}</h3>
              <div className="booking-info">
                <p>🚗 {b.vehicle?.make} {b.vehicle?.model || 'N/A'}</p>
                <p>📍 {b.serviceCenter?.name || 'TBD'} {b.serviceCenter?.city ? `(${b.serviceCenter.city})` : ''}</p>
                <p>📅 {new Date(b.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} {b.scheduledTime || ''}</p>
                {b.estimatedCost > 0 && <p>💰 ₹{b.estimatedCost.toLocaleString()}</p>}
              </div>
              {b.serviceItems?.length > 0 && (
                <div className="booking-tags">
                  {b.serviceItems.map((item, i) => <span key={i} className="tag">{item}</span>)}
                </div>
              )}
              {b.notes && <p className="booking-notes">{b.notes}</p>}
              {b.status !== 'cancelled' && b.status !== 'completed' && (
                <button className="btn btn-sm btn-danger" onClick={() => handleCancel(b._id)} style={{ marginTop: '12px' }}>Cancel Booking</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
