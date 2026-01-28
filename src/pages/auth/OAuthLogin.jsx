import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaGithub, FaCheckCircle, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import OTPInput from '../../components/auth/OTPInput';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// Colorful Google logo SVG
const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
import api from '../../utils/api';

// Cache OAuth URLs to prevent duplicate requests
let cachedOAuthUrls = null;

export default function AuthLogin() {
  const navigate = useNavigate();
  const { user, login, verifyMfaLogin } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [loading, setLoading] = useState(false);
  const [oauthUrls, setOauthUrls] = useState(cachedOAuthUrls);
  const [error, setError] = useState(null);
  const [configured, setConfigured] = useState(true);
  const fetchedRef = useRef(false);

  // Email/Password login state
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // MFA state
  const [mfaStep, setMfaStep] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [mfaMethod, setMfaMethod] = useState('otp'); // 'otp' or 'backup'

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

  useEffect(() => {
    // Prevent duplicate requests (React Strict Mode calls effects twice)
    if (fetchedRef.current || cachedOAuthUrls) {
      if (cachedOAuthUrls) setOauthUrls(cachedOAuthUrls);
      return;
    }
    fetchedRef.current = true;

    const fetchOAuthUrls = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/auth/oauth-urls`);
        cachedOAuthUrls = data; // Cache for future use
        setOauthUrls(data);
        setConfigured(true);
        setError(null);
      } catch (error) {
        console.error('Error fetching OAuth URLs:', error);
        if (error.response?.status === 503) {
          setConfigured(false);
          setError('OAuth providers are not configured. Please contact support.');
        } else if (error.response?.status === 429) {
          setError('Too many requests. Please wait a moment and refresh.');
        } else {
          setError('Failed to load authentication options');
        }
        setOauthUrls(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOAuthUrls();
  }, []);

  const handleOAuthClick = (provider) => {
    if (oauthUrls?.[provider]) {
      window.location.href = oauthUrls[provider];
    } else {
      setError(`OAuth not configured for ${provider}`);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let captchaToken = null;

      // Execute reCAPTCHA if available
      if (executeRecaptcha) {
        try {
          captchaToken = await executeRecaptcha('login');
          console.log('[reCAPTCHA] Token generated');
        } catch (captchaError) {
          console.error('[reCAPTCHA] Error:', captchaError);
        }
      }

      const response = await login(formData.email, formData.password, captchaToken);

      // Check if MFA is required
      if (response.mfaRequired) {
        console.log('[OAuthLogin] MFA required, showing MFA step');
        setMfaStep(true);
        setTempUserId(response.userId);
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (response.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.role === 'developer') {
        navigate('/developer');
      } else {
        navigate('/dashboard/client');
      }
    } catch (err) {
      const errorData = err.response?.data;

      // Check if CAPTCHA is specifically required
      if (errorData?.requiresCaptcha) {
        setError('Security verification required. Please try logging in again.');
      } else {
        setError(errorData?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const [mfaCode, setMfaCode] = useState('');

  const handleMfaComplete = async (code) => {
    try {
      setError(null);
      setLoading(true);
      const response = await verifyMfaLogin(tempUserId, code || mfaCode, mfaMethod === 'backup');

      // Redirect based on role
      if (response.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.role === 'developer') {
        navigate('/developer');
      } else {
        navigate('/dashboard/client');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#09090b] flex items-center justify-center px-6 overflow-hidden">
      <div className="w-full max-w-4xl">
        {/* MFA Step */}
        {mfaStep ? (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-blue-400 text-sm transition-colors mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to website
              </Link>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Two-Step Verification
              </h2>
              <p className="text-sm text-zinc-400">
                {mfaMethod === 'otp'
                  ? 'Enter the 6-digit code from your authenticator app'
                  : 'Enter one of your 8-digit backup codes'}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-8 space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="py-2 mb-6">
                <OTPInput
                  length={mfaMethod === 'otp' ? 6 : 8}
                  onComplete={handleMfaComplete}
                  onChange={setMfaCode}
                  alphanumeric={mfaMethod === 'backup'}
                />
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleMfaComplete(mfaCode)}
                  disabled={loading || mfaCode.length !== (mfaMethod === 'otp' ? 6 : 8)}
                  className="w-full py-3 px-6 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  Verify Code
                </button>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setMfaMethod(mfaMethod === 'otp' ? 'backup' : 'otp');
                      setMfaCode('');
                      setError(null);
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    {mfaMethod === 'otp' ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Use a backup code instead
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Use authenticator app
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    setMfaStep(false);
                    setError(null);
                  }}
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Back to login
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Main Content */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Info */}
            <div className="space-y-8">
              <div>
                <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-blue-400 text-sm transition-colors mb-6">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to website
                </Link>
                <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-4">
                  Get Your Project Done
                </h1>
                <p className="text-lg text-zinc-400">
                  Submit your project and relax — our experts will handle it completely.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-blue-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Expert Completion</p>
                    <p className="text-sm text-zinc-500">Projects handled by experienced developers</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-blue-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Quality Guaranteed</p>
                    <p className="text-sm text-zinc-500">Your project done right, every time</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-blue-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Fast Turnaround</p>
                    <p className="text-sm text-zinc-500">Get it done in hours, not days</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-blue-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Stress-Free</p>
                    <p className="text-sm text-zinc-500">No more all-nighters, we've got this</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Card */}
            <div>
              <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-8 space-y-6">
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Get Started
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Sign in to get your project completed fast
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Configuration Warning */}
                {!configured && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm font-medium text-amber-400 mb-2">OAuth Configuration Required</p>
                    <p className="text-xs text-amber-400/70">To enable OAuth login, configure:</p>
                    <ul className="text-xs text-amber-400/70 mt-2 list-disc list-inside space-y-1">
                      <li>Google OAuth credentials</li>
                      <li>GitHub OAuth credentials</li>
                    </ul>
                  </div>
                )}

                {/* Toggle between OAuth and Email login */}
                {!showEmailLogin ? (
                  <>
                    {/* OAuth Buttons */}
                    {configured && oauthUrls && (
                      <div className="space-y-3">
                        <a
                          href={oauthUrls.google}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-zinc-900 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors"
                        >
                          <GoogleIcon />
                          Sign in with Google
                        </a>

                        <a
                          href={oauthUrls.github}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-800 text-white rounded-xl text-sm font-medium hover:bg-zinc-700 border border-zinc-700/50 transition-colors"
                        >
                          <FaGithub className="text-base" />
                          Sign in with GitHub
                        </a>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-zinc-800"></div>
                      <span className="text-xs text-zinc-500">or</span>
                      <div className="flex-1 h-px bg-zinc-800"></div>
                    </div>

                    {/* Email Login Button */}
                    <button
                      onClick={() => setShowEmailLogin(true)}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <FaEnvelope className="text-base" />
                      Sign in with Email
                    </button>

                    {/* Register Link */}
                    <p className="text-center text-sm text-zinc-500">
                      Don't have an account?{' '}
                      <Link to="/auth/register" className="text-blue-400 hover:text-blue-300">
                        Create one
                      </Link>
                    </p>
                  </>
                ) : (
                  <>
                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
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

                      {/* Forgot Password Link */}
                      <div className="text-right">
                        <Link
                          to="/auth/forgot-password"
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Forgot Password?
                        </Link>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-6 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Signing in...' : 'Sign In'}
                      </button>
                    </form>

                    {/* Back to OAuth */}
                    {configured && oauthUrls && (
                      <button
                        onClick={() => setShowEmailLogin(false)}
                        className="w-full text-center text-sm text-zinc-500 hover:text-zinc-300"
                      >
                        ← Back to social login
                      </button>
                    )}

                    {/* Register Link */}
                    <p className="text-center text-sm text-zinc-500">
                      Don't have an account?{' '}
                      <Link to="/auth/register" className="text-blue-400 hover:text-blue-300">
                        Create one
                      </Link>
                    </p>
                  </>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
