import mongoose from 'mongoose';

const interventionSchema = new mongoose.Schema({
  toothNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 32
  },
  condition: {
    type: String,
    enum: ['Sano', 'Caries', 'Restaurado', 'Extraído', 'Endodoncia', 'Corona', 'Implante'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  images: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    data: String // Base64 encoded image
  }],
  notes: {
    type: String,
    trim: true
  }
});

const odontogramaSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  referenceImage: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },
  teeth: [interventionSchema],
  notes: {
    type: String,
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
odontogramaSchema.index({ patientId: 1 });
odontogramaSchema.index({ 'teeth.toothNumber': 1 });

export default mongoose.models.Odontograma || mongoose.model('Odontograma', odontogramaSchema); 