const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const verifyToken = require('../middleware/authMiddleware');

// Get all orders (Protected)
router.get('/', verifyToken, async (req, res) => {
    const { role, customer_id } = req.user;

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

        // If not admin, restrict to own orders
        if (role !== 'admin') {
            queryText += ` WHERE o.customer_id = $1`;
            params.push(customer_id);
        }

        queryText += ` GROUP BY o.order_id ORDER BY o.order_date DESC`;

        const result = await db.query(queryText, params);

        // Transform result to match frontend expectation
        const formattedOrders = result.rows.map((row, index) => ({
            id: row.order_id,
            displayId: `Order #${result.rows.length - index}`,
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
router.post('/', verifyToken, async (req, res) => {
    // Trusted customer_id from auth middleware
    const { customer_id } = req.user;
    const { items, total, addressId, newAddress } = req.body;

    if (!items || !total) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        let finalAddressId = null;

        // 1. Address Resolution Logic
        if (addressId && addressId !== 'addr_1') {
            // Case A: Verify existing address provided
            const addrResult = await client.query(
                `SELECT address_id FROM customer.addresses WHERE address_id = $1 AND customer_id = $2`,
                [addressId, customer_id]
            );
            if (addrResult.rows.length === 0) {
                throw new Error('Invalid address ID');
            }
            finalAddressId = addressId;

        } else if (newAddress) {
            // Case B: Create new address
            const newId = uuidv4();
            await client.query(
                `INSERT INTO customer.addresses (address_id, customer_id, address_line, city, country, postal_code, is_default)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    newId,
                    customer_id,
                    newAddress.address,
                    newAddress.city,
                    'USA',
                    newAddress.zip,
                    false
                ]
            );
            finalAddressId = newId;

        } else {
            // Case C: Fetch default address
            const defaultAddrResult = await client.query(
                `SELECT address_id FROM customer.addresses WHERE customer_id = $1 AND is_default = TRUE LIMIT 1`,
                [customer_id]
            );
            if (defaultAddrResult.rows.length > 0) {
                finalAddressId = defaultAddrResult.rows[0].address_id;
            }
        }

        // Final Check
        if (!finalAddressId) {
            throw new Error('No valid shipping address provided or found.');
        }

        // 2. Generate Sequential Order ID (MVP Logic)
        const idRes = await client.query(`
            SELECT order_id FROM orders.orders 
            WHERE order_id LIKE 'O%' 
            ORDER BY CAST(SUBSTRING(order_id, 2) AS INTEGER) DESC 
            LIMIT 1
        `);

        let nextNum = 1;
        if (idRes.rows.length > 0) {
            const lastId = idRes.rows[0].order_id;
            const numPart = parseInt(lastId.substring(1), 10);
            if (!isNaN(numPart)) {
                nextNum = numPart + 1;
            }
        }
        const orderId = `O${nextNum.toString().padStart(3, '0')}`;
        const orderDate = new Date();
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + 2); // 2 days from today

        const orderDateStr = orderDate.toISOString().split('T')[0];
        const deliveryDateStr = deliveryDate.toISOString().split('T')[0];

        // 3. Insert Order
        await client.query(
            `INSERT INTO orders.orders (order_id, customer_id, order_status, order_date, shipping_address_id, total_amount, expected_delivery)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [orderId, customer_id, 'placed', orderDateStr, finalAddressId, total, deliveryDateStr]
        );

        // 4. Insert Items
        for (const item of items) {
            await client.query(
                `INSERT INTO orders.order_items (order_id, product_id, quantity, unit_price)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.productId.toString(), item.quantity, item.price]
            );
        }

        await client.query('COMMIT');

        // Return success with preserved format
        res.status(201).json({ success: true, orderId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating order:', err);

        if (err.message === 'Invalid address ID' || err.message === 'No valid shipping address provided or found.') {
            return res.status(400).json({ message: err.message });
        }

        res.status(500).json({ message: 'Server error creating order' });
    } finally {
        client.release();
    }
});

module.exports = router;
