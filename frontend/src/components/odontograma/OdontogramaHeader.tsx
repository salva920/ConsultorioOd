import React from 'react';
import {
  Card,
  CardHeader,
  Flex,
  HStack,
  Icon,
  Heading,
  Badge,
  Button,
  Text,
  VStack,
  Box,
  SimpleGrid,
  Divider,
  Select,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FaUserMd, 
  FaLink, 
  FaTeeth, 
  FaTimes, 
  FaCheck, 
  FaStethoscope,
  FaEye
} from 'react-icons/fa';

interface OdontogramaHeaderProps {
  multiSelectMode: 'brackets' | 'protesis' | null;
  selectedTeethCount: number;
  patientName?: string;
  filterType: 'permanente' | 'temporal';
  viewMode: 'visual' | 'detallado';
  hasUnsavedChanges?: boolean;
  onStartMultiSelect: (mode: 'brackets' | 'protesis') => void;
  onCancelMultiSelect: () => void;
  onFinishMultiSelect: () => void;
  onOpenDiagnostico: () => void;
  onFilterTypeChange: (type: 'permanente' | 'temporal') => void;
  onViewModeChange: (mode: 'visual' | 'detallado') => void;
  onSave?: () => void;
}

const OdontogramaHeader: React.FC<OdontogramaHeaderProps> = ({
  multiSelectMode,
  selectedTeethCount,
  patientName,
  filterType,
  viewMode,
  hasUnsavedChanges = false,
  onStartMultiSelect,
  onCancelMultiSelect,
  onFinishMultiSelect,
  onOpenDiagnostico,
  onFilterTypeChange,
  onViewModeChange,
  onSave,
}) => {
  return (
    <Card w="full">
      <CardHeader py={4}>
        <VStack spacing={4} align="stretch">
          {/* Fila 1: Información del Paciente y Acciones Principales */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            {/* Información del Paciente */}
            <HStack spacing={4}>
              <Icon as={FaUserMd} color="blue.500" boxSize={5} />
            <VStack align="start" spacing={0}>
                <Heading size="md" color="gray.700">Odontograma</Heading>
              {patientName && (
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Paciente: {patientName}
                </Text>
              )}
              {hasUnsavedChanges && (
                <Badge colorScheme="orange" variant="solid" size="sm">
                  ⚠️ Cambios sin guardar
                </Badge>
              )}
            </VStack>
            {multiSelectMode && (
                <Badge 
                  colorScheme={multiSelectMode === 'brackets' ? 'pink' : 'orange'}
                  variant="solid"
                  px={3}
                  py={1}
                >
                Modo {multiSelectMode === 'brackets' ? 'Brackets' : 'Prótesis'}
              </Badge>
            )}
          </HStack>

            {/* Acciones Principales */}
            <HStack spacing={3} flexWrap="wrap">
              {/* Botón de Guardado */}
              {hasUnsavedChanges && onSave && (
                <Button
                  size="sm"
                  leftIcon={<FaCheck />}
                  colorScheme="green"
                  variant="solid"
                  onClick={onSave}
                  title="Guardar cambios"
                >
                  💾 Guardar
                </Button>
              )}
              
              {/* Botones de Intervención */}
            <Button
              size="sm"
              leftIcon={<FaLink />}
              colorScheme="pink"
              variant={multiSelectMode === 'brackets' ? 'solid' : 'outline'}
              onClick={() => onStartMultiSelect('brackets')}
              title="Ctrl+B"
            >
              Brackets
            </Button>
            <Button
              size="sm"
              leftIcon={<FaTeeth />}
              colorScheme="orange"
              variant={multiSelectMode === 'protesis' ? 'solid' : 'outline'}
              onClick={() => onStartMultiSelect('protesis')}
              title="Ctrl+P"
            >
              Prótesis
            </Button>
              <Button
                leftIcon={<FaStethoscope />}
                colorScheme="teal"
                onClick={onOpenDiagnostico}
                size="sm"
              >
                Diagnóstico
              </Button>

              {/* Botones de Control de Selección Múltiple */}
              {multiSelectMode && (
              <Button
                size="sm"
                leftIcon={<FaTimes />}
                colorScheme="gray"
                onClick={onCancelMultiSelect}
                title="Escape"
              >
                Cancelar
              </Button>
            )}
            {multiSelectMode && selectedTeethCount > 0 && (
              <Button
                size="sm"
                leftIcon={<FaCheck />}
                colorScheme="green"
                onClick={onFinishMultiSelect}
                title="Enter"
              >
                Finalizar ({selectedTeethCount})
              </Button>
            )}
            </HStack>
          </Flex>

          {/* Fila 2: Configuración y Leyenda */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            {/* Configuración de Tipo y Vista */}
            <HStack spacing={4}>
              {/* Tipo de Dentadura */}
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" fontWeight="bold" color="gray.600">
                  Tipo de Dentadura
                </Text>
                <Select
                  size="sm"
                  value={filterType}
                  onChange={(e) => onFilterTypeChange(e.target.value as 'permanente' | 'temporal')}
                  w="140px"
                >
                  <option value="permanente">Permanente</option>
                  <option value="temporal">Temporal</option>
                </Select>
              </VStack>

              {/* Modo de Vista */}
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" fontWeight="bold" color="gray.600">
                  Vista
                </Text>
                <Select
                  size="sm"
                  value={viewMode}
                  onChange={(e) => onViewModeChange(e.target.value as 'visual' | 'detallado')}
                  w="120px"
                >
                  <option value="visual">Visual</option>
                  <option value="detallado">Detallado</option>
                </Select>
              </VStack>
            </HStack>

            {/* Leyenda de Indicadores */}
            <HStack spacing={6}>
              <HStack spacing={2}>
                <Icon as={FaEye} color="gray.500" boxSize={4} />
                <Text fontSize="sm" fontWeight="bold" color="gray.700">
                  Leyenda:
                </Text>
              </HStack>
              <HStack spacing={4}>
                <HStack spacing={2}>
                  <Box
                    w="12px"
                    h="3px"
                    bg="purple.500"
                    borderRadius="full"
                  />
                  <Text fontSize="xs" color="gray.600">Brackets</Text>
                </HStack>
                <HStack spacing={2}>
                  <Box
                    w="12px"
                    h="3px"
                    bg="orange.500"
                    borderRadius="full"
                  />
                  <Text fontSize="xs" color="gray.600">Prótesis</Text>
                </HStack>
                <HStack spacing={2}>
                  <Box
                    w="10px"
                    h="3px"
                    bg="blue.500"
                    borderRadius="full"
                  />
                  <Text fontSize="xs" color="gray.600">Conexión</Text>
                </HStack>
                <HStack spacing={2}>
                  <Box
                    w="16px"
                    h="16px"
                    bg="orange.500"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="xs" color="white" fontWeight="bold">1</Text>
                  </Box>
                  <Text fontSize="xs" color="gray.600">Intervenciones</Text>
                </HStack>
                <HStack spacing={2}>
                  <Box
                    w="12px"
                    h="12px"
                    bg="green.100"
                    border="2px solid"
                    borderColor="green.500"
                    borderRadius="md"
                  />
                  <Text fontSize="xs" color="gray.600">Seleccionado</Text>
                </HStack>
              </HStack>
          </HStack>
        </Flex>
        </VStack>
      </CardHeader>
    </Card>
  );
};

export default OdontogramaHeader; 