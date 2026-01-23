import { useState } from 'react';

/**
 * Avatar component with image loading fallback to initials
 * Handles OAuth profile images from Google/GitHub with proper referrer policy
 */
const Avatar = ({
    src,
    name,
    email,
    size = 'md',
    className = '',
    gradient = 'from-blue-500 to-blue-600',
}) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const getInitials = () => {
        if (name) {
            return name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        if (email) {
            return email[0].toUpperCase();
        }
        return 'U';
    };

    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-9 h-9 text-xs',      // 36px - for header/nav
        md: 'w-10 h-10 text-sm',    // 40px - default
        lg: 'w-12 h-12 text-base',  // 48px - for dropdown header
        xl: 'w-16 h-16 text-lg',    // 64px
        '2xl': 'w-20 h-20 text-xl', // 80px
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const showImage = src && !imageError;

    return (
        <div className={`relative ${sizeClass} ${className}`}>
            {/* Fallback initials (always rendered as background) */}
            <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-medium`}
            >
                {getInitials()}
            </div>

            {/* Profile image (overlays initials when loaded) */}
            {showImage && (
                <img
                    src={src}
                    alt={name || email || 'User'}
                    className={`absolute inset-0 w-full h-full rounded-xl object-cover transition-opacity duration-200 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                />
            )}
        </div>
    );
};

export default Avatar;
