const bcrypt = require('bcrypt');
const db = require('../config/database');

const userController = {
    getProfile: async (req, res) => {
        try {
            const [user] = await db.execute(
                'SELECT id, first_name, last_name, email, avatar_url FROM users WHERE id = ?',
                [req.user.id]
            );

            if (!user.length) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({
                message: 'Profile retrieved successfully',
                user: {
                    id: user[0].id,
                    firstName: user[0].first_name,
                    lastName: user[0].last_name,
                    email: user[0].email,
                    avatarUrl: user[0].avatar_url
                }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { firstName, lastName, email, phone, bio } = req.body;
            const userId = req.user.id;

            // Check if email is already taken
            const [existingUser] = await db.execute(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, req.user.id]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({ message: 'Email already in use' });
            }

            await db.execute(
                'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, bio = ? WHERE id = ?',
                [firstName, lastName, email, phone, bio, userId]
            );

            res.json({
                message: 'Profile updated successfully',
                user: {
                    firstName,
                    lastName,
                    email,
                    phone,
                    bio
                }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;

            // Get current user password
            const [user] = await db.execute(
                'SELECT password FROM users WHERE id = ?',
                [req.user.id]
            );

            // Verify current password
            const validPassword = await bcrypt.compare(currentPassword, user[0].password);
            if (!validPassword) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            await db.execute(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, req.user.id]
            );

            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    updateAvatar: async (req, res) => {
        try {
            const { avatarUrl } = req.body;

            await db.execute(
                'UPDATE users SET avatar_url = ? WHERE id = ?',
                [avatarUrl, req.user.id]
            );

            res.json({
                message: 'Avatar updated successfully',
                avatarUrl
            });
        } catch (error) {
            console.error('Update avatar error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    deleteAvatar: async (req, res) => {
        try {
            await db.execute(
                'UPDATE users SET avatar_url = NULL WHERE id = ?',
                [req.user.id]
            );

            res.json({ message: 'Avatar removed successfully' });
        } catch (error) {
            console.error('Delete avatar error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = userController;