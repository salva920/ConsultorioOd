import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'date';

    const { Appointment } = await import('@/lib/models');

    let query = {};
    
    // Filtrar por fecha si se proporciona
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = {
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'nombre apellido email telefono cedula')
      .sort(sort)
      .limit(limit);

    // Transformar los datos para el frontend
    const transformedAppointments = appointments
      .filter(appointment => appointment.patientId && appointment.patientId._id) // Filtrar citas sin paciente válido
      .map(appointment => {
        // Verificar que el paciente existe y tiene los datos necesarios
        if (!appointment.patientId || !appointment.patientId.nombre) {
          console.warn(`Cita ${appointment._id} sin paciente válido:`, appointment.patientId);
          return null;
        }
        
        return {
          _id: appointment._id,
          patientId: appointment.patientId._id,
          patient: {
            _id: appointment.patientId._id,
            nombre: appointment.patientId.nombre || 'Sin nombre',
            apellido: appointment.patientId.apellido || 'Sin apellido',
            email: appointment.patientId.email || '',
            telefono: appointment.patientId.telefono || '',
            cedula: appointment.patientId.cedula || ''
          },
          date: appointment.date,
          time: appointment.date.toTimeString().substring(0, 5),
          status: appointment.status,
          notes: appointment.notes,
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt
        };
      })
      .filter(appointment => appointment !== null); // Filtrar citas nulas

    return NextResponse.json(transformedAppointments);
  } catch (error) {
    console.error('Error getting appointments:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { Appointment } = await import('@/lib/models');

    const appointment = new Appointment(body);
    await appointment.save();

    // Poblar la información del paciente antes de devolver
    await appointment.populate('patientId', 'nombre apellido email telefono cedula');

    // Transformar la respuesta para el frontend
    const transformedAppointment = {
      _id: appointment._id,
      patientId: appointment.patientId._id,
      patient: {
        _id: appointment.patientId._id,
        nombre: appointment.patientId.nombre || 'Sin nombre',
        apellido: appointment.patientId.apellido || 'Sin apellido',
        email: appointment.patientId.email || '',
        telefono: appointment.patientId.telefono || '',
        cedula: appointment.patientId.cedula || ''
      },
      date: appointment.date,
      time: appointment.date.toTimeString().substring(0, 5),
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    };

    return NextResponse.json(transformedAppointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 