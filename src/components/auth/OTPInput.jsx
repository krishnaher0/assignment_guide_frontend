import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, onComplete }) => {
    const [otp, setOtp] = useState(new Array(length).fill(''));
    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        // Only take the last character entered
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next field
        if (value && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }

        // Check if complete
        const combinedOtp = newOtp.join('');
        if (combinedOtp.length === length) {
            onComplete(combinedOtp);
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
        const data = e.clipboardData.getData('text').slice(0, length);
        if (!/^\d+$/.test(data)) return;

        const newOtp = [...otp];
        data.split('').forEach((char, index) => {
            if (index < length) newOtp[index] = char;
        });
        setOtp(newOtp);

        if (data.length === length) {
            onComplete(data);
        }

        // Focus the last filled or next empty
        const nextIndex = Math.min(data.length, length - 1);
        inputRefs.current[nextIndex].focus();
    };

    return (
        <div className="flex justify-center items-center space-x-2 md:space-x-4" onPaste={handlePaste}>
            {otp.map((digit, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-10 h-12 md:w-14 md:h-16 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white shadow-sm"
                />
            ))}
        </div>
    );
};

export default OTPInput;
