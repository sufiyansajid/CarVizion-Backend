const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiController = require('../controllers/aiController');

router.post('/image-to-3d', auth, aiController.imageTo3D);

module.exports = router;

