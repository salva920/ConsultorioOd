import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { Reminder } = await import('@/lib/models');
    
    const reminder = await Reminder.findById(params.id);
    
    if (!reminder) {
      return NextResponse.json(
        { error: 'Recordatorio no encontrado' },
        { status: 404 }
      );
    }

    // Aquí implementarías la lógica para reenviar el recordatorio
    // Por ahora solo actualizamos el estado
    
    reminder.status = 'pending';
    reminder.scheduledFor = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos en el futuro
    await reminder.save();

    return NextResponse.json({ 
      message: 'Recordatorio programado para reenvío',
      reminder 
    });
  } catch (error) {
    console.error('Error resending reminder:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
