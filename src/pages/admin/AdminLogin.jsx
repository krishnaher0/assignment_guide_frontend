import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaShieldAlt, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaCheckCircle, FaUserShield, FaCode } from 'react-icons/fa';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, logout, user } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState({ type: '', message: '' });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'developer') {
        navigate('/developer', { replace: true });
      } else {
        navigate('/dashboard/client', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedInUser = await login(formData.email, formData.password);

      // Role-based routing - only allow admin and developer
      if (loggedInUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedInUser.role === 'developer') {
        navigate('/developer');
      } else {
        // Client users should not use this portal - log them out
        logout();
        setError('Access denied. This portal is for admin and developer accounts only. Please use the client login.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    setResetStatus({ type: '', message: '' });

    try {
      // This would call your API endpoint for password reset
      // await api.post('/auth/forgot-password', { email: resetEmail });
      setResetStatus({
        type: 'success',
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetStatus({ type: '', message: '' });
      }, 3000);
    } catch (err) {
      setResetStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to send reset email. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6 overflow-hidden">
      <div className="w-full max-w-4xl">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Info */}
          <div className="space-y-8">
            <div>
              <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                  <span className="text-white font-bold text-lg">&lt;/&gt;</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-white block">ProjectHub</span>
                  <span className="text-xs text-zinc-500">Control Center</span>
                </div>
              </Link>
              <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-4">
                Admin & Developer Portal
              </h1>
              <p className="text-lg text-zinc-400">
                Manage tasks, developers, and payments from one central dashboard.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaCheckCircle className="text-blue-400 text-xs" />
                </div>
                <div>
                  <p className="text-white font-medium">Task Management</p>
                  <p className="text-sm text-zinc-500">Assign, track, and manage all client tasks</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaCheckCircle className="text-violet-400 text-xs" />
                </div>
                <div>
                  <p className="text-white font-medium">Developer Tools</p>
                  <p className="text-sm text-zinc-500">Update status, track earnings, manage profile</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaCheckCircle className="text-emerald-400 text-xs" />
                </div>
                <div>
                  <p className="text-white font-medium">Payment Tracking</p>
                  <p className="text-sm text-zinc-500">Verify payments and manage transactions</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaCheckCircle className="text-amber-400 text-xs" />
                </div>
                <div>
                  <p className="text-white font-medium">Real-time Updates</p>
                  <p className="text-sm text-zinc-500">Get instant notifications on important events</p>
                </div>
              </div>
            </div>

            {/* Role Badges */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                <FaUserShield className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Admin Access</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20">
                <FaCode className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-violet-400">Developer Access</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div>
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-8 space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 mb-4">
                  <FaShieldAlt className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-sm text-zinc-400">
                  Sign in to access your dashboard
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="w-4 h-4 text-zinc-500" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="w-4 h-4 text-zinc-500" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="w-full pl-11 pr-12 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 border border-zinc-600 rounded-md bg-zinc-800/50 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                        {rememberMe && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 via-violet-500 to-purple-600 rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FaShieldAlt className="w-4 h-4" />
                      Sign In Securely
                    </span>
                  )}
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0f0f14] border border-zinc-800/50 rounded-2xl w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                  setResetStatus({ type: '', message: '' });
                }}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-zinc-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {resetStatus.message && (
              <div className={`p-4 rounded-xl ${
                resetStatus.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}>
                <p className={`text-sm ${
                  resetStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {resetStatus.message}
                </p>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="w-4 h-4 text-zinc-500" />
                  </div>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                    setResetStatus({ type: '', message: '' });
                  }}
                  className="flex-1 py-3 px-4 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
