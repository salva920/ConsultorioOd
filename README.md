# 🦷 Sistema de Odontograma

Sistema completo de gestión dental con odontograma digital, citas, pacientes e inventario.

## 🚀 Características

- **Odontograma Digital**: Visualización interactiva de dientes y tratamientos
- **Gestión de Pacientes**: Registro completo de información dental
- **Sistema de Citas**: Programación y seguimiento de consultas
- **Inventario**: Control de stock de materiales dentales
- **Reportes PDF**: Exportación de historiales clínicos
- **Interfaz Responsiva**: Diseño moderno y adaptable

## 🏗️ Arquitectura

### Aplicación Unificada (Next.js + TypeScript)
- **Framework**: Next.js 14 con App Router
- **UI**: Chakra UI + Framer Motion
- **Estado**: TanStack Query + React Hook Form
- **PDF**: @react-pdf/renderer
- **API**: API Routes integradas en Next.js
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT
- **Archivos**: Multer para uploads

## 📁 Estructura del Proyecto

```
odontograma-full/
├── src/
│   ├── app/          # Páginas y API routes
│   ├── components/   # Componentes React
│   ├── lib/         # Configuración DB y utilidades
│   └── prisma/      # Esquemas de base de datos
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

## 🛠️ Instalación

### Prerrequisitos
- Node.js 18+
- MongoDB
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd odontograma-full
```

### 2. Instalar dependencias
```bash
npm install
```

### 4. Configurar variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:
```env
MONGODB_URI=mongodb://localhost:27017/odontograma
JWT_SECRET=tu_jwt_secret_aqui
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 5. Ejecutar el proyecto

```bash
npm run dev
```

## 🌐 Despliegue

### Aplicación Completa en Vercel
1. Conectar repositorio de GitHub
2. Configurar variables de entorno (MONGODB_URI, JWT_SECRET)
3. Deploy automático

**Nota**: Vercel maneja automáticamente tanto el frontend como las API routes.

## 📱 Uso

1. **Acceder** a la aplicación
2. **Registrar pacientes** con información dental
3. **Crear citas** y programar consultas
4. **Gestionar odontograma** con tratamientos
5. **Exportar reportes** en PDF
6. **Controlar inventario** de materiales

## 🔧 Tecnologías

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **UI**: Chakra UI + Framer Motion
- **Estado**: TanStack Query + React Hook Form
- **Base de Datos**: MongoDB con Mongoose
- **API**: Next.js API Routes
- **Autenticación**: JWT
- **PDF**: @react-pdf/renderer
- **Despliegue**: Vercel

## 📄 Licencia

Este proyecto es privado y está destinado para uso clínico dental.

## 👨‍⚕️ Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo. # ConsultorioOd
