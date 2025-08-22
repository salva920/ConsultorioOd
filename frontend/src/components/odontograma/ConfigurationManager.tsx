import React, { useState } from 'react';
import { Box, Button, Text, VStack, HStack, Textarea, useToast, Alert, AlertIcon, Code } from '@chakra-ui/react';
import { TemporaryToothConfig, updateTemporaryTeethConfig, getAllTemporaryTeeth } from './temporaryTeethConfig';

interface ConfigurationManagerProps {
  onConfigUpdate: (config: TemporaryToothConfig[]) => void;
}

const ConfigurationManager: React.FC<ConfigurationManagerProps> = ({ onConfigUpdate }) => {
  const [configText, setConfigText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Cargar configuración actual
  const loadCurrentConfig = () => {
    const currentConfig = getAllTemporaryTeeth();
    const configJson = JSON.stringify(currentConfig, null, 2);
    setConfigText(configJson);
  };

  // Guardar configuración
  const saveConfig = () => {
    setIsLoading(true);
    try {
      const parsedConfig = JSON.parse(configText) as TemporaryToothConfig[];
      
      // Validar la configuración
      if (!Array.isArray(parsedConfig)) {
        throw new Error('La configuración debe ser un array');
      }

      // Validar cada diente
      parsedConfig.forEach((tooth, index) => {
        if (!tooth.id || !tooth.number || typeof tooth.x !== 'number' || typeof tooth.y !== 'number') {
          throw new Error(`Diente ${index + 1} tiene formato inválido`);
        }
      });

      // Actualizar configuración
      updateTemporaryTeethConfig(parsedConfig);
      onConfigUpdate(parsedConfig);

      toast({
        title: 'Configuración guardada',
        description: `${parsedConfig.length} dientes configurados`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      toast({
        title: 'Error al guardar',
        description: error instanceof Error ? error.message : 'Error desconocido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar configuración
  const exportConfig = () => {
    const currentConfig = getAllTemporaryTeeth();
    const configJson = JSON.stringify(currentConfig, null, 2);
    
    // Crear archivo de descarga
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'temporary-teeth-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Configuración exportada',
      description: 'Archivo descargado como temporary-teeth-config.json',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Importar configuración
  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedConfig = JSON.parse(content) as TemporaryToothConfig[];
        setConfigText(JSON.stringify(parsedConfig, null, 2));
        
        toast({
          title: 'Configuración importada',
          description: `${parsedConfig.length} dientes cargados`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error al importar',
          description: 'El archivo no tiene un formato válido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Gestor de Configuración de Dientes Temporales
      </Text>

      <VStack spacing={6} align="stretch">
        {/* Controles */}
        <HStack spacing={4}>
          <Button colorScheme="blue" onClick={loadCurrentConfig}>
            Cargar Configuración Actual
          </Button>
          <Button colorScheme="green" onClick={saveConfig} isLoading={isLoading}>
            Guardar Configuración
          </Button>
          <Button colorScheme="purple" onClick={exportConfig}>
            Exportar Configuración
          </Button>
          <Button as="label" colorScheme="orange" cursor="pointer">
            Importar Configuración
            <input
              type="file"
              accept=".json"
              onChange={importConfig}
              style={{ display: 'none' }}
            />
          </Button>
        </HStack>

        {/* Editor de configuración */}
        <Box>
          <Text fontWeight="bold" mb={2}>
            Editor de Configuración JSON:
          </Text>
          <Textarea
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            placeholder="Pega aquí la configuración JSON de los dientes temporales..."
            minH="400px"
            fontFamily="monospace"
            fontSize="sm"
          />
        </Box>

        {/* Información */}
        <Alert status="info">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Formato de configuración:</Text>
            <Text fontSize="sm">
              Cada diente debe tener: id, number, x, y, width, height, rotation (opcional)
            </Text>
            <Code mt={2} display="block" p={2} borderRadius="md">
              {`{
  "id": "61",
  "number": 61,
  "x": 35.2,
  "y": 8.8,
  "width": 6.9,
  "height": 8.0,
  "rotation": 0
}`}
            </Code>
          </Box>
        </Alert>

        <Text fontSize="sm" color="gray.600">
          💡 Puedes copiar y pegar la configuración detectada automáticamente aquí para guardarla permanentemente
        </Text>
      </VStack>
    </Box>
  );
};

export default ConfigurationManager; 