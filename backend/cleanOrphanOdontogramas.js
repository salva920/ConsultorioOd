const mongoose = require('mongoose');
require('dotenv').config();
const Odontograma = require('./src/models/Odontograma');
const Patient = require('./src/models/Patient');

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odontograma';

async function cleanOrphanOdontogramas() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los pacientes existentes
    const patients = await Patient.find({});
    console.log(`📋 Pacientes existentes: ${patients.length}`);
    patients.forEach(patient => {
      console.log(`  - ${patient.nombre} ${patient.apellido} (ID: ${patient._id})`);
    });

    // Obtener todos los odontogramas
    const allOdontogramas = await Odontograma.find({});
    console.log(`\n📊 Total de odontogramas: ${allOdontogramas.length}`);

    // Identificar odontogramas huérfanos (sin paciente válido)
    const orphanOdontogramas = allOdontogramas.filter(odontograma => {
      // Verificar si el paciente existe
      return !patients.some(patient => patient._id.toString() === odontograma.patient.toString());
    });

    console.log(`\n⚠️  Odontogramas huérfanos encontrados: ${orphanOdontogramas.length}`);

    if (orphanOdontogramas.length === 0) {
      console.log('✅ No hay odontogramas huérfanos para eliminar');
      return;
    }

    // Mostrar detalles de los odontogramas huérfanos
    console.log('\n🗑️  Odontogramas huérfanos a eliminar:');
    orphanOdontogramas.forEach((odontograma, index) => {
      console.log(`  ${index + 1}. ID: ${odontograma._id}`);
      console.log(`     Paciente ID: ${odontograma.patient}`);
      console.log(`     Dientes: ${odontograma.teeth.length}`);
      console.log(`     Creado: ${odontograma.createdAt}`);
      console.log(`     Actualizado: ${odontograma.updatedAt}`);
    });

    // Confirmar eliminación
    console.log('\n❓ ¿Deseas eliminar estos odontogramas huérfanos? (s/n)');
    
    // En un script automático, procedemos con la eliminación
    console.log('🔄 Procediendo con la eliminación...');

    // Eliminar odontogramas huérfanos
    const deleteResult = await Odontograma.deleteMany({
      _id: { $in: orphanOdontogramas.map(o => o._id) }
    });

    console.log(`✅ Eliminados ${deleteResult.deletedCount} odontogramas huérfanos`);

    // Verificar el resultado
    const remainingOdontogramas = await Odontograma.find({});
    console.log(`\n📊 Odontogramas restantes: ${remainingOdontogramas.length}`);

    if (remainingOdontogramas.length > 0) {
      console.log('\n🔍 Odontogramas restantes:');
      for (const odontograma of remainingOdontogramas) {
        const patient = patients.find(p => p._id.toString() === odontograma.patient.toString());
        console.log(`  - ID: ${odontograma._id}`);
        console.log(`    Paciente: ${patient ? `${patient.nombre} ${patient.apellido}` : 'N/A'}`);
        console.log(`    Dientes: ${odontograma.teeth.length}`);
      }
    }

    console.log('\n✅ Limpieza completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el script
cleanOrphanOdontogramas(); 