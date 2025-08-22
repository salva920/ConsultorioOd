'use client'

import React, { useState } from 'react'
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
  Box,
  Icon,
  Heading,
  Divider,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
} from '@chakra-ui/react'
import { 
  FaCheckCircle, 
  FaTooth, 
  FaCalendarAlt, 
  FaUser, 
  FaPhone, 
  FaEnvelope,
  FaIdCard,
  FaMapMarkerAlt
} from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import AppointmentForm from '../appointments/AppointmentForm'

interface Patient {
  _id?: string
  nombre: string
  apellido: string
  cedula: string
  tipo_cedula: string
  edad: number
  email: string
  telefono: string
  direccion: string
  tipo_consulta: string
  motivo_consulta: string
}

interface PatientSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
  onAddAnotherPatient: () => void
}

export default function PatientSuccessModal({ 
  isOpen, 
  onClose, 
  patient, 
  onAddAnotherPatient 
}: PatientSuccessModalProps) {
  const router = useRouter()
  const toast = useToast()

  const handleViewOdontograma = () => {
    if (patient) {
      onClose()
      router.push(`/odontograma?patientId=${patient._id}`)
    }
  }

  const handleAppointmentSuccess = () => {
    toast({
      title: 'Cita agendada exitosamente',
      description: `Se ha agendado una cita para ${patient?.nombre} ${patient?.apellido}. Redirigiendo a la página de citas...`,
      status: 'success',
      duration: 3000,
    })
    
    // Redirigir a la página de citas después de un breve delay
    setTimeout(() => {
      router.push('/citas')
    }, 1000)
  }

  if (!patient) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={FaCheckCircle} color="green.500" />
            <Text>¡Paciente Creado Exitosamente!</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Información del paciente */}
            <Box p={4} bg="green.50" borderRadius="lg" border="1px" borderColor="green.200">
              <HStack mb={3}>
                <Icon as={FaUser} color="green.600" />
                <Heading size="md" color="green.700">Información del Paciente</Heading>
              </HStack>
              
              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontWeight="bold" color="green.700">
                    {patient.nombre} {patient.apellido}
                  </Text>
                  <HStack mt={1}>
                    <Icon as={FaIdCard} size="xs" color="green.600" />
                    <Text fontSize="sm" color="green.600">
                      {patient.tipo_cedula}-{patient.cedula}
                    </Text>
                  </HStack>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="green.600">
                    <strong>Edad:</strong> {patient.edad} años
                  </Text>
                  <Text fontSize="sm" color="green.600">
                    <strong>Tipo de Consulta:</strong> {patient.tipo_consulta}
                  </Text>
                </Box>
              </SimpleGrid>

              <Divider my={3} borderColor="green.300" />
              
              <SimpleGrid columns={2} spacing={4}>
                <HStack>
                  <Icon as={FaPhone} size="xs" color="green.600" />
                  <Text fontSize="sm" color="green.600">{patient.telefono}</Text>
                </HStack>
                {patient.email && (
                  <HStack>
                    <Icon as={FaEnvelope} size="xs" color="green.600" />
                    <Text fontSize="sm" color="green.600">{patient.email}</Text>
                  </HStack>
                )}
              </SimpleGrid>

              <HStack mt={3}>
                <Icon as={FaMapMarkerAlt} size="xs" color="green.600" />
                <Text fontSize="sm" color="green.600">{patient.direccion}</Text>
              </HStack>
            </Box>

            {/* Opciones disponibles */}
            <Box>
              <Heading size="md" mb={4}>¿Qué te gustaría hacer ahora?</Heading>
              
              <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                  <Tab>
                    <HStack>
                      <Icon as={FaTooth} />
                      <Text>Odontograma</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack>
                      <Icon as={FaCalendarAlt} />
                      <Text>Agendar Cita</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Pestaña Odontograma */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Card>
                        <CardHeader>
                          <HStack>
                            <Icon as={FaTooth} color="blue.500" />
                            <Heading size="sm">Ver Odontograma</Heading>
                          </HStack>
                        </CardHeader>
                        <CardBody>
                          <Text mb={4}>
                            Accede al odontograma digital del paciente para registrar tratamientos, 
                            diagnósticos e intervenciones dentales.
                          </Text>
                          <Button 
                            colorScheme="blue" 
                            leftIcon={<FaTooth />}
                            onClick={handleViewOdontograma}
                            size="lg"
                            width="100%"
                          >
                            Abrir Odontograma
                          </Button>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  {/* Pestaña Agendar Cita */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Card>
                        <CardHeader>
                          <HStack>
                            <Icon as={FaCalendarAlt} color="green.500" />
                            <Heading size="sm">Agendar Cita</Heading>
                          </HStack>
                        </CardHeader>
                        <CardBody>
                          <Text mb={4}>
                            Programa una cita para el paciente. Puedes seleccionar fecha, 
                            hora y agregar notas específicas.
                          </Text>
                          <Button 
                            colorScheme="green" 
                            leftIcon={<FaCalendarAlt />}
                            onClick={() => {
                              onClose()
                              // Abrir el formulario de citas en una nueva página o modal separado
                              router.push('/citas?newAppointment=true&patientId=' + patient._id)
                            }}
                            size="lg"
                            width="100%"
                          >
                            Agendar Cita
                          </Button>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cerrar
          </Button>
          <Button
            colorScheme="blue"
            onClick={onAddAnotherPatient}
          >
            Agregar Otro Paciente
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 