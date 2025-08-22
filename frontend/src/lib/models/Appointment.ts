import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'ID de paciente requerido']
  },
  date: {
    type: Date,
    required: [true, 'Fecha requerida']
  },
  time: {
    type: String,
    required: [true, 'Hora requerida']
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED'
  },
  notes: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['Consulta', 'Limpieza', 'Extracción', 'Endodoncia', 'Ortodoncia', 'Otro'],
    default: 'Consulta'
  },
  duration: {
    type: Number, // en minutos
    default: 30
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ status: 1 });

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema); 