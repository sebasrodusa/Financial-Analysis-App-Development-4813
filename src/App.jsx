import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClientProvider } from './context/ClientContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import ClientProfile from './components/ClientProfile';
import FinancialAnalysis from './components/FinancialAnalysis';
import ReportGenerator from './components/ReportGenerator';
import LifeInsuranceCalculator from './components/LifeInsuranceCalculator';
import DebtStackingCalculator from './components/DebtStackingCalculator';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './App.css';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/client/:id" 
            element={
              <ProtectedRoute>
                <ClientProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analysis/:id" 
            element={
              <ProtectedRoute>
                <FinancialAnalysis />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/report/:id" 
            element={
              <ProtectedRoute>
                <ReportGenerator />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/life-insurance" 
            element={
              <ProtectedRoute>
                <LifeInsuranceCalculator />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/debt-stacking" 
            element={
              <ProtectedRoute>
                <DebtStackingCalculator />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </motion.div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ClientProvider>
        <Router>
          <AppContent />
        </Router>
      </ClientProvider>
    </AuthProvider>
  );
}

export default App;