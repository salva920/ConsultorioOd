import React from 'react';
import { Box, Icon, useColorModeValue, Text } from '@chakra-ui/react';
import { FaCheck } from 'react-icons/fa';

interface ToothShapeProps {
  type: string;
  condition: string;
  isSelected: boolean;
  isMultiSelected?: boolean;
  multiSelectMode?: 'brackets' | 'protesis' | null;
  onClick: () => void;
  hasBrackets?: boolean;
  hasProtesis?: boolean;
  isConnected?: boolean;
  connectionType?: 'start' | 'middle' | 'end';
  position?: number;
  rotation?: number;
  size?: { width: number; height: number };
  hasInterventions?: boolean;
  interventionCount?: number;
}

const ToothShape: React.FC<ToothShapeProps> = ({ 
  type, 
  condition, 
  isSelected, 
  isMultiSelected,
  multiSelectMode,
  onClick,
  hasBrackets = false,
  hasProtesis = false,
  isConnected = false,
  connectionType,
  position,
  rotation = 0,
  size = { width: 1, height: 1 },
  hasInterventions = false,
  interventionCount = 0
}) => {
  const borderColor = useColorModeValue('gray.400', 'gray.500');
  const selectedBorderColor = useColorModeValue('blue.500', 'blue.300');
  const multiSelectedBorderColor = useColorModeValue('purple.500', 'purple.300');
  
  // Colores según la condición del diente
  const getConditionColor = () => {
    switch (condition) {
      case 'sano': return useColorModeValue('green.100', 'green.900');
      case 'caries': return useColorModeValue('red.100', 'red.900');
      case 'restaurado': return useColorModeValue('blue.100', 'blue.900');
      case 'ausente': return useColorModeValue('gray.100', 'gray.900');
      case 'extraccion': return useColorModeValue('purple.100', 'purple.900');
      case 'endodoncia': return useColorModeValue('yellow.100', 'yellow.900');
      case 'corona': return useColorModeValue('orange.100', 'orange.900');
      case 'implante': return useColorModeValue('teal.100', 'teal.900');
      default: return useColorModeValue('white', 'gray.800');
    }
  };

  // Determinar el borde según el estado
  const getBorderStyle = () => {
    if (isMultiSelected) {
      return `3px solid ${multiSelectedBorderColor}`;
    }
    if (isSelected) {
      return `3px solid ${selectedBorderColor}`;
    }
    return `2px solid ${borderColor}`;
  };

  // Determinar el color de fondo
  const getBackgroundColor = () => {
    if (isMultiSelected) {
      return useColorModeValue('purple.50', 'purple.900');
    }
    if (isSelected) {
      return useColorModeValue('blue.50', 'blue.900');
    }
    return getConditionColor();
  };

  // Determinar la opacidad basada en la condición
  const getOpacity = () => {
    if (condition === 'ausente' || condition === 'extraccion') {
      // Si está en modo prótesis, hacer más visible para permitir selección
      if (multiSelectMode === 'protesis') {
        return 0.6; // Más visible para selección de prótesis
      }
      return 0.3; // Muy transparente para dientes ausentes/extraídos
    }
    // Si tiene brackets, hacer menos transparente para ocultar mejor el alambre
    if (hasBrackets) {
      return 0.95;
    }
    return 0.8; // Opacidad normal para otros dientes
  };

  // Determinar si el diente está ausente o extraído
  const isMissingOrExtracted = condition === 'ausente' || condition === 'extraccion';
  
  // Determinar si el diente puede ser seleccionado (ausente puede ser seleccionado para corona/implante)
  const canBeSelected = !isMissingOrExtracted || multiSelectMode === 'protesis';

  // Tamaño base más grande
  const baseSize = 30; // Aumentado de 20 a 30
  const width = size.width * baseSize;
  const height = size.height * baseSize;

  return (
    <Box
      position="relative"
      width={`${width}px`}
      height={`${height}px`}
      bg={getBackgroundColor()}
      border={getBorderStyle()}
      borderRadius="md"
      cursor={canBeSelected ? "pointer" : "default"}
      onClick={canBeSelected ? onClick : undefined}
      transform={`rotate(${rotation}deg)`}
      transition="all 0.2s ease"
      _hover={canBeSelected ? {
        transform: `rotate(${rotation}deg) scale(1.1)`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 15
      } : {}}
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={isSelected || isMultiSelected ? 10 : 5}
      opacity={getOpacity()}
    >
      {/* Indicador de brackets */}
      {hasBrackets && !isMissingOrExtracted && (
        <Box
          position="absolute"
          top="-3px"
          left="50%"
          transform="translateX(-50%)"
          width="12px"
          height="3px"
          bg={useColorModeValue('purple.500', 'purple.300')}
          borderRadius="full"
        />
      )}

      {/* Indicador de prótesis */}
      {hasProtesis && !isMissingOrExtracted && (
        <Box
          position="absolute"
          top="-3px"
          right="50%"
          transform="translateX(50%)"
          width="12px"
          height="3px"
          bg={useColorModeValue('orange.500', 'orange.300')}
          borderRadius="full"
        />
      )}

      {/* Indicador de conexión de brackets */}
      {isConnected && (
        <Box
          position="absolute"
          bottom="-3px"
          left="50%"
          transform="translateX(-50%)"
          width="10px"
          height="3px"
          bg={useColorModeValue('blue.500', 'blue.300')}
          borderRadius="full"
        />
      )}

      {/* Icono de selección múltiple */}
      {isMultiSelected && (
        <Icon
          as={FaCheck}
          color={multiSelectedBorderColor}
          position="absolute"
          top="3px"
          right="3px"
          fontSize="sm"
        />
      )}

      {/* Indicador especial para dientes ausentes seleccionados en modo prótesis */}
      {isMissingOrExtracted && isSelected && multiSelectMode === 'protesis' && (
        <Box
          position="absolute"
          top="-2px"
          left="-2px"
          width="8px"
          height="8px"
          bg={useColorModeValue('orange.500', 'orange.300')}
          borderRadius="full"
          border="1px solid"
          borderColor={useColorModeValue('white', 'gray.800')}
        />
      )}

      {/* Indicador de intervenciones */}
      {hasInterventions && !isMissingOrExtracted && (
        <Box
          position="absolute"
          top="-8px"
          right="-8px"
          width="16px"
          height="16px"
          bg={useColorModeValue('orange.500', 'orange.300')}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          border="2px solid"
          borderColor={useColorModeValue('white', 'gray.800')}
          zIndex={20}
        >
          <Text
            fontSize="xs"
            fontWeight="bold"
            color="white"
            userSelect="none"
            pointerEvents="none"
          >
            {interventionCount > 9 ? '9+' : interventionCount}
          </Text>
        </Box>
      )}

      {/* Número del diente o indicador de ausente */}
      {isMissingOrExtracted ? (
        <Text
          fontSize="xs"
          fontWeight="bold"
          color={multiSelectMode === 'protesis' ? 
            useColorModeValue('gray.600', 'gray.400') : 
            useColorModeValue('gray.400', 'gray.600')
          }
          userSelect="none"
          pointerEvents="none"
          textAlign="center"
        >
          {multiSelectMode === 'protesis' ? position : '✕'}
        </Text>
      ) : (
        <Text
          fontSize="xs"
          fontWeight="bold"
          color={useColorModeValue('gray.700', 'gray.300')}
          userSelect="none"
          pointerEvents="none"
          textAlign="center"
        >
          {position}
        </Text>
      )}
    </Box>
  );
};

export default ToothShape; 