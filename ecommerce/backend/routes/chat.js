const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const axios = require('axios');

// Protected Chat Route
router.post('/', verifyToken, async (req, res) => {
    try {
        const { message } = req.body;
        const { customer_id } = req.user; // Extract from JWT

        // Call the LangGraph Agent API
        // Assuming the Python agent is running on port 8000
        const agentResponse = await axios.post('http://localhost:8000/agent/run', {
            user_query: message,
            thread_id: customer_id // Maintain conversation history per customer
        });

        // The agent API returns { "answer": "..." }
        // The frontend expects { "reply": "..." }
        const reply = agentResponse.data.answer;

        res.json({ success: true, reply });

    } catch (err) {
        console.error('Chat error:', err.message);
        // Handle case where Agent API is down or errors
        const errorMessage = err.response?.data?.detail || "I'm having trouble reaching the AI agent right now.";
        res.status(500).json({ success: false, reply: errorMessage });
    }
});

module.exports = router;
