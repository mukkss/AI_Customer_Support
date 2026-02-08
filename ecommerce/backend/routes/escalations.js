const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all escalations (Admin only intended)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT * FROM support.escalations 
            ORDER BY created_at DESC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching escalations:', err);
        res.status(500).json({ message: 'Server error fetching escalations' });
    }
});

// PATCH update status
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'open', 'in_progress', 'resolved', 'closed'

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        let query;
        let params;

        if (['resolved', 'closed'].includes(status)) {
            // Update resolved_at if closing
            query = `
                UPDATE support.escalations 
                SET status = $1, resolved_at = NOW() 
                WHERE escalation_id = $2 
                RETURNING *
            `;
            params = [status, id];
        } else {
            // Just update status
            query = `
                UPDATE support.escalations 
                SET status = $1 
                WHERE escalation_id = $2 
                RETURNING *
            `;
            params = [status, id];
        }

        const { rows } = await db.query(query, params);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Escalation not found' });
        }

        res.json(rows[0]);

    } catch (err) {
        console.error('Error updating escalation:', err);
        res.status(500).json({ message: 'Server error updating escalation' });
    }
});

module.exports = router;
