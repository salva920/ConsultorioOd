const Diagnostico = require('../models/Diagnostico');
const Patient = require('../models/Patient');

// Obtener todos los diagnósticos de un paciente
exports.getDiagnosticosByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    const diagnosticos = await Diagnostico.find({ patient: patientId })
      .sort({ fecha: -1 });

    res.json(diagnosticos);
  } catch (error) {
    console.error('Error al obtener diagnósticos:', error);
    res.status(500).json({ 
      message: 'Error al obtener los diagnósticos', 
      error: error.message 
    });
  }
};

// Crear un nuevo diagnóstico
exports.createDiagnostico = async (req, res) => {
  try {
    const { patientId } = req.params;
    const diagnosticoData = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    const diagnostico = new Diagnostico({
      patient: patientId,
      ...diagnosticoData
    });

    await diagnostico.save();

    res.status(201).json(diagnostico);
  } catch (error) {
    console.error('Error al crear diagnóstico:', error);
    res.status(500).json({ 
      message: 'Error al crear el diagnóstico', 
      error: error.message 
    });
  }
};

// Crear múltiples diagnósticos
exports.createMultipleDiagnosticos = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { diagnosticos } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    if (!Array.isArray(diagnosticos)) {
      return res.status(400).json({ message: 'Los diagnósticos deben ser un array' });
    }

    const diagnosticosToSave = diagnosticos.map(diagnostico => ({
      patient: patientId,
      ...diagnostico
    }));

    const savedDiagnosticos = await Diagnostico.insertMany(diagnosticosToSave);

    res.status(201).json(savedDiagnosticos);
  } catch (error) {
    console.error('Error al crear múltiples diagnósticos:', error);
    res.status(500).json({ 
      message: 'Error al crear los diagnósticos', 
      error: error.message 
    });
  }
};

// Actualizar un diagnóstico
exports.updateDiagnostico = async (req, res) => {
  try {
    const { diagnosticoId } = req.params;
    const updateData = req.body;

    const diagnostico = await Diagnostico.findByIdAndUpdate(
      diagnosticoId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!diagnostico) {
      return res.status(404).json({ message: 'Diagnóstico no encontrado' });
    }

    res.json(diagnostico);
  } catch (error) {
    console.error('Error al actualizar diagnóstico:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el diagnóstico', 
      error: error.message 
    });
  }
};

// Eliminar un diagnóstico
exports.deleteDiagnostico = async (req, res) => {
  try {
    const { diagnosticoId } = req.params;

    const diagnostico = await Diagnostico.findByIdAndDelete(diagnosticoId);

    if (!diagnostico) {
      return res.status(404).json({ message: 'Diagnóstico no encontrado' });
    }

    res.json({ message: 'Diagnóstico eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar diagnóstico:', error);
    res.status(500).json({ 
      message: 'Error al eliminar el diagnóstico', 
      error: error.message 
    });
  }
}; 