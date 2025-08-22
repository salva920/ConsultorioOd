const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./src/config/db');
const patientRoutes = require('./src/routes/patients');
const odontogramaRoutes = require('./src/routes/odontogramaRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const reminderRoutes = require('./src/routes/reminderRoutes');
const diagnosticoRoutes = require('./src/routes/diagnosticoRoutes');
const reminderService = require('./src/services/reminderService');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conectar a la base de datos
connectDB();

// Rutas
app.use('/api/patients', patientRoutes);
app.use('/api/odontograma', odontogramaRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/diagnosticos', diagnosticoRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Health check para despliegue
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Error en el servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  
  // Iniciar el servicio de recordatorios
  try {
    reminderService.start();
    console.log('✅ Servicio de recordatorios iniciado correctamente');
  } catch (error) {
    console.error('❌ Error al iniciar servicio de recordatorios:', error);
  }
}); 