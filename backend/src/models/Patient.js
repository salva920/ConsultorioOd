const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // Información de Identificación
  tipo_cedula: {
    type: String,
    required: [true, 'El tipo de cédula es requerido'],
    enum: ['V', 'E', 'J']
  },
  cedula: {
    type: String,
    required: [true, 'La cédula es requerida'],
    unique: true,
    trim: true
  },

  // Información Personal
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true
  },
  fecha_nacimiento: {
    type: Date,
    required: [true, 'La fecha de nacimiento es requerida']
  },
  edad: {
    type: Number,
    required: [true, 'La edad es requerida'],
    min: 0,
    max: 120
  },
  sexo: {
    type: String,
    required: [true, 'El sexo es requerido'],
    enum: ['M', 'F']
  },

  // Información de Contacto
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  direccion: {
    type: String,
    required: [true, 'La dirección es requerida'],
    trim: true
  },

  // Información Médica
  enfermedad_actual: {
    type: String,
    trim: true
  },
  antecedentes_personales: {
    type: String,
    trim: true
  },
  antecedentes_familiares: {
    type: String,
    trim: true
  },

  // Información de Consulta
  tipo_consulta: {
    type: String,
    required: [true, 'El tipo de consulta es requerido'],
    enum: [
      'Primera Vez',
      'Control',
      'Urgencia',
      'Tratamiento',
      'Limpieza',
      'Ortodoncia'
    ]
  },
  motivo_consulta: {
    type: String,
    required: [true, 'El motivo de la consulta es requerido'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema); 