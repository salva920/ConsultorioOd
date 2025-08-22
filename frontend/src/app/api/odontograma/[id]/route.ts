import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';
import Odontograma from '@/lib/models/Odontograma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const odontograma = await Odontograma.findById(params.id)
      .populate('patient', 'nombre apellido email telefono cedula');

    if (!odontograma) {
      return NextResponse.json(
        { error: 'Odontograma no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(odontograma);
  } catch (error) {
    console.error('Error getting odontograma:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const updatedOdontograma = await Odontograma.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('patient', 'nombre apellido email telefono cedula');

    if (!updatedOdontograma) {
      return NextResponse.json(
        { error: 'Odontograma no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOdontograma);
  } catch (error) {
    console.error('Error updating odontograma:', error);
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
    
    const odontograma = await Odontograma.findByIdAndDelete(params.id);

    if (!odontograma) {
      return NextResponse.json(
        { error: 'Odontograma no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Odontograma eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting odontograma:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
