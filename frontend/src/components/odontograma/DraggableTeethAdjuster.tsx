import React, { useState, useRef, useEffect } from 'react';
import { Box, Image, Button, Text, VStack, HStack, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Switch, FormControl, FormLabel } from '@chakra-ui/react';

interface DraggableTooth {
  id: string;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface DraggableTeethAdjusterProps {
  imageSrc: string;
  onPositionsSave: (positions: DraggableTooth[]) => void;
}

const DraggableTeethAdjuster: React.FC<DraggableTeethAdjusterProps> = ({
  imageSrc,
  onPositionsSave
}) => {
  const [teeth, setTeeth] = useState<DraggableTooth[]>([
    // Dientes superiores (51-55, 61-65)
    { id: '55', number: 55, x: 10, y: 5, width: 8, height: 12, rotation: 0 },
    { id: '54', number: 54, x: 20, y: 5, width: 8, height: 12, rotation: 0 },
    { id: '53', number: 53, x: 30, y: 5, width: 8, height: 12, rotation: 0 },
    { id: '52', number: 52, x: 40, y: 5, width: 8, height: 12, rotation: 0 },
    { id: '51', number: 51, x: 50, y: 5, width: 8, height: 12, rotation: 0 },
    
    { id: '61', number: 61, x: 60, y: 5, width: 8, height: 12, rotation: 0 },
    { id: '62', number: 62, x: 70, y: 5, width: 8, height: 12, rotation: 0 },
    { id: '63', number: 63, x: 80, y: 5, width: 8, height: 12, rotation: 0 },
    { id: '64', number: 64, x: 90, y: 5, width: 8, height: 12, rotation: 0 },
    { id: '65', number: 65, x: 100, y: 5, width: 8, height: 12, rotation: 0 },
    
    // Dientes inferiores (71-75, 81-85)
    { id: '75', number: 75, x: 10, y: 75, width: 8, height: 12, rotation: 0 },
    { id: '74', number: 74, x: 20, y: 75, width: 8, height: 12, rotation: 0 },
    { id: '73', number: 73, x: 30, y: 75, width: 8, height: 12, rotation: 0 },
    { id: '72', number: 72, x: 40, y: 75, width: 8, height: 12, rotation: 0 },
    { id: '71', number: 71, x: 50, y: 75, width: 8, height: 12, rotation: 0 },
    
    { id: '81', number: 81, x: 60, y: 75, width: 8, height: 12, rotation: 0 },
    { id: '82', number: 82, x: 70, y: 75, width: 8, height: 12, rotation: 0 },
    { id: '83', number: 83, x: 80, y: 75, width: 8, height: 12, rotation: 0 },
    { id: '84', number: 84, x: 90, y: 75, width: 8, height: 12, rotation: 0 },
    { id: '85', number: 85, x: 100, y: 75, width: 8, height: 12, rotation: 0 },
  ]);

  const [selectedTooth, setSelectedTooth] = useState<DraggableTooth | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showNumbers, setShowNumbers] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, tooth: DraggableTooth) => {
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
    if (!isDragging || !selectedTooth || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    // Mantener dentro de los límites
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

  const handleWheel = (e: React.WheelEvent, tooth: DraggableTooth) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -5 : 5;
      
      setTeeth(prev => prev.map(t => 
        t.id === tooth.id 
          ? { ...t, rotation: t.rotation + delta }
          : t
      ));
    }
  };

  const updateToothProperty = (field: keyof DraggableTooth, value: number) => {
    if (!selectedTooth) return;
    
    setTeeth(prev => prev.map(tooth => 
      tooth.id === selectedTooth.id 
        ? { ...tooth, [field]: value }
        : tooth
    ));
    
    setSelectedTooth(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = () => {
    onPositionsSave(teeth);
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
        Ajustador de Dientes con Arrastre y Rotación
      </Text>
      
      <HStack spacing={8} align="start">
        {/* Contenedor de la imagen con dientes arrastrables */}
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
              cursor={isDragging ? 'grabbing' : 'grab'}
              border={selectedTooth?.id === tooth.id ? "2px solid red" : "1px solid blue"}
              borderRadius="50%"
              transition={isDragging ? 'none' : 'all 0.2s'}
              _hover={{
                border: "2px solid green",
                backgroundColor: "rgba(0, 255, 0, 0.1)"
              }}
              onMouseDown={(e) => handleMouseDown(e, tooth)}
              onWheel={(e) => handleWheel(e, tooth)}
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

        {/* Panel de control */}
        <VStack spacing={4} align="start" minW="250px">
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

          {selectedTooth && (
            <>
              <Text fontWeight="bold">Diente {selectedTooth.number}</Text>
              
              <Box>
                <Text fontSize="sm">Posición X (%)</Text>
                <NumberInput
                  value={selectedTooth.x}
                  onChange={(_, value) => updateToothProperty('x', value)}
                  min={0}
                  max={100}
                  step={1}
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
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>

              <Button colorScheme="blue" onClick={handleSave}>
                Guardar Posiciones
              </Button>
            </>
          )}

          <Text fontSize="sm" color="gray.600">
            💡 Instrucciones:
            <br />• Arrastra los dientes para moverlos
            <br />• Ctrl + Rueda para rotar
            <br />• Haz clic para seleccionar y editar
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export default DraggableTeethAdjuster; 