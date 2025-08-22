const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function testWhatsApp() {
  try {
    console.log('🧪 Probando envío de WhatsApp...');
    console.log('📱 Número de destino:', '+58417990353');
    
    const message = await client.messages.create({
      body: '🦷 Prueba de recordatorio - Sistema Odontológico\n\nHola Salvatore, este es un mensaje de prueba del sistema de recordatorios.',
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+584127990353'
    });

    console.log('✅ Mensaje enviado exitosamente!');
    console.log('📋 SID del mensaje:', message.sid);
    console.log('📊 Estado:', message.status);
    
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error.message);
    console.error('🔍 Detalles del error:', error);
  }
}

// Ejecutar la prueba
testWhatsApp(); 