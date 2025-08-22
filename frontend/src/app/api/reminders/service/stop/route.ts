import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Aquí implementarías la lógica para detener el servicio
    // Por ahora solo devolvemos éxito
    
    return NextResponse.json({ 
      message: 'Servicio detenido',
      isRunning: false 
    });
  } catch (error) {
    console.error('Error stopping reminder service:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
