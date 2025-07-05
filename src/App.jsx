import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Dashboard from './components/Dashboard';
import ClientProfile from './components/ClientProfile';
import FinancialAnalysis from './components/FinancialAnalysis';
import ReportGenerator from './components/ReportGenerator';
import LifeInsuranceCalculator from './components/LifeInsuranceCalculator';
import DebtStackingCalculator from './components/DebtStackingCalculator';
import { ClientProvider } from './context/ClientContext';
import './App.css';

function App() {
  return (
    <ClientProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/client/:id" element={<ClientProfile />} />
              <Route path="/analysis/:id" element={<FinancialAnalysis />} />
              <Route path="/report/:id" element={<ReportGenerator />} />
              <Route path="/life-insurance" element={<LifeInsuranceCalculator />} />
              <Route path="/debt-stacking" element={<DebtStackingCalculator />} />
            </Routes>
          </motion.div>
        </div>
      </Router>
    </ClientProvider>
  );
}

export default App;