const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const imageRoutes = require('./routes/imageRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

dotenv.config();

connectDB();

const app = express();

app.use(cors({ origin: '*' })); // Temporarily allow all for debugging
app.use(express.json());

app.use('/api/images', imageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api/health', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const User = require('./models/User');

        const dbState = mongoose.connection.readyState; // 0: disc, 1: conn, 2: connecting, 3: disconnecting
        const stateNames = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

        let adminUser = null;
        if (dbState === 1) {
            adminUser = await User.findOne({ email: 'admin@example.com' }).select('-password');
        }

        res.json({
            service: 'Backend API',
            database: stateNames[dbState] || 'Unknown',
            adminUserFound: !!adminUser,
            adminUserDetails: adminUser,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
