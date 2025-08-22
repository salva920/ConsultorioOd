const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  toothNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 85
  },
  procedure: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['completado', 'pendiente', 'cancelado'],
    default: 'pendiente'
  },
  part: {
    type: String,
    enum: ['todo', 'superior', 'inferior', 'izquierda', 'derecha', 'centro'],
    default: 'todo'
  },
  type: {
    type: String,
    default: ''
  },
  images: [{
    filename: {
      type: String,
      required: true
    },
    originalname: {
      type: String,
      default: ''
    },
    data: {
      type: String, // Base64 encoded image (para compatibilidad)
      required: false // Ya no es requerido para archivos en servidor
    },
    contentType: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      default: ''
    },
    // Nuevos campos para archivos en servidor
    isServerFile: {
      type: Boolean,
      default: false // true si está en servidor, false si es Base64
    },
    serverPath: {
      type: String, // Ruta del archivo en el servidor
      default: ''
    },
    url: {
      type: String, // URL para acceder a la imagen
      default: ''
    },
    size: {
      type: Number,
      default: 0
    }
  }]
});

const toothSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    min: 1,
    max: 85
  },
  condition: {
    type: String,
    required: true,
    enum: ['sano', 'caries', 'restaurado', 'ausente', 'extraccion', 'endodoncia', 'corona', 'implante'],
    default: 'sano'
  },
  notes: {
    type: String,
    default: ''
  },
  interventions: [interventionSchema]
});

const odontogramaSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  teeth: [toothSchema],
  referenceImage: {
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt
odontogramaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Odontograma', odontogramaSchema); 