import React from 'react';
import {
  Box,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Grid,
  GridItem,
  Badge,
  Tooltip,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { Tooth, Intervention, getTipoDentadura } from './types';
import OdontogramaStats from './OdontogramaStats';
import { motion, AnimatePresence } from 'framer-motion';

interface OdontogramaDetalladoProps {
  teeth: Tooth[];
  selectedTooth: Tooth | null;
  onToothClick: (tooth: Tooth) => void;
  filterType?: 'permanente' | 'temporal';
}

// Configuración de colores para diferentes condiciones
const CONDITION_COLORS = {
  sano: '#48BB78',
  caries: '#E53E3E',
  restaurado: '#4299E1',
  ausente: '#718096',
  extraccion: '#805AD5',
  endodoncia: '#D69E2E',
  corona: '#F6AD55',
  implante: '#4FD1C5'
};

// Configuración de colores para diferentes procedimientos
const PROCEDURE_COLORS = {
  'Brackets': '#3182CE',
  'Prótesis': '#38A169',
  'Caries': '#E53E3E',
  'Endodoncia': '#D69E2E',
  'Corona': '#F6AD55',
  'Implante': '#4FD1C5',
  'Extracción': '#805AD5',
  'Restauración': '#4299E1',
  'Limpieza': '#38B2AC',
  'Blanqueamiento': '#F6E05E'
};

// Configuración de posiciones de los dientes en el odontograma detallado
const TOOTH_POSITIONS = {
  // Dientes permanentes
  // Superior derecho (11-18)
  11: { row: 0, col: 7, label: '11' },
  12: { row: 0, col: 6, label: '12' },
  13: { row: 0, col: 5, label: '13' },
  14: { row: 0, col: 4, label: '14' },
  15: { row: 0, col: 3, label: '15' },
  16: { row: 0, col: 2, label: '16' },
  17: { row: 0, col: 1, label: '17' },
  18: { row: 0, col: 0, label: '18' },
  
  // Superior izquierdo (21-28)
  21: { row: 0, col: 8, label: '21' },
  22: { row: 0, col: 9, label: '22' },
  23: { row: 0, col: 10, label: '23' },
  24: { row: 0, col: 11, label: '24' },
  25: { row: 0, col: 12, label: '25' },
  26: { row: 0, col: 13, label: '26' },
  27: { row: 0, col: 14, label: '27' },
  28: { row: 0, col: 15, label: '28' },
  
  // Inferior izquierdo (31-38)
  31: { row: 1, col: 15, label: '31' },
  32: { row: 1, col: 14, label: '32' },
  33: { row: 1, col: 13, label: '33' },
  34: { row: 1, col: 12, label: '34' },
  35: { row: 1, col: 11, label: '35' },
  36: { row: 1, col: 10, label: '36' },
  37: { row: 1, col: 9, label: '37' },
  38: { row: 1, col: 8, label: '38' },
  
  // Inferior derecho (41-48)
  41: { row: 1, col: 0, label: '41' },
  42: { row: 1, col: 1, label: '42' },
  43: { row: 1, col: 2, label: '43' },
  44: { row: 1, col: 3, label: '44' },
  45: { row: 1, col: 4, label: '45' },
  46: { row: 1, col: 5, label: '46' },
  47: { row: 1, col: 6, label: '47' },
  48: { row: 1, col: 7, label: '48' },
  
  // Dientes temporales
  // Superior derecho (51-55)
  51: { row: 2, col: 7, label: '51' },
  52: { row: 2, col: 6, label: '52' },
  53: { row: 2, col: 5, label: '53' },
  54: { row: 2, col: 4, label: '54' },
  55: { row: 2, col: 3, label: '55' },
  
  // Superior izquierdo (61-65)
  61: { row: 2, col: 8, label: '61' },
  62: { row: 2, col: 9, label: '62' },
  63: { row: 2, col: 10, label: '63' },
  64: { row: 2, col: 11, label: '64' },
  65: { row: 2, col: 12, label: '65' },
  
  // Inferior izquierdo (71-75)
  71: { row: 3, col: 12, label: '71' },
  72: { row: 3, col: 11, label: '72' },
  73: { row: 3, col: 10, label: '73' },
  74: { row: 3, col: 9, label: '74' },
  75: { row: 3, col: 8, label: '75' },
  
  // Inferior derecho (81-85)
  81: { row: 3, col: 3, label: '81' },
  82: { row: 3, col: 4, label: '82' },
  83: { row: 3, col: 5, label: '83' },
  84: { row: 3, col: 6, label: '84' },
  85: { row: 3, col: 7, label: '85' }
};

const OdontogramaDetallado: React.FC<OdontogramaDetalladoProps> = ({
  teeth,
  selectedTooth,
  onToothClick,
  filterType = 'permanente'
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const toast = useToast();
  const MotionBox = motion.create(Box);
  const panelVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
  };

  // Función para obtener el color de fondo basado en la condición del diente
  const getToothBackgroundColor = (tooth: Tooth) => {
    return CONDITION_COLORS[tooth.condition as keyof typeof CONDITION_COLORS] || '#E2E8F0';
  };

  // Función para obtener el color de los procedimientos
  const getProcedureColor = (procedure: string) => {
    return PROCEDURE_COLORS[procedure as keyof typeof PROCEDURE_COLORS] || '#718096';
  };

  // Función para renderizar las partes del diente con geometría tradicional
  const renderToothParts = (tooth: Tooth) => {
    const interventions = tooth.interventions.filter(int => int.status !== 'cancelado');

    const baseColor = getToothBackgroundColor(tooth);
    const getColorForPart = (part: 'superior' | 'inferior' | 'izquierda' | 'derecha' | 'centro') => {
      const intMatch = interventions.find(i => i.part === part) || interventions.find(i => i.part === 'todo');
      return intMatch ? getProcedureColor(intMatch.procedure) : baseColor;
    };

    // Si no hay intervenciones, devolver solo el fondo con el borde
    if (interventions.length === 0) {
      return (
        <Box
          w="100%"
          h="100%"
          bg={baseColor}
          borderRadius="sm"
          border="1px solid"
          borderColor={borderColor}
        />
      );
    }

    // Geometría tradicional: grid 3x3 (esquinas solo de fondo, lados y centro coloreados)
    return (
      <Box
        w="100%"
        h="100%"
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        gridTemplateRows="repeat(3, 1fr)"
        gap="2px"
        bg={borderColor}
        borderRadius="sm"
        p="1px"
      >
        {/* fila 1 */}
        <Box bg={baseColor} />
        <Box bg={getColorForPart('superior')} />
        <Box bg={baseColor} />
        {/* fila 2 */}
        <Box bg={getColorForPart('izquierda')} />
        <Box
          bg={getColorForPart('centro')}
          m="3px"
          borderRadius="xs"
        />
        <Box bg={getColorForPart('derecha')} />
        {/* fila 3 */}
        <Box bg={baseColor} />
        <Box bg={getColorForPart('inferior')} />
        <Box bg={baseColor} />
      </Box>
    );
  };

  // Función para renderizar un diente individual
  const renderTooth = (tooth: Tooth) => {
    const position = TOOTH_POSITIONS[tooth.number as keyof typeof TOOTH_POSITIONS];
    if (!position) return null;

    const isSelected = selectedTooth?.id === tooth.id;
    const hasInterventions = tooth.interventions.some(int => int.status !== 'cancelado');
    const interventions = tooth.interventions.filter(int => int.status !== 'cancelado');

    return (
      <GridItem
        key={tooth.id}
        gridRow={position.row + 1}
        gridColumn={position.col + 1}
        cursor="pointer"
        onClick={() => onToothClick(tooth)}
        _hover={{
          transform: 'scale(1.05)',
          zIndex: 10,
        }}
        transition="all 0.2s"
        position="relative"
      >
        <VStack spacing={1} align="center">
          {/* Representación visual del diente */}
          <Box
            w="40px"
            h="60px"
            position="relative"
            border={isSelected ? "3px solid" : "1px solid"}
            borderColor={isSelected ? "blue.500" : borderColor}
            borderRadius="sm"
            overflow="hidden"
            bg={bgColor}
            boxShadow={isSelected ? "0 0 0 2px blue.200" : "none"}
          >
            {renderToothParts(tooth)}
          </Box>
          
          {/* Número del diente */}
          <Text
            fontSize="xs"
            fontWeight="bold"
            color={textColor}
            textAlign="center"
          >
            {position.label}
          </Text>
          
          {/* Indicador de intervenciones */}
          {hasInterventions && (
            <Badge
              size="sm"
              colorScheme="blue"
              variant="solid"
              position="absolute"
              top="-8px"
              right="-8px"
              borderRadius="full"
              minW="16px"
              h="16px"
              fontSize="xs"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {interventions.length}
            </Badge>
          )}
        </VStack>
      </GridItem>
    );
  };

  // Filtrar dientes según el tipo de dentadura
  const filteredTeeth = teeth.filter(tooth => {
    const toothType = getTipoDentadura(tooth.number);
    return toothType === filterType;
  });

  // Crear matriz de dientes para el grid
  const createToothMatrix = () => {
    const matrix: (Tooth | null)[][] = [];
    
    // Inicializar matriz vacía
    for (let i = 0; i < 4; i++) {
      matrix[i] = [];
      for (let j = 0; j < 16; j++) {
        matrix[i][j] = null;
      }
    }
    
    // Colocar dientes en sus posiciones
    filteredTeeth.forEach(tooth => {
      const position = TOOTH_POSITIONS[tooth.number as keyof typeof TOOTH_POSITIONS];
      if (position) {
        matrix[position.row][position.col] = tooth;
      }
    });
    
    return matrix;
  };

  const toothMatrix = createToothMatrix();

  return (
    <Box
      bg={bgColor}
      border="2px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
      maxW="1000px"
      mx="auto"
    >
      <Tabs variant="enclosed" colorScheme="blue" isFitted>
        <TabList mb={4}>
          <Tab>Odontograma</Tab>
          <Tab>Estadísticas</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <AnimatePresence mode="wait">
              <MotionBox key="panel-odontograma" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
                <VStack spacing={4} align="stretch">
                  <Text fontSize="xl" fontWeight="bold" color={textColor} textAlign="center">
                    Odontograma Detallado - {filterType === 'permanente' ? 'Dentadura Permanente' : 'Dentadura Temporal'}
                  </Text>
                  <Box bg={bgColor} border="1px solid" borderColor={borderColor} borderRadius="md" p={4} w="100%">
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Leyenda:</Text>
                    <HStack spacing={4} flexWrap="wrap">
                      <HStack spacing={2}><Box w="4" h="4" bg={CONDITION_COLORS.sano} borderRadius="sm" /><Text fontSize="xs">Sano</Text></HStack>
                      <HStack spacing={2}><Box w="4" h="4" bg={CONDITION_COLORS.caries} borderRadius="sm" /><Text fontSize="xs">Caries</Text></HStack>
                      <HStack spacing={2}><Box w="4" h="4" bg={CONDITION_COLORS.restaurado} borderRadius="sm" /><Text fontSize="xs">Restaurado</Text></HStack>
                      <HStack spacing={2}><Box w="4" h="4" bg={CONDITION_COLORS.ausente} borderRadius="sm" /><Text fontSize="xs">Ausente</Text></HStack>
                      <HStack spacing={2}><Box w="4" h="4" bg={PROCEDURE_COLORS['Brackets']} borderRadius="sm" /><Text fontSize="xs">Brackets</Text></HStack>
                      <HStack spacing={2}><Box w="4" h="4" bg={PROCEDURE_COLORS['Prótesis']} borderRadius="sm" /><Text fontSize="xs">Prótesis</Text></HStack>
                    </HStack>
                  </Box>

                  <Box border="2px solid" borderColor={borderColor} borderRadius="lg" p={4} bg={bgColor}>
                    <Grid templateColumns="repeat(16, 1fr)" templateRows="repeat(4, 1fr)" gap={2} w="100%" h="300px">
                      {filteredTeeth.map(renderTooth)}
                    </Grid>
                  </Box>

                  {selectedTooth && (
                    <Box bg={bgColor} border="1px solid" borderColor={borderColor} borderRadius="md" p={4} w="100%">
                      <Text fontSize="md" fontWeight="bold" mb={2}>Diente {selectedTooth.number} - {selectedTooth.condition}</Text>
                      {selectedTooth.interventions.length > 0 && (
                        <VStack spacing={2} align="start">
                          <Text fontSize="sm" fontWeight="semibold">Intervenciones:</Text>
                          {selectedTooth.interventions.filter(int => int.status !== 'cancelado').map((intervention) => (
                            <Box key={intervention.id} bg={getProcedureColor(intervention.procedure)} color="white" px={3} py={1} borderRadius="md" fontSize="xs">
                              <Text fontWeight="bold">{intervention.procedure}</Text>
                              <Text fontSize="xs" opacity={0.9}>{intervention.part && intervention.part !== 'todo' ? `Parte: ${intervention.part}` : 'Todo el diente'}</Text>
                              <Text fontSize="xs" opacity={0.8}>Estado: {intervention.status}</Text>
                            </Box>
                          ))}
                        </VStack>
                      )}
                    </Box>
                  )}
                </VStack>
              </MotionBox>
            </AnimatePresence>
          </TabPanel>
          <TabPanel p={0}>
            <AnimatePresence mode="wait">
              <MotionBox key="panel-stats" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
                <OdontogramaStats teeth={teeth} filterType={filterType} />
              </MotionBox>
            </AnimatePresence>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default OdontogramaDetallado; 