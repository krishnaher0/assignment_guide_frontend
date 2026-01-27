import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import { useForm } from '../../hooks';
import { validators } from '../../utils/validators';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle'); // idle, success, error
    const [message, setMessage] = useState('');

    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldError
    } = useForm(
        { password: '', confirmPassword: '' },
        (val) => {
            const errors = {};
            const passwordErr = validators.password(val.password);
            if (passwordErr) errors.password = passwordErr;

            const matchErr = validators.passwordMatch(val.password, val.confirmPassword);
            if (matchErr) errors.confirmPassword = matchErr;
            return errors;
        }
    );

    const onSubmit = async (data) => {
        setMessage('');

        try {
            await api.put(`/auth/reset-password/${token}`, { password: data.password });
            setStatus('success');
            setTimeout(() => navigate('/auth/login'), 3000);
        } catch (err) {
            setStatus('error');
            const response = err.response?.data;
            if (response?.errors && Array.isArray(response.errors)) {
                response.errors.forEach(e => {
                    if (e.field) setFieldError(e.field, e.message);
                });
            }
            setMessage(response?.message || 'Failed to reset password. Link may be expired.');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center -mt-20">
                <div className="max-w-md w-full bg-[#0a0a0f] p-8 rounded-2xl border border-zinc-800 shadow-xl text-center">
                    <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Password Reset Successful!</h2>
                    <p className="text-zinc-400 mb-6">You can now log in with your new password.</p>
                    <Link
                        to="/auth/login"
                        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                    >
                        Sign In Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 -mt-20">
            <div className="max-w-md w-full bg-[#0a0a0f] p-8 rounded-2xl border border-zinc-800 shadow-xl">
                <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
                <p className="text-zinc-400 mb-8">Please enter your new password below.</p>

                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 mb-6 text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaLock className="w-4 h-4 text-zinc-500" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full pl-11 pr-4 py-3 bg-zinc-800/50 border ${touched.password && errors.password ? 'border-red-500' : 'border-zinc-700/50'} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none`}
                                placeholder="Min 12 chars"
                            />
                        </div>
                        {touched.password && errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        {values.password && <PasswordStrengthMeter password={values.password} />}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Confirm Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaLock className="w-4 h-4 text-zinc-500" />
                            </div>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={values.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full pl-11 pr-4 py-3 bg-zinc-800/50 border ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-zinc-700/50'} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none`}
                                placeholder="Confirm password"
                            />
                        </div>
                        {touched.confirmPassword && errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-6 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
