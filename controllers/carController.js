const db = require('../config/database');

const carController = {
    getAllCars: async (req, res) => {
        try {
            const [rows] = await db.execute('SELECT * FROM cars ORDER BY created_at ASC');
            res.status(200).json({
                message: 'Cars fetched successfully',
                cars: rows
            });
        } catch (error) {
            console.error('Get cars error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getCarById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await db.execute('SELECT * FROM cars WHERE id = ?', [id]);

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Car not found' });
            }

            res.status(200).json({
                message: 'Car fetched successfully',
                car: rows[0]
            });
        } catch (error) {
            console.error('Get car error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = carController;
