import React from 'react';
import {
  Box,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Badge,
  Progress,
  Divider,
} from '@chakra-ui/react';
import { Tooth } from './types';

interface OdontogramaStatsProps {
  teeth: Tooth[];
  filterType?: 'permanente' | 'temporal';
}

const OdontogramaStats: React.FC<OdontogramaStatsProps> = ({
  teeth,
  filterType = 'permanente'
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Filtrar dientes según el tipo de dentadura
  const filteredTeeth = teeth.filter(tooth => {
    const toothType = getTipoDentadura(tooth.number);
    return toothType === filterType;
  });

  // Calcular estadísticas
  const totalTeeth = filteredTeeth.length;
  const healthyTeeth = filteredTeeth.filter(t => t.condition === 'sano').length;
  const treatedTeeth = filteredTeeth.filter(t => t.condition !== 'sano').length;
  const teethWithInterventions = filteredTeeth.filter(t => 
    t.interventions.some(int => int.status !== 'cancelado')
  ).length;

  // Contar intervenciones por tipo
  const interventionCounts = filteredTeeth.reduce((acc, tooth) => {
    tooth.interventions
      .filter(int => int.status !== 'cancelado')
      .forEach(intervention => {
        acc[intervention.procedure] = (acc[intervention.procedure] || 0) + 1;
      });
    return acc;
  }, {} as Record<string, number>);

  // Contar condiciones por tipo
  const conditionCounts = filteredTeeth.reduce((acc, tooth) => {
    acc[tooth.condition] = (acc[tooth.condition] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calcular porcentajes
  const healthyPercentage = totalTeeth > 0 ? (healthyTeeth / totalTeeth) * 100 : 0;
  const treatedPercentage = totalTeeth > 0 ? (treatedTeeth / totalTeeth) * 100 : 0;
  const interventionPercentage = totalTeeth > 0 ? (teethWithInterventions / totalTeeth) * 100 : 0;

  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
      w="100%"
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color={textColor} textAlign="center">
          Estadísticas del Odontograma - {filterType === 'permanente' ? 'Dentadura Permanente' : 'Dentadura Temporal'}
        </Text>

        <Divider />

        {/* Estadísticas principales */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Stat>
            <StatLabel>Total Dientes</StatLabel>
            <StatNumber color="blue.500">{totalTeeth}</StatNumber>
            <StatHelpText>En {filterType}</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>Dientes Sanos</StatLabel>
            <StatNumber color="green.500">{healthyTeeth}</StatNumber>
            <StatHelpText>{healthyPercentage.toFixed(1)}% del total</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>Dientes Tratados</StatLabel>
            <StatNumber color="orange.500">{treatedTeeth}</StatNumber>
            <StatHelpText>{treatedPercentage.toFixed(1)}% del total</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>Con Intervenciones</StatLabel>
            <StatNumber color="purple.500">{teethWithInterventions}</StatNumber>
            <StatHelpText>{interventionPercentage.toFixed(1)}% del total</StatHelpText>
          </Stat>
        </SimpleGrid>

        <Divider />

        {/* Barras de progreso */}
        <VStack spacing={3} align="stretch">
          <Text fontSize="sm" fontWeight="semibold">Estado General:</Text>
          
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs">Dientes Sanos</Text>
              <Text fontSize="xs" fontWeight="bold">{healthyPercentage.toFixed(1)}%</Text>
            </HStack>
            <Progress value={healthyPercentage} colorScheme="green" size="sm" />
          </Box>

          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs">Dientes Tratados</Text>
              <Text fontSize="xs" fontWeight="bold">{treatedPercentage.toFixed(1)}%</Text>
            </HStack>
            <Progress value={treatedPercentage} colorScheme="orange" size="sm" />
          </Box>

          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs">Con Intervenciones</Text>
              <Text fontSize="xs" fontWeight="bold">{interventionPercentage.toFixed(1)}%</Text>
            </HStack>
            <Progress value={interventionPercentage} colorScheme="purple" size="sm" />
          </Box>
        </VStack>

        <Divider />

        {/* Condiciones de dientes */}
        {Object.keys(conditionCounts).length > 0 && (
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" fontWeight="semibold">Condiciones de Dientes:</Text>
            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
              {Object.entries(conditionCounts).map(([condition, count]) => (
                <HStack key={condition} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                  <Badge colorScheme={getConditionColorScheme(condition)} variant="subtle">
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </Badge>
                  <Text fontSize="sm" fontWeight="bold">{count}</Text>
                </HStack>
              ))}
            </SimpleGrid>
          </VStack>
        )}

        <Divider />

        {/* Intervenciones por tipo */}
        {Object.keys(interventionCounts).length > 0 && (
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" fontWeight="semibold">Intervenciones por Tipo:</Text>
            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
              {Object.entries(interventionCounts).map(([procedure, count]) => (
                <HStack key={procedure} justify="space-between" p={2} bg="blue.50" borderRadius="md">
                  <Badge colorScheme="blue" variant="subtle">
                    {procedure}
                  </Badge>
                  <Text fontSize="sm" fontWeight="bold">{count}</Text>
                </HStack>
              ))}
            </SimpleGrid>
          </VStack>
        )}

        {/* Resumen */}
        <Box
          bg={healthyPercentage > 70 ? "green.50" : healthyPercentage > 40 ? "yellow.50" : "red.50"}
          p={3}
          borderRadius="md"
          border="1px solid"
          borderColor={healthyPercentage > 70 ? "green.200" : healthyPercentage > 40 ? "yellow.200" : "red.200"}
        >
          <Text fontSize="sm" fontWeight="semibold" textAlign="center">
            {healthyPercentage > 70 
              ? "✅ Salud dental excelente" 
              : healthyPercentage > 40 
                ? "⚠️ Salud dental moderada" 
                : "❌ Requiere atención dental urgente"
            }
          </Text>
          <Text fontSize="xs" textAlign="center" mt={1}>
            {healthyTeeth} de {totalTeeth} dientes están en buen estado
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

// Función auxiliar para obtener el color scheme de las condiciones
const getConditionColorScheme = (condition: string): string => {
  const colorMap: Record<string, string> = {
    sano: 'green',
    caries: 'red',
    restaurado: 'blue',
    ausente: 'gray',
    extraccion: 'purple',
    endodoncia: 'yellow',
    corona: 'orange',
    implante: 'cyan'
  };
  return colorMap[condition] || 'gray';
};

// Función auxiliar para obtener el tipo de dentadura (importada desde types.ts)
const getTipoDentadura = (number: number): 'permanente' | 'temporal' => {
  // Dientes permanentes (11-48)
  if (number >= 11 && number <= 48) return 'permanente';
  // Dientes temporales (51-85)
  if (number >= 51 && number <= 85) return 'temporal';
  return 'temporal'; // Por defecto
};

export default OdontogramaStats; 