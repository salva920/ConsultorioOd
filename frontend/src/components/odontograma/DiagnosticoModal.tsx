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
  FormControl,
  FormLabel,
  Select,
  Input,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  Box,
  Text,
  SimpleGrid,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaTrash, FaPlus, FaSave, FaInfoCircle } from 'react-icons/fa';
import { Intervention } from './types';
import AppointmentForm from '../appointments/AppointmentForm';
import { useRouter } from 'next/navigation';

interface Diagnostico {
  id: string;
  cuadrante: string;
  unidadDental: string;
  superficie: string;
  diagnostico: string;
  etiologia: string;
  fecha: string;
  observaciones: string;
}

interface DiagnosticoModalProps {
  isOpen: boolean;
  onClose: () => void;
  interventions: Intervention[];
  patientName?: string;
  patientId?: string;
  onDiagnosticoChange: (diagnosticos: Diagnostico[]) => void;
  savedDiagnosticos?: any[]; // Diagnósticos guardados del backend
}

const DiagnosticoModal: React.FC<DiagnosticoModalProps> = ({
  isOpen,
  onClose,
  interventions,
  patientName,
  patientId,
  onDiagnosticoChange,
  savedDiagnosticos = [],
}) => {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const router = useRouter();
  const [nuevoDiagnostico, setNuevoDiagnostico] = useState<Omit<Diagnostico, 'id'>>({
    cuadrante: '',
    unidadDental: '',
    superficie: '',
    diagnostico: '',
    etiologia: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: ''
  });

  const toast = useToast();

  const CUADRANTES = [
    { value: 'SD', label: 'Superior Derecho (18-11)' },
    { value: 'SI', label: 'Superior Izquierdo (21-28)' },
    { value: 'ID', label: 'Inferior Derecho (38-31)' },
    { value: 'II', label: 'Inferior Izquierdo (41-48)' }
  ];

  const SUPERFICIES = [
    { value: 'mesial', label: 'Mesial' },
    { value: 'distal', label: 'Distal' },
    { value: 'vestibular', label: 'Vestibular' },
    { value: 'lingual', label: 'Lingual' },
    { value: 'oclusal', label: 'Oclusal' },
    { value: 'todo', label: 'Toda la superficie' }
  ];

  const DIAGNOSTICOS = [
    { value: 'caries', label: 'Caries' },
    { value: 'periodontal', label: 'Enfermedad Periodontal' },
    { value: 'endodoncia', label: 'Endodoncia' },
    { value: 'ortodoncia', label: 'Ortodoncia' },
    { value: 'protesis', label: 'Prótesis' },
    { value: 'extraccion', label: 'Extracción' },
    { value: 'restauracion', label: 'Restauración' },
    { value: 'otros', label: 'Otros' }
  ];

  const ETIOLOGIAS = [
    { value: 'bacteriana', label: 'Bacteriana' },
    { value: 'traumatica', label: 'Traumática' },
    { value: 'genetica', label: 'Genética' },
    { value: 'mecanica', label: 'Mecánica' },
    { value: 'quimica', label: 'Química' },
    { value: 'otra', label: 'Otra' }
  ];

  // Lógica para pre-llenar el formulario con la información de la intervención
  useEffect(() => {
    if (interventions.length > 0 && isOpen) {
      // Tomar la primera intervención (la más reciente)
      const primeraIntervencion = interventions[0];
      
      // Pre-llenar automáticamente el formulario
      setNuevoDiagnostico({
        cuadrante: determinarCuadrante(primeraIntervencion.toothNumber),
        unidadDental: primeraIntervencion.toothNumber.toString(),
        superficie: mapearParteASuperficie(primeraIntervencion.part || 'todo'),
        diagnostico: mapearProcedimientoADiagnostico(primeraIntervencion.procedure),
        etiologia: '',
        fecha: new Date().toISOString().split('T')[0],
        observaciones: primeraIntervencion.notes || ''
      });
      
      toast({
        title: 'Formulario pre-llenado',
        description: `Los campos han sido llenados automáticamente con la información de la intervención del diente ${primeraIntervencion.toothNumber}`,
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [interventions, isOpen]);

  // Cargar diagnósticos guardados cuando se abre el modal
  useEffect(() => {
    if (isOpen && savedDiagnosticos.length > 0) {
      // Convertir los diagnósticos del backend al formato del modal
      const diagnosticosConvertidos = savedDiagnosticos.map(d => ({
        id: d._id || d.id,
        cuadrante: d.cuadrante,
        unidadDental: d.unidadDental,
        superficie: d.superficie,
        diagnostico: d.diagnostico,
        etiologia: d.etiologia,
        fecha: d.fecha ? new Date(d.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        observaciones: d.observaciones
      }));
      
      // Limpiar duplicados antes de establecer el estado
      const diagnosticosLimpios = limpiarDiagnosticosDuplicados(diagnosticosConvertidos);
      
      setDiagnosticos(diagnosticosLimpios);
    } else if (isOpen && savedDiagnosticos.length === 0) {
      setDiagnosticos([]);
    }
  }, [isOpen, savedDiagnosticos]);

  // Limpiar formulario cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      setNuevoDiagnostico({
        cuadrante: '',
        unidadDental: '',
        superficie: '',
        diagnostico: '',
        etiologia: '',
        fecha: new Date().toISOString().split('T')[0],
        observaciones: ''
      });
      setDiagnosticos([]);
    }
  }, [isOpen]);

  // Función para limpiar diagnósticos duplicados
  const limpiarDiagnosticosDuplicados = (diagnosticos: Diagnostico[]): Diagnostico[] => {
    return diagnosticos.filter((diagnostico, index, self) => 
      index === self.findIndex(d => 
        d.unidadDental === diagnostico.unidadDental &&
        d.diagnostico === diagnostico.diagnostico &&
        d.superficie === diagnostico.superficie
      )
    );
  };

  const determinarCuadrante = (dienteId: number): string => {
    if (dienteId >= 11 && dienteId <= 18) return 'SD';
    if (dienteId >= 21 && dienteId <= 28) return 'SI';
    if (dienteId >= 31 && dienteId <= 38) return 'ID';
    if (dienteId >= 41 && dienteId <= 48) return 'II';
    return '';
  };

  const mapearProcedimientoADiagnostico = (procedimiento: string): string => {
    const mapeo: { [key: string]: string } = {
      'caries': 'caries',
      'restauracion': 'restauracion',
      'endodoncia': 'endodoncia',
      'extraccion': 'extraccion',
      'corona': 'protesis',
      'implante': 'protesis',
      'brackets': 'ortodoncia',
      'protesis': 'protesis',
      'limpieza': 'periodontal',
      'periodontal': 'periodontal',
      'blanqueamiento': 'otros',
      'limpieza dental': 'periodontal',
      'tratamiento periodontal': 'periodontal',
      'restauración': 'restauracion',
      'extracción': 'extraccion'
    };
    
    const procedimientoLower = procedimiento.toLowerCase();
    return mapeo[procedimientoLower] || 'otros';
  };

  // Función para mapear las partes de intervención a superficies válidas del backend
  const mapearParteASuperficie = (part: string): string => {
    const mapeo: { [key: string]: string } = {
      'superior': 'oclusal',
      'inferior': 'oclusal',
      'izquierda': 'mesial',
      'derecha': 'distal',
      'centro': 'oclusal',
      'todo': 'todo'
    };
    return mapeo[part] || 'todo';
  };

  // Función para verificar si una intervención ya tiene diagnóstico guardado
  const tieneDiagnosticoGuardado = (intervention: Intervention): boolean => {
    const dienteIntervention = intervention.toothNumber.toString();
    
    const tiene = savedDiagnosticos.some(d => {
      const match = d.unidadDental === dienteIntervention;
      return match;
    });
    
    return tiene;
  };

  // Función para obtener intervenciones que NO tienen diagnóstico guardado
  const getIntervencionesSinDiagnostico = (): Intervention[] => {
    return interventions.filter(intervention => !tieneDiagnosticoGuardado(intervention));
  };

  // Función para obtener intervenciones que SÍ tienen diagnóstico guardado
  const getIntervencionesConDiagnostico = (): Intervention[] => {
    const conDiagnostico = interventions.filter(intervention => tieneDiagnosticoGuardado(intervention));
    return conDiagnostico;
  };

  const handleAddDiagnostico = () => {
    if (nuevoDiagnostico.cuadrante && nuevoDiagnostico.unidadDental && nuevoDiagnostico.diagnostico) {
      const nuevoDiagnosticoConId = { ...nuevoDiagnostico, id: Date.now().toString() };
      
      // Verificar si ya existe un diagnóstico similar
      const existeDuplicado = diagnosticos.some(d => 
        d.unidadDental === nuevoDiagnostico.unidadDental && 
        d.diagnostico === nuevoDiagnostico.diagnostico &&
        d.superficie === nuevoDiagnostico.superficie
      );
      
      if (existeDuplicado) {
        toast({
          title: 'Diagnóstico duplicado',
          description: 'Ya existe un diagnóstico similar para este diente',
          status: 'warning',
          duration: 3000,
        });
        return;
      }
      
      setDiagnosticos(prev => [...prev, nuevoDiagnosticoConId]);
      
      // Limpiar formulario para el siguiente diagnóstico
      setNuevoDiagnostico({
        cuadrante: '',
        unidadDental: '',
        superficie: '',
        diagnostico: '',
        etiologia: '',
        fecha: new Date().toISOString().split('T')[0],
        observaciones: ''
      });
      
      toast({
        title: 'Diagnóstico agregado',
        status: 'success',
        duration: 2000,
      });
    } else {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor complete todos los campos obligatorios',
        status: 'warning',
        duration: 3000,
      });
    }
  };

  const handleDeleteDiagnostico = (id: string) => {
    setDiagnosticos(diagnosticos.filter(d => d.id !== id));
    toast({
      title: 'Diagnóstico eliminado',
      status: 'info',
      duration: 2000,
    });
  };

  const handleSaveDiagnosticos = () => {
    // Separar diagnósticos existentes de nuevos
    const diagnosticosExistentes = diagnosticos.filter(d => 
      d.id && d.id.startsWith('689')
    );
    
    const diagnosticosNuevos = diagnosticos.filter(d => 
      !d.id || !d.id.startsWith('689')
    );
    
    if (diagnosticosNuevos.length === 0) {
      toast({
        title: 'No hay diagnósticos nuevos',
        description: 'Todos los diagnósticos ya están guardados',
        status: 'info',
        duration: 3000,
      });
      return;
    }

    // Solo guardar los diagnósticos nuevos
    onDiagnosticoChange(diagnosticosNuevos);
    
    toast({
      title: 'Diagnósticos guardados',
      description: `${diagnosticosNuevos.length} diagnóstico(s) nuevo(s) han sido guardados`,
      status: 'success',
      duration: 3000,
    });
    
    // Abrir automáticamente el formulario de citas
    setShowAppointmentForm(true);
  };

  const handleAppointmentSuccess = () => {
    setShowAppointmentForm(false);
    onClose();
    toast({
      title: 'Cita programada exitosamente',
      description: `Se ha programado una cita para ${patientName}. Redirigiendo a la página de citas...`,
      status: 'success',
      duration: 3000,
    });
    
    setTimeout(() => {
      router.push('/citas');
    }, 1000);
  };

  const handleCloseAppointmentForm = () => {
    setShowAppointmentForm(false);
    onClose();
  };

  // Función para obtener fecha sugerida (1 semana después)
  const getSuggestedDate = (): string => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

  // Función para generar notas basadas en los diagnósticos
  const generateNotesFromDiagnosticos = (diagnosticos: Diagnostico[]): string => {
    if (diagnosticos.length === 0) return 'Cita de seguimiento programada.';
    
    const diagnosticosUnicos = diagnosticos.filter((diagnostico, index, self) => 
      index === self.findIndex(d => 
        d.unidadDental === diagnostico.unidadDental && 
        d.diagnostico === diagnostico.diagnostico
      )
    );
    
    const diagnosticosResumen = diagnosticosUnicos.map(d => {
      const diagnosticoLabel = DIAGNOSTICOS.find(diag => diag.value === d.diagnostico)?.label || d.diagnostico;
      return `- ${diagnosticoLabel} en diente ${d.unidadDental}`;
    }).join('\n');
    
    return `Cita de seguimiento programada.\n\nDiagnósticos realizados:\n${diagnosticosResumen}`;
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {patientName ? `Diagnóstico Clínico - ${patientName}` : 'Diagnóstico Clínico'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Información de la intervención */}
            {interventions.length > 0 && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Intervención Reciente:</Text>
                  <Text fontSize="sm">
                    Diente {interventions[0].toothNumber} - {interventions[0].procedure}
                    {interventions[0].notes && ` - ${interventions[0].notes}`}
                  </Text>
                </Box>
              </Alert>
            )}

            {/* Estado de diagnósticos */}
            {interventions.length > 0 && (
              <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                <Text fontSize="sm" color="blue.700" mb={2} fontWeight="bold">
                  Estado de Diagnósticos:
                </Text>
                <Text fontSize="sm" color="blue.600">
                  • Intervenciones totales: {interventions.length}
                </Text>
                <Text fontSize="sm" color="blue.600">
                  • Con diagnóstico: {getIntervencionesConDiagnostico().length}
                </Text>
                <Text fontSize="sm" color="blue.600">
                  • Sin diagnóstico: {getIntervencionesSinDiagnostico().length}
                </Text>
                {getIntervencionesSinDiagnostico().length === 0 && (
                  <Text fontSize="sm" color="green.600" fontWeight="bold" mt={1}>
                    ✅ Todas las intervenciones ya tienen diagnóstico
                  </Text>
                )}
              </Box>
            )}

            {/* Formulario de nuevo diagnóstico */}
            <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
              <Text fontWeight="bold" mb={4} display="flex" alignItems="center">
                <FaInfoCircle style={{ marginRight: '8px' }} />
                Nuevo Diagnóstico
              </Text>
              
              <Text fontSize="sm" color="gray.600" mb={4}>
                Los campos han sido pre-llenados automáticamente con la información de la intervención. 
                Puedes modificar cualquier campo según sea necesario.
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold">Cuadrante</FormLabel>
                  <Select
                    size="sm"
                    value={nuevoDiagnostico.cuadrante}
                    onChange={(e) => setNuevoDiagnostico({...nuevoDiagnostico, cuadrante: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    {CUADRANTES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold">Unidad Dental</FormLabel>
                  <Input
                    size="sm"
                    value={nuevoDiagnostico.unidadDental}
                    onChange={(e) => setNuevoDiagnostico({...nuevoDiagnostico, unidadDental: e.target.value})}
                    placeholder="UD"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold">Superficie</FormLabel>
                  <Select
                    size="sm"
                    value={nuevoDiagnostico.superficie}
                    onChange={(e) => setNuevoDiagnostico({...nuevoDiagnostico, superficie: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    {SUPERFICIES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold">Diagnóstico</FormLabel>
                  <Select
                    size="sm"
                    value={nuevoDiagnostico.diagnostico}
                    onChange={(e) => setNuevoDiagnostico({...nuevoDiagnostico, diagnostico: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    {DIAGNOSTICOS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold">Etiología</FormLabel>
                  <Select
                    size="sm"
                    value={nuevoDiagnostico.etiologia}
                    onChange={(e) => setNuevoDiagnostico({...nuevoDiagnostico, etiologia: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    {ETIOLOGIAS.map(e => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold">Fecha</FormLabel>
                  <Input
                    size="sm"
                    type="date"
                    value={nuevoDiagnostico.fecha}
                    onChange={(e) => setNuevoDiagnostico({...nuevoDiagnostico, fecha: e.target.value})}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold">Observaciones</FormLabel>
                  <Input
                    size="sm"
                    value={nuevoDiagnostico.observaciones}
                    onChange={(e) => setNuevoDiagnostico({...nuevoDiagnostico, observaciones: e.target.value})}
                    placeholder="Observaciones"
                  />
                </FormControl>
              </SimpleGrid>

              <HStack justify="space-between">
                <Button
                  leftIcon={<FaPlus />}
                  colorScheme="blue"
                  size="sm"
                  onClick={handleAddDiagnostico}
                >
                  Agregar Diagnóstico
                </Button>
              </HStack>
            </Box>

            {/* Tabla de diagnósticos */}
            <Box>
              <Text fontWeight="bold" mb={4}>Diagnósticos Registrados</Text>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Cuadrante</Th>
                      <Th>UD</Th>
                      <Th>Superficie</Th>
                      <Th>Diagnóstico</Th>
                      <Th>Etiología</Th>
                      <Th>Fecha</Th>
                      <Th>Obs.</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {diagnosticos.map((diagnostico) => (
                      <Tr key={diagnostico.id}>
                        <Td>{CUADRANTES.find(c => c.value === diagnostico.cuadrante)?.label}</Td>
                        <Td>{diagnostico.unidadDental}</Td>
                        <Td>{SUPERFICIES.find(s => s.value === diagnostico.superficie)?.label}</Td>
                        <Td>{DIAGNOSTICOS.find(d => d.value === diagnostico.diagnostico)?.label}</Td>
                        <Td>{ETIOLOGIAS.find(e => e.value === diagnostico.etiologia)?.label}</Td>
                        <Td>{diagnostico.fecha}</Td>
                        <Td maxW="100px" isTruncated>{diagnostico.observaciones}</Td>
                        <Td>
                          <IconButton
                            aria-label="Eliminar diagnóstico"
                            icon={<FaTrash />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteDiagnostico(diagnostico.id)}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            leftIcon={<FaSave />}
            colorScheme="green"
            onClick={handleSaveDiagnosticos}
          >
            Guardar Diagnósticos
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

      {/* Modal de formulario de citas */}
      <AppointmentForm
        isOpen={showAppointmentForm}
        onClose={handleCloseAppointmentForm}
        preSelectedPatientId={patientId}
        onSuccess={handleAppointmentSuccess}
        preFilledData={{
          date: getSuggestedDate(),
          notes: generateNotesFromDiagnosticos(diagnosticos),
          status: 'SCHEDULED' as const
        }}
      />
    </>
  );
};

export default React.memo(DiagnosticoModal); 