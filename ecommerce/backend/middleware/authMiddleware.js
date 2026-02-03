const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_123');
        req.user = decoded; // Attach payload { customer_id, email, role } to req.user
        next();
    } catch (err) {
        res.status(403).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = verifyToken;
