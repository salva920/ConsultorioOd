const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['material', 'medicamento', 'equipo', 'consumible'],
    default: 'material'
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    default: 'unidades'
  },
  description: {
    type: String,
    trim: true
  },
  expirationDate: {
    type: Date
  },
  supplier: {
    type: String,
    trim: true
  },
  cost: {
    type: Number,
    min: 0
  },
  location: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice para búsquedas eficientes
inventoryItemSchema.index({ name: 'text', type: 1 });
inventoryItemSchema.index({ currentStock: 1, minimumStock: 1 });

// Método virtual para verificar si está en stock bajo
inventoryItemSchema.virtual('isLowStock').get(function() {
  return this.currentStock <= this.minimumStock;
});

// Método virtual para días hasta vencimiento
inventoryItemSchema.virtual('daysUntilExpiration').get(function() {
  if (!this.expirationDate) return null;
  const today = new Date();
  const diffTime = this.expirationDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Método virtual para verificar si está próximo a vencer (30 días)
inventoryItemSchema.virtual('isExpiringSoon').get(function() {
  if (!this.expirationDate) return false;
  const daysUntilExpiration = this.daysUntilExpiration;
  return daysUntilExpiration <= 30 && daysUntilExpiration >= 0;
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema); 