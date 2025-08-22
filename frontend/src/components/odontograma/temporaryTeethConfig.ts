export interface TemporaryToothConfig {
  id: string;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

// Configuración de dientes temporales detectados automáticamente
export const TEMPORARY_TEETH_CONFIG: TemporaryToothConfig[] = [
  // Dientes superiores izquierdos (61-65)
  { id: '61', number: 61, x: 0.0, y: 0.0, width: 99.9, height: 99.9 }, // Este parece ser un error de detección
  { id: '62', number: 62, x: 35.2, y: 8.8, width: 6.9, height: 8.0 },
  { id: '63', number: 63, x: 26.5, y: 20.9, width: 8.7, height: 9.5 },
  { id: '64', number: 64, x: 24.7, y: 31.1, width: 8.4, height: 10.5 },
  { id: '65', number: 65, x: 42.8, y: 6.8, width: 6.8, height: 7.6 },

  // Dientes superiores derechos (51-55)
  { id: '51', number: 51, x: 50.6, y: 7.0, width: 6.9, height: 7.6 },
  { id: '52', number: 52, x: 58.4, y: 9.4, width: 6.8, height: 7.6 },
  { id: '53', number: 53, x: 63.1, y: 14.3, width: 6.9, height: 7.3 },
  { id: '54', number: 54, x: 66.3, y: 20.9, width: 9.1, height: 9.7 },
  { id: '55', number: 55, x: 68.8, y: 31.1, width: 8.4, height: 10.5 },

  // Dientes inferiores izquierdos (71-75)
  { id: '71', number: 71, x: 25.1, y: 58.4, width: 8.4, height: 10.5 },
  { id: '72', number: 72, x: 26.9, y: 69.6, width: 8.7, height: 9.5 },
  { id: '73', number: 73, x: 31.2, y: 78.9, width: 7.1, height: 7.2 },
  { id: '74', number: 74, x: 35.6, y: 83.3, width: 6.9, height: 8.0 },
  { id: '75', number: 75, x: 43.1, y: 85.7, width: 6.9, height: 7.6 },

  // Dientes inferiores derechos (81-85)
  { id: '81', number: 81, x: 69.2, y: 58.4, width: 8.4, height: 10.5 },
  { id: '82', number: 82, x: 66.8, y: 69.4, width: 9.0, height: 9.7 },
  { id: '83', number: 83, x: 63.5, y: 78.4, width: 6.9, height: 7.4 },
  { id: '84', number: 84, x: 58.8, y: 83.1, width: 6.8, height: 7.6 },
  { id: '85', number: 85, x: 51.0, y: 85.4, width: 6.8, height: 7.6 },
];

// Función para obtener la configuración de un diente específico
export const getTemporaryToothConfig = (toothNumber: number): TemporaryToothConfig | undefined => {
  return TEMPORARY_TEETH_CONFIG.find(tooth => tooth.number === toothNumber);
};

// Función para obtener todos los dientes temporales
export const getAllTemporaryTeeth = (): TemporaryToothConfig[] => {
  return TEMPORARY_TEETH_CONFIG;
};

// Función para actualizar la configuración
export const updateTemporaryTeethConfig = (newConfig: TemporaryToothConfig[]) => {
  // En una implementación real, esto guardaría en localStorage o en el backend
  console.log('Configuración actualizada:', newConfig);
  return newConfig;
}; 