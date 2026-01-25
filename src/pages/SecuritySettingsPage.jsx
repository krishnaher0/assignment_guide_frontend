import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ActiveSessions from '../components/security/ActiveSessions';
import { FaShieldAlt, FaLock, FaMobileAlt, FaChevronRight } from 'react-icons/fa';
import api from '../utils/api';

const SecuritySettingsPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const submitPasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        try {
            setLoading(true);
            await api.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err) {
            setPasswordMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to update password'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDisableMFA = async () => {
        if (!window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) return;

        const password = prompt('Please enter your password to confirm:');
        if (!password) return;

        try {
            await api.post('/mfa/disable', { password });
            window.location.reload(); // Refresh to update user state
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to disable MFA');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Security Settings</h1>

            {/* Two-Factor Authentication */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user?.mfaEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            <FaShieldAlt size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
                            <p className="text-gray-500 mt-1">
                                {user?.mfaEnabled
                                    ? 'Your account is protected with 2FA.'
                                    : 'Add an extra layer of security to your account.'}
                            </p>
                        </div>
                    </div>

                    {user?.mfaEnabled ? (
                        <button
                            onClick={handleDisableMFA}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                        >
                            Disable 2FA
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/mfa-setup')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        >
                            Enable 2FA
                        </button>
                    )}
                </div>
            </div>

            {/* Password Change */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <FaLock size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                            <p className="text-gray-500 mt-1">Update your password regularly to keep your account secure.</p>
                        </div>
                    </div>

                    <form onSubmit={submitPasswordChange} className="max-w-md space-y-4">
                        {passwordMessage.text && (
                            <div className={`p-3 rounded-lg text-sm ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                {passwordMessage.text}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmNewPassword"
                                value={passwordData.confirmNewPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Active Sessions */}
            <ActiveSessions />
        </div>
    );
};

export default SecuritySettingsPage;
