import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBg = scrolled
    ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5'
    : 'bg-transparent';

  const links = [
    { name: 'Services', path: '/services' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">&lt;/&gt;</span>
            </div>
            <span className="text-xl font-bold text-white">CodeSupport</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                      <FaUser className="text-white text-xs" />
                    </div>
                    <span className="text-sm text-gray-300">{user.name || user.email}</span>
                    <FaChevronDown className={`text-xs text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1f] rounded-xl border border-white/10 shadow-lg z-50">
                      <Link
                        to={user.role === 'developer' ? '/developer-dashboard' : '/customer-dashboard'}
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-3 text-gray-300 hover:bg-white/5 text-sm font-medium border-b border-white/5"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-3 text-gray-300 hover:bg-white/5 text-sm font-medium border-b border-white/5"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                          navigate('/');
                        }}
                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 text-sm font-medium flex items-center gap-2"
                      >
                        <FaSignOutAlt className="text-xs" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="px-5 py-2.5 text-gray-300 hover:text-white text-sm font-semibold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/submit-task"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/5">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-gray-400 hover:text-white font-medium"
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <>
                <div className="py-3 border-t border-white/5 my-3">
                  <div className="text-sm text-gray-400 mb-3">{user.email}</div>
                </div>
                <Link
                  to={user.role === 'developer' ? '/developer-dashboard' : '/customer-dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-5 text-gray-300 hover:text-white font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-5 text-gray-300 hover:text-white font-medium"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    navigate('/');
                  }}
                  className="w-full text-left py-3 px-5 text-red-400 hover:bg-red-500/10 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-5 text-gray-300 hover:text-white font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/submit-task"
                  onClick={() => setMobileOpen(false)}
                  className="block mt-4 py-3 px-5 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-center font-semibold rounded-xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
