const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Helper to transform DB row to Frontend Model
const transformProduct = (row) => {
    // Deterministic Price Mock based on weight or arbitrary value since DB has no price
    // Base 19.99 + weight * 0.1
    const mockPrice = 19.99 + (row.weight_g || 10) * 0.1;

    // Placeholder Image
    const encodedTitle = encodeURIComponent(row.title);
    const mockImage = `https://placehold.co/600x400?text=${encodedTitle}`;

    // Map description to box_content if not present
    const description = row.box_content || row.product_type;

    return {
        id: row.product_id,
        name: row.title,
        price: parseFloat(mockPrice.toFixed(2)),
        description: description,
        category: row.category_name || 'Uncategorized',
        image: mockImage,
        // Extra details
        scale: row.scale_label,
        year: row.year_reference_release
    };
};

// Get All Products
router.get('/', async (req, res) => {
    try {
        console.log('Fetching products from catalog...');
        const query = `
            SELECT p.*, c.category_name 
            FROM catalog.products p
            LEFT JOIN catalog.product_categories pc ON p.product_id = pc.product_id
            LEFT JOIN catalog.categories c ON pc.category_id = c.category_id
            ORDER BY p.title ASC
        `;
        const { rows } = await db.query(query);
        const products = rows.map(transformProduct);
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

// Get Product by ID
router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.category_name 
            FROM catalog.products p
            LEFT JOIN catalog.product_categories pc ON p.product_id = pc.product_id
            LEFT JOIN catalog.categories c ON pc.category_id = c.category_id
            WHERE p.product_id = $1
        `;
        const { rows } = await db.query(query, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(transformProduct(rows[0]));
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ message: 'Server error fetching product' });
    }
});

// Add Product (Admin)
router.post('/', async (req, res) => {
    const { title, product_type, scale_label, year_reference_release, category_name, box_content } = req.body;

    // Basic Validation
    if (!title || !category_name) {
        return res.status(400).json({ message: 'Missing required fields: title, category_name' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Generate Sequential ID (P001, P002...)
        // Lock table or simple select max for MVP
        const idRes = await client.query(`
            SELECT product_id FROM catalog.products 
            WHERE product_id LIKE 'P%' 
            ORDER BY CAST(SUBSTRING(product_id, 2) AS INTEGER) DESC 
            LIMIT 1
        `);

        let nextNum = 1;
        if (idRes.rows.length > 0) {
            const lastId = idRes.rows[0].product_id; // e.g., P015
            const numPart = parseInt(lastId.substring(1), 10);
            if (!isNaN(numPart)) {
                nextNum = numPart + 1;
            }
        }

        // Pad with leading zeros, e.g., 016
        const productId = `P${nextNum.toString().padStart(3, '0')}`;

        // 2. Insert into catalog.products
        // Note: Using default for dimensions/weight since form doesn't strictly ask for them yet, or we can add them later
        // Schema: product_id, title, product_type, scale_label, scale_denominator, year_reference_release, reference_url, dimensions_mm, weight_g, box_content
        await client.query(
            `INSERT INTO catalog.products 
             (product_id, title, product_type, scale_label, year_reference_release, box_content, dimensions_mm, weight_g)
             VALUES ($1, $2, $3, $4, $5, $6, '200x200', 20)`,
            [productId, title, product_type || 'Unknown Type', scale_label || 'N/A', year_reference_release || 2024, box_content]
        );

        // 3. Handle Category
        // Check if category exists
        let categoryId;
        const catRes = await client.query('SELECT category_id FROM catalog.categories WHERE category_name = $1', [category_name]);

        if (catRes.rows.length > 0) {
            categoryId = catRes.rows[0].category_id;
        } else {
            // Create new category if not exists (User might want this dynamic behavior)
            const newCatRes = await client.query(
                'INSERT INTO catalog.categories (category_name) VALUES ($1) RETURNING category_id',
                [category_name]
            );
            categoryId = newCatRes.rows[0].category_id;
        }

        // 4. Link Product to Category
        await client.query(
            'INSERT INTO catalog.product_categories (product_id, category_id) VALUES ($1, $2)',
            [productId, categoryId]
        );

        await client.query('COMMIT');

        res.status(201).json({ success: true, message: 'Product added successfully', productId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding product:', err);
        res.status(500).json({ message: 'Server error adding product' });
    } finally {
        client.release();
    }
});

module.exports = router;
