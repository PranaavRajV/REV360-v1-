import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from '../components/Toast';
import './Services.css';

export default function Services() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle: '', serviceCenter: '', serviceDate: '', kmReading: 0, serviceType: 'regular', description: '', itemsServiced: '', billAmount: 0, technicianName: '' });

  useEffect(() => {
    Promise.all([api.getServiceRecords(), api.getVehicles(), api.getServiceCenters()])
      .then(([r, v, c]) => { setRecords(r); setVehicles(v); setCenters(c); })
      .catch(() => { }).finally(() => setLoading(false));
  }, []);

  const loadRecords = (vehicleId = '') => {
    setLoading(true);
    api.getServiceRecords(vehicleId).then(setRecords).catch(() => { }).finally(() => setLoading(false));
  };

  const handleFilter = (e) => {
    setSelectedVehicle(e.target.value);
    loadRecords(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addServiceRecord({
        ...form,
        kmReading: Number(form.kmReading),
        billAmount: Number(form.billAmount),
        itemsServiced: form.itemsServiced.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setShowForm(false);
      loadRecords(selectedVehicle);
      toast('Service record saved', 'success');
    } catch (err) { toast(err.message, 'error'); }
  };

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const typeColor = (t) => ({ regular: 'info', repair: 'warning', inspection: 'primary', emergency: 'danger' }[t] || 'info');

  return (
    <div className="page-active container">
      <div className="page-header">
        <div>
          <h1>Service History</h1>
          <p>Track all service records and bills</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select className="form-control" style={{ width: '220px' }} value={selectedVehicle} onChange={handleFilter}>
            <option value="">All Vehicles</option>
            {vehicles.map((v) => <option key={v._id} value={v._id}>{v.make} {v.model}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Record'}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="service-form glass-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Vehicle</label>
              <select className="form-control" value={form.vehicle} onChange={update('vehicle')} required>
                <option value="">Select</option>
                {vehicles.map((v) => <option key={v._id} value={v._id}>{v.make} {v.model}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Service Center</label>
              <select className="form-control" value={form.serviceCenter} onChange={update('serviceCenter')}>
                <option value="">Select</option>
                {centers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Service Date</label>
              <input type="date" className="form-control" value={form.serviceDate} onChange={update('serviceDate')} required />
            </div>
            <div className="form-group">
              <label>KM Reading</label>
              <input type="number" className="form-control" value={form.kmReading} onChange={update('kmReading')} required />
            </div>
            <div className="form-group">
              <label>Service Type</label>
              <select className="form-control" value={form.serviceType} onChange={update('serviceType')}>
                <option value="regular">Regular</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bill Amount (₹)</label>
              <input type="number" className="form-control" value={form.billAmount} onChange={update('billAmount')} required />
            </div>
            <div className="form-group">
              <label>Technician Name</label>
              <input className="form-control" value={form.technicianName} onChange={update('technicianName')} placeholder="Optional" />
            </div>
            <div className="form-group">
              <label>Items Serviced</label>
              <input className="form-control" value={form.itemsServiced} onChange={update('itemsServiced')} placeholder="oil, filter, brakes" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Description</label>
              <textarea className="form-control" value={form.description} onChange={update('description')} rows={2} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Save Record</button>
        </form>
      )}

      {loading ? (
        <div className="timeline">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px', marginBottom: '16px' }}></div>)}</div>
      ) : records.length === 0 ? (
        <div className="empty-state glass-card"><p>No service records found.</p></div>
      ) : (
        <div className="timeline">
          {records.map((r, idx) => (
            <div key={r._id} className="timeline-item">
              <div className="timeline-dot"></div>
              {idx < records.length - 1 && <div className="timeline-line"></div>}
              <div className="timeline-card glass-card">
                <div className="timeline-card-header">
                  <div>
                    <h3>{r.vehicle?.make} {r.vehicle?.model}</h3>
                    <span className="timeline-date">{new Date(r.serviceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge badge-${typeColor(r.serviceType)}`}>{r.serviceType}</span>
                    <div className="bill-amount">₹{r.billAmount.toLocaleString()}</div>
                  </div>
                </div>
                {r.description && <p className="timeline-desc">{r.description}</p>}
                <div className="timeline-meta">
                  <span>📍 {r.serviceCenter?.name || '-'}</span>
                  <span>📏 {r.kmReading.toLocaleString()} km</span>
                  {r.technicianName && <span>👨‍🔧 {r.technicianName}</span>}
                </div>
                {r.itemsServiced?.length > 0 && (
                  <div className="booking-tags">{r.itemsServiced.map((item, i) => <span key={i} className="tag">{item}</span>)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
