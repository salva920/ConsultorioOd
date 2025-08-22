const { MongoClient } = require('mongodb');

// Configuración de MongoDB
const MONGODB_URI = 'mongodb+srv://bermudezbastidass:PIzNEAiGbfOgN4Mc@cluster0.7x7lbqg.mongodb.net/odontograma?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'odontograma';

// Función para verificar el estado actual
async function verificarEstadoActual() {
  let client;

  try {
    console.log('🔍 VERIFICANDO ESTADO ACTUAL');
    console.log('==============================');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');

    const db = client.db(DB_NAME);
    
    // 1. VERIFICAR PACIENTES
    console.log('\n👥 PACIENTES:');
    const pacientes = await db.collection('patients').find({}).toArray();
    console.log(`   Total: ${pacientes.length}`);
    
    if (pacientes.length > 0) {
      pacientes.forEach((paciente, index) => {
        console.log(`   ${index + 1}. ID: ${paciente._id}`);
        console.log(`      Nombre: ${paciente.nombre} ${paciente.apellido}`);
        console.log(`      Cédula: ${paciente.cedula}`);
        console.log(`      Fecha: ${paciente.createdAt}`);
        console.log('');
      });
    }
    
    // 2. VERIFICAR ODONTOGRAMAS
    console.log('\n🦷 ODONTOGRAMAS:');
    const odontogramas = await db.collection('odontogramas').find({}).toArray();
    console.log(`   Total: ${odontogramas.length}`);
    
    if (odontogramas.length > 0) {
      odontogramas.forEach((odontograma, index) => {
        console.log(`   ${index + 1}. ID: ${odontograma._id}`);
        console.log(`      Paciente: ${odontograma.patient}`);
        console.log(`      Dientes: ${odontograma.teeth?.length || 0}`);
        console.log(`      Fecha: ${odontograma.createdAt}`);
        console.log('');
      });
    }
    
    // 3. VERIFICAR DIAGNÓSTICOS
    console.log('\n📋 DIAGNÓSTICOS:');
    const diagnosticos = await db.collection('diagnosticos').find({}).toArray();
    console.log(`   Total: ${diagnosticos.length}`);
    
    if (diagnosticos.length > 0) {
      diagnosticos.forEach((diagnostico, index) => {
        console.log(`   ${index + 1}. ID: ${diagnostico._id}`);
        console.log(`      Paciente: ${diagnostico.patientId || diagnostico.patient}`);
        console.log(`      Diente: ${diagnostico.unidadDental}`);
        console.log(`      Diagnóstico: ${diagnostico.diagnostico}`);
        console.log(`      Fecha: ${diagnostico.fecha}`);
        console.log('');
      });
    }
    
    // 4. ANÁLISIS DEL PROBLEMA
    console.log('\n🔍 ANÁLISIS DEL PROBLEMA:');
    if (pacientes.length > 0 && diagnosticos.length > 0 && odontogramas.length === 0) {
      console.log('   ❌ PROBLEMA IDENTIFICADO:');
      console.log('      - Hay pacientes');
      console.log('      - Hay diagnósticos');
      console.log('      - NO hay odontogramas');
      console.log('      - La API no está creando odontogramas automáticamente');
    } else if (pacientes.length > 0 && odontogramas.length > 0 && diagnosticos.length > 0) {
      console.log('   ✅ TODO FUNCIONANDO:');
      console.log('      - Hay pacientes, odontogramas y diagnósticos');
    } else {
      console.log('   ⚠️  ESTADO MIXTO:');
      console.log(`      - Pacientes: ${pacientes.length}`);
      console.log(`      - Odontogramas: ${odontogramas.length}`);
      console.log(`      - Diagnósticos: ${diagnosticos.length}`);
    }
    
    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la verificación
console.log('🚀 INICIANDO VERIFICACIÓN DEL ESTADO ACTUAL...');
verificarEstadoActual().catch(console.error);
