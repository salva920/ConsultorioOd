import { useCallback, useRef } from 'react';

/**
 * Hook personalizado para implementar debounce
 * @param callback Función a ejecutar después del delay
 * @param delay Delay en milisegundos
 * @returns Función debounced
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<number>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}

/**
 * Hook personalizado para debounce con cancelación
 * @param callback Función a ejecutar después del delay
 * @param delay Delay en milisegundos
 * @returns Objeto con función debounced y función de cancelación
 */
export function useDebounceWithCancel<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<number>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { debouncedCallback, cancel };
}

/**
 * Hook personalizado para debounce con flush inmediato
 * @param callback Función a ejecutar después del delay
 * @param delay Delay en milisegundos
 * @returns Objeto con función debounced, cancel y flush
 */
export function useDebounceWithFlush<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<number>();
  const argsRef = useRef<Parameters<T>>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        if (argsRef.current) {
          callback(...argsRef.current);
        }
      }, delay);
    },
    [callback, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (argsRef.current) {
      callback(...argsRef.current);
    }
  }, [callback]);

  return { debouncedCallback, cancel, flush };
}
