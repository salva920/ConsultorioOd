import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Image, 
  Button, 
  Text, 
  VStack, 
  HStack, 
  NumberInput, 
  NumberInputField, 
  NumberInputStepper, 
  NumberIncrementStepper, 
  NumberDecrementStepper,
  Progress,
  Alert,
  AlertIcon,
  SimpleGrid,
  Switch,
  FormControl,
  FormLabel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast
} from '@chakra-ui/react';

interface ToothPosition {
  id: string;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  confidence?: number;
  area?: number;
}

interface UnifiedTeethEditorProps {
  imageSrc: string;
  onPositionsSave: (positions: ToothPosition[]) => void;
}

// Valores por defecto detectados automáticamente
const DEFAULT_TEETH_POSITIONS: ToothPosition[] = [
  // Dientes superiores izquierdos (61-65)
  { id: '65', number: 65, x: 42.8, y: 6.8, width: 6.8, height: 7.6, rotation: 0 },
  { id: '64', number: 64, x: 35.2, y: 8.8, width: 6.9, height: 8.0, rotation: 0 },
  { id: '63', number: 63, x: 26.5, y: 20.9, width: 8.7, height: 9.5, rotation: 0 },
  { id: '62', number: 62, x: 30.8, y: 13.9, width: 7.1, height: 7.2, rotation: 0 },
  { id: '61', number: 61, x: 24.7, y: 31.1, width: 8.4, height: 10.5, rotation: 0 },

  // Dientes superiores derechos (51-55)
  { id: '55', number: 55, x: 50.6, y: 7.0, width: 6.9, height: 7.6, rotation: 0 },
  { id: '54', number: 54, x: 58.4, y: 9.4, width: 6.8, height: 7.6, rotation: 0 },
  { id: '53', number: 53, x: 63.1, y: 14.3, width: 6.9, height: 7.3, rotation: 0 },
  { id: '52', number: 52, x: 66.3, y: 20.9, width: 9.1, height: 9.7, rotation: 0 },
  { id: '51', number: 51, x: 68.8, y: 31.1, width: 8.4, height: 10.5, rotation: 0 },

  // Dientes inferiores izquierdos (71-75)
  { id: '75', number: 75, x: 25.1, y: 58.4, width: 8.4, height: 10.5, rotation: 0 },
  { id: '74', number: 74, x: 26.9, y: 69.6, width: 8.7, height: 9.5, rotation: 0 },
  { id: '73', number: 73, x: 31.2, y: 78.9, width: 7.1, height: 7.2, rotation: 0 },
  { id: '72', number: 72, x: 35.6, y: 83.3, width: 6.9, height: 8.0, rotation: 0 },
  { id: '71', number: 71, x: 43.1, y: 85.7, width: 6.9, height: 7.6, rotation: 0 },

  // Dientes inferiores derechos (81-85)
  { id: '85', number: 85, x: 69.2, y: 58.4, width: 8.4, height: 10.5, rotation: 0 },
  { id: '84', number: 84, x: 66.8, y: 69.4, width: 9.0, height: 9.7, rotation: 0 },
  { id: '83', number: 83, x: 63.5, y: 78.4, width: 6.9, height: 7.4, rotation: 0 },
  { id: '82', number: 82, x: 58.8, y: 83.1, width: 6.8, height: 7.6, rotation: 0 },
  { id: '81', number: 81, x: 51.0, y: 85.4, width: 6.8, height: 7.6, rotation: 0 },
];

const UnifiedTeethEditor: React.FC<UnifiedTeethEditorProps> = ({
  imageSrc,
  onPositionsSave
}) => {
  const [teeth, setTeeth] = useState<ToothPosition[]>(DEFAULT_TEETH_POSITIONS);
  const [selectedTooth, setSelectedTooth] = useState<ToothPosition | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectionError, setDetectionError] = useState<string>('');
  const [showNumbers, setShowNumbers] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeMode, setActiveMode] = useState<'detection' | 'manual' | 'drag'>('detection');
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const toast = useToast();

  const [settings, setSettings] = useState({
    brightnessThreshold: 200,
    minArea: 100,
    maxArea: 5000
  });

  // Detección automática
  const detectTeeth = async () => {
    if (!canvasRef.current || !imageRef.current) return;

    setIsDetecting(true);
    setProgress(0);
    setDetectionError('');

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');

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

      ctx.drawImage(img, 0, 0);
      setProgress(20);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      setProgress(40);

      const whitePixels: { x: number; y: number }[] = [];
      const threshold = settings.brightnessThreshold;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];

          if (r > threshold && g > threshold && b > threshold) {
            whitePixels.push({ x, y });
          }
        }
      }
      setProgress(60);

      const clusters = groupPixelsIntoClusters(whitePixels, canvas.width, canvas.height);
      setProgress(80);

      const detectedTeeth = clusters.map((cluster, index) => {
        const { minX, maxX, minY, maxY } = cluster;
        const width = maxX - minX;
        const height = maxY - minY;
        
        const x = (minX / canvas.width) * 100;
        const y = (minY / canvas.height) * 100;
        const w = (width / canvas.width) * 100;
        const h = (height / canvas.height) * 100;

        const toothNumber = assignToothNumber(x, y, w, h);

        return {
          id: `detected-${index}`,
          number: toothNumber,
          x,
          y,
          width: w,
          height: h,
          rotation: 0,
          confidence: 0.8,
          area: cluster.pixels
        };
      });

      setTeeth(detectedTeeth);
      setProgress(100);
      toast({
        title: 'Detección completada',
        description: `${detectedTeeth.length} dientes detectados`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      setDetectionError('Error al detectar dientes: ' + error);
    } finally {
      setIsDetecting(false);
    }
  };

  const groupPixelsIntoClusters = (pixels: { x: number; y: number }[], width: number, height: number) => {
    const clusters: Array<{ minX: number; maxX: number; minY: number; maxY: number; pixels: number }> = [];
    const visited = new Set<string>();

    for (const pixel of pixels) {
      const key = `${pixel.x},${pixel.y}`;
      if (visited.has(key)) continue;

      const cluster = floodFill(pixel, pixels, visited);
      if (cluster.pixels > settings.minArea && cluster.pixels < settings.maxArea) {
        clusters.push(cluster);
      }
    }

    return clusters;
  };

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

  // Modo arrastre
  const handleMouseDown = (e: React.MouseEvent, tooth: ToothPosition) => {
    if (activeMode !== 'drag') return;
    
    e.preventDefault();
    setSelectedTooth(tooth);
    setIsDragging(true);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - (tooth.x * rect.width / 100),
        y: e.clientY - rect.top - (tooth.y * rect.height / 100)
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedTooth || !containerRef.current || activeMode !== 'drag') return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100 - selectedTooth.width, x));
    const clampedY = Math.max(0, Math.min(100 - selectedTooth.height, y));

    setTeeth(prev => prev.map(t => 
      t.id === selectedTooth.id 
        ? { ...t, x: clampedX, y: clampedY }
        : t
    ));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent, tooth: ToothPosition) => {
    if (activeMode !== 'drag' || !(e.ctrlKey || e.metaKey)) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    
    setTeeth(prev => prev.map(t => 
      t.id === tooth.id 
        ? { ...t, rotation: t.rotation + delta }
        : t
    ));
  };

  // Actualizar propiedades manualmente
  const updateToothProperty = (field: keyof ToothPosition, value: number) => {
    if (!selectedTooth) return;
    
    setTeeth(prev => prev.map(tooth => 
      tooth.id === selectedTooth.id 
        ? { ...tooth, [field]: value }
        : tooth
    ));
    
    setSelectedTooth(prev => prev ? { ...prev, [field]: value } : null);
  };

  // Exportar configuración
  const exportConfig = () => {
    const configJson = JSON.stringify(teeth, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'temporary-teeth-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Configuración exportada',
      description: 'Archivo descargado como temporary-teeth-config.json',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Guardar posiciones
  const handleSave = () => {
    onPositionsSave(teeth);
    toast({
      title: 'Posiciones guardadas',
      description: `${teeth.length} dientes guardados`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Cargar valores por defecto
  const loadDefaultValues = () => {
    setTeeth(DEFAULT_TEETH_POSITIONS);
    toast({
      title: 'Valores por defecto cargados',
      description: '20 dientes temporales cargados',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Editor Unificado de Dientes Temporales
      </Text>

      <HStack spacing={8} align="start">
        {/* Panel principal */}
        <VStack spacing={4} align="stretch" flex={1}>
          {/* Controles */}
          <HStack spacing={4}>
            <Button
              colorScheme="blue"
              onClick={detectTeeth}
              isLoading={isDetecting}
              loadingText="Detectando..."
            >
              Detectar Automáticamente
            </Button>
            <Button colorScheme="green" onClick={handleSave}>
              Guardar Posiciones
            </Button>
            <Button colorScheme="purple" onClick={exportConfig}>
              Exportar Configuración
            </Button>
            <Button colorScheme="orange" onClick={loadDefaultValues}>
              Cargar Valores por Defecto
            </Button>
          </HStack>

          {/* Configuración de detección */}
          {activeMode === 'detection' && (
            <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
              <Text fontWeight="bold" mb={2}>Configuración de Detección:</Text>
              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontSize="sm">Umbral de brillo</Text>
                  <NumberInput
                    value={settings.brightnessThreshold}
                    onChange={(_, value) => setSettings(prev => ({ ...prev, brightnessThreshold: value }))}
                    min={100}
                    max={255}
                    step={5}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
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
          )}

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

          {/* Imagen con dientes */}
          <Box 
            ref={containerRef}
            position="relative" 
            display="inline-block"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            cursor={isDragging ? 'grabbing' : 'default'}
          >
            <Image
              src={imageSrc}
              alt="Dientes temporales"
              maxW="600px"
              h="auto"
              userSelect="none"
              draggable={false}
            />
            
            {teeth.map((tooth) => (
              <Box
                key={tooth.id}
                position="absolute"
                left={`${tooth.x}%`}
                top={`${tooth.y}%`}
                width={`${tooth.width}%`}
                height={`${tooth.height}%`}
                cursor={activeMode === 'drag' ? (isDragging ? 'grabbing' : 'grab') : 'pointer'}
                border={selectedTooth?.id === tooth.id ? "2px solid red" : "1px solid blue"}
                borderRadius="50%"
                transition={isDragging ? 'none' : 'all 0.2s'}
                _hover={{
                  border: "2px solid green",
                  backgroundColor: "rgba(0, 255, 0, 0.1)"
                }}
                onMouseDown={(e) => handleMouseDown(e, tooth)}
                onWheel={(e) => handleWheel(e, tooth)}
                onClick={() => setSelectedTooth(tooth)}
                zIndex={10}
                transform={`rotate(${tooth.rotation}deg)`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="10px"
                fontWeight="bold"
                color="white"
                textShadow="1px 1px 1px black"
              >
                {showNumbers && tooth.number}
              </Box>
            ))}
          </Box>

          {/* Controles de visualización */}
          <HStack spacing={4}>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="show-numbers" mb="0">
                Mostrar números
              </FormLabel>
              <Switch 
                id="show-numbers" 
                isChecked={showNumbers}
                onChange={(e) => setShowNumbers(e.target.checked)}
              />
            </FormControl>
          </HStack>
        </VStack>

        {/* Panel lateral */}
        <VStack spacing={4} align="start" minW="300px">
          {/* Modos */}
          <Box>
            <Text fontWeight="bold" mb={2}>Modo de Edición:</Text>
            <Tabs variant="enclosed" size="sm">
              <TabList>
                <Tab onClick={() => setActiveMode('detection')}>Detección</Tab>
                <Tab onClick={() => setActiveMode('manual')}>Manual</Tab>
                <Tab onClick={() => setActiveMode('drag')}>Arrastre</Tab>
              </TabList>
            </Tabs>
          </Box>

          {/* Editor manual */}
          {activeMode === 'manual' && selectedTooth && (
            <Box>
              <Text fontWeight="bold">Diente {selectedTooth.number}</Text>
              
              <VStack spacing={2} align="start">
                <Box>
                  <Text fontSize="sm">Posición X (%)</Text>
                  <NumberInput
                    value={selectedTooth.x}
                    onChange={(_, value) => updateToothProperty('x', value)}
                    min={0}
                    max={100}
                    step={1}
                    size="sm"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>

                <Box>
                  <Text fontSize="sm">Posición Y (%)</Text>
                  <NumberInput
                    value={selectedTooth.y}
                    onChange={(_, value) => updateToothProperty('y', value)}
                    min={0}
                    max={100}
                    step={1}
                    size="sm"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>

                <Box>
                  <Text fontSize="sm">Ancho (%)</Text>
                  <NumberInput
                    value={selectedTooth.width}
                    onChange={(_, value) => updateToothProperty('width', value)}
                    min={1}
                    max={20}
                    step={1}
                    size="sm"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>

                <Box>
                  <Text fontSize="sm">Alto (%)</Text>
                  <NumberInput
                    value={selectedTooth.height}
                    onChange={(_, value) => updateToothProperty('height', value)}
                    min={1}
                    max={20}
                    step={1}
                    size="sm"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>

                <Box>
                  <Text fontSize="sm">Rotación (grados)</Text>
                  <NumberInput
                    value={selectedTooth.rotation}
                    onChange={(_, value) => updateToothProperty('rotation', value)}
                    min={-180}
                    max={180}
                    step={5}
                    size="sm"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>
              </VStack>
            </Box>
          )}

          {/* Leyenda de dientes */}
          <Box>
            <Text fontWeight="bold" mb={2}>Leyenda de Dientes:</Text>
            <Box maxH="400px" overflowY="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Diente</Th>
                    <Th>X</Th>
                    <Th>Y</Th>
                    <Th>W</Th>
                    <Th>H</Th>
                    <Th>Rot</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {teeth.map((tooth) => (
                    <Tr 
                      key={tooth.id}
                      cursor="pointer"
                      bg={selectedTooth?.id === tooth.id ? "blue.50" : "transparent"}
                      onClick={() => setSelectedTooth(tooth)}
                    >
                      <Td>
                        <Badge colorScheme="blue">{tooth.number}</Badge>
                      </Td>
                      <Td>{tooth.x.toFixed(1)}</Td>
                      <Td>{tooth.y.toFixed(1)}</Td>
                      <Td>{tooth.width.toFixed(1)}</Td>
                      <Td>{tooth.height.toFixed(1)}</Td>
                      <Td>{tooth.rotation}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>

          {/* Instrucciones */}
          <Box>
            <Text fontWeight="bold" mb={2}>Instrucciones:</Text>
            <Text fontSize="sm" color="gray.600">
              <strong>Detección:</strong> Ajusta parámetros y detecta automáticamente
              <br />
              <strong>Manual:</strong> Edita valores numéricos directamente
              <br />
              <strong>Arrastre:</strong> Mueve dientes con el mouse, Ctrl+Rueda para rotar
            </Text>
          </Box>
        </VStack>
      </HStack>

      {/* Imagen oculta para análisis */}
      <Image
        ref={imageRef}
        src={imageSrc}
        alt="Análisis de dientes"
        display="none"
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </Box>
  );
};

export default UnifiedTeethEditor; 