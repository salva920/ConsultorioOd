const Patient = require('../models/Patient');
const Odontograma = require('../models/Odontograma');

// Obtener todos los pacientes
exports.getPatients = async (req, res) => {
  try {
    const { limit, sort } = req.query;
    
    let query = Patient.find();
    
    // Aplicar límite si se especifica
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    // Aplicar ordenamiento si se especifica
    if (sort) {
      query = query.sort(sort);
    }
    
    const patients = await query.exec();
    res.json(patients);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener un paciente por ID
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo paciente
exports.createPatient = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);

    const {
      tipo_cedula,
      cedula,
      nombre,
      apellido,
      fecha_nacimiento,
      edad,
      sexo,
      email,
      telefono,
      direccion,
      enfermedad_actual,
      antecedentes_personales,
      antecedentes_familiares,
      tipo_consulta,
      motivo_consulta
    } = req.body;

    // Validar campos requeridos
    const camposRequeridos = {
      tipo_cedula: 'El tipo de cédula es requerido',
      cedula: 'La cédula es requerida',
      nombre: 'El nombre es requerido',
      apellido: 'El apellido es requerido',
      fecha_nacimiento: 'La fecha de nacimiento es requerida',
      edad: 'La edad es requerida',
      sexo: 'El sexo es requerido',
      telefono: 'El teléfono es requerido',
      direccion: 'La dirección es requerida',
      tipo_consulta: 'El tipo de consulta es requerido',
      motivo_consulta: 'El motivo de la consulta es requerido'
    };

    const errores = {};
    let hayErrores = false;

    Object.entries(camposRequeridos).forEach(([campo, mensaje]) => {
      if (!req.body[campo]) {
        errores[campo] = mensaje;
        hayErrores = true;
      }
    });

    if (hayErrores) {
      console.log('Errores de validación:', errores);
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        details: errores
      });
    }

    // Crear el nuevo paciente
    const patient = new Patient({
      tipo_cedula,
      cedula,
      nombre,
      apellido,
      fecha_nacimiento,
      edad: Number(edad),
      sexo,
      email,
      telefono,
      direccion,
      enfermedad_actual,
      antecedentes_personales,
      antecedentes_familiares,
      tipo_consulta,
      motivo_consulta
    });

    console.log('Paciente a crear:', patient);

    const savedPatient = await patient.save();
    console.log('Paciente creado:', savedPatient);

    // Crear odontograma inicial
    const teeth = Array.from({ length: 32 }, (_, i) => ({
      number: i + 1,
      condition: 'sano',
      interventions: []
    }));

    const odontograma = new Odontograma({
      patient: savedPatient._id,
      teeth
    });

    await odontograma.save();
    console.log('Odontograma inicial creado para el paciente:', savedPatient._id);

    res.status(201).json(savedPatient);
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(400).json({
      message: 'Error al crear el paciente',
      details: error.message
    });
  }
};

// Actualizar un paciente
exports.updatePatient = async (req, res) => {
  try {
    console.log('Datos recibidos para actualización:', req.body);

    const {
      tipo_cedula,
      cedula,
      nombre,
      apellido,
      fecha_nacimiento,
      edad,
      sexo,
      email,
      telefono,
      direccion,
      enfermedad_actual,
      antecedentes_personales,
      antecedentes_familiares,
      tipo_consulta,
      motivo_consulta
    } = req.body;

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    // Actualizar solo los campos proporcionados
    if (tipo_cedula) patient.tipo_cedula = tipo_cedula;
    if (cedula) patient.cedula = cedula;
    if (nombre) patient.nombre = nombre;
    if (apellido) patient.apellido = apellido;
    if (fecha_nacimiento) patient.fecha_nacimiento = fecha_nacimiento;
    if (edad) patient.edad = Number(edad);
    if (sexo) patient.sexo = sexo;
    if (email) patient.email = email;
    if (telefono) patient.telefono = telefono;
    if (direccion) patient.direccion = direccion;
    if (enfermedad_actual) patient.enfermedad_actual = enfermedad_actual;
    if (antecedentes_personales) patient.antecedentes_personales = antecedentes_personales;
    if (antecedentes_familiares) patient.antecedentes_familiares = antecedentes_familiares;
    if (tipo_consulta) patient.tipo_consulta = tipo_consulta;
    if (motivo_consulta) patient.motivo_consulta = motivo_consulta;

    console.log('Paciente a actualizar:', patient);

    const updatedPatient = await patient.save();
    console.log('Paciente actualizado:', updatedPatient);
    res.json(updatedPatient);
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(400).json({
      message: 'Error al actualizar el paciente',
      details: error.message
    });
  }
};

// Eliminar un paciente
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    await patient.deleteOne();
    res.json({ message: 'Paciente eliminado' });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({ message: error.message });
  }
}; 