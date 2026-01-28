import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, onComplete, onChange, alphanumeric = false }) => {
    const [otp, setOtp] = useState(new Array(length).fill(''));
    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // Reset OTP when length changes
    useEffect(() => {
        setOtp(new Array(length).fill(''));
    }, [length]);

    const handleOtpChange = (newOtp) => {
        setOtp(newOtp);
        const combinedOtp = newOtp.join('');
        if (onChange) onChange(combinedOtp);
        if (combinedOtp.length === length && onComplete) {
            onComplete(combinedOtp);
        }
    };

    const handleChange = (e, index) => {
        const value = e.target.value.toUpperCase();

        // Validation based on mode
        if (alphanumeric) {
            // Accept only alphanumeric characters (A-Z, 0-9)
            if (!/^[A-Z0-9]?$/.test(value)) return;
        } else {
            // Accept only numbers
            if (isNaN(value)) return;
        }

        const newOtp = [...otp];
        // Only take the last character entered
        newOtp[index] = value.substring(value.length - 1);
        handleOtpChange(newOtp);

        // Move to next field
        if (value && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const rawData = e.clipboardData.getData('text').toUpperCase();

        // Remove spaces/whitespace from pasted data (common in backup codes)
        const data = rawData.replace(/\s+/g, '').slice(0, length);

        // Validation based on mode
        const isValid = alphanumeric
            ? /^[A-Z0-9]+$/.test(data)
            : /^\d+$/.test(data);

        if (!isValid) return;

        const newOtp = [...otp];
        data.split('').forEach((char, index) => {
            if (index < length) newOtp[index] = char;
        });
        handleOtpChange(newOtp);

        // Focus the last filled or next empty
        const nextIndex = Math.min(data.length, length - 1);
        if (inputRefs.current[nextIndex]) {
            inputRefs.current[nextIndex].focus();
        }
    };

    return (
        <div className="flex justify-center items-center space-x-2 md:space-x-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`${length > 6 ? 'w-8 h-10 md:w-10 md:h-12 text-lg' : 'w-10 h-12 md:w-14 md:h-16 text-xl'} text-center font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white shadow-sm uppercase`}
                />
            ))}
        </div>
    );
};

export default OTPInput;
