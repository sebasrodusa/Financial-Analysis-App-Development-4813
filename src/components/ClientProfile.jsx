import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useClient } from '../context/ClientContext';
import ClientModal from './ClientModal';

const { FiArrowLeft, FiEdit2, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBriefcase, FiHeart, FiUsers } = FiIcons;

function ClientProfile() {
  const { id } = useParams();
  const { state, updateClient } = useClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const foundClient = state.clients.find(c => c.id === id);
    setClient(foundClient);
  }, [id, state.clients]);

  const handleUpdateClient = async (updatedClient) => {
    await updateClient({ ...updatedClient, id });
    setShowEditModal(false);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SafeIcon icon={FiUser} className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Client not found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <SafeIcon icon={FiArrowLeft} className="text-xl text-gray-700" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {client.firstName} {client.lastName}
                </h1>
                <p className="text-gray-600">Client Profile</p>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <SafeIcon icon={FiEdit2} />
              <span>Edit Profile</span>
            </button>
          </div>
        </motion.div>

        {/* Client Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {client.firstName[0]}{client.lastName[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {client.firstName} {client.lastName}
                </h2>
                <p className="text-blue-100">{client.occupation}</p>
                <p className="text-blue-100 text-sm">{client.employer}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiMail} className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiPhone} className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{client.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiCalendar} className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">
                      {client.dateOfBirth ? (
                        <>
                          {new Date(client.dateOfBirth).toLocaleDateString()}
                          {calculateAge(client.dateOfBirth) && (
                            <span className="text-gray-500 ml-2">
                              (Age: {calculateAge(client.dateOfBirth)})
                            </span>
                          )}
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiMapPin} className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">
                      {client.address ? (
                        <>
                          {client.address}<br />
                          {client.city}, {client.state} {client.zipCode}
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiBriefcase} className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Marital Status</p>
                    <p className="font-medium capitalize">{client.maritalStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Spouse Information */}
        {client.maritalStatus === 'married' && (client.spouseFirstName || client.spouseLastName) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <SafeIcon icon={FiHeart} className="text-red-500 mr-2" />
                Spouse Information
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">
                      {client.spouseFirstName} {client.spouseLastName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">
                      {client.spouseDateOfBirth ? (
                        <>
                          {new Date(client.spouseDateOfBirth).toLocaleDateString()}
                          {calculateAge(client.spouseDateOfBirth) && (
                            <span className="text-gray-500 ml-2">
                              (Age: {calculateAge(client.spouseDateOfBirth)})
                            </span>
                          )}
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{client.spousePhone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{client.spouseEmail || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Occupation</p>
                    <p className="font-medium">{client.spouseOccupation || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Employer</p>
                    <p className="font-medium">{client.spouseEmployer || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Children Information */}
        {client.children && client.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <SafeIcon icon={FiUsers} className="text-purple-500 mr-2" />
                Children ({client.children.length})
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {client.children.map((child, index) => (
                  <div key={child.id || index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {child.firstName ? child.firstName[0] : 'C'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {child.firstName} {child.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {child.relationship || 'Child'}
                        </p>
                      </div>
                    </div>
                    
                    {child.dateOfBirth && (
                      <div className="text-sm">
                        <p className="text-gray-500">Date of Birth:</p>
                        <p className="font-medium">
                          {new Date(child.dateOfBirth).toLocaleDateString()}
                          {calculateAge(child.dateOfBirth) && (
                            <span className="text-gray-500 ml-2">
                              (Age: {calculateAge(child.dateOfBirth)})
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link
            to={`/analysis/${client.id}`}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Financial Analysis
                </h3>
                <p className="text-gray-600">Create comprehensive analysis</p>
              </div>
              <SafeIcon icon={FiIcons.FiTrendingUp} className="text-3xl text-green-500 group-hover:text-green-600" />
            </div>
          </Link>

          <Link
            to={`/report/${client.id}`}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Generate Report
                </h3>
                <p className="text-gray-600">Create visual reports</p>
              </div>
              <SafeIcon icon={FiIcons.FiFileText} className="text-3xl text-blue-500 group-hover:text-blue-600" />
            </div>
          </Link>

          <Link
            to="/life-insurance"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Life Insurance
                </h3>
                <p className="text-gray-600">Calculate coverage needs</p>
              </div>
              <SafeIcon icon={FiIcons.FiShield} className="text-3xl text-purple-500 group-hover:text-purple-600" />
            </div>
          </Link>
        </motion.div>
      </div>

      {showEditModal && (
        <ClientModal
          client={client}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateClient}
        />
      )}
    </div>
  );
}

export default ClientProfile;