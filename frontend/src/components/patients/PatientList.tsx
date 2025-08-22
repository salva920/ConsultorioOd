'use client'

import dynamic from 'next/dynamic'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useDisclosure,
  IconButton,
  HStack,
  Badge,
  useColorModeValue,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  VStack,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Text
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon, PhoneIcon, EmailIcon } from '@chakra-ui/icons'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { AppText } from '../common/AppText'
import { useRouter } from 'next/navigation'
import { FaPlus, FaSearch, FaEye, FaTooth, FaFilePdf } from 'react-icons/fa'
import { pdf } from '@react-pdf/renderer'
import PatientPDF from './PatientPDF'

// Importar PatientForm dinámicamente
const PatientForm = dynamic(() => import('./PatientForm'), {
  ssr: false
})

interface Patient {
  _id: string
  nombre: string
  apellido: string
  cedula: string
  tipo_cedula: string
  edad: number
  fecha_nacimiento: string
  sexo: string
  email: string
  telefono: string
  direccion: string
  enfermedad_actual: string
  antecedentes_personales: string
  antecedentes_familiares: string
  tipo_consulta: string
  motivo_consulta: string
}

interface PatientListProps {
  searchTerm: string
}

const PatientList = ({ searchTerm }: PatientListProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isLoadingPatient, setIsLoadingPatient] = useState(false)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const router = useRouter()
  const toast = useToast()

  const { data: patients, isLoading, refetch } = useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/patients`)
      return response.data
    }
  })

  const filteredPatients = patients?.filter(patient => 
    `${patient.nombre} ${patient.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.telefono?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  /**
   * Maneja la edición de un paciente
   * Obtiene los datos frescos del servidor antes de abrir el formulario
   * para asegurar que se muestren todos los campos actualizados
   */
  const handleEdit = async (patient: Patient) => {
    setIsLoadingPatient(true)
    
    try {
      // Obtener los datos frescos del paciente desde el servidor
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/patients/${patient._id}`)
      const freshPatientData = response.data
      
      console.log('Datos frescos del paciente obtenidos:', freshPatientData)
      
      // Establecer el paciente con datos actualizados
      setSelectedPatient(freshPatientData)
      onOpen()
      
      toast({
        title: 'Datos actualizados',
        description: 'Se han cargado los datos más recientes del paciente',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error al obtener datos del paciente:', error)
      
      // Si falla, usar los datos del listado como fallback
      setSelectedPatient(patient)
      onOpen()
      
      // Mostrar toast de advertencia
      toast({
        title: 'Advertencia',
        description: 'No se pudieron obtener los datos más recientes. Se mostrarán los datos del listado.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoadingPatient(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/patients/${id}`)
        refetch()
      } catch (error) {
        console.error('Error al eliminar paciente:', error)
      }
    }
  }

  const handleView = (patientId: string) => {
    router.push(`/patients/${patientId}`)
  }

  const handleViewOdontograma = (patientId: string) => {
    router.push(`/odontograma?patientId=${patientId}`)
  }

  const handleExportPDF = async (patient: Patient) => {
    try {
      console.log('Iniciando exportación de PDF para paciente:', patient.nombre);
      
      // Obtener el odontograma del paciente
      let odontograma = null;
      try {
        console.log('Obteniendo odontograma para paciente ID:', patient._id);
        // Usar la ruta correcta para obtener odontograma por paciente ID
        const odontogramaResponse = await axios.get(`/api/odontograma/patient/${patient._id}`);
        odontograma = odontogramaResponse.data;
        console.log('Odontograma obtenido:', odontograma);
      } catch (odontogramaError) {
        console.warn('No se pudo obtener el odontograma:', odontogramaError);
        // Continuar sin el odontograma si no está disponible
      }

      // Obtener las citas del paciente
      let appointments = null;
      try {
        console.log('Obteniendo citas para paciente ID:', patient._id);
        const appointmentsResponse = await axios.get(`/api/appointments`);
        // Filtrar citas por paciente
        appointments = appointmentsResponse.data.filter((appointment: any) => 
          appointment.patientId === patient._id || (appointment.patient && appointment.patient._id === patient._id)
        );
        console.log('Citas obtenidas:', appointments.length);
      } catch (appointmentsError) {
        console.warn('No se pudieron obtener las citas:', appointmentsError);
        // Continuar sin las citas si no están disponibles
      }

      console.log('Generando PDF...');
      
      // Generar el PDF
      const pdfDoc = <PatientPDF patient={patient} odontograma={odontograma} appointments={appointments} />;
      const asPdf = pdf(pdfDoc);
      
      console.log('Convirtiendo a blob...');
      const blob = await asPdf.toBlob();
      
      console.log('Creando enlace de descarga...');
      // Crear un enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `historia_clinica_${patient.nombre}_${patient.apellido}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('PDF generado y descargado exitosamente');
    } catch (error: any) {
      console.error('Error detallado al exportar PDF:', error);
      console.error('Stack trace:', error?.stack);
      
      // Mostrar mensaje de error más específico al usuario
      let errorMessage = 'Error al exportar PDF. ';
      if (error?.message) {
        errorMessage += `Detalle: ${error.message}`;
      } else {
        errorMessage += 'Por favor intente nuevamente.';
      }
      
      alert(errorMessage);
    }
  }

  if (isLoading) return <Box>Cargando...</Box>

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Heading size="md">
          Total de pacientes: {filteredPatients?.length || 0}
        </Heading>
        <Button colorScheme="blue" onClick={() => {
          setSelectedPatient(null)
          onOpen()
        }}>
          Nuevo Paciente
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Paciente</Th>
              <Th>Cédula</Th>
              <Th>Contacto</Th>
              <Th>Tipo de Consulta</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPatients?.map((patient) => (
              <Tr key={patient._id}>
                <Td>
                  <HStack spacing={3}>
                    <Avatar size="sm" name={`${patient.nombre} ${patient.apellido}`} />
                    <VStack align="start" spacing={0}>
                      <AppText fontWeight="medium">{`${patient.nombre} ${patient.apellido}`}</AppText>
                      <AppText fontSize="sm" color="gray.500">Edad: {patient.edad} años</AppText>
                    </VStack>
                  </HStack>
                </Td>
                <Td>
                  <AppText>{patient.cedula}</AppText>
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    {patient.email && (
                      <HStack spacing={1}>
                        <EmailIcon color="gray.500" />
                        <AppText fontSize="sm">{patient.email}</AppText>
                      </HStack>
                    )}
                    {patient.telefono && (
                      <HStack spacing={1}>
                        <PhoneIcon color="gray.500" />
                        <AppText fontSize="sm">{patient.telefono}</AppText>
                      </HStack>
                    )}
                  </VStack>
                </Td>
                <Td>
                  {patient.tipo_consulta ? (
                    <Badge colorScheme="blue">
                      {patient.tipo_consulta}
                    </Badge>
                  ) : (
                    <Text fontSize="sm" color="gray.400" fontStyle="italic">
                      No especificado
                    </Text>
                  )}
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Ver odontograma"
                      icon={<FaTooth />}
                      size="sm"
                      onClick={() => handleViewOdontograma(patient._id)}
                      colorScheme="blue"
                      variant="ghost"
                    />
                    <IconButton
                      aria-label="Exportar PDF"
                      icon={<FaFilePdf />}
                      size="sm"
                      onClick={() => handleExportPDF(patient)}
                      colorScheme="red"
                      variant="ghost"
                    />
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={isLoadingPatient ? <Box as="span" className="loading-spinner" /> : <EditIcon />}
                        variant="ghost"
                        size="sm"
                        isDisabled={isLoadingPatient}
                      />
                      <MenuList>
                        <MenuItem 
                          onClick={() => handleEdit(patient)}
                          isDisabled={isLoadingPatient}
                        >
                          {isLoadingPatient ? 'Cargando...' : 'Editar'}
                        </MenuItem>
                        <MenuItem
                          color="red.500"
                          onClick={() => handleDelete(patient._id)}
                          isDisabled={isLoadingPatient}
                        >
                          Eliminar
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <PatientForm
        isOpen={isOpen}
        onClose={onClose}
        patient={selectedPatient}
        onSuccess={() => {
          refetch()
          onClose()
        }}
      />
    </Box>
  )
}

export default PatientList 