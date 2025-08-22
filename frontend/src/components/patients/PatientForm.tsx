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
  FormErrorMessage
} from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { FaUser, FaIdCard, FaBirthdayCake, FaPhone, FaEnvelope, FaMapMarkerAlt, FaNotesMedical, FaHistory, FaUserMd, FaStethoscope, FaClipboardList } from 'react-icons/fa'
import { AppText } from '../common/AppText'
import { useRouter } from 'next/navigation'
import PatientSuccessModal from './PatientSuccessModal'

interface Patient {
  _id?: string;
  tipo_cedula: string;
  cedula: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: string;
  email: string;
  telefono: string;
  direccion: string;
  enfermedad_actual: string;
  antecedentes_personales: string;
  antecedentes_familiares: string;
  tipo_consulta: string;
  motivo_consulta: string;
}

interface PatientFormProps {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
  onSuccess: () => void
}

// Función para calcular la edad basándose en la fecha de nacimiento
const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export default function PatientForm({ isOpen, onClose, patient, onSuccess }: PatientFormProps) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [newPatient, setNewPatient] = useState<Patient | null>(null)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch, setValue } = useForm<Patient>({
    defaultValues: patient || {
      nombre: '',
      apellido: '',
      cedula: '',
      edad: 0,
      fecha_nacimiento: '',
      email: '',
      telefono: '',
      direccion: '',
      enfermedad_actual: '',
      antecedentes_personales: '',
      antecedentes_familiares: '',
      tipo_consulta: '',
      motivo_consulta: '',
      tipo_cedula: 'V',
      sexo: ''
    }
  })

  // Observar cambios en la fecha de nacimiento para calcular la edad automáticamente
  const fechaNacimiento = watch('fecha_nacimiento');

  useEffect(() => {
    if (fechaNacimiento) {
      const calculatedAge = calculateAge(fechaNacimiento);
      setValue('edad', calculatedAge);
    }
  }, [fechaNacimiento, setValue]);

  // Actualizar el formulario cuando cambie el paciente seleccionado
  useEffect(() => {
    if (patient) {
      console.log('Paciente seleccionado para edición:', patient);
      
      // Resetear el formulario con los datos del paciente
      reset({
        nombre: patient.nombre || '',
        apellido: patient.apellido || '',
        cedula: patient.cedula || '',
        edad: patient.edad || 0,
        fecha_nacimiento: patient.fecha_nacimiento || '',
        email: patient.email || '',
        telefono: patient.telefono || '',
        direccion: patient.direccion || '',
        enfermedad_actual: patient.enfermedad_actual || '',
        antecedentes_personales: patient.antecedentes_personales || '',
        antecedentes_familiares: patient.antecedentes_familiares || '',
        tipo_consulta: patient.tipo_consulta || '',
        motivo_consulta: patient.motivo_consulta || '',
        tipo_cedula: patient.tipo_cedula || 'V',
        sexo: patient.sexo || ''
      });
      
      console.log('Formulario actualizado con datos del paciente');
    } else {
      // Si no hay paciente, resetear a valores por defecto
      reset({
        nombre: '',
        apellido: '',
        cedula: '',
        edad: 0,
        fecha_nacimiento: '',
        email: '',
        telefono: '',
        direccion: '',
        enfermedad_actual: '',
        antecedentes_personales: '',
        antecedentes_familiares: '',
        tipo_consulta: '',
        motivo_consulta: '',
        tipo_cedula: 'V',
        sexo: ''
      });
    }
  }, [patient, reset]);

  const mutation = useMutation({
    mutationFn: async (data: Patient) => {
      // Asegurarse de que los campos opcionales vacíos sean undefined
      const cleanedData = {
        ...data,
        email: data.email || undefined,
        telefono: data.telefono || undefined,
        direccion: data.direccion || undefined,
        enfermedad_actual: data.enfermedad_actual || undefined,
        antecedentes_personales: data.antecedentes_personales || undefined,
        antecedentes_familiares: data.antecedentes_familiares || undefined,
        tipo_consulta: data.tipo_consulta || undefined,
        motivo_consulta: data.motivo_consulta || undefined
      }

      if (patient?._id) {
        return axios.put(`${process.env.NEXT_PUBLIC_API_URL}/patients/${patient._id}`, cleanedData)
      }
      return axios.post(`${process.env.NEXT_PUBLIC_API_URL}/patients`, cleanedData)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      
      if (!patient?._id) {
        // Si es un paciente nuevo, almacenar los datos del paciente y mostrar opciones
        setNewPatient(response.data)
        toast({
          title: 'Paciente creado exitosamente',
          description: 'Selecciona qué quieres hacer a continuación',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      } else {
        // Si es una actualización, mostrar mensaje normal
        toast({
          title: 'Paciente actualizado exitosamente',
          description: 'Los datos han sido actualizados en el sistema',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onSuccess()
        setNewPatient(null)
      }
    },
    onError: (error: any) => {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Ha ocurrido un error al procesar la solicitud',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  })

  const handleClose = () => {
    setNewPatient(null)
    onClose()
  }

  const handleAddAnotherPatient = () => {
    setNewPatient(null)
    reset()
  }

  const onSubmit = (data: Patient) => {
    mutation.mutate(data)
  }

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>{patient ? 'Editar Paciente' : 'Nuevo Paciente'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Sección de Identificación */}
              <Box>
                <HStack mb={4}>
                  <Icon as={FaIdCard} />
                  <Heading size="md">Identificación</Heading>
                </HStack>
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.tipo_cedula}>
                    <FormLabel>Tipo de Cédula</FormLabel>
                    <Select {...register('tipo_cedula', { required: 'El tipo de cédula es requerido' })}>
                      <option value="V">V</option>
                      <option value="E">E</option>
                      <option value="J">J</option>
                    </Select>
                    <FormErrorMessage>{errors.tipo_cedula?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!errors.cedula}>
                    <FormLabel>Cédula</FormLabel>
                    <Input {...register('cedula', { required: 'La cédula es requerida' })} />
                    <FormErrorMessage>{errors.cedula?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Sección de Información Personal */}
              <Box>
                <HStack mb={4}>
                  <Icon as={FaUser} />
                  <Heading size="md">Información Personal</Heading>
                </HStack>
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.nombre}>
                    <FormLabel>Nombre</FormLabel>
                    <Input {...register('nombre', { required: 'El nombre es requerido' })} />
                    <FormErrorMessage>{errors.nombre?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!errors.apellido}>
                    <FormLabel>Apellido</FormLabel>
                    <Input {...register('apellido', { required: 'El apellido es requerido' })} />
                    <FormErrorMessage>{errors.apellido?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!errors.fecha_nacimiento}>
                    <FormLabel>Fecha de Nacimiento</FormLabel>
                    <Input 
                      type="date" 
                      max={new Date().toISOString().split('T')[0]}
                      {...register('fecha_nacimiento', { 
                        required: 'La fecha de nacimiento es requerida',
                        validate: (value) => {
                          if (value && new Date(value) > new Date()) {
                            return 'La fecha de nacimiento no puede ser en el futuro';
                          }
                          return true;
                        }
                      })} 
                    />
                    <FormErrorMessage>{errors.fecha_nacimiento?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!errors.edad}>
                    <FormLabel>Edad</FormLabel>
                    <Input 
                      type="number" 
                      {...register('edad', { 
                        required: 'La edad es requerida',
                        min: { value: 0, message: 'La edad debe ser mayor o igual a 0' },
                        max: { value: 120, message: 'La edad debe ser menor o igual a 120' }
                      })} 
                      readOnly
                      bg="gray.50"
                      _dark={{ bg: 'gray.700' }}
                      placeholder="Se calcula automáticamente"
                    />
                    <FormErrorMessage>{errors.edad?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!errors.sexo}>
                    <FormLabel>Sexo</FormLabel>
                    <Select {...register('sexo', { required: 'El sexo es requerido' })}>
                      <option value="">Seleccione...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </Select>
                    <FormErrorMessage>{errors.sexo?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Sección de Contacto */}
              <Box>
                <HStack mb={4}>
                  <Icon as={FaPhone} />
                  <Heading size="md">Información de Contacto</Heading>
                </HStack>
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.telefono}>
                    <FormLabel>Teléfono</FormLabel>
                    <Input {...register('telefono', { required: 'El teléfono es requerido' })} />
                    <FormErrorMessage>{errors.telefono?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input type="email" {...register('email')} />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!errors.direccion} gridColumn="span 2">
                    <FormLabel>
                      <HStack>
                        <Icon as={FaMapMarkerAlt} />
                        <span>Dirección</span>
                      </HStack>
                    </FormLabel>
                    <Input {...register('direccion', { required: 'La dirección es requerida' })} />
                    <FormErrorMessage>{errors.direccion?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Sección de Información Médica */}
              <Box>
                <HStack mb={4}>
                  <Icon as={FaNotesMedical} />
                  <Heading size="md">Información Médica</Heading>
                </HStack>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Enfermedad Actual</FormLabel>
                    <Textarea {...register('enfermedad_actual')} rows={3} />
                  </FormControl>
                  <SimpleGrid columns={2} spacing={4} width="100%">
                    <FormControl>
                      <FormLabel>
                        <HStack>
                          <Icon as={FaHistory} />
                          <span>Antecedentes Personales</span>
                        </HStack>
                      </FormLabel>
                      <Textarea {...register('antecedentes_personales')} rows={3} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>
                        <HStack>
                          <Icon as={FaUserMd} />
                          <span>Antecedentes Familiares</span>
                        </HStack>
                      </FormLabel>
                      <Textarea {...register('antecedentes_familiares')} rows={3} />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </Box>

              <Divider />

              {/* Sección de Consulta */}
              <Box>
                <HStack mb={4}>
                  <Icon as={FaNotesMedical} />
                  <Heading size="md">Información de la Consulta</Heading>
                </HStack>
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.tipo_consulta}>
                    <FormLabel>Tipo de Consulta</FormLabel>
                    <Select {...register('tipo_consulta', { required: 'El tipo de consulta es requerido' })}>
                      <option value="">Seleccione...</option>
                      <option value="Primera Vez">Primera Vez</option>
                      <option value="Control">Control</option>
                      <option value="Urgencia">Urgencia</option>
                      <option value="Tratamiento">Tratamiento</option>
                      <option value="Limpieza">Limpieza</option>
                      <option value="Ortodoncia">Ortodoncia</option>
                    </Select>
                    <FormErrorMessage>{errors.tipo_consulta?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!errors.motivo_consulta}>
                    <FormLabel>Motivo de la Consulta</FormLabel>
                    <Textarea 
                      {...register('motivo_consulta', { 
                        required: 'El motivo de la consulta es requerido',
                        minLength: {
                          value: 10,
                          message: 'El motivo de la consulta debe tener al menos 10 caracteres'
                        }
                      })} 
                      rows={3}
                      placeholder="Describa el motivo de la consulta"
                    />
                    <FormErrorMessage>{errors.motivo_consulta?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
                <Button variant="ghost" mr={3} onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={mutation.isPending}
                  loadingText="Guardando..."
                >
                  {patient ? 'Actualizar' : 'Crear'} Paciente
                </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>

      {/* Modal de éxito con opciones */}
      <PatientSuccessModal
        isOpen={!!newPatient}
        onClose={handleClose}
        patient={newPatient}
        onAddAnotherPatient={handleAddAnotherPatient}
      />
    </>
  )
} 