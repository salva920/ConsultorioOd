import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
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
  cedula: {
    type: String,
    required: [true, 'La cédula es requerida'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true,
    lowercase: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  fechaNacimiento: {
    type: Date,
    required: [true, 'La fecha de nacimiento es requerida']
  },
  genero: {
    type: String,
    enum: ['Masculino', 'Femenino', 'Otro'],
    required: [true, 'El género es requerido']
  },
  direccion: {
    type: String,
    trim: true
  },
  antecedentesMedicos: {
    type: String,
    trim: true
  },
  alergias: {
    type: String,
    trim: true
  },
  medicamentosActuales: {
    type: String,
    trim: true
  },
  notas: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento de las búsquedas
patientSchema.index({ nombre: 1, apellido: 1 });
patientSchema.index({ cedula: 1 });
patientSchema.index({ email: 1 });

export default mongoose.models.Patient || mongoose.model('Patient', patientSchema); 