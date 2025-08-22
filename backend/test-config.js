require('dotenv').config();

console.log('🔧 Verificando configuración de notificaciones...\n');

// Verificar configuración de Email
console.log('📧 Configuración de Email:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configurado' : '❌ No configurado');
console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Configurado' : '❌ No configurado');

// Verificar configuración de WhatsApp
console.log('\n📱 Configuración de WhatsApp:');
console.log('   TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Configurado' : '❌ No configurado');
console.log('   TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Configurado' : '❌ No configurado');
console.log('   TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? '✅ Configurado' : '❌ No configurado');

// Verificar base de datos
console.log('\n🗄️ Configuración de Base de Datos:');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Configurado' : '❌ No configurado');

console.log('\n📋 Resumen:');
const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
const whatsappConfigured = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER;

if (emailConfigured) {
  console.log('   📧 Email: ✅ Configurado correctamente');
} else {
  console.log('   📧 Email: ❌ Falta configuración');
}

if (whatsappConfigured) {
  console.log('   📱 WhatsApp: ✅ Configurado correctamente');
} else {
  console.log('   📱 WhatsApp: ❌ Falta configuración');
}

if (!emailConfigured && !whatsappConfigured) {
  console.log('\n⚠️  ADVERTENCIA: No hay ningún método de notificación configurado');
  console.log('   Crea un archivo .env en la carpeta backend con las variables necesarias');
} 