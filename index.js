const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
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
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const message = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(message), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Middleware to parse JSON requests
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

// Mount auth routes - make sure this line is present
app.use('/api/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
