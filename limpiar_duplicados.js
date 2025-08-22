const { MongoClient } = require('mongodb');

// Configuración de MongoDB
const MONGODB_URI = 'mongodb+srv://bermudezbastidass:PIzNEAiGbfOgN4Mc@cluster0.7x7lbqg.mongodb.net/odontograma?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'odontograma';

// Función para limpiar odontogramas duplicados
async function limpiarOdontogramasDuplicados() {
  let client;

  try {
    console.log('🧹 LIMPIANDO ODONTOGRAMAS DUPLICADOS');
    console.log('=====================================');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');

    const db = client.db(DB_NAME);
    const patientId = '689a6fb9514ba740335fa06a';
    
    // 1. ENCONTRAR TODOS LOS ODONTOGRAMAS DEL PACIENTE
    console.log(`\n🔍 BUSCANDO ODONTOGRAMAS DEL PACIENTE ${patientId}...`);
    const odontogramas = await db.collection('odontogramas').find({
      patient: patientId
    }).sort({ createdAt: -1 }).toArray();
    
    console.log(`   Total odontogramas encontrados: ${odontogramas.length}`);
    
    if (odontogramas.length <= 1) {
      console.log('   ✅ Solo hay 1 odontograma, no hay duplicados que limpiar');
      return;
    }
    
    // 2. IDENTIFICAR EL ODONTOGRAMA CON INTERVENCIONES
    let odontogramaAMantener = null;
    let odontogramasAEliminar = [];
    
    odontogramas.forEach((odontograma, index) => {
      console.log(`\n   ${index + 1}. ID: ${odontograma._id}`);
      console.log(`      Fecha: ${odontograma.createdAt}`);
      
      // Contar intervenciones
      let totalIntervenciones = 0;
      if (odontograma.teeth && odontograma.teeth.length > 0) {
        odontograma.teeth.forEach(diente => {
          if (diente.interventions && diente.interventions.length > 0) {
            totalIntervenciones += diente.interventions.length;
          }
        });
      }
      
      console.log(`      Total intervenciones: ${totalIntervenciones}`);
      
      if (totalIntervenciones > 0) {
        if (!odontogramaAMantener) {
          odontogramaAMantener = odontograma;
          console.log(`      ✅ MANTENER: Este odontograma tiene intervenciones`);
        } else {
          odontogramasAEliminar.push(odontograma);
          console.log(`      🗑️  ELIMINAR: Ya hay otro con intervenciones`);
        }
      } else {
        odontogramasAEliminar.push(odontograma);
        console.log(`      🗑️  ELIMINAR: No tiene intervenciones`);
      }
    });
    
    // 3. ELIMINAR ODONTOGRAMAS DUPLICADOS
    if (odontogramasAEliminar.length > 0) {
      console.log(`\n🗑️  ELIMINANDO ${odontogramasAEliminar.length} ODONTOGRAMAS DUPLICADOS...`);
      
      for (const odontograma of odontogramasAEliminar) {
        console.log(`   🗑️  Eliminando: ${odontograma._id}`);
        await db.collection('odontogramas').deleteOne({ _id: odontograma._id });
      }
      
      console.log(`   ✅ Eliminados ${odontogramasAEliminar.length} odontogramas duplicados`);
    }
    
    // 4. VERIFICACIÓN FINAL
    console.log('\n🔍 VERIFICACIÓN FINAL...');
    const odontogramasRestantes = await db.collection('odontogramas').find({
      patient: patientId
    }).toArray();
    
    console.log(`   📊 Odontogramas restantes: ${odontogramasRestantes.length}`);
    
    if (odontogramasRestantes.length === 1) {
      console.log('   ✅ PERFECTO: Solo queda 1 odontograma (el correcto)');
      
      const odontogramaFinal = odontogramasRestantes[0];
      console.log(`   🎯 Odontograma final: ${odontogramaFinal._id}`);
      
      // Verificar que tenga la intervención
      if (odontogramaFinal.teeth && odontogramaFinal.teeth.length > 0) {
        const diente18 = odontogramaFinal.teeth.find(d => d.number === 18);
        if (diente18 && diente18.interventions && diente18.interventions.length > 0) {
          console.log(`   ✅ Diente 18 tiene ${diente18.interventions.length} intervención(es)`);
          diente18.interventions.forEach((intervention, idx) => {
            console.log(`      ${idx + 1}. ${intervention.procedure || intervention.type} - ${intervention.status || 'sin estado'}`);
          });
        } else {
          console.log(`   ❌ Diente 18 NO tiene intervenciones`);
        }
      }
    } else {
      console.log(`   ⚠️  ADVERTENCIA: Aún hay ${odontogramasRestantes.length} odontogramas`);
    }
    
    console.log('\n✅ Limpieza de duplicados completada');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la limpieza
console.log('🚀 INICIANDO LIMPIEZA DE ODONTOGRAMAS DUPLICADOS...');
limpiarOdontogramasDuplicados().catch(console.error);
