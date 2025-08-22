const express = require('express');
const router = express.Router();
const odontogramaController = require('../controllers/odontogramaController');
const upload = require('../middleware/upload');

// Rutas para el odontograma
router.get('/:patientId', odontogramaController.getOdontograma);
router.post('/:patientId', odontogramaController.saveOdontograma);
router.delete('/:patientId', odontogramaController.deleteOdontograma);

// Rutas para upload de imágenes
router.post('/:patientId/upload-image', upload.single('image'), odontogramaController.uploadReferenceImage);
router.get('/:patientId/reference-image', odontogramaController.getReferenceImage);

// Rutas para imágenes de intervenciones
router.post('/:patientId/interventions/:interventionId/upload-images', upload.array('images', 5), odontogramaController.uploadInterventionImages);
router.get('/:patientId/interventions/:interventionId/images/:filename', odontogramaController.getInterventionImage);
router.delete('/:patientId/interventions/:interventionId/images/:filename', odontogramaController.deleteInterventionImage);

module.exports = router; 