    const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Nuevas posiciones simplificadas para dientes temporales (51-85)
const TEMPORARY_TEETH_POSITIONS = [
  // Dientes superiores izquierdos (61-65)
  { id: 65, posX: 27.44519069598853, posY: 6.633333333333333, tipo: 'molar' },
  { id: 64, posX: 23.197296952498082, posY: 8.466666666666667, tipo: 'molar' },
  { id: 63, posX: 17.09247598979579, posY: 20.900000000000006, tipo: 'canino' },
  { id: 62, posX: 19.770489091484723, posY: 13.733333333333336, tipo: 'incisivo' },
  { id: 61, posX: 15.941270749120223, posY: 31.43333333333333, tipo: 'incisivo' },

  // Dientes superiores derechos (51-55)
  { id: 55, posX: 32.86627657846563, posY: 6.666666666666667, tipo: 'molar' },
  { id: 54, posX: 37.8548326213931, posY: 9.233333333333334, tipo: 'molar' },
  { id: 53, posX: 40.824713263194646, posY: 13.799999999999999, tipo: 'canino' },
  { id: 52, posX: 43.051521124207994, posY: 20.900000000000002, tipo: 'incisivo' },
  { id: 51, posX: 44.79459390499614, posY: 31.099999999999994, tipo: 'incisivo' },

  // Dientes inferiores izquierdos (71-75)
  { id: 75, posX: 16.12500582934541, posY: 58.399999999999984, tipo: 'incisivo' },
  { id: 74, posX: 17.411151390921745, posY: 70.26666666666667, tipo: 'incisivo' },
  { id: 73, posX: 20.603018931034338, posY: 79.06666666666666, tipo: 'canino' },
  { id: 72, posX: 23.597296952498077, posY: 83.63333333333335, tipo: 'molar' },
  { id: 71, posX: 28.285852995425557, posY: 86.03333333333335, tipo: 'molar' },

  // Dientes inferiores derechos (81-85)
  { id: 85, posX: 44.65393160555915, posY: 57.73333333333333, tipo: 'incisivo' },
  { id: 84, posX: 43.44338866432057, posY: 69.39999999999998, tipo: 'incisivo' },
  { id: 83, posX: 41.008448343419815, posY: 78.06666666666666, tipo: 'canino' },
  { id: 82, posX: 38.36296508128051, posY: 83.26666666666667, tipo: 'molar' },
  { id: 81, posX: 32.83374673891603, posY: 85.73333333333333, tipo: 'molar' }
];

// Función para obtener la posición por defecto de un diente temporal
const getTemporaryToothPosition = (toothNumber) => {
  const diente = TEMPORARY_TEETH_POSITIONS.find(d => d.id === toothNumber);
  if (diente) {
    return { 
      posX: diente.posX, 
      posY: diente.posY, 
      rotation: 0,
      size: { width: 1, height: 1 }
    };
  }
  return { posX: 0, posY: 0, rotation: 0, size: { width: 1, height: 1 } };
};

async function updateTemporaryTeethPositions() {
  try {
    console.log('🦷 Iniciando actualización de posiciones de dientes temporales...');
    
    const db = mongoose.connection;
    const odontogramasCollection = db.collection('odontogramas');
    
    // Obtener todos los odontogramas
    const odontogramas = await odontogramasCollection.find({}).toArray();
    console.log(`📊 Total de odontogramas encontrados: ${odontogramas.length}`);
    
    let totalUpdated = 0;
    let totalTeethUpdated = 0;
    
    for (const odontograma of odontogramas) {
      console.log(`\n🔍 Procesando odontograma para paciente: ${odontograma.patient}`);
      
      let odontogramaUpdated = false;
      let teethUpdated = 0;
      
      for (const tooth of odontograma.teeth) {
        // Solo procesar dientes temporales (51-85)
        if (tooth.number >= 51 && tooth.number <= 85) {
          const defaultPosition = getTemporaryToothPosition(tooth.number);
          
          // Verificar si las posiciones actuales son diferentes a las correctas
          const positionsChanged = (
            Math.abs(tooth.posX - defaultPosition.posX) > 0.1 ||
            Math.abs(tooth.posY - defaultPosition.posY) > 0.1 ||
            tooth.rotation !== defaultPosition.rotation
          );
          
          if (positionsChanged) {
            console.log(`   🦷 Actualizando diente temporal ${tooth.number}:`);
            console.log(`      - Posición anterior: posX=${tooth.posX}, posY=${tooth.posY}, rotation=${tooth.rotation}`);
            console.log(`      - Nueva posición: posX=${defaultPosition.posX}, posY=${defaultPosition.posY}, rotation=${defaultPosition.rotation}`);
            
            // Actualizar el diente
            tooth.posX = defaultPosition.posX;
            tooth.posY = defaultPosition.posY;
            tooth.rotation = defaultPosition.rotation;
            tooth.size = defaultPosition.size;
            
            teethUpdated++;
            odontogramaUpdated = true;
          }
        }
      }
      
      if (odontogramaUpdated) {
        // Guardar el odontograma actualizado
        await odontogramasCollection.updateOne(
          { _id: odontograma._id },
          { $set: { teeth: odontograma.teeth } }
        );
        
        console.log(`   ✅ Odontograma actualizado: ${teethUpdated} dientes temporales modificados`);
        totalUpdated++;
        totalTeethUpdated += teethUpdated;
      } else {
        console.log('   ✅ Odontograma ya tiene las posiciones correctas para dientes temporales');
      }
    }
    
    console.log(`\n🎉 Proceso completado:`);
    console.log(`   - Odontogramas actualizados: ${totalUpdated}`);
    console.log(`   - Dientes temporales actualizados: ${totalTeethUpdated}`);
    console.log(`   - Posiciones simplificadas aplicadas exitosamente`);
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar el script
updateTemporaryTeethPositions(); 