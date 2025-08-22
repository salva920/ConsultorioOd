import React from 'react';
import { Box, Image } from '@chakra-ui/react';

interface VirtualTooth {
  id: string;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VirtualTeethOverlayProps {
  imageSrc: string;
  onToothClick: (toothNumber: number) => void;
  selectedTooth?: number;
}

const VirtualTeethOverlay: React.FC<VirtualTeethOverlayProps> = ({
  imageSrc,
  onToothClick,
  selectedTooth
}) => {
  // Definir las áreas de cada diente temporal (51-85) basadas en la imagen
  const virtualTeeth: VirtualTooth[] = [
    // Dientes superiores (51-55, 61-65)
    { id: '55', number: 55, x: 10, y: 5, width: 8, height: 12 },   // Diente superior derecho
    { id: '54', number: 54, x: 20, y: 5, width: 8, height: 12 },
    { id: '53', number: 53, x: 30, y: 5, width: 8, height: 12 },
    { id: '52', number: 52, x: 40, y: 5, width: 8, height: 12 },
    { id: '51', number: 51, x: 50, y: 5, width: 8, height: 12 },
    
    { id: '61', number: 61, x: 60, y: 5, width: 8, height: 12 },
    { id: '62', number: 62, x: 70, y: 5, width: 8, height: 12 },
    { id: '63', number: 63, x: 80, y: 5, width: 8, height: 12 },
    { id: '64', number: 64, x: 90, y: 5, width: 8, height: 12 },
    { id: '65', number: 65, x: 100, y: 5, width: 8, height: 12 },
    
    // Dientes inferiores (71-75, 81-85)
    { id: '75', number: 75, x: 10, y: 75, width: 8, height: 12 },
    { id: '74', number: 74, x: 20, y: 75, width: 8, height: 12 },
    { id: '73', number: 73, x: 30, y: 75, width: 8, height: 12 },
    { id: '72', number: 72, x: 40, y: 75, width: 8, height: 12 },
    { id: '71', number: 71, x: 50, y: 75, width: 8, height: 12 },
    
    { id: '81', number: 81, x: 60, y: 75, width: 8, height: 12 },
    { id: '82', number: 82, x: 70, y: 75, width: 8, height: 12 },
    { id: '83', number: 83, x: 80, y: 75, width: 8, height: 12 },
    { id: '84', number: 84, x: 90, y: 75, width: 8, height: 12 },
    { id: '85', number: 85, x: 100, y: 75, width: 8, height: 12 },
  ];

  return (
    <Box position="relative" display="inline-block">
      {/* Imagen de fondo */}
      <Image
        src={imageSrc}
        alt="Dientes temporales"
        maxW="100%"
        h="auto"
      />
      
      {/* Botones virtuales superpuestos */}
      {virtualTeeth.map((tooth) => (
        <Box
          key={tooth.id}
          position="absolute"
          left={`${tooth.x}%`}
          top={`${tooth.y}%`}
          width={`${tooth.width}%`}
          height={`${tooth.height}%`}
          cursor="pointer"
          border={selectedTooth === tooth.number ? "2px solid red" : "1px solid transparent"}
          borderRadius="50%"
          transition="all 0.2s"
          _hover={{
            border: "2px solid blue",
            backgroundColor: "rgba(0, 0, 255, 0.1)"
          }}
          onClick={() => onToothClick(tooth.number)}
          zIndex={10}
        />
      ))}
    </Box>
  );
};

export default VirtualTeethOverlay; 