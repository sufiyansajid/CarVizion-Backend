const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const designRoutes = require('./routes/designs'); // 👈 import designs router
const userRoutes = require('./routes/users');
const carRoutes = require('./routes/cars');
const uploadRoutes = require('./routes/uploads');
const feedbackRoutes = require('./routes/feedback');
const path = require('path');
require('dotenv').config();

const app = express();

// Enable CORS with multiple origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const message = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(message), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Increase body size limits to handle larger design payloads (e.g., thumbnails as data URLs)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic route
app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/designs', designRoutes); // 👈 mount designs router here
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/feedback', feedbackRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
