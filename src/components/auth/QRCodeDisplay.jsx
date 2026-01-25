import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeDisplay = ({ value, secret }) => {
    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
                {value ? (
                    <QRCodeSVG
                        value={value}
                        size={200}
                        level="H"
                        includeMargin={true}
                    />
                ) : (
                    <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200">
                        <span className="text-gray-400">Scan QR Code</span>
                    </div>
                )}
            </div>

            <div className="text-center space-y-3">
                <p className="text-sm text-gray-500 max-w-xs">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>

                {secret && (
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Manual Entry Code
                        </p>
                        <div className="bg-gray-50 px-4 py-2 rounded-md font-mono text-lg text-blue-600 border border-gray-200 select-all">
                            {secret.replace(/(.{4})/g, '$1 ').trim()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRCodeDisplay;
