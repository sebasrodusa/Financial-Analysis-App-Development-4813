import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { questConfig } from '../config/questConfig';

const { FiX, FiPlayCircle } = FiIcons;

function GetStartedModal({ isOpen, onClose }) {
  // Always call hooks at the top level - never conditionally
  const [GetStarted, setGetStarted] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // Always call useEffect - use the dependency to control when it runs
  useEffect(() => {
    const loadGetStarted = async () => {
      if (!isOpen) return; // Early return instead of conditional hook call
      
      setIsLoading(true);
      try {
        const { GetStarted: GetStartedComponent } = await import('@questlabs/react-sdk');
        setGetStarted(() => GetStartedComponent);
      } catch (error) {
        console.warn('Error loading GetStarted component:', error);
        setGetStarted(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadGetStarted();
  }, [isOpen]); // Dependency ensures it only runs when isOpen changes

  // Early return after all hooks have been called
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiPlayCircle} className="text-2xl text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <SafeIcon icon={FiX} className="text-xl" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : GetStarted ? (
            <GetStarted
              questId={questConfig.GET_STARTED_QUESTID}
              uniqueUserId={userId}
              accent={questConfig.PRIMARY_COLOR}
              autoHide={false}
            >
              <GetStarted.Header />
              <GetStarted.Progress />
              <GetStarted.Content />
              <GetStarted.Footer />
            </GetStarted>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <SafeIcon icon={FiPlayCircle} className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Unable to load Getting Started guide</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default GetStartedModal;