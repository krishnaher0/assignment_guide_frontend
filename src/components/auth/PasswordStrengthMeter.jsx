import React from 'react';
import zxcvbn from 'zxcvbn';
import { FaCheck, FaTimes } from 'react-icons/fa';

const PasswordStrengthMeter = ({ password }) => {
    const testResult = zxcvbn(password || '');
    const score = testResult.score;

    const getColor = (score) => {
        switch (score) {
            case 0: return 'bg-red-500';
            case 1: return 'bg-red-400';
            case 2: return 'bg-yellow-500';
            case 3: return 'bg-blue-500';
            case 4: return 'bg-green-500';
            default: return 'bg-gray-200';
        }
    };

    const getLabel = (score) => {
        switch (score) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            default: return '';
        }
    };

    // Only require 12 characters - rest is guided by zxcvbn score
    const meetsMinLength = (password?.length || 0) >= 12;

    return (
        <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-zinc-400">Password Strength:</span>
                <span className={`text-sm font-bold ${score < 2 ? 'text-red-500' : score < 4 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {getLabel(score)}
                </span>
            </div>

            <div className="flex space-x-1 h-2">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${i < score ? getColor(score) : 'bg-zinc-700'}`}
                    />
                ))}
            </div>

            {testResult.feedback.warning && (
                <p className="text-xs text-red-400 italic mt-1">{testResult.feedback.warning}</p>
            )}

            <div className="mt-3 flex items-center space-x-2">
                {meetsMinLength ? (
                    <FaCheck className="text-green-500 text-xs" />
                ) : (
                    <FaTimes className="text-zinc-500 text-xs" />
                )}
                <span className={`text-xs ${meetsMinLength ? 'text-green-500' : 'text-zinc-500'}`}>
                    Minimum 12 characters
                </span>
            </div>

            {testResult.feedback.suggestions.length > 0 && (
                <div className="mt-2 text-xs text-zinc-500">
                    <p className="font-medium mb-1">Suggestions:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        {testResult.feedback.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthMeter;
