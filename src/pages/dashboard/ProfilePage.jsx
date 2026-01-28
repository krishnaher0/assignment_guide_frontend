import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../utils/toastService';
import api from '../../utils/api';
import {
    FaUser, FaEnvelope, FaPhone, FaCamera, FaLock,
    FaShieldAlt, FaKey, FaChevronRight, FaChevronLeft,
    FaCheckCircle, FaDownload, FaTrash, FaExclamationTriangle,
    FaTimes, FaSpinner, FaMobileAlt
} from 'react-icons/fa';
import QRCodeDisplay from '../../components/auth/QRCodeDisplay';
import OTPInput from '../../components/auth/OTPInput';
import { useForm } from '../../hooks';
import { validateUpdateProfileForm, validateRegisterForm } from '../../utils/validators';

export default function ProfilePage() {
    const { user, updateUserProfile, logout } = useAuth();
    const fileInputRef = useRef(null);

    // Profile Form
    const {
        values: profileValues,
        errors: profileErrors,
        touched: profileTouched,
        isSubmitting: isUpdatingProfile,
        handleChange: handleProfileChange,
        handleBlur: handleProfileBlur,
        handleSubmit: handleProfileSubmit,
        setFieldError: setProfileFieldError
    } = useForm(
        { name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '' },
        validateUpdateProfileForm
    );

    // Password Form
    const {
        values: passwordValues,
        errors: passwordErrors,
        touched: passwordTouched,
        isSubmitting: isUpdatingPassword,
        handleChange: handlePasswordChange,
        handleBlur: handlePasswordBlur,
        handleSubmit: handlePasswordSubmit,
        reset: resetPasswordForm,
        setFieldError: setPasswordFieldError
    } = useForm(
        { currentPassword: '', newPassword: '', confirmPassword: '' },
        (val) => {
            const errors = {};
            if (!val.currentPassword) errors.currentPassword = 'Current password is required';

            // Re-use register form's password complexity rules for new password
            const newPwdErr = validateRegisterForm({
                name: 'x', email: 'x@x.com',
                password: val.newPassword,
                confirmPassword: val.confirmPassword,
                agreeTerms: true
            });

            if (newPwdErr.password) errors.newPassword = newPwdErr.password;
            if (newPwdErr.confirmPassword) errors.confirmPassword = newPwdErr.confirmPassword;

            return errors;
        }
    );

    // MFA State
    const [mfaStep, setMfaStep] = useState(0); // 0: initial, 1: setup, 2: success (backup codes)
    const [mfaSetupData, setMfaSetupData] = useState(null);
    const [backupCodes, setBackupCodes] = useState([]);
    const [isMfaLoading, setIsMfaLoading] = useState(false);
    const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);

    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Update Profile handler wrapper
    const handleProfileSubmitWrapper = handleProfileSubmit(async (data) => {
        try {
            await updateUserProfile(data);
            toast.success('Profile updated successfully');
        } catch (err) {
            const response = err.response?.data;
            if (response?.errors && Array.isArray(response.errors)) {
                response.errors.forEach(e => {
                    if (e.field) setProfileFieldError(e.field, e.message);
                });
            }
            toast.error(response?.message || 'Failed to update profile');
        }
    });

    // Handle Image Upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setIsUploadingImage(true);
        try {
            const { data } = await api.post('/upload/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await updateUserProfile({ profileImage: data.imageUrl });
            toast.success('Profile picture updated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload image');
        } finally {
            setIsUploadingImage(false);
        }
    };

    // Update Password handler wrapper
    const handlePasswordSubmitWrapper = handlePasswordSubmit(async (data) => {
        try {
            await api.put('/auth/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            toast.success('Password changed successfully');
            resetPasswordForm();
        } catch (err) {
            const response = err.response?.data;
            if (response?.errors && Array.isArray(response.errors)) {
                response.errors.forEach(e => {
                    if (e.field) setPasswordFieldError(e.field, e.message);
                });
            }
            toast.error(response?.message || 'Failed to change password');
        }
    });
    const startMfaSetup = async () => {
        setIsMfaLoading(true);
        try {
            const { data } = await api.post('/mfa/setup');
            setMfaSetupData(data);
            setMfaStep(1);
            setIsMfaModalOpen(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to start MFA setup');
        } finally {
            setIsMfaLoading(false);
        }
    };

    const closeMfaModal = () => {
        setIsMfaModalOpen(false);
        setMfaStep(0);
        setMfaSetupData(null);
    };

    const verifyMfaSetup = async (token) => {
        setIsMfaLoading(true);
        try {
            const { data } = await api.post('/mfa/verify-setup', { token });
            setBackupCodes(data.backupCodes);
            setMfaStep(2);
            toast.success('MFA enabled successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid code. Please try again.');
        } finally {
            setIsMfaLoading(false);
        }
    };

    const disableMfa = async () => {
        const password = prompt('Please enter your password to disable MFA:');
        if (!password) return;

        setIsMfaLoading(true);
        try {
            await api.post('/mfa/disable', { password });
            toast.success('MFA disabled');
            await updateUserProfile({});
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to disable MFA');
        } finally {
            setIsMfaLoading(false);
        }
    };

    const revokeSession = async (sessionId) => {
        try {
            await api.delete(`/sessions/${sessionId}`);
            toast.success('Session terminated');
            await updateUserProfile({});
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to terminate session');
        }
    };

    const logoutAllDevices = async () => {
        if (!window.confirm('Are you sure you want to log out from all devices? You will be logged out from this session as well.')) return;

        try {
            await api.delete('/sessions/logout-all');
            toast.success('Logged out from all devices');
            logout();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to logout from all devices');
        }
    };

    const revokeOtherSessions = async () => {
        if (!window.confirm('Logout from all other devices?')) return;

        try {
            await api.delete('/sessions/logout-others');
            toast.success('Other sessions terminated');
            await updateUserProfile({});
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to terminate other sessions');
        }
    };

    const downloadBackupCodes = () => {
        const element = document.createElement("a");
        const file = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "projecthub-backup-codes.txt";
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
                    <p className="text-zinc-400">Manage your profile information, security, and preferences.</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700">
                        Role: {user?.role?.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full border ${user?.isEmailVerified ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="space-y-8">
                    <div className="bg-[#0a0a0f] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                        {/* Profile Cover/Background */}
                        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative"></div>

                        <div className="px-6 pb-6 text-center">
                            {/* Avatar */}
                            <div className="relative -mt-12 mb-4 flex justify-center">
                                <div className="w-24 h-24 rounded-2xl border-4 border-[#0a0a0f] overflow-hidden bg-zinc-800 shadow-lg relative group">
                                    {user?.profileImage ? (
                                        <img
                                            src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5001${user.profileImage}`}
                                            alt={user?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-blue-600">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    {/* Upload Overlay */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                                        disabled={isUploadingImage}
                                    >
                                        {isUploadingImage ? <FaSpinner className="animate-spin" /> : <FaCamera className="text-xl" />}
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
                            <p className="text-sm text-zinc-400 mb-4">{user?.email}</p>

                            <div className="pt-4 border-t border-zinc-800 text-left space-y-3">
                                <div className="flex items-center gap-3 text-sm text-zinc-400">
                                    <FaEnvelope className="text-blue-500 w-4" />
                                    <span>{user?.email}</span>
                                </div>
                                {user?.phone && (
                                    <div className="flex items-center gap-3 text-sm text-zinc-400">
                                        <FaPhone className="text-blue-500 w-4" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Security Quick Stats */}
                    <div className="bg-[#0a0a0f] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
                        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Security Health</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-400">Password</span>
                                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Secure</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-400">2FA Protection</span>
                                {user?.mfaEnabled ? (
                                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Enabled</span>
                                ) : (
                                    <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded">Disabled</span>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-400">Login Alerts</span>
                                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Dynamic Sections */}
                <div className="lg:col-span-2 space-y-8">

                    {/* section: General Information */}
                    <section className="bg-[#0a0a0f] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <FaUser size={14} />
                            </div>
                            <h3 className="font-bold text-white">General Information</h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleProfileSubmitWrapper} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Display Name</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileValues.name}
                                            onChange={handleProfileChange}
                                            onBlur={handleProfileBlur}
                                            className={`w-full pl-11 pr-4 py-3 bg-zinc-800/50 border ${profileTouched.name && profileErrors.name ? 'border-red-500' : 'border-zinc-700/50'} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none`}
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    {profileTouched.name && profileErrors.name && <p className="mt-1 text-xs text-red-500">{profileErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileValues.phone}
                                            onChange={handleProfileChange}
                                            onBlur={handleProfileBlur}
                                            className={`w-full pl-11 pr-4 py-3 bg-zinc-800/50 border ${profileTouched.phone && profileErrors.phone ? 'border-red-500' : 'border-zinc-700/50'} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none`}
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                    {profileTouched.phone && profileErrors.phone && <p className="mt-1 text-xs text-red-500">{profileErrors.phone}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={profileValues.bio}
                                        onChange={handleProfileChange}
                                        onBlur={handleProfileBlur}
                                        className={`w-full px-4 py-3 bg-zinc-800/50 border ${profileTouched.bio && profileErrors.bio ? 'border-red-500' : 'border-zinc-700/50'} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none h-24 resize-none`}
                                        placeholder="Tell us a bit about yourself..."
                                    ></textarea>
                                    {profileTouched.bio && profileErrors.bio && <p className="mt-1 text-xs text-red-500">{profileErrors.bio}</p>}
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={isUpdatingProfile}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isUpdatingProfile ? <FaSpinner className="animate-spin" /> : 'Save Profile Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    {/* section: Security & Password */}
                    <section className="bg-[#0a0a0f] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                <FaLock size={14} />
                            </div>
                            <h3 className="font-bold text-white">Password & Security</h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handlePasswordSubmitWrapper} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Current Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4" />
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordValues.currentPassword}
                                            onChange={handlePasswordChange}
                                            onBlur={handlePasswordBlur}
                                            className={`w-full pl-11 pr-4 py-3 bg-zinc-800/50 border ${passwordTouched.currentPassword && passwordErrors.currentPassword ? 'border-red-500' : 'border-zinc-700/50'} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {passwordTouched.currentPassword && passwordErrors.currentPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.currentPassword}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">New Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4" />
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordValues.newPassword}
                                            onChange={handlePasswordChange}
                                            onBlur={handlePasswordBlur}
                                            className={`w-full pl-11 pr-4 py-3 bg-zinc-800/50 border ${passwordTouched.newPassword && passwordErrors.newPassword ? 'border-red-500' : 'border-zinc-700/50'} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none`}
                                            placeholder="Min 12 characters"
                                        />
                                    </div>
                                    {passwordTouched.newPassword && passwordErrors.newPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>}
                                    {passwordValues.newPassword && <PasswordStrengthMeter password={passwordValues.newPassword} />}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordValues.confirmPassword}
                                            onChange={handlePasswordChange}
                                            onBlur={handlePasswordBlur}
                                            className={`w-full pl-11 pr-4 py-3 bg-zinc-800/50 border ${passwordTouched.confirmPassword && passwordErrors.confirmPassword ? 'border-red-500' : 'border-zinc-700/50'} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {passwordTouched.confirmPassword && passwordErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>}
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={isUpdatingPassword}
                                        className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all border border-zinc-700 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isUpdatingPassword ? <FaSpinner className="animate-spin" /> : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    {/* section: Two-Factor Authentication */}
                    <section className="bg-[#0a0a0f] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                    <FaShieldAlt size={14} />
                                </div>
                                <h3 className="font-bold text-white">Two-Factor Authentication</h3>
                            </div>
                            {user?.mfaEnabled && (
                                <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium px-2 py-1 bg-green-400/10 rounded-full">
                                    <FaCheckCircle size={10} /> Active
                                </span>
                            )}
                        </div>
                        <div className="p-6">
                            {user?.mfaEnabled ? (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 flex-shrink-0">
                                            <FaMobileAlt size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Google Authenticator is enabled</p>
                                            <p className="text-sm text-zinc-400 mt-1">Your account is protected by an additional layer of security.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={disableMfa}
                                            disabled={isMfaLoading}
                                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-medium transition-all"
                                        >
                                            Disable 2FA
                                        </button>
                                        <p className="text-xs text-zinc-500 italic">Disabling MFA is not recommended.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center space-y-4">
                                        <p className="text-zinc-400 max-w-lg mx-auto">
                                            Protect your account from unauthorized access with Two-Factor Authentication.
                                            You will need to scan a QR code with an app like Google Authenticator.
                                        </p>
                                        <button
                                            onClick={startMfaSetup}
                                            disabled={isMfaLoading}
                                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                                        >
                                            {isMfaLoading ? <FaSpinner className="animate-spin" /> : 'Enable MFA Protection'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* MFA Setup Modal */}
                    {isMfaModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                            <div className="bg-[#0a0a0f] border border-zinc-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-scaleIn">
                                {/* Modal Header */}
                                <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <FaShieldAlt size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">MFA Setup</h3>
                                            <p className="text-sm text-zinc-500">Secure your account with 2FA</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeMfaModal}
                                        className="w-10 h-10 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all flex items-center justify-center"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="p-8">
                                    {mfaStep === 1 && mfaSetupData && (
                                        <div className="space-y-10">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                                                {/* Left Column: QR */}
                                                <div className="space-y-4">
                                                    <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl flex justify-center items-center group transition-transform hover:scale-[1.03] duration-500">
                                                        <QRCodeDisplay
                                                            value={mfaSetupData.otpauthUrl}
                                                            size={190}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Right Column: OTP */}
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <h4 className="text-white font-black text-lg tracking-tight">Setup Authentication</h4>
                                                        <p className="text-zinc-400 text-sm leading-relaxed">Scan the QR code with your authenticator app, then enter the 6-digit code below.</p>
                                                    </div>

                                                    <div className="flex justify-center lg:justify-start">
                                                        <OTPInput onComplete={verifyMfaSetup} />
                                                    </div>

                                                    <div className="pt-6 border-t border-zinc-800/50">
                                                        <p className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Manual Key (Click to copy)</p>
                                                        <code className="block p-3 bg-zinc-900 border border-zinc-700/50 rounded-xl text-blue-400 font-mono text-xs text-center cursor-pointer hover:bg-zinc-800 transition-colors"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(mfaSetupData.secret);
                                                                toast.success('Key copied');
                                                            }}
                                                        >
                                                            {mfaSetupData.secret.match(/.{1,4}/g).join(' ')}
                                                        </code>
                                                    </div>
                                                </div>
                                            </div>

                                            {isMfaLoading && (
                                                <div className="flex items-center justify-center gap-3 py-3 text-blue-400 bg-blue-500/5 rounded-2xl border border-blue-400/10">
                                                    <FaSpinner className="animate-spin" />
                                                    <span className="text-xs font-bold uppercase tracking-widest">Validating...</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {mfaStep === 2 && (
                                        <div className="space-y-8 py-4">
                                            <div className="text-center space-y-3">
                                                <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-500 mx-auto text-3xl shadow-lg shadow-green-500/10 animate-scaleIn">
                                                    <FaCheckCircle />
                                                </div>
                                                <h4 className="text-2xl font-bold text-white">MFA is Now Enabled!</h4>
                                                <p className="text-zinc-400">Your account is now protected with an extra layer of security.</p>
                                            </div>

                                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
                                                <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/20 flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <FaKey className="text-yellow-500" />
                                                        <span className="text-sm font-bold text-white">Recovery Backup Codes</span>
                                                    </div>
                                                    <button
                                                        onClick={downloadBackupCodes}
                                                        className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-2"
                                                    >
                                                        <FaDownload size={10} /> Download .txt
                                                    </button>
                                                </div>
                                                <div className="p-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
                                                    {backupCodes.map((code, idx) => (
                                                        <div key={idx} className="bg-zinc-900 p-2 rounded-xl text-center font-mono text-xs text-white border border-zinc-700 shadow-inner group transition-all hover:border-blue-500/50">
                                                            {code}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="px-6 py-4 bg-yellow-500/5 border-t border-zinc-800 flex items-start gap-3">
                                                    <FaExclamationTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={14} />
                                                    <p className="text-[10px] text-yellow-500/80 leading-relaxed font-medium uppercase tracking-wider">
                                                        Warning: Save these codes immediately. If you lose access to your device and codes, account recovery will be impossible.
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    closeMfaModal();
                                                    updateUserProfile({}); // Refresh UI
                                                }}
                                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20"
                                            >
                                                Complete Setup
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* section: Session Management */}
                    <section className="bg-[#0a0a0f] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                    <FaShieldAlt size={14} />
                                </div>
                                <h3 className="font-bold text-white">Active Sessions</h3>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={revokeOtherSessions}
                                    className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
                                >
                                    Logout Others
                                </button>
                                <button
                                    onClick={logoutAllDevices}
                                    className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-400 transition-colors"
                                >
                                    Logout All
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {user?.activeSessions?.map((session, idx) => (
                                <div key={idx} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                                            {session.deviceInfo?.includes('Mac') || session.deviceInfo?.includes('Windows') ? '💻' : '📱'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{session.location || 'Unknown Location'}</p>
                                            <p className="text-xs text-zinc-500">{session.ipAddress} • {new Date(session.lastActivity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {session.sessionId === (localStorage.getItem('sessionId') || '') ? (
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">Current</span>
                                    ) : (
                                        <button
                                            onClick={() => revokeSession(session.sessionId || session._id)}
                                            className="text-xs text-zinc-500 hover:text-red-500 transition-colors"
                                        >
                                            Terminate
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
