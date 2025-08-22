const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');

// Rutas para recordatorios
router.get('/', reminderController.getAllReminders);
router.get('/stats', reminderController.getReminderStats);
router.get('/status', reminderController.getServiceStatus);
router.get('/:id', reminderController.getReminderById);

// Rutas para gestión de recordatorios
router.post('/create', reminderController.createRemindersForAppointment);
router.delete('/appointment/:appointmentId', reminderController.cancelRemindersForAppointment);
router.post('/:id/resend', reminderController.resendReminder);

// Rutas para gestión del servicio
router.post('/service/start', reminderController.startReminderService);
router.post('/service/stop', reminderController.stopReminderService);
router.post('/service/process', reminderController.processPendingReminders);

module.exports = router; 