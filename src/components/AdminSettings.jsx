import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../context/AuthContext';

const { FiSettings, FiToggleLeft, FiToggleRight, FiSave, FiUsers, FiCheck, FiX, FiClock } = FiIcons;

function AdminSettings() {
  const [settings, setSettings] = useState({
    autoApproveRegistrations: false
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { 
    getAdminSettings, 
    updateAdminSettings, 
    getPendingUsers, 
    approveUser, 
    rejectUser 
  } = useAuth();

  useEffect(() => {
    loadSettings();
    loadPendingUsers();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await getAdminSettings();
      if (result.success) {
        setSettings(result.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadPendingUsers = async () => {
    try {
      const result = await getPendingUsers();
      if (result.success) {
        setPendingUsers(result.users);
      }
    } catch (error) {
      console.error('Error loading pending users:', error);
    }
  };

  const handleSettingsChange = async (key, value) => {
    setIsLoading(true);
    try {
      const newSettings = { ...settings, [key]: value };
      const result = await updateAdminSettings(newSettings);
      
      if (result.success) {
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const result = await approveUser(userId);
      if (result.success) {
        await loadPendingUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      const result = await rejectUser(userId);
      if (result.success) {
        await loadPendingUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Settings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <SafeIcon icon={FiSettings} className="text-2xl text-blue-500" />
          <h2 className="text-2xl font-semibold text-gray-900">Registration Settings</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Auto-Approve Registrations</h3>
              <p className="text-sm text-gray-600">
                Automatically approve new user registrations without manual review
              </p>
            </div>
            <button
              onClick={() => handleSettingsChange('autoApproveRegistrations', !settings.autoApproveRegistrations)}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                settings.autoApproveRegistrations
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SafeIcon 
                icon={settings.autoApproveRegistrations ? FiToggleRight : FiToggleLeft} 
                className="text-xl" 
              />
              <span>{settings.autoApproveRegistrations ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>

          {!settings.autoApproveRegistrations && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiUsers} className="text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Manual Approval Required</h4>
                  <p className="text-sm text-blue-700">
                    New registrations will require your approval before users can access the system.
                    Check the "Pending Registrations" section below to review new applications.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pending Users Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiClock} className="text-2xl text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Pending Registrations</h2>
          </div>
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingUsers.length} pending
          </span>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiUsers} className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Registrations</h3>
            <p className="text-gray-600">All user registrations have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.first_name[0]}{user.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600"><strong>Role:</strong> {user.role.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-600"><strong>Company:</strong> {user.company || 'Not provided'}</p>
                        <p className="text-sm text-gray-600"><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600"><strong>Applied:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600"><strong>Status:</strong> 
                          <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            Pending Review
                          </span>
                        </p>
                      </div>
                    </div>

                    {user.bio && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600"><strong>Bio:</strong></p>
                        <p className="text-sm text-gray-700 mt-1">{user.bio}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleApproveUser(user.id)}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <SafeIcon icon={FiCheck} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleRejectUser(user.id)}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <SafeIcon icon={FiX} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default AdminSettings;