'use client'

import React from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Avatar,
  Progress,
  useColorModeValue,
  Icon,
  Button,
  useDisclosure,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import {
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaTooth,
  FaChartLine,
  FaCheckCircle,
  FaUserPlus,
  FaCalendarPlus,
  FaChartBar,
  FaIdCard,
} from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import AppointmentForm from '../components/appointments/AppointmentForm'
import PatientForm from '../components/patients/PatientForm'
import ProtectedLayout from '../components/layouts/ProtectedLayout'

interface Patient {
  _id: string
  nombre: string
  apellido: string
  cedula: string
  telefono: string
  email: string
  edad: number
  tipo_consulta: string
  createdAt: string
}

interface Appointment {
  _id: string
  patientId: string
  date: string
  time: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  notes: string
  patient: Patient
}

interface DashboardStats {
  totalPatients: number
  totalAppointments: number
  todayAppointments: number
  pendingAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  newPatientsThisMonth: number
  averageAge: number
}

export default function Dashboard() {
  const router = useRouter()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const cardBg = useColorModeValue('white', 'gray.700')
  
  const { isOpen: isAppointmentFormOpen, onOpen: onAppointmentFormOpen, onClose: onAppointmentFormClose } = useDisclosure()
  const { isOpen: isPatientFormOpen, onOpen: onPatientFormOpen, onClose: onPatientFormClose } = useDisclosure()

  // Obtener estadísticas del dashboard
  const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`)
      return response.data
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  })

  // Obtener citas de hoy
  const { data: todayAppointments, isLoading: loadingTodayAppointments } = useQuery<Appointment[]>({
    queryKey: ['today-appointments'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/appointments?date=${today}`)
      return response.data
    },
    refetchInterval: 60000, // Refrescar cada minuto
  })

  // Obtener pacientes recientes
  const { data: recentPatients, isLoading: loadingRecentPatients } = useQuery<Patient[]>({
    queryKey: ['recent-patients'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/patients?limit=5&sort=-createdAt`)
      return response.data
    },
  })

  // Obtener próximas citas
  const { data: upcomingAppointments, isLoading: loadingUpcomingAppointments } = useQuery<Appointment[]>({
    queryKey: ['upcoming-appointments'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/appointments?status=SCHEDULED&limit=5&sort=date`)
      return response.data
    },
  })

  // Obtener estadísticas del inventario
  const { data: inventoryStats, isLoading: loadingInventoryStats } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/inventory/stats`)
      return response.data
    },
    refetchInterval: 60000, // Refrescar cada minuto
  })

  // Obtener insumos con stock bajo
  const { data: lowStockItems, isLoading: loadingLowStockItems } = useQuery({
    queryKey: ['low-stock-items'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/inventory/low-stock`)
      return response.data
    },
    refetchInterval: 60000, // Refrescar cada minuto
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'blue'
      case 'COMPLETED': return 'green'
      case 'CANCELLED': return 'red'
      case 'NO_SHOW': return 'orange'
      default: return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Programada'
      case 'COMPLETED': return 'Completada'
      case 'CANCELLED': return 'Cancelada'
      case 'NO_SHOW': return 'No asistió'
      default: return status
    }
  }

  const formatTime = (time: string) => {
    if (!time) return ''
    return time.substring(0, 5)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const urgentAppointments = todayAppointments?.filter(apt => apt.status === 'SCHEDULED') || []

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  };

  const MotionBox = motion.create(Box);
  const MotionCard = motion.create(Card);
  const MotionButton = motion.create(Button);

  return (
    <ProtectedLayout>
      <Container maxW="container.xl" py={8}>
        <MotionBox
          as={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
        <VStack spacing={8} align="stretch">
          {/* Header del Dashboard */}
          <MotionBox variants={itemVariants}>
            <VStack align="start" spacing={3}>
              <Heading 
                size="lg" 
                bgGradient="linear(to-r, blue.600, purple.600)"
                bgClip="text"
                fontWeight="bold"
              >
                Dashboard del Consultorio
              </Heading>
              <Text 
                color="gray.600" 
                fontSize="lg"
                fontWeight="medium"
              >
                Bienvenido al panel de control de tu consultorio 
              </Text>
            </VStack>
          </MotionBox>

          {/* Alertas urgentes */}  
          <MotionBox variants={itemVariants}>
            <VStack spacing={4} align="stretch">
              {urgentAppointments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Alert 
                    status="info" 
                    borderRadius="lg"
                    boxShadow="0 4px 12px rgba(59, 130, 246, 0.15)"
                    border="1px solid"
                    borderColor="blue.200"
                  >
                    <AlertIcon />
                    <Box>
                      <AlertTitle>¡Citas programadas para hoy!</AlertTitle>
                      <AlertDescription>
                        Tienes {urgentAppointments.length} cita{urgentAppointments.length > 1 ? 's' : ''} programada{urgentAppointments.length > 1 ? 's' : ''} para hoy.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </motion.div>
              )}

              {inventoryStats?.lowStockCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Alert 
                    status="warning" 
                    borderRadius="lg"
                    boxShadow="0 4px 12px rgba(245, 158, 11, 0.15)"
                    border="1px solid"
                    borderColor="orange.200"
                  >
                    <AlertIcon />
                    <Box>
                      <AlertTitle>¡Alerta de Stock Bajo!</AlertTitle>
                      <AlertDescription>
                        Tienes {inventoryStats.lowStockCount} insumo{inventoryStats.lowStockCount > 1 ? 's' : ''} con stock bajo que requieren atención.
                        <MotionButton
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          ml={4}
                          onClick={() => router.push('/inventario')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Ver Inventario
                        </MotionButton>
                      </AlertDescription>
                    </Box>
                  </Alert>
                </motion.div>
              )}
            </VStack>
          </MotionBox>

          {/* Estadísticas principales */}
          <MotionBox variants={itemVariants}>
            <SimpleGrid columns={{ base: 2, md: 5 }} spacing={6}>
              <MotionCard 
                bg={cardBg} 
                borderWidth="1px" 
                borderColor={borderColor}
                variants={cardVariants}
                whileHover="hover"
                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
              >
                <CardBody>
                  <Stat>
                    <HStack>
                      <Icon as={FaUsers} color="blue.500" boxSize={6} />
                      <StatLabel color="gray.600">Total Pacientes</StatLabel>
                    </HStack>
                    <StatNumber color="blue.600" fontSize="2xl">
                      {loadingStats ? '...' : stats?.totalPatients || 0}
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      {stats?.newPatientsThisMonth || 0} este mes
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </MotionCard>

              <MotionCard 
                bg={cardBg} 
                borderWidth="1px" 
                borderColor={borderColor}
                variants={cardVariants}
                whileHover="hover"
                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
              >
                <CardBody>
                  <Stat>
                    <HStack>
                      <Icon as={FaCalendarAlt} color="green.500" boxSize={6} />
                      <StatLabel color="gray.600">Citas Hoy</StatLabel>
                    </HStack>
                    <StatNumber color="green.600" fontSize="2xl">
                      {loadingTodayAppointments ? '...' : todayAppointments?.length || 0}
                    </StatNumber>
                    <StatHelpText>
                      {urgentAppointments.length} programadas
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </MotionCard>

              <MotionCard 
                bg={cardBg} 
                borderWidth="1px" 
                borderColor={borderColor}
                variants={cardVariants}
                whileHover="hover"
                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
              >
                <CardBody>
                  <Stat>
                    <HStack>
                      <Icon as={FaClock} color="orange.500" boxSize={6} />
                      <StatLabel color="gray.600">Pendientes</StatLabel>
                    </HStack>
                    <StatNumber color="orange.600" fontSize="2xl">
                      {loadingStats ? '...' : stats?.pendingAppointments || 0}
                    </StatNumber>
                    <StatHelpText>
                      Próximas citas
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </MotionCard>

              <MotionCard 
                bg={cardBg} 
                borderWidth="1px" 
                borderColor={borderColor}
                variants={cardVariants}
                whileHover="hover"
                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
              >
                <CardBody>
                  <Stat>
                    <HStack>
                      <Icon as={FaCheckCircle} color="purple.500" boxSize={6} />
                      <StatLabel color="gray.600">Completadas</StatLabel>
                    </HStack>
                    <StatNumber color="purple.600" fontSize="2xl">
                      {loadingStats ? '...' : stats?.completedAppointments || 0}
                    </StatNumber>
                    <StatHelpText>
                      Este mes
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </MotionCard>

              <MotionCard 
                bg={cardBg} 
                borderWidth="1px" 
                borderColor={borderColor}
                variants={cardVariants}
                whileHover="hover"
                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
              >
                <CardBody>
                  <Stat>
                    <HStack>
                      <Icon as={FaChartBar} color="red.500" boxSize={6} />
                      <StatLabel color="gray.600">Stock Bajo</StatLabel>
                    </HStack>
                    <StatNumber color="red.600" fontSize="2xl">
                      {loadingInventoryStats ? '...' : inventoryStats?.lowStockCount || 0}
                    </StatNumber>
                    <StatHelpText>
                      Insumos
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </MotionCard>
            </SimpleGrid>
          </MotionBox>

          {/* Acciones rápidas */}
          <MotionBox variants={itemVariants}>
            <MotionCard 
              bg={cardBg} 
              borderWidth="1px" 
              borderColor={borderColor}
              variants={cardVariants}
              whileHover="hover"
              boxShadow="0 2px 8px rgba(0,0,0,0.1)"
              _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
            >
              <CardHeader>
                <HStack>
                  <Icon as={FaChartBar} color="blue.500" />
                  <Heading size="md">Acciones Rápidas</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                  <MotionButton
                    leftIcon={<FaUserPlus />}
                    colorScheme="blue"
                    onClick={onPatientFormOpen}
                    size="lg"
                    height="60px"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Nuevo Paciente
                  </MotionButton>
                  <MotionButton
                    leftIcon={<FaCalendarPlus />}
                    colorScheme="green"
                    onClick={onAppointmentFormOpen}
                    size="lg"
                    height="60px"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Nueva Cita
                  </MotionButton>
                  <MotionButton
                    leftIcon={<FaTooth />}
                    colorScheme="purple"
                    onClick={() => router.push('/odontograma')}
                    size="lg"
                    height="60px"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Odontogramas
                  </MotionButton>
                  <MotionButton
                    leftIcon={<FaUsers />}
                    colorScheme="orange"
                    onClick={() => router.push('/pacientes')}
                    size="lg"
                    height="60px"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Ver Pacientes
                  </MotionButton>
                  <MotionButton
                    leftIcon={<FaChartBar />}
                    colorScheme="red"
                    onClick={() => router.push('/inventario')}
                    size="lg"
                    height="60px"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Inventario
                  </MotionButton>
                </SimpleGrid>
              </CardBody>
            </MotionCard>
          </MotionBox>

          {/* Contenido principal */}
          <MotionBox variants={itemVariants}>
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
              {/* Columna izquierda */}
              <GridItem>
                <VStack spacing={6} align="stretch">
                  {/* Citas de hoy */}
                  <MotionCard 
                    bg={cardBg} 
                    borderWidth="1px" 
                    borderColor={borderColor}
                    variants={cardVariants}
                    whileHover="hover"
                    boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                    _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                  >
                    <CardHeader>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FaCalendarAlt} color="blue.500" />
                          <Heading size="md">Citas de Hoy</Heading>
                        </HStack>
                        <Badge colorScheme="blue" fontSize="sm">
                          {todayAppointments?.length || 0} citas
                        </Badge>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      {loadingTodayAppointments ? (
                        <Text>Cargando citas...</Text>
                      ) : todayAppointments && todayAppointments.length > 0 ? (
                        <VStack spacing={3} align="stretch">
                          {todayAppointments.map((appointment) => (
                            <motion.div
                              key={appointment._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Box
                                p={4}
                                borderWidth="1px"
                                borderColor={borderColor}
                                borderRadius="md"
                                bg={useColorModeValue('gray.50', 'gray.600')}
                                _hover={{ bg: useColorModeValue('gray.100', 'gray.500') }}
                                transition="all 0.2s"
                              >
                                <HStack justify="space-between">
                                  <VStack align="start" spacing={1}>
                                    <HStack>
                                      <Avatar size="sm" name={`${appointment.patient.nombre} ${appointment.patient.apellido}`} />
                                      <Text fontWeight="semibold">
                                        {appointment.patient.nombre} {appointment.patient.apellido}
                                      </Text>
                                    </HStack>
                                    <HStack spacing={4} fontSize="sm" color="gray.600">
                                      <HStack>
                                        <Icon as={FaClock} size="xs" />
                                        <Text>{formatTime(appointment.time)}</Text>
                                      </HStack>
                                      <HStack>
                                        <Icon as={FaTooth} size="xs" />
                                        <Text>{appointment.patient.tipo_consulta}</Text>
                                      </HStack>
                                    </HStack>
                                  </VStack>
                                  <Badge colorScheme={getStatusColor(appointment.status)}>
                                    {getStatusText(appointment.status)}
                                  </Badge>
                                </HStack>
                              </Box>
                            </motion.div>
                          ))}
                        </VStack>
                      ) : (
                        <Text color="gray.500" textAlign="center" py={4}>
                          No hay citas programadas para hoy
                        </Text>
                      )}
                    </CardBody>
                  </MotionCard>

                  {/* Próximas citas */}
                  <MotionCard 
                    bg={cardBg} 
                    borderWidth="1px" 
                    borderColor={borderColor}
                    variants={cardVariants}
                    whileHover="hover"
                    boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                    _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                  >
                    <CardHeader>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FaClock} color="orange.500" />
                          <Heading size="md">Próximas Citas</Heading>
                        </HStack>
                        <MotionButton
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => router.push('/citas')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Ver todas
                        </MotionButton>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      {loadingUpcomingAppointments ? (
                        <Text>Cargando próximas citas...</Text>
                      ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                        <VStack spacing={3} align="stretch">
                          {upcomingAppointments.slice(0, 3).map((appointment) => (
                            <motion.div
                              key={appointment._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Box
                                p={3}
                                borderWidth="1px"
                                borderColor={borderColor}
                                borderRadius="md"
                                bg={useColorModeValue('gray.50', 'gray.600')}
                                _hover={{ bg: useColorModeValue('gray.100', 'gray.500') }}
                                transition="all 0.2s"
                              >
                                <HStack justify="space-between">
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="semibold" fontSize="sm">
                                      {appointment.patient?.nombre || 'Sin nombre'} {appointment.patient?.apellido || 'Sin apellido'}
                                    </Text>
                                    <HStack spacing={4} fontSize="xs" color="gray.600">
                                      <HStack>
                                        <Icon as={FaCalendarAlt} size="xs" />
                                        <Text>{formatDate(appointment.date)}</Text>
                                      </HStack>
                                      <HStack>
                                        <Icon as={FaClock} size="xs" />
                                        <Text>{formatTime(appointment.time)}</Text>
                                      </HStack>
                                    </HStack>
                                  </VStack>
                                  <Badge colorScheme="blue" fontSize="xs">
                                    {getStatusText(appointment.status)}
                                  </Badge>
                                </HStack>
                              </Box>
                            </motion.div>
                          ))}
                        </VStack>
                      ) : (
                        <Text color="gray.500" textAlign="center" py={4}>
                          No hay próximas citas programadas
                        </Text>
                      )}
                    </CardBody>
                  </MotionCard>
                </VStack>
              </GridItem>

              {/* Columna derecha */}
              <GridItem>
                <VStack spacing={6} align="stretch">
                  {/* Pacientes recientes */}
                  <MotionCard 
                    bg={cardBg} 
                    borderWidth="1px" 
                    borderColor={borderColor}
                    variants={cardVariants}
                    whileHover="hover"
                    boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                    _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                  >
                    <CardHeader>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FaUsers} color="green.500" />
                          <Heading size="md">Pacientes Recientes</Heading>
                        </HStack>
                        <MotionButton
                          size="sm"
                          colorScheme="green"
                          variant="ghost"
                          onClick={() => router.push('/pacientes')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Ver todos
                        </MotionButton>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      {loadingRecentPatients ? (
                        <Text>Cargando pacientes...</Text>
                      ) : recentPatients && recentPatients.length > 0 ? (
                        <VStack spacing={3} align="stretch">
                          {recentPatients.map((patient) => (
                            <motion.div
                              key={patient._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Box
                                p={3}
                                borderWidth="1px"
                                borderColor={borderColor}
                                borderRadius="md"
                                bg={useColorModeValue('gray.50', 'gray.600')}
                                cursor="pointer"
                                onClick={() => router.push(`/patients/${patient._id}`)}
                                _hover={{ bg: useColorModeValue('gray.100', 'gray.500') }}
                                transition="all 0.2s"
                              >
                                <HStack>
                                  <Avatar size="sm" name={`${patient.nombre} ${patient.apellido}`} />
                                  <VStack align="start" spacing={1} flex={1}>
                                    <Text fontWeight="semibold" fontSize="sm">
                                      {patient.nombre} {patient.apellido}
                                    </Text>
                                    <HStack spacing={4} fontSize="xs" color="gray.600">
                                      <HStack>
                                        <Icon as={FaIdCard} size="xs" />
                                        <Text>{patient.cedula}</Text>
                                      </HStack>
                                      <HStack>
                                        <Icon as={FaTooth} size="xs" />
                                        <Text>{patient.tipo_consulta}</Text>
                                      </HStack>
                                    </HStack>
                                  </VStack>
                                  <Badge colorScheme="green" fontSize="xs">
                                    Nuevo
                                  </Badge>
                                </HStack>
                              </Box>
                            </motion.div>
                          ))}
                        </VStack>
                      ) : (
                        <Text color="gray.500" textAlign="center" py={4}>
                          No hay pacientes recientes
                        </Text>
                      )}
                    </CardBody>
                  </MotionCard>

                  {/* Insumos con stock bajo */}
                  {lowStockItems && lowStockItems.length > 0 && (
                    <MotionCard 
                      bg={cardBg} 
                      borderWidth="1px" 
                      borderColor={borderColor}
                      variants={cardVariants}
                      whileHover="hover"
                      boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                      _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                    >
                      <CardHeader>
                        <HStack justify="space-between">
                          <HStack>
                            <Icon as={FaChartBar} color="red.500" />
                            <Heading size="md">Stock Bajo</Heading>
                          </HStack>
                          <MotionButton
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => router.push('/inventario')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Ver todo
                          </MotionButton>
                        </HStack>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          {lowStockItems.slice(0, 3).map((item: any) => (
                            <motion.div
                              key={item._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Box
                                p={3}
                                borderWidth="1px"
                                borderColor="red.200"
                                borderRadius="md"
                                bg="red.50"
                                _hover={{ bg: "red.100" }}
                                transition="all 0.2s"
                              >
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="semibold" fontSize="sm" color="red.800">
                                    {item.name}
                                  </Text>
                                  <HStack spacing={4} fontSize="xs" color="red.600">
                                    <HStack>
                                      <Icon as={FaChartBar} size="xs" />
                                      <Text>{item.currentStock} {item.unit}</Text>
                                    </HStack>
                                    <HStack>
                                      <Icon as={FaClock} size="xs" />
                                      <Text>Mín: {item.minimumStock}</Text>
                                    </HStack>
                                  </HStack>
                                </VStack>
                              </Box>
                            </motion.div>
                          ))}
                        </VStack>
                      </CardBody>
                    </MotionCard>
                  )}

                  {/* Estadísticas adicionales */}
                  <MotionCard 
                    bg={cardBg} 
                    borderWidth="1px" 
                    borderColor={borderColor}
                    variants={cardVariants}
                    whileHover="hover"
                    boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                    _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                  >
                    <CardHeader>
                      <HStack>
                        <Icon as={FaChartLine} color="purple.500" />
                        <Heading size="md">Estadísticas</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" color="gray.600">Edad promedio</Text>
                            <Text fontWeight="semibold">{stats?.averageAge || 0} años</Text>
                          </HStack>
                          <Progress value={Math.min((stats?.averageAge || 0) / 100 * 100, 100)} colorScheme="blue" size="sm" />
                        </Box>
                        
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" color="gray.600">Tasa de asistencia</Text>
                            <Text fontWeight="semibold">
                              {stats?.totalAppointments && stats?.completedAppointments 
                                ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
                                : 0}%
                            </Text>
                          </HStack>
                          <Progress 
                            value={stats?.totalAppointments && stats?.completedAppointments 
                              ? (stats.completedAppointments / stats.totalAppointments) * 100
                              : 0} 
                            colorScheme="green" 
                            size="sm" 
                          />
                        </Box>

                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" color="gray.600">Pacientes nuevos este mes</Text>
                            <Text fontWeight="semibold">{stats?.newPatientsThisMonth || 0}</Text>
                          </HStack>
                          <Progress 
                            value={Math.min((stats?.newPatientsThisMonth || 0) / 50 * 100, 100)} 
                            colorScheme="orange" 
                            size="sm" 
                          />
                        </Box>
                      </VStack>
                    </CardBody>
                  </MotionCard>
                </VStack>
              </GridItem>
            </Grid>
          </MotionBox>
        </VStack>
      </MotionBox>

      {/* Modales */}
      <AppointmentForm
        isOpen={isAppointmentFormOpen}
        onClose={onAppointmentFormClose}
      />
      
      <PatientForm
        isOpen={isPatientFormOpen}
        onClose={onPatientFormClose}
        patient={null}
        onSuccess={() => {}}
      />
    </Container>
    </ProtectedLayout>
  )
} 