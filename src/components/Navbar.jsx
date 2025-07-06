import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../context/AuthContext';
import GetStartedModal from './GetStartedModal';
import UserProfile from './UserProfile';

const { FiHome, FiUsers, FiBarChart3, FiSettings, FiLogOut, FiShield, FiBriefcase, FiMenu, FiX, FiPlayCircle, FiTrendingUp, FiUser } = FiIcons;

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome, allowedRoles: ['admin', 'financial_professional'] },
    { path: '/admin', label: 'Admin Panel', icon: FiShield, allowedRoles: ['admin'] },
    { path: '/life-insurance', label: 'Life Insurance', icon: FiBriefcase, allowedRoles: ['admin', 'financial_professional'] },
    { path: '/debt-stacking', label: 'Debt Stacking', icon: FiBarChart3, allowedRoles: ['admin', 'financial_professional'] }
  ];

  const filteredNavItems = navigationItems.filter(item =>
    item.allowedRoles.includes(user?.role)
  );

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10">
                <img
                  src="/prospertrack-icon.png"
                  alt="ProsperTrack™"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hidden items-center justify-center">
                  <SafeIcon icon={FiTrendingUp} className="text-white text-lg" />
                </div>
              </div>
              <span className="text-xl font-bold text-gray-900">ProsperTrack™</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <SafeIcon icon={item.icon} className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              {/* Get Started Button */}
              <button
                onClick={() => setShowGetStarted(true)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors"
              >
                <SafeIcon icon={FiPlayCircle} className="text-lg" />
                <span className="font-medium">Get Started</span>
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Desktop User Info */}
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => setShowUserProfile(true)}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="w-8 h-8 relative">
                    {user?.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {isAdmin() ? 'Administrator' : 'Financial Professional'}
                    </span>
                  </div>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                title="Logout"
              >
                <SafeIcon icon={FiLogOut} className="text-lg" />
                <span className="hidden md:inline">Logout</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <SafeIcon icon={isMobileMenuOpen ? FiX : FiMenu} className="text-xl" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <SafeIcon icon={item.icon} className="text-lg" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}

                {/* Mobile Get Started Button */}
                <button
                  onClick={() => {
                    setShowGetStarted(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors"
                >
                  <SafeIcon icon={FiPlayCircle} className="text-lg" />
                  <span className="font-medium">Get Started</span>
                </button>

                {/* Mobile User Info */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <button
                    onClick={() => {
                      setShowUserProfile(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors w-full"
                  >
                    <div className="w-10 h-10 relative">
                      {user?.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {isAdmin() ? 'Administrator' : 'Financial Professional'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* GetStarted Modal */}
      <GetStartedModal isOpen={showGetStarted} onClose={() => setShowGetStarted(false)} />

      {/* User Profile Modal */}
      <UserProfile isOpen={showUserProfile} onClose={() => setShowUserProfile(false)} />
    </>
  );
}

export default Navbar;