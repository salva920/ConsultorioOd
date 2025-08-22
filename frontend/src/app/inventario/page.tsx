"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useToast,
  Icon,
  Spinner,
  Progress,
  Tooltip,
} from "@chakra-ui/react";
import { FaBoxOpen, FaExclamationTriangle, FaPills, FaCog, FaTrash, FaEdit, FaPlus, FaSearch, FaBoxes, FaCalendarTimes } from "react-icons/fa";
import ProtectedLayout from "../../components/layouts/ProtectedLayout";

interface InventoryItem {
  _id: string;
  name: string;
  type: "material" | "medicamento" | "equipo" | "consumible";
  currentStock: number;
  minimumStock: number;
  unit: string;
  description?: string;
  expirationDate?: string;
  supplier?: string;
  cost?: number;
  location?: string;
  notes?: string;
  isLowStock: boolean;
  daysUntilExpiration?: number;
  isExpiringSoon: boolean;
}

const typeOptions = [
  { value: "material", label: "Material", icon: FaBoxes },
  { value: "medicamento", label: "Medicamento", icon: FaPills },
  { value: "equipo", label: "Equipo", icon: FaCog },
  { value: "consumible", label: "Consumible", icon: FaBoxOpen },
];

const unitOptions = [
  "unidades",
  "cajas",
  "ml",
  "g",
  "tabletas",
  "ampollas",
  "otros",
];

export default function InventarioPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockCount: 0,
    expiringCount: 0,
    totalValue: 0,
  });
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchInventory();
    fetchStats();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      let url = "/api/inventory";
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterType) params.append("type", filterType);
      if (showLowStockOnly) params.append("lowStock", "true");
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      toast({ status: "error", title: "Error al cargar inventario" });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/inventory/stats");
      const data = await response.json();
      
      // Mapear los datos de la API al formato esperado por el frontend
      setStats({
        totalItems: data.totalItems || 0,
        lowStockCount: data.lowStockItems || 0,
        expiringCount: data.expiringCount || 0,
        totalValue: data.totalValue || 0,
      });
    } catch (error) {
      toast({ status: "error", title: "Error al cargar estadísticas" });
    }
  };

  const handleCreateOrUpdate = async (itemData: Partial<InventoryItem>) => {
    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem
        ? `/api/inventory/${editingItem._id}`
        : "/api/inventory";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });
      if (response.ok) {
        setShowForm(false);
        setEditingItem(null);
        fetchInventory();
        fetchStats();
        toast({
          status: "success",
          title: editingItem ? "Insumo actualizado" : "Insumo creado",
        });
      }
    } catch (error) {
      toast({ status: "error", title: "Error al guardar insumo" });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este insumo?")) return;
    try {
      const response = await fetch(
        `/api/inventory/${id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        fetchInventory();
        fetchStats();
        toast({ status: "success", title: "Insumo eliminado" });
      }
    } catch (error) {
      toast({ status: "error", title: "Error al eliminar insumo" });
    }
  };

  const filteredItems = items.filter((item) => {
    if (
      searchTerm &&
      !item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    if (filterType && item.type !== filterType) {
      return false;
    }
    if (showLowStockOnly && !item.isLowStock) {
      return false;
    }
    return true;
  });

  const defaultForm = {
    name: '',
    type: 'material',
    currentStock: '',
    minimumStock: '',
    unit: 'unidades',
    description: '',
    expirationDate: '',
    supplier: '',
    cost: '',
    location: '',
    notes: ''
  };

  function useInventoryForm(editingItem: InventoryItem | null) {
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
      if (editingItem) {
        setForm({
          ...defaultForm,
          ...editingItem,
          currentStock: editingItem.currentStock.toString(),
          minimumStock: editingItem.minimumStock.toString(),
          cost: editingItem.cost ? editingItem.cost.toString() : '',
          expirationDate: editingItem.expirationDate ? editingItem.expirationDate.slice(0, 10) : ''
        });
      } else {
        setForm(defaultForm);
      }
    }, [editingItem]);

    const validate = () => {
      const newErrors: any = {};
      if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
      if (!form.type) newErrors.type = 'El tipo es obligatorio';
      if (form.currentStock === '' || isNaN(Number(form.currentStock))) newErrors.currentStock = 'Stock actual requerido';
      if (form.minimumStock === '' || isNaN(Number(form.minimumStock))) newErrors.minimumStock = 'Stock mínimo requerido';
      if (!form.unit) newErrors.unit = 'Unidad requerida';
      return newErrors;
    };

    return { form, setForm, errors, setErrors, validate };
  }

  const { form, setForm, errors, setErrors, validate } = useInventoryForm(editingItem);

  const handleSubmit = () => {
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      const data = {
        ...form,
        currentStock: Number(form.currentStock),
        minimumStock: Number(form.minimumStock),
        cost: form.cost ? Number(form.cost) : undefined,
        expirationDate: form.expirationDate ? new Date(form.expirationDate) : undefined,
      };
      handleCreateOrUpdate(data);
    }
  };

  return (
    <ProtectedLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" color="blue.600">
              Inventario
            </Heading>
            <Text color="gray.600">
              Gestiona los insumos y materiales del consultorio
            </Text>
          </Box>

        {/* Estadísticas */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <HStack>
                <Icon as={FaBoxes} color="blue.500" boxSize={6} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="gray.600">
                    Total de Insumos
                  </Text>
                  <Heading size="md" color="blue.600">
                    {stats.totalItems}
                  </Heading>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <HStack>
                <Icon as={FaExclamationTriangle} color="red.500" boxSize={6} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="gray.600">
                    Stock Bajo
                  </Text>
                  <Heading size="md" color="red.600">
                    {stats.lowStockCount}
                  </Heading>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <HStack>
                <Icon as={FaCalendarTimes} color="orange.500" boxSize={6} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="gray.600">
                    Próximos a Vencer
                  </Text>
                  <Heading size="md" color="orange.600">
                    {stats.expiringCount}
                  </Heading>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <HStack>
                <Icon as={FaBoxOpen} color="green.500" boxSize={6} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="gray.600">
                    Valor Total
                  </Text>
                  <Heading size="md" color="green.600">
                    ${(stats.totalValue || 0).toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN",
                      minimumFractionDigits: 2,
                    })}
                  </Heading>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Alertas */}
        {stats.lowStockCount > 0 && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>¡Alerta de Stock Bajo!</AlertTitle>
              <AlertDescription>
                Tienes {stats.lowStockCount} insumo{stats.lowStockCount > 1 ? "s" : ""} con stock bajo que requieren atención.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Controles */}
        <Card>
          <CardBody>
            <HStack spacing={4} flexWrap="wrap">
              <Input
                placeholder="Buscar insumos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxW="250px"
                leftIcon={<FaSearch />}
                bg="white"
              />
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                maxW="180px"
                bg="white"
              >
                <option value="">Todos los tipos</option>
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              <Button
                leftIcon={<FaExclamationTriangle />}
                colorScheme={showLowStockOnly ? "red" : "gray"}
                variant={showLowStockOnly ? "solid" : "outline"}
                onClick={() => setShowLowStockOnly((v) => !v)}
              >
                Stock Bajo
              </Button>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                onClick={() => {
                  setEditingItem(null);
                  setShowForm(true);
                  onOpen();
                }}
              >
                Nuevo Insumo
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Tabla de inventario */}
        <Card>
          <CardBody>
            {loading ? (
              <VStack py={12}>
                <Spinner size="xl" color="blue.500" />
                <Text color="gray.500">Cargando inventario...</Text>
              </VStack>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Insumo</Th>
                      <Th>Tipo</Th>
                      <Th>Stock</Th>
                      <Th>Vencimiento</Th>
                      <Th>Ubicación</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredItems.length === 0 ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py={12}>
                          <VStack spacing={2}>
                            <Icon as={FaBoxOpen} boxSize={10} color="gray.300" />
                            <Text color="gray.500">
                              {searchTerm || filterType || showLowStockOnly
                                ? "No se encontraron insumos con los filtros aplicados"
                                : "No hay insumos registrados"}
                            </Text>
                            {!searchTerm && !filterType && !showLowStockOnly && (
                              <Button
                                leftIcon={<FaPlus />}
                                colorScheme="blue"
                                onClick={() => {
                                  setEditingItem(null);
                                  setShowForm(true);
                                  onOpen();
                                }}
                              >
                                Agregar primer insumo
                              </Button>
                            )}
                          </VStack>
                        </Td>
                      </Tr>
                    ) : (
                      filteredItems.map((item) => (
                        <Tr key={item._id} _hover={{ bg: "gray.50" }}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold">{item.name}</Text>
                              {item.description && (
                                <Text fontSize="xs" color="gray.500">
                                  {item.description}
                                </Text>
                              )}
                            </VStack>
                          </Td>
                          <Td>
                            <HStack>
                              <Icon as={
                                typeOptions.find((t) => t.value === item.type)?.icon || FaBoxOpen
                              } color="gray.500" />
                              <Badge colorScheme="blue" variant="subtle" borderRadius="md">
                                {item.type}
                              </Badge>
                            </HStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" color={item.isLowStock ? "red.600" : "gray.800"}>
                                {item.currentStock} {item.unit}
                                {item.isLowStock && (
                                  <Tooltip label="Stock bajo">
                                    <span>
                                      <Icon as={FaExclamationTriangle} color="red.500" ml={2} />
                                    </span>
                                  </Tooltip>
                                )}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                Mín: {item.minimumStock} {item.unit}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            {item.expirationDate ? (
                              <VStack align="start" spacing={0}>
                                <Text color={item.isExpiringSoon ? "orange.600" : "gray.800"}>
                                  {new Date(item.expirationDate).toLocaleDateString()}
                                </Text>
                                {item.daysUntilExpiration !== null && (
                                  <Text fontSize="xs" color="gray.500">
                                    {item.daysUntilExpiration} días
                                  </Text>
                                )}
                              </VStack>
                            ) : (
                              <Text color="gray.400">Sin fecha</Text>
                            )}
                          </Td>
                          <Td>{item.location || "-"}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <Tooltip label="Editar">
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingItem(item);
                                    setShowForm(true);
                                    onOpen();
                                  }}
                                >
                                  <Icon as={FaEdit} />
                                </Button>
                              </Tooltip>
                              <Tooltip label="Eliminar">
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleDeleteItem(item._id)}
                                >
                                  <Icon as={FaTrash} />
                                </Button>
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Modal de formulario */}
        <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingItem(null); onClose(); }} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{editingItem ? "Editar Insumo" : "Nuevo Insumo"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack as="form" spacing={4} align="stretch" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                <Input
                  placeholder="Nombre del insumo *"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  isInvalid={!!errors.name}
                />
                <HStack spacing={4}>
                  <Select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    isInvalid={!!errors.type}
                  >
                    {typeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                  <Select
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                    isInvalid={!!errors.unit}
                  >
                    {unitOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </Select>
                </HStack>
                <HStack spacing={4}>
                  <Input
                    type="number"
                    placeholder="Stock actual *"
                    value={form.currentStock}
                    onChange={e => setForm({ ...form, currentStock: e.target.value })}
                    isInvalid={!!errors.currentStock}
                  />
                  <Input
                    type="number"
                    placeholder="Stock mínimo *"
                    value={form.minimumStock}
                    onChange={e => setForm({ ...form, minimumStock: e.target.value })}
                    isInvalid={!!errors.minimumStock}
                  />
                </HStack>
                <HStack spacing={4}>
                  <Input
                    type="number"
                    placeholder="Costo (opcional)"
                    value={form.cost}
                    onChange={e => setForm({ ...form, cost: e.target.value })}
                  />
                  <Input
                    type="date"
                    placeholder="Fecha de vencimiento"
                    value={form.expirationDate}
                    onChange={e => setForm({ ...form, expirationDate: e.target.value })}
                  />
                </HStack>
                <HStack spacing={4}>
                  <Input
                    placeholder="Proveedor"
                    value={form.supplier}
                    onChange={e => setForm({ ...form, supplier: e.target.value })}
                  />
                  <Input
                    placeholder="Ubicación"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                  />
                </HStack>
                <Input
                  placeholder="Descripción"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
                <Input
                  placeholder="Notas"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
                {Object.values(errors).length > 0 && (
                  <Box color="red.500" fontSize="sm">
                    {Object.values(errors).map((err, i) => <div key={i}>{err}</div>)}
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => { setShowForm(false); setEditingItem(null); onClose(); }} mr={3}>
                Cancelar
              </Button>
              <Button colorScheme="blue" onClick={handleSubmit}>
                Guardar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  </ProtectedLayout>
  );
} 