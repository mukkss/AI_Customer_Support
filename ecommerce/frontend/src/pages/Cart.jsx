import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <h2>Your cart is empty</h2>
                <button
                    onClick={() => navigate('/')}
                    className="btn-primary"
                    style={{ marginTop: '1rem' }}
                >
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Shopping Cart</h1>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{ width: '80px', height: '80px', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', overflow: 'hidden', marginRight: '1.5rem' }}>
                            <img src={item.image} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h3>
                            <div style={{ color: 'var(--text-secondary)' }}>${item.price}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', color: 'white', padding: '0.5rem' }}>-</button>
                                <span style={{ padding: '0 0.5rem' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', color: 'white', padding: '0.5rem' }}>+</button>
                            </div>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '1.2rem' }}
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                ))}

                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                        Total: <span style={{ fontWeight: 'bold' }}>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={clearCart}
                            style={{ background: 'none', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '0.75rem 1.5rem', borderRadius: '8px' }}
                        >
                            Clear Cart
                        </button>
                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn-primary"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
