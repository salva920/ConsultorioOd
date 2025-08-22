'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Button,
  useDisclosure,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Text,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { FaPlus, FaSearch, FaCalendarAlt, FaClock, FaUser, FaFilter } from 'react-icons/fa'
import AppointmentList from '../../components/appointments/AppointmentList'
import AppointmentForm from '../../components/appointments/AppointmentForm'
import ProtectedLayout from '../../components/layouts/ProtectedLayout'

export default function CitasPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [preSelectedPatientId, setPreSelectedPatientId] = useState<string | undefined>()
  const [preFilledData, setPreFilledData] = useState<any>(undefined)
  const searchParams = useSearchParams()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Detectar si viene desde el modal de paciente exitoso
  useEffect(() => {
    if (!searchParams) return
    
    const newAppointment = searchParams.get('newAppointment')
    const patientId = searchParams.get('patientId')
    
    if (newAppointment === 'true' && patientId) {
      setPreSelectedPatientId(patientId)
      setPreFilledData({
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 días después
        time: '09:00',
        notes: 'Cita de seguimiento',
        status: 'SCHEDULED'
      })
      onOpen()
      
      // Limpiar los parámetros de URL
      const url = new URL(window.location.href)
      url.searchParams.delete('newAppointment')
      url.searchParams.delete('patientId')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, onOpen])

  const stats = [
    {
      label: 'Citas Hoy',
      number: '8',
      change: '+2',
      changeType: 'increase' as const,
      color: 'blue.500'
    },
    {
      label: 'Pendientes',
      number: '12',
      change: '-1',
      changeType: 'decrease' as const,
      color: 'orange.500'
    },
    {
      label: 'Completadas',
      number: '45',
      change: '+5',
      changeType: 'increase' as const,
      color: 'green.500'
    },
    {
      label: 'Canceladas',
      number: '3',
      change: '0',
      changeType: 'decrease' as const,
      color: 'red.500'
    }
  ]

  return (
    <ProtectedLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <HStack justify="space-between" mb={6}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="blue.600">
                  Gestión de Citas
                </Heading>
                <Text color="gray.600">
                  Administra las citas de tus pacientes
                </Text>
              </VStack>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                onClick={onOpen}
                size="lg"
              >
                Nueva Cita
              </Button>
            </HStack>
          </Box>

        {/* Estadísticas */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          {stats.map((stat, index) => (
            <Box
              key={index}
              p={6}
              bg={bgColor}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              boxShadow="sm"
            >
              <Stat>
                <StatLabel color="gray.600">{stat.label}</StatLabel>
                <StatNumber color={stat.color} fontSize="2xl">
                  {stat.number}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={stat.changeType} />
                  {stat.change} desde ayer
                </StatHelpText>
              </Stat>
            </Box>
          ))}
        </SimpleGrid>

        {/* Filtros */}
        <Box
          p={6}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <VStack spacing={4}>
            <HStack w="full" justify="space-between">
              <Text fontWeight="semibold" fontSize="lg">
                Filtros y Búsqueda
              </Text>
              <HStack>
                <Tooltip label="Limpiar filtros">
                  <IconButton
                    aria-label="Limpiar filtros"
                    icon={<FaFilter />}
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setFilterStatus('all')
                      setSelectedDate('')
                    }}
                  />
                </Tooltip>
              </HStack>
            </HStack>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar por paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                placeholder="Filtrar por estado"
              >
                <option value="all">Todos los estados</option>
                <option value="SCHEDULED">Programadas</option>
                <option value="COMPLETED">Completadas</option>
                <option value="CANCELLED">Canceladas</option>
                <option value="NO_SHOW">No asistió</option>
              </Select>
              
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Filtrar por fecha"
              />
            </SimpleGrid>
          </VStack>
        </Box>

        {/* Lista de Citas */}
        <AppointmentList
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          selectedDate={selectedDate}
        />

        {/* Modal de Nueva Cita */}
        <AppointmentForm
          isOpen={isOpen}
          onClose={onClose}
          preSelectedPatientId={preSelectedPatientId}
          preFilledData={preFilledData}
        />
      </VStack>
    </Container>
  </ProtectedLayout>
  )
} 