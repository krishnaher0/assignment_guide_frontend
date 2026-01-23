import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FaCode,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaBell,
  FaSignOutAlt,
  FaTh,
  FaBullhorn
} from 'react-icons/fa';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { info } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const getInitials = (name, email) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (email) return email[0].toUpperCase();
    return 'U';
  };

  const getDisplayName = (user) => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const navLinks = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Benefits', href: '/#benefits' },
    { label: 'Testimonials', href: '/#testimonials' },
    { label: 'FAQ', href: '/#faq' }
  ];

  return (
    <>
      {/* Feature Announcement Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5 flex-1">
            <FaBullhorn className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            <span className="text-left leading-snug">Currently available via WhatsApp only. Other features coming soon.</span>
          </div>
          <a 
            href="https://wa.me/9779866291003?text=Hi!%20I%20need%20help%20with%20my%20assignment."
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline whitespace-nowrap flex-shrink-0"
          >
            Try Now →
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="fixed top-13 sm:top-10 left-0 right-0 z-50 border-b border-zinc-800/50 bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 sm:py-5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <FaCode className="text-white text-xs sm:text-sm" />
            </div>
            <span className="hidden md:inline text-base sm:text-lg font-semibold text-white tracking-tight">ProjectHub</span>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs sm:text-sm font-medium flex-shrink-0">
                      {getInitials(user.name, user.email)}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm text-white font-medium truncate max-w-[80px]">{getDisplayName(user).split(' ')[0]}</span>
                  <FaChevronDown className={`text-xs text-zinc-400 transition-transform flex-shrink-0 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 rounded-xl border border-zinc-800/50 bg-zinc-900 shadow-xl py-2 z-50">
                    <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-zinc-800/50">
                      <p className="text-xs sm:text-sm font-medium text-white truncate">{getDisplayName(user)}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/dashboard/client');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm text-zinc-300 hover:bg-zinc-800/50 transition-colors"
                      >
                        <FaTh className="text-zinc-500 flex-shrink-0" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm text-zinc-300 hover:bg-zinc-800/50 transition-colors"
                      >
                        <FaBell className="text-zinc-500 flex-shrink-0" />
                        Notifications
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-400 hover:bg-zinc-800/50 transition-colors"
                      >
                        <FaSignOutAlt className="text-red-400 flex-shrink-0" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth/login')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Login
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800/50 bg-[#09090b] px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
    </>
  );
}
