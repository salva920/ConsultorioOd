'use client'

import { ChakraProvider } from '@chakra-ui/react'
import Layout from '../../../components/Layout'
import PatientDetails from '../../../pages/PatientDetails'

export default function PatientPage({ params }: { params: { id: string } }) {
  return (
    <ChakraProvider>
      <Layout>
        <PatientDetails />
      </Layout>
    </ChakraProvider>
  )
} 