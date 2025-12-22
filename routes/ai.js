const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/modify', aiController.modifyImage);

module.exports = router;
