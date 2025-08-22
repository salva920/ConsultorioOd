import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PatientList from './components/patients/PatientList';
import PatientDetails from './pages/PatientDetails';

function App() {
  return (
    <Router>
      <ChakraProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<PatientList searchTerm="" />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
          </Routes>
        </Layout>
      </ChakraProvider>
    </Router>
  );
}

export default App; 