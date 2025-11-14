const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const designController = require('../controllers/designController');

router.post('/', auth, designController.createDesign);
router.put('/:id', auth, designController.updateDesign);
router.get('/', auth, designController.getUserDesigns);
router.delete('/:id', auth, designController.deleteDesign);
router.get('/:id', auth, designController.getDesignById);
router.patch('/:id/thumbnail', auth, designController.uploadThumbnail);

module.exports = router;