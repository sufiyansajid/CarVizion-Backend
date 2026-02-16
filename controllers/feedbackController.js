
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const feedbackController = {
    createFeedback: async (req, res) => {
        try {
            const { rating, category, message, screenshot, screenshotUrl } = req.body;
            const userId = req.user ? req.user.id : null; // Optional user_id if authenticated

            let finalScreenshotUrl = screenshotUrl || null;

            // Handle base64 screenshot if provided
            if (screenshot && screenshot.startsWith('data:image')) {
                const matches = screenshot.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

                if (matches && matches.length === 3) {
                    const type = matches[1];
                    const data = matches[2];
                    const extension = type.split('/')[1];
                    const fileName = `feedback_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

                    const uploadDir = path.join(__dirname, '..', 'uploads', 'feedbacks');

                    // Ensure directory exists
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }

                    const filePath = path.join(uploadDir, fileName);
                    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

                    finalScreenshotUrl = `/uploads/feedbacks/${fileName}`;
                }
            }

            const [result] = await db.execute(
                'INSERT INTO feedbacks (user_id, rating, category, message, screenshot_url) VALUES (?, ?, ?, ?, ?)',
                [userId, rating, category, message, finalScreenshotUrl]
            );

            res.status(201).json({
                message: 'Feedback submitted successfully',
                feedbackId: result.insertId
            });

        } catch (error) {
            console.error('Create feedback error:', error);
            res.status(500).json({ message: 'Server error processing feedback' });
        }
    },

    getAllFeedbacks: async (req, res) => {
        try {
            // Join with users table to get submitter name if available
            const [feedbacks] = await db.execute(`
                SELECT f.*, u.first_name, u.last_name, u.email 
                FROM feedbacks f 
                LEFT JOIN users u ON f.user_id = u.id 
                ORDER BY f.created_at DESC
            `);

            res.json(feedbacks);
        } catch (error) {
            console.error('Get feedbacks error:', error);
            res.status(500).json({ message: 'Server error retrieving feedbacks' });
        }
    }
};

module.exports = feedbackController;
