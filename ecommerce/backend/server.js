const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Initialize DB
const initDB = require('./initDb');
initDB();

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', require('./routes/chat'));
app.use('/api/escalations', require('./routes/escalations'));

app.get('/', (req, res) => {
    res.send('SkySkale E-commerce API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
