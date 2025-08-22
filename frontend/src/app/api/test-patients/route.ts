import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function GET(request: NextRequest) {
  try {
    console.log('Conectando a la base de datos...');
    await connectDB();
    console.log('Base de datos conectada');

    // Importar modelo Patient desde el índice
    const { Patient } = await import('@/lib/models');
    console.log('Modelo Patient importado correctamente');

    // Probar consulta básica
    console.log('Probando consulta de pacientes...');
    const patientCount = await Patient.countDocuments();
    console.log(`Total de pacientes: ${patientCount}`);

    // Probar obtener algunos pacientes
    const patients = await Patient.find()
      .limit(3)
      .select('nombre apellido cedula email telefono createdAt');
    console.log(`Pacientes obtenidos: ${patients.length}`);

    return NextResponse.json({
      message: 'Modelo Patient funciona correctamente',
      totalPatients: patientCount,
      samplePatients: patients,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en test de pacientes:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al probar modelo Patient',
        details: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
