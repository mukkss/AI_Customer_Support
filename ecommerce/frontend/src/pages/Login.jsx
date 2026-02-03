import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('amit.sharma@example.com');
    const [password, setPassword] = useState('demo_pass_amit');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Assuming backend is running on port 5000 via proxy or direct
            // We will need to set up proxy in vite config or use full URL
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                if (response.data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/products');
                }
            }
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="glass-panel">
            <div style={{ padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                        Login
                    </button>
                </form>
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Don't have an account? <a href="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Register here</a>
                    </p>
                </div>

                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <p>Demo Credentials:</p>
                    <ul style={{ paddingLeft: '1.2rem' }}>
                        <li>amit.sharma@example.com / demo_pass_amit (Customer)</li>
                        <li>bob@example.com / admin123 (Admin)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
