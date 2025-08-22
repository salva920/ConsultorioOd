import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';
import Diagnostico from '@/lib/models/Diagnostico';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const diagnostico = await Diagnostico.findById(params.id)
      .populate('patient', 'name email phone');

    if (!diagnostico) {
      return NextResponse.json(
        { error: 'Diagnóstico no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(diagnostico);
  } catch (error) {
    console.error('Error getting diagnostico:', error);
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
    
    const diagnostico = await Diagnostico.findByIdAndDelete(params.id);

    if (!diagnostico) {
      return NextResponse.json(
        { error: 'Diagnóstico no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Diagnóstico eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting diagnostico:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
