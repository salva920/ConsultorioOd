const mongoose = require('mongoose');

const diagnosticoSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  // Campos del frontend
  cuadrante: {
    type: String,
    required: false,
    trim: true
  },
  diagnostico: {
    type: String,
    required: [true, 'El diagnóstico es requerido'],
    trim: true
  },
  etiologia: {
    type: String,
    required: false,
    trim: true
  },
  fecha: {
    type: String,
    required: [true, 'La fecha es requerida'],
    trim: true
  },
  observaciones: {
    type: String,
    required: false,
    trim: true
  },
  superficie: {
    type: String,
    required: false,
    trim: true
  },
  unidadDental: {
    type: String,
    required: [true, 'La unidad dental es requerida'],
    trim: true
  },
  // Campos adicionales para compatibilidad
  date: {
    type: Date,
    required: false,
    default: Date.now
  },
  symptoms: {
    type: String,
    required: false,
    trim: true
  },
  diagnosis: {
    type: String,
    required: false,
    trim: true
  },
  treatment: {
    type: String,
    required: false,
    trim: true
  },
  notes: {
    type: String,
    required: false,
    trim: true
  },
  doctor: {
    type: String,
    required: false,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'follow_up'],
    default: 'active'
  }
}, {
  timestamps: true
});

diagnosticoSchema.index({ patientId: 1, date: 1 });
diagnosticoSchema.index({ status: 1 });

module.exports = diagnosticoSchema;
