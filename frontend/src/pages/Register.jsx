import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="auth-card glass-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">⚡</div>
            <span className="auth-logo-text">REV360</span>
          </div>
          <h1>Create Account</h1>
          <p>Start your digital bike record today</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-control" value={form.name} onChange={update('name')} placeholder="Rahul Sharma" required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-control" value={form.email} onChange={update('email')} placeholder="email@example.com" required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" className="form-control" value={form.phone} onChange={update('phone')} placeholder="9876543210" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" value={form.password} onChange={update('password')} placeholder="••••••••" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
