import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLogout, HiOutlineUser, HiOutlineCog, HiOutlineChevronDown } from 'react-icons/hi';
import Avatar from './Avatar';

const ProfileDropdown = ({ variant = 'default' }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        const userRole = user?.role;
        logout();
        // Clear all auth-related storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');
        // Redirect based on role - admin/developer to admin login, clients to landing page
        if (userRole === 'admin' || userRole === 'developer') {
            navigate('/admin');
        } else {
            navigate('/');
        }
        setIsOpen(false);
    };

    const getInitials = (name, email) => {
        if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        if (email) return email[0].toUpperCase();
        return 'U';
    };

    const getDisplayName = (user) => {
        if (user?.name) return user.name;
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'developer':
                return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
            default:
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        }
    };

    const getProfileLink = () => {
        switch (user?.role) {
            case 'admin':
                return '/admin/profile';
            case 'developer':
                return '/developer/profile';
            default:
                return '/dashboard/client/profile';
        }
    };

    const getGradient = () => {
        switch (variant) {
            case 'admin':
                return 'from-blue-500 to-violet-600';
            case 'developer':
                return 'from-blue-500 to-violet-600';
            default:
                return 'from-blue-500 to-blue-600';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-colors"
            >
                <Avatar
                    src={user?.profileImage}
                    name={user?.name}
                    email={user?.email}
                    size="sm"
                    gradient={getGradient()}
                />
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white truncate max-w-[120px]">
                        {getDisplayName(user)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role || 'User'}</p>
                </div>
                <HiOutlineChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0f0f14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={user?.profileImage}
                                name={user?.name}
                                email={user?.email}
                                size="lg"
                                gradient={getGradient()}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {getDisplayName(user)}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full border capitalize ${getRoleBadgeColor(user?.role)}`}>
                                    {user?.role || 'User'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                        <Link
                            to={getProfileLink()}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                            <HiOutlineUser className="w-5 h-5" />
                            <span>Profile</span>
                        </Link>

                        {user?.role === 'admin' && (
                            <Link
                                to="/admin/settings"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <HiOutlineCog className="w-5 h-5" />
                                <span>Settings</span>
                            </Link>
                        )}
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                            <HiOutlineLogout className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
