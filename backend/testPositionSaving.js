const mongoose = require('mongoose');
require('dotenv').config();

// Configuración de la base de datos usando la variable de entorno
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odontograma';

// Conectar a MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', async () => {
  console.log('Conectado a MongoDB');
  
  try {
    // Obtener la colección de odontogramas
    const odontogramaCollection = db.collection('odontogramas');
    
    // Obtener todos los odontogramas
    const odontogramas = await odontogramaCollection.find({}).toArray();
    
    console.log(`Encontrados ${odontogramas.length} odontogramas`);
    
    if (odontogramas.length === 0) {
      console.log('No hay odontogramas para probar. Creando uno de prueba...');
      
      // Crear un odontograma de prueba
      const testOdontograma = {
        patient: new mongoose.Types.ObjectId(),
        teeth: [
          {
            number: 11,
            condition: 'sano',
            notes: 'Diente de prueba',
            posX: 280,
            posY: 90,
            rotation: 15,
            size: { width: 1.2, height: 1.1 },
            interventions: []
          },
          {
            number: 12,
            condition: 'sano',
            notes: 'Diente de prueba 2',
            posX: 260,
            posY: 90,
            rotation: -10,
            size: { width: 0.9, height: 1.0 },
            interventions: []
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await odontogramaCollection.insertOne(testOdontograma);
      console.log('✅ Odontograma de prueba creado');
      
      // Actualizar el array para incluir el nuevo odontograma
      odontogramas.push(testOdontograma);
    }
    
    // Probar cada odontograma
    for (const odontograma of odontogramas) {
      console.log(`\n📋 Probando odontograma: ${odontograma._id}`);
      
      if (odontograma.teeth && Array.isArray(odontograma.teeth)) {
        console.log(`   - Dientes encontrados: ${odontograma.teeth.length}`);
        
        // Verificar que cada diente tenga los campos necesarios
        for (const tooth of odontograma.teeth) {
          console.log(`   - Diente ${tooth.number}:`);
          console.log(`     posX: ${tooth.posX || 'NO DEFINIDO'}`);
          console.log(`     posY: ${tooth.posY || 'NO DEFINIDO'}`);
          console.log(`     rotation: ${tooth.rotation || 'NO DEFINIDO'}`);
          console.log(`     size: ${JSON.stringify(tooth.size) || 'NO DEFINIDO'}`);
          
          // Verificar que los campos estén presentes
          const hasPosition = tooth.posX !== undefined && tooth.posY !== undefined;
          const hasRotation = tooth.rotation !== undefined;
          const hasSize = tooth.size && typeof tooth.size === 'object';
          
          if (!hasPosition) {
            console.log(`     ⚠️  ADVERTENCIA: Diente ${tooth.number} no tiene posiciones definidas`);
          }
          if (!hasRotation) {
            console.log(`     ⚠️  ADVERTENCIA: Diente ${tooth.number} no tiene rotación definida`);
          }
          if (!hasSize) {
            console.log(`     ⚠️  ADVERTENCIA: Diente ${tooth.number} no tiene tamaño definido`);
          }
          
          if (hasPosition && hasRotation && hasSize) {
            console.log(`     ✅ Diente ${tooth.number} tiene todos los campos necesarios`);
          }
        }
        
        // Simular una actualización de posiciones
        console.log('   🔧 Simulando actualización de posiciones...');
        
        const updatedTeeth = odontograma.teeth.map(tooth => ({
          ...tooth,
          posX: (tooth.posX || 0) + 10, // Mover 10px a la derecha
          posY: (tooth.posY || 0) + 5,  // Mover 5px hacia abajo
          rotation: (tooth.rotation || 0) + 5, // Rotar 5 grados más
          size: {
            width: (tooth.size?.width || 1) * 1.1, // Aumentar 10% el ancho
            height: (tooth.size?.height || 1) * 1.1 // Aumentar 10% el alto
          }
        }));
        
        // Actualizar en la base de datos
        await odontogramaCollection.updateOne(
          { _id: odontograma._id },
          { 
            $set: { 
              teeth: updatedTeeth,
              updatedAt: new Date()
            } 
          }
        );
        
        console.log('   ✅ Posiciones actualizadas en la base de datos');
        
        // Verificar que se guardó correctamente
        const updatedOdontograma = await odontogramaCollection.findOne({ _id: odontograma._id });
        
        if (updatedOdontograma && updatedOdontograma.teeth) {
          console.log('   📊 Verificando que los cambios se guardaron:');
          
          for (const tooth of updatedOdontograma.teeth) {
            console.log(`     - Diente ${tooth.number}:`);
            console.log(`       posX: ${tooth.posX} (debería ser ${(odontograma.teeth.find(t => t.number === tooth.number)?.posX || 0) + 10})`);
            console.log(`       posY: ${tooth.posY} (debería ser ${(odontograma.teeth.find(t => t.number === tooth.number)?.posY || 0) + 5})`);
            console.log(`       rotation: ${tooth.rotation} (debería ser ${(odontograma.teeth.find(t => t.number === tooth.number)?.rotation || 0) + 5})`);
            console.log(`       size: ${JSON.stringify(tooth.size)}`);
          }
        }
      } else {
        console.log('   ⚠️  Odontograma sin dientes o estructura incorrecta');
      }
    }
    
    console.log('\n🎉 Prueba de guardado completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
  }
}); 