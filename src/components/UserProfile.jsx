import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../context/AuthContext';

const { FiUser, FiMail, FiPhone, FiBriefcase, FiLock, FiCamera, FiSave, FiEye, FiEyeOff, FiEdit2, FiCheck, FiX } = FiIcons;

function UserProfile({ isOpen, onClose }) {
  const { user, updateUser, updateUserEmail, updateUserPassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    company: user?.company || '',
    bio: user?.bio || '',
    profilePhoto: user?.profilePhoto || null
  });

  // Email form state
  const [emailData, setEmailData] = useState({
    newEmail: user?.email || '',
    currentPassword: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    emailCurrent: false
  });

  const clearMessages = () => {
    setSuccess('');
    setError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    try {
      const updatedUser = {
        ...user,
        ...profileData
      };

      const result = await updateUser(updatedUser);
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    try {
      // Validate current password
      if (emailData.currentPassword !== user.password) {
        setError('Current password is incorrect');
        setIsLoading(false);
        return;
      }

      // Validate new email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailData.newEmail)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      if (emailData.newEmail === user.email) {
        setError('New email must be different from current email');
        setIsLoading(false);
        return;
      }

      const result = await updateUserEmail(emailData.newEmail, emailData.currentPassword);
      if (result.success) {
        setSuccess('Email updated successfully! Please verify your new email address.');
        setEmailData({ newEmail: emailData.newEmail, currentPassword: '' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update email');
      }
    } catch (error) {
      setError('An error occurred while updating your email');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    try {
      // Validate current password
      if (passwordData.currentPassword !== user.password) {
        setError('Current password is incorrect');
        setIsLoading(false);
        return;
      }

      // Validate new password
      if (passwordData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      // Validate password confirmation
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        setIsLoading(false);
        return;
      }

      if (passwordData.newPassword === passwordData.currentPassword) {
        setError('New password must be different from current password');
        setIsLoading(false);
        return;
      }

      const result = await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setSuccess('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update password');
      }
    } catch (error) {
      setError('An error occurred while updating your password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({
          ...profileData,
          profilePhoto: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

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
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <SafeIcon icon={FiIcons.FiX} className="text-xl" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('profile'); clearMessages(); }}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SafeIcon icon={FiUser} className="inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => { setActiveTab('email'); clearMessages(); }}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'email'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SafeIcon icon={FiMail} className="inline mr-2" />
            Email
          </button>
          <button
            onClick={() => { setActiveTab('password'); clearMessages(); }}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SafeIcon icon={FiLock} className="inline mr-2" />
            Password
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="m-6 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex items-center">
            <SafeIcon icon={FiCheck} className="mr-2" />
            {success}
          </div>
        )}
        {error && (
          <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center">
            <SafeIcon icon={FiX} className="mr-2" />
            {error}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="p-6">
            {/* Profile Photo Section */}
            <div className="mb-8 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  {profileData.profilePhoto ? (
                    <img
                      src={profileData.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-white text-2xl font-bold">
                        {profileData.firstName[0]}{profileData.lastName[0]}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <SafeIcon icon={FiCamera} className="text-sm" />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500">Click the camera icon to upload a photo</p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiPhone} className="inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiBriefcase} className="inline mr-2" />
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={profileData.company}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about your professional background..."
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SafeIcon icon={FiSave} />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="p-6">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Current Email</h4>
                <p className="text-blue-800">{user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Email Address *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiMail} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    name="newEmail"
                    value={emailData.newEmail}
                    onChange={handleEmailChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your new email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPasswords.emailCurrent ? 'text' : 'password'}
                    name="currentPassword"
                    value={emailData.currentPassword}
                    onChange={handleEmailChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('emailCurrent')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <SafeIcon icon={showPasswords.emailCurrent ? FiEyeOff : FiEye} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SafeIcon icon={FiMail} />
                <span>{isLoading ? 'Updating...' : 'Update Email'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <SafeIcon icon={showPasswords.current ? FiEyeOff : FiEye} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <SafeIcon icon={showPasswords.new ? FiEyeOff : FiEye} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <SafeIcon icon={showPasswords.confirm ? FiEyeOff : FiEye} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SafeIcon icon={FiLock} />
                <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

export default UserProfile;