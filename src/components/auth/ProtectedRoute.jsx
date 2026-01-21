import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children, roles = [] }) {
    const { user, loading, verified, verifyToken, logout } = useAuth();
    const location = useLocation();
    const [isVerifying, setIsVerifying] = useState(false);

    // Re-verify on route change for protected routes with specific roles
    useEffect(() => {
        const reVerify = async () => {
            if (user && roles.length > 0 && !isVerifying) {
                setIsVerifying(true);
                try {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const parsedUser = JSON.parse(storedUser);
                        const verifiedUser = await verifyToken(parsedUser);
                        if (!verifiedUser) {
                            logout();
                        }
                    }
                } catch (e) {
                    console.error('Re-verification failed:', e);
                }
                setIsVerifying(false);
            }
        };

        // Only re-verify if accessing role-protected routes
        if (roles.length > 0) {
            reVerify();
        }
    }, [location.pathname]); // Re-verify when route changes

    if (loading || isVerifying) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // Check if user is banned
    if (user.isBanned) {
        logout();
        return <Navigate to="/auth/login" state={{ message: 'Your account has been suspended.' }} replace />;
    }

    // Allow access if no specific roles required, or user has matching role
    if (roles.length > 0 && !roles.includes(user.role)) {
        // Redirect based on user role
        if (user.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (user.role === 'developer') {
            return <Navigate to="/developer" replace />;
        }
        return <Navigate to="/dashboard/client" replace />;
    }

    return children;
}
