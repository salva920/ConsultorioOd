import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  Divider,
  Box,
  Select,
  Badge,
  IconButton,
  Icon,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  useDisclosure,
} from '@chakra-ui/react';
import { FaPlus, FaHistory, FaEdit, FaTrash, FaImage } from 'react-icons/fa';

interface InterventionImage {
  filename: string;
  data: string;
  contentType: string;
  uploadDate: string;
  description: string;
}

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

interface ToothPanelProps {
  selectedTooth: Tooth | null;
  toothConditions: Array<{ value: string; label: string; color: string }>;
  onConditionChange: (condition: string) => void;
  onNewIntervention: () => void;
  onEditIntervention: (intervention: Intervention) => void;
  onDeleteIntervention: (interventionId: string) => void;
}

const ToothPanel: React.FC<ToothPanelProps> = ({
  selectedTooth,
  toothConditions,
  onConditionChange,
  onNewIntervention,
  onEditIntervention,
  onDeleteIntervention,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImages, setSelectedImages] = useState<InterventionImage[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);

  const handleViewImages = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setSelectedImages(intervention.images || []);
    onOpen();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <Text fontWeight="bold" fontSize="lg">
            {selectedTooth ? `Diente ${selectedTooth.number}` : 'Selecciona un diente'}
          </Text>
        </CardHeader>
        <CardBody>
          {selectedTooth ? (
            <VStack spacing={4} align="stretch">
              {/* Condición actual */}
              <Box>
                <Text mb={2} fontWeight="semibold">Condición Actual:</Text>
                <Select
                  value={selectedTooth.condition}
                  onChange={(e) => onConditionChange(e.target.value)}
                >
                  {toothConditions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </Select>
              </Box>

              <Divider />

              {/* Botón para nueva intervención */}
              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                onClick={onNewIntervention}
              >
                Nueva Intervención
              </Button>

              <Divider />

              {/* Historial de intervenciones */}
              {selectedTooth.interventions.length > 0 && (
                <Box>
                  <HStack mb={3}>
                    <Icon as={FaHistory} />
                    <Text fontWeight="semibold">Historial de Intervenciones</Text>
                  </HStack>
                  <VStack spacing={2} align="stretch">
                    {selectedTooth.interventions.map((intervention) => (
                      <Box
                        key={intervention.id}
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        bg="gray.50"
                        _dark={{ bg: 'gray.700' }}
                      >
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="semibold">{intervention.procedure}</Text>
                          <HStack>
                            <Badge
                              colorScheme={
                                intervention.status === 'completado' ? 'green' :
                                intervention.status === 'pendiente' ? 'yellow' : 'red'
                              }
                            >
                              {intervention.status}
                            </Badge>
                            {intervention.images && intervention.images.length > 0 && (
                              <IconButton
                                size="sm"
                                icon={<FaImage />}
                                aria-label="Ver imágenes"
                                colorScheme="blue"
                                onClick={() => handleViewImages(intervention)}
                              />
                            )}
                            <IconButton
                              size="sm"
                              icon={<FaEdit />}
                              aria-label="Editar"
                              onClick={() => onEditIntervention(intervention)}
                            />
                            <IconButton
                              size="sm"
                              icon={<FaTrash />}
                              aria-label="Eliminar"
                              colorScheme="red"
                              onClick={() => onDeleteIntervention(intervention.id)}
                            />
                          </HStack>
                        </HStack>
                        <Text fontSize="sm" color="gray.500" mb={1}>
                          {new Date(intervention.date).toLocaleDateString()}
                        </Text>
                        {intervention.notes && (
                          <Text fontSize="sm">{intervention.notes}</Text>
                        )}
                        {intervention.images && intervention.images.length > 0 && (
                          <HStack mt={2} spacing={2}>
                            <Icon as={FaImage} color="blue.500" />
                            <Text fontSize="xs" color="blue.500">
                              {intervention.images.length} imagen(es)
                            </Text>
                          </HStack>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          ) : (
            <Text color="gray.500" textAlign="center">
              Haz clic en un diente para ver su información
            </Text>
          )}
        </CardBody>
      </Card>

      {/* Modal para ver imágenes */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Imágenes de {selectedIntervention?.procedure} - Diente {selectedIntervention?.toothNumber}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedImages.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {selectedImages.map((image, index) => (
                  <Box
                    key={index}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={3}
                  >
                    <Image
                      src={`data:${image.contentType};base64,${image.data}`}
                      alt={image.filename}
                      borderRadius="md"
                      mb={2}
                    />
                    <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                      {image.filename}
                    </Text>
                    {image.description && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {image.description}
                      </Text>
                    )}
                    <Text fontSize="xs" color="gray.500">
                      {new Date(image.uploadDate).toLocaleDateString()}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Text textAlign="center" color="gray.500">
                No hay imágenes para mostrar
              </Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ToothPanel; 