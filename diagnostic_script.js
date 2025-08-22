const { MongoClient } = require('mongodb');

// Configuración de conexión
const MONGODB_URI = 'mongodb+srv://bermudezbastidass:PIzNEAiGbfOgN4Mc@cluster0.7x7lbqg.mongodb.net/odontograma?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'odontograma';
const COLLECTION_ODONTOGRAMAS = 'odontogramas';
const COLLECTION_DIAGNOSTICOS = 'diagnosticos';

async function diagnosticarBaseDeDatos() {
  let client;
  
  try {
    console.log('🔍 Conectando a MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');
    
    const db = client.db(DB_NAME);
    
    // 1. Verificar todas las colecciones
    console.log('\n📋 Colecciones disponibles:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // 2. Contar documentos en cada colección
    console.log('\n📊 Conteo de documentos:');
    const odontogramasCount = await db.collection(COLLECTION_ODONTOGRAMAS).countDocuments();
    const diagnosticosCount = await db.collection(COLLECTION_DIAGNOSTICOS).countDocuments();
    console.log(`  - Odontogramas: ${odontogramasCount}`);
    console.log(`  - Diagnósticos: ${diagnosticosCount}`);
    
    // 3. Verificar estructura de odontogramas
    console.log('\n🦷 Estructura de odontogramas:');
    const odontogramas = await db.collection(COLLECTION_ODONTOGRAMAS).find({}).toArray();
    
    odontogramas.forEach((odontograma, index) => {
      console.log(`\n  Odontograma ${index + 1}:`);
      console.log(`    ID: ${odontograma._id}`);
      console.log(`    Patient: ${odontograma.patient || 'NO DEFINIDO'}`);
      console.log(`    PatientId: ${odontograma.patientId || 'NO DEFINIDO'}`);
      console.log(`    Cantidad de dientes: ${odontograma.teeth?.length || 0}`);
      console.log(`    Fecha creación: ${odontograma.createdAt || 'NO DEFINIDO'}`);
      console.log(`    Fecha actualización: ${odontograma.updatedAt || 'NO DEFINIDO'}`);
      
      // Verificar si tiene intervenciones
      if (odontograma.teeth && odontograma.teeth.length > 0) {
        const dientesConIntervenciones = odontograma.teeth.filter(diente => 
          diente.interventions && diente.interventions.length > 0
        );
        console.log(`    Dientes con intervenciones: ${dientesConIntervenciones.length}`);
        
        if (dientesConIntervenciones.length > 0) {
          console.log(`    Ejemplo de intervención:`);
          const primeraIntervencion = dientesConIntervenciones[0].interventions[0];
          console.log(`      Diente ${dientesConIntervenciones[0].number}: ${primeraIntervencion.type} - ${primeraIntervencion.date}`);
        }
      }
    });
    
    // 4. Verificar estructura de diagnósticos
    console.log('\n🔬 Estructura de diagnósticos:');
    const diagnosticos = await db.collection(COLLECTION_DIAGNOSTICOS).find({}).toArray();
    
    diagnosticos.forEach((diagnostico, index) => {
      console.log(`\n  Diagnóstico ${index + 1}:`);
      console.log(`    ID: ${diagnostico._id}`);
      console.log(`    Patient: ${diagnostico.patient || 'NO DEFINIDO'}`);
      console.log(`    PatientId: ${diagnostico.patientId || 'NO DEFINIDO'}`);
      console.log(`    Diente: ${diagnostico.diente || 'NO DEFINIDO'}`);
      console.log(`    Tipo: ${diagnostico.tipo || 'NO DEFINIDO'}`);
      console.log(`    Descripción: ${diagnostico.descripcion || 'NO DEFINIDO'}`);
      console.log(`    Fecha: ${diagnostico.fecha || 'NO DEFINIDO'}`);
    });
    
    // 5. Verificar referencias cruzadas
    console.log('\n🔗 Verificando referencias cruzadas:');
    
    // Buscar odontogramas que referencien al mismo paciente
    const pacientesConOdontogramas = {};
    odontogramas.forEach(odontograma => {
      const patientRef = odontograma.patient || odontograma.patientId;
      if (patientRef) {
        if (!pacientesConOdontogramas[patientRef]) {
          pacientesConOdontogramas[patientRef] = [];
        }
        pacientesConOdontogramas[patientRef].push(odontograma._id);
      }
    });
    
    console.log('  Pacientes con múltiples odontogramas:');
    Object.entries(pacientesConOdontogramas).forEach(([patientId, odontogramaIds]) => {
      if (odontogramaIds.length > 1) {
        console.log(`    ❌ Paciente ${patientId}: ${odontogramaIds.length} odontogramas`);
        odontogramaIds.forEach(id => console.log(`      - ${id}`));
      } else {
        console.log(`    ✅ Paciente ${patientId}: 1 odontograma`);
      }
    });
    
    // 6. Verificar odontogramas sin referencia de paciente
    const odontogramasSinPaciente = odontogramas.filter(odontograma => 
      !odontograma.patient && !odontograma.patientId
    );
    
    if (odontogramasSinPaciente.length > 0) {
      console.log('\n⚠️  Odontogramas sin referencia de paciente:');
      odontogramasSinPaciente.forEach(odontograma => {
        console.log(`    - ${odontograma._id}`);
      });
    }
    
    // 7. Simular consulta de la API
    console.log('\n�� Simulando consulta de la API:');
    const patientIdEjemplo = odontogramas[0]?.patient || odontogramas[0]?.patientId;
    
    if (patientIdEjemplo) {
      console.log(`  Buscando odontograma para paciente: ${patientIdEjemplo}`);
      
      // Simular búsqueda por campo "patient"
      const odontogramaPorPatient = await db.collection(COLLECTION_ODONTOGRAMAS)
        .findOne({ patient: patientIdEjemplo });
      
      if (odontogramaPorPatient) {
        console.log(`    ✅ Encontrado por campo "patient": ${odontogramaPorPatient._id}`);
      } else {
        console.log(`    ❌ No encontrado por campo "patient"`);
      }
      
      // Simular búsqueda por campo "patientId"
      const odontogramaPorPatientId = await db.collection(COLLECTION_ODONTOGRAMAS)
        .findOne({ patientId: patientIdEjemplo });
      
      if (odontogramaPorPatientId) {
        console.log(`    ✅ Encontrado por campo "patientId": ${odontogramaPorPatientId._id}`);
      } else {
        console.log(`    ❌ No encontrado por campo "patientId"`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar el diagnóstico
diagnosticarBaseDeDatos().catch(console.error);
