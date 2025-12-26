const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authController = {
    register: async (req, res) => {
        try {
            const { firstName, lastName, email, password } = req.body;

            console.log('Registration attempt:', { firstName, lastName, email });

            // Check if user exists
            const [existingUsers] = await db.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Email already registered' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const [result] = await db.execute(
                'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
                [firstName, lastName, email, hashedPassword]
            );

            // Generate token
            const token = jwt.sign(
                { id: result.insertId },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'Registration successful',
                token,
                user: {
                    id: result.insertId,
                    firstName,
                    lastName,
                    email
                }
            });
        } catch (error) {
            console.error('Registration error details:', error);
            res.status(500).json({
                message: 'Server error during registration',
                error: error.message
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user
            const [users] = await db.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = users[0];

            // Check password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    }
};

module.exports = authController;