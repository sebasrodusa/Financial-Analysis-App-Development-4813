import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClientProvider } from './context/ClientContext';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
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


// Custom loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
    <p className="text-gray-600 text-lg">Loading ProsperTrack™...</p>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-6">
              {this.state.error?.message || "An unexpected error occurred in the application."}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated() && <Navbar />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/signup" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <SignUp />} />
          <Route path="/forgot-password" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
          <Route path="/reset-password" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/client/:id" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />
          <Route path="/analysis/:id" element={<ProtectedRoute><FinancialAnalysis /></ProtectedRoute>} />
          <Route path="/report/:id" element={<ProtectedRoute><ReportGenerator /></ProtectedRoute>} />
          <Route path="/life-insurance" element={<ProtectedRoute><LifeInsuranceCalculator /></ProtectedRoute>} />
          <Route path="/debt-stacking" element={<ProtectedRoute><DebtStackingCalculator /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />} />
          
          {/* Catch-all for unknown routes */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
                <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Go Home
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </motion.div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ClientProvider>
          <Router>
            <AppContent />
          </Router>
        </ClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
export default App;