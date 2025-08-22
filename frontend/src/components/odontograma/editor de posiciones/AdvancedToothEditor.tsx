import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  Progress,
  Alert,
  AlertIcon,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiEdit3, FiSave, FiX, FiSettings, FiEye, FiEyeOff } from 'react-icons/fi';
import { Tooth } from '../types';

interface AdvancedToothEditorProps {
  teeth: Tooth[];
  selectedTooth: Tooth | null;
  onTeethUpdate: (updatedTeeth: Tooth[]) => void;
  onClose: () => void;
  isOpen: boolean;
}

const AdvancedToothEditor: React.FC<AdvancedToothEditorProps> = ({
  teeth,
  selectedTooth,
  onTeethUpdate,
  onClose,
  isOpen,
}) => {
  const [adjustedTeeth, setAdjustedTeeth] = useState<Tooth[]>(teeth);
  const [activeMode, setActiveMode] = useState<'manual' | 'drag' | 'detection'>('manual');
  const [showNumbers, setShowNumbers] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedTooth, setDraggedTooth] = useState<Tooth | null>(null);
  const [detectionSettings, setDetectionSettings] = useState({
    brightnessThreshold: 200,
    minArea: 100,
    maxArea: 5000
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectionError, setDetectionError] = useState<string>('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const toast = useToast();

  // Actualizar adjustedTeeth cuando teeth cambie
  useEffect(() => {
    setAdjustedTeeth(teeth);
  }, [teeth]);

  // Función para manejar el inicio del arrastre
  const handleMouseDown = (tooth: Tooth, event: React.MouseEvent) => {
    if (activeMode !== 'drag') return;
    
    event.preventDefault();
    setDraggedTooth(tooth);
    setIsDragging(true);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: event.clientX - rect.left - (tooth.posX || 0),
        y: event.clientY - rect.top - (tooth.posY || 0)
      });
    }
  };

  // Función para manejar el movimiento del mouse
  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging || !draggedTooth || !containerRef.current || activeMode !== 'drag') return;

    const rect = containerRef.current.getBoundingClientRect();
    const newX = event.clientX - rect.left - dragOffset.x;
    const newY = event.clientY - rect.top - dragOffset.y;

    // Limitar dentro del contenedor
    const clampedX = Math.max(0, Math.min(rect.width - 40, newX));
    const clampedY = Math.max(0, Math.min(rect.height - 40, newY));

    setAdjustedTeeth(prev => 
      prev.map(t => 
        t.id === draggedTooth.id 
          ? { ...t, posX: clampedX, posY: clampedY }
          : t
      )
    );
  };

  // Función para manejar el fin del arrastre
  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedTooth(null);
  };

  // Agregar event listeners para el arrastre
  useEffect(() => {
    if (activeMode === 'drag') {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [activeMode, isDragging, draggedTooth, dragOffset]);

  // Actualizar propiedades manualmente
  const updateToothProperty = (toothId: string, field: keyof Tooth, value: any) => {
    setAdjustedTeeth(prev => 
      prev.map(tooth => 
        tooth.id === toothId 
          ? { ...tooth, [field]: value }
          : tooth
      )
    );
  };

  // Función para rotar con rueda del mouse
  const handleWheel = (event: React.WheelEvent, tooth: Tooth) => {
    if (activeMode !== 'drag' || !(event.ctrlKey || event.metaKey)) return;
    
    event.preventDefault();
    const delta = event.deltaY > 0 ? -5 : 5;
    const newRotation = (tooth.rotation || 0) + delta;
    
    updateToothProperty(tooth.id, 'rotation', newRotation);
  };

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
      const threshold = detectionSettings.brightnessThreshold;

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
        
        const posX = minX;
        const posY = minY;
        const size = { width: width / 40, height: height / 40 };

        return {
          id: `detected-${index}`,
          number: assignToothNumber(posX, posY, size.width, size.height),
          condition: 'sano',
          notes: '',
          interventions: [],
          type: 'incisivo' as 'incisivo' | 'canino' | 'premolar' | 'molar',
          cuadrante: 'superior-derecho' as 'superior-derecho' | 'superior-izquierdo' | 'inferior-derecho' | 'inferior-izquierdo',
          tipoDentadura: 'temporal' as 'permanente' | 'temporal',
          posX,
          posY,
          rotation: 0,
          size
        };
      });

      setAdjustedTeeth(detectedTeeth);
      setProgress(100);
      toast({
        title: 'Detección completada',
        description: `${detectedTeeth.length} dientes detectados`,
        status: 'success',
        duration: 3000,
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
      if (cluster.pixels > detectionSettings.minArea && cluster.pixels < detectionSettings.maxArea) {
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
    // Lógica simple para asignar números de dientes basada en posición
    const isUpper = y < 300;
    const isRight = x > 400;
    
    if (isUpper) {
      if (isRight) {
        return 51 + Math.floor((x - 400) / 50);
      } else {
        return 61 + Math.floor(x / 50);
      }
    } else {
      if (isRight) {
        return 81 + Math.floor((x - 400) / 50);
      } else {
        return 71 + Math.floor(x / 50);
      }
    }
  };

  // Guardar cambios
  const handleSave = () => {
    onTeethUpdate(adjustedTeeth);
    onClose();
    toast({
      title: 'Cambios guardados',
      description: 'Los ajustes de los dientes han sido guardados',
      status: 'success',
      duration: 3000,
    });
  };

  // Exportar configuración
  const exportConfig = () => {
    const positions = adjustedTeeth.map(tooth => ({
      id: `tooth-${tooth.number}`,
      number: tooth.number,
      posX: tooth.posX,
      posY: tooth.posY,
      rotation: tooth.rotation || 0,
      size: tooth.size || { width: 1, height: 1 }
    }));

    const dataStr = JSON.stringify(positions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'teeth-positions-advanced.json';
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Configuración exportada',
      description: 'Archivo JSON descargado con las posiciones avanzadas',
      status: 'success',
      duration: 3000,
    });
  };

  // Renderizar diente para edición
  const renderEditableTooth = (tooth: Tooth) => {
    const isSelected = selectedTooth?.id === tooth.id;
    const size = tooth.size || { width: 1, height: 1 };
    const rotation = tooth.rotation || 0;
    
    return (
      <Box
        key={tooth.id}
        position="absolute"
        left={`${tooth.posX}px`}
        top={`${tooth.posY}px`}
        transform="translate(-50%, -50%)"
        cursor={activeMode === 'drag' ? (isDragging ? 'grabbing' : 'grab') : 'pointer'}
        onMouseDown={(e) => handleMouseDown(tooth, e)}
        onWheel={(e) => handleWheel(e, tooth)}
        onClick={() => {
          // Seleccionar el diente para edición manual
          // Aquí podrías implementar la lógica de selección
        }}
        style={{
          userSelect: 'none',
          zIndex: isSelected ? 25 : 20,
        }}
        _hover={{
          transform: 'translate(-50%, -50%) scale(1.1)',
          zIndex: 30,
        }}
      >
        <Box
          w={`${size.width * 40}px`}
          h={`${size.height * 40}px`}
          bg="transparent"
          border="2px solid"
          borderColor={isSelected ? 'green.500' : 'blue.500'}
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="xs"
          fontWeight="bold"
          color={isSelected ? 'green.700' : 'blue.700'}
          opacity={0.8}
          transform={`rotate(${rotation}deg)`}
          _hover={{
            opacity: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            borderColor: isSelected ? 'green.600' : 'blue.600',
          }}
        >
          {showNumbers && tooth.number}
        </Box>
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Editor Avanzado de Dientes - {adjustedTeeth.length} dientes
        </ModalHeader>
        <ModalBody>
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
                  Guardar Cambios
                </Button>
                <Button colorScheme="purple" onClick={exportConfig}>
                  Exportar JSON
                </Button>
                <Button colorScheme="red" onClick={onClose}>
                  Cancelar
                </Button>
              </HStack>

              {/* Configuración de detección */}
              {activeMode === 'detection' && (
                <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                  <Text fontWeight="bold" mb={2}>Configuración de Detección:</Text>
                  <SimpleGrid columns={3} spacing={4}>
                    <Box>
                      <Text fontSize="sm">Umbral de brillo</Text>
                      <NumberInput
                        value={detectionSettings.brightnessThreshold}
                        onChange={(_, value) => setDetectionSettings(prev => ({ ...prev, brightnessThreshold: value }))}
                        min={100}
                        max={255}
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
                    <Box>
                      <Text fontSize="sm">Área mínima</Text>
                      <NumberInput
                        value={detectionSettings.minArea}
                        onChange={(_, value) => setDetectionSettings(prev => ({ ...prev, minArea: value }))}
                        min={50}
                        max={1000}
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
                      <Text fontSize="sm">Área máxima</Text>
                      <NumberInput
                        value={detectionSettings.maxArea}
                        onChange={(_, value) => setDetectionSettings(prev => ({ ...prev, maxArea: value }))}
                        min={1000}
                        max={10000}
                        size="sm"
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

              {/* Área de edición */}
              <Box 
                ref={containerRef}
                position="relative" 
                w="800px"
                h="600px"
                border="2px solid"
                borderColor="gray.300"
                borderRadius="md"
                bg="gray.50"
                overflow="hidden"
              >
                {/* Imagen de fondo */}
                        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          backgroundImage="url('/4037ecb32d029281a0c64e876fcf56be-Photoroom.png')"
          backgroundSize="contain"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          opacity={0.3}
          pointerEvents="none"
        />
                
                {/* Dientes editables */}
                {adjustedTeeth.map(renderEditableTooth)}
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
                      <Text fontSize="sm">Posición X (px)</Text>
                      <NumberInput
                        value={selectedTooth.posX || 0}
                        onChange={(_, value) => updateToothProperty(selectedTooth.id, 'posX', value)}
                        min={0}
                        max={600}
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
                      <Text fontSize="sm">Posición Y (px)</Text>
                      <NumberInput
                        value={selectedTooth.posY || 0}
                        onChange={(_, value) => updateToothProperty(selectedTooth.id, 'posY', value)}
                        min={0}
                        max={400}
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
                      <Text fontSize="sm">Ancho (multiplicador)</Text>
                      <NumberInput
                        value={selectedTooth.size?.width || 1}
                        onChange={(_, value) => updateToothProperty(selectedTooth.id, 'size', { 
                          ...selectedTooth.size, 
                          width: value 
                        })}
                        min={0.1}
                        max={5}
                        step={0.1}
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
                      <Text fontSize="sm">Alto (multiplicador)</Text>
                      <NumberInput
                        value={selectedTooth.size?.height || 1}
                        onChange={(_, value) => updateToothProperty(selectedTooth.id, 'size', { 
                          ...selectedTooth.size, 
                          height: value 
                        })}
                        min={0.1}
                        max={5}
                        step={0.1}
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
                        value={selectedTooth.rotation || 0}
                        onChange={(_, value) => updateToothProperty(selectedTooth.id, 'rotation', value)}
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

              {/* Tabla de dientes */}
              <Box>
                <Text fontWeight="bold" mb={2}>Lista de Dientes:</Text>
                <Box maxH="300px" overflowY="auto">
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
                      {adjustedTeeth.map((tooth) => (
                        <Tr 
                          key={tooth.id}
                          cursor="pointer"
                          bg={selectedTooth?.id === tooth.id ? "blue.50" : "transparent"}
                          onClick={() => {
                            // Seleccionar el diente para edición manual
                            // Aquí podrías implementar la lógica de selección
                          }}
                        >
                          <Td>
                            <Badge colorScheme="blue">{tooth.number}</Badge>
                          </Td>
                          <Td>{(tooth.posX || 0).toFixed(0)}</Td>
                          <Td>{(tooth.posY || 0).toFixed(0)}</Td>
                          <Td>{(tooth.size?.width || 1).toFixed(1)}</Td>
                          <Td>{(tooth.size?.height || 1).toFixed(1)}</Td>
                          <Td>{(tooth.rotation || 0).toFixed(0)}</Td>
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
        </ModalBody>

        {/* Imagen oculta para análisis */}
        <Box display="none">
          <img
            ref={imageRef}
            src="/4037ecb32d029281a0c64e876fcf56be-Photoroom.png"
            alt="Análisis de dientes permanentes"
          />
          <canvas
            ref={canvasRef}
          />
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default AdvancedToothEditor; 