const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// Profile routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/change-password', auth, userController.changePassword);

// Optional: Avatar routes
router.post('/avatar', auth, userController.updateAvatar);
router.delete('/avatar', auth, userController.deleteAvatar);

module.exports = router;