const mongoose = require('mongoose');

const diagnosticoSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  cuadrante: {
    type: String,
    required: true,
    enum: ['SD', 'SI', 'ID', 'II']
  },
  unidadDental: {
    type: String,
    required: true
  },
  superficie: {
    type: String,
    required: true,
    enum: ['mesial', 'distal', 'vestibular', 'lingual', 'oclusal', 'todo']
  },
  diagnostico: {
    type: String,
    required: true,
    enum: ['caries', 'periodontal', 'endodoncia', 'ortodoncia', 'protesis', 'extraccion', 'restauracion', 'otros']
  },
  etiologia: {
    type: String,
    default: ''
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  },
  observaciones: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
diagnosticoSchema.index({ patient: 1, fecha: -1 });
diagnosticoSchema.index({ unidadDental: 1 });

module.exports = mongoose.model('Diagnostico', diagnosticoSchema); 