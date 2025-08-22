const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Verificar si la conexión fue exitosa
    if (conn.connection.readyState === 1) {
      console.log('MongoDB conectado exitosamente');
      console.log(`Base de datos: ${conn.connection.name}`);
      console.log(`Host: ${conn.connection.host || 'MongoDB Atlas'}`);
    } else {
      console.log('MongoDB conectado pero el estado no es óptimo');
    }
    
    return conn;
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    throw error;
  }
};

// Manejar eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('Mongoose conectado a la base de datos');
});

mongoose.connection.on('error', (err) => {
  console.error(`Error de conexión de Mongoose: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose desconectado');
});

// Manejar el cierre de la aplicación
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada debido a la terminación de la aplicación');
    process.exit(0);
  } catch (error) {
    console.error('Error al cerrar la conexión:', error);
    process.exit(1);
  }
});

module.exports = connectDB; 