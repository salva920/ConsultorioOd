import React, { useState, useEffect } from 'react';
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
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Text,
  Divider,
  Box,
} from '@chakra-ui/react';
import ImageUploader from './editor de posiciones/ImageUploader';
import { InterventionImage } from './types';

interface Intervention {
  id: string;
  date: string;
  toothNumber: number;
  procedure: string;
  notes: string;
  status: 'completado' | 'pendiente' | 'cancelado';
  part?: 'todo' | 'superior' | 'inferior' | 'izquierda' | 'derecha' | 'centro';
  type?: string;
  images?: InterventionImage[];
}

interface Tooth {
  id: string;
  number: number;
  condition: string;
  notes: string;
  interventions: Intervention[];
  type?: 'incisivo' | 'canino' | 'premolar' | 'molar';
}

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tooth: Tooth | null;
  onSave: (intervention: Partial<Intervention>) => void;
  existingIntervention?: Intervention | null;
  patientId?: string;
}

const InterventionModal: React.FC<InterventionModalProps> = ({ 
  isOpen, 
  onClose, 
  tooth, 
  onSave, 
  existingIntervention,
  patientId 
}) => {
  const [formData, setFormData] = useState<Partial<Intervention>>({
    procedure: '',
    notes: '',
    status: 'pendiente',
    part: 'todo'
  });
  const [images, setImages] = useState<InterventionImage[]>([]);
  
  // Generar ID temporal para la intervención (para nuevas intervenciones)
  const interventionId = existingIntervention?.id || `temp-${Date.now()}`;

  useEffect(() => {
    if (existingIntervention) {
      setFormData(existingIntervention);
      setImages(existingIntervention.images || []);
    } else {
      setFormData({
        procedure: '',
        notes: '',
        status: 'pendiente',
        part: 'todo'
      });
      setImages([]);
    }
  }, [existingIntervention, isOpen]);

  const handleSave = () => {
    if (!formData.procedure) return;
    
    // Si es brackets, agregar información de arcada automáticamente
    let notes = formData.notes || '';
    if (formData.procedure === 'Brackets' && tooth) {
      const arcada = tooth.number <= 16 ? 'superior' : 'inferior';
      if (!notes.includes('arcada')) {
        notes = `${notes} (Arcada ${arcada})`.trim();
      }
    }
    
    onSave({ ...formData, notes, images });
    onClose();
  };

  const isBracketsSelected = formData.procedure === 'Brackets';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent mx={4} maxH="90vh" overflowY="auto">
        <ModalHeader>
          {existingIntervention ? 'Editar' : 'Nueva'} Intervención - Diente {tooth?.number}
        </ModalHeader>
        {!existingIntervention && (
          <Box p={4} bg="blue.50" borderBottom="1px" borderColor="blue.200">
            <Text fontSize="sm" color="blue.700">
              💡 <strong>Nota:</strong> Después de guardar la intervención, se abrirá automáticamente 
              el formulario de diagnóstico para completar la información clínica.
            </Text>
          </Box>
        )}
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Parte del Diente</FormLabel>
              <Select
                value={formData.part}
                onChange={(e) => setFormData(prev => ({ ...prev, part: e.target.value as any }))}
              >
                <option value="todo">Todo el Diente</option>
                <option value="superior">Superior</option>
                <option value="inferior">Inferior</option>
                <option value="izquierda">Izquierda</option>
                <option value="derecha">Derecha</option>
                <option value="centro">Centro</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Procedimiento</FormLabel>
              <Select
                value={formData.procedure}
                onChange={(e) => setFormData(prev => ({ ...prev, procedure: e.target.value }))}
                placeholder="Seleccione el procedimiento"
              >
                <option value="Limpieza">Limpieza</option>
                <option value="Extracción">Extracción</option>
                <option value="Endodoncia">Endodoncia</option>
                <option value="Empaste">Empaste</option>
                <option value="Corona">Corona</option>
                <option value="Implante">Implante</option>
                <option value="Ortodoncia">Ortodoncia</option>
                <option value="Blanqueamiento">Blanqueamiento</option>
                <option value="Radiografía">Radiografía</option>
                <option value="Brackets">Brackets</option>
                <option value="Prótesis">Prótesis</option>
                <option value="Otro">Otro</option>
              </Select>
            </FormControl>

            {isBracketsSelected && tooth && (
              <FormControl>
                <FormLabel>Arcada Dental</FormLabel>
                <Select
                  value={tooth.number <= 16 ? 'superior' : 'inferior'}
                  isDisabled
                  bg="gray.100"
                >
                  <option value="superior">Arcada Superior</option>
                  <option value="inferior">Arcada Inferior</option>
                </Select>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  La arcada se determina automáticamente según la posición del diente
                </Text>
              </FormControl>
            )}

            <FormControl>
              <FormLabel>Estado</FormLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              >
                <option value="pendiente">Pendiente</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Notas</FormLabel>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas sobre la intervención"
                rows={4}
              />
            </FormControl>

            <Divider />

            {/* Sección de imágenes */}
            <Box>
              <Text fontWeight="bold" mb={3}>Imágenes de la Intervención</Text>
              <ImageUploader
                images={images}
                onImagesChange={setImages}
                maxImages={5}
                maxFileSize={5}
                patientId={patientId}
                interventionId={interventionId}
              />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InterventionModal; 