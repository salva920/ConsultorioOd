'use client'

import React from 'react';
import { Box, Spinner, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Cargando..." }) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue('gray.50', 'gray.900')}
    >
      <MotionBox
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={6}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Spinner
              size="xl"
              color="blue.500"
              thickness="4px"
              speed="0.8s"
            />
          </motion.div>
          <Text
            color={textColor}
            fontSize="lg"
            fontWeight="medium"
          >
            {message}
          </Text>
        </VStack>
      </MotionBox>
    </Box>
  );
};

export default LoadingSpinner; 