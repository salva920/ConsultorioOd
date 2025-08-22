const mongoose = require('mongoose');
require('dotenv').config();
const Odontograma = require('./src/models/Odontograma');
const Patient = require('./src/models/Patient'); // Agregar el modelo Patient

// Configuración de la base de datos - usar la misma que el servidor
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odontograma';

async function checkOdontogramaData() {
  try {
    // Conectar a MongoDB con la misma configuración que el servidor
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');
    console.log(`URI de conexión: ${MONGODB_URI}`);

    // Obtener todos los odontogramas
    const odontogramas = await Odontograma.find({}).populate('patient', 'nombre apellido cedula');
    
    console.log('\n📊 DATOS DE LA COLECCIÓN ODONTOGRAMA');
    console.log('=====================================');
    console.log(`Total de odontogramas encontrados: ${odontogramas.length}\n`);

    if (odontogramas.length === 0) {
      console.log('❌ No hay odontogramas en la base de datos');
      return;
    }

    // Mostrar cada odontograma
    odontogramas.forEach((odontograma, index) => {
      console.log(`\n🔍 ODONTOGRAMA #${index + 1}`);
      console.log('----------------------------------------');
      console.log(`ID: ${odontograma._id}`);
      console.log(`Paciente: ${odontograma.patient ? `${odontograma.patient.nombre} ${odontograma.patient.apellido}` : 'N/A'}`);
      console.log(`Cédula: ${odontograma.patient ? odontograma.patient.cedula : 'N/A'}`);
      console.log(`Creado: ${odontograma.createdAt}`);
      console.log(`Actualizado: ${odontograma.updatedAt}`);
      console.log(`Total de dientes: ${odontograma.teeth.length}`);

      // Mostrar detalles de cada diente
      if (odontograma.teeth.length > 0) {
        console.log('\n🦷 DETALLES DE LOS DIENTES:');
        console.log('Número | Condición | Notas | Intervenciones');
        console.log('-------|-----------|-------|---------------');
        
        odontograma.teeth.forEach(tooth => {
          const interventions = tooth.interventions.length;
          console.log(`${tooth.number.toString().padStart(6)} | ${tooth.condition.padStart(9)} | ${(tooth.notes || '').substring(0, 20).padStart(20)} | ${interventions}`);
          
          // Mostrar intervenciones si las hay
          if (tooth.interventions.length > 0) {
            console.log(`       └─ Intervenciones:`);
            tooth.interventions.forEach(intervention => {
              console.log(`           • ${intervention.procedure} (${intervention.status}) - ${intervention.date.toLocaleDateString()}`);
            });
          }
        });
      }

      // Verificar si hay datos de posición (que ya no deberían estar)
      const teethWithPositionData = odontograma.teeth.filter(tooth => {
        return tooth.posX !== undefined || tooth.posY !== undefined || 
               tooth.rotation !== undefined || tooth.size !== undefined;
      });

      if (teethWithPositionData.length > 0) {
        console.log('\n⚠️  ADVERTENCIA: Dientes con datos de posición (deberían ser eliminados):');
        teethWithPositionData.forEach(tooth => {
          console.log(`   Diente ${tooth.number}: posX=${tooth.posX}, posY=${tooth.posY}, rotation=${tooth.rotation}, size=${JSON.stringify(tooth.size)}`);
        });
      } else {
        console.log('\n✅ No hay datos de posición en la base de datos (correcto)');
      }
    });

    // Resumen estadístico
    console.log('\n📈 RESUMEN ESTADÍSTICO');
    console.log('=====================');
    
    const totalTeeth = odontogramas.reduce((sum, odontograma) => sum + odontograma.teeth.length, 0);
    const totalInterventions = odontogramas.reduce((sum, odontograma) => 
      sum + odontograma.teeth.reduce((toothSum, tooth) => toothSum + tooth.interventions.length, 0), 0);
    
    console.log(`Total de dientes en todos los odontogramas: ${totalTeeth}`);
    console.log(`Total de intervenciones: ${totalInterventions}`);
    
    // Contar por condición
    const conditions = {};
    odontogramas.forEach(odontograma => {
      odontograma.teeth.forEach(tooth => {
        conditions[tooth.condition] = (conditions[tooth.condition] || 0) + 1;
      });
    });
    
    console.log('\nDistribución por condición:');
    Object.entries(conditions).forEach(([condition, count]) => {
      console.log(`  ${condition}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error al consultar la base de datos:', error);
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verifica que MongoDB esté corriendo');
    console.log('2. Verifica la variable de entorno MONGODB_URI');
    console.log('3. Verifica que el servidor backend esté corriendo');
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el script
checkOdontogramaData(); 