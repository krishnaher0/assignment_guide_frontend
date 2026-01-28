import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateLoginForm } from '../../utils/validators';
import { useForm } from '../../hooks';
import { ROUTES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import OTPInput from '../../components/auth/OTPInput';
import OTPVerificationModal from '../../components/auth/OTPVerificationModal';

export default function Login() {
  const navigate = useNavigate();
  const { login, verifyMfaLogin } = useAuth();
  const [error, setError] = useState('');
  const [mfaStep, setMfaStep] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [mfaMethod, setMfaMethod] = useState('otp'); // 'otp' or 'backup'
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState(null);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(
    { email: '', password: '', remember: false },
    validateLoginForm
  );

  const onSubmit = async (data) => {
    try {
      setError('');
      console.log('[Login] Attempting login for:', data.email);
      const response = await login(data.email, data.password);
      console.log('[Login] Login response received:', response);

      if (response.mfaRequired) {
        console.log('[Login] MFA required, showing MFA step');
        setMfaStep(true);
        setTempUserId(response.userId);
      } else if (response.requiresVerification) {
        console.log('[Login] Email verification required');
        // Email verification required
        setVerificationData({
          email: response.email || data.email,
          userId: response.userId
        });
        setShowEmailVerificationModal(true);
      } else {
        console.log('[Login] Login successful, navigating to dashboard');
        navigate(ROUTES.DASHBOARD);
      }
    } catch (err) {
      console.log('[Login] Login error:', err);
      const response = err.response?.data;

      // Check if error is due to unverified email
      if (response?.requiresVerification) {
        setVerificationData({
          email: response.email || data.email,
          userId: response.userId
        });
        setShowEmailVerificationModal(true);
      } else {
        setError(response?.message || 'Invalid email or password');
      }
    }
  };

  const [mfaCode, setMfaCode] = useState('');

  const handleMfaComplete = async (code) => {
    try {
      setError('');
      await verifyMfaLogin(tempUserId, code || mfaCode, mfaMethod === 'backup');
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    }
  };

  return (
    <>
      {/* Email Verification Modal */}
      {showEmailVerificationModal && verificationData && (
        <OTPVerificationModal
          email={verificationData.email}
          userId={verificationData.userId}
          onClose={() => setShowEmailVerificationModal(false)}
        />
      )}

      {mfaStep ? (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
          <div className="sm:mx-auto sm:w-full sm:max-w-lg">
            <Link to="/" className="flex items-center justify-center gap-2 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">&lt;/&gt;</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">ProjectHub</span>
            </Link>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Two-Step Verification
            </h2>
            <p className="mt-2 text-center text-gray-600">
              {mfaMethod === 'otp'
                ? 'Enter the 6-digit code from your authenticator app'
                : 'Enter one of your 8-digit backup codes'}
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
            <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-100">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
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
                <Button
                  onClick={() => handleMfaComplete(mfaCode)}
                  fullWidth
                  size="lg"
                  disabled={mfaCode.length !== (mfaMethod === 'otp' ? 6 : 8)}
                >
                  Verify Code
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setMfaMethod(mfaMethod === 'otp' ? 'backup' : 'otp');
                      setMfaCode('');
                      setError('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center gap-2 mx-auto"
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

              <div className="mt-4 text-center">
                <button
                  onClick={() => setMfaStep(false)}
                  className="text-sm text-gray-400 hover:text-gray-500"
                >
                  Back to login
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            {/* Logo */}
            <Link to="/" className="flex items-center justify-center gap-2 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">&lt;/&gt;</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">ProjectHub</span>
            </Link>

            <h2 className="text-center text-3xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-center text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-100">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && errors.email}
                  required
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && errors.password}
                  required
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={values.remember}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>

                  <Link to="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                  Sign In
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Don't have an account?
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button to={ROUTES.REGISTER} variant="outline" fullWidth>
                    Create Account
                  </Button>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500">
              <Link to="/" className="text-blue-600 hover:text-blue-700">
                &larr; Back to Home
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
