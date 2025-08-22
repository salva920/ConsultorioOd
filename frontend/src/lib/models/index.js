const mongoose = require('mongoose');

// Función para obtener o crear un modelo de manera segura
function getOrCreateModel(modelName, schema) {
  try {
    // Intentar obtener el modelo existente
    return mongoose.model(modelName);
  } catch (error) {
    // Si el modelo no existe, crearlo
    return mongoose.model(modelName, schema);
  }
}

// Importar esquemas
const patientSchema = require('./schemas/patientSchema');
const appointmentSchema = require('./schemas/appointmentSchema');
const odontogramaSchema = require('./schemas/odontogramaSchema'); // Asegurar que sea el correcto
const inventorySchema = require('./schemas/inventorySchema');
const reminderSchema = require('./Reminder');
const diagnosticoSchema = require('./schemas/diagnosticoSchema');

// Crear modelos de manera segura
const Patient = getOrCreateModel('Patient', patientSchema);
const Appointment = getOrCreateModel('Appointment', appointmentSchema);
const Odontograma = getOrCreateModel('Odontograma', odontogramaSchema);
const Inventory = getOrCreateModel('Inventory', inventorySchema);
const Reminder = getOrCreateModel('Reminder', reminderSchema);
const Diagnostico = getOrCreateModel('Diagnostico', diagnosticoSchema);

module.exports = {
  Patient,
  Appointment,
  Odontograma,
  Inventory,
  Reminder,
  Diagnostico
};
