const express = require('express');
const router = express.Router();
const diagnosticoController = require('../controllers/diagnosticoController');

// Obtener todos los diagnósticos de un paciente
router.get('/patient/:patientId', diagnosticoController.getDiagnosticosByPatient);

// Crear un nuevo diagnóstico
router.post('/patient/:patientId', diagnosticoController.createDiagnostico);

// Crear múltiples diagnósticos
router.post('/patient/:patientId/multiple', diagnosticoController.createMultipleDiagnosticos);

// Actualizar un diagnóstico
router.put('/:diagnosticoId', diagnosticoController.updateDiagnostico);

// Eliminar un diagnóstico
router.delete('/:diagnosticoId', diagnosticoController.deleteDiagnostico);

module.exports = router; 