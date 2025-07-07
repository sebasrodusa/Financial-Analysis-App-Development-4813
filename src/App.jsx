import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import SupabaseTest from './components/SupabaseTest';
import './App.css';

// Lazy load optional components to prevent build issues
const QuestLogin = React.lazy(() =>
  import('./components/QuestLogin').catch(() => ({
    default: () => <div>Login not available</div>
  }))
);

const QuestOnboarding = React.lazy(() =>
  import('./components/QuestOnboarding').catch(() => ({
    default: () => <div>Onboarding not available</div>
  }))
);

// Dynamically import Quest components with proper error handling
const QuestProvider = React.lazy(() =>
  import('@questlabs/react-sdk')
    .then(module => ({
      default: module.QuestProvider || (({ children }) => children)
    }))
    .catch(() => ({
      default: ({ children }) => children // Fallback component
    }))
);

function AppContent() {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();

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

  // Show onboarding if user needs it
  if (isAuthenticated && needsOnboarding) {
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      }>
        <QuestOnboarding />
      </React.Suspense>
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
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <SignUp />
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <ForgotPassword />
              )
            }
          />
          <Route
            path="/reset-password"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <ResetPassword />
              )
            }
          />
          <Route
            path="/quest-login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <React.Suspense fallback={
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                  </div>
                }>
                  <QuestLogin />
                </React.Suspense>
              )
            }
          />
          <Route
            path="/onboarding"
            element={
              isAuthenticated ? (
                <React.Suspense fallback={
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                  </div>
                }>
                  <QuestOnboarding />
                </React.Suspense>
              ) : (
                <Navigate to="/login" replace />
              )
            }
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
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            }
          />
        </Routes>
      </motion.div>
      
      {/* Supabase Test Component - Visible on all pages */}
      <SupabaseTest />
    </div>
  );
}

// Quest configuration with safe error handling
const getQuestConfig = () => {
  try {
    if (typeof window === 'undefined') return null;
    
    const config = {
      apiKey: 'k-01e20326-644b-41ae-a703-65bfe60fc6c1',
      entityId: 'e-7a4dcfcd-535e-4d47-9fd2-11d2085767dd',
      apiType: 'PRODUCTION'
    };

    // Validate config
    if (!config.apiKey || !config.entityId) {
      console.warn('Quest config incomplete');
      return null;
    }

    return config;
  } catch (error) {
    console.warn('Error getting Quest config:', error);
    return null;
  }
};

function App() {
  const questConfig = getQuestConfig();

  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      {questConfig ? (
        <QuestProvider {...questConfig}>
          <AuthProvider>
            <ClientProvider>
              <Router>
                <AppContent />
              </Router>
            </ClientProvider>
          </AuthProvider>
        </QuestProvider>
      ) : (
        <AuthProvider>
          <ClientProvider>
            <Router>
              <AppContent />
            </Router>
          </ClientProvider>
        </AuthProvider>
      )}
    </React.Suspense>
  );
}

export default App;