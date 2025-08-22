# 🚀 Guía de Despliegue en Vercel

## 📋 Prerrequisitos

1. **Cuenta de GitHub** con el repositorio del proyecto
2. **Cuenta de Vercel** (gratuita)
3. **Base de datos MongoDB** accesible desde internet
4. **Proyecto migrado** a estructura monorepo

## 🔄 Paso 1: Migrar a Monorepo

Si aún no has migrado el proyecto:

```bash
# Ejecutar el script de migración
chmod +x migrate.sh
./migrate.sh
```

## 📁 Paso 2: Preparar el Repositorio

### 2.1 Crear archivo .env.local
```bash
# En la raíz del proyecto frontend
cp env.example .env.local
```

Editar `.env.local` con tus valores reales:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/odontograma
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
NEXT_PUBLIC_API_URL=https://tu-app.vercel.app
```

### 2.2 Verificar estructura
```
frontend/
├── src/
│   ├── app/
│   │   ├── api/           # ✅ API routes
│   │   ├── odontograma/   # ✅ Páginas
│   │   ├── pacientes/     # ✅ Páginas
│   │   └── citas/         # ✅ Páginas
│   ├── components/         # ✅ Componentes
│   ├── lib/               # ✅ Utilidades
│   │   ├── models/        # ✅ Modelos DB
│   │   ├── services/      # ✅ Servicios
│   │   └── db.ts         # ✅ Conexión DB
│   └── prisma/            # ✅ Esquemas DB
├── package.json           # ✅ Dependencias actualizadas
├── tsconfig.json          # ✅ Configuración TS
└── vercel.json            # ✅ Configuración Vercel
```

## 🚀 Paso 3: Subir a GitHub

### 3.1 Inicializar Git (si no existe)
```bash
cd frontend
git init
git add .
git commit -m "🚀 Migración a monorepo Next.js"
```

### 3.2 Crear repositorio en GitHub
1. Ir a [github.com](https://github.com)
2. Crear nuevo repositorio: `odontograma-full`
3. **NO** inicializar con README, .gitignore, o licencia

### 3.3 Conectar y subir
```bash
git remote add origin https://github.com/tu-usuario/odontograma-full.git
git branch -M main
git push -u origin main
```

## 🌐 Paso 4: Desplegar en Vercel

### 4.1 Conectar repositorio
1. Ir a [vercel.com](https://vercel.com)
2. Iniciar sesión con GitHub
3. Click en "New Project"
4. Seleccionar repositorio `odontograma-full`
5. Click en "Import"

### 4.2 Configurar proyecto
- **Framework Preset**: Next.js (detectado automáticamente)
- **Root Directory**: `frontend` (si tu estructura lo requiere)
- **Build Command**: `npm run build` (por defecto)
- **Output Directory**: `.next` (por defecto)
- **Install Command**: `npm install` (por defecto)

### 4.3 Configurar variables de entorno
En la sección "Environment Variables":

| Variable | Valor | Entorno |
|----------|-------|---------|
| `MONGODB_URI` | `mongodb+srv://...` | Production, Preview, Development |
| `JWT_SECRET` | `tu_secret_aqui` | Production, Preview, Development |

### 4.4 Desplegar
1. Click en "Deploy"
2. Esperar a que termine el build
3. ¡Tu app estará disponible en `https://tu-app.vercel.app`!

## 🔧 Paso 5: Configurar Base de Datos

### 5.1 MongoDB Atlas (Recomendado)
1. Crear cuenta en [MongoDB Atlas](https://mongodb.com/atlas)
2. Crear cluster gratuito
3. Configurar acceso desde cualquier IP (`0.0.0.0/0`)
4. Crear usuario y contraseña
5. Obtener connection string

### 5.2 Variables de entorno en Vercel
1. Ir a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agregar `MONGODB_URI` con tu connection string

## ✅ Paso 6: Verificar Despliegue

### 6.1 Verificar API routes
```bash
# Probar endpoint de pacientes
curl https://tu-app.vercel.app/api/patients
```

### 6.2 Verificar frontend
- Navegar a tu URL de Vercel
- Probar funcionalidades principales
- Verificar conexión a base de datos

## 🚨 Solución de Problemas

### Error: "Module not found"
```bash
# Verificar que todas las dependencias estén instaladas
npm install
npm run build
```

### Error: "MongoDB connection failed"
- Verificar `MONGODB_URI` en Vercel
- Verificar que MongoDB Atlas permita conexiones desde Vercel
- Verificar credenciales de usuario

### Error: "Build failed"
- Revisar logs de build en Vercel
- Verificar que TypeScript compile correctamente
- Verificar que no haya imports faltantes

## 🔄 Actualizaciones Automáticas

Una vez configurado:
- Cada push a `main` activará un nuevo deploy
- Vercel maneja automáticamente las versiones
- Puedes hacer rollback a versiones anteriores

## 📱 URLs de Producción

- **Frontend**: `https://tu-app.vercel.app`
- **API**: `https://tu-app.vercel.app/api/*`
- **Odontograma**: `https://tu-app.vercel.app/odontograma`
- **Pacientes**: `https://tu-app.vercel.app/pacientes`
- **Citas**: `https://tu-app.vercel.app/citas`

## 🎉 ¡Listo!

Tu aplicación de odontograma está ahora:
- ✅ **Desplegada** en Vercel
- ✅ **Conectada** a MongoDB
- ✅ **Actualizándose** automáticamente
- ✅ **Accesible** desde cualquier lugar
- ✅ **Escalable** según demanda 