import React, { useState, useRef } from 'react';
import { Box, Image, Button, Text, VStack, HStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Progress, Alert, AlertIcon, SimpleGrid } from '@chakra-ui/react';

interface DetectedTooth {
  id: string;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  area: number;
}

interface AdvancedTeethDetectorProps {
  imageSrc: string;
  onDetectionComplete: (teeth: DetectedTooth[]) => void;
}

const AdvancedTeethDetector: React.FC<AdvancedTeethDetectorProps> = ({
  imageSrc,
  onDetectionComplete
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectedTeeth, setDetectedTeeth] = useState<DetectedTooth[]>([]);
  const [detectionError, setDetectionError] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState({
    brightnessThreshold: 200,
    minArea: 100,
    maxArea: 5000,
    blurRadius: 2,
    edgeThreshold: 50
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const detectTeethAdvanced = async () => {
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
      setProgress(10);

      // Aplicar filtros de preprocesamiento
      const processedData = preprocessImage(canvas, settings);
      setProgress(30);

      // Detectar contornos
      const contours = detectContours(processedData, canvas.width, canvas.height);
      setProgress(50);

      // Filtrar y analizar contornos
      const validContours = filterContours(contours, settings);
      setProgress(70);

      // Convertir contornos a dientes
      const teeth = contoursToTeeth(validContours, canvas.width, canvas.height);
      setProgress(90);

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

  // Preprocesamiento de imagen
  const preprocessImage = (canvas: HTMLCanvasElement, settings: any) => {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const processed = new Uint8ClampedArray(data.length);

    // Aplicar filtro de brillo y contraste
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Convertir a escala de grises
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Aplicar umbral de brillo
      const threshold = gray > settings.brightnessThreshold ? 255 : 0;
      
      processed[i] = threshold;
      processed[i + 1] = threshold;
      processed[i + 2] = threshold;
      processed[i + 3] = a;
    }

    return processed;
  };

  // Detectar contornos usando algoritmo de búsqueda de bordes
  const detectContours = (imageData: Uint8ClampedArray, width: number, height: number) => {
    const contours: Array<{ points: { x: number; y: number }[]; area: number }> = [];
    const visited = new Set<string>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const pixel = imageData[index];
        
        if (pixel === 255 && !visited.has(`${x},${y}`)) {
          // Encontrar contorno
          const contour = traceContour(x, y, imageData, width, height, visited);
          if (contour.points.length > 10) { // Filtrar contornos muy pequeños
            contours.push(contour);
          }
        }
      }
    }

    return contours;
  };

  // Trazar contorno usando algoritmo de seguimiento de bordes
  const traceContour = (startX: number, startY: number, imageData: Uint8ClampedArray, width: number, height: number, visited: Set<string>) => {
    const points: { x: number; y: number }[] = [];
    const queue = [{ x: startX, y: startY }];
    let area = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      points.push(current);
      area++;

      // Buscar vecinos blancos
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
        { x: current.x + 1, y: current.y + 1 },
        { x: current.x - 1, y: current.y - 1 },
        { x: current.x + 1, y: current.y - 1 },
        { x: current.x - 1, y: current.y + 1 }
      ];

      for (const neighbor of neighbors) {
        if (neighbor.x >= 0 && neighbor.x < width && neighbor.y >= 0 && neighbor.y < height) {
          const index = (neighbor.y * width + neighbor.x) * 4;
          const pixel = imageData[index];
          const neighborKey = `${neighbor.x},${neighbor.y}`;

          if (pixel === 255 && !visited.has(neighborKey)) {
            queue.push(neighbor);
          }
        }
      }
    }

    return { points, area };
  };

  // Filtrar contornos por área y forma
  const filterContours = (contours: Array<{ points: { x: number; y: number }[]; area: number }>, settings: any) => {
    return contours.filter(contour => {
      const area = contour.area;
      return area >= settings.minArea && area <= settings.maxArea;
    });
  };

  // Convertir contornos a dientes
  const contoursToTeeth = (contours: Array<{ points: { x: number; y: number }[]; area: number }>, width: number, height: number) => {
    return contours.map((contour, index) => {
      // Calcular bounding box del contorno
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      
      for (const point of contour.points) {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      }

      const x = (minX / width) * 100;
      const y = (minY / height) * 100;
      const w = ((maxX - minX) / width) * 100;
      const h = ((maxY - minY) / height) * 100;

      // Asignar número de diente basado en la posición
      const toothNumber = assignToothNumber(x, y, w, h);

      return {
        id: `detected-${index}`,
        number: toothNumber,
        x,
        y,
        width: w,
        height: h,
        confidence: 0.9,
        area: contour.area
      };
    });
  };

  // Asignar número de diente basado en la posición
  const assignToothNumber = (x: number, y: number, width: number, height: number): number => {
    const isUpper = y < 50;
    const isRight = x > 50;
    
    if (isUpper) {
      if (isRight) {
        const position = Math.floor((x - 50) / 10);
        return 55 - position;
      } else {
        const position = Math.floor(x / 10);
        return 61 + position;
      }
    } else {
      if (isRight) {
        const position = Math.floor((x - 50) / 10);
        return 75 - position;
      } else {
        const position = Math.floor(x / 10);
        return 81 + position;
      }
    }
  };

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Detector Avanzado de Dientes
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
                  border="2px solid red"
                  borderRadius="4px"
                  backgroundColor="rgba(255, 0, 0, 0.2)"
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

        {/* Configuración */}
        <Box>
          <Text fontWeight="bold" mb={3}>Configuración de detección:</Text>
          <SimpleGrid columns={2} spacing={4}>
            <Box>
              <Text fontSize="sm">Umbral de brillo</Text>
              <Slider
                value={settings.brightnessThreshold}
                onChange={(value) => setSettings(prev => ({ ...prev, brightnessThreshold: value }))}
                min={100}
                max={255}
                step={5}
              >
                <SliderMark value={100}>100</SliderMark>
                <SliderMark value={200}>200</SliderMark>
                <SliderMark value={255}>255</SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            <Box>
              <Text fontSize="sm">Área mínima</Text>
              <NumberInput
                value={settings.minArea}
                onChange={(_, value) => setSettings(prev => ({ ...prev, minArea: value }))}
                min={50}
                max={1000}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Controles */}
        <HStack spacing={4}>
          <Button
            colorScheme="blue"
            onClick={detectTeethAdvanced}
            isLoading={isDetecting}
            loadingText="Detectando..."
          >
            Detectar Dientes Avanzado
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
                    W={tooth.width.toFixed(1)}%, H={tooth.height.toFixed(1)}%, Área={tooth.area}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        <Text fontSize="sm" color="gray.600">
          💡 El detector avanzado usa análisis de contornos y filtros de imagen para detectar dientes con mayor precisión
        </Text>
      </VStack>
    </Box>
  );
};

export default AdvancedTeethDetector; 