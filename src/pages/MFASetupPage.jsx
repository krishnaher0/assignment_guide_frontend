import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import QRCodeDisplay from '../components/auth/QRCodeDisplay';
import OTPInput from '../components/auth/OTPInput';
import { FaShieldAlt, FaKey, FaChevronRight, FaChevronLeft, FaCheckCircle, FaDownload } from 'react-icons/fa';

const MFASetupPage = () => {
    const [step, setStep] = useState(1);
    const [setupData, setSetupData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState(null);
    const [backupCodes, setBackupCodes] = useState([]);
    const navigate = useNavigate();

    const startSetup = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/mfa/setup', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSetupData(data);
            setStep(2);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start MFA setup');
        } finally {
            setLoading(false);
        }
    };

    const verifySetup = async (token) => {
        try {
            setVerifying(true);
            const { data } = await axios.post('/api/mfa/verify-setup', { token }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setBackupCodes(data.backupCodes);
            setStep(3);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setVerifying(false);
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

    const renderStep1 = () => (
        <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <FaShieldAlt size={40} />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Protect your account</h2>
                <p className="text-gray-500">
                    Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to log in.
                </p>
            </div>
            <button
                onClick={startSetup}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
            >
                {loading ? 'Setting up...' : 'Enable 2FA'}
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">Scan QR Code</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Use your authenticator app to scan the code below.
                </p>
            </div>

            {setupData && (
                <QRCodeDisplay
                    value={setupData.otpauthUrl}
                    secret={setupData.secret}
                />
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 font-medium mb-3 uppercase tracking-wider text-center">
                    Step 2: Enter the 6-digit code from your app
                </p>
                <OTPInput onComplete={verifySetup} />
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                    {error}
                </div>
            )}

            <button
                onClick={() => setStep(1)}
                className="w-full py-2 text-gray-500 font-medium hover:text-gray-700 flex items-center justify-center gap-2"
            >
                <FaChevronLeft size={12} /> Back
            </button>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
                    <FaCheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">MFA is Active!</h2>
                <p className="text-gray-500">
                    Your account is now protected with two-factor authentication.
                </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <FaKey className="text-orange-500" /> Backup Codes
                    </h3>
                    <button
                        onClick={downloadBackupCodes}
                        className="text-xs bg-white border border-gray-300 px-3 py-1 rounded-md flex items-center gap-1 hover:bg-gray-50 shadow-sm"
                    >
                        <FaDownload size={10} /> Download
                    </button>
                </div>
                <p className="text-xs text-gray-500">
                    Save these codes in a secure place. You can use them to access your account if you lose your phone.
                </p>
                <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, i) => (
                        <div key={i} className="bg-white px-3 py-2 rounded border border-gray-100 font-mono text-sm text-center">
                            {code}
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={() => navigate('/settings/security')}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition-colors"
            >
                Done
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    );
};

export default MFASetupPage;
