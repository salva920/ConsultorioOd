const Odontograma = require('../models/Odontograma');
const Patient = require('../models/Patient');
const path = require('path');
const fs = require('fs');

// Obtener el odontograma de un paciente
exports.getOdontograma = async (req, res) => {
  try {
    const odontograma = await Odontograma.findOne({ patient: req.params.patientId });
    if (!odontograma) {
      return res.status(404).json({ message: 'Odontograma no encontrado' });
    }
    res.json(odontograma);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el odontograma', error: error.message });
  }
};

// Crear o actualizar el odontograma de un paciente
exports.saveOdontograma = async (req, res) => {
  try {
    console.log('🔍 Recibiendo datos del frontend para guardar:');
    console.log('   - Patient ID:', req.params.patientId);
    console.log('   - Teeth count:', req.body.teeth ? req.body.teeth.length : 0);
    
    if (req.body.teeth && req.body.teeth.length > 0) {
      console.log('   - Ejemplo de diente recibido:', req.body.teeth[0]);
    }

    const patient = await Patient.findById(req.params.patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    let odontograma = await Odontograma.findOne({ patient: req.params.patientId });
    
    if (odontograma) {
      // Actualizar odontograma existente
      console.log('📝 Actualizando odontograma existente...');
      console.log('   - Dientes antes de actualizar:', odontograma.teeth.length);
      
      odontograma.teeth = req.body.teeth;
      
      console.log('   - Dientes después de actualizar:', odontograma.teeth.length);
      if (odontograma.teeth.length > 0) {
        console.log('   - Ejemplo de diente guardado:', odontograma.teeth[0]);
      }
      
      try {
      await odontograma.save();
      console.log('✅ Odontograma actualizado exitosamente');
      } catch (error) {
        if (error.name === 'VersionError') {
          // Si hay conflicto de versión, usar findOneAndUpdate
          console.log('⚠️ Conflicto de versión detectado, usando findOneAndUpdate...');
          await Odontograma.findOneAndUpdate(
            { patient: req.params.patientId },
            { teeth: req.body.teeth },
            { new: true, runValidators: true }
          );
          console.log('✅ Odontograma actualizado exitosamente (resuelto conflicto de versión)');
        } else {
          throw error;
        }
      }
    } else {
      // Crear nuevo odontograma
      console.log('📝 Creando nuevo odontograma...');
      odontograma = new Odontograma({
        patient: req.params.patientId,
        teeth: req.body.teeth
      });
      await odontograma.save();
      console.log('✅ Nuevo odontograma creado exitosamente');
    }

    res.json(odontograma);
  } catch (error) {
    console.error('❌ Error al guardar odontograma:', error);
    res.status(500).json({ message: 'Error al guardar el odontograma', error: error.message });
  }
};

// Eliminar el odontograma de un paciente
exports.deleteOdontograma = async (req, res) => {
  try {
    const odontograma = await Odontograma.findOneAndDelete({ patient: req.params.patientId });
    if (!odontograma) {
      return res.status(404).json({ message: 'Odontograma no encontrado' });
    }
    res.json({ message: 'Odontograma eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el odontograma', error: error.message });
  }
};

// Subir imagen de referencia para el odontograma
exports.uploadReferenceImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
    }

    console.log('📤 Subiendo imagen de referencia:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Buscar o crear odontograma
    let odontograma = await Odontograma.findOne({ patient: req.params.patientId });
    
    if (!odontograma) {
      // Crear nuevo odontograma si no existe
      odontograma = new Odontograma({
        patient: req.params.patientId,
        teeth: []
      });
    }

    // Eliminar imagen anterior si existe
    if (odontograma.referenceImage && odontograma.referenceImage.path) {
      const oldImagePath = path.join(__dirname, '../../uploads', odontograma.referenceImage.filename);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log('🗑️ Imagen anterior eliminada:', odontograma.referenceImage.filename);
      }
    }

    // Guardar información de la nueva imagen
    odontograma.referenceImage = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadDate: new Date()
    };

    await odontograma.save();

    console.log('✅ Imagen de referencia guardada exitosamente');

    res.json({
      message: 'Imagen subida exitosamente',
      image: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        url: `/api/odontograma/${req.params.patientId}/reference-image`
      }
    });
  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    res.status(500).json({ message: 'Error al subir la imagen', error: error.message });
  }
};

// Obtener imagen de referencia del odontograma
exports.getReferenceImage = async (req, res) => {
  try {
    const odontograma = await Odontograma.findOne({ patient: req.params.patientId });
    
    if (!odontograma || !odontograma.referenceImage || !odontograma.referenceImage.filename) {
      return res.status(404).json({ message: 'Imagen de referencia no encontrada' });
    }

    const imagePath = path.join(__dirname, '../../uploads', odontograma.referenceImage.filename);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: 'Archivo de imagen no encontrado' });
    }

    // Configurar headers para la imagen
    res.setHeader('Content-Type', odontograma.referenceImage.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${odontograma.referenceImage.originalname}"`);
    
    // Enviar la imagen
    res.sendFile(imagePath);
  } catch (error) {
    console.error('❌ Error al obtener imagen:', error);
    res.status(500).json({ message: 'Error al obtener la imagen', error: error.message });
  }
};

// Subir imágenes de intervención
exports.uploadInterventionImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No se han subido imágenes' });
    }

    console.log('📤 Subiendo imágenes de intervención:', {
      patientId: req.params.patientId,
      interventionId: req.params.interventionId,
      filesCount: req.files.length
    });

    // Buscar el odontograma
    let odontograma = await Odontograma.findOne({ patient: req.params.patientId });
    
    if (!odontograma) {
      // Crear nuevo odontograma si no existe
      odontograma = new Odontograma({
        patient: req.params.patientId,
        teeth: []
      });
    }

    // Preparar información de las imágenes subidas
    const uploadedImages = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      uploadDate: new Date(),
      description: '',
      url: `/api/odontograma/${req.params.patientId}/interventions/${req.params.interventionId}/images/${file.filename}`
    }));

    console.log('✅ Imágenes de intervención subidas exitosamente');

    res.json({
      message: 'Imágenes subidas exitosamente',
      images: uploadedImages
    });
  } catch (error) {
    console.error('❌ Error al subir imágenes de intervención:', error);
    res.status(500).json({ message: 'Error al subir las imágenes', error: error.message });
  }
};

// Obtener imagen de intervención
exports.getInterventionImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../../uploads', filename);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }

    // Obtener tipo de archivo basado en la extensión
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(imagePath);
  } catch (error) {
    console.error('❌ Error al obtener imagen de intervención:', error);
    res.status(500).json({ message: 'Error al obtener la imagen', error: error.message });
  }
};

// Eliminar imagen de intervención
exports.deleteInterventionImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../../uploads', filename);
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log('🗑️ Imagen de intervención eliminada:', filename);
    }

    res.json({ message: 'Imagen eliminada exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar imagen de intervención:', error);
    res.status(500).json({ message: 'Error al eliminar la imagen', error: error.message });
  }
}; 