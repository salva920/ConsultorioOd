import React, { useState, useRef } from 'react';
import {
  Box,
  Text,
  useColorModeValue,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  IconButton,
  Button,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { FiMaximize2, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ToothShape from './ToothShape';
import { Tooth, getToothPosition, getToothCuadrante, getToothType, getToothRotation } from './types';

interface OdontogramaCuadrantesProps {
  teeth: Tooth[];
  selectedTooth: Tooth | null;
  multiSelectMode: 'brackets' | 'protesis' | null;
  selectedTeeth: string[];
  onToothClick: (tooth: Tooth) => void;
  onMultiSelectToothClick: (toothId: string) => void;
  hasBrackets: (tooth: Tooth) => boolean;
  hasProtesis: (tooth: Tooth) => boolean;
  getBracketConnection: (tooth: Tooth) => { isConnected: boolean; connectionType?: 'start' | 'middle' | 'end' };
  onTeethUpdate?: (teeth: Tooth[]) => void;
  onPositionsUpdate?: (teeth: Tooth[]) => void;
  filterType?: 'permanente' | 'temporal';
  patientId?: string;
}

const OdontogramaCuadrantes: React.FC<OdontogramaCuadrantesProps> = ({
  teeth,
  selectedTooth,
  multiSelectMode,
  selectedTeeth,
  onToothClick,
  onMultiSelectToothClick,
  hasBrackets,
  hasProtesis,
  getBracketConnection,
  onTeethUpdate,
  onPositionsUpdate,
  filterType = 'permanente',
  patientId,
}) => {

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const toast = useToast();
  
  // Imagen de fondo simplificada
  const getDefaultBackgroundImage = () => {
    if (filterType === 'temporal') {
      return '/primarios.jpg';
    }
    return '/4037ecb32d029281a0c64e876fcf56be-Photoroom.png';
  };
  
  const [referenceImage, setReferenceImage] = useState<string>(getDefaultBackgroundImage());
  const [adjustedTeeth, setAdjustedTeeth] = useState<Tooth[]>(teeth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  // Debug del modal
  React.useEffect(() => {
    // Modal state tracking removed for cleaner console
  }, [isModalOpen]);
  const odontogramaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Actualizar adjustedTeeth cuando teeth cambie
  React.useEffect(() => {
    setAdjustedTeeth(teeth);
  }, [teeth]);

  // Cargar imagen de referencia desde el servidor
  React.useEffect(() => {
    // No se usa imagen de referencia del servidor, usar imagen por defecto
    setReferenceImage(getDefaultBackgroundImage());
  }, [filterType]);

  const renderTooth = (tooth: Tooth) => {
    
    // Usar posiciones del servidor o por defecto
    const position = tooth.posX !== undefined && tooth.posY !== undefined 
      ? { posX: tooth.posX, posY: tooth.posY }
      : getToothPosition(tooth.number);
    
    const bracketConnection = getBracketConnection(tooth);
    const rotation = tooth.rotation !== undefined ? tooth.rotation : getToothRotation(tooth.number);
    const size = tooth.size || { width: 1, height: 1 };
    
    // Calcular información de intervenciones
    const activeInterventions = tooth.interventions.filter(int => int.status !== 'cancelado');
    const hasInterventions = activeInterventions.length > 0;
    const interventionCount = activeInterventions.length;
    
    return (
      <Box
        key={tooth.id}
        position="absolute"
        left={`${position.posX}px`}
        top={`${position.posY}px`}
        transform="translate(-50%, -50%)"
        zIndex={10}
        cursor="pointer"
        _hover={{
          transform: 'translate(-50%, -50%) scale(1.05)',
          zIndex: 15,
        }}
      >
        <ToothShape
          type={tooth.type || 'incisivo'}
          condition={tooth.condition}
          isSelected={selectedTooth?.id === tooth.id}
          isMultiSelected={(multiSelectMode && selectedTeeth.includes(tooth.id)) || undefined}
          multiSelectMode={multiSelectMode}
          onClick={() => {
              multiSelectMode ? onMultiSelectToothClick(tooth.id) : onToothClick(tooth);
          }}
          hasBrackets={hasBrackets(tooth)}
          hasProtesis={hasProtesis(tooth)}
          isConnected={bracketConnection.isConnected}
          connectionType={bracketConnection.connectionType}
          position={tooth.number}
          rotation={rotation}
          size={size}
          hasInterventions={hasInterventions}
          interventionCount={interventionCount}
        />
      </Box>
    );
  };



  return (
    <VStack spacing={4} align="stretch">




      {/* Odontograma principal */}
      <Box
        ref={odontogramaRef}
        id="odontograma-container"
        position="relative"
        w="820px"
        minH="600px"
        bg={bgColor}
        border="2px solid"
        borderColor={borderColor}
        borderRadius="lg"
        mx="auto"
        overflow="hidden"
        mb={20}
        pt={4}
        pb={4}
        transformOrigin="center center"

      >
        {/* Controles en la esquina superior derecha */}
        <HStack
          position="absolute"
          top="10px"
          right="10px"
          zIndex={30}
          spacing={2}
        >
          {/* Botón de zoom */}
          <Box
            bg="white"
            borderRadius="full"
            p={2}
            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
            cursor="pointer"
            _hover={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              transform: "scale(1.1)"
            }}
            onClick={() => {
              setIsModalOpen(true);
            }}
            title="Ver odontograma completo"
          >
            <FiMaximize2 size={16} />
          </Box>
        </HStack>
        {/* Fondo con colores de cuadrantes modernos */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex={0}
          overflow="hidden"
        >
          {/* Cuadrante Superior Derecho */}
          <Box
            position="absolute"
            top="0"
            left="0"
            w="50%"
            h="50%"
            bg="linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)"
            borderRight="2px solid"
            borderBottom="2px solid"
            borderColor="blue.200"
          />
          
          {/* Cuadrante Superior Izquierdo */}
          <Box
            position="absolute"
            top="0"
            right="0"
            w="50%"
            h="50%"
            bg="linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)"
            borderLeft="2px solid"
            borderBottom="2px solid"
            borderColor="purple.200"
          />
          
          {/* Cuadrante Inferior Derecho */}
          <Box
            position="absolute"
            bottom="0"
            left="0"
            w="50%"
            h="50%"
            bg="linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)"
            borderRight="2px solid"
            borderTop="2px solid"
            borderColor="green.200"
          />
          
          {/* Cuadrante Inferior Izquierdo */}
          <Box
            position="absolute"
            bottom="0"
            right="0"
            w="50%"
            h="50%"
            bg="linear-gradient(135deg, #FFF3E0 0%, #FFCC80 100%)"
            borderLeft="2px solid"
            borderTop="2px solid"
            borderColor="orange.200"
          />
        </Box>

        {/* Imagen del odontograma por delante */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex={1}
          backgroundImage={`url(${referenceImage})`}
          backgroundSize="70%"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          pointerEvents="none"
        />

        {/* Etiquetas de cuadrantes con mejor contraste */}
        <Box
          position="absolute"
          top="20px"
          left="20px"
          fontSize="sm"
          fontWeight="bold"
          color="blue.700"
          zIndex={5}
          bg="white"
          px={3}
          py={2}
          borderRadius="lg"
          border="2px solid"
          borderColor="blue.300"
          boxShadow="0 2px 8px rgba(59, 130, 246, 0.2)"
        >
          Superior Derecho
        </Box>
        <Box
          position="absolute"
          top="20px"
          right="20px"
          fontSize="sm"
          fontWeight="bold"
          color="purple.700"
          zIndex={5}
          bg="white"
          px={3}
          py={2}
          borderRadius="lg"
          border="2px solid"
          borderColor="purple.300"
          boxShadow="0 2px 8px rgba(147, 51, 234, 0.2)"
        >
          Superior Izquierdo
        </Box>
        <Box
          position="absolute"
          bottom="20px"
          left="20px"
          fontSize="sm"
          fontWeight="bold"
          color="green.700"
          zIndex={5}
          bg="white"
          px={3}
          py={2}
          borderRadius="lg"
          border="2px solid"
          borderColor="green.300"
          boxShadow="0 2px 8px rgba(34, 197, 94, 0.2)"
        >
          Inferior Derecho
        </Box>
        <Box
          position="absolute"
          bottom="20px"
          right="20px"
          fontSize="sm"
          fontWeight="bold"
          color="orange.700"
          zIndex={5}
          bg="white"
          px={3}
          py={2}
          borderRadius="lg"
          border="2px solid"
          borderColor="orange.300"
          boxShadow="0 2px 8px rgba(249, 115, 22, 0.2)"
        >
          Inferior Izquierdo
        </Box>

        {/* Renderizar dientes */}
        {teeth.length > 0 ? (
            teeth.map(renderTooth)
        ) : (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg="red.100"
            p={4}
            borderRadius="md"
            border="2px solid red"
            zIndex={20}
          >
            <Text color="red.700" fontWeight="bold">
              No hay dientes cargados ({teeth.length})
            </Text>
          </Box>
        )}

        {/* Overlay: alambre conectando dientes con brackets */}
        <Box position="absolute" inset={0} zIndex={8} pointerEvents="none">
          <svg width="100%" height="100%" viewBox="0 0 820 600" xmlns="http://www.w3.org/2000/svg">
            {(() => {
              const pathEls: JSX.Element[] = [];
              const getPoint = (t: Tooth) => {
                const x = (t.posX ?? getToothPosition(t.number).posX);
                const y = (t.posY ?? getToothPosition(t.number).posY);
                return { x, y };
              };

              // Función para determinar la arcada
              const arcadaOf = (n: number): 'superior' | 'inferior' | undefined => {
                if (n >= 11 && n <= 28) return 'superior';
                if (n >= 31 && n <= 48) return 'inferior';
                return undefined;
              };

              // Solo conectar dientes vecinos que AMBOS tienen brackets
              const allTeeth = teeth.slice().sort((a, b) => a.number - b.number);
              for (let i = 0; i < allTeeth.length - 1; i++) {
                const a = allTeeth[i];
                const b = allTeeth[i + 1];
                
                // Verificar que ambos dientes tienen brackets
                if (!hasBrackets(a) || !hasBrackets(b)) continue;
                
                // Verificar que están en la misma arcada
                if (arcadaOf(a.number) !== arcadaOf(b.number)) continue;
                
                // Verificar que son números consecutivos
                if (Math.abs(a.number - b.number) !== 1) continue;

                const p1 = getPoint(a);
                const p2 = getPoint(b);
                
                // Crear curva Bezier suave entre los dos puntos
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const c1 = { x: p1.x + dx * 0.3, y: p1.y + dy * 0.1 };
                const c2 = { x: p1.x + dx * 0.7, y: p1.y + dy * 0.9 };
                const d = `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;

                const keyBase = `${a.number}-${b.number}`;
                
                // Trazo base oscuro para mejor contraste detrás de dientes
                pathEls.push(
                  <path key={`wire-base-${keyBase}`}
                    d={d}
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.7}
                  />
                );
                
                // Trazo principal plateado metálico
                pathEls.push(
                  <path key={`wire-${keyBase}`}
                    d={d}
                    fill="none"
                    stroke="#64748B"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.85}
                  />
                );
              }

              return pathEls;
            })()}
          </svg>
        </Box>
      </Box>



      {/* Imagen oculta para análisis */}
      <Box display="none">
        <img
          ref={imageRef}
          src={getDefaultBackgroundImage()}
          alt="Análisis de dientes"
        />
        <canvas
          ref={canvasRef}
        />
      </Box>

      {/* Modal de odontograma completo con Framer Motion */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="full">
        <ModalOverlay 
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: "0.3s" }}
        />
        <ModalContent
          as={motion.div}
          initial={{ 
            opacity: 0,
            scale: 0.8,
            y: 50
          }}
          animate={{ 
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{ 
            opacity: 0,
            scale: 0.8,
            y: 50
          }}
          transition={{ 
            duration: "0.4s",
            ease: "easeOut"
          }}
          bg="transparent"
          boxShadow="none"
          maxW="90vw"
          maxH="90vh"
          m="auto"
          p={0}
        >
          <Box
            position="relative"
            w="820px"
            h="600px"
            bg={bgColor}
            border="2px solid"
            borderColor={borderColor}
            borderRadius="xl"
            overflow="hidden"
            mx="auto"
            my="auto"
          >
            {/* Fondo con colores de cuadrantes modernos */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              zIndex={0}
              overflow="hidden"
            >
              {/* Cuadrante Superior Derecho */}
              <Box
                position="absolute"
                top="0"
                left="0"
                w="50%"
                h="50%"
                bg="linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)"
                borderRight="2px solid"
                borderBottom="2px solid"
                borderColor="blue.200"
              />
              
              {/* Cuadrante Superior Izquierdo */}
              <Box
                position="absolute"
                top="0"
                right="0"
                w="50%"
                h="50%"
                bg="linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)"
                borderLeft="2px solid"
                borderBottom="2px solid"
                borderColor="purple.200"
              />
              
              {/* Cuadrante Inferior Derecho */}
              <Box
                position="absolute"
                bottom="0"
                left="0"
                w="50%"
                h="50%"
                bg="linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)"
                borderRight="2px solid"
                borderTop="2px solid"
                borderColor="green.200"
              />
              
              {/* Cuadrante Inferior Izquierdo */}
              <Box
                position="absolute"
                bottom="0"
                right="0"
                w="50%"
                h="50%"
                bg="linear-gradient(135deg, #FFF3E0 0%, #FFCC80 100%)"
                borderLeft="2px solid"
                borderTop="2px solid"
                borderColor="orange.200"
              />
            </Box>

            {/* Imagen del odontograma por delante */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              zIndex={1}
              backgroundImage={`url(${referenceImage})`}
              backgroundSize="70%"
              backgroundPosition="center"
              backgroundRepeat="no-repeat"
              pointerEvents="none"
            />

            {/* Etiquetas de cuadrantes con mejor contraste */}
            <Box
              position="absolute"
              top="20px"
              left="20px"
              fontSize="sm"
              fontWeight="bold"
              color="blue.700"
              zIndex={5}
              bg="white"
              px={3}
              py={2}
              borderRadius="lg"
              border="2px solid"
              borderColor="blue.300"
              boxShadow="0 2px 8px rgba(59, 130, 246, 0.2)"
            >
              Superior Derecho
            </Box>
            <Box
              position="absolute"
              top="20px"
              right="20px"
              fontSize="sm"
              fontWeight="bold"
              color="purple.700"
              zIndex={5}
              bg="white"
              px={3}
              py={2}
              borderRadius="lg"
              border="2px solid"
              borderColor="purple.300"
              boxShadow="0 2px 8px rgba(147, 51, 234, 0.2)"
            >
              Superior Izquierdo
            </Box>
            <Box
              position="absolute"
              bottom="20px"
              left="20px"
              fontSize="sm"
              fontWeight="bold"
              color="green.700"
              zIndex={5}
              bg="white"
              px={3}
              py={2}
              borderRadius="lg"
              border="2px solid"
              borderColor="green.300"
              boxShadow="0 2px 8px rgba(34, 197, 94, 0.2)"
            >
              Inferior Derecho
            </Box>
            <Box
              position="absolute"
              bottom="20px"
              right="20px"
              fontSize="sm"
              fontWeight="bold"
              color="orange.700"
              zIndex={5}
              bg="white"
              px={3}
              py={2}
              borderRadius="lg"
              border="2px solid"
              borderColor="orange.300"
              boxShadow="0 2px 8px rgba(249, 115, 22, 0.2)"
            >
              Inferior Izquierdo
            </Box>

            {/* Renderizar dientes en el modal */}
            {teeth.length > 0 ? (
              teeth.map(renderTooth)
            ) : (
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                bg="blue.100"
                p={4}
                borderRadius="md"
                border="2px solid blue"
                zIndex={20}
              >
                <Text color="blue.700" fontWeight="bold">
                  Vista ampliada del odontograma
                </Text>
                <Text color="blue.600" fontSize="sm">
                  Dientes cargados: {teeth.length}
                </Text>
              </Box>
            )}

            {/* Botón de cerrar */}
            <IconButton
              position="absolute"
              top="10px"
              right="10px"
              zIndex={30}
              aria-label="Cerrar vista completa"
              icon={<FiX />}
              size="md"
              colorScheme="red"
              variant="solid"
              onClick={() => setIsModalOpen(false)}
              _hover={{
                bg: "red.600"
              }}
              boxShadow="0 2px 8px rgba(0,0,0,0.3)"
            />
          </Box>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default OdontogramaCuadrantes; 