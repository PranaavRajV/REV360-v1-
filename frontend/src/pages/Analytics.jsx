import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import api from '../services/api';
import './Analytics.css';

const COLORS = ['#6C5CE7', '#00CEC9', '#FD79A8', '#FDCB6E', '#74B9FF', '#55EFC4', '#E17055', '#A29BFE'];

export default function Analytics() {
  const [expenses, setExpenses] = useState(null);
  const [maintenance, setMaintenance] = useState(null);
  const [riding, setRiding] = useState(null);
  const [telematics, setTelematics] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getVehicles().then(v => {
      setVehicles(v);
      if (v.length > 0) {
        loadData(''); // Or specific vehicle, '' loads all
      } else {
        setLoading(false); // No data to load
      }
    }).catch(() => { setLoading(false); });
  }, []);

  const loadData = (vehicleId) => {
    setLoading(true);
    Promise.all([
      api.getExpenseAnalytics(vehicleId),
      api.getMaintenanceScore(vehicleId),
      api.getRidingSummary(vehicleId),
      api.getTelematicsSummary(vehicleId),
    ]).then(([e, m, r, t]) => {
      setExpenses(e);
      setMaintenance(m);
      setRiding(r);
      setTelematics(t);
    }).catch(() => { }).finally(() => setLoading(false));
  };

  const handleFilter = (e) => {
    setSelectedVehicle(e.target.value);
    loadData(e.target.value);
  };

  const monthlyData = expenses?.monthlyExpenses
    ? Object.entries(expenses.monthlyExpenses).map(([month, amount]) => ({ month: month.slice(2), amount }))
    : [];

  const serviceTypeData = expenses?.serviceTypes
    ? Object.entries(expenses.serviceTypes).map(([type, amount]) => ({ name: type, value: amount }))
    : [];

  const ridingTrends = riding?.trends || [];

  const radarData = telematics ? [
    { subject: 'Braking', A: telematics.avgBraking || 0, fullMark: 10 },
    { subject: 'Acceleration', A: telematics.avgAccel || 0, fullMark: 10 },
    { subject: 'Suspension', A: telematics.avgSuspension || 0, fullMark: 10 },
  ] : [];

  const maintenanceColor = maintenance?.label === 'Excellent' ? '#00B894' : maintenance?.label === 'Poor' ? '#E17055' : '#FDCB6E';
  const ridingStyleColor = riding?.ridingStyle === 'Smooth Rider' ? '#00B894' : riding?.ridingStyle === 'Rough Rider' ? '#E17055' : '#74B9FF';
  const ridingScoreClass = (riding?.overallScore >= 75) ? 'score-excellent' : (riding?.overallScore <= 35) ? 'score-poor' : 'score-average';

  if (loading) {
    return (
      <div className="page-active container">
        <div className="page-header"><div><h1>Analytics</h1><p>Loading insights...</p></div></div>
        <div className="analytics-grid">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '280px', borderRadius: '16px' }}></div>)}</div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="page-active container">
        <div className="page-header">
          <div>
            <h1>Analytics Dashboard</h1>
            <p>Service costs, maintenance behavior, and riding insights</p>
          </div>
        </div>
        <div className="empty-state glass-card" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
          <h2>No Vehicles Yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Add a vehicle to unlock powerful riding analytics and cost insights.</p>
          <Link to="/vehicles" className="btn btn-primary">Go to Vehicles</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-active container">
      <div className="page-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Service costs, maintenance behavior, and riding insights</p>
        </div>
        <select className="form-control" style={{ width: '220px' }} value={selectedVehicle} onChange={handleFilter}>
          <option value="">All Vehicles</option>
          {vehicles.map((v) => <option key={v._id} value={v._id}>{v.make} {v.model}</option>)}
        </select>
      </div>

      {/* Score Cards */}
      <div className="score-cards">
        <div className="score-card glass-card">
          <div className="score-ring" style={{ '--ring-color': maintenanceColor }}>
            <span className="score-number">{maintenance?.score ?? '—'}</span>
          </div>
          <div className="score-info">
            <h3>Maintenance Character</h3>
            <span className="score-label" style={{ color: maintenanceColor }}>{maintenance?.label || 'N/A'}</span>
            <p>{maintenance?.onTimeServices ?? 0} / {maintenance?.totalIntervals ?? 0} on-time services</p>
          </div>
        </div>

        <div className="score-card glass-card">
          <div className={`score-ring ${ridingScoreClass}`} style={{ '--ring-color': ridingStyleColor }}>
            <span className="score-number">{riding?.overallScore ?? '—'}</span>
          </div>
          <div className="score-info">
            <h3>Riding Style</h3>
            <span className="score-label" style={{ color: ridingStyleColor }}>{riding?.ridingStyle || 'N/A'}</span>
            <p>{telematics?.totalEntries || 0} data points analyzed</p>
          </div>
        </div>

        <div className="score-card glass-card">
          <div className="score-icon">💰</div>
          <div className="score-info">
            <h3>Total Spend</h3>
            <span className="score-amount">₹{(expenses?.totalExpense || 0).toLocaleString()}</span>
            <p>Avg ₹{(expenses?.avgPerService || 0).toLocaleString()} per service</p>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Monthly Expense Chart */}
        <div className="chart-card glass-card">
          <h3>Monthly Service Expenses</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#A0A0B8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#A0A0B8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(108,92,231,0.3)', borderRadius: '8px', color: '#EAEAEA' }}
                  formatter={(v) => [`₹${v.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6C5CE7" />
                    <stop offset="100%" stopColor="#A29BFE" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="no-data">No expense data yet</p>}
        </div>

        {/* Service Type Breakdown */}
        <div className="chart-card glass-card">
          <h3>Expense by Service Type</h3>
          {serviceTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={serviceTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {serviceTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(108,92,231,0.3)', borderRadius: '8px', color: '#EAEAEA' }}
                  formatter={(v) => [`₹${v.toLocaleString()}`]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="no-data">No data available</p>}
          <div className="chart-legend">
            {serviceTypeData.map((item, i) => (
              <div key={i} className="legend-item">
                <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }}></span>
                <span>{item.name} — ₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Riding Score Trend */}
        <div className="chart-card glass-card">
          <h3>Riding Score Trend</h3>
          {ridingTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ridingTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#A0A0B8', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#A0A0B8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(108,92,231,0.3)', borderRadius: '8px', color: '#EAEAEA' }}
                />
                <Line type="monotone" dataKey="avgScore" stroke="#00CEC9" strokeWidth={3} dot={{ fill: '#00CEC9', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="no-data">No riding data yet</p>}
        </div>

        {/* Riding Behavior Radar */}
        <div className="chart-card glass-card">
          <h3>Riding Behavior Analysis</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#A0A0B8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#A0A0B8', fontSize: 10 }} />
                <Radar name="Intensity" dataKey="A" stroke="#FD79A8" fill="#FD79A8" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          ) : <p className="no-data">No telematics data yet</p>}
          <p className="radar-hint">Lower values = smoother driving</p>
        </div>
      </div>
    </div>
  );
}
