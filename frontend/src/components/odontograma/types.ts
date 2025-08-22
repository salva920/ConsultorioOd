export interface InterventionImage {
  filename: string;
  data: string;
  contentType: string;
  uploadDate: string;
  description: string;
}

export interface Intervention {
  id: string;
  date: string;
  toothNumber: number;
  procedure: string;
  notes: string;
  status: 'completado' | 'pendiente' | 'cancelado';
  part?: 'todo' | 'superior' | 'inferior' | 'izquierda' | 'derecha' | 'centro';
  type?: string;
  images?: InterventionImage[];
}

export interface Tooth {
  id: string;
  number: number;
  condition: string;
  notes: string;
  interventions: Intervention[];
  type?: 'incisivo' | 'canino' | 'premolar' | 'molar';
  posX?: number;
  posY?: number;
  rotation?: number;
  size?: { width: number; height: number };
  cuadrante?: 'superior-derecho' | 'superior-izquierdo' | 'inferior-derecho' | 'inferior-izquierdo';
  tipoDentadura?: 'permanente' | 'temporal';
}

export interface OdontogramaProps {
  patientId: string;
  filterType?: 'permanente' | 'temporal';
}

// Configuración de posiciones para superponer cajas sobre la imagen de fondo
// Posiciones optimizadas del ajustador de posiciones para dientes permanentes y temporales
export const TODOS_LOS_DIENTES = [
  // === DIENTES PERMANENTES (11-48) ===
  
  // Cuadrante Superior Derecho (11-18) - Posiciones reales ajustadas
  { id: 11, posX: 387.65625, posY: 21.1875, tipo: 'incisivo', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 12, posX: 355.8125, posY: 34.546875, tipo: 'incisivo', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 13, posX: 332.9375, posY: 51.078125, tipo: 'canino', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 14, posX: 319.03125, posY: 81.578125, tipo: 'premolar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 15, posX: 310.15625, posY: 114.546875, tipo: 'premolar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 16, posX: 303.203125, posY: 154.828125, tipo: 'molar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 17, posX: 298.796875, posY: 198.140625, tipo: 'molar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 18, posX: 305.890625, posY: 245.609375, tipo: 'molar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },

  // Cuadrante Superior Izquierdo (21-28) - Posiciones reales ajustadas
  { id: 21, posX: 424.578125, posY: 24.25, tipo: 'incisivo', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 22, posX: 457.5625, posY: 37.546875, tipo: 'incisivo', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 23, posX: 484.046875, posY: 56.96875, tipo: 'canino', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 24, posX: 496.234375, posY: 81.78125, tipo: 'premolar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 25, posX: 505.671875, posY: 118.703125, tipo: 'premolar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 26, posX: 514.46875, posY: 157, tipo: 'molar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 27, posX: 518.234375, posY: 201.40625, tipo: 'molar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 28, posX: 508.5, posY: 250.359375, tipo: 'molar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },

  // Cuadrante Inferior Izquierdo (31-38) - Posiciones reales ajustadas
  { id: 31, posX: 428.921875, posY: 569.515625, tipo: 'molar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 32, posX: 463.796875, posY: 558.671875, tipo: 'molar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 33, posX: 487.03125, posY: 537.640625, tipo: 'premolar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 34, posX: 500.125, posY: 510.09375, tipo: 'premolar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 35, posX: 510.578125, posY: 475.828125, tipo: 'canino', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 36, posX: 517.5625, posY: 437.234375, tipo: 'canino', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 37, posX: 520.6875, posY: 395.109375, tipo: 'incisivo', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 38, posX: 514.125, posY: 345.5625, tipo: 'incisivo', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },

  // Cuadrante Inferior Derecho (41-48) - Posiciones reales ajustadas
  { id: 41, posX: 391.796875, posY: 571.078125, tipo: 'incisivo', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 42, posX: 360.140625, posY: 559.640625, tipo: 'incisivo', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 43, posX: 336.765625, posY: 539.515625, tipo: 'canino', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 44, posX: 323.109375, posY: 512.671875, tipo: 'premolar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 45, posX: 313.09375, posY: 478.421875, tipo: 'premolar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 46, posX: 305.84375, posY: 439.859375, tipo: 'molar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 47, posX: 304.15625, posY: 392.5625, tipo: 'molar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },
  { id: 48, posX: 308.828125, posY: 349.328125, tipo: 'molar', tipoDentadura: 'permanente', estado: {}, intervenciones: [], historial: [] },

  // === DIENTES TEMPORALES (51-85) ===
  
  // Dientes superiores izquierdos (61-65) - Posiciones reales ajustadas
  { id: 65, posX: 538.9375, posY: 216.125, tipo: 'molar', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 64, posX: 527.6875, posY: 155.953125, tipo: 'molar', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 63, posX: 503.578125, posY: 116.390625, tipo: 'canino', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 62, posX: 470.265625, posY: 86.21875, tipo: 'incisivo', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 61, posX: 427.9375, posY: 72.421875, tipo: 'incisivo', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },

  // Dientes superiores derechos (51-55) - Posiciones reales ajustadas
  { id: 55, posX: 286.359375, posY: 217.15625, tipo: 'molar', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 54, posX: 300.34375, posY: 153.71875, tipo: 'molar', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 53, posX: 318.3125, posY: 112.296875, tipo: 'canino', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 52, posX: 347.546875, posY: 84.390625, tipo: 'incisivo', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 51, posX: 385.28125, posY: 72.59375, tipo: 'incisivo', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },

  // Dientes inferiores izquierdos (71-75) - Posiciones reales ajustadas
  { id: 75, posX: 541.625, posY: 373.890625, tipo: 'incisivo', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 74, posX: 529.90625, posY: 435.765625, tipo: 'incisivo', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 73, posX: 507.09375, posY: 478.5625, tipo: 'canino', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 72, posX: 474.09375, posY: 510.125, tipo: 'molar', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 71, posX: 433.78125, posY: 522.53125, tipo: 'molar', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },

  // Dientes inferiores derechos (81-85) - Posiciones reales ajustadas
  { id: 85, posX: 291.140625, posY: 375.21875, tipo: 'incisivo', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 84, posX: 301.9375, posY: 436.890625, tipo: 'incisivo', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 83, posX: 321.5, posY: 481.5625, tipo: 'canino', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 82, posX: 388.859375, posY: 523.765625, tipo: 'molar', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] },
  { id: 81, posX: 351.828125, posY: 511.71875, tipo: 'molar', tipoDentadura: 'temporal', estado: {}, intervenciones: [], historial: [] }
];

// Configuración de tipos de dientes temporales
export const TOOTH_TYPES = {
  // Temporales (51-85)
  51: 'incisivo', 52: 'incisivo', 53: 'canino', 54: 'molar', 55: 'molar',
  61: 'incisivo', 62: 'incisivo', 63: 'canino', 64: 'molar', 65: 'molar',
  71: 'molar', 72: 'molar', 73: 'canino', 74: 'incisivo', 75: 'incisivo',
  81: 'molar', 82: 'molar', 83: 'canino', 84: 'incisivo', 85: 'incisivo'
} as const;

// Función para obtener la posición de un diente desde la configuración simplificada
export const getToothPosition = (number: number): { posX: number; posY: number } => {
  const diente = TODOS_LOS_DIENTES.find(d => d.id === number);
  if (diente) {
    return { posX: diente.posX, posY: diente.posY };
  }
  return { posX: 0, posY: 0 };
};

// Función para obtener el tipo de diente
export const getToothType = (number: number): 'incisivo' | 'canino' | 'premolar' | 'molar' => {
  const diente = TODOS_LOS_DIENTES.find(d => d.id === number);
  if (diente) {
    return diente.tipo as 'incisivo' | 'canino' | 'premolar' | 'molar';
  }
  return 'incisivo';
};

// Función para obtener el cuadrante de un diente temporal
export const getToothCuadrante = (number: number): 'superior-derecho' | 'superior-izquierdo' | 'inferior-derecho' | 'inferior-izquierdo' => {
  // Temporales
  if (number >= 51 && number <= 55) return 'superior-derecho';
  if (number >= 61 && number <= 65) return 'superior-izquierdo';
  if (number >= 81 && number <= 85) return 'inferior-derecho';
  if (number >= 71 && number <= 75) return 'inferior-izquierdo';
  return 'superior-derecho';
};

// Función para determinar si es dentadura temporal
export const getTipoDentadura = (number: number): 'permanente' | 'temporal' => {
  const diente = TODOS_LOS_DIENTES.find(d => d.id === number);
  if (diente) {
    return diente.tipoDentadura as 'permanente' | 'temporal';
  }
  return 'temporal'; // Por defecto temporal para este sistema
};

// Función para filtrar dientes por tipo de dentadura
export const getTeethByType = (tipoDentadura: 'permanente' | 'temporal'): typeof TODOS_LOS_DIENTES => {
  return TODOS_LOS_DIENTES.filter(diente => diente.tipoDentadura === tipoDentadura);
};

// Función simplificada para calcular el ángulo de rotación
export const getToothRotation = (number: number): number => {
  // Para dientes temporales, usar rotación mínima o nula
  return 0;
};
