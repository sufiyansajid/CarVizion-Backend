const bcrypt = require('bcrypt');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

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
            // Debug logging
            console.log('Update avatar request received');
            console.log('req.body:', req.body);
            console.log('req.headers:', req.headers);
            console.log('Content-Type:', req.headers['content-type']);

            // Check if file was uploaded (multer) or if it's a base64/dataUrl
            let avatarUrl = null;

            // Ensure req.body exists - if not, initialize as empty object
            const body = req.body || {};

            if (req.file) {
                // File uploaded via multer (multipart/form-data)
                avatarUrl = `/uploads/avatars/${req.file.filename}`;
            } else if (body.avatarUrl) {
                // Direct URL provided
                avatarUrl = body.avatarUrl;
            } else if (body.dataUrl) {
                // Base64 data URL provided
                const { dataUrl } = body;
                if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
                    return res.status(400).json({ message: 'Invalid dataUrl' });
                }

                // Parse data URL
                const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
                if (!match) {
                    return res.status(400).json({ message: 'Malformed dataUrl' });
                }
                const mimeType = match[1];
                const base64Data = match[2];

                // Ensure uploads directory exists
                const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const extension = mimeType.split('/')[1] || 'png';
                const fileName = `avatar_${req.user.id}_${Date.now()}.${extension}`;
                const filePath = path.join(uploadDir, fileName);

                fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                avatarUrl = `/uploads/avatars/${fileName}`;
            } else {
                return res.status(400).json({ message: 'No avatar file or data provided' });
            }

            // Update database
            await db.execute(
                'UPDATE users SET avatar_url = ? WHERE id = ?',
                [avatarUrl, req.user.id]
            );

            // Get updated user
            const [user] = await db.execute(
                'SELECT id, first_name, last_name, email, avatar_url FROM users WHERE id = ?',
                [req.user.id]
            );

            res.json({
                message: 'Avatar updated successfully',
                user: {
                    id: user[0].id,
                    firstName: user[0].first_name,
                    lastName: user[0].last_name,
                    email: user[0].email,
                    avatarUrl: user[0].avatar_url
                },
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