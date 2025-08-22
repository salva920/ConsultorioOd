// Configuración de optimizaciones para el odontograma
export const ODONTOGRAMA_OPTIMIZATIONS = {
  // Configuración de lazy loading
  LAZY_LOADING: {
    INITIAL_QUADRANT: 'superior-derecho',
    ADJACENT_QUADRANTS_DELAY: 500, // ms
    INTERSECTION_THRESHOLD: 0.1,
    ROOT_MARGIN: '100px',
  },

  // Configuración de cache
  CACHE: {
    QUADRANT_CACHE_SIZE: 4,
    TEETH_CACHE_TTL: 5 * 60 * 1000, // 5 minutos
    DIAGNOSTICOS_CACHE_TTL: 10 * 60 * 1000, // 10 minutos
  },

  // Configuración de debounce
  DEBOUNCE: {
    SAVE_DELAY: 1000, // 1 segundo
    SEARCH_DELAY: 300, // 300ms
    POSITION_UPDATE_DELAY: 500, // 500ms
  },

  // Configuración de batch updates
  BATCH_UPDATES: {
    MAX_TEETH_PER_BATCH: 10,
    BATCH_DELAY: 100, // 100ms entre lotes
  },

  // Configuración de renderizado
  RENDERING: {
    VIRTUALIZATION_THRESHOLD: 100, // Número de dientes para activar virtualización
    CHUNK_SIZE: 20, // Dientes por chunk en virtualización
    ANIMATION_DURATION: 200, // ms
  }
};

// Función para aplicar optimizaciones según el dispositivo
export const getDeviceOptimizations = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isLowEnd = typeof navigator !== 'undefined' && navigator.hardwareConcurrency < 4;

  if (isMobile || isLowEnd) {
    return {
      ...ODONTOGRAMA_OPTIMIZATIONS,
      LAZY_LOADING: {
        ...ODONTOGRAMA_OPTIMIZATIONS.LAZY_LOADING,
        ADJACENT_QUADRANTS_DELAY: 1000, // Más delay en dispositivos lentos
      },
      RENDERING: {
        ...ODONTOGRAMA_OPTIMIZATIONS.RENDERING,
        VIRTUALIZATION_THRESHOLD: 50, // Activar virtualización más temprano
        CHUNK_SIZE: 10, // Chunks más pequeños
      }
    };
  }

  return ODONTOGRAMA_OPTIMIZATIONS;
};

// Función para optimizar el tamaño de los datos
export const optimizeDataSize = (data: any) => {
  if (!data) return data;

  // Remover propiedades innecesarias para el frontend
  const { __v, _id, ...optimizedData } = data;
  
  // Convertir _id a id si existe
  if (_id) {
    optimizedData.id = _id;
  }

  return optimizedData;
};

// Función para crear un cache simple
export const createSimpleCache = <T>(ttl: number) => {
  const cache = new Map<string, { data: T; timestamp: number }>();

  return {
    get: (key: string): T | null => {
      const item = cache.get(key);
      if (!item) return null;
      
      if (Date.now() - item.timestamp > ttl) {
        cache.delete(key);
        return null;
      }
      
      return item.data;
    },
    
    set: (key: string, data: T): void => {
      cache.set(key, { data, timestamp: Date.now() });
    },
    
    clear: (): void => {
      cache.clear();
    },
    
    size: (): number => {
      return cache.size;
    }
  };
};
