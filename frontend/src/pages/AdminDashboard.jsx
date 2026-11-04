import AdminDashboard from './pages/AdminDashboard';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('food-storage-user') || '{}');
    if (user.role !== 'admin') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem('food-storage-user') || '{}');

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user.fullName || user.name} 🛡️</p>
        <p>This area is only visible to administrators.</p>
      </section>
    </main>
  );
}