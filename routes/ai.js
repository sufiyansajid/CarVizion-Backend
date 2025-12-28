const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/modify', aiController.modifyImage);
router.post('/segment', aiController.segmentImage);

module.exports = router;
