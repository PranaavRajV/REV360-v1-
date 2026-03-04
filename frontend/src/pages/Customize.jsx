import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from '../components/Toast';
import './Customize.css';

// Import local photos
import bikeReClassic from '../assets/bikes/bike_re_classic.png';
import bikeKtmDuke from '../assets/bikes/bike_ktm_duke.png';
import bikeYamahaR15 from '../assets/bikes/bike_yamaha_r15.png';
import bikeHondaCbr from '../assets/bikes/bike_honda_cbr.png';
import bikeBajajPulsar from '../assets/bikes/bike_bajaj_pulsar.png';

import accCrashGuard from '../assets/accessories/acc_crashguard.png';
import accExhaust from '../assets/accessories/acc_exhaust.png';
import accTailbag from '../assets/accessories/acc_tailbag.png';

const ACCESSORY_OVERLAYS = {
  crash_guard: { img: accCrashGuard, style: { top: '65%', left: '45%', width: '22%', transform: 'translate(-50%, -50%) scaleX(-1)' } },
  exhaust: { img: accExhaust, style: { top: '78%', left: '72%', width: '20%', transform: 'translate(-50%, -50%) rotate(-5deg)' } },
  luggage: { img: accTailbag, style: { top: '40%', left: '62%', width: '18%', transform: 'translate(-50%, -50%) rotate(-8deg)' } },
  // Fallbacks for hotspots if no image
  led_headlight: { hotspot: { top: '38%', right: '12%', emoji: '💡' } },
  chain_lube: { hotspot: { top: '80%', left: '22%', emoji: '🛢️' } },
  tank_pad: { hotspot: { top: '38%', left: '48%', emoji: '✨' } },
};

function getAccessoryKey(acc) {
  const n = acc.name.toLowerCase();
  if (n.includes('crash') || n.includes('guard')) return 'crash_guard';
  if (n.includes('exhaust')) return 'exhaust';
  if (n.includes('luggage') || n.includes('bag') || n.includes('tail')) return 'luggage';
  if (n.includes('headlight')) return 'led_headlight';
  if (n.includes('chain')) return 'chain_lube';
  if (n.includes('tank') && n.includes('pad')) return 'tank_pad';
  if (acc.category === 'protection') return 'crash_guard';
  if (acc.category === 'performance') return 'exhaust';
  return null;
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '⚙️' },
  { id: 'performance', label: 'Performance', icon: '⚡' },
  { id: 'protection', label: 'Protection', icon: '🛡️' },
  { id: 'cosmetic', label: 'Cosmetic', icon: '✨' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { id: 'cleaning', label: 'Cleaning', icon: '🧽' },
  { id: 'tools', label: 'Tools', icon: '🧰' },
];

const CATEGORY_COLORS = {
  performance: { bg: 'rgba(255, 107, 44, 0.12)', border: 'rgba(255, 107, 44, 0.35)', label: '#FF8C55' },
  protection: { bg: 'rgba(74, 158, 255, 0.10)', border: 'rgba(74, 158, 255, 0.35)', label: '#74B5FF' },
  cosmetic: { bg: 'rgba(245, 166, 35, 0.10)', border: 'rgba(245, 166, 35, 0.35)', label: '#FFD166' },
  maintenance: { bg: 'rgba(62, 207, 142, 0.10)', border: 'rgba(62, 207, 142, 0.3)', label: '#3ECF8E' },
  cleaning: { bg: 'rgba(184, 194, 204, 0.08)', border: 'rgba(184, 194, 204, 0.25)', label: '#B8C2CC' },
  tools: { bg: 'rgba(155, 89, 182, 0.10)', border: 'rgba(155, 89, 182, 0.3)', label: '#C39BD3' },
};

function getBikeImageForVehicle(v) {
  if (!v) return bikeKtmDuke;
  const text = `${v.make} ${v.model}`.toLowerCase();
  if (text.includes('classic') || text.includes('royal') || text.includes('enfield')) return bikeReClassic;
  if (text.includes('yamaha') || text.includes('r15')) return bikeYamahaR15;
  if (text.includes('honda') || text.includes('cbr')) return bikeHondaCbr;
  if (text.includes('bajaj') || text.includes('pulsar')) return bikeBajajPulsar;
  return bikeKtmDuke;
}

export default function Customize() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [accessories, setAccessories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    Promise.all([
      api.getVehicles(),
      api.getAccessories('')
    ]).then(([v, a]) => {
      setVehicles(v);
      if (v.length > 0) setSelectedVehicleId(v[0]._id);

      // Inject some custom accessories designed for our 3 overlays if not present in DB
      // (This helps the demo look great)
      const demoAccessories = [
        ...a,
        { _id: 'demo1', name: 'Premium Carbon Slip-On Exhaust', brand: 'Akrapovič', category: 'performance', price: 18500, description: 'Increases power and reduces weight.' },
        { _id: 'demo2', name: 'Aero Tourer Tail Bag 25L', brand: 'Velocity M.', category: 'cosmetic', price: 4200, description: 'Synthetic leather luggage for road trips.' },
        { _id: 'demo3', name: 'Heavy Duty Crash Guard', brand: 'Zana', category: 'protection', price: 5600, description: 'Matte black steel slider protection.' }
      ];
      setAccessories(demoAccessories);
    }).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const selectedVehicleObj = vehicles.find((v) => v._id === selectedVehicleId);

  const toggleAccessory = (id) => {
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const total = selectedAccessories.reduce((s, id) => {
      const a = accessories.find((x) => x._id === id);
      return s + (a?.price || 0);
    }, 0);
    setTotalCost(total);
  }, [selectedAccessories, accessories]);

  const activeVisuals = selectedAccessories
    .map((id) => {
      const a = accessories.find((x) => x._id === id);
      if (!a) return null;
      const key = getAccessoryKey(a);
      if (!key || !ACCESSORY_OVERLAYS[key]) return null;
      return { id, name: a.name, ...ACCESSORY_OVERLAYS[key] };
    })
    .filter(Boolean);

  const filteredAccessories = accessories.filter((a) => {
    const matchCat = activeCategory === 'all' || a.category === activeCategory;
    const matchSearch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToServiceOrder = () => {
    const items = selectedAccessories.map((id) => accessories.find((a) => a._id === id)?.name).filter(Boolean);
    if (items.length === 0) return;
    toast(`${items.length} accessor${items.length > 1 ? 'ies' : 'y'} added to order!`, 'success');
  };

  const clearAll = () => setSelectedAccessories([]);

  return (
    <div className="page-active container">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1>Bike Customizer</h1>
          <p>Select accessories and watch them appear live on your bike</p>
        </div>
        {selectedAccessories.length > 0 && (
          <div className="header-actions">
            <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear All</button>
            <button className="btn btn-primary" onClick={addToServiceOrder}>
              Add {selectedAccessories.length} to Order · ₹{totalCost.toLocaleString()}
            </button>
          </div>
        )}
      </div>

      {vehicles.length === 0 && !loading ? (
        <div className="empty-state glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏍️</div>
          <h2>No Vehicles Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You need a vehicle to access the customizer.</p>
          <Link to="/vehicles" className="btn btn-primary">Go to Vehicles</Link>
        </div>
      ) : (
        <>
          {/* ── Bike Selector (Only User's Bikes) ── */}
          <div className="bike-selector-strip">
            {vehicles.map((v) => (
              <button
                key={v._id}
                className={`bike-selector-btn ${selectedVehicleId === v._id ? 'active' : ''}`}
                onClick={() => setSelectedVehicleId(v._id)}
              >
                <span className="bike-sel-cat">{v.vehicleType}</span>
                <span className="bike-sel-name">{v.make} {v.model}</span>
                <span className="bike-sel-cc">{v.registrationNumber}</span>
              </button>
            ))}
          </div>

          {/* ── Main Layout ── */}
          <div className="customize-layout">

            {/* ── LEFT: Preview Panel ── */}
            <div className="preview-panel glass-card">
              <div className="preview-header">
                <div className="preview-bike-info">
                  <span className="preview-cat-badge">{selectedVehicleObj?.vehicleType}</span>
                  <h2 className="preview-bike-name">{selectedVehicleObj?.make} {selectedVehicleObj?.model}</h2>
                </div>
                {selectedAccessories.length > 0 && (
                  <div className="acc-count-badge">
                    {selectedAccessories.length} fitted
                  </div>
                )}
              </div>

              {/* Bike photo with interactive overlays */}
              <div className="photo-viewer-wrap">
                <div className="photo-bg-glow" />

                {/* Base Bike Layer */}
                <img src={getBikeImageForVehicle(selectedVehicleObj)} alt="Base motorcycle" className="bike-photo" style={{ mixBlendMode: 'multiply' }} />

                {/* Overlays */}
                {activeVisuals.map((vis, i) => {
                  if (vis.img) {
                    return (
                      <img
                        key={i}
                        src={vis.img}
                        alt={vis.name}
                        title={vis.name}
                        style={{
                          position: 'absolute',
                          mixBlendMode: 'multiply',
                          zIndex: 10 + i,
                          ...vis.style
                        }}
                      />
                    );
                  } else if (vis.hotspot) {
                    return (
                      <div
                        key={i}
                        className="hotspot-marker"
                        style={{ top: vis.hotspot.top, left: vis.hotspot.left, right: vis.hotspot.right }}
                        title={vis.name}
                      >
                        <span className="hotspot-emoji">{vis.hotspot.emoji}</span>
                        <div className="hotspot-ring" />
                        <div className="hotspot-ring ring-2" />
                      </div>
                    );
                  }
                  return null;
                })}

                {activeVisuals.length === 0 && (
                  <div className="preview-empty-hint">
                    <span>Click accessories below to fit them →</span>
                  </div>
                )}
              </div>

              {/* ── Selection Summary ── */}
              {selectedAccessories.length > 0 && (
                <div className="preview-summary">
                  <div className="summary-header">
                    <span className="summary-label">Selected Accessories</span>
                    <button className="btn-clear-link" onClick={clearAll}>Clear all</button>
                  </div>
                  <div className="summary-items">
                    {selectedAccessories.map((id) => {
                      const a = accessories.find((x) => x._id === id);
                      if (!a) return null;
                      const colors = CATEGORY_COLORS[a.category] || {};
                      return (
                        <div key={id} className="summary-item">
                          <div className="summary-item-left">
                            <span
                              className="summary-cat-dot"
                              style={{ background: colors.label || 'var(--primary)' }}
                            />
                            <span className="summary-item-name">{a.name}</span>
                          </div>
                          <div className="summary-item-right">
                            <span className="summary-price">₹{a.price.toLocaleString()}</span>
                            <button
                              className="summary-remove"
                              onClick={() => toggleAccessory(id)}
                              title="Remove"
                            >×</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="summary-total-row">
                    <span>Total Fitment Cost</span>
                    <span className="total-fire-price">₹{totalCost.toLocaleString()}</span>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={addToServiceOrder}>
                    ⚡ Add to Service Order
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT: Accessory Picker ── */}
            <div className="accessory-picker-panel">
              {/* Search bar */}
              <div className="acc-search-bar">
                <span className="search-icon">🔍</span>
                <input
                  className="acc-search-input"
                  type="text"
                  placeholder="Search accessories or brand…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="search-clear" onClick={() => setSearchQuery('')}>×</button>
                )}
              </div>

              {/* Category tabs */}
              <div className="category-filter-bar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`cat-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Accessory count */}
              <div className="acc-results-meta">
                {loading ? (
                  <span>Loading accessories…</span>
                ) : (
                  <span>{filteredAccessories.length} accessor{filteredAccessories.length !== 1 ? 'ies' : 'y'}</span>
                )}
              </div>

              {/* Accessory list */}
              {loading ? (
                <div className="accessory-list">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 72, borderRadius: 10, marginBottom: 8 }} />
                  ))}
                </div>
              ) : filteredAccessories.length === 0 ? (
                <div className="empty-state glass-card" style={{ padding: '32px 20px' }}>
                  <div className="empty-icon">🔩</div>
                  <p>No accessories found{searchQuery && ` for "${searchQuery}"`}</p>
                  {searchQuery && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setSearchQuery('')}>Clear search</button>
                  )}
                </div>
              ) : (
                <div className="accessory-list">
                  {filteredAccessories.map((acc) => {
                    const isOn = selectedAccessories.includes(acc._id);
                    const colors = CATEGORY_COLORS[acc.category] || {};
                    return (
                      <div
                        key={acc._id}
                        className={`acc-list-card glass-card ${isOn ? 'selected' : ''}`}
                        style={{
                          '--acc-cat-color': colors.border,
                          '--acc-cat-bg': colors.bg,
                          borderColor: isOn ? colors.label : 'var(--border-light)',
                        }}
                        onClick={() => toggleAccessory(acc._id)}
                      >
                        <div className="acc-card-left">
                          <div className="acc-card-icon" style={{ color: colors.label, padding: 0, overflow: 'hidden' }}>
                            {(() => {
                              const key = getAccessoryKey(acc);
                              const overlay = key ? ACCESSORY_OVERLAYS[key] : null;
                              if (overlay?.img) {
                                return <img src={overlay.img} alt={acc.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
                              }
                              return CATEGORIES.find((c) => c.id === acc.category)?.icon || '🔩';
                            })()}
                          </div>
                          <div className="acc-card-info">
                            <span className="acc-card-brand">{acc.brand || 'Aftermarket'}</span>
                            <span className="acc-card-name">{acc.name}</span>
                            <span className="acc-card-desc">{acc.description?.substring(0, 48)}…</span>
                          </div>
                        </div>
                        <div className="acc-card-right">
                          <span className="acc-card-price">₹{acc.price.toLocaleString()}</span>
                          <div className={`acc-card-toggle ${isOn ? 'on' : 'off'}`} style={{ color: isOn ? colors.label : '' }}>
                            {isOn ? '✓ Fitted' : '+ Add'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
