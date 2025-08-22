const mongoose = require('mongoose');

// Importar el esquema desde el archivo separado
const odontogramaSchema = require('./schemas/odontogramaSchema');

// Verificar si el modelo ya está compilado para evitar OverwriteModelError
module.exports = mongoose.models.Odontograma || mongoose.model('Odontograma', odontogramaSchema); 