const mongoose = require('mongoose');
require('dotenv').config();
const Odontograma = require('./src/models/Odontograma');
const Diagnostico = require('./src/models/Diagnostico');
const Patient = require('./src/models/Patient');

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odontograma';

async function compareOdontogramaDiagnostico() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los pacientes
    const pacientes = await Patient.find({});
    console.log(`📊 Total de pacientes: ${pacientes.length}\n`);

    for (const paciente of pacientes) {
      console.log(`\n🔍 ANALIZANDO PACIENTE: ${paciente.nombre} ${paciente.apellido}`);
      console.log(`Cédula: ${paciente.cedula}`);
      console.log('=' .repeat(60));

      // Obtener odontograma del paciente
      const odontograma = await Odontograma.findOne({ patient: paciente._id });
      
      if (!odontograma) {
        console.log('❌ No se encontró odontograma para este paciente');
        continue;
      }

      // Obtener diagnósticos del paciente
      const diagnosticos = await Diagnostico.find({ patient: paciente._id }).sort({ fecha: -1 });

      console.log(`📋 ODONTOGRAMA:`);
      console.log(`   Total de dientes: ${odontograma.teeth.length}`);
      
      // Contar intervenciones en odontograma
      const intervencionesOdontograma = odontograma.teeth.reduce((total, tooth) => {
        return total + tooth.interventions.length;
      }, 0);
      console.log(`   Total de intervenciones: ${intervencionesOdontograma}`);

      // Mostrar dientes con intervenciones
      const dientesConIntervenciones = odontograma.teeth.filter(tooth => tooth.interventions.length > 0);
      if (dientesConIntervenciones.length > 0) {
        console.log(`   Dientes con intervenciones:`);
        dientesConIntervenciones.forEach(tooth => {
          console.log(`     Diente ${tooth.number}: ${tooth.interventions.length} intervención(es)`);
          tooth.interventions.forEach(intervention => {
            console.log(`       • ${intervention.procedure} (${intervention.status}) - ${new Date(intervention.date).toLocaleDateString()}`);
          });
        });
      }

      console.log(`\n📋 DIAGNÓSTICOS:`);
      console.log(`   Total de diagnósticos: ${diagnosticos.length}`);

      if (diagnosticos.length > 0) {
        console.log(`   Lista de diagnósticos:`);
        diagnosticos.forEach((diag, index) => {
          console.log(`     ${index + 1}. Diente ${diag.unidadDental} - ${diag.diagnostico} (${diag.superficie})`);
          console.log(`        Cuadrante: ${diag.cuadrante}, Fecha: ${new Date(diag.fecha).toLocaleDateString()}`);
          if (diag.observaciones) {
            console.log(`        Observaciones: ${diag.observaciones}`);
          }
        });
      }

      // Comparar datos
      console.log(`\n🔍 COMPARACIÓN:`);
      
      // Mapear diagnósticos por diente
      const diagnosticosPorDiente = {};
      diagnosticos.forEach(diag => {
        const diente = diag.unidadDental;
        if (!diagnosticosPorDiente[diente]) {
          diagnosticosPorDiente[diente] = [];
        }
        diagnosticosPorDiente[diente].push(diag);
      });

      // Verificar coincidencias
      let coincidencias = 0;
      let discrepancias = 0;

      // Verificar dientes del odontograma
      odontograma.teeth.forEach(tooth => {
        const diagnosticosDelDiente = diagnosticosPorDiente[tooth.number] || [];
        
        if (tooth.interventions.length > 0 && diagnosticosDelDiente.length > 0) {
          console.log(`   ✅ Diente ${tooth.number}: ${tooth.interventions.length} intervención(es) en odontograma, ${diagnosticosDelDiente.length} diagnóstico(s)`);
          coincidencias++;
        } else if (tooth.interventions.length > 0 && diagnosticosDelDiente.length === 0) {
          console.log(`   ❌ Diente ${tooth.number}: ${tooth.interventions.length} intervención(es) en odontograma, pero NO hay diagnósticos`);
          discrepancias++;
        } else if (tooth.interventions.length === 0 && diagnosticosDelDiente.length > 0) {
          console.log(`   ❌ Diente ${tooth.number}: NO hay intervenciones en odontograma, pero hay ${diagnosticosDelDiente.length} diagnóstico(s)`);
          discrepancias++;
        }
      });

      // Verificar diagnósticos sin dientes correspondientes
      Object.keys(diagnosticosPorDiente).forEach(dienteNum => {
        const toothInOdontograma = odontograma.teeth.find(t => t.number.toString() === dienteNum);
        if (!toothInOdontograma) {
          console.log(`   ⚠️  Diente ${dienteNum}: Hay diagnósticos pero NO existe en odontograma`);
          discrepancias++;
        }
      });

      console.log(`\n📊 RESUMEN:`);
      console.log(`   Coincidencias: ${coincidencias}`);
      console.log(`   Discrepancias: ${discrepancias}`);
      
      if (discrepancias === 0) {
        console.log(`   ✅ Los datos están sincronizados`);
      } else {
        console.log(`   ⚠️  Hay discrepancias entre odontograma y diagnósticos`);
      }

      console.log('\n' + '=' .repeat(60));
    }

  } catch (error) {
    console.error('❌ Error al comparar datos:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el script
compareOdontogramaDiagnostico(); 