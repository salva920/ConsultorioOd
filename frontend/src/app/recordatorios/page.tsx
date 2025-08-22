'use client'

import React, { useState } from 'react'
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useToast,
} from '@chakra-ui/react'
import { 
  FaBell, 
  FaEnvelope, 
  FaWhatsapp, 
  FaPlay, 
  FaStop, 
  FaSync,
  FaEye,
  FaRedo
} from 'react-icons/fa'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import ProtectedLayout from '../../components/layouts/ProtectedLayout'

interface Reminder {
  _id: string
  appointmentId: {
    _id: string
    date: string
    status: string
    notes: string
  }
  patientId: {
    _id: string
    nombre: string
    apellido: string
    email: string
    telefono: string
    cedula: string
  }
  type: 'email' | 'whatsapp' | 'both'
  scheduledFor: string
  sent: boolean
  sentAt?: string
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  errorMessage?: string
  reminderType: '24h_before' | '2h_before' | '1h_before' | '30min_before'
}

interface ReminderStats {
  pending: number
  sent: number
  failed: number
  cancelled: number
}

interface ServiceStatus {
  isRunning: boolean
  notifications: {
    email: boolean
    whatsapp: boolean
    configured: boolean
  }
}

export default function RecordatoriosPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const toast = useToast()
  const queryClient = useQueryClient()

  // Obtener recordatorios
  const { data: reminders, isLoading: loadingReminders } = useQuery<Reminder[]>({
    queryKey: ['reminders', selectedStatus],
    queryFn: async () => {
      const params = selectedStatus !== 'all' ? `?status=${selectedStatus}` : ''
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reminders${params}`)
      return response.data
    }
  })

  // Obtener estadísticas
  const { data: stats, isLoading: loadingStats } = useQuery<ReminderStats>({
    queryKey: ['reminder-stats'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reminders/stats`)
      return response.data
    }
  })

  // Obtener estado del servicio
  const { data: serviceStatus, isLoading: loadingServiceStatus } = useQuery<ServiceStatus>({
    queryKey: ['service-status'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reminders/status`)
      return response.data
    },
    refetchInterval: 10000 // Refrescar cada 10 segundos
  })

  // Mutaciones
  const startServiceMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reminders/service/start`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-status'] })
      toast({
        title: 'Servicio iniciado',
        description: 'El servicio de recordatorios se ha iniciado correctamente',
        status: 'success',
        duration: 3000,
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el servicio de recordatorios',
        status: 'error',
        duration: 3000,
      })
    }
  })

  const stopServiceMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reminders/service/stop`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-status'] })
      toast({
        title: 'Servicio detenido',
        description: 'El servicio de recordatorios se ha detenido correctamente',
        status: 'warning',
        duration: 3000,
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo detener el servicio de recordatorios',
        status: 'error',
        duration: 3000,
      })
    }
  })

  const processRemindersMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reminders/service/process`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['reminder-stats'] })
      toast({
        title: 'Procesamiento completado',
        description: 'Los recordatorios pendientes han sido procesados',
        status: 'success',
        duration: 3000,
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudieron procesar los recordatorios',
        status: 'error',
        duration: 3000,
      })
    }
  })

  const resendReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reminders/${reminderId}/resend`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['reminder-stats'] })
      toast({
        title: 'Recordatorio reenviado',
        description: 'El recordatorio se ha reenviado correctamente',
        status: 'success',
        duration: 3000,
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo reenviar el recordatorio',
        status: 'error',
        duration: 3000,
      })
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow'
      case 'sent': return 'green'
      case 'failed': return 'red'
      case 'cancelled': return 'gray'
      default: return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'sent': return 'Enviado'
      case 'failed': return 'Fallido'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  const getReminderTypeText = (type: string) => {
    switch (type) {
      case '24h_before': return '24h antes'
      case '2h_before': return '2h antes'
      case '1h_before': return '1h antes'
      case '30min_before': return '30min antes'
      default: return type
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredReminders = reminders?.filter(reminder => 
    selectedStatus === 'all' || reminder.status === selectedStatus
  )

  return (
    <ProtectedLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <VStack align="start" spacing={2}>
              <Heading as="h1" size="xl" mb={2}>
                Gestión de Recordatorios
              </Heading>
              <Text color="gray.600">
                Administra los recordatorios automáticos de citas
              </Text>
            </VStack>
          </Box>

        {/* Alertas de configuración */}
        {serviceStatus && !serviceStatus.notifications.configured && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Configuración incompleta</AlertTitle>
              <AlertDescription>
                Las notificaciones no están configuradas correctamente. 
                Revisa las variables de entorno para email y WhatsApp.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Estadísticas */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Pendientes</StatLabel>
                <StatNumber color="yellow.600" fontSize="2xl">
                  {loadingStats ? '...' : stats?.pending || 0}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Enviados</StatLabel>
                <StatNumber color="green.600" fontSize="2xl">
                  {loadingStats ? '...' : stats?.sent || 0}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Fallidos</StatLabel>
                <StatNumber color="red.600" fontSize="2xl">
                  {loadingStats ? '...' : stats?.failed || 0}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">Cancelados</StatLabel>
                <StatNumber color="gray.600" fontSize="2xl">
                  {loadingStats ? '...' : stats?.cancelled || 0}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Control del servicio */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <HStack>
                <FaBell color="blue" />
                <Heading size="md">Control del Servicio</Heading>
              </HStack>
              <Badge 
                colorScheme={serviceStatus?.isRunning ? 'green' : 'red'}
                fontSize="sm"
              >
                {serviceStatus?.isRunning ? 'Ejecutándose' : 'Detenido'}
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <HStack spacing={4}>
              <Button
                leftIcon={<FaPlay />}
                colorScheme="green"
                onClick={() => startServiceMutation.mutate()}
                isLoading={startServiceMutation.isPending}
                isDisabled={serviceStatus?.isRunning}
              >
                Iniciar Servicio
              </Button>
              
              <Button
                leftIcon={<FaStop />}
                colorScheme="red"
                onClick={() => stopServiceMutation.mutate()}
                isLoading={stopServiceMutation.isPending}
                isDisabled={!serviceStatus?.isRunning}
              >
                Detener Servicio
              </Button>
              
              <Button
                leftIcon={<FaSync />}
                colorScheme="blue"
                onClick={() => processRemindersMutation.mutate()}
                isLoading={processRemindersMutation.isPending}
              >
                Procesar Pendientes
              </Button>
            </HStack>

            {/* Estado de configuración */}
            <HStack mt={4} spacing={6}>
              <HStack>
                <FaEnvelope color={serviceStatus?.notifications.email ? 'green' : 'red'} />
                <Text fontSize="sm">
                  Email: {serviceStatus?.notifications.email ? 'Configurado' : 'No configurado'}
                </Text>
              </HStack>
              
              <HStack>
                <FaWhatsapp color={serviceStatus?.notifications.whatsapp ? 'green' : 'red'} />
                <Text fontSize="sm">
                  WhatsApp: {serviceStatus?.notifications.whatsapp ? 'Configurado' : 'No configurado'}
                </Text>
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Filtros */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <HStack spacing={4}>
              <Text fontWeight="semibold">Filtrar por estado:</Text>
              <Button
                size="sm"
                variant={selectedStatus === 'all' ? 'solid' : 'outline'}
                onClick={() => setSelectedStatus('all')}
              >
                Todos
              </Button>
              <Button
                size="sm"
                variant={selectedStatus === 'pending' ? 'solid' : 'outline'}
                onClick={() => setSelectedStatus('pending')}
              >
                Pendientes
              </Button>
              <Button
                size="sm"
                variant={selectedStatus === 'sent' ? 'solid' : 'outline'}
                onClick={() => setSelectedStatus('sent')}
              >
                Enviados
              </Button>
              <Button
                size="sm"
                variant={selectedStatus === 'failed' ? 'solid' : 'outline'}
                onClick={() => setSelectedStatus('failed')}
              >
                Fallidos
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Lista de recordatorios */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Recordatorios</Heading>
              <Text fontSize="sm" color="gray.600">
                {filteredReminders?.length || 0} recordatorios
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            {loadingReminders ? (
              <Text textAlign="center" py={8}>Cargando recordatorios...</Text>
            ) : filteredReminders && filteredReminders.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Paciente</Th>
                      <Th>Tipo</Th>
                      <Th>Programado para</Th>
                      <Th>Estado</Th>
                      <Th>Enviado</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredReminders.map((reminder) => (
                      <Tr key={reminder._id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold">
                              {reminder.patientId?.nombre || 'N/A'} {reminder.patientId?.apellido || ''}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {reminder.patientId?.cedula || 'N/A'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Badge colorScheme="blue" size="sm">
                              {getReminderTypeText(reminder.reminderType)}
                            </Badge>
                            <HStack spacing={1}>
                              {reminder.type.includes('email') && <FaEnvelope size="12" />}
                              {reminder.type.includes('whatsapp') && <FaWhatsapp size="12" />}
                            </HStack>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {formatDateTime(reminder.scheduledFor)}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(reminder.status)}>
                            {getStatusText(reminder.status)}
                          </Badge>
                        </Td>
                        <Td>
                          {reminder.sentAt ? (
                            <Text fontSize="sm">
                              {formatDateTime(reminder.sentAt)}
                            </Text>
                          ) : (
                            <Text fontSize="sm" color="gray.500">
                              No enviado
                            </Text>
                          )}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            {reminder.status === 'failed' && (
                              <IconButton
                                aria-label="Reenviar recordatorio"
                                icon={<FaRedo />}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => resendReminderMutation.mutate(reminder._id)}
                                isLoading={resendReminderMutation.isPending}
                              />
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Text textAlign="center" py={8} color="gray.500">
                No hay recordatorios para mostrar
              </Text>
            )}
          </CardBody>
                 </Card>
       </VStack>
     </Container>
   </ProtectedLayout>
   )
 } 