import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user) {
            navigate('/products');
        }
    }, [user, navigate]);
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            textAlign: 'center',
            color: 'var(--text-primary)'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to SkySkale</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '600px', color: 'var(--text-secondary)' }}>
                SkySkale creates meticulously detailed scale models from aircraft to military vehicles crafted with precision 
                and a focus on authenticity for modelers who value accuracy and quality.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
                    Login
                </Link>
                <Link to="/register" className="btn-primary" style={{
                    background: 'transparent',
                    border: '1px solid var(--accent-primary)',
                    boxShadow: 'none'
                }}>
                    Register
                </Link>
            </div>
        </div>
    );
};

export default Home;
