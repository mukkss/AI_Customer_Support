const users = [
    { id: 1, name: 'Alice Customer', email: 'alice@example.com', password: 'password123', role: 'customer' },
    { id: 2, name: 'Bob Admin', email: 'bob@example.com', password: 'admin123', role: 'admin' }
];

const products = [
    { id: 1, name: 'Premium Wireless Headphones', price: 299.99, description: 'High-fidelity audio with noise cancellation', category: 'Electronics', image: 'https://via.placeholder.com/300?text=Headphones' },
    { id: 2, name: 'Ergonomic Office Chair', price: 199.50, description: 'Comfortable support for long work days', category: 'Furniture', image: 'https://via.placeholder.com/300?text=Chair' },
    { id: 3, name: 'Mechanical Keyboard', price: 129.00, description: 'Tactile switches and RGB lighting', category: 'Electronics', image: 'https://via.placeholder.com/300?text=Keyboard' },
    { id: 4, name: '4K Monitor 27"', price: 349.00, description: 'Crystal clear display for professionals', category: 'Electronics', image: 'https://via.placeholder.com/300?text=Monitor' },
    { id: 5, name: 'Smart Coffee Maker', price: 89.99, description: 'Brew coffee from your phone', category: 'Appliances', image: 'https://via.placeholder.com/300?text=Coffee' }
];

const orders = [
    {
        id: 101,
        userId: 1,
        date: '2023-10-15',
        status: 'Delivered',
        items: [
            { productId: 1, quantity: 1, price: 299.99 }
        ],
        total: 299.99
    },
    {
        id: 102,
        userId: 1,
        date: '2023-11-05',
        status: 'Shipped',
        items: [
            { productId: 3, quantity: 1, price: 129.00 },
            { productId: 5, quantity: 1, price: 89.99 }
        ],
        total: 218.99
    }
];

module.exports = { users, products, orders };
