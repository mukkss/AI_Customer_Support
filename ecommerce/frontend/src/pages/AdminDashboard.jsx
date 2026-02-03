import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
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
        else fetchProducts();
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
                </div>
            </div>

            {activeTab === 'orders' ? (
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
            ) : (
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
        </div>
    );
};

export default AdminDashboard;
