const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'El mensaje es requerido'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'La fecha es requerida']
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['appointment', 'follow_up', 'general'],
    default: 'general'
  },
  method: {
    type: String,
    enum: ['email', 'sms', 'whatsapp'],
    default: 'email'
  }
}, {
  timestamps: true
});

reminderSchema.index({ patientId: 1, date: 1 });
reminderSchema.index({ status: 1 });
reminderSchema.index({ date: 1 });

module.exports = reminderSchema;
