const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const upload = require('../config/upload');

// Profile routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/change-password', auth, userController.changePassword);

// Optional: Avatar routes - handle both multipart/form-data and JSON
router.post('/avatar', auth, (req, res, next) => {
    // Multer middleware - only process if content-type is multipart/form-data
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        upload.single('avatar')(req, res, next);
    } else {
        // Skip multer for JSON requests
        next();
    }
}, userController.updateAvatar);
router.delete('/avatar', auth, userController.deleteAvatar);

module.exports = router;