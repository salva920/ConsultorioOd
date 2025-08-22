'use client';

import React, { useState } from 'react';
import { Container, VStack, Text, Button, useToast, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import VirtualTeethOverlay from '../../components/odontograma/editor de posiciones/VirtualTeethOverlay';
import DraggableTeethAdjuster from '../../components/odontograma/DraggableTeethAdjuster';
import AutoTeethDetector from '../../components/odontograma/editor de posiciones/AutoTeethDetector';
import AdvancedTeethDetector from '../../components/odontograma/editor de posiciones/AdvancedTeethDetector';
import ConfigurationManager from '../../components/odontograma/ConfigurationManager';
import UnifiedTeethEditor from '../../components/odontograma/editor de posiciones/UnifiedTeethEditor';
import { TemporaryToothConfig } from '../../components/odontograma/temporaryTeethConfig';

interface ToothPosition {
  id: string;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  confidence?: number;
  area?: number;
}

const AjustadorPosicionesPage = () => {
  const [selectedTooth, setSelectedTooth] = useState<number | undefined>();
  const [positions, setPositions] = useState<ToothPosition[]>([]);
  const toast = useToast();

  const handleToothClick = (toothNumber: number) => {
    setSelectedTooth(toothNumber);
    toast({
      title: `Diente seleccionado`,
      description: `Diente temporal ${toothNumber}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handlePositionsSave = (newPositions: ToothPosition[]) => {
    setPositions(newPositions);
    toast({
      title: 'Posiciones guardadas',
      description: 'Las posiciones de los dientes han sido actualizadas',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleAutoDetection = (detectedTeeth: ToothPosition[]) => {
    setPositions(detectedTeeth);
    toast({
      title: 'Detección automática completada',
      description: `${detectedTeeth.length} dientes detectados automáticamente`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleConfigUpdate = (config: TemporaryToothConfig[]) => {
    // Convertir TemporaryToothConfig a ToothPosition
    const convertedPositions: ToothPosition[] = config.map(tooth => ({
      id: tooth.id,
      number: tooth.number,
      x: tooth.x,
      y: tooth.y,
      width: tooth.width,
      height: tooth.height,
      rotation: tooth.rotation || 0
    }));
    
    setPositions(convertedPositions);
    toast({
      title: 'Configuración actualizada',
      description: `${config.length} dientes configurados`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Ajustador de Posiciones - Dientes Temporales
        </Text>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Editor Unificado</Tab>
            <Tab>Modo Manual</Tab>
            <Tab>Modo Arrastre</Tab>
            <Tab>Detección Básica</Tab>
            <Tab>Detección Avanzada</Tab>
            <Tab>Configuración</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <UnifiedTeethEditor
                imageSrc="/4037ecb32d029281a0c64e876fcf56be-Photoroom.png"
                onPositionsSave={handlePositionsSave}
              />
            </TabPanel>

            <TabPanel>
              <VirtualTeethOverlay
                imageSrc="/4037ecb32d029281a0c64e876fcf56be-Photoroom.png"
                onToothClick={handleToothClick}
                selectedTooth={selectedTooth}
              />
              {selectedTooth && (
                <Text textAlign="center" fontSize="lg" mt={4}>
                  Diente seleccionado: {selectedTooth}
                </Text>
              )}
            </TabPanel>

            <TabPanel>
              <DraggableTeethAdjuster
                imageSrc="/4037ecb32d029281a0c64e876fcf56be-Photoroom.png"
                onPositionsSave={handlePositionsSave}
              />
            </TabPanel>

            <TabPanel>
              <AutoTeethDetector
                imageSrc="/4037ecb32d029281a0c64e876fcf56be-Photoroom.png"
                onDetectionComplete={handleAutoDetection}
              />
            </TabPanel>

            <TabPanel>
              <AdvancedTeethDetector
                imageSrc="/4037ecb32d029281a0c64e876fcf56be-Photoroom.png"
                onDetectionComplete={handleAutoDetection}
              />
            </TabPanel>

            <TabPanel>
              <ConfigurationManager
                onConfigUpdate={handleConfigUpdate}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Text fontSize="sm" color="gray.600" textAlign="center">
          💡 <strong>Editor Unificado:</strong> Combina detección automática, ajuste manual y arrastre en una sola vista con leyenda en tiempo real
        </Text>
      </VStack>
    </Container>
  );
};

export default AjustadorPosicionesPage; 