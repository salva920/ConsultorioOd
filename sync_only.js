const { MongoClient } = require('mongodb');

// Configuración de MongoDB
const MONGODB_URI = 'mongodb+srv://bermudezbastidass:PIzNEAiGbfOgN4Mc@cluster0.7x7lbqg.mongodb.net/odontograma?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'odontograma';

// Función para sincronizar diagnósticos existentes con intervenciones del odontograma
async function sincronizarDiagnosticosConIntervenciones() {
  let client;
  
  try {
    console.log('🔗 SINCRONIZANDO DIAGNÓSTICOS CON INTERVENCIONES');
    console.log('==================================================');
    console.log('⚠️  NOTA: NO se eliminarán datos existentes');
    console.log('⚠️  Solo se agregarán intervenciones faltantes');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');
    
    const db = client.db(DB_NAME);
    
    // Buscar el paciente más reciente
    const pacientes = await db.collection('patients').find({}).sort({ createdAt: -1 }).limit(1).toArray();
    
    if (pacientes.length === 0) {
      console.log('❌ No hay pacientes en la base de datos');
      return;
    }
    
    const paciente = pacientes[0];
    console.log(`\n👥 PACIENTE ENCONTRADO:`);
    console.log(`   ID: ${paciente._id}`);
    console.log(`   Nombre: ${paciente.nombre} ${paciente.apellido}`);
    
    // 1. VERIFICAR DIAGNÓSTICOS EXISTENTES
    console.log('\n📋 VERIFICANDO DIAGNÓSTICOS EXISTENTES...');
    const diagnosticos = await db.collection('diagnosticos').find({
      $or: [
        { patient: paciente._id },
        { patientId: paciente._id }
      ]
    }).toArray();
    
    console.log(`   Total diagnósticos encontrados: ${diagnosticos.length}`);
    
    if (diagnosticos.length === 0) {
      console.log('   ℹ️  No hay diagnósticos para sincronizar');
      return;
    }
    
    // 2. VERIFICAR ODONTOGRAMA
    console.log('\n🦷 VERIFICANDO ODONTOGRAMA...');
    
    // Buscar odontograma por paciente (convertir a string para comparación)
    const odontograma = await db.collection('odontogramas').findOne({
      patient: paciente._id.toString()
    });
    
    if (!odontograma) {
      console.log('   ❌ No se encontró odontograma para este paciente');
      console.log(`   🔍 Paciente ID buscado: ${paciente._id} (tipo: ${typeof paciente._id})`);
      console.log('   🔍 Buscando todos los odontogramas para debug...');
      
      const todosOdontogramas = await db.collection('odontogramas').find({}).toArray();
      console.log(`   📊 Total odontogramas en la base de datos: ${todosOdontogramas.length}`);
      
      if (todosOdontogramas.length > 0) {
        console.log('   📋 Primeros 3 odontogramas:');
        todosOdontogramas.slice(0, 3).forEach((od, index) => {
          console.log(`      ${index + 1}. ID: ${od._id}`);
          console.log(`         Patient: ${od.patient} (tipo: ${typeof od.patient})`);
          console.log(`         PatientId: ${od.patientId}`);
          console.log(`         Dientes: ${od.teeth?.length || 0}`);
        });
      }
      return;
    }
    
    console.log(`   ID del odontograma: ${odontograma._id}`);
    console.log(`   Total dientes: ${odontograma.teeth?.length || 0}`);
    
    // 3. SINCRONIZAR CADA DIAGNÓSTICO
    console.log('\n🔗 SINCRONIZANDO DIAGNÓSTICOS...');
    let intervencionesAgregadas = 0;
    
    for (const diagnostico of diagnosticos) {
      const dienteNumero = diagnostico.unidadDental;
      console.log(`\n   🔍 Procesando diente ${dienteNumero}: ${diagnostico.diagnostico}`);
      
      // Buscar el diente en el odontograma
      const dienteEnOdontograma = odontograma.teeth?.find(d => d.number.toString() === dienteNumero);
      
      if (!dienteEnOdontograma) {
        console.log(`     ⚠️  Diente ${dienteNumero} no existe en el odontograma`);
        continue;
      }
      
      // Verificar si ya tiene intervenciones
      if (dienteEnOdontograma.interventions && dienteEnOdontograma.interventions.length > 0) {
        console.log(`     ✅ Diente ${dienteNumero} ya tiene ${dienteEnOdontograma.interventions.length} intervenciones`);
        continue;
      }
      
      // Crear intervención basada en el diagnóstico
      console.log(`     🔧 Creando intervención para diente ${dienteNumero}...`);
      
      const nuevaIntervencion = {
        id: `sync_${Date.now()}_${Math.random()}`,
        date: diagnostico.fecha || diagnostico.date || new Date().toISOString(),
        toothNumber: parseInt(dienteNumero),
        procedure: diagnostico.diagnostico,
        notes: diagnostico.observaciones || diagnostico.notes || '',
        status: 'completado',
        part: diagnostico.superficie || 'todo',
        type: diagnostico.diagnostico,
        images: []
      };
      
      // Agregar la intervención al diente
      if (!dienteEnOdontograma.interventions) {
        dienteEnOdontograma.interventions = [];
      }
      
      dienteEnOdontograma.interventions.push(nuevaIntervencion);
      intervencionesAgregadas++;
      
      console.log(`     ✅ Intervención creada: ${nuevaIntervencion.procedure}`);
    }
    
    // 4. GUARDAR CAMBIOS EN EL ODONTOGRAMA
    if (intervencionesAgregadas > 0) {
      console.log(`\n💾 GUARDANDO CAMBIOS EN EL ODONTOGRAMA...`);
      console.log(`   Total intervenciones agregadas: ${intervencionesAgregadas}`);
      
      const resultado = await db.collection('odontogramas').updateOne(
        { _id: odontograma._id },
        { 
          $set: { 
            teeth: odontograma.teeth,
            updatedAt: new Date()
          }
        }
      );
      
      if (resultado.modifiedCount > 0) {
        console.log(`   ✅ Odontograma actualizado exitosamente`);
      } else {
        console.log(`   ⚠️  No se pudo actualizar el odontograma`);
      }
    } else {
      console.log(`\nℹ️  No se agregaron nuevas intervenciones`);
    }
    
    // 5. VERIFICACIÓN FINAL
    console.log('\n🔍 VERIFICACIÓN FINAL...');
    const odontogramaActualizado = await db.collection('odontogramas').findOne({
      _id: odontograma._id
    });
    
    if (odontogramaActualizado && odontogramaActualizado.teeth) {
      let totalIntervenciones = 0;
      odontogramaActualizado.teeth.forEach(diente => {
        if (diente.interventions && diente.interventions.length > 0) {
          totalIntervenciones += diente.interventions.length;
        }
      });
      
      console.log(`   📊 Total intervenciones en odontograma: ${totalIntervenciones}`);
      console.log(`   📋 Total diagnósticos: ${diagnosticos.length}`);
      
      if (totalIntervenciones >= diagnosticos.length) {
        console.log(`   ✅ SINCRONIZACIÓN EXITOSA: Todos los diagnósticos tienen intervenciones`);
      } else {
        console.log(`   ⚠️  SINCRONIZACIÓN PARCIAL: Faltan algunas intervenciones`);
      }
    }
    
    console.log('\n✅ Sincronización completada');
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar SOLO la sincronización
console.log('🚀 INICIANDO SCRIPT DE SINCRONIZACIÓN...');
sincronizarDiagnosticosConIntervenciones().catch(console.error);
