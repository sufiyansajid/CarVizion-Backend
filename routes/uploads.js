const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');

// Accepts JSON: { dataUrl: "data:image/png;base64,..." }
router.post('/image', auth, uploadController.uploadBase64Image);

module.exports = router;

