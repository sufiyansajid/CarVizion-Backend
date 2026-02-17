const db = require('../config/database');

const designController = {
    createDesign: async (req, res) => {
        try {
            const { name, description, model_data, color_data, parts_data, thumbnail_url, activity_log } = req.body;
            const userId = req.user.id;

            const [result] = await db.execute(
                'INSERT INTO car_designs (user_id, name, description, model_data, color_data, parts_data, thumbnail_url, activity_log) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    userId,
                    name,
                    description,
                    JSON.stringify(model_data || {}),
                    JSON.stringify(color_data || {}),
                    JSON.stringify(parts_data || {}),
                    thumbnail_url || null,
                    JSON.stringify(activity_log || [])
                ]
            );

            // Fetch the newly created design to return complete data
            const [designRows] = await db.execute(
                'SELECT * FROM car_designs WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json({
                message: 'Design created successfully',
                design: designRows[0]
            });
        } catch (error) {
            console.error('Create design error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    updateDesign: async (req, res) => {
        try {
            const { id: designId } = req.params;
            const { name, description, model_data, color_data, parts_data, thumbnail_url, activity_log } = req.body;
            const userId = req.user.id;

            const [result] = await db.execute(
                `UPDATE car_designs 
                 SET name = ?, description = ?, model_data = ?, color_data = ?, parts_data = ?, thumbnail_url = ?, activity_log = ?
                 WHERE id = ? AND user_id = ?`,
                [
                    name,
                    description,
                    JSON.stringify(model_data || {}),
                    JSON.stringify(color_data || {}),
                    JSON.stringify(parts_data || {}),
                    thumbnail_url || null,
                    JSON.stringify(activity_log || []),
                    designId,
                    userId
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Design not found or you do not have permission to update it.' });
            }

            // Fetch the updated design to return complete data
            const [designRows] = await db.execute(
                'SELECT * FROM car_designs WHERE id = ?',
                [designId]
            );

            res.status(200).json({
                message: 'Design updated successfully',
                design: designRows[0]
            });
        } catch (error) {
            console.error('Update design error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getUserDesigns: async (req, res) => {
        try {
            const userId = req.user.id;

            const [rows] = await db.execute(
                'SELECT id, name, description, thumbnail_url, model_data, color_data, parts_data, activity_log, created_at, updated_at FROM car_designs WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );

            // Parse JSON data if needed
            const designs = rows.map(design => ({
                ...design,
                model_data: design.model_data ? JSON.parse(design.model_data) : {},
                color_data: design.color_data ? JSON.parse(design.color_data) : {},
                parts_data: design.parts_data ? JSON.parse(design.parts_data) : {},
                activity_log: design.activity_log ? JSON.parse(design.activity_log) : []
            }));

            res.status(200).json({
                message: 'Designs fetched successfully',
                designs: designs
            });
        } catch (error) {
            console.error('Get user designs error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    deleteDesign: async (req, res) => {
        try {
            const { id: designId } = req.params;
            const userId = req.user.id;

            const [result] = await db.execute(
                'DELETE FROM car_designs WHERE id = ? AND user_id = ?',
                [designId, userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Design not found or you do not have permission to delete it.' });
            }

            res.status(200).json({ message: 'Design deleted successfully' });
        } catch (error) {
            console.error('Delete design error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Optional: Get single design by ID
    getDesignById: async (req, res) => {
        try {
            const { id: designId } = req.params;
            const userId = req.user.id;

            const [rows] = await db.execute(
                'SELECT * FROM car_designs WHERE id = ? AND user_id = ?',
                [designId, userId]
            );

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Design not found' });
            }

            const design = {
                ...rows[0],
                model_data: rows[0].model_data ? JSON.parse(rows[0].model_data) : {},
                color_data: rows[0].color_data ? JSON.parse(rows[0].color_data) : {},
                parts_data: rows[0].parts_data ? JSON.parse(rows[0].parts_data) : {},
                activity_log: rows[0].activity_log ? JSON.parse(rows[0].activity_log) : []
            };

            res.status(200).json({
                message: 'Design fetched successfully',
                design: design
            });
        } catch (error) {
            console.error('Get design error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Optional: Upload thumbnail endpoint
    uploadThumbnail: async (req, res) => {
        try {
            const { id: designId } = req.params;
            const userId = req.user.id;

            // This would handle file upload - you'll need multer or similar
            // For now, just accept a thumbnail URL
            const { thumbnail_url } = req.body;

            const [result] = await db.execute(
                'UPDATE car_designs SET thumbnail_url = ? WHERE id = ? AND user_id = ?',
                [thumbnail_url, designId, userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Design not found or you do not have permission to update it.' });
            }

            res.status(200).json({
                message: 'Thumbnail updated successfully',
                thumbnail_url: thumbnail_url
            });
        } catch (error) {
            console.error('Upload thumbnail error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = designController;