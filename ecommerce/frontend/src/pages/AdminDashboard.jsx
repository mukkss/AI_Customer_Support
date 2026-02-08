import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'products', 'escalations'
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [escalations, setEscalations] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form state for new product (Catalog Schema)
    const [newProduct, setNewProduct] = useState({
        title: '',
        product_type: 'Model Kit',
        scale_label: '1/72',
        year_reference_release: '2024',
        category_name: '',
        box_content: ''
    });

    const fetchEscalations = () => {
        setLoading(true);
        axios.get('http://localhost:5000/api/escalations')
            .then(res => {
                setEscalations(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const updateEscalationStatus = (id, newStatus) => {
        axios.patch(`http://localhost:5000/api/escalations/${id}/status`, { status: newStatus })
            .then(res => {
                // Optimistic update or refetch
                fetchEscalations();
            })
            .catch(err => console.error(err));
    };

    const fetchOrders = () => {
        setLoading(true);
        axios.get('http://localhost:5000/api/orders?role=admin')
            .then(res => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const fetchProducts = () => {
        setLoading(true);
        axios.get('http://localhost:5000/api/products')
            .then(res => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (activeTab === 'orders') fetchOrders();
        else if (activeTab === 'products') fetchProducts();
        else if (activeTab === 'escalations') fetchEscalations();
    }, [activeTab]);

    const handleAddProduct = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/api/products', newProduct)
            .then(res => {
                alert('Product added successfully!');
                setNewProduct({
                    title: '',
                    product_type: 'Model Kit',
                    scale_label: '1/72',
                    year_reference_release: '2024',
                    category_name: '',
                    box_content: ''
                });
                fetchProducts();
            })
            .catch(err => {
                console.error(err);
                alert('Error adding product');
            });
    };

    return (
        <div style={{ paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <div className="glass-panel" style={{ padding: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('orders')}
                        style={{
                            background: activeTab === 'orders' ? 'var(--accent-primary)' : 'transparent',
                            color: activeTab === 'orders' ? 'white' : 'var(--text-secondary)',
                            border: 'none', padding: '0.5rem 1rem', borderRadius: '4px'
                        }}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        style={{
                            background: activeTab === 'products' ? 'var(--accent-primary)' : 'transparent',
                            color: activeTab === 'products' ? 'white' : 'var(--text-secondary)',
                            border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', marginLeft: '0.5rem'
                        }}
                    >
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('escalations')}
                        style={{
                            background: activeTab === 'escalations' ? 'var(--accent-primary)' : 'transparent',
                            color: activeTab === 'escalations' ? 'white' : 'var(--text-secondary)',
                            border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', marginLeft: '0.5rem'
                        }}
                    >
                        Escalations
                    </button>
                </div>
            </div>

            {activeTab === 'orders' && (
                <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
                    <h3>All User Orders</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Order ID</th>
                                <th style={{ padding: '1rem' }}>User ID</th>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Total</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem' }}>{order.id}</td>
                                    <td style={{ padding: '1rem' }}>{order.userId}</td>
                                    <td style={{ padding: '1rem' }}>{order.date}</td>
                                    <td style={{ padding: '1rem' }}>${order.total}</td>
                                    <td style={{ padding: '1rem' }}>{order.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'products' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3>Add New Product</h3>
                        <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input
                                placeholder="Product Title"
                                value={newProduct.title}
                                onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                                required
                            />
                            {/* ... (Other Inputs Same) */}
                            <input
                                placeholder="Product Type"
                                value={newProduct.product_type}
                                onChange={e => setNewProduct({ ...newProduct, product_type: e.target.value })}
                            />
                            <input
                                placeholder="Scale Label (e.g., 1/72)"
                                value={newProduct.scale_label}
                                onChange={e => setNewProduct({ ...newProduct, scale_label: e.target.value })}
                            />
                            <input
                                placeholder="Release Year" type="number"
                                value={newProduct.year_reference_release}
                                onChange={e => setNewProduct({ ...newProduct, year_reference_release: e.target.value })}
                            />
                            <input
                                placeholder="Category (e.g., Aircraft)"
                                value={newProduct.category_name}
                                onChange={e => setNewProduct({ ...newProduct, category_name: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Box Content (Description)"
                                value={newProduct.box_content}
                                onChange={e => setNewProduct({ ...newProduct, box_content: e.target.value })}
                                style={{ gridColumn: '1 / -1', height: '100px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '8px' }}
                            />
                            <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1' }}>Add Product</button>
                        </form>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3>Existing Products</h3>
                        {products.map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                                <span>{p.name}</span>
                                <span>{p.category} | {p.scale}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'escalations' && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3>Support Escalations</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '1rem' }}>Customer</th>
                                <th style={{ padding: '1rem' }}>Message</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Resolved At</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {escalations.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>No escalations found.</td></tr>
                            ) : escalations.map(esc => (
                                <tr key={esc.escalation_id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 'bold' }}>{esc.customer_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{esc.customer_email}</div>
                                    </td>
                                    <td style={{ padding: '1rem', maxWidth: '300px' }}>
                                        <div style={{ marginBottom: '0.5rem' }}>{esc.trigger_message}</div>
                                        {esc.escalation_reason && <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontStyle: 'italic' }}>Reason: {esc.escalation_reason}</div>}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                            background: esc.status === 'open' ? 'var(--danger)' : esc.status === 'resolved' ? 'var(--success)' : 'var(--bg-secondary)',
                                            color: 'white'
                                        }}>
                                            {esc.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {esc.resolved_at ? new Date(esc.resolved_at).toLocaleString() : '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <select
                                            value={esc.status}
                                            onChange={(e) => updateEscalationStatus(esc.escalation_id, e.target.value)}
                                            style={{ padding: '0.5rem' }}
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
