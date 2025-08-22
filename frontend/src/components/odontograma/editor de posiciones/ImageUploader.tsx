import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Image,
  VStack,
  HStack,
  Text,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  SimpleGrid,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import { FaUpload, FaTrash, FaEye, FaDownload } from 'react-icons/fa';
import axios from 'axios';

interface InterventionImage {
  filename: string;
  data: string;
  contentType: string;
  uploadDate: string;
  description: string;
}

interface ImageUploaderProps {
  images: InterventionImage[];
  onImagesChange: (images: InterventionImage[]) => void;
  maxImages?: number;
  maxFileSize?: number; // en MB
  patientId?: string;
  interventionId?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxFileSize = 5,
  patientId,
  interventionId
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<InterventionImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length >= maxImages) {
      toast({
        title: 'Límite de imágenes alcanzado',
        description: `Puedes subir máximo ${maxImages} imágenes`,
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);

    try {
      // Por ahora, siempre usar Base64 para imágenes de intervención
      // El sistema de servidor se reserva para imágenes de referencia del odontograma completo
      await handleBase64Upload(files);
    } catch (error) {
      console.error('Error al procesar imágenes:', error);
      toast({
        title: 'Error al cargar imágenes',
        description: 'Hubo un problema al procesar las imágenes',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleServerUpload = async (files: FileList) => {
    const formData = new FormData();
    let validFiles = 0;

    for (let i = 0; i < files.length && images.length + validFiles < maxImages; i++) {
      const file = files[i];
      
      // Validar tamaño del archivo
      if (file.size > maxFileSize * 1024 * 1024) {
        toast({
          title: 'Archivo demasiado grande',
          description: `${file.name} excede el límite de ${maxFileSize}MB`,
          status: 'error',
          duration: 3000,
        });
        continue;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Tipo de archivo no válido',
          description: `${file.name} no es una imagen válida`,
          status: 'error',
          duration: 3000,
        });
        continue;
      }

      formData.append('images', file);
      validFiles++;
    }

    if (validFiles === 0) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/odontograma/${patientId}/interventions/${interventionId}/upload-images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Convertir respuesta del servidor al formato esperado
      const serverImages = response.data.images.map((img: any) => ({
        filename: img.originalname,
        data: img.url, // Usar URL en lugar de base64
        contentType: img.mimetype,
        uploadDate: img.uploadDate,
        description: '',
        isServerFile: true,
        serverFilename: img.filename // Guardar el nombre del archivo en el servidor
      }));

      onImagesChange([...images, ...serverImages]);
      
      toast({
        title: 'Imágenes subidas',
        description: `${validFiles} imagen(es) subida(s) al servidor exitosamente`,
        status: 'success',
        duration: 3000,
      });

    } catch (error) {
      console.error('Error al subir al servidor:', error);
      throw error;
    }
  };

  const handleBase64Upload = async (files: FileList) => {
    const newImages: InterventionImage[] = [];

    for (let i = 0; i < files.length && images.length + newImages.length < maxImages; i++) {
      const file = files[i];
      
      // Validar tamaño del archivo
      if (file.size > maxFileSize * 1024 * 1024) {
        toast({
          title: 'Archivo demasiado grande',
          description: `${file.name} excede el límite de ${maxFileSize}MB`,
          status: 'error',
          duration: 3000,
        });
        continue;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Tipo de archivo no válido',
          description: `${file.name} no es una imagen válida`,
          status: 'error',
          duration: 3000,
        });
        continue;
      }

      // Convertir a Base64
      const base64 = await convertToBase64(file);
      
      newImages.push({
        filename: file.name,
        data: base64,
        contentType: file.type,
        uploadDate: new Date().toISOString(),
        description: ''
      });
    }

    onImagesChange([...images, ...newImages]);
    
    toast({
      title: 'Imágenes cargadas',
      description: `${newImages.length} imagen(es) cargada(s) exitosamente`,
      status: 'success',
      duration: 3000,
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:image/...;base64," si existe
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteImage = async (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast({
      title: 'Imagen eliminada',
      status: 'success',
      duration: 2000,
    });
  };

  const handleUpdateDescription = (index: number, description: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], description };
    onImagesChange(newImages);
  };

  const handleViewImage = (image: InterventionImage) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleDownloadImage = (image: InterventionImage) => {
    const link = document.createElement('a');
    link.href = `data:${image.contentType};base64,${image.data}`;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (base64String: string): string => {
    const sizeInBytes = Math.ceil((base64String.length * 3) / 4);
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return `${sizeInMB.toFixed(2)} MB`;
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Botón de carga */}
        <Box>
          <Button
            leftIcon={<FaUpload />}
            colorScheme="blue"
            onClick={() => fileInputRef.current?.click()}
            isLoading={isUploading}
            loadingText="Procesando..."
            disabled={images.length >= maxImages}
            size="sm"
          >
            Cargar Imágenes ({images.length}/{maxImages})
          </Button>
          <Text fontSize="xs" color="gray.500" mt={1}>
            Máximo {maxFileSize}MB por imagen. Formatos: JPG, PNG, GIF
          </Text>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Lista de imágenes */}
        {images.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={2}>
              Imágenes de la Intervención ({images.length})
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {images.map((image, index) => (
                <Box
                  key={index}
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={3}
                  position="relative"
                >
                  {/* Vista previa */}
                  <Box
                    position="relative"
                    height="150px"
                    mb={2}
                    borderRadius="md"
                    overflow="hidden"
                    bg="gray.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      src={`data:${image.contentType};base64,${image.data}`}
                      alt={image.filename}
                      maxH="100%"
                      maxW="100%"
                      objectFit="contain"
                    />
                  </Box>

                  {/* Información de la imagen */}
                  <VStack spacing={2} align="stretch">
                    <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                      {image.filename}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatFileSize(image.data)}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(image.uploadDate).toLocaleDateString()}
                    </Text>

                    {/* Descripción */}
                    <Textarea
                      size="xs"
                      placeholder="Descripción de la imagen..."
                      value={image.description}
                      onChange={(e) => handleUpdateDescription(index, e.target.value)}
                      rows={2}
                    />

                    {/* Botones de acción */}
                    <HStack spacing={1} justify="center">
                      <IconButton
                        aria-label="Ver imagen"
                        icon={<FaEye />}
                        size="xs"
                        colorScheme="blue"
                        onClick={() => handleViewImage(image)}
                      />
                      <IconButton
                        aria-label="Descargar imagen"
                        icon={<FaDownload />}
                        size="xs"
                        colorScheme="green"
                        onClick={() => handleDownloadImage(image)}
                      />
                      <IconButton
                        aria-label="Eliminar imagen"
                        icon={<FaTrash />}
                        size="xs"
                        colorScheme="red"
                        onClick={() => handleDeleteImage(index)}
                      />
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}
      </VStack>

      {/* Modal para ver imagen en tamaño completo */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedImage?.filename}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedImage && (
              <VStack spacing={4}>
                <Image
                  src={`data:${selectedImage.contentType};base64,${selectedImage.data}`}
                  alt={selectedImage.filename}
                  maxH="70vh"
                  maxW="100%"
                  objectFit="contain"
                />
                {selectedImage.description && (
                  <Box p={4} bg="gray.50" borderRadius="md" w="100%">
                    <Text fontWeight="bold">Descripción:</Text>
                    <Text>{selectedImage.description}</Text>
                  </Box>
                )}
                <HStack spacing={4}>
                  <Button
                    leftIcon={<FaDownload />}
                    colorScheme="blue"
                    onClick={() => handleDownloadImage(selectedImage)}
                  >
                    Descargar
                  </Button>
                  <Text fontSize="sm" color="gray.500">
                    Tamaño: {formatFileSize(selectedImage.data)}
                  </Text>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImageUploader; 