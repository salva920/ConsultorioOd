import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function GET(
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

    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Error getting reminder:', error);
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
    
    const { Reminder } = await import('@/lib/models');
    
    const reminder = await Reminder.findByIdAndDelete(params.id);

    if (!reminder) {
      return NextResponse.json(
        { error: 'Recordatorio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Recordatorio eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
