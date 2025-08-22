import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';
import Odontograma from '@/lib/models/Odontograma';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const minimal = searchParams.get('minimal') === 'true';

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    // Verificar que el paciente existe
    const { Patient } = await import('@/lib/models');
    const patientExists = await Patient.exists({ _id: patientId });
    
    if (!patientExists) {
      return NextResponse.json({ 
        exists: false,
        _id: null,
        error: 'Patient not found'
      });
    }

    // Función optimizada para encontrar el odontograma
    const findOdontograma = async () => {
      try {
        // Búsqueda directa y simple
        const odontograma = await Odontograma.findOne({ patient: patientId })
          .sort({ updatedAt: -1, createdAt: -1 }) // Más reciente primero
          .lean(); // Usar lean() para mejor rendimiento
        
        if (odontograma) {
          return odontograma;
        }
        
        // Si no existe, crear uno básico usando el modelo Mongoose
        const newOdontograma = new Odontograma({
          patient: patientId,
          teeth: generateBasicTeeth(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const savedOdontograma = await newOdontograma.save();
        return savedOdontograma.toObject();
        
      } catch (error) {
        console.error('Error en findOdontograma:', error);
        return null;
      }
    };

    // Función para generar dientes básicos
    const generateBasicTeeth = () => {
      const teeth = [];
      for (let i = 1; i <= 32; i++) {
        teeth.push({
          number: i,
          condition: 'sano',
          interventions: [],
          notes: ''
        });
      }
      return teeth;
    };

    // Si es minimal, solo verificar si existe
    if (minimal) {
      const odontograma = await findOdontograma();
      const exists = !!odontograma;
      
      return NextResponse.json({
        exists: exists,
        _id: exists ? odontograma._id : null
      });
    }

    // Obtener odontograma completo
    const odontogramaData = await findOdontograma();

    if (!odontogramaData) {
      return NextResponse.json({ error: 'Odontograma not found' }, { status: 404 });
    }

    // Populate solo si es necesario
    try {
      const populatedOdontograma = await Odontograma.findById(odontogramaData._id)
        .populate('patient', 'nombre apellido email telefono cedula')
        .lean();

      if (populatedOdontograma) {
        return NextResponse.json(populatedOdontograma);
      }
    } catch (populateError) {
      // Si falla el populate, devolver datos básicos
    }

    return NextResponse.json(odontogramaData);

  } catch (error) {
    console.error('Error en API Odontograma:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const odontograma = new Odontograma(body);
    const savedOdontograma = await odontograma.save();
    
    return NextResponse.json(savedOdontograma, { status: 201 });
  } catch (error) {
    console.error('Error creating odontograma:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const updatedOdontograma = await Odontograma.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedOdontograma) {
      return NextResponse.json(
        { error: 'Odontograma not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedOdontograma);
  } catch (error) {
    console.error('Error updating odontograma:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 