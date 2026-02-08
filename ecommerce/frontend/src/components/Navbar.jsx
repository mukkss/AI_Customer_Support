import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    // Safety check just in case, though CartProvider wraps App
    let cartCount = 0;
    try {
        const cartContext = useCart();
        if (cartContext) cartCount = cartContext.cartCount;
    } catch (e) {
        console.warn('Cart context not available in Navbar yet');
    }

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // if (location.pathname === '/login') return null;

    return (
        <nav style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--glass-border)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem' }}>
                <Link to={user ? "/products" : "/"} style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    SkySkale
                </Link>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            {user.role === 'admin' ? (
                                <>
                                    <Link to="/admin">Dashboard</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/products">Products</Link>
                                    <Link to="/cart" style={{ position: 'relative' }}>
                                        Cart
                                        {cartCount > 0 && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '-8px',
                                                right: '-15px',
                                                background: 'var(--accent-secondary)',
                                                color: 'white',
                                                fontSize: '0.7rem',
                                                padding: '2px 6px',
                                                borderRadius: '10px'
                                            }}>
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link to="/orders">My Orders</Link>
                                </>
                            )}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hello, {user.name}</span>
                                <button
                                    onClick={handleLogout}
                                    style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Login</Link>
                            <Link to="/register" className="btn-primary" style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                background: 'transparent',
                                border: '1px solid var(--accent-primary)',
                                boxShadow: 'none'
                            }}>Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
