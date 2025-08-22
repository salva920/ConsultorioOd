import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { Odontograma, Patient } = await import('@/lib/models');
    const body = await request.json();
    const { patientId } = body;
    
    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }
    
    // Verificar que el paciente existe
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    
    // Buscar odontogramas sin referencia de paciente
    const orphanOdontogramas = await Odontograma.find({
      $or: [
        { patient: { $exists: false } },
        { patient: null },
        { patient: undefined },
        { patientId: { $exists: false } },
        { patientId: null },
        { patientId: undefined }
      ]
    });
    
    if (orphanOdontogramas.length === 0) {
      return NextResponse.json({ message: 'No hay odontogramas huérfanos para asociar' });
    }
    
    // Asociar el primer odontograma huérfano con este paciente
    const odontogramaToAssociate = orphanOdontogramas[0];
    odontogramaToAssociate.patient = patientId;
    await odontogramaToAssociate.save();
    
    console.log(`✅ Odontograma ${odontogramaToAssociate._id} asociado con paciente ${patientId}`);
    
    return NextResponse.json({ 
      message: 'Odontograma asociado exitosamente',
      odontogramaId: odontogramaToAssociate._id
    });
    
  } catch (error) {
    console.error('Error associating odontograma:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
