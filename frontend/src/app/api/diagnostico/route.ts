import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';
import { Diagnostico } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const limit = searchParams.get('limit');
    const sort = searchParams.get('sort');

    let query: any = {};
    
    // Filtrar por paciente si se proporciona
    if (patientId) {
      query.patientId = patientId; // ✅ Usar patientId para coincidir con el esquema
      console.log('🔍 Buscando diagnósticos para patientId:', patientId);
    }

    // Construir la consulta
    let diagnosticoQuery = Diagnostico.find(query);

    // Aplicar ordenamiento
    if (sort) {
      diagnosticoQuery = diagnosticoQuery.sort(sort);
    }

    // Aplicar límite
    if (limit) {
      diagnosticoQuery = diagnosticoQuery.limit(parseInt(limit));
    }

    const diagnosticos = await diagnosticoQuery.exec();
    
    console.log(`📊 Encontrados ${diagnosticos.length} diagnósticos para patientId: ${patientId}`);
    if (diagnosticos.length > 0) {
      console.log('📋 Primer diagnóstico:', {
        _id: diagnosticos[0]._id,
        patientId: diagnosticos[0].patientId,
        unidadDental: diagnosticos[0].unidadDental,
        diagnostico: diagnosticos[0].diagnostico
      });
    }

    return NextResponse.json(diagnosticos);
  } catch (error) {
    console.error('Error getting diagnosticos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: any;
  
  try {
    await connectDB();
    
    body = await request.json();
    
    // Si se envía un array de diagnósticos, guardar múltiples
    if (Array.isArray(body.diagnosticos)) {
      const diagnosticosMapeados = body.diagnosticos.map((diag: any) => {
        // Mapear los campos del frontend al esquema
        const diagnosticoMapeado = {
          patientId: diag.patientId || body.patientId || diag.patient, // ✅ Usar patientId del nivel superior
          cuadrante: diag.cuadrante,
          diagnostico: diag.diagnostico,
          etiologia: diag.etiologia,
          fecha: diag.fecha,
          observaciones: diag.observaciones,
          superficie: diag.superficie,
          unidadDental: diag.unidadDental,
          // Campos adicionales para compatibilidad
          date: diag.fecha ? new Date(diag.fecha) : new Date(),
          symptoms: diag.observaciones || diag.sintomas,
          diagnosis: diag.diagnostico,
          notes: diag.observaciones,
          status: 'active'
        };
        
        return new Diagnostico(diagnosticoMapeado);
      });
      
      const savedDiagnosticos = await Diagnostico.insertMany(diagnosticosMapeados);
      
      return NextResponse.json(savedDiagnosticos, { status: 201 });
    }
    
    // Si se envía un diagnóstico individual
    if (body.diagnosticos) {
      // Si viene en el campo diagnosticos pero no es array
      const diagnosticoMapeado = {
        patientId: body.patientId || body.patient,
        cuadrante: body.cuadrante,
        diagnostico: body.diagnostico,
        etiologia: body.etiologia,
        fecha: body.fecha,
        observaciones: body.observaciones,
        superficie: body.superficie,
        unidadDental: body.unidadDental,
        date: body.fecha ? new Date(body.fecha) : new Date(),
        symptoms: body.observaciones || body.sintomas,
        diagnosis: body.diagnostico,
        notes: body.observaciones,
        status: 'active'
      };
      
      const diagnostico = new Diagnostico(diagnosticoMapeado);
      const savedDiagnostico = await diagnostico.save();
      
      return NextResponse.json(savedDiagnostico, { status: 201 });
    }
    
    // Si se envía un diagnóstico individual directamente
    const diagnosticoMapeado = {
      patientId: body.patientId || body.patient,
      cuadrante: body.cuadrante,
      diagnostico: body.diagnostico,
      etiologia: body.etiologia,
      fecha: body.fecha,
      observaciones: body.observaciones,
      superficie: body.superficie,
      unidadDental: body.unidadDental,
      date: body.fecha ? new Date(body.fecha) : new Date(),
      symptoms: body.observaciones || body.sintomas,
      diagnosis: body.diagnostico,
      notes: body.observaciones,
      status: 'active'
    };
    
    const diagnostico = new Diagnostico(diagnosticoMapeado);
    const savedDiagnostico = await diagnostico.save();
    
    return NextResponse.json(savedDiagnostico, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating diagnostico:', error);
    
    // Devolver detalles del error para debugging
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          error: 'Error de validación', 
          details: validationErrors,
          receivedData: body 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const updatedDiagnostico = await Diagnostico.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedDiagnostico) {
      return NextResponse.json(
        { error: 'Diagnóstico no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedDiagnostico);
  } catch (error) {
    console.error('Error updating diagnostico:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
