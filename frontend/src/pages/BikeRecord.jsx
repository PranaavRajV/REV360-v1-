import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from '../components/Toast';
import './BikeRecord.css';

const TABS = [
  { id: 'service', label: 'Service History', icon: '🔧' },
  { id: 'maintenance', label: 'Maintenance Logs', icon: '📋' },
  { id: 'upgrades', label: 'Upgrades', icon: '⚡' },
  { id: 'condition', label: 'Condition Report', icon: '🛡️' },
];

const SERVICE_TYPES = [
  { value: 'regular', label: 'Regular Service' },
  { value: 'repair', label: 'Repair' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'emergency', label: 'Emergency' },
];

const CONDITION_ITEMS = [
  { id: 'tyres', label: 'Tyres', icon: '🔘' },
  { id: 'brakes', label: 'Brakes', icon: '⛔' },
  { id: 'engine', label: 'Engine', icon: '⚙️' },
  { id: 'electricals', label: 'Electricals', icon: '⚡' },
  { id: 'suspension', label: 'Suspension', icon: '🔩' },
  { id: 'chain', label: 'Chain & Sprocket', icon: '🔗' },
  { id: 'body', label: 'Body & Frame', icon: '🏍️' },
  { id: 'fuel', label: 'Fuel System', icon: '⛽' },
];

const CONDITION_LABELS = {
  1: { label: 'Poor', color: '#E5534B' },
  2: { label: 'Fair', color: '#F5A623' },
  3: { label: 'Good', color: '#FFDA6A' },
  4: { label: 'Very Good', color: '#3ECF8E' },
  5: { label: 'Excellent', color: '#4A9EFF' },
};

function HealthRing({ score, max = 5 }) {
  const pct = score / max;
  const r = 50;
  const circumference = 2 * Math.PI * r;
  const dash = pct * circumference;
  const color = score >= 4 ? '#3ECF8E' : score >= 3 ? '#F5A623' : '#E5534B';

  return (
    <div className="health-ring-wrap">
      <svg viewBox="0 0 120 120" className="health-ring-svg">
        <circle cx="60" cy="60" r={r} className="ring-track" />
        <circle
          cx="60" cy="60" r={r}
          className="ring-fill"
          stroke={color}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="health-ring-center">
        <span className="ring-value" style={{ color }}>{(score * 20).toFixed(0)}</span>
        <span className="ring-label">/ 100</span>
      </div>
    </div>
  );
}

export default function BikeRecord() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [activeTab, setActiveTab] = useState('service');
  const [serviceRecords, setServiceRecords] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [conditions, setConditions] = useState(
    Object.fromEntries(CONDITION_ITEMS.map((c) => [c.id, 3]))
  );
  const [loading, setLoading] = useState(false);

  // Modals
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Forms
  const [svcForm, setSvcForm] = useState({ serviceDate: '', kmReading: '', serviceType: 'regular', description: '', billAmount: '', technicianName: '', itemsServiced: '' });
  const [maintForm, setMaintForm] = useState({ date: '', item: '', description: '', mileage: '', nextDueKm: '', cost: '' });
  const [upgradeForm, setUpgradeForm] = useState({ partName: '', brand: '', installDate: '', cost: '', warranty: '', notes: '' });

  const printRef = useRef(null);

  useEffect(() => {
    api.getVehicles().then((v) => {
      setVehicles(v);
      if (v.length > 0) setSelectedVehicle(v[0]._id);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (!selectedVehicle) return;
    setLoading(true);
    Promise.all([
      api.getServiceRecords(selectedVehicle),
      api.getMaintenanceLogs(selectedVehicle),
      api.getVehicleUpgrades(selectedVehicle),
    ]).then(([svc, maint, upg]) => {
      setServiceRecords(svc);
      setMaintenanceLogs(maint);
      setUpgrades(upg);
    }).catch(() => { }).finally(() => setLoading(false));
  }, [selectedVehicle]);

  // ⚠️ score variables are computed AFTER selectedVehicleObj is declared below

  // Handlers
  const submitService = async () => {
    if (!selectedVehicle) return toast('Select a vehicle first', 'error');
    try {
      const body = {
        ...svcForm,
        vehicle: selectedVehicle,
        kmReading: Number(svcForm.kmReading),
        billAmount: Number(svcForm.billAmount),
        itemsServiced: svcForm.itemsServiced ? svcForm.itemsServiced.split(',').map((s) => s.trim()) : [],
      };
      const record = await api.addServiceRecord(body);
      setServiceRecords((p) => [record, ...p]);
      setShowServiceModal(false);
      setSvcForm({ serviceDate: '', kmReading: '', serviceType: 'regular', description: '', billAmount: '', technicianName: '', itemsServiced: '' });
      toast('Service record added!', 'success');
    } catch (e) { toast(e.message, 'error'); }
  };

  const submitMaintenance = async () => {
    if (!selectedVehicle) return toast('Select a vehicle first', 'error');
    try {
      const body = { ...maintForm, vehicle: selectedVehicle, mileage: Number(maintForm.mileage), cost: Number(maintForm.cost), nextDueKm: Number(maintForm.nextDueKm) };
      const log = await api.addMaintenanceLog(body);
      setMaintenanceLogs((p) => [log, ...p]);
      setShowMaintenanceModal(false);
      setMaintForm({ date: '', item: '', description: '', mileage: '', nextDueKm: '', cost: '' });
      toast('Maintenance log added!', 'success');
    } catch (e) { toast(e.message, 'error'); }
  };

  const submitUpgrade = async () => {
    if (!selectedVehicle) return toast('Select a vehicle first', 'error');
    try {
      const body = { ...upgradeForm, vehicle: selectedVehicle, cost: Number(upgradeForm.cost) };
      const upg = await api.addVehicleUpgrade(body);
      setUpgrades((p) => [upg, ...p]);
      setShowUpgradeModal(false);
      setUpgradeForm({ partName: '', brand: '', installDate: '', cost: '', warranty: '', notes: '' });
      toast('Upgrade recorded!', 'success');
    } catch (e) { toast(e.message, 'error'); }
  };

  const deleteMaintenanceLog = async (id) => {
    try {
      await api.deleteMaintenanceLog(id);
      setMaintenanceLogs((p) => p.filter((l) => l._id !== id));
      toast('Log removed', 'success');
    } catch (e) { toast(e.message, 'error'); }
  };

  const deleteUpgrade = async (id) => {
    try {
      await api.deleteVehicleUpgrade(id);
      setUpgrades((p) => p.filter((u) => u._id !== id));
      toast('Upgrade removed', 'success');
    } catch (e) { toast(e.message, 'error'); }
  };

  const handlePrint = () => window.print();

  const selectedVehicleObj = vehicles.find((v) => v._id === selectedVehicle);

  // Compute resale score from condition ratings (must be after selectedVehicleObj)
  const avgCondition = Object.values(conditions).reduce((a, b) => a + b, 0) / CONDITION_ITEMS.length;
  const serviceBonus = Math.min(serviceRecords.length * 3, 20);
  const upgradeBonus = Math.min(upgrades.length * 2, 10);
  const baseScore = isNaN(selectedVehicleObj?.engineHealthScore) ? 100 : selectedVehicleObj?.engineHealthScore || 100;
  const resaleScore = Math.min(100, Math.round(baseScore * 0.8 + avgCondition * 4));

  const resaleLabel =
    resaleScore >= 85 ? 'Premium' :
      resaleScore >= 70 ? 'Good' :
        resaleScore >= 50 ? 'Fair' : 'Needs Work';

  const resaleColor =
    resaleScore >= 85 ? '#3ECF8E' :
      resaleScore >= 70 ? '#4A9EFF' :
        resaleScore >= 50 ? '#F5A623' : '#E5534B';

  return (
    <div className="page-active container" ref={printRef}>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1>Bike Record</h1>
          <p>Comprehensive digital record — service history, maintenance, upgrades & resale value</p>
        </div>
        <div className="br-header-actions">
          {vehicles.length > 1 && (
            <select
              className="form-control vehicle-select"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>{v.make} {v.model} ({v.registrationNumber})</option>
              ))}
            </select>
          )}
          <button className="btn btn-secondary" onClick={handlePrint}>📄 Export PDF</button>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state glass-card">
          <div className="empty-icon">🏍️</div>
          <p>No vehicles found. Add a vehicle to start tracking records.</p>
        </div>
      ) : (
        <>
          {/* ── Stats Overview ── */}
          <div className="br-overview">
            <div className="br-vehicle-card metal-card">
              <div className="br-vehicle-badge">{selectedVehicleObj?.vehicleType?.toUpperCase() || 'BIKE'}</div>
              <h2 className="br-vehicle-name">{selectedVehicleObj?.make} {selectedVehicleObj?.model}</h2>
              <p className="br-vehicle-meta">{selectedVehicleObj?.year} · {selectedVehicleObj?.registrationNumber} · {selectedVehicleObj?.fuelType}</p>
              <div className="br-vehicle-km">
                <span className="br-km-val">{selectedVehicleObj?.currentKm?.toLocaleString()}</span>
                <span className="br-km-lbl"> km odometer</span>
              </div>
            </div>

            <div className="br-stat-card glass-card">
              <div className="br-stat-icon" style={{ background: 'rgba(255, 107, 44, 0.12)' }}>🔧</div>
              <div className="br-stat-val">{serviceRecords.length}</div>
              <div className="br-stat-lbl">Service Records</div>
            </div>

            <div className="br-stat-card glass-card">
              <div className="br-stat-icon" style={{ background: 'rgba(74, 158, 255, 0.12)' }}>📋</div>
              <div className="br-stat-val">{maintenanceLogs.length}</div>
              <div className="br-stat-lbl">Maintenance Logs</div>
            </div>

            <div className="br-stat-card glass-card">
              <div className="br-stat-icon" style={{ background: 'rgba(245, 166, 35, 0.12)' }}>⚡</div>
              <div className="br-stat-val">{upgrades.length}</div>
              <div className="br-stat-lbl">Upgrades Installed</div>
            </div>

            <div className="br-resale-card fire-card">
              <div className="resale-header">
                <span className="label-caps">Resale Value Score</span>
              </div>
              <HealthRing score={avgCondition} />
              <div className="resale-score-number" style={{ color: resaleColor }}>{resaleScore}</div>
              <div className="resale-label" style={{ color: resaleColor }}>{resaleLabel}</div>
              <div className="resale-breakdown">
                <span>Condition: {(avgCondition * 20).toFixed(0)}%</span>
                <span>History: +{serviceBonus}</span>
                <span>Upgrades: +{upgradeBonus}</span>
              </div>
            </div>
          </div>

          {/* ── Tab Navigation ── */}
          <div className="br-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`br-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="br-tab-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="br-tab-content">
            {/* ──────────── SERVICE HISTORY ──────────── */}
            {activeTab === 'service' && (
              <div className="tab-pane">
                <div className="section-header">
                  <h2>Service History</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowServiceModal(true)}>+ Add Record</button>
                </div>
                {loading ? (
                  <div className="records-list">{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 10, marginBottom: 8 }} />)}</div>
                ) : serviceRecords.length === 0 ? (
                  <div className="empty-state glass-card">
                    <div className="empty-icon">🔧</div>
                    <p>No service records yet.</p>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowServiceModal(true)}>Log First Service</button>
                  </div>
                ) : (
                  <div className="records-list">
                    {serviceRecords.map((r, i) => (
                      <div key={r._id || i} className="record-card glass-card">
                        <div className="record-left">
                          <div className={`service-type-dot type-${r.serviceType}`} />
                          <div>
                            <div className="record-title">{r.serviceType?.replace('_', ' ').toUpperCase() || 'SERVICE'}</div>
                            <div className="record-date">{new Date(r.serviceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                            {r.description && <div className="record-desc">{r.description}</div>}
                            {r.itemsServiced?.length > 0 && (
                              <div className="record-items">
                                {r.itemsServiced.map((item, ii) => <span key={ii} className="item-chip">{item}</span>)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="record-right">
                          <div className="record-km">{r.kmReading?.toLocaleString()} km</div>
                          <div className="record-cost">₹{r.billAmount?.toLocaleString()}</div>
                          {r.technicianName && <div className="record-tech">by {r.technicianName}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ──────────── MAINTENANCE LOGS ──────────── */}
            {activeTab === 'maintenance' && (
              <div className="tab-pane">
                <div className="section-header">
                  <h2>Maintenance Logs</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowMaintenanceModal(true)}>+ Add Log</button>
                </div>
                {loading ? (
                  <div className="records-list">{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 10, marginBottom: 8 }} />)}</div>
                ) : maintenanceLogs.length === 0 ? (
                  <div className="empty-state glass-card">
                    <div className="empty-icon">📋</div>
                    <p>No maintenance logs yet.</p>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowMaintenanceModal(true)}>Add First Log</button>
                  </div>
                ) : (
                  <div className="records-list">
                    {maintenanceLogs.map((log, i) => (
                      <div key={log._id || i} className="record-card glass-card">
                        <div className="record-left">
                          <div className="maint-icon">🔩</div>
                          <div>
                            <div className="record-title">{log.item}</div>
                            <div className="record-date">{new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                            {log.description && <div className="record-desc">{log.description}</div>}
                            {log.nextDueKm && (
                              <div className="record-next">Next due: {log.nextDueKm?.toLocaleString()} km</div>
                            )}
                          </div>
                        </div>
                        <div className="record-right">
                          {log.mileage && <div className="record-km">{log.mileage?.toLocaleString()} km</div>}
                          {log.cost > 0 && <div className="record-cost">₹{log.cost?.toLocaleString()}</div>}
                          <button className="btn-icon-danger" onClick={() => deleteMaintenanceLog(log._id)} title="Delete">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ──────────── UPGRADES ──────────── */}
            {activeTab === 'upgrades' && (
              <div className="tab-pane">
                <div className="section-header">
                  <h2>Installed Upgrades</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowUpgradeModal(true)}>+ Add Upgrade</button>
                </div>
                {loading ? (
                  <div className="upgrade-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 10 }} />)}</div>
                ) : upgrades.length === 0 ? (
                  <div className="empty-state glass-card">
                    <div className="empty-icon">⚡</div>
                    <p>No upgrades logged yet.</p>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowUpgradeModal(true)}>Log First Upgrade</button>
                  </div>
                ) : (
                  <div className="upgrade-grid">
                    {upgrades.map((upg, i) => (
                      <div key={upg._id || i} className="upgrade-card metal-card">
                        <div className="upgrade-top">
                          <div className="upgrade-badge">⚡ Upgrade</div>
                          <button className="btn-icon-danger" onClick={() => deleteUpgrade(upg._id)} title="Remove">×</button>
                        </div>
                        <div className="upgrade-part">{upg.partName}</div>
                        <div className="upgrade-brand">{upg.brand}</div>
                        <div className="upgrade-meta">
                          {upg.installDate && <span>📅 {new Date(upg.installDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                          {upg.warranty && <span>🛡️ {upg.warranty}</span>}
                        </div>
                        <div className="upgrade-cost">₹{Number(upg.cost)?.toLocaleString()}</div>
                        {upg.notes && <div className="upgrade-notes">{upg.notes}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ──────────── CONDITION REPORT ──────────── */}
            {activeTab === 'condition' && (
              <div className="tab-pane">
                <div className="section-header">
                  <h2>Condition Report</h2>
                  <span className="label-caps">Drag to rate 1–5</span>
                </div>
                <div className="condition-grid">
                  <div className="condition-items-panel glass-card">
                    {CONDITION_ITEMS.map((ci) => {
                      const val = conditions[ci.id];
                      const condLabel = CONDITION_LABELS[val];
                      return (
                        <div key={ci.id} className="condition-row">
                          <div className="condition-left">
                            <span className="condition-ci-icon">{ci.icon}</span>
                            <span className="condition-ci-label">{ci.label}</span>
                          </div>
                          <div className="condition-slider-wrap">
                            <input
                              type="range"
                              min={1} max={5} step={1}
                              value={val}
                              className="condition-slider"
                              style={{ '--slider-color': condLabel.color }}
                              onChange={(e) => setConditions((prev) => ({ ...prev, [ci.id]: Number(e.target.value) }))}
                            />
                            <span className="condition-value-badge" style={{ background: `${condLabel.color}18`, color: condLabel.color, borderColor: `${condLabel.color}50` }}>
                              {condLabel.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="condition-summary-panel">
                    <div className="resale-summary-card fire-card">
                      <div className="label-caps" style={{ marginBottom: 12 }}>Overall Resale Score</div>
                      <HealthRing score={avgCondition} />
                      <div className="resale-big-score" style={{ color: resaleColor }}>{resaleScore}</div>
                      <div className="resale-big-label" style={{ color: resaleColor }}>{resaleLabel}</div>
                      <div className="resale-factors">
                        <div className="factor-row">
                          <span>Condition avg</span>
                          <span>{(avgCondition * 20).toFixed(0)}%</span>
                        </div>
                        <div className="factor-row">
                          <span>Service history</span>
                          <span style={{ color: '#3ECF8E' }}>+{serviceBonus} pts</span>
                        </div>
                        <div className="factor-row">
                          <span>Upgrades</span>
                          <span style={{ color: '#4A9EFF' }}>+{upgradeBonus} pts</span>
                        </div>
                      </div>

                      <div className="resale-tip">
                        {resaleScore >= 85
                          ? '✅ Excellent condition — commands premium resale value.'
                          : resaleScore >= 70
                            ? '👍 Good condition — document more services to boost score.'
                            : resaleScore >= 50
                              ? '⚠️ Fair condition — address weak areas to improve resale.'
                              : '🔴 Needs attention — service & repairs strongly recommended.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ──────────── MODALS ──────────── */}

          {/* Service Record Modal */}
          {showServiceModal && (
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowServiceModal(false)}>
              <div className="modal-box glass-card">
                <div className="modal-header">
                  <h3>Log Service Record</h3>
                  <button className="modal-close" onClick={() => setShowServiceModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Service Date</label>
                      <input type="date" className="form-control" value={svcForm.serviceDate} onChange={(e) => setSvcForm({ ...svcForm, serviceDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Service Type</label>
                      <select className="form-control" value={svcForm.serviceType} onChange={(e) => setSvcForm({ ...svcForm, serviceType: e.target.value })}>
                        {SERVICE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>KM Reading</label>
                      <input type="number" className="form-control" placeholder="e.g. 12500" value={svcForm.kmReading} onChange={(e) => setSvcForm({ ...svcForm, kmReading: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Bill Amount (₹)</label>
                      <input type="number" className="form-control" placeholder="e.g. 2500" value={svcForm.billAmount} onChange={(e) => setSvcForm({ ...svcForm, billAmount: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Items Serviced <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span></label>
                    <input type="text" className="form-control" placeholder="Oil change, Air filter, Chain lube…" value={svcForm.itemsServiced} onChange={(e) => setSvcForm({ ...svcForm, itemsServiced: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Technician Name</label>
                    <input type="text" className="form-control" placeholder="e.g. Rajan Kumar" value={svcForm.technicianName} onChange={(e) => setSvcForm({ ...svcForm, technicianName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Description / Notes</label>
                    <textarea className="form-control" rows={3} placeholder="Any observations, special repairs…" value={svcForm.description} onChange={(e) => setSvcForm({ ...svcForm, description: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowServiceModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={submitService}>Save Record</button>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Log Modal */}
          {showMaintenanceModal && (
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowMaintenanceModal(false)}>
              <div className="modal-box glass-card">
                <div className="modal-header">
                  <h3>Add Maintenance Log</h3>
                  <button className="modal-close" onClick={() => setShowMaintenanceModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Date</label>
                      <input type="date" className="form-control" value={maintForm.date} onChange={(e) => setMaintForm({ ...maintForm, date: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Mileage (km)</label>
                      <input type="number" className="form-control" placeholder="Current km" value={maintForm.mileage} onChange={(e) => setMaintForm({ ...maintForm, mileage: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Maintenance Item</label>
                    <input type="text" className="form-control" placeholder="e.g. Tyre pressure check, Chain clean…" value={maintForm.item} onChange={(e) => setMaintForm({ ...maintForm, item: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Notes / Description</label>
                    <textarea className="form-control" rows={2} value={maintForm.description} onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })} />
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Cost (₹)</label>
                      <input type="number" className="form-control" placeholder="0 if DIY" value={maintForm.cost} onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Next Due (km)</label>
                      <input type="number" className="form-control" placeholder="e.g. 15000" value={maintForm.nextDueKm} onChange={(e) => setMaintForm({ ...maintForm, nextDueKm: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowMaintenanceModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={submitMaintenance}>Save Log</button>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade Modal */}
          {showUpgradeModal && (
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowUpgradeModal(false)}>
              <div className="modal-box glass-card">
                <div className="modal-header">
                  <h3>Log Upgrade</h3>
                  <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Part / Upgrade Name</label>
                      <input type="text" className="form-control" placeholder="e.g. Aftermarket Exhaust" value={upgradeForm.partName} onChange={(e) => setUpgradeForm({ ...upgradeForm, partName: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Brand</label>
                      <input type="text" className="form-control" placeholder="e.g. Akrapovic" value={upgradeForm.brand} onChange={(e) => setUpgradeForm({ ...upgradeForm, brand: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Install Date</label>
                      <input type="date" className="form-control" value={upgradeForm.installDate} onChange={(e) => setUpgradeForm({ ...upgradeForm, installDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Cost (₹)</label>
                      <input type="number" className="form-control" placeholder="e.g. 8000" value={upgradeForm.cost} onChange={(e) => setUpgradeForm({ ...upgradeForm, cost: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Warranty</label>
                    <input type="text" className="form-control" placeholder="e.g. 1 Year, Lifetime…" value={upgradeForm.warranty} onChange={(e) => setUpgradeForm({ ...upgradeForm, warranty: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea className="form-control" rows={2} placeholder="Why this upgrade? Any details…" value={upgradeForm.notes} onChange={(e) => setUpgradeForm({ ...upgradeForm, notes: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowUpgradeModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={submitUpgrade}>Save Upgrade</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
