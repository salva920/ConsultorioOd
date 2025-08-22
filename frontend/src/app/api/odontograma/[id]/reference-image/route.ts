import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';
import Odontograma from '@/lib/models/Odontograma';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Buscar el odontograma por el ID del paciente
    const odontograma = await Odontograma.findOne({ patient: params.id });
    
    if (!odontograma) {
      return NextResponse.json(
        { error: 'Odontograma no encontrado para este paciente' },
        { status: 404 }
      );
    }

    // Si no hay imagen de referencia, devolver 404
    if (!odontograma.referenceImage || !odontograma.referenceImage.path) {
      return NextResponse.json(
        { error: 'No hay imagen de referencia' },
        { status: 404 }
      );
    }

    try {
      // Leer el archivo de imagen
      const imagePath = path.join(process.cwd(), odontograma.referenceImage.path);
      const imageBuffer = await fs.readFile(imagePath);
      
      // Determinar el tipo de contenido
      const contentType = odontograma.referenceImage.mimetype || 'image/jpeg';
      
      // Devolver la imagen con el tipo de contenido correcto
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
        },
      });
    } catch (fileError) {
      console.error('Error leyendo archivo de imagen:', fileError);
      return NextResponse.json(
        { error: 'Error al leer la imagen' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error getting reference image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Buscar el odontograma por el ID del paciente
    let odontograma = await Odontograma.findOne({ patient: params.id });
    
    if (!odontograma) {
      return NextResponse.json(
        { error: 'Odontograma no encontrado para este paciente' },
        { status: 404 }
      );
    }

    // Obtener el archivo de la request
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó imagen' },
        { status: 400 }
      );
    }

    // Crear directorio para imágenes si no existe
    const uploadDir = path.join(process.cwd(), 'uploads', 'odontograma');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const filename = `reference_${params.id}_${timestamp}_${file.name}`;
    const filePath = path.join(uploadDir, filename);

    // Convertir File a Buffer y guardar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    // Actualizar el odontograma con la información de la imagen
    odontograma.referenceImage = {
      filename: filename,
      originalname: file.name,
      mimetype: file.type,
      size: file.size,
      path: path.relative(process.cwd(), filePath),
      uploadDate: new Date()
    };

    await odontograma.save();

    return NextResponse.json({
      message: 'Imagen de referencia guardada correctamente',
      image: odontograma.referenceImage
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading reference image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Buscar el odontograma por el ID del paciente
    const odontograma = await Odontograma.findOne({ patient: params.id });
    
    if (!odontograma) {
      return NextResponse.json(
        { error: 'Odontograma no encontrado para este paciente' },
        { status: 404 }
      );
    }

    // Si hay una imagen de referencia, eliminarla del sistema de archivos
    if (odontograma.referenceImage && odontograma.referenceImage.path) {
      try {
        const imagePath = path.join(process.cwd(), odontograma.referenceImage.path);
        await fs.unlink(imagePath);
      } catch (fileError) {
        console.error('Error eliminando archivo de imagen:', fileError);
        // Continuar aunque no se pueda eliminar el archivo
      }
    }

    // Limpiar la referencia en la base de datos
    odontograma.referenceImage = undefined;
    await odontograma.save();

    return NextResponse.json({
      message: 'Imagen de referencia eliminada correctamente'
    });

  } catch (error) {
    console.error('Error deleting reference image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
