import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaCheckCircle, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import OTPVerificationModal from '../../components/auth/OTPVerificationModal';
import { useForm } from '../../hooks';
import { validateRegisterForm } from '../../utils/validators';
import api from '../../utils/api';
import { ROUTES } from '../../utils/constants';

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  const {
    values,
    errors,
    touched,
    isSubmitting: loading,
    handleChange,
    handleBlur,
    handleSubmit: handleHookSubmit,
    setFieldError,
  } = useForm(
    { name: '', email: '', password: '', confirmPassword: '', agreeTerms: false },
    validateRegisterForm
  );

  const onSubmit = async (data) => {
    setError('');

    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });

      if (response.data.requiresVerification) {
        setRegistrationData({
          email: response.data.email,
          userId: response.data.userId
        });
        setShowOTPModal(true);
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    } catch (err) {
      const response = err.response?.data;

      if (response?.errors && Array.isArray(response.errors)) {
        response.errors.forEach(err => {
          if (err.field) {
            setFieldError(err.field, err.message);
          }
        });
        setError('Please fix the errors below');
      } else {
        setError(response?.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <>
      {/* OTP Verification Modal */}
      {showOTPModal && registrationData && (
        <OTPVerificationModal
          email={registrationData.email}
          userId={registrationData.userId}
          onClose={() => setShowOTPModal(false)}
        />
      )}

      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          {/* Main Content */}
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
                  Create Your Account
                </h1>
                <p className="text-lg text-zinc-400">
                  Join ProjectHub and get expert help with your assignments.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-blue-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Expert Assistance</p>
                    <p className="text-sm text-zinc-500">Get help from experienced professionals</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-blue-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Track Progress</p>
                    <p className="text-sm text-zinc-500">Monitor your assignments in real-time</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-blue-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Secure & Private</p>
                    <p className="text-sm text-zinc-500">Your data is encrypted and protected</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-blue-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-white font-medium">24/7 Support</p>
                    <p className="text-sm text-zinc-500">We're here whenever you need us</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Register Card */}
            <div>
              <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-8 space-y-6">
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Get Started
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Create your free account
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {typeof error === 'string' ? error : (
                      <div>
                        <p className="font-semibold mb-1">Password requirements not met:</p>
                        {error}
                      </div>
                    )}
                  </div>
                )}

                {/* Register Form */}
                <form onSubmit={handleHookSubmit(onSubmit)} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUser className="w-4 h-4 text-zinc-500" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-11 pr-4 py-3 bg-zinc-800/50 border ${touched.name && errors.name ? 'border-red-500' : 'border-zinc-700/50'} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                        placeholder="John Doe"
                      />
                    </div>
                    {touched.name && errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaEnvelope className="w-4 h-4 text-zinc-500" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-11 pr-4 py-3 bg-zinc-800/50 border ${touched.email && errors.email ? 'border-red-500' : 'border-zinc-700/50'} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {touched.email && errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="w-4 h-4 text-zinc-500" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-11 pr-12 py-3 bg-zinc-800/50 border ${touched.password && errors.password ? 'border-red-500' : 'border-zinc-700/50'} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                        placeholder="Min 12 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.password && errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                  </div>

                  {/* Password Strength Meter */}
                  {values.password && (
                    <PasswordStrengthMeter password={values.password} />
                  )}

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="w-4 h-4 text-zinc-500" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-11 pr-12 py-3 bg-zinc-800/50 border ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-zinc-700/50'} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-3">
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          name="agreeTerms"
                          checked={values.agreeTerms}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div
                          onClick={() => handleChange({ target: { name: 'agreeTerms', type: 'checkbox', checked: !values.agreeTerms } })}
                          className={`w-5 h-5 border ${touched.agreeTerms && errors.agreeTerms ? 'border-red-500' : 'border-zinc-600'} rounded-md bg-zinc-800/50 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center cursor-pointer`}
                        >
                          {values.agreeTerms && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-zinc-400">
                        I agree to the{' '}
                        <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
                      </span>
                    </div>
                    {touched.agreeTerms && errors.agreeTerms && <p className="text-xs text-red-500">{errors.agreeTerms}</p>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-zinc-800"></div>
                  <span className="text-xs text-zinc-500">Already have an account?</span>
                  <div className="flex-1 h-px bg-zinc-800"></div>
                </div>

                {/* Sign In Link */}
                <Link
                  to="/auth/login"
                  className="block w-full py-3 px-6 text-sm font-medium text-center text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
