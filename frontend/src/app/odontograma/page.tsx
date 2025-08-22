'use client'

import ProtectedLayout from '../../components/layouts/ProtectedLayout'
import Odontograma from '../../components/odontograma/Odontograma'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  CardBody,
  Avatar,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface Patient {
  _id: string
  nombre: string
  apellido: string
  cedula: string
  edad: number
  tipo_consulta: string
}

export default function OdontogramaPage() {
  const searchParams = useSearchParams()
  const patientId = searchParams?.get('patientId')
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Obtener lista de pacientes
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/patients`)
      return response.data
    },
    enabled: !patientId // Solo cargar si no hay patientId
  })

  // Filtrar pacientes por término de búsqueda
  const filteredPatients = patients?.filter(patient => 
    `${patient.nombre} ${patient.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cedula.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    console.log('PatientId recibido:', patientId)
  }, [patientId])

  const handlePatientSelect = (selectedPatientId: string) => {
    router.push(`/odontograma?patientId=${selectedPatientId}`)
  }

  if (!patientId) {
    return (
      <ProtectedLayout>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Box>
              <Heading as="h1" size="xl" mb={2}>
                Odontograma
              </Heading>
              <Text color="gray.600">
                Selecciona un paciente para ver su odontograma
              </Text>
            </Box>

            <Box
              bg={bgColor}
              p={6}
              borderRadius="lg"
              boxShadow="sm"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <InputGroup mb={6}>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar pacientes por nombre o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              {isLoading ? (
                <Text textAlign="center" py={8}>Cargando pacientes...</Text>
              ) : filteredPatients && filteredPatients.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {filteredPatients.map((patient) => (
                    <Card
                      key={patient._id}
                      cursor="pointer"
                      onClick={() => handlePatientSelect(patient._id)}
                      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      <CardBody>
                        <HStack spacing={3}>
                          <Avatar size="md" name={`${patient.nombre} ${patient.apellido}`} />
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="semibold">
                              {patient.nombre} {patient.apellido}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Cédula: {patient.cedula}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Edad: {patient.edad} años
                            </Text>
                            {patient.tipo_consulta && (
                              <Badge colorScheme="blue" size="sm">
                                {patient.tipo_consulta}
                              </Badge>
                            )}
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500" mb={4}>
                    {searchTerm ? 'No se encontraron pacientes con ese criterio de búsqueda' : 'No hay pacientes registrados'}
                  </Text>
                  <Button
                    colorScheme="blue"
                    onClick={() => router.push('/pacientes')}
                  >
                    Ir a Pacientes
                  </Button>
                </Box>
              )}
            </Box>
          </VStack>
        </Container>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <Odontograma patientId={patientId} />
    </ProtectedLayout>
  )
} 