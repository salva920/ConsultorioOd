const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'El ID del paciente es requerido']
  },
  date: {
    type: Date,
    required: [true, 'La fecha de la cita es requerida'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'La fecha de la cita debe ser futura'
    }
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento de las consultas
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ status: 1 });

// Middleware para validar que el paciente existe
appointmentSchema.pre('save', async function(next) {
  try {
    const Patient = mongoose.model('Patient');
    const patient = await Patient.findById(this.patientId);
    if (!patient) {
      throw new Error('El paciente especificado no existe');
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Método estático para obtener citas con información del paciente
appointmentSchema.statics.findWithPatient = function(query = {}) {
  return this.find(query)
    .populate('patientId', 'nombre apellido email telefono cedula')
    .sort({ date: 1 });
};

// Método estático para obtener citas por fecha
appointmentSchema.statics.findByDate = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate('patientId', 'nombre apellido email telefono cedula');
};

// Método estático para obtener citas por estado
appointmentSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('patientId', 'nombre apellido email telefono cedula')
    .sort({ date: 1 });
};

// Método estático para obtener estadísticas de citas
appointmentSchema.statics.getStats = async function() {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  const stats = await this.aggregate([
    {
      $facet: {
        today: [
          {
            $match: {
              date: { $gte: startOfDay, $lte: endOfDay }
            }
          },
          { $count: 'count' }
        ],
        scheduled: [
          { $match: { status: 'SCHEDULED' } },
          { $count: 'count' }
        ],
        completed: [
          { $match: { status: 'COMPLETED' } },
          { $count: 'count' }
        ],
        cancelled: [
          { $match: { status: 'CANCELLED' } },
          { $count: 'count' }
        ],
        noShow: [
          { $match: { status: 'NO_SHOW' } },
          { $count: 'count' }
        ]
      }
    }
  ]);
  
  return {
    today: stats[0].today[0]?.count || 0,
    scheduled: stats[0].scheduled[0]?.count || 0,
    completed: stats[0].completed[0]?.count || 0,
    cancelled: stats[0].cancelled[0]?.count || 0,
    noShow: stats[0].noShow[0]?.count || 0
  };
};

module.exports = mongoose.model('Appointment', appointmentSchema); 