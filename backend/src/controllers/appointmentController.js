const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const reminderService = require('../services/reminderService');

// Obtener todas las citas
exports.getAllAppointments = async (req, res) => {
  try {
    const { date, status, limit, sort } = req.query;
    
    let query = Appointment.findWithPatient();
    
    // Filtrar por fecha si se especifica
    if (date) {
      query = query.where('date').gte(new Date(date)).lt(new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000));
    }
    
    // Filtrar por estado si se especifica
    if (status && status !== 'all') {
      query = query.where('status').equals(status);
    }
    
    // Aplicar límite si se especifica
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    // Aplicar ordenamiento si se especifica
    if (sort) {
      query = query.sort(sort);
    }
    
    const appointments = await query.exec();
    
    // Transformar los datos para el frontend
    const transformedAppointments = appointments
      .filter(appointment => appointment.patientId) // Filtrar citas sin paciente
      .map(appointment => ({
      _id: appointment._id,
      patientId: appointment.patientId._id,
      patient: {
        _id: appointment.patientId._id,
        nombre: appointment.patientId.nombre,
        apellido: appointment.patientId.apellido,
        email: appointment.patientId.email,
        telefono: appointment.patientId.telefono,
        cedula: appointment.patientId.cedula
      },
      date: appointment.date,
      time: appointment.date.toTimeString().substring(0, 5),
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    }));

    res.json(transformedAppointments);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Obtener una cita por ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'nombre apellido email telefono cedula');

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    if (!appointment.patientId) {
      return res.status(400).json({ message: 'La cita no tiene un paciente asociado válido' });
    }

    const transformedAppointment = {
      _id: appointment._id,
      patientId: appointment.patientId._id,
      patient: {
        _id: appointment.patientId._id,
        nombre: appointment.patientId.nombre,
        apellido: appointment.patientId.apellido,
        email: appointment.patientId.email,
        telefono: appointment.patientId.telefono,
        cedula: appointment.patientId.cedula
      },
      date: appointment.date,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    };

    res.json(transformedAppointment);
  } catch (error) {
    console.error('Error al obtener cita:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Crear una nueva cita
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, date, status, notes } = req.body;

    // Validar campos requeridos
    if (!patientId || !date) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        details: {
          patientId: !patientId ? 'El ID del paciente es requerido' : null,
          date: !date ? 'La fecha es requerida' : null
        }
      });
    }

    // Verificar que el paciente existe
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    // Crear la fecha combinando fecha y hora si se proporciona
    let appointmentDate = new Date(date);
    
    // Si se proporciona una hora específica, combinarla con la fecha
    if (req.body.time) {
      const [hours, minutes] = req.body.time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    // Verificar que la fecha no sea en el pasado
    if (appointmentDate <= new Date()) {
      return res.status(400).json({ 
        message: 'La fecha de la cita debe ser futura' 
      });
    }

    // Verificar si ya existe una cita para el mismo paciente en la misma fecha/hora
    const existingAppointment = await Appointment.findOne({
      patientId,
      date: {
        $gte: new Date(appointmentDate.getTime() - 30 * 60000), // 30 minutos antes
        $lte: new Date(appointmentDate.getTime() + 30 * 60000)  // 30 minutos después
      },
      status: { $ne: 'CANCELLED' }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        message: 'Ya existe una cita para este paciente en el horario seleccionado' 
      });
    }

    const appointment = new Appointment({
      patientId,
      date: appointmentDate,
      status: status || 'SCHEDULED',
      notes: notes || ''
    });

    const savedAppointment = await appointment.save();
    
    // Obtener la cita con información del paciente
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('patientId', 'nombre apellido email telefono cedula');

    const transformedAppointment = {
      _id: populatedAppointment._id,
      patientId: populatedAppointment.patientId._id,
      patient: {
        _id: populatedAppointment.patientId._id,
        nombre: populatedAppointment.patientId.nombre,
        apellido: populatedAppointment.patientId.apellido,
        email: populatedAppointment.patientId.email,
        telefono: populatedAppointment.patientId.telefono,
        cedula: populatedAppointment.patientId.cedula
      },
      date: populatedAppointment.date,
      status: populatedAppointment.status,
      notes: populatedAppointment.notes,
      createdAt: populatedAppointment.createdAt,
      updatedAt: populatedAppointment.updatedAt
    };

    // Crear recordatorios automáticamente para la nueva cita
    try {
      await reminderService.createRemindersForAppointment(
        savedAppointment._id,
        patientId,
        appointmentDate
      );
      console.log(`Recordatorios creados automáticamente para cita ${savedAppointment._id}`);
    } catch (reminderError) {
      console.error('Error al crear recordatorios automáticos:', reminderError);
      // No fallar la creación de la cita si fallan los recordatorios
    }

    res.status(201).json({
      message: 'Cita creada exitosamente',
      appointment: transformedAppointment
    });
  } catch (error) {
    console.error('Error al crear cita:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Actualizar una cita
exports.updateAppointment = async (req, res) => {
  try {
    const { patientId, date, status, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    // Si se está actualizando la fecha, verificar que sea futura
    if (date) {
      let appointmentDate = new Date(date);
      
      if (req.body.time) {
        const [hours, minutes] = req.body.time.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      if (appointmentDate <= new Date()) {
        return res.status(400).json({ 
          message: 'La fecha de la cita debe ser futura' 
        });
      }

      // Verificar conflicto de horarios solo si se está cambiando la fecha
      if (appointmentDate.getTime() !== appointment.date.getTime()) {
        const existingAppointment = await Appointment.findOne({
          patientId: patientId || appointment.patientId,
          date: {
            $gte: new Date(appointmentDate.getTime() - 30 * 60000),
            $lte: new Date(appointmentDate.getTime() + 30 * 60000)
          },
          status: { $ne: 'CANCELLED' },
          _id: { $ne: req.params.id }
        });

        if (existingAppointment) {
          return res.status(400).json({ 
            message: 'Ya existe una cita para este paciente en el horario seleccionado' 
          });
        }
      }
    }

    // Actualizar solo los campos proporcionados
    const updateData = {};
    if (patientId !== undefined) updateData.patientId = patientId;
    if (date !== undefined) {
      let appointmentDate = new Date(date);
      if (req.body.time) {
        const [hours, minutes] = req.body.time.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      updateData.date = appointmentDate;
    }
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'nombre apellido email telefono cedula');

    const transformedAppointment = {
      _id: updatedAppointment._id,
      patientId: updatedAppointment.patientId._id,
      patient: {
        _id: updatedAppointment.patientId._id,
        nombre: updatedAppointment.patientId.nombre,
        apellido: updatedAppointment.patientId.apellido,
        email: updatedAppointment.patientId.email,
        telefono: updatedAppointment.patientId.telefono,
        cedula: updatedAppointment.patientId.cedula
      },
      date: updatedAppointment.date,
      status: updatedAppointment.status,
      notes: updatedAppointment.notes,
      createdAt: updatedAppointment.createdAt,
      updatedAt: updatedAppointment.updatedAt
    };

    // Si se cambió la fecha, actualizar los recordatorios
    if (date && appointment.date.getTime() !== updatedAppointment.date.getTime()) {
      try {
        // Cancelar recordatorios existentes
        await reminderService.cancelRemindersForAppointment(updatedAppointment._id);
        
        // Crear nuevos recordatorios con la nueva fecha
        await reminderService.createRemindersForAppointment(
          updatedAppointment._id,
          updatedAppointment.patientId._id,
          updatedAppointment.date
        );
        console.log(`Recordatorios actualizados para cita ${updatedAppointment._id}`);
      } catch (reminderError) {
        console.error('Error al actualizar recordatorios:', reminderError);
        // No fallar la actualización de la cita si fallan los recordatorios
      }
    }

    res.json({
      message: 'Cita actualizada exitosamente',
      appointment: transformedAppointment
    });
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Eliminar una cita
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    // Cancelar recordatorios de la cita eliminada
    try {
      await reminderService.cancelRemindersForAppointment(req.params.id);
      console.log(`Recordatorios cancelados para cita ${req.params.id}`);
    } catch (reminderError) {
      console.error('Error al cancelar recordatorios:', reminderError);
      // No fallar la eliminación de la cita si fallan los recordatorios
    }

    res.json({ message: 'Cita eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Obtener estadísticas de citas
exports.getAppointmentStats = async (req, res) => {
  try {
    const stats = await Appointment.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Obtener citas por fecha
exports.getAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const appointments = await Appointment.findByDate(date);
    
    const transformedAppointments = appointments.map(appointment => ({
      _id: appointment._id,
      patientId: appointment.patientId._id,
      patient: {
        _id: appointment.patientId._id,
        nombre: appointment.patientId.nombre,
        apellido: appointment.patientId.apellido,
        email: appointment.patientId.email,
        telefono: appointment.patientId.telefono,
        cedula: appointment.patientId.cedula
      },
      date: appointment.date,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    }));

    res.json(transformedAppointments);
  } catch (error) {
    console.error('Error al obtener citas por fecha:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

// Obtener citas por estado
exports.getAppointmentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const appointments = await Appointment.findByStatus(status);
    
    const transformedAppointments = appointments.map(appointment => ({
      _id: appointment._id,
      patientId: appointment.patientId._id,
      patient: {
        _id: appointment.patientId._id,
        nombre: appointment.patientId.nombre,
        apellido: appointment.patientId.apellido,
        email: appointment.patientId.email,
        telefono: appointment.patientId.telefono,
        cedula: appointment.patientId.cedula
      },
      date: appointment.date,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    }));

    res.json(transformedAppointments);
  } catch (error) {
    console.error('Error al obtener citas por estado:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
}; 