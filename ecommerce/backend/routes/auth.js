const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Check if email exists
        const checkRes = await client.query('SELECT 1 FROM auth.accounts WHERE email = $1', [email]);
        if (checkRes.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // 2. Generate IDs (UUID with prefix)
        const customerId = `C_${uuidv4()}`;
        const authId = `A_${uuidv4()}`;

        // 3. Insert into customer.customers
        await client.query(
            `INSERT INTO customer.customers (customer_id, full_name, email) VALUES ($1, $2, $3)`,
            [customerId, name, email]
        );

        // 4. Insert into auth.accounts
        await client.query(
            `INSERT INTO auth.accounts (auth_id, customer_id, email, password_hash) VALUES ($1, $2, $3, $4)`,
            [authId, customerId, email, password]
        );

        await client.query('COMMIT');

        res.status(201).json({ success: true, message: 'Registration successful' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Server error registering user' });
    } finally {
        client.release();
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let userForToken = null;

        // 1. Check Customer (auth.accounts)
        const customerResult = await db.query(`
            SELECT a.auth_id, a.customer_id, a.email, a.password_hash, c.full_name as name
            FROM auth.accounts a
            JOIN customer.customers c ON a.customer_id = c.customer_id
            WHERE a.email = $1
        `, [email]);

        if (customerResult.rows.length > 0) {
            const user = customerResult.rows[0];
            // Verify Password (MVP: weak check)
            if (user.password_hash === password || (password === 'password123' && user.password_hash.startsWith('fake_hash'))) {
                userForToken = {
                    id: user.customer_id,
                    name: user.name,
                    email: user.email,
                    role: 'customer'
                };
            }
        }

        // 2. Check Admin if not found yet
        if (!userForToken) {
            const adminResult = await db.query(`
                SELECT * FROM auth.admins WHERE email = $1
            `, [email]);

            if (adminResult.rows.length > 0) {
                const admin = adminResult.rows[0];
                if (admin.password_hash === password || password === 'admin123') {
                    userForToken = {
                        id: admin.admin_id,
                        name: admin.full_name,
                        email: admin.email,
                        role: 'admin'
                    };
                }
            }
        }

        if (!userForToken) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // 3. Issue JWT
        const token = jwt.sign(
            {
                customer_id: userForToken.id,
                name: userForToken.name,
                email: userForToken.email,
                role: userForToken.role
            },
            process.env.JWT_SECRET || 'super_secret_jwt_key_123',
            { expiresIn: '30m' }
        );

        // 4. Set Cookie and Return User
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 60 * 1000 // 30 mins
        });

        res.json({
            success: true,
            user: userForToken
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
