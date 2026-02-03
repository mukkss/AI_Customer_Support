import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    // Dummy state for payment form
    const [formData, setFormData] = useState({
        address: '123 Tech Lane',
        city: 'Silicon Valley',
        zip: '94043',
        cardNumber: '4242 4242 4242 4242',
        expiry: '12/25',
        cvv: '123'
    });

    if (cart.length === 0) {
        navigate('/cart');
        return null; // Redirecting
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simplified: mapped to backend expectation
            const orderData = {
                userId: user.id,
                items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
                total: cartTotal,
                addressId: 'addr_1' // For MVP simplification, using fixed ID or we'd create new address
            };

            const res = await axios.post('http://localhost:5000/api/orders', orderData);

            if (res.data.success) {
                clearCart();
                alert('Order placed successfully! Order ID: ' + res.data.orderId);
                navigate('/orders');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Order Summary */}
                <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
                    {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            <span>{item.name} x {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Payment Details</h3>
                    <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Shipping Address</label>
                            <input
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                required style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>City</label>
                                <input
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    required style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Zip Code</label>
                                <input
                                    value={formData.zip}
                                    onChange={e => setFormData({ ...formData, zip: e.target.value })}
                                    required style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Card Number</label>
                            <input
                                value={formData.cardNumber}
                                onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
                                required style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Expiry</label>
                                <input
                                    value={formData.expiry}
                                    onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                                    required style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>CVV</label>
                                <input
                                    value={formData.cvv}
                                    onChange={e => setFormData({ ...formData, cvv: e.target.value })}
                                    required style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ marginTop: '1.5rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
