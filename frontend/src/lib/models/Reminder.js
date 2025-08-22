const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'El ID de la cita es requerido']
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'El ID del paciente es requerido']
  },
  type: {
    type: String,
    enum: ['email', 'whatsapp', 'both'],
    default: 'both',
    required: true
  },
  scheduledFor: {
    type: Date,
    required: [true, 'La fecha programada del recordatorio es requerida']
  },
  sent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },
  errorMessage: {
    type: String
  },
  reminderType: {
    type: String,
    enum: ['24h_before', '2h_before', '1h_before', '30min_before'],
    required: true
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
reminderSchema.index({ appointmentId: 1 });
reminderSchema.index({ scheduledFor: 1 });
reminderSchema.index({ status: 1 });
reminderSchema.index({ sent: 1 });

// Método estático para obtener recordatorios pendientes
reminderSchema.statics.getPendingReminders = function() {
  return this.find({
    status: 'pending',
    scheduledFor: { $lte: new Date() }
  });
};

// Método estático para crear recordatorios para una cita
reminderSchema.statics.createRemindersForAppointment = async function(appointmentId, patientId, appointmentDate) {
  const reminders = [];
  
  // Recordatorio 24 horas antes
  const reminder24h = new Date(appointmentDate);
  reminder24h.setHours(reminder24h.getHours() - 24);
  
  // Recordatorio 2 horas antes
  const reminder2h = new Date(appointmentDate);
  reminder2h.setHours(reminder2h.getHours() - 2);
  
  // Recordatorio 1 hora antes
  const reminder1h = new Date(appointmentDate);
  reminder1h.setHours(reminder1h.getHours() - 1);
  
  // Recordatorio 30 minutos antes
  const reminder30min = new Date(appointmentDate);
  reminder30min.setMinutes(reminder30min.getMinutes() - 30);
  
  const reminderConfigs = [
    { scheduledFor: reminder24h, reminderType: '24h_before' },
    { scheduledFor: reminder2h, reminderType: '2h_before' },
    { scheduledFor: reminder1h, reminderType: '1h_before' },
    { scheduledFor: reminder30min, reminderType: '30min_before' }
  ];
  
  for (const config of reminderConfigs) {
    // Solo crear recordatorios futuros
    if (config.scheduledFor > new Date()) {
      const reminder = new this({
        appointmentId,
        patientId,
        scheduledFor: config.scheduledFor,
        reminderType: config.reminderType,
        type: 'both'
      });
      reminders.push(reminder);
    }
  }
  
  if (reminders.length > 0) {
    return await this.insertMany(reminders);
  }
  
  return [];
};

// Método estático para cancelar recordatorios de una cita
reminderSchema.statics.cancelRemindersForAppointment = function(appointmentId) {
  return this.updateMany(
    { appointmentId, status: 'pending' },
    { status: 'cancelled' }
  );
};

// Exportar solo el esquema, no el modelo
module.exports = reminderSchema; 