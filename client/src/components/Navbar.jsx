import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HeartHandshake,
  PlusCircle,
  Compass,
  Users,
  Bell,
  User,
  Shield,
  LogOut,
  LayoutDashboard,
  Award,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, login } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickLogin = async (email) => {
    setShowDemoModal(false);
    await login(email, 'password123');
    navigate('/explore');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight flex items-center gap-1.5">
                Community Help Hub
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 block -mt-1">
                PS58 • Neon Nexus
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/explore"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/explore')
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Requests
            </Link>

            <Link
              to="/circles"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/circles')
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              Help Circles
            </Link>

            <Link
              to="/requests/create"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/requests/create')
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Request Help
            </Link>
          </nav>

          {/* Right Section: Demo button, Notifications, User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Switcher Button for Judges */}
            <button
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors shadow-xs"
              title="Switch demo persona for testing"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span className="hidden sm:inline">Switch Demo Role</span>
              <span className="sm:hidden">Role</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="text-xs text-indigo-600 hover:underline font-medium"
                        >
                          View All
                        </Link>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                if (n.requestId) {
                                  navigate(`/requests/${n.requestId._id || n.requestId}`);
                                }
                                setShowNotifications(false);
                              }}
                              className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                                !n.read ? 'bg-indigo-50/50 font-medium' : 'text-slate-600'
                              }`}
                            >
                              <p className="text-slate-800">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {/* Menu Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {user.department || 'General'}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        My Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Award className="w-4 h-4 text-indigo-500" />
                        Contribution Passport
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                        >
                          <Shield className="w-4 h-4 text-rose-500" />
                          Admin Portal
                        </Link>
                      )}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/explore"
            onClick={() => setShowMobileMenu(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Explore Requests
          </Link>
          <Link
            to="/circles"
            onClick={() => setShowMobileMenu(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Help Circles
          </Link>
          <Link
            to="/requests/create"
            onClick={() => setShowMobileMenu(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50 font-semibold"
          >
            + Request Help
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                My Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Contribution Passport
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-rose-600 hover:bg-rose-50 font-semibold"
                >
                  Admin Portal
                </Link>
              )}
            </>
          )}
        </div>
      )}

      {/* Quick Demo Persona Switcher Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600">
                <Zap className="w-5 h-5 fill-indigo-500" />
                <h3 className="font-bold text-base text-slate-900">Hackathon Judge Quick-Switcher</h3>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 mb-4">
              Select any demo persona to test multi-helper coordination, verified completion, and circles with 1-click authentication:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleQuickLogin('sathesh@example.com')}
                className="w-full text-left p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 transition-colors flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-700">
                    Sathesh V (Requester Role)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    CSE Student • Posted "5 Event Volunteers" • Manages Offers
                  </p>
                </div>
                <span className="text-xs font-semibold text-indigo-600">Login →</span>
              </button>

              <button
                onClick={() => handleQuickLogin('tharun@example.com')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-700">
                    Tharun R (Helper Role 1)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    CSE Student • Offers help, marks assistance completed
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-600">Login →</span>
              </button>

              <button
                onClick={() => handleQuickLogin('priya@example.com')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-700">
                    Priya S (Helper Role 2 / Requester)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    CSE Student • Skills: DBMS, SQL • Verified Tutor
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-600">Login →</span>
              </button>

              <button
                onClick={() => handleQuickLogin('admin@communityhub.org')}
                className="w-full text-left p-3 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-100/70 transition-colors flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-rose-600" />
                    Admin User (Moderation Role)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Campus Admin • Live statistics, suspend users, resolve reports
                  </p>
                </div>
                <span className="text-xs font-semibold text-rose-600">Login →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
