import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', contact: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      navigate('/login', {
        replace: true,
        state: { notice: data.message || 'Account created. You can now log in.' },
      });
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
        <h1>Create your account</h1>
        <p className="auth-subtitle">Sign up to keep your food storage organized.</p>
        <form className="auth-form" onSubmit={submit}>
          <label>
            Full name
            <input
              type="text"
              autoComplete="name"
              minLength="2"
              maxLength="150"
              required
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              maxLength="254"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label>
            Contact
            <input
              type="tel"
              autoComplete="tel"
              minLength="3"
              maxLength="40"
              required
              value={form.contact}
              onChange={(event) => setForm({ ...form, contact: event.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="new-password"
              minLength="8"
              maxLength="72"
              required
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          <label>
            Account type
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
        </form>
        {error && <p className="auth-message" role="alert">{error}</p>}
        <p className="auth-security-note">Admin accounts must be created by the system administrator. Public registration is for customers only.</p>
      </section>
      <footer className="auth-footer">
        <nav aria-label="Account navigation">
          <Link to="/login">Log in</Link>
          <Link to="/register" aria-current="page">Register</Link>
        </nav>
        <p>FreshKeep Food Storage System</p>
      </footer>
    </main>
  );
}
