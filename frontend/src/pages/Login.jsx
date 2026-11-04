import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      localStorage.setItem('food-storage-token', data.token);
      localStorage.setItem('food-storage-user', JSON.stringify(data.user));
      const userRole = data.user?.role || form.role;
navigate(userRole === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-brand" to="/">FreshKeep</Link>
        <p className="auth-eyebrow">FOOD STORAGE SYSTEM</p>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Log in to manage your food storage.</p>
        {location.state?.notice && <p className="auth-notice">{location.state.notice}</p>}
        <form className="auth-form" onSubmit={submit}>
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          <label>
            Account type
            <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
        </form>
        {error && <p className="auth-message" role="alert">{error}</p>}
      </section>
      <footer className="auth-footer">
        <nav aria-label="Account navigation">
          <Link to="/login" aria-current="page">Log in</Link>
          <Link to="/register">Register</Link>
          
        </nav>
        <p>FreshKeep Food Storage System</p>
      </footer>
    </main>
  );
}
