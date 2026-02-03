import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/products/${id}`)
            .then(res => {
                setProduct(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>Loading...</div>;
    if (!product) return <div className="container">Product not found</div>;

    return (
        <div style={{ paddingTop: '2rem' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginBottom: '1rem', padding: 0 }}>
                ← Back to products
            </button>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 400px', background: 'white', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={product.image} alt={product.name} style={{ maxWidth: '100%', maxHeight: '400px' }} />
                    </div>
                    <div style={{ flex: '1 1 400px', padding: '2rem' }}>
                        <div style={{ color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                            {product.category}
                        </div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{product.name}</h1>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--success)' }}>
                            ${product.price}
                        </div>
                        <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            {product.description}
                        </p>

                        <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                            <button
                                className="btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => {
                                    addToCart(product);
                                    alert('Added to cart!');
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
