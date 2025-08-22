const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del artículo es requerido'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'El tipo es requerido'],
    enum: ['material', 'medicamento', 'equipo', 'consumible'],
    default: 'material'
  },
  currentStock: {
    type: Number,
    required: [true, 'El stock actual es requerido'],
    min: 0,
    default: 0
  },
  minimumStock: {
    type: Number,
    required: [true, 'El stock mínimo es requerido'],
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'La unidad es requerida'],
    trim: true,
    default: 'unidades'
  },
  cost: {
    type: Number,
    min: 0
  },
  supplier: {
    type: String,
    trim: true
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
  },
  expirationDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
inventorySchema.index({ name: 1 });
inventorySchema.index({ type: 1 });
inventorySchema.index({ currentStock: 1, minimumStock: 1 });

// Método virtual para verificar si está en stock bajo
inventorySchema.virtual('isLowStock').get(function() {
  return this.currentStock <= this.minimumStock;
});

// Método virtual para días hasta vencimiento
inventorySchema.virtual('daysUntilExpiration').get(function() {
  if (!this.expirationDate) return null;
  const today = new Date();
  const diffTime = this.expirationDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Método virtual para verificar si está próximo a vencer (30 días)
inventorySchema.virtual('isExpiringSoon').get(function() {
  if (!this.expirationDate) return false;
  const daysUntilExpiration = this.daysUntilExpiration;
  return daysUntilExpiration <= 30 && daysUntilExpiration >= 0;
});

module.exports = inventorySchema;
