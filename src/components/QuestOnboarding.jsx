import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../context/AuthContext';
import { getQuestConfig } from '../config/questConfig';

const { FiCheckCircle, FiTrendingUp, FiTarget, FiUsers, FiBarChart3, FiShield } = FiIcons;

function QuestOnboarding() {
  const [OnBoarding, setOnBoarding] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  // Safely get user data
  const getUserData = () => {
    try {
      const storedUserId = localStorage.getItem('userId');
      const storedToken = localStorage.getItem('token');
      const config = getQuestConfig();
      
      return {
        userId: storedUserId || config?.USER_ID || 'default-user-id',
        token: storedToken || config?.TOKEN || 'default-token'
      };
    } catch (error) {
      console.warn('Error getting user data from localStorage:', error);
      const config = getQuestConfig();
      return {
        userId: config?.USER_ID || 'default-user-id',
        token: config?.TOKEN || 'default-token'
      };
    }
  };

  const { userId, token } = getUserData();

  useEffect(() => {
    const loadOnBoarding = async () => {
      setIsLoading(true);
      try {
        const module = await import('@questlabs/react-sdk');
        if (module.OnBoarding) {
          setOnBoarding(() => module.OnBoarding);
        } else {
          console.warn('OnBoarding component not found in module');
          setOnBoarding(null);
        }
      } catch (error) {
        console.warn('Error loading OnBoarding component:', error);
        setOnBoarding(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnBoarding();
  }, []);

  const handleComplete = () => {
    // Mark onboarding as completed
    completeOnboarding();
    // Navigate to main dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Section - Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <SafeIcon icon={FiTarget} className="text-4xl" />
            </div>
            <h1 className="text-5xl font-bold mb-6">Let's Get Started!</h1>
            <p className="text-xl mb-8 text-green-100">
              We're setting up your personalized financial analysis experience
            </p>

            {/* Setup steps */}
            <div className="space-y-6 text-left max-w-md">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiCheckCircle} className="text-lg text-green-800" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Account Setup</h3>
                  <p className="text-green-200 text-sm">Configure your preferences</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiUsers} className="text-lg text-blue-800" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Client Management</h3>
                  <p className="text-green-200 text-sm">Learn about managing clients</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiBarChart3} className="text-lg text-purple-800" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Financial Tools</h3>
                  <p className="text-green-200 text-sm">Explore analysis features</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-10 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Right Section - Onboarding Component */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiTarget} className="text-2xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
            <p className="text-gray-600">Welcome, {user?.firstName}!</p>
          </div>

          {/* Quest Onboarding Component */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Loading onboarding...</span>
              </div>
            ) : OnBoarding ? (
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <OnBoarding
                  userId={userId}
                  token={token}
                  questId={getQuestConfig()?.QUEST_ONBOARDING_QUESTID || 'default-quest'}
                  answer={answers}
                  setAnswer={setAnswers}
                  getAnswers={handleComplete}
                  accent="#3B82F6"
                  singleChoose="modal1"
                  multiChoice="modal2"
                >
                  <OnBoarding.Header />
                  <OnBoarding.Content />
                  <OnBoarding.Footer />
                </OnBoarding>
              </div>
            ) : (
              <div className="text-center py-12">
                <SafeIcon icon={FiTarget} className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Onboarding not available</p>
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={handleComplete}
                    className="block w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Skip Onboarding
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Progress indicator */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Setting up your ProsperTrack™ experience</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default QuestOnboarding;