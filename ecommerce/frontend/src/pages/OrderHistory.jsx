import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user) {
            axios.get(`http://localhost:5000/api/orders?userId=${user.id}`)
                .then(res => {
                    setOrders(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, []);

    if (loading) return <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>Loading orders...</div>;

    return (
        <div style={{ paddingTop: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>My Orders</h1>

            {orders.length === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>No orders found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Order #</span>
                                    <span style={{ fontWeight: 'bold' }}>{order.id}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Date: </span>
                                    <span>{order.date}</span>
                                </div>
                            </div>

                            <table style={{ width: '100%', marginBottom: '1rem', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'left' }}>
                                        <th style={{ paddingBottom: '0.5rem' }}>Product ID</th>
                                        <th style={{ paddingBottom: '0.5rem' }}>Quantity</th>
                                        <th style={{ paddingBottom: '0.5rem' }}>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ padding: '0.5rem 0' }}>{item.productId}</td>
                                            <td style={{ padding: '0.5rem 0' }}>{item.quantity}</td>
                                            <td style={{ padding: '0.5rem 0' }}>${item.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Status:</span>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        background: order.status === 'Delivered' ? 'rgba(0, 176, 155, 0.2)' : 'rgba(255, 165, 0, 0.2)',
                                        color: order.status === 'Delivered' ? 'var(--success)' : 'orange'
                                    }}>
                                        {order.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    Total: ${order.total}
                                </div>
                            </div>

                            {order.status === 'Delivered' && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                    <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ marginRight: '0.5rem' }}>Return Eligibility:</span>
                                        <span style={{ color: 'var(--success)' }}>Eligible</span>
                                    </div>
                                    {/* In a real app, this would be a button invoking a return API */}
                                    <button style={{ background: 'none', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '0.3rem 0.8rem', borderRadius: '4px', marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        Request Return
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
