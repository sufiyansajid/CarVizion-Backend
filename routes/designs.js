const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const designController = require('../controllers/designController');

router.post('/', auth, designController.createDesign);
router.put('/:id', auth, designController.updateDesign);
router.get('/', auth, designController.getUserDesigns);
router.delete('/:id', auth, designController.deleteDesign);

module.exports = router;