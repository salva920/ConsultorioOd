import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Divider,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import axios from 'axios';
import Odontograma from '../components/odontograma/Odontograma';

interface Patient {
  _id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  edad: number;
  birthDate: string;
  email: string;
  telefono: string;
  direccion: string;
  enfermedad_actual: string;
  antecedentes_personales: string;
  antecedentes_familiares: string;
  tipo_consulta: string;
  motivo_consulta: string;
}

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`/api/patients/${id}`);
        setPatient(response.data);
        setLoading(false);
      } catch (error) {
        setError('Error al cargar los datos del paciente');
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Paciente no encontrado
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>
            {patient.nombre} {patient.apellido}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Heading size="md" mb={4}>Información Personal</Heading>
              <VStack align="stretch" spacing={3}>
                <Text><strong>Cédula:</strong> {patient.cedula}</Text>
                <Text><strong>Edad:</strong> {patient.edad} años</Text>
                <Text><strong>Fecha de Nacimiento:</strong> {new Date(patient.birthDate).toLocaleDateString()}</Text>
                <Text><strong>Email:</strong> {patient.email}</Text>
                <Text><strong>Teléfono:</strong> {patient.telefono}</Text>
                <Text><strong>Dirección:</strong> {patient.direccion}</Text>
              </VStack>
            </Box>

            <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Heading size="md" mb={4}>Información Médica</Heading>
              <VStack align="stretch" spacing={3}>
                <Text><strong>Enfermedad Actual:</strong> {patient.enfermedad_actual}</Text>
                <Text><strong>Antecedentes Personales:</strong> {patient.antecedentes_personales}</Text>
                <Text><strong>Antecedentes Familiares:</strong> {patient.antecedentes_familiares}</Text>
                <Text><strong>Tipo de Consulta:</strong> {patient.tipo_consulta}</Text>
                <Text><strong>Motivo de Consulta:</strong> {patient.motivo_consulta}</Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>

        <Divider />

        <Box>
          <Heading size="lg" mb={6}>Odontograma</Heading>
          <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Odontograma patientId={id!} />
          </Box>
        </Box>
      </VStack>
    </Container>
  );
};

export default PatientDetails; 