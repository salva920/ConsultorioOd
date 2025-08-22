const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Conectado a la base de datos');
    
    try {
      // Eliminar todas las colecciones
      const collections = await mongoose.connection.db.collections();
      
      for (let collection of collections) {
        await collection.drop();
        console.log(`Colección ${collection.collectionName} eliminada`);
      }
      
      console.log('Base de datos limpiada exitosamente');
    } catch (error) {
      console.error('Error al limpiar la base de datos:', error);
    } finally {
      // Cerrar la conexión
      await mongoose.connection.close();
      console.log('Conexión cerrada');
    }
  })
  .catch(error => {
    console.error('Error al conectar a la base de datos:', error);
  }); 