import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@gym.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="bg-blob blob-1"></div>
        <div className="bg-blob blob-2"></div>
        <div className="bg-blob blob-3"></div>
      </div>

      <div className="login-branding">
        <div className="brand-logo">🏋️</div>
        <h1 className="brand-name">FitPro</h1>
        <p className="brand-tagline">Hospitality Management System</p>
        <div className="brand-features">
          <div className="feature-item">✓ Customer Management</div>
          <div className="feature-item">✓ Product Inventory</div>
          <div className="feature-item">✓ Orders & Billing</div>
          <div className="feature-item">✓ GYM Activities</div>
        </div>
      </div>

      <div className="login-card-wrap">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="form-control" placeholder="admin@gym.com" required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="form-control" placeholder="••••••••" required
              />
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? <><span className="btn-spinner"></span> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="login-hint">
            <span>Demo: admin@gym.com / admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
