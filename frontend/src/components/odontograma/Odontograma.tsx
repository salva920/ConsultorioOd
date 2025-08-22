import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  useDisclosure,
  useToast,
  HStack,
  VStack,
  Button,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import { motion } from 'framer-motion';

// Componentes modulares
import OdontogramaCuadrantes from './OdontogramaCuadrantes';
import OdontogramaDetallado from './OdontogramaDetallado';
import InterventionModal from './InterventionModal';
import MultiSelectModal from './MultiSelectModal';
import DiagnosticoModal from './DiagnosticoModal';
import ToothPanel from './ToothPanel';
import OdontogramaHeader from './OdontogramaHeader';

// Tipos y utilidades
import { Intervention, Tooth, OdontogramaProps, getToothType, getToothPosition, getToothCuadrante, getTipoDentadura, getToothRotation, TODOS_LOS_DIENTES, getTeethByType } from './types';

interface Patient {
  _id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  edad: number;
  email: string;
  telefono: string;
}

const Odontograma: React.FC<OdontogramaProps> = ({ patientId }) => {
  const router = useRouter();
  const [teeth, setTeeth] = useState<Tooth[]>([]);
  const [selectedTooth, setSelectedTooth] = useState<Tooth | null>(null);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);
  const [filterType, setFilterType] = useState<'permanente' | 'temporal'>('permanente');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'detallado'>('visual');
  
  // Estados para selección múltiple
  const [multiSelectMode, setMultiSelectMode] = useState<'brackets' | 'protesis' | null>(null);
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isMultiSelectOpen, 
    onOpen: onMultiSelectOpen, 
    onClose: onMultiSelectClose 
  } = useDisclosure();
  const { 
    isOpen: isDiagnosticoOpen, 
    onOpen: onDiagnosticoOpen, 
    onClose: onDiagnosticoClose 
  } = useDisclosure();

  // Framer Motion
  const MotionBox = motion.create(Box);
  const containerVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
  };

  // Estado para almacenar las intervenciones que se cargan
  const [loadedInterventions, setLoadedInterventions] = useState<Intervention[]>([]);

  // Estado para almacenar los diagnósticos del paciente
  const [diagnosticos, setDiagnosticos] = useState<any[]>([]);
  
  // Estado para almacenar el ID del odontograma
  const [odontogramaId, setOdontogramaId] = useState<string | null>(null);

  // Estado para rastrear cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Estado para lazy loading de cuadrantes
  const [loadedQuadrants, setLoadedQuadrants] = useState<Set<string>>(new Set());
  const [isLoadingQuadrant, setIsLoadingQuadrant] = useState(false);

  // Optimización: Memoizar dientes filtrados para evitar recálculos
  const filteredTeeth = useMemo(() => {
    return teeth.filter(tooth => {
      const toothType = getTipoDentadura(tooth.number);
      return toothType === filterType;
    });
  }, [teeth, filterType]);

  // Validar que patientId esté presente
  if (!patientId) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error: ID de paciente no válido. Por favor, seleccione un paciente.
      </Alert>
    );
  }

  const toothConditions = [
    { value: 'sano', label: 'Sano', color: '#48BB78' },
    { value: 'caries', label: 'Caries', color: '#E53E3E' },
    { value: 'restaurado', label: 'Restaurado', color: '#4299E1' },
    { value: 'ausente', label: 'Ausente', color: '#718096' },
    { value: 'extraccion', label: 'Extracción', color: '#805AD5' },
    { value: 'endodoncia', label: 'Endodoncia', color: '#D69E2E' },
    { value: 'corona', label: 'Corona', color: '#F6AD55' },
    { value: 'implante', label: 'Implante', color: '#4FD1C5' }
  ];

  // Función para determinar si un diente tiene brackets
  const hasBrackets = (tooth: Tooth): boolean => {
    const hasBrackets = tooth.interventions.some(intervention => 
      (intervention.procedure === 'Brackets' || 
       intervention.procedure === 'brackets' || 
       intervention.procedure === 'Ortodoncia' ||
       intervention.procedure === 'ortodoncia') && 
      intervention.status !== 'cancelado'
    );
    
    return hasBrackets;
  };

  // Función para determinar si un diente tiene prótesis
  const hasProtesis = (tooth: Tooth): boolean => {
    return tooth.interventions.some(intervention => 
      (intervention.procedure === 'Prótesis' || 
       intervention.procedure === 'protesis' || 
       intervention.procedure === 'Prótesis' ||
       intervention.procedure === 'corona' ||
       intervention.procedure === 'Corona' ||
       intervention.procedure === 'implante' ||
       intervention.procedure === 'Implante' ||
       intervention.procedure === 'restauracion' ||
       intervention.procedure === 'Restauracion') && 
      intervention.status !== 'cancelado'
    );
  };

  // Función para determinar si un diente tiene cualquier tipo de intervención
  const hasAnyIntervention = (tooth: Tooth): boolean => {
    return tooth.interventions.some(intervention => 
      intervention.status !== 'cancelado'
    );
  };

  // Función para determinar el tipo de conexión de brackets
  const getBracketConnection = (tooth: Tooth): { isConnected: boolean; connectionType?: 'start' | 'middle' | 'end' } => {
    if (!hasBrackets(tooth)) return { isConnected: false };

    const bracketTeeth = teeth.filter(t => hasBrackets(t)).sort((a, b) => a.number - b.number);
    const toothIndex = bracketTeeth.findIndex(t => t.id === tooth.id);
    
    if (toothIndex === -1) return { isConnected: false };
    
    if (bracketTeeth.length === 1) return { isConnected: false };
    
    if (toothIndex === 0) return { isConnected: true, connectionType: 'start' };
    if (toothIndex === bracketTeeth.length - 1) return { isConnected: true, connectionType: 'end' };
    return { isConnected: true, connectionType: 'middle' };
  };

  // Función para mapear números de dientes del servidor al sistema dental correcto
  const mapServerToothNumber = (serverNumber: number): number => {
    // Mapeo de números del servidor (1-32) al sistema dental internacional (11-48)
    const toothMapping: { [key: number]: number } = {
      // Cuadrante Superior Derecho (1-8 -> 11-18)
      1: 18, 2: 17, 3: 16, 4: 15, 5: 14, 6: 13, 7: 12, 8: 11,
      // Cuadrante Superior Izquierdo (9-16 -> 21-28)
      9: 21, 10: 22, 11: 23, 12: 24, 13: 23, 14: 24, 15: 25, 16: 26,
      // Cuadrante Inferior Izquierdo (17-24 -> 31-38)
      17: 31, 18: 32, 19: 33, 20: 34, 21: 35, 22: 36, 23: 37, 24: 38,
      // Cuadrante Inferior Derecho (25-32 -> 41-48)
      25: 41, 26: 42, 27: 43, 28: 44, 29: 45, 30: 46, 31: 47, 32: 48
    };
    
    // Si el número está en el mapeo, usarlo (esto incluye números 1-32 del servidor)
    if (toothMapping[serverNumber]) {
      const mappedNumber = toothMapping[serverNumber];
      return mappedNumber;
    }
    
    // Si el número ya está en formato internacional (11-48), no mapear
    if (serverNumber >= 11 && serverNumber <= 48) {
      return serverNumber;
    }
    
    return serverNumber;
  };



    const fetchOdontograma = useCallback(async () => {
    try {
      setLoading(true);
      
      // SOLO UNA LLAMADA: obtener el odontograma completo directamente
      const response = await axios.get(`/api/odontograma?patientId=${patientId}`);
      
      if (response.data && response.data._id) {
        setOdontogramaId(response.data._id);
        
        if (response.data.teeth && response.data.teeth.length > 0) {
          
          // Obtener la configuración de dientes según el filtro actual
          const dientesConfiguracion = getTeethByType(filterType);
          
          // Filtrar dientes del servidor según el tipo de dentadura
          let teethFromServer = response.data.teeth.filter((tooth: any) => {
            // Dientes permanentes (11-48)
            if (tooth.number >= 11 && tooth.number <= 48) {
              return filterType === 'permanente';
            }
            // Dientes temporales (51-85)
            else if (tooth.number >= 51 && tooth.number <= 85) {
              return filterType === 'temporal';
            }
            // Dientes en formato antiguo del servidor (1-32) - convertirlos a permanentes
            else if (tooth.number >= 1 && tooth.number <= 32) {
              return filterType === 'permanente';
            }
            return false;
          });
          
          const processedTeeth: Tooth[] = dientesConfiguracion.map(dienteConfig => {
            // Buscar si existe este diente en el servidor
            const serverTooth = teethFromServer.find((t: any) => {
              // Buscar por número directo primero
              if (t.number === dienteConfig.id) {
                return true;
              }
              
              // Si no se encuentra, intentar mapeo
              const mappedNumber = mapServerToothNumber(t.number);
              return mappedNumber === dienteConfig.id;
            });
            
            // Obtener posición por defecto
            const defaultPosition = getToothPosition(dienteConfig.id);
            const defaultRotation = getToothRotation(dienteConfig.id);
            const defaultSize = { width: 1, height: 1 };
            
            // Procesar intervenciones del servidor
            let interventions: any[] = [];
            if (serverTooth && serverTooth.interventions) {
              
              // Filtrar solo intervenciones activas (no canceladas)
              interventions = serverTooth.interventions.filter((int: any) => int.status !== 'cancelado');
              
              // Mapear la estructura de intervenciones del servidor al formato esperado por el frontend
              interventions = interventions.map((int: any) => ({
                id: int._id || int.id || `int_${Date.now()}_${Math.random()}`,
                date: int.date || int.createdAt || new Date().toISOString(),
                toothNumber: serverTooth.number,
                procedure: int.procedure || int.type || 'Otros',
                notes: int.notes || '',
                status: int.status || 'pendiente',
                part: int.part || 'todo',
                type: int.type || int.procedure || 'Otros',
                images: int.images || []
              }));
              
            }
            
            return {
              id: `tooth-${dienteConfig.id}`,
              number: dienteConfig.id,
              condition: serverTooth?.condition || 'sano',
              notes: serverTooth?.notes || '',
              interventions: interventions,
              type: dienteConfig.tipo as 'incisivo' | 'canino' | 'premolar' | 'molar',
              cuadrante: getToothCuadrante(dienteConfig.id),
              tipoDentadura: dienteConfig.tipoDentadura as 'permanente' | 'temporal',
              posX: defaultPosition.posX,
              posY: defaultPosition.posY,
              rotation: defaultRotation,
              size: defaultSize
            };
          });
          
          setTeeth(processedTeeth);
          
          // Almacenar intervenciones existentes
          const allInterventions = processedTeeth.flatMap((tooth: Tooth) => tooth.interventions);
          if (allInterventions.length > 0) {
            setLoadedInterventions(allInterventions);
          }
        } else {
          generateTeeth();
        }
      } else {
        generateTeeth();
      }
      
    } catch (error: any) {
      console.error('❌ Error al cargar odontograma:', error);
      console.error('❌ Detalles del error:', error.response?.data);
      setError(`Error al cargar el odontograma: ${error.message}`);
      generateTeeth();
    } finally {
      setLoading(false);
    }
  }, [patientId, filterType]);

  // Función para obtener los datos del paciente
  const fetchPatient = useCallback(async () => {
    try {
      const response = await axios.get(`/api/patients/${patientId}`);
      setPatient(response.data);
    } catch (error: any) {
      console.error('Error al obtener datos del paciente:', error);
      // No mostramos error aquí para no interrumpir la carga del odontograma
    }
  }, [patientId]);

  useEffect(() => {
    fetchOdontograma();
    fetchPatient();
  }, [fetchOdontograma, fetchPatient]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'b':
            event.preventDefault();
            startMultiSelect('brackets');
            break;
          case 'p':
            event.preventDefault();
            startMultiSelect('protesis');
            break;
          case 'Escape':
            event.preventDefault();
            cancelMultiSelect();
            break;
          case 'Enter':
            if (multiSelectMode && selectedTeeth.length > 0) {
              event.preventDefault();
              finishMultiSelect();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [multiSelectMode, selectedTeeth]);

  const generateTeeth = () => {
    const dientesConfiguracion = getTeethByType(filterType);
    
    const newTeeth: Tooth[] = dientesConfiguracion.map(dienteConfig => {
      const position = getToothPosition(dienteConfig.id);
      const rotation = getToothRotation(dienteConfig.id);
      
      return {
        id: `tooth-${dienteConfig.id}`,
        number: dienteConfig.id,
        condition: 'sano',
        notes: '',
        interventions: [],
        type: dienteConfig.tipo as 'incisivo' | 'canino' | 'premolar' | 'molar',
        cuadrante: getToothCuadrante(dienteConfig.id),
        tipoDentadura: dienteConfig.tipoDentadura as 'permanente' | 'temporal',
        posX: position.posX,
        posY: position.posY,
        rotation: rotation,
        size: { width: 1, height: 1 }
      };
    });

    setTeeth(newTeeth);
  };

  const handleToothClick = (tooth: Tooth) => {
    setSelectedTooth(tooth);
  };

  const handleConditionChange = (condition: string) => {
    if (selectedTooth) {
      const updatedTeeth = teeth.map(t => 
        t.id === selectedTooth.id ? { ...t, condition } : t
      );
      setTeeth(updatedTeeth);
      
      const updatedSelectedTooth = updatedTeeth.find(t => t.id === selectedTooth.id);
      if (updatedSelectedTooth) {
        setSelectedTooth(updatedSelectedTooth);
      }
    }
  };

  const handleAddIntervention = async (interventionData: Partial<Intervention>) => {
    if (!selectedTooth) return;

    const intervention: Intervention = {
      id: editingIntervention?.id || Date.now().toString(),
      date: editingIntervention?.date || new Date().toISOString(),
      toothNumber: selectedTooth.number,
      procedure: interventionData.procedure!,
      notes: interventionData.notes || '',
      status: interventionData.status as 'completado' | 'pendiente' | 'cancelado',
      part: interventionData.part || 'todo',
      type: interventionData.type,
      images: interventionData.images || []
    };

    const updatedTeeth = teeth.map(t => {
      if (t.id === selectedTooth.id) {
        if (editingIntervention) {
          // Editar intervención existente
          const updatedInterventions = t.interventions.map(int => 
            int.id === editingIntervention.id ? intervention : int
          );
          return { ...t, interventions: updatedInterventions };
        } else {
          // Agregar nueva intervención
          return { ...t, interventions: [...t.interventions, intervention] };
        }
      }
      return t;
    });

    setTeeth(updatedTeeth);
    
    // Marcar que hay cambios sin guardar
    setHasUnsavedChanges(true);
    
    const updatedSelectedTooth = updatedTeeth.find(t => t.id === selectedTooth.id);
    if (updatedSelectedTooth) {
      setSelectedTooth(updatedSelectedTooth);
    }

    setEditingIntervention(null);
    
    // ✅ GUARDAR AUTOMÁTICAMENTE AL BACKEND
    try {
      if (!odontogramaId) {
        throw new Error('ID del odontograma no disponible');
      }
      
      // Preparar datos para guardar
      const teethData = updatedTeeth.map(tooth => ({
        number: convertToServerToothNumber(tooth.number),
        condition: tooth.condition,
        notes: tooth.notes,
        interventions: tooth.interventions.map((int: Intervention) => ({
          date: int.date,
          toothNumber: convertToServerToothNumber(int.toothNumber),
          procedure: int.procedure,
          notes: int.notes || '',
          status: int.status,
          part: int.part || 'todo',
          type: int.type || int.procedure || 'Otros',
          images: int.images || []
        }))
      }));
      
      // Guardar al backend
      await axios.put(`/api/odontograma/${odontogramaId}`, {
        teeth: teethData
      });
      
      // Limpiar el flag de cambios sin guardar
      setHasUnsavedChanges(false);
      
      toast({
        title: editingIntervention ? 'Intervención actualizada y guardada' : 'Intervención agregada y guardada',
        description: `Intervención ${editingIntervention ? 'actualizada' : 'agregada'} al diente ${selectedTooth.number} y guardada en el servidor.`,
        status: 'success',
        duration: 3000,
      });
      
    } catch (error: any) {
      console.error('Error al guardar intervención:', error);
      
      // Mostrar error pero mantener los cambios locales
      toast({
        title: 'Error al guardar',
        description: error.response?.data?.message || 'No se pudo guardar la intervención en el servidor. Los cambios están guardados localmente.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      
      // Mantener el flag de cambios sin guardar
      setHasUnsavedChanges(true);
    }
    
    // Si es una nueva intervención (no edición), abrir automáticamente el modal de diagnóstico
    if (!editingIntervention) {
      setLoadedInterventions([intervention]);
      
      // Mostrar mensaje informativo
      toast({
        title: 'Intervención creada exitosamente',
        description: 'Ahora se abrirá el formulario de diagnóstico para completar la información clínica.',
        status: 'success',
        duration: 3000,
      });
      
      // Abrir el modal de diagnóstico automáticamente
      setTimeout(() => {
        onDiagnosticoOpen();
      }, 1000);
    }
  };

  const handleEditIntervention = (intervention: Intervention) => {
    setEditingIntervention(intervention);
    onOpen();
  };

  const handleDeleteIntervention = (interventionId: string) => {
    if (!selectedTooth) return;

    const updatedTeeth = teeth.map(t => {
      if (t.id === selectedTooth.id) {
        return { ...t, interventions: t.interventions.filter(int => int.id !== interventionId) };
      }
      return t;
    });

    setTeeth(updatedTeeth);
    
    const updatedSelectedTooth = updatedTeeth.find(t => t.id === selectedTooth.id);
    if (updatedSelectedTooth) {
      setSelectedTooth(updatedSelectedTooth);
    }

    toast({
      title: 'Intervención eliminada',
      description: 'La intervención ha sido eliminada correctamente',
      status: 'success',
      duration: 3000,
    });
  };

  // Funciones de selección múltiple
  const startMultiSelect = (mode: 'brackets' | 'protesis') => {
    setMultiSelectMode(mode);
    setSelectedTeeth([]);
    toast({
      title: `Modo ${mode === 'brackets' ? 'Brackets' : 'Prótesis'} activado`,
      description: `Presiona Ctrl+B para brackets, Ctrl+P para prótesis. Haz clic en los dientes para seleccionar. Presiona Enter para finalizar.`,
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  const cancelMultiSelect = () => {
    setMultiSelectMode(null);
    setSelectedTeeth([]);
    toast({
      title: 'Selección múltiple cancelada',
      status: 'info',
      duration: 3000,
    });
  };

  const finishMultiSelect = () => {
    if (selectedTeeth.length === 0) {
      toast({
        title: 'No hay dientes seleccionados',
        description: 'Selecciona al menos un diente antes de finalizar',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    onMultiSelectOpen();
  };

  const handleMultiSelectToothClick = (toothId: string) => {
    if (!multiSelectMode) return;

    setSelectedTeeth(prev => {
      if (prev.includes(toothId)) {
        return prev.filter(id => id !== toothId);
      } else {
        return [...prev, toothId];
      }
    });
  };

  const applyMultiSelectIntervention = async (arcada?: 'superior' | 'inferior') => {
    if (selectedTeeth.length === 0) return;

    const interventionType = multiSelectMode === 'brackets' ? 'Brackets' : 'Prótesis';
    const arcadaInfo = arcada ? ` (${arcada})` : '';
    
    const newInterventions: Intervention[] = selectedTeeth.map(toothId => ({
      id: Date.now().toString() + Math.random(),
      date: new Date().toISOString(),
      toothNumber: teeth.find(t => t.id === toothId)?.number || 0,
      procedure: interventionType,
      notes: `Aplicación de ${interventionType.toLowerCase()}${arcadaInfo} en selección múltiple`,
      status: 'pendiente',
      part: 'todo',
      type: interventionType.toLowerCase()
    }));

    const updatedTeeth = teeth.map(tooth => {
      if (selectedTeeth.includes(tooth.id)) {
        const newIntervention = newInterventions.find(int => int.toothNumber === tooth.number);
        return {
          ...tooth,
          interventions: [...tooth.interventions, newIntervention!]
        };
      }
      return tooth;
    });

    setTeeth(updatedTeeth);
    setMultiSelectMode(null);
    setSelectedTeeth([]);
    onMultiSelectClose();

    // Guardar automáticamente al backend
    try {
      if (!odontogramaId) {
        throw new Error('ID del odontograma no disponible');
      }
      
      const teethData = updatedTeeth.map(tooth => ({
        number: convertToServerToothNumber(tooth.number),
        condition: tooth.condition,
        notes: tooth.notes,
        interventions: tooth.interventions
      }));
      
      await axios.put(`/api/odontograma/${odontogramaId}`, {
        teeth: teethData
      });
      
      toast({
        title: `${interventionType} aplicados y guardados`,
        description: `${interventionType} aplicados a ${selectedTeeth.length} diente(s)${arcadaInfo}`,
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error al guardar intervenciones múltiples:', error);
      toast({
        title: 'Error al guardar',
        description: error.response?.data?.message || 'No se pudieron guardar las intervenciones',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSave = async () => {
    try {
      // Solo guardar datos esenciales: number, condition, notes, interventions
      const teethData = teeth.map(tooth => ({
        number: convertToServerToothNumber(tooth.number),
        condition: tooth.condition,
        notes: tooth.notes,
        interventions: tooth.interventions.map((intervention: Intervention) => ({
          ...intervention,
          // NO convertir toothNumber para mantener consistencia con diagnósticos
          toothNumber: intervention.toothNumber
        }))
      }));
      
      if (!odontogramaId) {
        throw new Error('ID del odontograma no disponible');
      }
      
      await axios.put(`/api/odontograma/${odontogramaId}`, {
        teeth: teethData
      });
      
      // Limpiar el flag de cambios sin guardar
      setHasUnsavedChanges(false);
      
      toast({
        title: 'Odontograma guardado',
        description: 'Datos de dientes guardados correctamente',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error al guardar:', error);
      toast({
        title: 'Error al guardar',
        description: error.response?.data?.message || 'No se pudo guardar el odontograma',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Función para mapear diagnósticos a procedimientos
  const mapearDiagnosticoAProcedimiento = (diagnostico: string): string => {
    const mapeo: { [key: string]: string } = {
      'caries': 'Caries',
      'periodontal': 'Limpieza',
      'endodoncia': 'Endodoncia',
      'ortodoncia': 'Brackets',
      'protesis': 'Prótesis',
      'extraccion': 'Extracción',
      'restauracion': 'Restauración',
      'otros': 'Otros'
    };
    return mapeo[diagnostico] || 'Otros';
  };

  // Función para convertir números del sistema dental internacional al sistema del servidor
  const convertToServerToothNumber = (internationalNumber: number): number => {
    // Mapeo inverso: sistema dental internacional (11-48) al sistema del servidor (1-32)
    const reverseMapping: { [key: number]: number } = {
      // Cuadrante Superior Derecho (11-18 -> 1-8)
      11: 8, 12: 7, 13: 6, 14: 5, 15: 4, 16: 3, 17: 2, 18: 1,
      // Cuadrante Superior Izquierdo (21-28 -> 9-16)
      21: 9, 22: 10, 23: 11, 24: 12, 25: 13, 26: 14, 27: 15, 28: 16,
      // Cuadrante Inferior Izquierdo (31-38 -> 17-24)
      31: 17, 32: 18, 33: 19, 34: 20, 35: 21, 36: 22, 37: 23, 38: 24,
      // Cuadrante Inferior Derecho (41-48 -> 25-32)
      41: 25, 42: 26, 43: 27, 44: 28, 45: 29, 46: 30, 47: 31, 48: 32
    };
    
    return reverseMapping[internationalNumber] || internationalNumber;
  };

  const handleTeethUpdate = async (updatedTeeth: Tooth[]) => {
    setTeeth(updatedTeeth);
    
    // Marcar que hay cambios sin guardar
    setHasUnsavedChanges(true);
    
    // NO guardar automáticamente - solo actualizar estado local
    // El usuario debe guardar manualmente cuando esté listo
    
    toast({
      title: "Datos actualizados",
      description: `Datos de dientes ${filterType} actualizados localmente. Recuerda guardar el odontograma.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Nueva función para manejar actualizaciones de posiciones desde PositionAdjuster
  const handlePositionsUpdate = async (updatedTeeth: Tooth[]) => {
    setTeeth(updatedTeeth);
    
    // Guardar las nuevas posiciones en el archivo types.ts (opcional)
    // Por ahora solo actualizamos el estado local
    
    toast({
      title: "Posiciones actualizadas",
      description: "Las posiciones de los dientes han sido actualizadas localmente",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDiagnosticoChange = async (diagnosticos: any[]) => {
    console.log('Diagnósticos guardados:', diagnosticos);
    
    try {
      // Guardar los diagnósticos en el backend
      const response = await axios.post(`/api/diagnostico`, {
        patientId: patientId, // ✅ Agregar el patientId
        diagnosticos: diagnosticos
      });
      
      // Actualizar el estado local con los diagnósticos guardados
      setDiagnosticos(response.data);
      
    toast({
        title: 'Diagnósticos guardados',
        description: `${diagnosticos.length} diagnóstico(s) han sido guardados exitosamente`,
      status: 'success',
      duration: 3000,
    });
    } catch (error: any) {
      console.error('Error al guardar diagnósticos:', error);
      toast({
        title: 'Error al guardar diagnósticos',
        description: error.response?.data?.message || 'Error al guardar los diagnósticos',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleOpenDiagnostico = async () => {
    // Obtener todas las intervenciones existentes
    const allInterventions = teeth.flatMap((tooth: Tooth) => tooth.interventions);
    setLoadedInterventions(allInterventions);
    
    // Cargar diagnósticos guardados del backend
    try {
      const response = await axios.get(`/api/diagnostico?patientId=${patientId}`);
      setDiagnosticos(response.data);
    } catch (error: any) {
      console.error('Error al cargar diagnósticos:', error);
      toast({
        title: 'Error al cargar diagnósticos',
        description: 'No se pudieron cargar los diagnósticos guardados',
        status: 'warning',
        duration: 3000,
      });
    }
    
    onDiagnosticoOpen();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Container maxW="container.xl" p={4}>
      <Box>
        {/* Header */}
        <OdontogramaHeader
          multiSelectMode={multiSelectMode}
          selectedTeethCount={selectedTeeth.length}
          patientName={patient ? `${patient.nombre} ${patient.apellido}` : undefined}
          filterType={filterType}
          viewMode={viewMode}
          hasUnsavedChanges={hasUnsavedChanges}
          onStartMultiSelect={startMultiSelect}
          onCancelMultiSelect={cancelMultiSelect}
          onFinishMultiSelect={finishMultiSelect}
          onOpenDiagnostico={handleOpenDiagnostico}
          onFilterTypeChange={setFilterType}
          onViewModeChange={setViewMode}
          onSave={handleSave}
        />

        {viewMode === 'visual' ? (
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mt={6}>
            {/* Odontograma principal con cuadrantes */}
            <Box gridColumn={{ lg: 'span 2' }}>
              <MotionBox
                variants={itemVariants}
                transform={`scale(${zoom})`}
                transformOrigin="top left"
                style={{ transition: 'transform 0.2s' }}
              >
                <OdontogramaCuadrantes
                  teeth={filteredTeeth}
                  selectedTooth={selectedTooth}
                  multiSelectMode={multiSelectMode}
                  selectedTeeth={selectedTeeth}
                  onToothClick={handleToothClick}
                  onMultiSelectToothClick={handleMultiSelectToothClick}
                  hasBrackets={hasBrackets}
                  hasProtesis={hasProtesis}
                  getBracketConnection={getBracketConnection}
                  onTeethUpdate={handleTeethUpdate}
                  onPositionsUpdate={handlePositionsUpdate}
                  filterType={filterType}
                  patientId={patientId}
                />
              </MotionBox>
            </Box>

            {/* Panel de información del diente */}
            <Box>
              <ToothPanel
                selectedTooth={selectedTooth}
                toothConditions={toothConditions}
                onConditionChange={handleConditionChange}
                onNewIntervention={() => {
                  setEditingIntervention(null);
                  onOpen();
                }}
                onEditIntervention={handleEditIntervention}
                onDeleteIntervention={handleDeleteIntervention}
              />
            </Box>
          </SimpleGrid>
        ) : (
          /* Vista detallada */
          <MotionBox variants={containerVariants} initial="hidden" animate="visible" mt={6}>
            <MotionBox variants={itemVariants}>
              <OdontogramaDetallado
                teeth={teeth}
                selectedTooth={selectedTooth}
                onToothClick={handleToothClick}
                filterType={filterType}
              />
            </MotionBox>
          </MotionBox>
        )}
      </Box>

      {/* Modales */}
      <InterventionModal
        isOpen={isOpen}
        onClose={onClose}
        tooth={selectedTooth}
        onSave={handleAddIntervention}
        existingIntervention={editingIntervention}
        patientId={patientId}
      />

      <MultiSelectModal
        isOpen={isMultiSelectOpen}
        onClose={onMultiSelectClose}
        multiSelectMode={multiSelectMode}
        selectedTeeth={selectedTeeth}
        teeth={teeth}
        onApply={applyMultiSelectIntervention}
      />

      <DiagnosticoModal
        isOpen={isDiagnosticoOpen}
        onClose={onDiagnosticoClose}
        interventions={loadedInterventions}
        patientName={patient ? `${patient.nombre} ${patient.apellido}` : undefined}
        patientId={patientId}
        onDiagnosticoChange={handleDiagnosticoChange}
        savedDiagnosticos={diagnosticos}
      />
    </Container>
  );
};

export default Odontograma; 