const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const axios = require('axios');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Protected Chat Route
router.post('/', verifyToken, async (req, res) => {
    try {
        const { message } = req.body;
        const { customer_id, name, email } = req.user; // Extract from JWT

        // Call the LangGraph Agent API
        // Corrected: send customer_id, matches Python AgentRequest
        const agentResponse = await axios.post('http://localhost:8000/agent/run', {
            user_query: message,
            customer_id: customer_id
        });

        const data = agentResponse.data;
        const reply = data.answer;

        // Handle Escalation
        if (data.escalated === true) {
            try {
                // Fallback: If name is missing from JWT (old tokens), fetch it
                let customer_name = name;
                if (!customer_name) {
                    const customerRes = await db.query('SELECT full_name FROM customer.customers WHERE customer_id = $1', [customer_id]);
                    if (customerRes.rows.length > 0) {
                        customer_name = customerRes.rows[0].full_name;
                    } else {
                        customer_name = 'Unknown Customer';
                    }
                }

                const escalationId = uuidv4();
                await db.query(
                    `INSERT INTO support.escalations 
                    (escalation_id, customer_id, customer_name, customer_email, trigger_message, escalation_reason, last_agent_route, confidence_score)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        escalationId,
                        customer_id,
                        customer_name,
                        email,
                        message,
                        data.escalation_reason || 'No reason provided',
                        data.last_agent_route || null,
                        data.confidence || 0
                    ]
                );
                console.log(`Escalation created: ${escalationId}`);
            } catch (dbErr) {
                console.error('Failed to log escalation:', dbErr);
            }
        }

        res.json({
            success: true,
            reply,
            escalated: data.escalated || false
        });

    } catch (err) {
        console.error('Chat error details:', err.response?.data || err.message);
        const errorMessage = err.response?.data?.detail || "I'm having trouble reaching the AI agent right now.";
        res.status(500).json({ success: false, reply: errorMessage });
    }
});

module.exports = router;
