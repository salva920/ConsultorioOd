import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function GET(request: NextRequest) {
  try {
    console.log('Probando conexión a la base de datos...');
    
    const conn = await connectDB();
    console.log('Conexión exitosa a MongoDB');
    
    // Verificar el estado de la conexión
    const dbState = conn.connection.readyState;
    const dbName = conn.connection.name;
    const dbHost = conn.connection.host;
    
    console.log(`Estado de la conexión: ${dbState}`);
    console.log(`Nombre de la base de datos: ${dbName}`);
    console.log(`Host: ${dbHost}`);
    
    return NextResponse.json({
      message: 'Conexión a la base de datos exitosa',
      connection: {
        state: dbState,
        database: dbName,
        host: dbHost || 'MongoDB Atlas'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en test de base de datos:', error);
    
    return NextResponse.json(
      { 
        error: 'Error de conexión a la base de datos',
        details: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
