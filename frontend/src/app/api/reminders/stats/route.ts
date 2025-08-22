import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { Reminder } = await import('@/lib/models');

    // Obtener estadísticas de recordatorios
    const pending = await Reminder.countDocuments({ status: 'pending' });
    const sent = await Reminder.countDocuments({ status: 'sent' });
    const failed = await Reminder.countDocuments({ status: 'failed' });
    const cancelled = await Reminder.countDocuments({ status: 'cancelled' });

    return NextResponse.json({
      pending,
      sent,
      failed,
      cancelled
    });
  } catch (error) {
    console.error('Error getting reminder stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
