const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

class NotificationService {
  constructor() {
    // Configurar transporter de email
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Configurar cliente de Twilio para WhatsApp
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  // Enviar recordatorio por email
  async sendEmailReminder(patient, appointment, reminderType) {
    try {
      const appointmentDate = new Date(appointment.date);
      const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = appointmentDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const timeText = this.getTimeText(reminderType);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: patient.email,
        subject: `Recordatorio de Cita - ${timeText}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4A90E2; color: white; padding: 20px; text-align: center;">
              <h1>Recordatorio de Cita Odontológica</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Hola ${patient.nombre} ${patient.apellido},</h2>
              
              <p>Te recordamos que tienes una cita programada para:</p>
              
              <div style="background-color: white; padding: 15px; border-left: 4px solid #4A90E2; margin: 20px 0;">
                <p><strong>Fecha:</strong> ${formattedDate}</p>
                <p><strong>Hora:</strong> ${formattedTime}</p>
                <p><strong>Tipo de Consulta:</strong> ${patient.tipo_consulta || 'Consulta general'}</p>
              </div>
              
              <p><strong>Importante:</strong></p>
              <ul>
                <li>Llega 10 minutos antes de tu cita</li>
                <li>Trae tu documento de identidad</li>
                <li>Si necesitas cancelar, hazlo con al menos 24 horas de anticipación</li>
              </ul>
              
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              
              <p>Saludos,<br>
              <strong>Equipo Odontológico</strong></p>
            </div>
            
            <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
              <p>Este es un mensaje automático, por favor no respondas a este email.</p>
            </div>
          </div>
        `
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email enviado exitosamente a ${patient.email}:`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error al enviar email:', error);
      return { success: false, error: error.message };
    }
  }

  // Enviar recordatorio por WhatsApp
  async sendWhatsAppReminder(patient, appointment, reminderType) {
    try {
      const appointmentDate = new Date(appointment.date);
      const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = appointmentDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const timeText = this.getTimeText(reminderType);
      
      const message = `🦷 *Recordatorio de Cita Odontológica*

Hola ${patient.nombre} ${patient.apellido},

Te recordamos que tienes una cita programada para:

📅 *Fecha:* ${formattedDate}
🕐 *Hora:* ${formattedTime}
🏥 *Tipo:* ${patient.tipo_consulta || 'Consulta general'}

*Importante:*
• Llega 10 minutos antes
• Trae tu documento de identidad
• Para cancelar, avisa con 24h de anticipación

Si tienes dudas, contáctanos.

Saludos,
*Equipo Odontológico*`;

      const result = await this.twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${patient.telefono}`
      });

      console.log(`WhatsApp enviado exitosamente a ${patient.telefono}:`, result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Error al enviar WhatsApp:', error);
      return { success: false, error: error.message };
    }
  }

  // Enviar recordatorio por ambos medios
  async sendReminder(patient, appointment, reminderType, type = 'both') {
    const results = {};

    if (type === 'email' || type === 'both') {
      results.email = await this.sendEmailReminder(patient, appointment, reminderType);
    }

    if (type === 'whatsapp' || type === 'both') {
      results.whatsapp = await this.sendWhatsAppReminder(patient, appointment, reminderType);
    }

    return results;
  }

  // Obtener texto descriptivo del tiempo del recordatorio
  getTimeText(reminderType) {
    switch (reminderType) {
      case '24h_before':
        return '24 horas antes';
      case '2h_before':
        return '2 horas antes';
      case '1h_before':
        return '1 hora antes';
      case '30min_before':
        return '30 minutos antes';
      default:
        return 'Recordatorio';
    }
  }

  // Verificar configuración
  isConfigured() {
    const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
    const hasWhatsAppConfig = process.env.TWILIO_ACCOUNT_SID && 
                             process.env.TWILIO_AUTH_TOKEN && 
                             process.env.TWILIO_PHONE_NUMBER;
    
    return {
      email: hasEmailConfig,
      whatsapp: hasWhatsAppConfig,
      configured: hasEmailConfig || hasWhatsAppConfig
    };
  }
}

module.exports = new NotificationService(); 