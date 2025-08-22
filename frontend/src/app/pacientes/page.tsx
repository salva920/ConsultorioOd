'use client'

import {
  Container,
  Box,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import PatientList from '../../components/patients/PatientList'
import ProtectedLayout from '../../components/layouts/ProtectedLayout'

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <ProtectedLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading as="h1" size="xl" mb={2}>
              Gestión de Pacientes
            </Heading>
            <Text color="gray.600">
              Administra los registros de tus pacientes de manera eficiente
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
              placeholder="Buscar pacientes por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <PatientList searchTerm={searchTerm} />
        </Box>
      </VStack>
    </Container>
  </ProtectedLayout>
  )
} 