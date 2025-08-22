const Reminder = require('../models/Reminder');
const reminderService = require('../services/reminderService');
const notificationService = require('../services/notificationService');

// Obtener todos los recordatorios
exports.getAllReminders = async (req, res) => {
  try {
    const { status, appointmentId, limit, sort } = req.query;
    
    let query = Reminder.find()
      .populate('appointmentId', 'date status notes')
      .populate('patientId', 'nombre apellido email telefono cedula');
    
    // Filtrar por estado
    if (status && status !== 'all') {
      query = query.where('status').equals(status);
    }
    
    // Filtrar por cita
    if (appointmentId) {
      query = query.where('appointmentId').equals(appointmentId);
    }
    
    // Aplicar límite
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    // Aplicar ordenamiento
    if (sort) {
      query = query.sort(sort);
    } else {
      query = query.sort({ scheduledFor: 1 });
    }
    
    const reminders = await query.exec();
    
    res.json(reminders);
  } catch (error) {
    console.error('Error al obtener recordatorios:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Obtener un recordatorio por ID
exports.getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate('appointmentId', 'date status notes')
      .populate('patientId', 'nombre apellido email telefono cedula');

    if (!reminder) {
      return res.status(404).json({ message: 'Recordatorio no encontrado' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Error al obtener recordatorio:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Crear recordatorios para una cita
exports.createRemindersForAppointment = async (req, res) => {
  try {
    const { appointmentId, patientId, appointmentDate } = req.body;

    if (!appointmentId || !patientId || !appointmentDate) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        details: {
          appointmentId: !appointmentId ? 'El ID de la cita es requerido' : null,
          patientId: !patientId ? 'El ID del paciente es requerido' : null,
          appointmentDate: !appointmentDate ? 'La fecha de la cita es requerida' : null
        }
      });
    }

    const reminders = await reminderService.createRemindersForAppointment(
      appointmentId,
      patientId,
      new Date(appointmentDate)
    );

    res.status(201).json({
      message: 'Recordatorios creados exitosamente',
      count: reminders.length,
      reminders
    });
  } catch (error) {
    console.error('Error al crear recordatorios:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Cancelar recordatorios de una cita
exports.cancelRemindersForAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({
        message: 'El ID de la cita es requerido'
      });
    }

    const result = await reminderService.cancelRemindersForAppointment(appointmentId);

    res.json({
      message: 'Recordatorios cancelados exitosamente',
      cancelledCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error al cancelar recordatorios:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Reenviar un recordatorio manualmente
exports.resendReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findById(id)
      .populate('appointmentId')
      .populate('patientId');

    if (!reminder) {
      return res.status(404).json({ message: 'Recordatorio no encontrado' });
    }

    // Verificar que la cita aún está programada
    if (reminder.appointmentId.status !== 'SCHEDULED') {
      return res.status(400).json({ 
        message: 'No se puede reenviar recordatorio para una cita cancelada o completada' 
      });
    }

    // Enviar el recordatorio
    await reminderService.sendReminder(reminder);

    res.json({
      message: 'Recordatorio reenviado exitosamente'
    });
  } catch (error) {
    console.error('Error al reenviar recordatorio:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Obtener estadísticas de recordatorios
exports.getReminderStats = async (req, res) => {
  try {
    const stats = await reminderService.getReminderStats();
    
    if (!stats) {
      return res.status(500).json({ message: 'Error al obtener estadísticas' });
    }

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas de recordatorios:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Obtener estado de configuración del servicio
exports.getServiceStatus = async (req, res) => {
  try {
    const status = reminderService.getConfigurationStatus();
    
    res.json(status);
  } catch (error) {
    console.error('Error al obtener estado del servicio:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Iniciar el servicio de recordatorios
exports.startReminderService = async (req, res) => {
  try {
    reminderService.start();
    
    res.json({
      message: 'Servicio de recordatorios iniciado correctamente',
      status: reminderService.getConfigurationStatus()
    });
  } catch (error) {
    console.error('Error al iniciar servicio de recordatorios:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Detener el servicio de recordatorios
exports.stopReminderService = async (req, res) => {
  try {
    reminderService.stop();
    
    res.json({
      message: 'Servicio de recordatorios detenido correctamente',
      status: reminderService.getConfigurationStatus()
    });
  } catch (error) {
    console.error('Error al detener servicio de recordatorios:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Procesar recordatorios pendientes manualmente
exports.processPendingReminders = async (req, res) => {
  try {
    await reminderService.processPendingReminders();
    
    res.json({
      message: 'Procesamiento de recordatorios pendientes completado'
    });
  } catch (error) {
    console.error('Error al procesar recordatorios pendientes:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
}; 