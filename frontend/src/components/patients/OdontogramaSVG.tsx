'use client'

import React from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'

// Estilos para el odontograma en texto
const styles = StyleSheet.create({
  odontogramaContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 6,
    backgroundColor: '#F9FAFB'
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2D3748'
  },
  quadrantContainer: {
    marginBottom: 10
  },
  quadrantTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#4A5568'
  },
  teethGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  toothContainer: {
    width: '12%',
    margin: 1,
    padding: 2,
    textAlign: 'center',
    borderRadius: 3,
    minHeight: 20
  },
  toothNumber: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#2D3748'
  },
  toothCondition: {
    fontSize: 6,
    color: '#4A5568',
    marginTop: 2
  },
  legend: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderTopStyle: 'solid',
    paddingTop: 6
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2D3748'
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  legendItem: {
    width: '33%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3
  },
  legendSquare: {
    width: 10,
    height: 10,
    marginRight: 5,
    borderWidth: 1
  },
  legendText: {
    fontSize: 8,
    color: '#4A5568'
  }
})

interface Tooth {
  number: number
  condition: string
  interventions: Array<{
    type: string
    date: string
    notes?: string
  }>
}

interface OdontogramaSVGProps {
  teeth: Tooth[]
}

const OdontogramaSVG: React.FC<OdontogramaSVGProps> = ({ teeth }) => {
  // Configuración de colores por condición
  const getToothStyle = (condition: string) => {
    const styles: { [key: string]: { backgroundColor: string, borderColor: string } } = {
      'sano': { backgroundColor: '#E6FFFA', borderColor: '#38B2AC' },
      'caries': { backgroundColor: '#FED7D7', borderColor: '#E53E3E' },
      'obturado': { backgroundColor: '#BEE3F8', borderColor: '#3182CE' },
      'restaurado': { backgroundColor: '#C6F6D5', borderColor: '#25855A' },
      'corona': { backgroundColor: '#F7FAFC', borderColor: '#4A5568' },
      'extraccion': { backgroundColor: '#2D3748', borderColor: '#1A202C' },
      'implante': { backgroundColor: '#E9D8FD', borderColor: '#6B46C1' },
      'protesis': { backgroundColor: '#FBD38D', borderColor: '#D69E2E' }
    }
    return styles[condition] || styles['sano']
  }

  const getConditionSymbol = (condition: string) => {
    const symbols: { [key: string]: string } = {
      'sano': 'OK',
      'caries': 'C',
      'obturado': 'O',
      'restaurado': 'R',
      'corona': 'CR',
      'extraccion': 'X',
      'implante': 'I',
      'protesis': 'P'
    }
    return symbols[condition] || 'OK'
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

  // Función para obtener el diente por número
  const getTooth = (number: number) => {
    return teeth.find(t => t.number === number) || { number, condition: 'sano', interventions: [] }
  }

  // Función para renderizar un diente
  const ToothComponent = ({ number }: { number: number }) => {
    const tooth = getTooth(number)
    const toothStyle = getToothStyle(tooth.condition)
    
    return (
      <View style={[
        styles.toothContainer,
        {
          backgroundColor: toothStyle.backgroundColor,
          borderColor: toothStyle.borderColor,
          borderWidth: 1
        }
      ]}>
        <Text style={styles.toothNumber}>{number}</Text>
        <Text style={styles.toothCondition}>{getConditionSymbol(tooth.condition)}</Text>
      </View>
    )
  }

  return (
    <View style={styles.odontogramaContainer}>
      <Text style={styles.title}>Odontograma</Text>
      
      {/* Cuadrantes Superiores */}
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {/* Cuadrante Superior Derecho (18-11) */}
        <View style={{ width: '50%', paddingRight: 5 }}>
          <Text style={styles.quadrantTitle}>Superior Derecho</Text>
          <View style={styles.teethGrid}>
            {[18, 17, 16, 15, 14, 13, 12, 11].map((number) => (
              <ToothComponent key={number} number={number} />
            ))}
          </View>
        </View>
        
        {/* Cuadrante Superior Izquierdo (21-28) */}
        <View style={{ width: '50%', paddingLeft: 5 }}>
          <Text style={styles.quadrantTitle}>Superior Izquierdo</Text>
          <View style={styles.teethGrid}>
            {[21, 22, 23, 24, 25, 26, 27, 28].map((number) => (
              <ToothComponent key={number} number={number} />
            ))}
          </View>
        </View>
      </View>

      {/* Línea divisoria */}
      <View style={{ 
        height: 1, 
        backgroundColor: '#CBD5E0', 
        marginVertical: 6 
      }} />

      {/* Cuadrantes Inferiores */}
      <View style={{ flexDirection: 'row' }}>
        {/* Cuadrante Inferior Derecho (48-41) */}
        <View style={{ width: '50%', paddingRight: 5 }}>
          <Text style={styles.quadrantTitle}>Inferior Derecho</Text>
          <View style={styles.teethGrid}>
            {[48, 47, 46, 45, 44, 43, 42, 41].map((number) => (
              <ToothComponent key={number} number={number} />
            ))}
          </View>
        </View>
        
        {/* Cuadrante Inferior Izquierdo (31-38) */}
        <View style={{ width: '50%', paddingLeft: 5 }}>
          <Text style={styles.quadrantTitle}>Inferior Izquierdo</Text>
          <View style={styles.teethGrid}>
            {[31, 32, 33, 34, 35, 36, 37, 38].map((number) => (
              <ToothComponent key={number} number={number} />
            ))}
          </View>
        </View>
      </View>

      {/* Leyenda */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Leyenda:</Text>
        <View style={styles.legendGrid}>
          {['sano', 'caries', 'obturado', 'restaurado', 'corona', 'extraccion', 'implante', 'protesis'].map((condition) => {
            const conditionStyle = getToothStyle(condition)
            return (
              <View key={condition} style={styles.legendItem}>
                <View style={[
                  styles.legendSquare,
                  {
                    backgroundColor: conditionStyle.backgroundColor,
                    borderColor: conditionStyle.borderColor
                  }
                ]} />
                <Text style={styles.legendText}>
                  {getConditionSymbol(condition)} - {getConditionText(condition)}
                </Text>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}

export default OdontogramaSVG