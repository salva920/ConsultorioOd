const express = require('express');
const router = express.Router();
const {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  getExpiringItems,
  getInventoryStats
} = require('../controllers/inventoryController');

// Rutas principales del inventario
router.get('/', getAllInventoryItems);
router.get('/stats', getInventoryStats);
router.get('/low-stock', getLowStockItems);
router.get('/expiring', getExpiringItems);
router.get('/:id', getInventoryItemById);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

module.exports = router; 