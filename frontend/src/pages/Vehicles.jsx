import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from '../components/Toast';
import './Vehicles.css';

const AVAILABLE_BIKES = [
  { make: 'Royal Enfield', model: 'Classic 350', fuelType: 'petrol', vehicleType: 'bike' },
  { make: 'KTM', model: 'Duke 200', fuelType: 'petrol', vehicleType: 'bike' },
  { make: 'Yamaha', model: 'R15 V4', fuelType: 'petrol', vehicleType: 'bike' },
  { make: 'Honda', model: 'CBR 250R', fuelType: 'petrol', vehicleType: 'bike' },
  { make: 'Bajaj', model: 'Pulsar NS200', fuelType: 'petrol', vehicleType: 'bike' },
];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Default to the first allowed bike
  const [form, setForm] = useState({
    selectedBikeIndex: 0,
    year: 2024,
    registrationNumber: '',
    purchaseDate: '',
    currentKm: 0
  });

  useEffect(() => { loadVehicles(); }, []);
  const loadVehicles = () => {
    setLoading(true);
    api.getVehicles().then(setVehicles).catch(() => { }).finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Strict Indian Registration Number Validation (e.g., KA-01-AB-1234, MH12AB1234)
    const regNoRegex = /^[A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{1,2}[-\s]?\d{4}$/i;
    if (!regNoRegex.test(form.registrationNumber)) {
      toast('Invalid Registration Number format (e.g., KA-01-AB-1234)', 'error');
      return;
    }

    const selectedBike = AVAILABLE_BIKES[form.selectedBikeIndex];
    const payload = {
      make: selectedBike.make,
      model: selectedBike.model,
      fuelType: selectedBike.fuelType,
      vehicleType: selectedBike.vehicleType,
      year: form.year,
      registrationNumber: form.registrationNumber.toUpperCase(),
      purchaseDate: form.purchaseDate,
      currentKm: form.currentKm
    };

    try {
      await api.addVehicle(payload);
      toast('Vehicle added successfully', 'success');
      setShowForm(false);
      setForm({ selectedBikeIndex: 0, year: 2024, registrationNumber: '', purchaseDate: '', currentKm: 0 });
      loadVehicles();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    try { await api.deleteVehicle(id); toast('Vehicle removed', 'success'); loadVehicles(); }
    catch (err) { toast(err.message, 'error'); }
  };

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const typeIcon = (t) => ({ bike: '🏍️', car: '🚗', scooter: '🛵' }[t] || '🚗');
  const fuelIcon = (f) => ({ petrol: '⛽', diesel: '🛢️', electric: '🔋', hybrid: '🔄' }[f] || '⛽');

  return (
    <div className="page-active container">
      <div className="page-header">
        <div>
          <h1>My Vehicles</h1>
          <p>Manage your fleet</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Vehicle'}
        </button>
      </div>

      {showForm && (
        <form className="vehicle-form glass-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Select Your Bike</label>
              <select className="form-control" value={form.selectedBikeIndex} onChange={update('selectedBikeIndex')}>
                {AVAILABLE_BIKES.map((bike, idx) => (
                  <option key={idx} value={idx}>{bike.make} {bike.model}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Year</label>
              <input type="number" className="form-control" value={form.year} onChange={update('year')} required />
            </div>
            <div className="form-group">
              <label>Registration Number</label>
              <input className="form-control" value={form.registrationNumber} onChange={update('registrationNumber')} placeholder="KA-01-AB-1234" style={{ textTransform: 'uppercase' }} required />
            </div>
            <div className="form-group">
              <label>Purchase Date</label>
              <input type="date" className="form-control" value={form.purchaseDate} onChange={update('purchaseDate')} />
            </div>
            <div className="form-group">
              <label>Current Km Reading</label>
              <input type="number" className="form-control" value={form.currentKm} onChange={update('currentKm')} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Add Vehicle</button>
        </form>
      )}

      {loading ? (
        <div className="vehicle-grid">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '16px' }}></div>)}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏍️</div>
          <h2>No Vehicles Yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Add your first vehicle to start tracking maintenance, booking services, and more.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Vehicle</button>
        </div>
      ) : (
        <div className="vehicle-grid">
          {vehicles.map((v) => (
            <div key={v._id} className="vehicle-card glass-card">
              <div className="vehicle-card-header">
                <span className="vehicle-type-icon">{typeIcon(v.vehicleType)}</span>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(v._id)}>Remove</button>
              </div>
              <h3>{v.make} {v.model}</h3>
              <p className="vehicle-reg">{v.registrationNumber}</p>
              <div className="vehicle-details">
                <div className="detail-item">
                  <span className="detail-label">Year</span>
                  <span className="detail-value">{v.year}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fuel</span>
                  <span className="detail-value">{fuelIcon(v.fuelType)} {v.fuelType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Current KM</span>
                  <span className="detail-value highlight">{v.currentKm.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Next Service</span>
                  <span className="detail-value">{v.nextServiceDueKm?.toLocaleString() || '-'} km</span>
                </div>
              </div>
              <div className="vehicle-km-bar">
                <div className="km-progress" style={{ width: `${Math.min(100, (v.currentKm / v.nextServiceDueKm) * 100)}%` }}></div>
              </div>
              <span className="km-bar-label">{Math.round((v.currentKm / v.nextServiceDueKm) * 100)}% to next service</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
