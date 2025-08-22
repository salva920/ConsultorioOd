const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// Obtener estadísticas del dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Fecha actual
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Fecha de hoy en formato YYYY-MM-DD
    const todayString = today.toISOString().split('T')[0];

    // Estadísticas de pacientes
    const totalPatients = await Patient.countDocuments();
    const newPatientsThisMonth = await Patient.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Calcular edad promedio
    const patientsWithAge = await Patient.find({ edad: { $exists: true, $ne: null } });
    const averageAge = patientsWithAge.length > 0 
      ? Math.round(patientsWithAge.reduce((sum, patient) => sum + patient.edad, 0) / patientsWithAge.length)
      : 0;

    // Estadísticas de citas
    const totalAppointments = await Appointment.countDocuments();
    const todayAppointments = await Appointment.countDocuments({ date: todayString });
    const pendingAppointments = await Appointment.countDocuments({ status: 'SCHEDULED' });
    const completedAppointments = await Appointment.countDocuments({ 
      status: 'COMPLETED',
      date: { $gte: startOfMonth.toISOString().split('T')[0] }
    });
    const cancelledAppointments = await Appointment.countDocuments({ 
      status: 'CANCELLED',
      date: { $gte: startOfMonth.toISOString().split('T')[0] }
    });

    const stats = {
      totalPatients,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,
      newPatientsThisMonth,
      averageAge
    };

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getDashboardStats
}; 