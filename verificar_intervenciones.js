const { MongoClient } = require('mongodb');

// Configuración de MongoDB
const MONGODB_URI = 'mongodb+srv://bermudezbastidass:PIzNEAiGbfOgN4Mc@cluster0.7x7lbqg.mongodb.net/odontograma?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'odontograma';

// Función para verificar qué odontograma tiene la intervención
async function verificarIntervenciones() {
  let client;

  try {
    console.log('🔍 VERIFICANDO INTERVENCIONES EN ODONTOGRAMAS');
    console.log('==============================================');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');

    const db = client.db(DB_NAME);
    const patientId = '689a6fb9514ba740335fa06a';
    
    // 1. VERIFICAR TODOS LOS ODONTOGRAMAS DEL PACIENTE
    console.log(`\n🦷 ODONTOGRAMAS DEL PACIENTE ${patientId}:`);
    const odontogramas = await db.collection('odontogramas').find({
      patient: patientId
    }).sort({ createdAt: -1 }).toArray();
    
    console.log(`   Total odontogramas: ${odontogramas.length}`);
    
    let odontogramaConIntervencion = null;
    let totalIntervenciones = 0;
    
    odontogramas.forEach((odontograma, index) => {
      console.log(`\n   ${index + 1}. ID: ${odontograma._id}`);
      console.log(`      Fecha creación: ${odontograma.createdAt}`);
      console.log(`      Total dientes: ${odontograma.teeth?.length || 0}`);
      
      // Verificar intervenciones en el diente 18
      if (odontograma.teeth && odontograma.teeth.length > 0) {
        const diente18 = odontograma.teeth.find(d => d.number === 18);
        if (diente18) {
          console.log(`      Diente 18: ${diente18.interventions?.length || 0} intervenciones`);
          
          if (diente18.interventions && diente18.interventions.length > 0) {
            console.log(`      ✅ Diente 18 TIENE intervenciones:`);
            diente18.interventions.forEach((intervention, idx) => {
              console.log(`         ${idx + 1}. ${intervention.procedure || intervention.type} - ${intervention.status || 'sin estado'}`);
            });
            odontogramaConIntervencion = odontograma;
          } else {
            console.log(`      ❌ Diente 18 NO tiene intervenciones`);
          }
        } else {
          console.log(`      ❌ Diente 18 no existe en este odontograma`);
        }
        
        // Contar total de intervenciones
        let intervencionesEnOdontograma = 0;
        odontograma.teeth.forEach(diente => {
          if (diente.interventions && diente.interventions.length > 0) {
            intervencionesEnOdontograma += diente.interventions.length;
          }
        });
        console.log(`      Total intervenciones en odontograma: ${intervencionesEnOdontograma}`);
        totalIntervenciones += intervencionesEnOdontograma;
      }
    });
    
    // 2. ANÁLISIS DEL PROBLEMA
    console.log('\n🔍 ANÁLISIS DEL PROBLEMA:');
    if (odontogramaConIntervencion) {
      console.log(`   ✅ INTERVENCIÓN ENCONTRADA en odontograma: ${odontogramaConIntervencion._id}`);
      console.log(`   📅 Fecha: ${odontogramaConIntervencion.createdAt}`);
      console.log(`   🎯 Este es el odontograma que DEBERÍA cargar el frontend`);
    } else {
      console.log(`   ❌ NO se encontró ningún odontograma con la intervención del diente 18`);
    }
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`   Total odontogramas: ${odontogramas.length}`);
    console.log(`   Total intervenciones: ${totalIntervenciones}`);
    console.log(`   Odontograma con intervención: ${odontogramaConIntervencion ? 'SÍ' : 'NO'}`);
    
    // 3. RECOMENDACIÓN
    if (odontogramas.length > 1) {
      console.log(`\n⚠️  PROBLEMA IDENTIFICADO:`);
      console.log(`   - El paciente tiene ${odontogramas.length} odontogramas`);
      console.log(`   - Solo 1 tiene la intervención`);
      console.log(`   - El frontend puede estar cargando el incorrecto`);
      console.log(`\n💡 SOLUCIÓN:`);
      console.log(`   - Eliminar odontogramas duplicados`);
      console.log(`   - Mantener solo el que tiene la intervención`);
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
console.log('🚀 INICIANDO VERIFICACIÓN DE INTERVENCIONES...');
verificarIntervenciones().catch(console.error);
