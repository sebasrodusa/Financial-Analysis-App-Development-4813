import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useClient } from '../context/ClientContext';
import ClientModal from './ClientModal';

const { FiPlus, FiUser, FiTrendingUp, FiFileText, FiCalculator, FiCreditCard } = FiIcons;

function Dashboard() {
  const { state, dispatch } = useClient();
  const [showClientModal, setShowClientModal] = useState(false);

  const handleAddClient = (clientData) => {
    const newClient = {
      id: Date.now().toString(),
      ...clientData,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_CLIENT', payload: newClient });
    setShowClientModal(false);
  };

  const handleDeleteClient = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      dispatch({ type: 'DELETE_CLIENT', payload: clientId });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Financial Analysis Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage client profiles and create comprehensive financial analyses
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Link to="/life-insurance" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Life Insurance Calculator
                  </h3>
                  <p className="text-gray-600">Calculate optimal coverage</p>
                </div>
                <SafeIcon icon={FiCalculator} className="text-3xl text-blue-500 group-hover:text-blue-600" />
              </div>
            </div>
          </Link>

          <Link to="/debt-stacking" className="group">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Debt Stacking
                  </h3>
                  <p className="text-gray-600">Optimize debt repayment</p>
                </div>
                <SafeIcon icon={FiCreditCard} className="text-3xl text-green-500 group-hover:text-green-600" />
              </div>
            </div>
          </Link>

          <button
            onClick={() => setShowClientModal(true)}
            className="group text-left"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Add New Client
                  </h3>
                  <p className="text-gray-600">Create client profile</p>
                </div>
                <SafeIcon icon={FiPlus} className="text-3xl text-purple-500 group-hover:text-purple-600" />
              </div>
            </div>
          </button>
        </motion.div>

        {/* Client List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                Client Profiles
              </h2>
              <span className="text-sm text-gray-500">
                {state.clients.length} clients
              </span>
            </div>
          </div>

          {state.clients.length === 0 ? (
            <div className="p-12 text-center">
              <SafeIcon icon={FiUser} className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No clients yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first client profile
              </p>
              <button
                onClick={() => setShowClientModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Client
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {state.clients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {client.firstName[0]}{client.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {client.firstName} {client.lastName}
                        </h3>
                        <p className="text-gray-600">{client.email}</p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(client.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/client/${client.id}`}
                        className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        View Profile
                      </Link>
                      <Link
                        to={`/analysis/${client.id}`}
                        className="bg-green-100 text-green-600 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <SafeIcon icon={FiTrendingUp} className="inline mr-1" />
                        Analysis
                      </Link>
                      <Link
                        to={`/report/${client.id}`}
                        className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <SafeIcon icon={FiFileText} className="inline mr-1" />
                        Report
                      </Link>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {showClientModal && (
        <ClientModal
          onClose={() => setShowClientModal(false)}
          onSave={handleAddClient}
        />
      )}
    </div>
  );
}

export default Dashboard;