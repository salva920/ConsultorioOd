#!/bin/bash

echo "🚀 Iniciando migración a monorepo..."

# Crear directorios necesarios
echo "📁 Creando estructura de directorios..."
mkdir -p frontend/src/lib/models
mkdir -p frontend/src/lib/services
mkdir -p frontend/src/lib/config
mkdir -p frontend/src/app/api

# Copiar modelos
echo "📋 Copiando modelos de base de datos..."
cp -r backend/src/models/* frontend/src/lib/models/

# Copiar servicios
echo "🔧 Copiando servicios..."
cp -r backend/src/services/* frontend/src/lib/services/

# Copiar configuración
echo "⚙️ Copiando configuración..."
cp -r backend/src/config/* frontend/src/lib/config/

# Copiar esquemas Prisma si existen
if [ -d "prisma" ]; then
    echo "🗄️ Copiando esquemas Prisma..."
    cp -r prisma frontend/
fi

# Actualizar package.json
echo "📦 Actualizando dependencias..."
cd frontend

# Agregar dependencias del backend
npm install mongoose multer cors dotenv

echo "✅ Migración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Revisar y ajustar imports en los archivos copiados"
echo "2. Crear archivo .env.local con las variables necesarias"
echo "3. Ejecutar 'npm run dev' para probar"
echo "4. Subir a GitHub y conectar con Vercel"
echo ""
echo "🔗 Para más detalles, consulta: migrate-to-monorepo.md" 