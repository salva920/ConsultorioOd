# Componentes del Odontograma

## Descripción General

El sistema de odontograma incluye múltiples vistas y componentes para representar la información dental de los pacientes de manera visual e interactiva.

## Componentes Principales

### 1. Odontograma.tsx
Componente principal que coordina todas las funcionalidades del odontograma.

**Características:**
- Gestión de estado de dientes e intervenciones
- Comunicación con el backend
- Control de vistas (Visual vs Detallado)
- Filtros por tipo de dentadura (Permanente/Temporal)

### 2. OdontogramaCuadrantes.tsx
Representación visual del odontograma con imagen de fondo y posicionamiento de dientes.

**Características:**
- Vista visual con imagen de fondo
- Posicionamiento dinámico de dientes
- Modo de ajuste de posiciones
- Detección automática de dientes
- Zoom y controles de navegación

### 3. OdontogramaDetallado.tsx
Vista detallada con representación de cuadros para cada diente.

**Características:**
- Representación en cuadrícula de dientes
- Visualización de partes intervenidas del diente
- Códigos de colores para condiciones y procedimientos
- Información detallada de intervenciones
- Leyenda de colores

### 4. OdontogramaStats.tsx
Componente de estadísticas del odontograma.

**Características:**
- Estadísticas generales de salud dental
- Contadores por tipo de condición
- Contadores por tipo de intervención
- Barras de progreso visuales
- Evaluación de salud dental

## Vistas Disponibles

### Vista Visual
- Representación con imagen de fondo
- Posicionamiento realista de dientes
- Modo de ajuste de posiciones
- Zoom y navegación

### Vista Detallada
- Cuadrícula de dientes con códigos de colores
- Visualización de partes específicas intervenidas
- Estadísticas completas
- Información detallada de cada diente

## Códigos de Colores

### Condiciones de Dientes
- **Verde**: Sano
- **Rojo**: Caries
- **Azul**: Restaurado
- **Gris**: Ausente
- **Púrpura**: Extracción
- **Amarillo**: Endodoncia
- **Naranja**: Corona
- **Cian**: Implante

### Procedimientos
- **Azul**: Brackets
- **Verde**: Prótesis
- **Rojo**: Caries
- **Amarillo**: Endodoncia
- **Naranja**: Corona
- **Cian**: Implante
- **Púrpura**: Extracción
- **Azul**: Restauración
- **Verde azulado**: Limpieza
- **Amarillo**: Blanqueamiento

## Funcionalidades Avanzadas

### Modo de Ajuste de Posiciones
- Detección automática de dientes
- Ajuste manual de posiciones
- Arrastre directo de dientes
- Exportación de posiciones en JSON

### Selección Múltiple
- Modo brackets (Ctrl+B)
- Modo prótesis (Ctrl+P)
- Aplicación masiva de intervenciones
- Cancelación con Escape

### Intervenciones
- Registro de procedimientos por parte del diente
- Estados: Completado, Pendiente, Cancelado
- Imágenes asociadas
- Historial de intervenciones

## Uso

### Cambio de Vistas
```typescript
// En el componente principal
const [viewMode, setViewMode] = useState<'visual' | 'detallado'>('visual');
```

### Filtros de Dentadura
```typescript
// Filtrar por tipo de dentadura
const [filterType, setFilterType] = useState<'permanente' | 'temporal'>('permanente');
```

### Interacción con Dientes
```typescript
// Manejo de clics en dientes
const handleToothClick = (tooth: Tooth) => {
  setSelectedTooth(tooth);
};
```

## Integración con Backend

El sistema se comunica automáticamente con el backend para:
- Cargar datos de dientes
- Guardar intervenciones
- Sincronizar cambios
- Gestionar diagnósticos

## Responsive Design

Todos los componentes están optimizados para:
- Dispositivos móviles
- Tablets
- Escritorio
- Diferentes tamaños de pantalla

## Accesibilidad

- Controles de teclado
- Tooltips informativos
- Colores con suficiente contraste
- Navegación por teclado 