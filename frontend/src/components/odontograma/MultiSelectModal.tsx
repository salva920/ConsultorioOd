import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Divider,
  List,
  ListItem,
  ListIcon,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { FaTooth } from 'react-icons/fa';

interface Tooth {
  id: string;
  number: number;
  condition: string;
  notes: string;
  interventions: any[];
  type?: 'incisivo' | 'canino' | 'premolar' | 'molar';
}

interface MultiSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  multiSelectMode: 'brackets' | 'protesis' | null;
  selectedTeeth: string[];
  teeth: Tooth[];
  onApply: (arcada?: 'superior' | 'inferior') => void;
}

const MultiSelectModal: React.FC<MultiSelectModalProps> = ({
  isOpen,
  onClose,
  multiSelectMode,
  selectedTeeth,
  teeth,
  onApply,
}) => {
  const [selectedArcada, setSelectedArcada] = useState<'superior' | 'inferior'>('superior');

  const handleApply = () => {
    if (multiSelectMode === 'brackets') {
      onApply(selectedArcada);
    } else {
      onApply();
    }
  };

  // Determinar arcada automáticamente basada en los dientes seleccionados
  const getAutoArcada = () => {
    const selectedToothNumbers = selectedTeeth.map(toothId => 
      teeth.find(t => t.id === toothId)?.number || 0
    );
    
    // Si todos los dientes son superiores (1-16) o inferiores (17-32)
    const allUpper = selectedToothNumbers.every(num => num >= 1 && num <= 16);
    const allLower = selectedToothNumbers.every(num => num >= 17 && num <= 32);
    
    if (allUpper) return 'superior';
    if (allLower) return 'inferior';
    return 'superior'; // default
  };

  // Actualizar arcada automáticamente cuando cambian los dientes seleccionados
  React.useEffect(() => {
    if (multiSelectMode === 'brackets') {
      setSelectedArcada(getAutoArcada());
    }
  }, [selectedTeeth, multiSelectMode]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Resumen de {multiSelectMode === 'brackets' ? 'Brackets' : 'Prótesis'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info">
              <AlertIcon />
              Se aplicarán {multiSelectMode === 'brackets' ? 'brackets' : 'prótesis'} a los siguientes dientes:
            </Alert>
            
            {/* Selección de arcada para brackets */}
            {multiSelectMode === 'brackets' && (
              <FormControl>
                <FormLabel>Arcada Dental</FormLabel>
                <Select
                  value={selectedArcada}
                  onChange={(e) => setSelectedArcada(e.target.value as 'superior' | 'inferior')}
                >
                  <option value="superior">Arcada Superior</option>
                  <option value="inferior">Arcada Inferior</option>
                </Select>
              </FormControl>
            )}
            
            <Box>
              <Text fontWeight="semibold" mb={3}>
                Dientes seleccionados ({selectedTeeth.length}):
              </Text>
              <List spacing={2}>
                {selectedTeeth.map(toothId => {
                  const tooth = teeth.find(t => t.id === toothId);
                  return (
                    <ListItem key={toothId}>
                      <ListIcon as={FaTooth} color="blue.500" />
                      <Text as="span" fontWeight="medium">
                        Diente {tooth?.number}
                      </Text>
                      <Text as="span" color="gray.500" ml={2}>
                        ({tooth?.type})
                      </Text>
                    </ListItem>
                  );
                })}
              </List>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="semibold" mb={2}>
                Detalles de la intervención:
              </Text>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text>Tipo:</Text>
                  <Badge colorScheme={multiSelectMode === 'brackets' ? 'pink' : 'orange'}>
                    {multiSelectMode === 'brackets' ? 'Brackets' : 'Prótesis'}
                  </Badge>
                </HStack>
                {multiSelectMode === 'brackets' && (
                  <HStack justify="space-between">
                    <Text>Arcada:</Text>
                    <Badge colorScheme="purple">
                      {selectedArcada === 'superior' ? 'Superior' : 'Inferior'}
                    </Badge>
                  </HStack>
                )}
                <HStack justify="space-between">
                  <Text>Estado:</Text>
                  <Badge colorScheme="yellow">Pendiente</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>Fecha:</Text>
                  <Text>{new Date().toLocaleDateString()}</Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            colorScheme={multiSelectMode === 'brackets' ? 'pink' : 'orange'} 
            onClick={handleApply}
          >
            Aplicar {multiSelectMode === 'brackets' ? 'Brackets' : 'Prótesis'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MultiSelectModal; 