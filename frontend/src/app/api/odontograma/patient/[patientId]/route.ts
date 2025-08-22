import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    await connectDB();
    
    const { Odontograma } = await import('@/lib/models');
    
    // Búsqueda optimizada con lean() para mejor rendimiento
    const odontograma = await Odontograma.findOne({ 
      patient: params.patientId 
    })
    .populate('patient', 'nombre apellido email telefono cedula')
    .lean(); // Usar lean() para mejor rendimiento

    if (!odontograma) {
      return NextResponse.json(
        { error: 'No se encontró odontograma para este paciente' },
        { status: 404 }
      );
    }

    return NextResponse.json(odontograma);
  } catch (error) {
    console.error('Error getting odontograma by patient:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
