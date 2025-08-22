const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');

// Obtener estadísticas del dashboard
router.get('/stats', getDashboardStats);

module.exports = router; 