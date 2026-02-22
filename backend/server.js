require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authMiddleware = require('./middleware/authMiddleware');
const connectDB = require('./config/db');
const logRoutes = require('./routes/logRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Public health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Protected route example
app.get('/api/user/profile', authMiddleware, (req, res) => {
    res.json({
        message: 'Access granted to protected route',
        user: req.user
    });
});

// Daily Log Routes
app.use('/api/logs', logRoutes);

// Medication and Reminder Routes
app.use('/api/medications', medicationRoutes);
app.use('/api/reminders', reminderRoutes);

// User Profile Routes
app.use('/api/users', userRoutes);

// AI Routes
app.use('/api/ai', aiRoutes);

// Route to verify authentication on demand
app.post('/api/auth/verify', authMiddleware, (req, res) => {
    res.json({ success: true, user: req.user });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
