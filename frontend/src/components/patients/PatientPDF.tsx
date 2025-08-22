'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import OdontogramaSVG from './OdontogramaSVG'

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20
  },
  header: {
    marginBottom: 15,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#2B6CB0',
    borderBottomStyle: 'solid',
    paddingBottom: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2B6CB0',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 20
  },
  section: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#F7FAFC',
    borderRadius: 5
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    borderBottomStyle: 'solid',
    paddingBottom: 2
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4A5568',
    width: '40%'
  },
  value: {
    fontSize: 11,
    color: '#2D3748',
    width: '60%'
  },
  fullWidthText: {
    fontSize: 11,
    color: '#2D3748',
    lineHeight: 1.4,
    textAlign: 'justify'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#718096',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderTopStyle: 'solid',
    paddingTop: 10
  },
  odontogramaSection: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#EDF2F7',
    borderRadius: 5
  },
  toothRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 10
  },
  toothNumber: {
    width: '15%',
    fontWeight: 'bold'
  },
  toothCondition: {
    width: '25%'
  },
  toothInterventions: {
    width: '60%'
  }
})

interface Patient {
  _id: string
  nombre: string
  apellido: string
  cedula: string
  tipo_cedula: string
  edad: number
  fecha_nacimiento: string
  sexo: string
  email: string
  telefono: string
  direccion: string
  enfermedad_actual: string
  antecedentes_personales: string
  antecedentes_familiares: string
  tipo_consulta: string
  motivo_consulta: string
}

interface Tooth {
  number: number
  condition: string
  interventions: Array<{
    type: string
    date: string
    notes?: string
  }>
}

interface Odontograma {
  teeth: Tooth[]
  createdAt: string
  updatedAt: string
}

interface Appointment {
  _id: string
  patientId: string
  date: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  notes: string
  createdAt: string
  updatedAt: string
}

interface PatientPDFProps {
  patient: Patient
  odontograma?: Odontograma
  appointments?: Appointment[]
}

const PatientPDF: React.FC<PatientPDFProps> = ({ patient, odontograma, appointments }) => {
  // Función helper para validar y formatear datos del paciente
  // Evita mostrar "Invalid Date", "undefined", "null" o campos vacíos
  const formatPatientData = (value: any, defaultValue: string = 'No especificado') => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificado';
    
    try {
      const date = new Date(dateString);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'No especificado';
    
    try {
      const date = new Date(dateString);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      return `${date.toLocaleDateString('es-ES')} ${date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } catch (error) {
      console.error('Error al formatear fecha y hora:', error);
      return 'Fecha inválida';
    }
  }

  const getStatusText = (status: string) => {
    const statuses: { [key: string]: string } = {
      'SCHEDULED': 'Programada',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada',
      'NO_SHOW': 'No asistio'
    }
    return statuses[status] || status
  }

  const getConditionText = (condition: string) => {
    const conditions: { [key: string]: string } = {
      'sano': 'Sano',
      'caries': 'Caries',
      'obturado': 'Obturado',
      'restaurado': 'Restaurado',
      'corona': 'Corona',
      'extraccion': 'Extraccion',
      'implante': 'Implante',
      'protesis': 'Protesis'
    }
    return conditions[condition] || condition
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Historia Clinica Odontologica</Text>
          <Text style={styles.subtitle}>
            {patient.nombre} {patient.apellido}
          </Text>
        </View>

        {/* Información Personal y Contacto en dos columnas */}
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {/* Información Personal */}
          <View style={[styles.section, { width: '50%', marginRight: 5 }]}>
            <Text style={styles.sectionTitle}>Informacion Personal</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{patient.nombre} {patient.apellido}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Cedula:</Text>
              <Text style={styles.value}>{patient.tipo_cedula} {patient.cedula}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Nacimiento:</Text>
              <Text style={styles.value}>{formatDate(patient.fecha_nacimiento)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Edad/Sexo:</Text>
              <Text style={styles.value}>
                {patient.edad && !isNaN(patient.edad) ? `${patient.edad} años` : 'No especificado'}, {formatPatientData(patient.sexo, 'No especificado')}
              </Text>
            </View>
          </View>

          {/* Información de Contacto */}
          <View style={[styles.section, { width: '50%', marginLeft: 5 }]}>
            <Text style={styles.sectionTitle}>Contacto</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{formatPatientData(patient.email, 'No especificado')}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{formatPatientData(patient.telefono, 'No especificado')}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{formatPatientData(patient.direccion, 'No especificado')}</Text>
            </View>
          </View>
        </View>

        {/* Información Clínica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Clínica</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo de consulta:</Text>
            <Text style={styles.value}>{formatPatientData(patient.tipo_consulta, 'No especificado')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Motivo:</Text>
            <Text style={[styles.value, { fontSize: 9 }]}>{formatPatientData(patient.motivo_consulta, 'No especificado')}</Text>
          </View>
          
          {patient.enfermedad_actual && (
            <View style={styles.row}>
              <Text style={styles.label}>Enfermedad actual:</Text>
              <Text style={[styles.value, { fontSize: 9 }]}>{patient.enfermedad_actual}</Text>
            </View>
          )}
        </View>

        {/* Antecedentes */}
        {(patient.antecedentes_personales || patient.antecedentes_familiares) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Antecedentes</Text>
            {patient.antecedentes_personales && (
              <View style={styles.row}>
                <Text style={styles.label}>Personales:</Text>
                <Text style={[styles.value, { fontSize: 9 }]}>{patient.antecedentes_personales}</Text>
              </View>
            )}
            
            {patient.antecedentes_familiares && (
              <View style={styles.row}>
                <Text style={styles.label}>Familiares:</Text>
                <Text style={[styles.value, { fontSize: 9 }]}>{patient.antecedentes_familiares}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Si no hay antecedentes, mostrar mensaje */}
        {!patient.antecedentes_personales && !patient.antecedentes_familiares && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Antecedentes</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Estado:</Text>
              <Text style={styles.value}>No se han registrado antecedentes</Text>
            </View>
          </View>
        )}

        {/* Historial de Citas */}
        {appointments && appointments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial de Citas ({appointments.length})</Text>
            
            {/* Mostrar las últimas 5 citas */}
            {appointments
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((appointment, index) => (
                <View key={appointment._id} style={{
                  flexDirection: 'row',
                  marginBottom: 2,
                  paddingBottom: 2,
                  borderBottomWidth: index < Math.min(appointments.length, 5) - 1 ? 0.5 : 0,
                  borderBottomColor: '#E2E8F0',
                  borderBottomStyle: 'solid'
                }}>
                  <Text style={[styles.label, { width: '25%' }]}>
                    {formatDateTime(appointment.date)}
                  </Text>
                  <Text style={[styles.value, { width: '20%', fontSize: 9 }]}>
                    {getStatusText(appointment.status)}
                  </Text>
                  <Text style={[styles.value, { width: '55%', fontSize: 9 }]}>
                    {appointment.notes || 'Sin notas'}
                  </Text>
                </View>
              ))
            }
            
            {appointments.length > 5 && (
              <Text style={{ fontSize: 8, color: '#718096', textAlign: 'center', marginTop: 5 }}>
                Mostrando las 5 citas mas recientes de {appointments.length} total
              </Text>
            )}
            
            {/* Resumen de estados */}
            <View style={{ marginTop: 8, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: '#E2E8F0', borderTopStyle: 'solid' }}>
              <Text style={{ fontSize: 8, color: '#4A5568' }}>
                Resumen: {appointments.filter(a => a.status === 'COMPLETED').length} completadas, {' '}
                {appointments.filter(a => a.status === 'SCHEDULED').length} programadas, {' '}
                {appointments.filter(a => a.status === 'CANCELLED').length} canceladas, {' '}
                {appointments.filter(a => a.status === 'NO_SHOW').length} ausencias
              </Text>
            </View>
          </View>
        )}

        {/* Footer Primera Página */}
        <View style={styles.footer}>
          <Text>
            Historia Clinica generada el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
          </Text>
          <Text style={{ marginTop: 5 }}>
            Sistema de Gestion Odontologica - Pagina 1 de 2
          </Text>
        </View>
      </Page>

      {/* Segunda Página - Odontograma */}
      {odontograma && (
        <Page size="A4" style={styles.page}>
          <View style={styles.odontogramaSection}>
            <Text style={styles.sectionTitle}>Estado Dental (Odontograma)</Text>
            <Text style={{ fontSize: 8, marginBottom: 5, color: '#4A5568' }}>
              Ultima actualizacion: {formatDate(odontograma.updatedAt)}
            </Text>
            
            {/* Odontograma Visual SVG */}
            <View style={{ marginBottom: 5, alignItems: 'center' }}>
              <OdontogramaSVG teeth={odontograma.teeth} />
            </View>
            
            {/* Resumen de problemas y intervenciones */}
            {odontograma.teeth.filter(tooth => tooth.condition !== 'sano' || tooth.interventions.length > 0).length > 0 && (
              <View style={{ marginTop: 5 }}>
                {/* Problemas por tipo */}
                <View style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 2 }}>
                    Resumen por Condicion:
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {['caries', 'obturado', 'restaurado', 'corona', 'extraccion', 'implante', 'protesis'].map((condition) => {
                      const count = odontograma.teeth.filter(tooth => tooth.condition === condition).length;
                      if (count === 0) return null;
                      return (
                        <Text key={condition} style={{ 
                          fontSize: 8, 
                          color: '#4A5568', 
                          marginRight: 8,
                          backgroundColor: '#F7FAFC',
                          paddingHorizontal: 4,
                          paddingVertical: 1,
                          borderRadius: 2,
                          marginBottom: 2
                        }}>
                          {getConditionText(condition)}: {count}
                        </Text>
                      );
                    })}
                  </View>
                </View>

                {/* Lista de dientes con problemas */}
                <View>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 2 }}>
                    Dientes Afectados:
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {odontograma.teeth
                      .filter(tooth => tooth.condition !== 'sano')
                      .sort((a, b) => a.number - b.number)
                      .map((tooth, index, array) => (
                        <Text key={tooth.number} style={{ fontSize: 8, color: '#2D3748' }}>
                          #{tooth.number} ({getConditionText(tooth.condition)})
                          {index < array.length - 1 ? ', ' : ''}
                        </Text>
                      ))
                    }
                  </View>
                </View>

                {/* Intervenciones registradas */}
                {odontograma.teeth.some(tooth => tooth.interventions && tooth.interventions.length > 0) && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 2 }}>
                      Intervenciones Registradas:
                    </Text>
                    <View>
                      {odontograma.teeth
                        .filter(tooth => tooth.interventions && tooth.interventions.length > 0)
                        .map((tooth) => (
                          <Text key={tooth.number} style={{ fontSize: 8, color: '#4A5568', marginBottom: 1 }}>
                            Diente #{tooth.number}: {tooth.interventions.map(int => int.type).join(', ')}
                          </Text>
                        ))
                      }
                    </View>
                  </View>
                )}
              </View>
            )}
            
            {odontograma.teeth.filter(tooth => tooth.condition !== 'sano' || tooth.interventions.length > 0).length === 0 && (
              <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#718096', textAlign: 'center', marginTop: 5 }}>
                Todos los dientes estan sanos
              </Text>
            )}
          </View>

          {/* Footer Segunda Página */}
          <View style={styles.footer}>
            <Text>
              Historia Clinica generada el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
            </Text>
            <Text style={{ marginTop: 5 }}>
              Sistema de Gestion Odontologica - Pagina 2 de 2
            </Text>
          </View>
        </Page>
      )}
    </Document>
  )
}

export default PatientPDF