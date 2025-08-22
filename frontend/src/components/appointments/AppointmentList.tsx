'use client'

import React, { useState } from 'react'
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
  VStack,
  Text,
  Flex,
  Heading,
  Alert,
  AlertIcon,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon, PhoneIcon, EmailIcon } from '@chakra-ui/icons'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaUserClock, FaCalendarAlt, FaClock, FaTooth } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

interface Appointment {
  _id: string
  patientId: string
  patient: {
    _id: string
    nombre: string
    apellido: string
    email: string
    telefono: string
  }
  date: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  notes: string
  createdAt: string
  updatedAt: string
}

interface AppointmentListProps {
  searchTerm: string
  filterStatus: string
  selectedDate: string
}

// Importar AppointmentForm dinámicamente
const AppointmentForm = dynamic(() => import('./AppointmentForm'), {
  ssr: false
})

const AppointmentList: React.FC<AppointmentListProps> = ({ 
  searchTerm, 
  filterStatus, 
  selectedDate 
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const router = useRouter()

  const { data: appointments, isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/appointments`)
      return response.data
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'blue'
      case 'COMPLETED':
        return 'green'
      case 'CANCELLED':
        return 'red'
      case 'NO_SHOW':
        return 'orange'
      default:
        return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Programada'
      case 'COMPLETED':
        return 'Completada'
      case 'CANCELLED':
        return 'Cancelada'
      case 'NO_SHOW':
        return 'No asistió'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredAppointments = appointments?.filter(appointment => {
    const matchesSearch = searchTerm === '' || 
      `${appointment.patient?.nombre || 'Sin nombre'} ${appointment.patient?.apellido || 'Sin apellido'}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (appointment.patient?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.patient?.telefono || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus

    const matchesDate = selectedDate === '' || 
      appointment.date.startsWith(selectedDate)

    return matchesSearch && matchesStatus && matchesDate
  })

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    onOpen()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${id}`)
        refetch()
      } catch (error) {
        console.error('Error al eliminar cita:', error)
      }
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${id}`, {
        status: newStatus
      })
      refetch()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
    }
  }

  const handleViewOdontograma = (patientId: string) => {
    router.push(`/odontograma?patientId=${patientId}`)
  }

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Cargando citas...</Text>
      </Box>
    )
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        No hay citas registradas. Crea una nueva cita para comenzar.
      </Alert>
    )
  }

  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Heading size="md">
          Citas ({filteredAppointments?.length || 0})
        </Heading>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Paciente</Th>
              <Th>Fecha y Hora</Th>
              <Th>Estado</Th>
              <Th>Notas</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredAppointments?.map((appointment) => (
              <Tr key={appointment._id}>
                <Td>
                  <HStack spacing={3}>
                                                    <Avatar size="sm" name={`${appointment.patient?.nombre || 'Sin nombre'} ${appointment.patient?.apellido || 'Sin apellido'}`} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">
                        {appointment.patient?.nombre || 'Sin nombre'} {appointment.patient?.apellido || 'Sin apellido'}
                      </Text>
                      <HStack spacing={2}>
                        <Tooltip label="Llamar">
                          <IconButton
                            aria-label="Llamar"
                            icon={<PhoneIcon />}
                            size="xs"
                            variant="ghost"
                            onClick={() => window.open(`tel:${appointment.patient?.telefono || ''}`)}
                          />
                        </Tooltip>
                        <Tooltip label="Enviar email">
                          <IconButton
                            aria-label="Enviar email"
                            icon={<EmailIcon />}
                            size="xs"
                            variant="ghost"
                            onClick={() => window.open(`mailto:${appointment.patient?.email || ''}`)}
                          />
                        </Tooltip>
                      </HStack>
                    </VStack>
                  </HStack>
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <FaCalendarAlt />
                      <Text fontSize="sm">{formatDate(appointment.date)}</Text>
                    </HStack>
                    <HStack>
                      <FaClock />
                      <Text fontSize="sm" color="gray.600">{formatTime(appointment.date)}</Text>
                    </HStack>
                  </VStack>
                </Td>
                <Td>
                  <Badge colorScheme={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </Td>
                <Td>
                  <Text fontSize="sm" noOfLines={2}>
                    {appointment.notes || 'Sin notas'}
                  </Text>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Cambiar estado"
                        icon={<FaUserClock />}
                        size="sm"
                        variant="ghost"
                      />
                      <MenuList>
                        <MenuItem onClick={() => handleStatusChange(appointment._id, 'SCHEDULED')}>
                          Programada
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusChange(appointment._id, 'COMPLETED')}>
                          Completada
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusChange(appointment._id, 'CANCELLED')}>
                          Cancelada
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusChange(appointment._id, 'NO_SHOW')}>
                          No asistió
                        </MenuItem>
                      </MenuList>
                    </Menu>
                    
                    <Tooltip label="Ver odontograma">
                      <IconButton
                        aria-label="Ver odontograma"
                        icon={<FaTooth />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => handleViewOdontograma(appointment.patientId)}
                      />
                    </Tooltip>
                    
                    <Tooltip label="Editar">
                      <IconButton
                        aria-label="Editar"
                        icon={<FaEdit />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(appointment)}
                      />
                    </Tooltip>
                    
                    <Tooltip label="Eliminar">
                      <IconButton
                        aria-label="Eliminar"
                        icon={<FaTrash />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(appointment._id)}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <AppointmentForm
        isOpen={isOpen}
        onClose={onClose}
        appointment={selectedAppointment}
        onSuccess={() => {
          refetch()
          onClose()
        }}
      />
    </Box>
  )
}

export default AppointmentList 