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
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            console.log('Forgot Password request for:', email);

            // Find user
            const [users] = await db.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                // Return generic message for security
                return res.json({ message: 'If an account exists, a reset link will be sent.' });
            }

            const user = users[0];

            // Generate reset token (simple random string for now)
            const resetToken = require('crypto').randomBytes(32).toString('hex');
            const expiry = Date.now() + 3600000; // 1 hour

            // Save token and expiry
            await db.execute(
                'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
                [resetToken, expiry, user.id]
            );

            // In a real app, send email here. For dev, return token.
            res.json({
                message: 'Password reset link sent (simulated).',
                resetToken // ONLY FOR DEV/DEMO PURPOSES
            });
        } catch (error) {
            console.error('Forgot Password error:', error);
            res.status(500).json({ message: 'Server error during password reset request' });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { token, newPassword } = req.body;
            console.log('Reset Password attempt with token:', token);

            if (!token || !newPassword) {
                return res.status(400).json({ message: 'Token and new password are required' });
            }

            // Find user with valid token
            const [users] = await db.execute(
                'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
                [token, Date.now()]
            );

            if (users.length === 0) {
                return res.status(400).json({ message: 'Invalid or expired reset token' });
            }

            const user = users[0];

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password and clear token
            await db.execute(
                'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
                [hashedPassword, user.id]
            );

            res.json({ message: 'Password reset successful. You can now login with your new password.' });
        } catch (error) {
            console.error('Reset Password error:', error);
            res.status(500).json({ message: 'Server error during password reset' });
        }
    }
};

module.exports = authController;