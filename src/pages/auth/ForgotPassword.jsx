import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

import { useForm } from '../../hooks';
import { validators } from '../../utils/validators';

export default function ForgotPassword() {
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
        { email: '' },
        (val) => {
            const errors = {};
            const emailErr = validators.email(val.email);
            if (emailErr) errors.email = emailErr;
            return errors;
        }
    );

    const onSubmit = async (data) => {
        setMessage('');

        try {
            await api.post('/auth/forgot-password', { email: data.email });
            setStatus('success');
            setMessage('If an account exists with this email, you will receive a password reset link shortly.');
        } catch (err) {
            setStatus('error');
            const response = err.response?.data;
            if (response?.errors && Array.isArray(response.errors)) {
                response.errors.forEach(e => {
                    if (e.field) setFieldError(e.field, e.message);
                });
            }
            setMessage(response?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 -mt-20">
            <div className="max-w-md w-full bg-[#0a0a0f] p-8 rounded-2xl border border-zinc-800 shadow-xl">
                <Link to="/auth/login" className="inline-flex items-center text-zinc-500 hover:text-white mb-6 transition-colors">
                    <FaArrowLeft className="mr-2 text-xs" /> Back to Login
                </Link>

                <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                <p className="text-zinc-400 mb-8">Enter your email address and we'll send you a link to reset your password.</p>

                {status === 'success' ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 mb-6">
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {status === 'error' && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                                {message}
                            </div>
                        )}

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
                                    className={`w-full pl-11 pr-4 py-3 bg-zinc-800/50 border ${touched.email && errors.email ? 'border-red-500' : 'border-zinc-700/50'} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {touched.email && errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-6 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
