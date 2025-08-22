import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    return NextResponse.json({
      message: 'API funcionando correctamente',
      timestamp: new Date().toISOString(),
      database: 'Conectado'
    });
  } catch (error) {
    console.error('Error en test API:', error);
    return NextResponse.json(
      { error: 'Error de conexión a la base de datos' },
      { status: 500 }
    );
  }
}
