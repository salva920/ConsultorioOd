import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Simular estado del servicio (esto debería venir de tu sistema real)
    const serviceStatus = {
      isRunning: false, // Cambiar según tu lógica real
      notifications: {
        email: process.env.EMAIL_SERVICE ? true : false,
        whatsapp: process.env.WHATSAPP_TOKEN ? true : false,
        configured: !!(process.env.EMAIL_SERVICE && process.env.WHATSAPP_TOKEN)
      }
    };

    return NextResponse.json(serviceStatus);
  } catch (error) {
    console.error('Error getting service status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
