import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function GET(request: NextRequest) {
  try {
    console.log('Conectando a la base de datos...');
    await connectDB();
    console.log('Base de datos conectada');

    // Probar importación de modelos
    console.log('Probando importación de modelos...');
    
    // Importar modelos desde el índice
    const { Patient, Appointment, Odontograma, Inventory, Reminder, Diagnostico } = await import('@/lib/models');
    
    console.log('Modelos importados correctamente');

    // Probar consultas básicas
    console.log('Probando consultas básicas...');
    
    const patientCount = await Patient.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    const odontogramaCount = await Odontograma.countDocuments();
    const inventoryCount = await Inventory.countDocuments();
    const reminderCount = await Reminder.countDocuments();
    const diagnosticoCount = await Diagnostico.countDocuments();
    
    console.log('Consultas ejecutadas correctamente');

    return NextResponse.json({
      message: 'Todos los modelos funcionan correctamente',
      counts: {
        patients: patientCount,
        appointments: appointmentCount,
        odontogramas: odontogramaCount,
        inventory: inventoryCount,
        reminders: reminderCount,
        diagnosticos: diagnosticoCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en test de modelos:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al probar modelos',
        details: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
