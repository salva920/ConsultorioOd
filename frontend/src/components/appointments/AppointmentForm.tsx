'use client'

import React, { useState, useEffect } from 'react'
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
  Input,
  VStack,
  useToast,
  Textarea,
  Select,
  SimpleGrid,
  Heading,
  Divider,
  Box,
  Icon,
  HStack,
  FormErrorMessage,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { FaCalendarAlt, FaClock, FaUser, FaNotesMedical, FaSearch } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

interface Patient {
  _id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  cedula: string
}

interface Appointment {
  _id?: string
  patientId: string
  date: string
  time?: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  notes: string
}

interface AppointmentFormProps {
  isOpen: boolean
  onClose: () => void
  appointment?: Appointment | null
  preSelectedPatientId?: string
  preFilledData?: {
    date?: string
    time?: string
    notes?: string
    status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  }
  onSuccess?: () => void
}

export default function AppointmentForm({ 
  isOpen, 
  onClose, 
  appointment, 
  preSelectedPatientId,
  preFilledData,
  onSuccess 
}: AppointmentFormProps) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch, setValue, control } = useForm<Appointment>({
    defaultValues: appointment || {
      patientId: preSelectedPatientId || '',
      date: preFilledData?.date || '',
      time: preFilledData?.time || '',
      status: preFilledData?.status || 'SCHEDULED',
      notes: preFilledData?.notes || ''
    }
  })

  // Obtener lista de pacientes
  const { data: patients, isLoading: loadingPatients } = useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/patients`)
      return response.data
    }
  })

  // Filtrar pacientes por búsqueda
  const filteredPatients = patients?.filter(patient => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      patient.nombre.toLowerCase().includes(searchLower) ||
      patient.apellido.toLowerCase().includes(searchLower) ||
      patient.cedula.includes(searchTerm)
    )
  }) || []

  // Observar cambios en patientId para actualizar selectedPatient
  const patientId = watch('patientId')

  useEffect(() => {
    if (patientId && patients) {
      const patient = patients.find(p => p._id === patientId)
      setSelectedPatient(patient || null)
      if (patient) {
        setSearchTerm(`${patient.nombre} ${patient.apellido} - ${patient.cedula}`)
      }
    } else {
      setSelectedPatient(null)
      setSearchTerm('')
    }
  }, [patientId, patients])

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        reset(appointment)
        if (appointment.patientId) {
          const patient = patients?.find(p => p._id === appointment.patientId)
          setSelectedPatient(patient || null)
          if (patient) {
            setSearchTerm(`${patient.nombre} ${patient.apellido} - ${patient.cedula}`)
          }
        }
      } else {
        reset({
          patientId: preSelectedPatientId || '',
          date: preFilledData?.date || '',
          time: preFilledData?.time || '',
          status: preFilledData?.status || 'SCHEDULED',
          notes: preFilledData?.notes || ''
        })
        setSelectedPatient(null)
        setSearchTerm('')
      }
    }
  }, [isOpen, appointment, patients, reset, preSelectedPatientId, preFilledData])

  // Establecer fecha mínima como hoy
  const today = new Date().toISOString().split('T')[0]

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: Appointment) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/appointments`, data)
      return response.data
    },
    onSuccess: () => {
      toast({
        title: 'Cita creada exitosamente',
        status: 'success',
        duration: 3000,
      })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      onSuccess?.()
      onClose()
      
      // Si no hay callback de éxito personalizado, redirigir a citas
      if (!onSuccess) {
        setTimeout(() => {
          router.push('/citas')
        }, 1000)
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error al crear la cita',
        description: error.response?.data?.message || 'Ocurrió un error inesperado',
        status: 'error',
        duration: 5000,
      })
    }
  })

  const updateAppointmentMutation = useMutation({
    mutationFn: async (data: Appointment) => {
      const response = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${appointment?._id}`, data)
      return response.data
    },
    onSuccess: () => {
      toast({
        title: 'Cita actualizada exitosamente',
        status: 'success',
        duration: 3000,
      })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      onSuccess?.()
      onClose()
      
      // Si no hay callback de éxito personalizado, redirigir a citas
      if (!onSuccess) {
        setTimeout(() => {
          router.push('/citas')
        }, 1000)
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar la cita',
        description: error.response?.data?.message || 'Ocurrió un error inesperado',
        status: 'error',
        duration: 5000,
      })
    }
  })

  const onSubmit = (data: Appointment) => {
    if (appointment?._id) {
      updateAppointmentMutation.mutate(data)
    } else {
      createAppointmentMutation.mutate(data)
    }
  }

  const isLoading = isSubmitting || createAppointmentMutation.isPending || updateAppointmentMutation.isPending

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={FaCalendarAlt} color="blue.500" />
            <Text>{appointment ? 'Editar Cita' : 'Nueva Cita'}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={6} align="stretch">
              {/* Selección de Paciente */}
              <Box>
                <HStack mb={4}>
                  <Icon as={FaUser} />
                  <Heading size="md">Información del Paciente</Heading>
                </HStack>
                
                <FormControl isRequired isInvalid={!!errors.patientId}>
                  <FormLabel>Buscar Paciente</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaSearch color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="Buscar por nombre o cédula..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      isDisabled={loadingPatients}
                    />
                  </InputGroup>
                  
                  {/* Lista de pacientes filtrados */}
                  {searchTerm && (
                    <Box
                      mt={2}
                      maxH="200px"
                      overflowY="auto"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                      bg="white"
                      zIndex={10}
                      position="relative"
                    >
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <Box
                            key={patient._id}
                            p={3}
                            cursor="pointer"
                            _hover={{ bg: "blue.50" }}
                            borderBottom="1px solid"
                            borderColor="gray.100"
                            onClick={() => {
                              setValue('patientId', patient._id)
                              setSelectedPatient(patient)
                              setSearchTerm(`${patient.nombre} ${patient.apellido} - ${patient.cedula}`)
                            }}
                          >
                            <Text fontWeight="medium">
                              {patient.nombre} {patient.apellido}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Cédula: {patient.cedula}
                            </Text>
                          </Box>
                        ))
                      ) : (
                        <Box p={3} textAlign="center">
                          <Text color="gray.500">No se encontraron pacientes</Text>
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  {/* Mostrar paciente seleccionado */}
                  {selectedPatient && (
                    <Box mt={3} p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                      <HStack justify="space-between" align="start">
                        <Box>
                          <Text fontWeight="semibold" color="blue.700">
                            Paciente seleccionado: {selectedPatient.nombre} {selectedPatient.apellido}
                          </Text>
                          <Text fontSize="sm" color="blue.600">
                            Cédula: {selectedPatient.cedula}
                          </Text>
                        </Box>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => {
                            setValue('patientId', '')
                            setSelectedPatient(null)
                            setSearchTerm('')
                          }}
                        >
                          Cambiar
                        </Button>
                      </HStack>
                    </Box>
                  )}
                  
                  {/* Mostrar error si no hay paciente seleccionado */}
                  {errors.patientId && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.patientId.message}
                    </Text>
                  )}
                </FormControl>

                {/* Información del paciente seleccionado */}
                {selectedPatient && (
                  <Box mt={4} p={4} bg="gray.50" borderRadius="md">
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="semibold">
                        {selectedPatient.nombre} {selectedPatient.apellido}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Cédula: {selectedPatient.cedula}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Email: {selectedPatient.email}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Teléfono: {selectedPatient.telefono}
                      </Text>
                    </VStack>
                  </Box>
                )}
              </Box>

              <Divider />

              {/* Información de la Cita */}
              <Box>
                <HStack mb={4}>
                  <Icon as={FaCalendarAlt} />
                  <Heading size="md">Información de la Cita</Heading>
                </HStack>
                
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.date}>
                    <FormLabel>Fecha</FormLabel>
                    <Input
                      type="date"
                      {...register('date', { 
                        required: 'La fecha es requerida',
                        min: {
                          value: today,
                          message: 'La fecha no puede ser anterior a hoy'
                        }
                      })}
                      min={today}
                    />
                    <FormErrorMessage>{errors.date?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.status}>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      {...register('status', { required: 'El estado es requerido' })}
                    >
                      <option value="SCHEDULED">Programada</option>
                      <option value="COMPLETED">Completada</option>
                      <option value="CANCELLED">Cancelada</option>
                      <option value="NO_SHOW">No asistió</option>
                    </Select>
                    <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                <FormControl mt={4}>
                  <FormLabel>Hora</FormLabel>
                  <Input
                    type="time"
                    {...register('time')}
                  />
                </FormControl>
              </Box>

              <Divider />

              {/* Notas */}
              <Box>
                <HStack mb={4}>
                  <Icon as={FaNotesMedical} />
                  <Heading size="md">Notas Adicionales</Heading>
                </HStack>
                
                <FormControl>
                  <FormLabel>Notas</FormLabel>
                  <Textarea
                    {...register('notes')}
                    rows={4}
                    placeholder="Agregue notas sobre la cita, síntomas, tratamiento planificado, etc."
                  />
                </FormControl>
              </Box>

              {/* Alertas */}
              {createAppointmentMutation.isError && (
                <Alert status="error">
                  <AlertIcon />
                  Error al crear la cita. Por favor, intente nuevamente.
                </Alert>
              )}

              {updateAppointmentMutation.isError && (
                <Alert status="error">
                  <AlertIcon />
                  Error al actualizar la cita. Por favor, intente nuevamente.
                </Alert>
              )}
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
            loadingText={appointment ? 'Actualizando...' : 'Creando...'}
          >
            {appointment ? 'Actualizar Cita' : 'Crear Cita'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 