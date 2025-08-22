# 🚀 Guía de Migración a Monorepo

## Objetivo
Convertir el proyecto de carpetas separadas (backend/frontend) a una aplicación Next.js unificada con API routes.

## 📋 Pasos de Migración

### 1. Preparar la Estructura
```bash
# Desde la raíz del proyecto
mkdir -p frontend/src/lib/models
mkdir -p frontend/src/app/api
```

### 2. Mover Modelos de Base de Datos
- Copiar `backend/src/models/*` a `frontend/src/lib/models/`
- Actualizar imports para usar `@/lib/models/*`

### 3. Mover API Routes
- Convertir `backend/src/routes/*` a `frontend/src/app/api/*`
- Usar Next.js API routes en lugar de Express

### 4. Mover Configuración
- Copiar `backend/src/config/*` a `frontend/src/lib/`
- Actualizar imports y configuración

### 5. Mover Servicios
- Copiar `backend/src/services/*` a `frontend/src/lib/services/`
- Adaptar para funcionar con Next.js

### 6. Actualizar Dependencias
- Agregar dependencias del backend al `package.json` del frontend
- Ejecutar `npm install`

### 7. Configurar Variables de Entorno
- Crear `.env.local` con las variables necesarias
- Actualizar URLs de API en el frontend

### 8. Probar la Aplicación
- Ejecutar `npm run dev`
- Verificar que todas las funcionalidades funcionen

## 🔄 Cambios en el Código

### Antes (Separado)
```typescript
// Frontend
const response = await axios.get('http://localhost:5000/api/patients');
```

### Después (Unificado)
```typescript
// Frontend
const response = await axios.get('/api/patients');
```

## 📁 Nueva Estructura
```
frontend/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── odontograma/   # Páginas
│   │   ├── pacientes/     # Páginas
│   │   └── citas/         # Páginas
│   ├── components/         # Componentes React
│   ├── lib/               # Utilidades y modelos
│   │   ├── models/        # Modelos Mongoose
│   │   ├── services/      # Servicios
│   │   └── db.ts         # Conexión DB
│   └── prisma/            # Esquemas DB
├── package.json
├── tsconfig.json
└── vercel.json
```

## ✅ Beneficios de la Migración

1. **Un solo repositorio** para GitHub
2. **Despliegue automático** en Vercel
3. **Menos complejidad** de configuración
4. **Mejor rendimiento** (sin CORS)
5. **Más fácil** de mantener y desarrollar

## 🚨 Consideraciones

- **Base de datos**: Debe estar accesible desde Vercel
- **Variables de entorno**: Configurar en Vercel dashboard
- **Archivos estáticos**: Usar Vercel blob storage o similar
- **Límites de API**: Vercel tiene límites de tiempo de ejecución 