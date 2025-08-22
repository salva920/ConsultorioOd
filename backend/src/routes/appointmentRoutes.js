const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Rutas para citas
router.get('/', appointmentController.getAllAppointments);
router.get('/stats', appointmentController.getAppointmentStats);
router.get('/date/:date', appointmentController.getAppointmentsByDate);
router.get('/status/:status', appointmentController.getAppointmentsByStatus);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.patch('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router; 