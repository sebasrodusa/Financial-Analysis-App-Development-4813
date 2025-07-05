import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../context/AuthContext';
import { questConfig } from '../config/questConfig';

const { FiTrendingUp, FiArrowRight, FiShield, FiUsers, FiBarChart3 } = FiIcons;

function QuestLogin() {
  const [QuestLogin, setQuestLogin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Safely get user ID with fallback
  const getUserId = () => {
    try {
      const storedUserId = localStorage.getItem('userId');
      return storedUserId || questConfig.USER_ID;
    } catch (error) {
      console.warn('Error getting user ID from localStorage:', error);
      return questConfig.USER_ID;
    }
  };

  const userId = getUserId();

  useEffect(() => {
    const loadQuestLogin = async () => {
      setIsLoading(true);
      try {
        const { QuestLogin: QuestLoginComponent } = await import('@questlabs/react-sdk');
        setQuestLogin(() => QuestLoginComponent);
      } catch (error) {
        console.warn('Error loading QuestLogin component:', error);
        setQuestLogin(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestLogin();
  }, []);

  const handleLogin = async ({ userId, token, newUser }) => {
    try {
      // Store Quest data
      localStorage.setItem('userId', userId);
      localStorage.setItem('token', token);
      
      // Use our internal authentication system
      const result = await login('advisor@prospertrack.com', 'advisor123');
      
      if (result.success) {
        if (newUser || !result.user.hasCompletedOnboarding) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <SafeIcon icon={FiTrendingUp} className="text-4xl" />
            </div>
            <h1 className="text-5xl font-bold mb-6">Welcome to ProsperTrack™</h1>
            <p className="text-xl mb-8 text-blue-100">
              Your comprehensive financial analysis platform designed for professionals
            </p>
            
            {/* Feature highlights */}
            <div className="space-y-4 text-left max-w-md">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiUsers} className="text-2xl text-blue-200" />
                <span className="text-lg">Client Management</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiBarChart3} className="text-2xl text-blue-200" />
                <span className="text-lg">Financial Analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiShield} className="text-2xl text-blue-200" />
                <span className="text-lg">Secure & Professional</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-10 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiTrendingUp} className="text-2xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">ProsperTrack™</h2>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">Access your financial analysis platform</p>
          </div>

          {/* Quest Login Component */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading login...</span>
              </div>
            ) : QuestLogin ? (
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <QuestLogin
                  onSubmit={handleLogin}
                  email={true}
                  google={false}
                  accent={questConfig.PRIMARY_COLOR}
                  uniqueUserId={userId}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <SafeIcon icon={FiShield} className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Unable to load authentication</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Demo Credentials:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Admin:</strong> sebasrodus+admin@gmail.com / admin1234</p>
              <p><strong>Advisor:</strong> advisor@prospertrack.com / advisor123</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>ProsperTrack™ Financial Analysis Platform</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default QuestLogin;