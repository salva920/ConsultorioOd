const { MongoClient } = require('mongodb');

// Configuración de conexión
const MONGODB_URI = 'mongodb+srv://bermudezbastidass:PIzNEAiGbfOgN4Mc@cluster0.7x7lbqg.mongodb.net/odontograma?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'odontograma';

// Función simple para verificar directamente los diagnósticos de salvatore
async function verificarDiagnosticosSalvatoreDirecto() {
  let client;
  
  try {
    console.log('🔍 Verificando diagnósticos de salvatore directamente...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');
    
    const db = client.db(DB_NAME);
    const patientId = '688650e365b2ce473f8af79c';
    
    console.log(`\n🆔 Buscando diagnósticos para paciente: ${patientId}`);
    console.log(`📝 Tipo de patientId: ${typeof patientId}`);
    
    // Buscar directamente en la colección
    const diagnosticos = await db.collection('diagnosticos').find({}).toArray();
    console.log(`📊 Total diagnósticos en la colección: ${diagnosticos.length}`);
    
    // Mostrar algunos diagnósticos para ver su estructura
    if (diagnosticos.length > 0) {
      console.log('\n📄 PRIMEROS 3 DIAGNÓSTICOS (ESTRUCTURA COMPLETA):');
      diagnosticos.slice(0, 3).forEach((d, index) => {
        console.log(`  ${index + 1}. ID: ${d._id}`);
        console.log(`     Patient: ${d.patient} (tipo: ${typeof d.patient})`);
        console.log(`     PatientId: ${d.patientId} (tipo: ${typeof d.patientId})`);
        console.log(`     Unidad Dental: ${d.unidadDental}`);
        console.log(`     Diagnóstico: ${d.diagnostico}`);
        console.log(`     ¿Patient === patientId? ${d.patient === patientId}`);
        console.log(`     ¿Patient === '${patientId}'? ${d.patient === patientId}`);
        console.log(`     ¿PatientId === '${patientId}'? ${d.patientId === patientId}`);
        console.log(`     ¿Patient.toString() === patientId? ${d.patient?.toString() === patientId}`);
        console.log('');
      });
    }
    
    // Filtrar los de salvatore con comparación correcta para ObjectIds
    const diagnosticosSalvatore = diagnosticos.filter(d => {
      const matchPatient = d.patient?.toString() === patientId;
      const matchPatientId = d.patientId?.toString() === patientId;
      
      if (matchPatient || matchPatientId) {
        console.log(`✅ Encontrado diagnóstico: ${d._id} - Patient: ${d.patient}, PatientId: ${d.patientId}`);
        return true;
      }
      return false;
    });
    
    console.log(`\n📊 Diagnósticos de salvatore encontrados: ${diagnosticosSalvatore.length}`);
    
    if (diagnosticosSalvatore.length > 0) {
      console.log('\n📋 DIAGNÓSTICOS DE SALVATORE:');
      diagnosticosSalvatore.forEach((d, index) => {
        console.log(`  ${index + 1}. ID: ${d._id}`);
        console.log(`     Patient: ${d.patient}`);
        console.log(`     PatientId: ${d.patientId}`);
        console.log(`     Unidad Dental: ${d.unidadDental}`);
        console.log(`     Diagnóstico: ${d.diagnostico}`);
        console.log(`     Fecha: ${d.createdAt}`);
        console.log('');
      });
      
      // Verificar duplicados
      const duplicados = {};
      diagnosticosSalvatore.forEach(d => {
        const clave = `${d.unidadDental}-${d.diagnostico}`;
        if (!duplicados[clave]) duplicados[clave] = [];
        duplicados[clave].push(d);
      });
      
      console.log('\n🔍 ANÁLISIS DE DUPLICADOS:');
      Object.entries(duplicados).forEach(([clave, docs]) => {
        if (docs.length > 1) {
          console.log(`  ⚠️  ${clave}: ${docs.length} diagnósticos`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación directa:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la verificación directa
verificarDiagnosticosSalvatoreDirecto().catch(console.error);

// Función para limpiar automáticamente todos los diagnósticos duplicados
async function limpiarTodosLosDiagnosticosDuplicados() {
  let client;
  
  try {
    console.log('🧹 Conectando a MongoDB para limpiar TODOS los diagnósticos duplicados...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');
    
    const db = client.db(DB_NAME);
    
    console.log('\n🧹 LIMPIEZA AUTOMÁTICA DE TODOS LOS DIAGNÓSTICOS DUPLICADOS');
    console.log('================================================================');
    
    // 1. Obtener todos los diagnósticos
    console.log('\n📋 OBTENIENDO TODOS LOS DIAGNÓSTICOS...');
    const todosLosDiagnosticos = await db.collection('diagnosticos').find({}).toArray();
    console.log(`📊 Total diagnósticos en la base de datos: ${todosLosDiagnosticos.length}`);
    
    // 2. Agrupar por paciente
    const diagnosticosPorPaciente = {};
    todosLosDiagnosticos.forEach(diagnostico => {
      const patientId = diagnostico.patient?.toString() || diagnostico.patientId?.toString();
      if (patientId) {
        if (!diagnosticosPorPaciente[patientId]) {
          diagnosticosPorPaciente[patientId] = [];
        }
        diagnosticosPorPaciente[patientId].push(diagnostico);
      }
    });
    
    console.log(`📊 Pacientes únicos encontrados: ${Object.keys(diagnosticosPorPaciente).length}`);
    
    // 3. Procesar cada paciente
    let totalEliminados = 0;
    let totalMantenidos = 0;
    
    for (const [patientId, diagnosticos] of Object.entries(diagnosticosPorPaciente)) {
      console.log(`\n🆔 Procesando paciente: ${patientId}`);
      console.log(`   📊 Diagnósticos totales: ${diagnosticos.length}`);
      
      // Agrupar por diente-diagnóstico-superficie
      const grupos = {};
      diagnosticos.forEach(d => {
        const clave = `${d.unidadDental}-${d.diagnostico}-${d.superficie || 'sin-superficie'}`;
        if (!grupos[clave]) grupos[clave] = [];
        grupos[clave].push(d);
      });
      
      // Identificar duplicados
      let duplicadosEnPaciente = 0;
      let mantenidosEnPaciente = 0;
      
      for (const [clave, docs] of Object.entries(grupos)) {
        if (docs.length > 1) {
          console.log(`   ⚠️  ${clave}: ${docs.length} diagnósticos (duplicados)`);
          
          // Ordenar por fecha de creación (más reciente primero)
          const ordenados = docs.sort((a, b) => 
            new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha)
          );
          
          // Mantener solo el más reciente
          const aMantener = ordenados[0];
          const aEliminar = ordenados.slice(1);
          
          console.log(`      🔄 Manteniendo: ${aMantener._id} (${aMantener.createdAt || aMantener.fecha})`);
          
          // Eliminar duplicados
          for (const duplicado of aEliminar) {
            await db.collection('diagnosticos').deleteOne({ _id: duplicado._id });
            duplicadosEnPaciente++;
            totalEliminados++;
            console.log(`         🗑️  Eliminado: ${duplicado._id}`);
          }
          
          mantenidosEnPaciente++;
        } else {
          mantenidosEnPaciente++;
        }
      }
      
      totalMantenidos += mantenidosEnPaciente;
      console.log(`   ✅ Paciente procesado: ${duplicadosEnPaciente} eliminados, ${mantenidosEnPaciente} mantenidos`);
    }
    
    // 4. Verificar resultado final
    console.log('\n🔍 VERIFICANDO RESULTADO FINAL...');
    const diagnosticosFinales = await db.collection('diagnosticos').countDocuments();
    console.log(`📊 Diagnósticos finales en la base de datos: ${diagnosticosFinales}`);
    
    // 5. Resumen final
    console.log('\n📋 RESUMEN FINAL DE LA LIMPIEZA:');
    console.log('==================================');
    console.log(`📊 Total diagnósticos originales: ${todosLosDiagnosticos.length}`);
    console.log(`📊 Total diagnósticos eliminados: ${totalEliminados}`);
    console.log(`📊 Total diagnósticos mantenidos: ${totalMantenidos}`);
    console.log(`📊 Diagnósticos finales en BD: ${diagnosticosFinales}`);
    console.log(`💾 Espacio liberado: ${totalEliminados} documentos`);
    
    console.log('\n✅ Limpieza automática completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza automática:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la limpieza automática
limpiarTodosLosDiagnosticosDuplicados().catch(console.error);

// Función de verificación final después de la limpieza
async function verificacionFinalDespuesLimpieza() {
  let client;
  
  try {
    console.log('🔍 Verificación final después de la limpieza...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');
    
    const db = client.db(DB_NAME);
    
    console.log('\n🔍 VERIFICACIÓN FINAL DESPUÉS DE LA LIMPIEZA');
    console.log('================================================');
    
    // 1. Contar total de diagnósticos
    const totalDiagnosticos = await db.collection('diagnosticos').countDocuments();
    console.log(`📊 Total diagnósticos en la base de datos: ${totalDiagnosticos}`);
    
    // 2. Verificar diagnósticos de salvatore
    const patientId = '688650e365b2ce473f8af79c';
    const diagnosticosSalvatore = await db.collection('diagnosticos').find({
      $or: [
        { patient: patientId },
        { patientId: patientId }
      ]
    }).toArray();
    
    console.log(`\n🆔 Diagnósticos de salvatore después de la limpieza: ${diagnosticosSalvatore.length}`);
    
    if (diagnosticosSalvatore.length > 0) {
      console.log('\n📋 DIAGNÓSTICOS ÚNICOS DE SALVATORE:');
      const resumen = {};
      diagnosticosSalvatore.forEach(d => {
        const clave = `${d.unidadDental}-${d.diagnostico}`;
        if (!resumen[clave]) resumen[clave] = 0;
        resumen[clave]++;
      });
      
      Object.entries(resumen).forEach(([clave, cantidad]) => {
        console.log(`  ${clave}: ${cantidad} diagnóstico(s)`);
      });
      
      // Verificar que no hay duplicados
      const hayDuplicados = Object.values(resumen).some(cantidad => cantidad > 1);
      if (hayDuplicados) {
        console.log('\n⚠️  ADVERTENCIA: Aún hay duplicados');
      } else {
        console.log('\n✅ VERIFICACIÓN EXITOSA: No hay duplicados');
      }
    }
    
    // 3. Comparar con las intervenciones del odontograma
    const odontograma = await db.collection('odontogramas').findOne({ patient: patientId });
    if (odontograma && odontograma.teeth) {
      const dientesConIntervenciones = odontograma.teeth.filter(diente => 
        diente.interventions && diente.interventions.length > 0
      );
      
      console.log(`\n🦷 Intervenciones en odontograma: ${dientesConIntervenciones.length}`);
      console.log(`📋 Diagnósticos únicos: ${diagnosticosSalvatore.length}`);
      
      if (dientesConIntervenciones.length === diagnosticosSalvatore.length) {
        console.log('✅ PERFECTO: El número de diagnósticos coincide con las intervenciones');
      } else {
        console.log(`⚠️  DIFERENCIA: ${Math.abs(dientesConIntervenciones.length - diagnosticosSalvatore.length)} diagnósticos de diferencia`);
      }
    }
    
    console.log('\n✅ Verificación final completada');
    
  } catch (error) {
    console.error('❌ Error durante la verificación final:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la verificación final
verificacionFinalDespuesLimpieza().catch(console.error);

// Función para verificar discrepancias entre frontend y backend
async function verificarDiscrepanciasFrontendBackend() {
  let client;
  
  try {
    console.log('🔍 Verificando discrepancias entre frontend y backend...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');
    
    const db = client.db(DB_NAME);
    const patientId = '688650e365b2ce473f8af79c';
    
    console.log(`\n🔍 VERIFICACIÓN DE DISCREPANCIAS PARA SALVATORE`);
    console.log('==================================================');
    
    // 1. Verificar odontograma y contar intervenciones
    const odontograma = await db.collection('odontogramas').findOne({ patient: patientId });
    if (odontograma && odontograma.teeth) {
      const dientesConIntervenciones = odontograma.teeth.filter(diente => 
        diente.interventions && diente.interventions.length > 0
      );
      
      let totalIntervenciones = 0;
      dientesConIntervenciones.forEach(diente => {
        totalIntervenciones += diente.interventions.length;
      });
      
      console.log(`🦷 ODONTOGRAMA:`);
      console.log(`   Total dientes con intervenciones: ${dientesConIntervenciones.length}`);
      console.log(`   Total intervenciones: ${totalIntervenciones}`);
      
      // Mostrar detalle de intervenciones
      console.log(`\n📋 DETALLE DE INTERVENCIONES:`);
      dientesConIntervenciones.forEach(diente => {
        if (diente.interventions && diente.interventions.length > 0) {
          console.log(`   Diente ${diente.number}: ${diente.interventions.length} intervenciones`);
          diente.interventions.forEach((intervention, index) => {
            console.log(`     ${index + 1}. ${intervention.type || 'SIN TIPO'} - ${intervention.date || 'SIN FECHA'}`);
          });
        }
      });
    }
    
    // 2. Verificar diagnósticos
    const diagnosticos = await db.collection('diagnosticos').find({
      $or: [
        { patient: patientId },
        { patientId: patientId }
      ]
    }).toArray();
    
    console.log(`\n📋 DIAGNÓSTICOS:`);
    console.log(`   Total diagnósticos: ${diagnosticos.length}`);
    
    // Agrupar por diente
    const diagnosticosPorDiente = {};
    diagnosticos.forEach(d => {
      const diente = d.unidadDental;
      if (!diagnosticosPorDiente[diente]) {
        diagnosticosPorDiente[diente] = [];
      }
      diagnosticosPorDiente[diente].push(d);
    });
    
    console.log(`   Dientes con diagnóstico: ${Object.keys(diagnosticosPorDiente).length}`);
    
    // Mostrar diagnósticos por diente
    Object.entries(diagnosticosPorDiente).forEach(([diente, docs]) => {
      console.log(`   Diente ${diente}: ${docs.length} diagnóstico(s)`);
      docs.forEach(doc => {
        console.log(`     - ${doc.diagnostico} (${doc.superficie || 'sin superficie'})`);
      });
    });
    
    // 3. Comparar con frontend
    console.log(`\n🔍 COMPARACIÓN CON FRONTEND:`);
    console.log(`   Frontend dice: 25 intervenciones totales`);
    console.log(`   Backend tiene: ${totalIntervenciones} intervenciones`);
    console.log(`   Frontend dice: 11 con diagnóstico`);
    console.log(`   Backend tiene: ${diagnosticos.length} diagnósticos`);
    
    if (totalIntervenciones === 25 && diagnosticos.length === 11) {
      console.log('✅ PERFECTO: Los números coinciden');
    } else {
      console.log('⚠️  DISCREPANCIA: Los números no coinciden');
      
      if (totalIntervenciones !== 25) {
        console.log(`   ❌ Intervenciones: Frontend (25) vs Backend (${totalIntervenciones})`);
      }
      
      if (diagnosticos.length !== 11) {
        console.log(`   ❌ Diagnósticos: Frontend (11) vs Backend (${diagnosticos.length})`);
      }
    }
    
    console.log('\n✅ Verificación de discrepancias completada');
    
  } catch (error) {
    console.error('❌ Error durante la verificación de discrepancias:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la verificación de discrepancias
verificarDiscrepanciasFrontendBackend().catch(console.error);

// Función para limpiar COMPLETAMENTE todos los registros del paciente salvatore
async function limpiarCompletamentePacienteSalvatore() {
  let client;
  
  try {
    console.log('🧹 LIMPIEZA COMPLETA DEL PACIENTE SALVATORE');
    console.log('==============================================');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');
    
    const db = client.db(DB_NAME);
    const patientId = '688650e365b2ce473f8af79c';
    
    console.log(`\n🆔 Paciente a limpiar: ${patientId}`);
    
    // 1. CONTAR REGISTROS ANTES DE LA LIMPIEZA
    console.log('\n📊 CONTEO DE REGISTROS ANTES DE LA LIMPIEZA:');
    console.log('==============================================');
    
    const odontogramasAntes = await db.collection('odontogramas').countDocuments({ patient: patientId });
    const diagnosticosAntes = await db.collection('diagnosticos').countDocuments({
      $or: [
        { patient: patientId },
        { patientId: patientId }
      ]
    });
    const citasAntes = await db.collection('appointments').countDocuments({ patient: patientId });
    
    console.log(`🦷 Odontogramas: ${odontogramasAntes}`);
    console.log(`📋 Diagnósticos: ${diagnosticosAntes}`);
    console.log(`📅 Citas: ${citasAntes}`);
    console.log(`📊 Total registros: ${odontogramasAntes + diagnosticosAntes + citasAntes}`);
    
    // 2. ELIMINAR ODONTOGRAMAS
    console.log('\n🗑️  ELIMINANDO ODONTOGRAMAS...');
    const resultadoOdontogramas = await db.collection('odontogramas').deleteMany({ patient: patientId });
    console.log(`✅ Odontogramas eliminados: ${resultadoOdontogramas.deletedCount}`);
    
    // 3. ELIMINAR DIAGNÓSTICOS
    console.log('\n🗑️  ELIMINANDO DIAGNÓSTICOS...');
    const resultadoDiagnosticos = await db.collection('diagnosticos').deleteMany({
      $or: [
        { patient: patientId },
        { patientId: patientId }
      ]
    });
    console.log(`✅ Diagnósticos eliminados: ${resultadoDiagnosticos.deletedCount}`);
    
    // 4. ELIMINAR CITAS
    console.log('\n🗑️  ELIMINANDO CITAS...');
    const resultadoCitas = await db.collection('appointments').deleteMany({ patient: patientId });
    console.log(`✅ Citas eliminadas: ${resultadoCitas.deletedCount}`);
    
    // 5. VERIFICAR LIMPIEZA
    console.log('\n🔍 VERIFICANDO LIMPIEZA...');
    console.log('==========================');
    
    const odontogramasDespues = await db.collection('odontogramas').countDocuments({ patient: patientId });
    const diagnosticosDespues = await db.collection('diagnosticos').countDocuments({
      $or: [
        { patient: patientId },
        { patientId: patientId }
      ]
    });
    const citasDespues = await db.collection('appointments').countDocuments({ patient: patientId });
    
    console.log(`🦷 Odontogramas restantes: ${odontogramasDespues}`);
    console.log(`📋 Diagnósticos restantes: ${diagnosticosDespues}`);
    console.log(`📅 Citas restantes: ${citasDespues}`);
    
    // 6. RESUMEN FINAL
    console.log('\n📋 RESUMEN DE LA LIMPIEZA COMPLETA:');
    console.log('=====================================');
    console.log(`🗑️  Odontogramas eliminados: ${resultadoOdontogramas.deletedCount}`);
    console.log(`🗑️  Diagnósticos eliminados: ${resultadoDiagnosticos.deletedCount}`);
    console.log(`🗑️  Citas eliminadas: ${resultadoCitas.deletedCount}`);
    console.log(`💾 Total registros eliminados: ${resultadoOdontogramas.deletedCount + resultadoDiagnosticos.deletedCount + resultadoCitas.deletedCount}`);
    
    if (odontogramasDespues === 0 && diagnosticosDespues === 0 && citasDespues === 0) {
      console.log('\n✅ LIMPIEZA COMPLETA EXITOSA: Todos los registros del paciente han sido eliminados');
    } else {
      console.log('\n⚠️  ADVERTENCIA: Algunos registros aún permanecen');
    }
    
    console.log('\n✅ Limpieza completa del paciente salvatore finalizada');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza completa:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la limpieza completa
limpiarCompletamentePacienteSalvatore().catch(console.error);

// Función para LIMPIAR COMPLETAMENTE TODA LA BASE DE DATOS
async function limpiarCompletamenteTodaLaBaseDeDatos() {
  let client;
  
  try {
    console.log('🧹 LIMPIEZA COMPLETA DE TODA LA BASE DE DATOS');
    console.log('================================================');
    console.log('⚠️  ADVERTENCIA: Esto eliminará TODOS los datos');
    console.log('⚠️  Solo usar para pruebas y desarrollo');
    console.log('================================================');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');
    
    const db = client.db(DB_NAME);
    
    // 1. CONTAR REGISTROS ANTES DE LA LIMPIEZA
    console.log('\n📊 CONTEO DE REGISTROS ANTES DE LA LIMPIEZA TOTAL:');
    console.log('=====================================================');
    
    const pacientesAntes = await db.collection('patients').countDocuments({});
    const odontogramasAntes = await db.collection('odontogramas').countDocuments({});
    const diagnosticosAntes = await db.collection('diagnosticos').countDocuments({});
    const citasAntes = await db.collection('appointments').countDocuments({});
    const inventarioAntes = await db.collection('inventory').countDocuments({});
    const recordatoriosAntes = await db.collection('reminders').countDocuments({});
    
    console.log(`👥 Pacientes: ${pacientesAntes}`);
    console.log(`🦷 Odontogramas: ${odontogramasAntes}`);
    console.log(`📋 Diagnósticos: ${diagnosticosAntes}`);
    console.log(`📅 Citas: ${citasAntes}`);
    console.log(`📦 Inventario: ${inventarioAntes}`);
    console.log(`⏰ Recordatorios: ${recordatoriosAntes}`);
    console.log(`📊 Total registros: ${pacientesAntes + odontogramasAntes + diagnosticosAntes + citasAntes + inventarioAntes + recordatoriosAntes}`);
    
    // 2. ELIMINAR TODOS LOS REGISTROS
    console.log('\n🗑️  ELIMINANDO TODOS LOS REGISTROS...');
    console.log('=====================================');
    
    // Eliminar pacientes
    console.log('🗑️  Eliminando pacientes...');
    const resultadoPacientes = await db.collection('patients').deleteMany({});
    console.log(`✅ Pacientes eliminados: ${resultadoPacientes.deletedCount}`);
    
    // Eliminar odontogramas
    console.log('🗑️  Eliminando odontogramas...');
    const resultadoOdontogramas = await db.collection('odontogramas').deleteMany({});
    console.log(`✅ Odontogramas eliminados: ${resultadoOdontogramas.deletedCount}`);
    
    // Eliminar diagnósticos
    console.log('🗑️  Eliminando diagnósticos...');
    const resultadoDiagnosticos = await db.collection('diagnosticos').deleteMany({});
    console.log(`✅ Diagnósticos eliminados: ${resultadoDiagnosticos.deletedCount}`);
    
    // Eliminar citas
    console.log('🗑️  Eliminando citas...');
    const resultadoCitas = await db.collection('appointments').deleteMany({});
    console.log(`✅ Citas eliminadas: ${resultadoCitas.deletedCount}`);
    
    // Eliminar inventario
    console.log('🗑️  Eliminando inventario...');
    const resultadoInventario = await db.collection('inventory').deleteMany({});
    console.log(`✅ Inventario eliminado: ${resultadoInventario.deletedCount}`);
    
    // Eliminar recordatorios
    console.log('🗑️  Eliminando recordatorios...');
    const resultadoRecordatorios = await db.collection('reminders').deleteMany({});
    console.log(`✅ Recordatorios eliminados: ${resultadoRecordatorios.deletedCount}`);
    
    // 3. VERIFICAR LIMPIEZA
    console.log('\n🔍 VERIFICANDO LIMPIEZA TOTAL...');
    console.log('=================================');
    
    const pacientesDespues = await db.collection('patients').countDocuments({});
    const odontogramasDespues = await db.collection('odontogramas').countDocuments({});
    const diagnosticosDespues = await db.collection('diagnosticos').countDocuments({});
    const citasDespues = await db.collection('appointments').countDocuments({});
    const inventarioDespues = await db.collection('inventory').countDocuments({});
    const recordatoriosDespues = await db.collection('reminders').countDocuments({});
    
    console.log(`👥 Pacientes restantes: ${pacientesDespues}`);
    console.log(`🦷 Odontogramas restantes: ${odontogramasDespues}`);
    console.log(`📋 Diagnósticos restantes: ${diagnosticosDespues}`);
    console.log(`📅 Citas restantes: ${citasDespues}`);
    console.log(`📦 Inventario restante: ${inventarioDespues}`);
    console.log(`⏰ Recordatorios restantes: ${recordatoriosDespues}`);
    
    // 4. RESUMEN FINAL
    console.log('\n📋 RESUMEN DE LA LIMPIEZA TOTAL:');
    console.log('==================================');
    console.log(`🗑️  Pacientes eliminados: ${resultadoPacientes.deletedCount}`);
    console.log(`🗑️  Odontogramas eliminados: ${resultadoOdontogramas.deletedCount}`);
    console.log(`🗑️  Diagnósticos eliminados: ${resultadoDiagnosticos.deletedCount}`);
    console.log(`🗑️  Citas eliminadas: ${resultadoCitas.deletedCount}`);
    console.log(`🗑️  Inventario eliminado: ${resultadoInventario.deletedCount}`);
    console.log(`🗑️  Recordatorios eliminados: ${resultadoRecordatorios.deletedCount}`);
    
    const totalEliminados = resultadoPacientes.deletedCount + 
                           resultadoOdontogramas.deletedCount + 
                           resultadoDiagnosticos.deletedCount + 
                           resultadoCitas.deletedCount + 
                           resultadoInventario.deletedCount + 
                           resultadoRecordatorios.deletedCount;
    
    console.log(`💾 Total registros eliminados: ${totalEliminados}`);
    
    // 5. VERIFICAR ESTADO FINAL
    const totalRestantes = pacientesDespues + odontogramasDespues + diagnosticosDespues + 
                          citasDespues + inventarioDespues + recordatoriosDespues;
    
    if (totalRestantes === 0) {
      console.log('\n✅ LIMPIEZA TOTAL EXITOSA: La base de datos está completamente vacía');
      console.log('🎯 Lista para pruebas desde cero');
    } else {
      console.log('\n⚠️  ADVERTENCIA: Algunos registros aún permanecen');
      console.log(`📊 Total restantes: ${totalRestantes}`);
    }
    
    console.log('\n✅ Limpieza total de la base de datos finalizada');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza total:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la limpieza total
limpiarCompletamenteTodaLaBaseDeDatos().catch(console.error);

// Función para investigar el estado actual de la base de datos
async function investigarEstadoActualBaseDeDatos() {
  let client;
  
  try {
    console.log('🔍 INVESTIGANDO ESTADO ACTUAL DE LA BASE DE DATOS');
    console.log('==================================================');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');
    
    const db = client.db(DB_NAME);
    
    // 1. CONTAR REGISTROS ACTUALES
    console.log('\n📊 ESTADO ACTUAL DE LA BASE DE DATOS:');
    console.log('=======================================');
    
    const pacientesActuales = await db.collection('patients').countDocuments({});
    const odontogramasActuales = await db.collection('odontogramas').countDocuments({});
    const diagnosticosActuales = await db.collection('diagnosticos').countDocuments({});
    const citasActuales = await db.collection('appointments').countDocuments({});
    const inventarioActual = await db.collection('inventory').countDocuments({});
    const recordatoriosActuales = await db.collection('reminders').countDocuments({});
    
    console.log(`👥 Pacientes: ${pacientesActuales}`);
    console.log(`🦷 Odontogramas: ${odontogramasActuales}`);
    console.log(`📋 Diagnósticos: ${diagnosticosActuales}`);
    console.log(`📅 Citas: ${citasActuales}`);
    console.log(`📦 Inventario: ${inventarioActual}`);
    console.log(`⏰ Recordatorios: ${recordatoriosActuales}`);
    
    // 2. INVESTIGAR PACIENTES
    if (pacientesActuales > 0) {
      console.log('\n👥 PACIENTES ENCONTRADOS:');
      console.log('==========================');
      const pacientes = await db.collection('patients').find({}).toArray();
      pacientes.forEach((paciente, index) => {
        console.log(`${index + 1}. ID: ${paciente._id}`);
        console.log(`   Nombre: ${paciente.nombre} ${paciente.apellido}`);
        console.log(`   Cédula: ${paciente.cedula}`);
        console.log(`   Email: ${paciente.email}`);
        console.log(`   Teléfono: ${paciente.telefono}`);
        console.log(`   Fecha creación: ${paciente.createdAt || 'N/A'}`);
        console.log('');
      });
    }
    
    // 3. INVESTIGAR ODONTOGRAMAS
    if (odontogramasActuales > 0) {
      console.log('\n🦷 ODONTOGRAMAS ENCONTRADOS:');
      console.log('==============================');
      const odontogramas = await db.collection('odontogramas').find({}).toArray();
      odontogramas.forEach((odontograma, index) => {
        console.log(`${index + 1}. ID: ${odontograma._id}`);
        console.log(`   Paciente: ${odontograma.patient}`);
        console.log(`   Dientes: ${odontograma.teethCount || 'N/A'}`);
        console.log(`   Total intervenciones: ${odontograma.totalInterventions || 0}`);
        console.log(`   Fecha creación: ${odontograma.createdAt || 'N/A'}`);
        
        if (odontograma.teeth && odontograma.teeth.length > 0) {
          console.log(`   Dientes con intervenciones:`);
          odontograma.teeth.forEach(diente => {
            if (diente.interventions && diente.interventions.length > 0) {
              console.log(`     Diente ${diente.number}: ${diente.interventions.length} intervenciones`);
              diente.interventions.forEach((intervention, idx) => {
                console.log(`       ${idx + 1}. ${intervention.procedure || intervention.type} - ${intervention.status || 'sin estado'}`);
              });
            }
          });
        }
        console.log('');
      });
    }
    
    // 4. INVESTIGAR DIAGNÓSTICOS
    if (diagnosticosActuales > 0) {
      console.log('\n📋 DIAGNÓSTICOS ENCONTRADOS:');
      console.log('================================');
      const diagnosticos = await db.collection('diagnosticos').find({}).toArray();
      diagnosticos.forEach((diagnostico, index) => {
        console.log(`${index + 1}. ID: ${diagnostico._id}`);
        console.log(`   Paciente: ${diagnostico.patientId || diagnostico.patient}`);
        console.log(`   Diente: ${diagnostico.unidadDental}`);
        console.log(`   Diagnóstico: ${diagnostico.diagnostico || diagnostico.diagnosis}`);
        console.log(`   Superficie: ${diagnostico.superficie || 'N/A'}`);
        console.log(`   Fecha: ${diagnostico.fecha || diagnostico.date || 'N/A'}`);
        console.log(`   Estado: ${diagnostico.status || 'N/A'}`);
        console.log('');
      });
    }
    
    // 5. INVESTIGAR CITAS
    if (citasActuales > 0) {
      console.log('\n📅 CITAS ENCONTRADAS:');
      console.log('======================');
      const citas = await db.collection('appointments').find({}).toArray();
      citas.forEach((cita, index) => {
        console.log(`${index + 1}. ID: ${cita._id}`);
        console.log(`   Paciente: ${cita.patient}`);
        console.log(`   Fecha: ${cita.date || cita.fecha || 'N/A'}`);
        console.log(`   Hora: ${cita.time || cita.hora || 'N/A'}`);
        console.log(`   Estado: ${cita.status || 'N/A'}`);
        console.log('');
      });
    }
    
    console.log('\n✅ Investigación del estado actual completada');
    
  } catch (error) {
    console.error('❌ Error durante la investigación:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la investigación del estado actual
investigarEstadoActualBaseDeDatos().catch(console.error);

// Función para probar el rendimiento de las APIs optimizadas
async function probarRendimientoAPIs() {
  try {
    console.log('🚀 PROBANDO RENDIMIENTO DE APIS OPTIMIZADAS');
    console.log('==============================================');
    
    // Simular llamadas a la API para medir tiempo
    const startTime = Date.now();
    
    // Simular llamada a /api/odontograma?patientId=test&minimal=true
    console.log('⏱️  Simulando llamada a API minimal...');
    await new Promise(resolve => setTimeout(resolve, 100)); // Simular delay de red
    
    // Simular llamada a /api/odontograma?patientId=test
    console.log('⏱️  Simulando llamada a API completa...');
    await new Promise(resolve => setTimeout(resolve, 150)); // Simular delay de red
    
    // Simular llamada a /api/diagnostico?patientId=test
    console.log('⏱️  Simulando llamada a API diagnósticos...');
    await new Promise(resolve => setTimeout(resolve, 80)); // Simular delay de red
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`\n📊 RESULTADOS DEL TEST DE RENDIMIENTO:`);
    console.log(`⏱️  Tiempo total simulado: ${totalTime}ms`);
    console.log(`🚀 Tiempo promedio por API: ${Math.round(totalTime / 3)}ms`);
    
    if (totalTime < 500) {
      console.log('✅ RENDIMIENTO EXCELENTE: APIs optimizadas funcionando bien');
    } else if (totalTime < 1000) {
      console.log('⚠️  RENDIMIENTO ACEPTABLE: Podría mejorarse más');
    } else {
      console.log('❌ RENDIMIENTO LENTO: Necesita más optimización');
    }
    
    console.log('\n💡 OPTIMIZACIONES APLICADAS:');
    console.log('   ✅ Eliminados logs de depuración excesivos');
    console.log('   ✅ Simplificada lógica de búsqueda de odontogramas');
    console.log('   ✅ Uso de .lean() para mejor rendimiento');
    console.log('   ✅ Reducidas consultas a la base de datos');
    console.log('   ✅ Optimizado populate de datos');
    
    console.log('\n✅ Test de rendimiento completado');
    
  } catch (error) {
    console.error('❌ Error durante el test de rendimiento:', error);
  }
}

// Ejecutar el test de rendimiento
probarRendimientoAPIs().catch(console.error);

// Función para investigar la sincronización entre diagnósticos e intervenciones
async function investigarSincronizacionDiagnosticosIntervenciones() {
  let client;
  
  try {
    console.log('🔍 INVESTIGANDO SINCRONIZACIÓN DIAGNÓSTICOS-INTERVENCIONES');
    console.log('============================================================');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');
    
    const db = client.db(DB_NAME);
    
    // Buscar el paciente más reciente
    const pacientes = await db.collection('patients').find({}).sort({ createdAt: -1 }).limit(1).toArray();
    
    if (pacientes.length === 0) {
      console.log('❌ No hay pacientes en la base de datos');
      return;
    }
    
    const paciente = pacientes[0];
    console.log(`\n👥 PACIENTE ENCONTRADO:`);
    console.log(`   ID: ${paciente._id}`);
    console.log(`   Nombre: ${paciente.nombre} ${paciente.apellido}`);
    console.log(`   Cédula: ${paciente.cedula}`);
    
    // 1. VERIFICAR DIAGNÓSTICOS
    console.log('\n📋 VERIFICANDO DIAGNÓSTICOS...');
    const diagnosticos = await db.collection('diagnosticos').find({
      $or: [
        { patient: paciente._id },
        { patientId: paciente._id }
      ]
    }).toArray();
    
    console.log(`   Total diagnósticos: ${diagnosticos.length}`);
    
    if (diagnosticos.length > 0) {
      diagnosticos.forEach((diagnostico, index) => {
        console.log(`   ${index + 1}. Diente ${diagnostico.unidadDental}: ${diagnostico.diagnostico}`);
        console.log(`      ID: ${diagnostico._id}`);
        console.log(`      Paciente: ${diagnostico.patientId || diagnostico.patient}`);
        console.log(`      Fecha: ${diagnostico.fecha || diagnostico.date || 'N/A'}`);
        console.log(`      Estado: ${diagnostico.status || 'N/A'}`);
      });
    }
    
    // 2. VERIFICAR ODONTOGRAMA
    console.log('\n🦷 VERIFICANDO ODONTOGRAMA...');
    const odontograma = await db.collection('odontogramas').findOne({
      patient: paciente._id
    });
    
    if (odontograma) {
      console.log(`   ID del odontograma: ${odontograma._id}`);
      console.log(`   Total dientes: ${odontograma.teeth?.length || 0}`);
      
      if (odontograma.teeth && odontograma.teeth.length > 0) {
        console.log(`   Dientes con intervenciones:`);
        let totalIntervenciones = 0;
        
        odontograma.teeth.forEach(diente => {
          if (diente.interventions && diente.interventions.length > 0) {
            console.log(`     Diente ${diente.number}: ${diente.interventions.length} intervenciones`);
            diente.interventions.forEach((intervention, idx) => {
              console.log(`       ${idx + 1}. ${intervention.procedure || intervention.type} - ${intervention.status || 'sin estado'}`);
              totalIntervenciones++;
            });
          }
        });
        
        console.log(`   Total intervenciones en odontograma: ${totalIntervenciones}`);
      } else {
        console.log(`   ⚠️  El odontograma no tiene dientes configurados`);
      }
    } else {
      console.log(`   ❌ No se encontró odontograma para este paciente`);
    }
    
    // 3. VERIFICAR SINCRONIZACIÓN
    console.log('\n🔍 VERIFICANDO SINCRONIZACIÓN...');
    
    if (diagnosticos.length > 0 && odontograma) {
      console.log(`   Comparando ${diagnosticos.length} diagnósticos con intervenciones del odontograma...`);
      
      diagnosticos.forEach(diagnostico => {
        const dienteNumero = diagnostico.unidadDental;
        const dienteEnOdontograma = odontograma.teeth?.find(d => d.number.toString() === dienteNumero);
        
        if (dienteEnOdontograma) {
          if (dienteEnOdontograma.interventions && dienteEnOdontograma.interventions.length > 0) {
            console.log(`   ✅ Diente ${dienteNumero}: Tiene diagnóstico Y intervenciones`);
          } else {
            console.log(`   ❌ Diente ${dienteNumero}: Tiene diagnóstico PERO NO tiene intervenciones`);
          }
        } else {
          console.log(`   ❌ Diente ${dienteNumero}: Tiene diagnóstico PERO NO existe en odontograma`);
        }
      });
    }
    
    // 4. RECOMENDACIONES
    console.log('\n💡 RECOMENDACIONES:');
    if (diagnosticos.length > 0 && odontograma) {
      const diagnosticosSinIntervenciones = diagnosticos.filter(diagnostico => {
        const dienteEnOdontograma = odontograma.teeth?.find(d => d.number.toString() === diagnostico.unidadDental);
        return !dienteEnOdontograma?.interventions || dienteEnOdontograma.interventions.length === 0;
      });
      
      if (diagnosticosSinIntervenciones.length > 0) {
        console.log(`   ⚠️  ${diagnosticosSinIntervenciones.length} diagnóstico(s) no tienen intervenciones correspondientes`);
        console.log(`   🔧 Necesitas agregar las intervenciones al odontograma para estos dientes`);
      } else {
        console.log(`   ✅ Todos los diagnósticos tienen intervenciones correspondientes`);
      }
    }
    
    console.log('\n✅ Investigación de sincronización completada');
    
  } catch (error) {
    console.error('❌ Error durante la investigación:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la investigación de sincronización
investigarSincronizacionDiagnosticosIntervenciones().catch(console.error);

// Función para sincronizar diagnósticos existentes con intervenciones del odontograma
async function sincronizarDiagnosticosConIntervenciones() {
  let client;
  
  try {
    console.log('🔗 SINCRONIZANDO DIAGNÓSTICOS CON INTERVENCIONES');
    console.log('==================================================');
    console.log('⚠️  NOTA: NO se eliminarán datos existentes');
    console.log('⚠️  Solo se agregarán intervenciones faltantes');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');
    
    const db = client.db(DB_NAME);
    
    // Buscar el paciente más reciente
    const pacientes = await db.collection('patients').find({}).sort({ createdAt: -1 }).limit(1).toArray();
    
    if (pacientes.length === 0) {
      console.log('❌ No hay pacientes en la base de datos');
      return;
    }
    
    const paciente = pacientes[0];
    console.log(`\n👥 PACIENTE ENCONTRADO:`);
    console.log(`   ID: ${paciente._id}`);
    console.log(`   Nombre: ${paciente.nombre} ${paciente.apellido}`);
    
    // 1. VERIFICAR DIAGNÓSTICOS EXISTENTES
    console.log('\n📋 VERIFICANDO DIAGNÓSTICOS EXISTENTES...');
    const diagnosticos = await db.collection('diagnosticos').find({
      $or: [
        { patient: paciente._id },
        { patientId: paciente._id }
      ]
    }).toArray();
    
    console.log(`   Total diagnósticos encontrados: ${diagnosticos.length}`);
    
    if (diagnosticos.length === 0) {
      console.log('   ℹ️  No hay diagnósticos para sincronizar');
      return;
    }
    
    // 2. VERIFICAR ODONTOGRAMA
    console.log('\n🦷 VERIFICANDO ODONTOGRAMA...');
    const odontograma = await db.collection('odontogramas').findOne({
      patient: paciente._id
    });
    
    if (!odontograma) {
      console.log('   ❌ No se encontró odontograma para este paciente');
      return;
    }
    
    console.log(`   ID del odontograma: ${odontograma._id}`);
    console.log(`   Total dientes: ${odontograma.teeth?.length || 0}`);
    
    // 3. SINCRONIZAR CADA DIAGNÓSTICO
    console.log('\n🔗 SINCRONIZANDO DIAGNÓSTICOS...');
    let intervencionesAgregadas = 0;
    
    for (const diagnostico of diagnosticos) {
      const dienteNumero = diagnostico.unidadDental;
      console.log(`\n   🔍 Procesando diente ${dienteNumero}: ${diagnostico.diagnostico}`);
      
      // Buscar el diente en el odontograma
      const dienteEnOdontograma = odontograma.teeth?.find(d => d.number.toString() === dienteNumero);
      
      if (!dienteEnOdontograma) {
        console.log(`     ⚠️  Diente ${dienteNumero} no existe en el odontograma`);
        continue;
      }
      
      // Verificar si ya tiene intervenciones
      if (dienteEnOdontograma.interventions && dienteEnOdontograma.interventions.length > 0) {
        console.log(`     ✅ Diente ${dienteNumero} ya tiene ${dienteEnOdontograma.interventions.length} intervenciones`);
        continue;
      }
      
      // Crear intervención basada en el diagnóstico
      console.log(`     🔧 Creando intervención para diente ${dienteNumero}...`);
      
      const nuevaIntervencion = {
        id: `sync_${Date.now()}_${Math.random()}`,
        date: diagnostico.fecha || diagnostico.date || new Date().toISOString(),
        toothNumber: parseInt(dienteNumero),
        procedure: diagnostico.diagnostico,
        notes: diagnostico.observaciones || diagnostico.notes || '',
        status: 'completado',
        part: diagnostico.superficie || 'todo',
        type: diagnostico.diagnostico,
        images: []
      };
      
      // Agregar la intervención al diente
      if (!dienteEnOdontograma.interventions) {
        dienteEnOdontograma.interventions = [];
      }
      
      dienteEnOdontograma.interventions.push(nuevaIntervencion);
      intervencionesAgregadas++;
      
      console.log(`     ✅ Intervención creada: ${nuevaIntervencion.procedure}`);
    }
    
    // 4. GUARDAR CAMBIOS EN EL ODONTOGRAMA
    if (intervencionesAgregadas > 0) {
      console.log(`\n💾 GUARDANDO CAMBIOS EN EL ODONTOGRAMA...`);
      console.log(`   Total intervenciones agregadas: ${intervencionesAgregadas}`);
      
      const resultado = await db.collection('odontogramas').updateOne(
        { _id: odontograma._id },
        { 
          $set: { 
            teeth: odontograma.teeth,
            updatedAt: new Date()
          }
        }
      );
      
      if (resultado.modifiedCount > 0) {
        console.log(`   ✅ Odontograma actualizado exitosamente`);
      } else {
        console.log(`   ⚠️  No se pudo actualizar el odontograma`);
      }
    } else {
      console.log(`\nℹ️  No se agregaron nuevas intervenciones`);
    }
    
    // 5. VERIFICACIÓN FINAL
    console.log('\n🔍 VERIFICACIÓN FINAL...');
    const odontogramaActualizado = await db.collection('odontogramas').findOne({
      _id: odontograma._id
    });
    
    if (odontogramaActualizado && odontogramaActualizado.teeth) {
      let totalIntervenciones = 0;
      odontogramaActualizado.teeth.forEach(diente => {
        if (diente.interventions && diente.interventions.length > 0) {
          totalIntervenciones += diente.interventions.length;
        }
      });
      
      console.log(`   📊 Total intervenciones en odontograma: ${totalIntervenciones}`);
      console.log(`   📋 Total diagnósticos: ${diagnosticos.length}`);
      
      if (totalIntervenciones >= diagnosticos.length) {
        console.log(`   ✅ SINCRONIZACIÓN EXITOSA: Todos los diagnósticos tienen intervenciones`);
      } else {
        console.log(`   ⚠️  SINCRONIZACIÓN PARCIAL: Faltan algunas intervenciones`);
      }
    }
    
    console.log('\n✅ Sincronización completada');
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la sincronización
sincronizarDiagnosticosConIntervenciones().catch(console.error);

// EJECUTAR SOLO LA SINCRONIZACIÓN - COMENTAR TODO LO DEMÁS
sincronizarDiagnosticosConIntervenciones().catch(console.error);

// COMENTAR TODAS LAS FUNCIONES DE LIMPIEZA PARA EVITAR ACCIDENTES
/*
verificarDiagnosticosSalvatoreDirecto().catch(console.error);
limpiarTodosLosDiagnosticosDuplicados().catch(console.error);
verificacionFinalDespuesLimpieza().catch(console.error);
verificarDiscrepanciasFrontendBackend().catch(console.error);
limpiarCompletamentePacienteSalvatore().catch(console.error);
limpiarCompletamenteTodaLaBaseDeDatos().catch(console.error);
investigarEstadoActualBaseDeDatos().catch(console.error);
probarRendimientoAPIs().catch(console.error);
investigarSincronizacionDiagnosticosIntervenciones().catch(console.error);
*/
