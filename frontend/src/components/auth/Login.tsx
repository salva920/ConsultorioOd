'use client'

import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Card,
  CardBody,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaTooth } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);
const MotionButton = motion.create(Button);

interface LoginForm {
  username: string;
  password: string;
}

interface LoginErrors {
  username?: string;
  password?: string;
  general?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  const toast = useToast();
  const { login } = useAuth();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
        ease: "easeOut"
      }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(formData.username, formData.password);
      
      if (success) {
        toast({
          title: '¡Bienvenido!',
          description: 'Inicio de sesión exitoso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Redirigir al dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setLoginAttempts(prev => prev + 1);
        
        toast({
          title: 'Error de autenticación',
          description: 'Usuario o contraseña incorrectos',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });

        setErrors({
          general: 'Credenciales incorrectas. Inténtalo de nuevo.'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al iniciar sesión',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
    >
      <Container maxW="md">
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <VStack spacing={8}>
            {/* Logo y título */}
            <MotionBox
              variants={cardVariants}
              textAlign="center"
            >
              <VStack spacing={4}>
                                 <motion.div
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ duration: 0.5, delay: 0.3 }}
                 >
                  <Box
                    w="80px"
                    h="80px"
                    bgGradient="linear(to-br, blue.500, purple.600)"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 8px 32px rgba(59, 130, 246, 0.3)"
                  >
                    <Icon as={FaTooth} color="white" boxSize={8} />
                  </Box>
                </motion.div>
                
                <VStack spacing={2}>
                  <Heading
                    size="xl"
                    bgGradient="linear(to-r, blue.600, purple.600)"
                    bgClip="text"
                    fontWeight="bold"
                  >
                    Consultorio DR
                  </Heading>
                  <Text color="gray.600" fontSize="lg">
                    Sistema de Gestión Odontológica
                  </Text>
                </VStack>
              </VStack>
            </MotionBox>

            {/* Formulario de login */}
            <MotionCard
              variants={cardVariants}
              w="full"
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              boxShadow="0 4px 20px rgba(0,0,0,0.1)"
              _hover={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
            >
              <CardBody p={8}>
                <VStack spacing={6} as="form" onSubmit={handleSubmit}>
                  {/* Alerta de error general */}
                  <AnimatePresence>
                    {errors.general && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ width: '100%' }}
                      >
                        <Alert status="error" borderRadius="md">
                          <AlertIcon />
                          {errors.general}
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Campo Usuario */}
                  <MotionBox variants={inputVariants} w="full">
                    <FormControl isInvalid={!!errors.username}>
                      <FormLabel fontWeight="semibold" color="gray.700">
                        Usuario
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type="text"
                          placeholder="Ingresa tu usuario"
                          value={formData.username}
                          onChange={handleInputChange('username')}
                          size="lg"
                          borderColor={borderColor}
                          _focus={{
                            borderColor: 'blue.500',
                            boxShadow: '0 0 0 1px #3182ce'
                          }}
                        />
                        <InputRightElement>
                          <Icon as={FaUser} color="gray.400" />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>
                        {errors.username}
                      </FormErrorMessage>
                    </FormControl>
                  </MotionBox>

                  {/* Campo Contraseña */}
                  <MotionBox variants={inputVariants} w="full">
                    <FormControl isInvalid={!!errors.password}>
                      <FormLabel fontWeight="semibold" color="gray.700">
                        Contraseña
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Ingresa tu contraseña"
                          value={formData.password}
                          onChange={handleInputChange('password')}
                          size="lg"
                          borderColor={borderColor}
                          _focus={{
                            borderColor: 'blue.500',
                            boxShadow: '0 0 0 1px #3182ce'
                          }}
                        />
                        <InputRightElement>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleTogglePassword}
                            _hover={{ bg: 'transparent' }}
                          >
                            <Icon 
                              as={showPassword ? FaEyeSlash : FaEye} 
                              color="gray.400" 
                            />
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>
                        {errors.password}
                      </FormErrorMessage>
                    </FormControl>
                  </MotionBox>

                  {/* Botón de inicio de sesión */}
                  <MotionButton
                    variants={buttonVariants}
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                    loadingText="Iniciando sesión..."
                    whileHover="hover"
                    whileTap="tap"
                    bgGradient="linear(to-r, blue.500, purple.600)"
                    _hover={{
                      bgGradient: "linear(to-r, blue.600, purple.700)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4)"
                    }}
                    _active={{
                      transform: "translateY(0px)"
                    }}
                  >
                    Iniciar Sesión
                  </MotionButton>

                  {/* Información de credenciales */}
                  <Box
                    p={4}
                    bg="blue.50"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="blue.200"
                    w="full"
                  >
                    <VStack spacing={2} align="start">
                      <Text fontSize="sm" fontWeight="semibold" color="blue.800">
                        Credenciales de prueba:
                      </Text>
                      <Text fontSize="xs" color="blue.700">
                        Usuario: <strong>admin</strong>
                      </Text>
                      <Text fontSize="xs" color="blue.700">
                        Contraseña: <strong>123456</strong>
                      </Text>
                    </VStack>
                  </Box>
                </VStack>
              </CardBody>
            </MotionCard>

            {/* Footer */}
            <MotionBox
              variants={cardVariants}
              textAlign="center"
            >
              <Text color="gray.500" fontSize="sm">
                © 2025 Sistema Odontológico. Todos los derechos reservados.
              </Text>
            </MotionBox>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Login; 