const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const notificationService = require('./notificationService');

class ReminderService {
  constructor() {
    this.isRunning = false;
  }

  // Iniciar el servicio de recordatorios
  start() {
    if (this.isRunning) {
      console.log('El servicio de recordatorios ya está ejecutándose');
      return;
    }

    console.log('Iniciando servicio de recordatorios...');

    // Ejecutar cada minuto para verificar recordatorios pendientes
    cron.schedule('* * * * *', async () => {
      await this.processPendingReminders();
    });

    // Ejecutar cada hora para limpiar recordatorios antiguos
    cron.schedule('0 * * * *', async () => {
      await this.cleanupOldReminders();
    });

    this.isRunning = true;
    console.log('Servicio de recordatorios iniciado correctamente');
  }

  // Detener el servicio de recordatorios
  stop() {
    if (!this.isRunning) {
      console.log('El servicio de recordatorios no está ejecutándose');
      return;
    }

    cron.getTasks().forEach(task => task.stop());
    this.isRunning = false;
    console.log('Servicio de recordatorios detenido');
  }

  // Procesar recordatorios pendientes
  async processPendingReminders() {
    try {
      const pendingReminders = await Reminder.getPendingReminders();
      
      if (pendingReminders.length === 0) {
        return;
      }

      console.log(`Procesando ${pendingReminders.length} recordatorios pendientes...`);

      for (const reminder of pendingReminders) {
        await this.sendReminder(reminder);
      }
    } catch (error) {
      console.error('Error al procesar recordatorios pendientes:', error);
    }
  }

  // Enviar un recordatorio específico
  async sendReminder(reminder) {
    try {
      console.log(`Enviando recordatorio ${reminder.reminderType} para cita ${reminder.appointmentId}`);

      // Verificar que la cita aún existe y está programada
      const appointment = await Appointment.findById(reminder.appointmentId);
      if (!appointment || appointment.status !== 'SCHEDULED') {
        console.log(`Cita ${reminder.appointmentId} no encontrada o cancelada, cancelando recordatorio`);
        await this.updateReminderStatus(reminder._id, 'cancelled');
        return;
      }

      // Obtener información del paciente
      const patient = await Patient.findById(reminder.patientId);
      if (!patient) {
        console.log(`Paciente ${reminder.patientId} no encontrado, cancelando recordatorio`);
        await this.updateReminderStatus(reminder._id, 'cancelled');
        return;
      }

      // Enviar notificación
      const results = await notificationService.sendReminder(
        patient,
        appointment,
        reminder.reminderType,
        reminder.type
      );

      // Actualizar estado del recordatorio
      const hasSuccess = Object.values(results).some(result => result.success);
      
      if (hasSuccess) {
        await this.updateReminderStatus(reminder._id, 'sent', results);
        console.log(`Recordatorio enviado exitosamente para cita ${reminder.appointmentId}`);
      } else {
        await this.updateReminderStatus(reminder._id, 'failed', results);
        console.log(`Error al enviar recordatorio para cita ${reminder.appointmentId}`);
      }
    } catch (error) {
      console.error(`Error al enviar recordatorio ${reminder._id}:`, error);
      await this.updateReminderStatus(reminder._id, 'failed', { error: error.message });
    }
  }

  // Actualizar estado de un recordatorio
  async updateReminderStatus(reminderId, status, results = {}) {
    try {
      const updateData = {
        status,
        sent: status === 'sent',
        sentAt: status === 'sent' ? new Date() : undefined
      };

      // Agregar mensajes de error si los hay
      if (status === 'failed' && results) {
        const errorMessages = [];
        if (results.email && !results.email.success) {
          errorMessages.push(`Email: ${results.email.error}`);
        }
        if (results.whatsapp && !results.whatsapp.success) {
          errorMessages.push(`WhatsApp: ${results.whatsapp.error}`);
        }
        if (results.error) {
          errorMessages.push(results.error);
        }
        updateData.errorMessage = errorMessages.join('; ');
      }

      await Reminder.findByIdAndUpdate(reminderId, updateData);
    } catch (error) {
      console.error('Error al actualizar estado del recordatorio:', error);
    }
  }

  // Crear recordatorios para una nueva cita
  async createRemindersForAppointment(appointmentId, patientId, appointmentDate) {
    try {
      console.log(`Creando recordatorios para cita ${appointmentId}`);
      
      const reminders = await Reminder.createRemindersForAppointment(
        appointmentId,
        patientId,
        appointmentDate
      );

      console.log(`Creados ${reminders.length} recordatorios para cita ${appointmentId}`);
      return reminders;
    } catch (error) {
      console.error('Error al crear recordatorios para cita:', error);
      throw error;
    }
  }

  // Cancelar recordatorios de una cita
  async cancelRemindersForAppointment(appointmentId) {
    try {
      console.log(`Cancelando recordatorios para cita ${appointmentId}`);
      
      const result = await Reminder.cancelRemindersForAppointment(appointmentId);
      
      console.log(`Cancelados ${result.modifiedCount} recordatorios para cita ${appointmentId}`);
      return result;
    } catch (error) {
      console.error('Error al cancelar recordatorios para cita:', error);
      throw error;
    }
  }

  // Limpiar recordatorios antiguos
  async cleanupOldReminders() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Reminder.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        status: { $in: ['sent', 'failed', 'cancelled'] }
      });

      if (result.deletedCount > 0) {
        console.log(`Limpiados ${result.deletedCount} recordatorios antiguos`);
      }
    } catch (error) {
      console.error('Error al limpiar recordatorios antiguos:', error);
    }
  }

  // Obtener estadísticas de recordatorios
  async getReminderStats() {
    try {
      const stats = await Reminder.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const statsObject = {
        pending: 0,
        sent: 0,
        failed: 0,
        cancelled: 0
      };

      stats.forEach(stat => {
        statsObject[stat._id] = stat.count;
      });

      return statsObject;
    } catch (error) {
      console.error('Error al obtener estadísticas de recordatorios:', error);
      return null;
    }
  }

  // Verificar configuración del servicio
  getConfigurationStatus() {
    return {
      isRunning: this.isRunning,
      notifications: notificationService.isConfigured()
    };
  }
}

module.exports = new ReminderService(); 