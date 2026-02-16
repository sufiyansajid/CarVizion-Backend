const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

// GET /api/cars - Get all available cars
router.get('/', carController.getAllCars);

// GET /api/cars/:id - Get a specific car
router.get('/:id', carController.getCarById);

module.exports = router;
