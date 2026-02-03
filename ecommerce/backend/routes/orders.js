const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Get all orders (filtered by user unless admin)
router.get('/', async (req, res) => {
    const { userId, role } = req.query;

    try {
        let queryText = `
            SELECT o.*, 
                   json_agg(json_build_object(
                       'productId', oi.product_id, 
                       'quantity', oi.quantity, 
                       'price', oi.unit_price
                   )) as items
            FROM orders.orders o
            LEFT JOIN orders.order_items oi ON o.order_id = oi.order_id
        `;

        const params = [];

        if (role !== 'admin') {
            if (!userId) {
                return res.status(400).json({ message: 'Missing userId or role' });
            }
            queryText += ` WHERE o.customer_id = $1`;
            params.push(userId.toString()); // Ensure string as schema uses TEXT
        }

        queryText += ` GROUP BY o.order_id ORDER BY o.order_date DESC`;

        const result = await db.query(queryText, params);

        // Transform result to match frontend expectation
        const formattedOrders = result.rows.map((row, index) => ({
            id: row.order_id,
            displayId: `Order #${result.rows.length - index}`, // Calculated on the fly for MVP since we sort DESC
            userId: row.customer_id,
            date: new Date(row.order_date).toISOString().split('T')[0],
            status: row.order_status,
            total: row.total_amount,
            items: row.items
        }));

        res.json(formattedOrders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
});

// Create Order (Cart Checkout)
router.post('/', async (req, res) => {
    const { userId, items, total, addressId } = req.body;

    if (!userId || !items || !total) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // Generate Sequential ID (O001, O002...)
        // Lock the table or use a sequence for strict safety, but for MVP:
        const idRes = await client.query(`
            SELECT order_id FROM orders.orders 
            WHERE order_id LIKE 'O%' 
            ORDER BY CAST(SUBSTRING(order_id, 2) AS INTEGER) DESC 
            LIMIT 1
        `);

        let nextNum = 1;
        if (idRes.rows.length > 0) {
            const lastId = idRes.rows[0].order_id; // e.g., O001
            const numPart = parseInt(lastId.substring(1), 10);
            if (!isNaN(numPart)) {
                nextNum = numPart + 1;
            }
        }

        // Pad with leading zeros, e.g., 001
        const orderId = `O${nextNum.toString().padStart(3, '0')}`;
        const orderDate = new Date().toISOString().split('T')[0];

        // Insert Order
        // Assuming default address 'addr_1' if not provided for MVP
        const finalAddressId = addressId || 'addr_1';

        await client.query(
            `INSERT INTO orders.orders (order_id, customer_id, order_status, order_date, shipping_address_id, total_amount)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [orderId, userId.toString(), 'placed', orderDate, finalAddressId, total]
        );

        // Insert Items
        for (const item of items) {
            await client.query(
                `INSERT INTO orders.order_items (order_id, product_id, quantity, unit_price)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.productId.toString(), item.quantity, item.price]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, orderId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Server error creating order' });
    } finally {
        client.release();
    }
});

module.exports = router;
