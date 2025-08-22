import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';
import Appointment from '@/lib/models/Appointment';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const appointment = await Appointment.findById(params.id)
      .populate('patientId', 'nombre apellido email telefono cedula');

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

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

    return NextResponse.json(transformedAppointment);
  } catch (error) {
    console.error('Error getting appointment:', error);
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
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('patientId', 'nombre apellido email telefono cedula');
    
    if (!updatedAppointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    // Transformar la respuesta para el frontend
    const transformedAppointment = {
      _id: updatedAppointment._id,
      patientId: updatedAppointment.patientId._id,
      patient: {
        _id: updatedAppointment.patientId._id,
        nombre: updatedAppointment.patientId.nombre || 'Sin nombre',
        apellido: updatedAppointment.patientId.apellido || 'Sin apellido',
        email: updatedAppointment.patientId.email || '',
        telefono: updatedAppointment.patientId.telefono || '',
        cedula: updatedAppointment.patientId.cedula || ''
      },
      date: updatedAppointment.date,
      time: updatedAppointment.date.toTimeString().substring(0, 5),
      status: updatedAppointment.status,
      notes: updatedAppointment.notes,
      createdAt: updatedAppointment.createdAt,
      updatedAt: updatedAppointment.updatedAt
    };
    
    return NextResponse.json(transformedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
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
    
    const appointment = await Appointment.findByIdAndDelete(params.id);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Cita eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
