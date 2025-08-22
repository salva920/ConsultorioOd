import React, { useState, useRef } from 'react';
import { Box, Image, Button, Text, VStack, HStack, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Progress, Alert, AlertIcon } from '@chakra-ui/react';

interface DetectedTooth {
  id: string;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

interface AutoTeethDetectorProps {
  imageSrc: string;
  onDetectionComplete: (teeth: DetectedTooth[]) => void;
}

const AutoTeethDetector: React.FC<AutoTeethDetectorProps> = ({
  imageSrc,
  onDetectionComplete
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectedTeeth, setDetectedTeeth] = useState<DetectedTooth[]>([]);
  const [detectionError, setDetectionError] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Función para detectar dientes usando análisis de color
  const detectTeeth = async () => {
    if (!canvasRef.current || !imageRef.current) return;

    setIsDetecting(true);
    setProgress(0);
    setDetectionError('');

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');

      // Esperar a que la imagen cargue
      await new Promise((resolve) => {
        if (imageRef.current?.complete) {
          resolve(true);
        } else {
          imageRef.current!.onload = () => resolve(true);
        }
      });

      const img = imageRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Dibujar la imagen en el canvas
      ctx.drawImage(img, 0, 0);
      setProgress(20);

      // Obtener datos de píxeles
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      setProgress(40);

      // Detectar áreas blancas (dientes)
      const whitePixels: { x: number; y: number }[] = [];
      const threshold = 200; // Umbral para considerar un píxel como "blanco"

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];

          // Detectar píxeles blancos (dientes)
          if (r > threshold && g > threshold && b > threshold) {
            whitePixels.push({ x, y });
          }
        }
      }
      setProgress(60);

      // Agrupar píxeles en clusters (dientes)
      const clusters = groupPixelsIntoClusters(whitePixels, canvas.width, canvas.height);
      setProgress(80);

      // Convertir clusters a dientes detectados
      const teeth = clusters.map((cluster, index) => {
        const { minX, maxX, minY, maxY } = cluster;
        const width = maxX - minX;
        const height = maxY - minY;
        
        // Calcular posición en porcentajes
        const x = (minX / canvas.width) * 100;
        const y = (minY / canvas.height) * 100;
        const w = (width / canvas.width) * 100;
        const h = (height / canvas.height) * 100;

        // Asignar número de diente basado en la posición
        const toothNumber = assignToothNumber(x, y, w, h);

        return {
          id: `detected-${index}`,
          number: toothNumber,
          x,
          y,
          width: w,
          height: h,
          confidence: 0.8
        };
      });

      setDetectedTeeth(teeth);
      setProgress(100);
      setShowPreview(true);
      onDetectionComplete(teeth);

    } catch (error) {
      setDetectionError('Error al detectar dientes: ' + error);
    } finally {
      setIsDetecting(false);
    }
  };

  // Función para agrupar píxeles en clusters
  const groupPixelsIntoClusters = (pixels: { x: number; y: number }[], width: number, height: number) => {
    const clusters: Array<{ minX: number; maxX: number; minY: number; maxY: number; pixels: number }> = [];
    const visited = new Set<string>();

    for (const pixel of pixels) {
      const key = `${pixel.x},${pixel.y}`;
      if (visited.has(key)) continue;

      const cluster = floodFill(pixel, pixels, visited);
      if (cluster.pixels > 50) { // Filtrar clusters muy pequeños
        clusters.push(cluster);
      }
    }

    return clusters;
  };

  // Algoritmo de flood fill para agrupar píxeles conectados
  const floodFill = (start: { x: number; y: number }, pixels: { x: number; y: number }[], visited: Set<string>) => {
    const queue = [start];
    const cluster = { minX: start.x, maxX: start.x, minY: start.y, maxY: start.y, pixels: 0 };
    const pixelSet = new Set(pixels.map(p => `${p.x},${p.y}`));

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      cluster.minX = Math.min(cluster.minX, current.x);
      cluster.maxX = Math.max(cluster.maxX, current.x);
      cluster.minY = Math.min(cluster.minY, current.y);
      cluster.maxY = Math.max(cluster.maxY, current.y);
      cluster.pixels++;

      // Agregar vecinos
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (pixelSet.has(neighborKey) && !visited.has(neighborKey)) {
          queue.push(neighbor);
        }
      }
    }

    return cluster;
  };

  // Asignar número de diente basado en la posición
  const assignToothNumber = (x: number, y: number, width: number, height: number): number => {
    // Mapeo aproximado basado en la posición en la imagen
    const isUpper = y < 50; // Dientes superiores
    const isRight = x > 50; // Lado derecho
    
    if (isUpper) {
      if (isRight) {
        // Dientes superiores derechos (51-55)
        const position = Math.floor((x - 50) / 10);
        return 55 - position;
      } else {
        // Dientes superiores izquierdos (61-65)
        const position = Math.floor(x / 10);
        return 61 + position;
      }
    } else {
      if (isRight) {
        // Dientes inferiores derechos (71-75)
        const position = Math.floor((x - 50) / 10);
        return 75 - position;
      } else {
        // Dientes inferiores izquierdos (81-85)
        const position = Math.floor(x / 10);
        return 81 + position;
      }
    }
  };

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Detector Automático de Dientes
      </Text>

      <VStack spacing={6} align="stretch">
        {/* Imagen oculta para análisis */}
        <Image
          ref={imageRef}
          src={imageSrc}
          alt="Análisis de dientes"
          display="none"
        />

        {/* Canvas oculto para procesamiento */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* Vista previa de la imagen con dientes detectados */}
        {showPreview && detectedTeeth.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={3}>Vista previa de detección:</Text>
            <Box position="relative" display="inline-block">
              <Image
                src={imageSrc}
                alt="Dientes temporales con detección"
                maxW="600px"
                h="auto"
              />
              {detectedTeeth.map((tooth) => (
                <Box
                  key={tooth.id}
                  position="absolute"
                  left={`${tooth.x}%`}
                  top={`${tooth.y}%`}
                  width={`${tooth.width}%`}
                  height={`${tooth.height}%`}
                  border="2px solid blue"
                  borderRadius="4px"
                  backgroundColor="rgba(0, 0, 255, 0.2)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="12px"
                  fontWeight="bold"
                  color="white"
                  textShadow="1px 1px 1px black"
                  zIndex={10}
                >
                  {tooth.number}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Controles */}
        <HStack spacing={4}>
          <Button
            colorScheme="blue"
            onClick={detectTeeth}
            isLoading={isDetecting}
            loadingText="Detectando..."
          >
            Detectar Dientes Automáticamente
          </Button>

          {detectedTeeth.length > 0 && (
            <Button
              colorScheme="green"
              onClick={() => onDetectionComplete(detectedTeeth)}
            >
              Usar Dientes Detectados
            </Button>
          )}
        </HStack>

        {/* Progreso */}
        {isDetecting && (
          <Box>
            <Text mb={2}>Progreso de detección:</Text>
            <Progress value={progress} colorScheme="blue" />
            <Text fontSize="sm" mt={1}>
              {progress}% completado
            </Text>
          </Box>
        )}

        {/* Error */}
        {detectionError && (
          <Alert status="error">
            <AlertIcon />
            {detectionError}
          </Alert>
        )}

        {/* Resultados */}
        {detectedTeeth.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={2}>
              Dientes detectados: {detectedTeeth.length}
            </Text>
            <VStack spacing={2} align="start" maxH="300px" overflowY="auto">
              {detectedTeeth.map((tooth) => (
                <Box
                  key={tooth.id}
                  p={2}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  w="100%"
                >
                  <Text fontSize="sm">
                    Diente {tooth.number}: X={tooth.x.toFixed(1)}%, Y={tooth.y.toFixed(1)}%, 
                    W={tooth.width.toFixed(1)}%, H={tooth.height.toFixed(1)}%
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        <Text fontSize="sm" color="gray.600">
          💡 El detector analiza la imagen para encontrar áreas blancas (dientes) y las agrupa automáticamente
        </Text>
      </VStack>
    </Box>
  );
};

export default AutoTeethDetector; 