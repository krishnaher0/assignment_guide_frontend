import { useState, useEffect } from 'react';
import { FaSave, FaEdit, FaInfoCircle } from 'react-icons/fa';
import api from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

export default function DeveloperProfile() {
    const { user, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchingProfile, setFetchingProfile] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        phone: '',
        location: '',
        expertise: [],
        skills: [],
    });

    const [newSkill, setNewSkill] = useState('');
    const [newExpertise, setNewExpertise] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/developer/profile');
            setProfile(data);
            setFormData({
                name: data.name || '',
                bio: data.bio || '',
                phone: data.phone || '',
                location: data.location || '',
                expertise: data.expertise || [],
                skills: data.skills || [],
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback to user context data
            if (user) {
                setProfile(user);
                setFormData({
                    name: user.name || '',
                    bio: user.bio || '',
                    phone: user.phone || '',
                    location: user.location || '',
                    expertise: user.expertise || [],
                    skills: user.skills || [],
                });
            }
        } finally {
            setFetchingProfile(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()],
            }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index),
        }));
    };

    const handleAddExpertise = () => {
        if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
            setFormData(prev => ({
                ...prev,
                expertise: [...prev.expertise, newExpertise.trim()],
            }));
            setNewExpertise('');
        }
    };

    const handleRemoveExpertise = (index) => {
        setFormData(prev => ({
            ...prev,
            expertise: prev.expertise.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/developer/profile', formData);
            setProfile(data);
            // Update auth context
            if (setUser) {
                setUser(prev => ({ ...prev, ...data }));
            }
            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingProfile) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                    <p className="text-gray-400">Manage your professional information</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                    >
                        <FaEdit className="w-4 h-4" />
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                    {successMessage}
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Profile Form */}
                <div className="lg:col-span-2 rounded-2xl bg-white/[0.02] border border-white/5 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-60 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Bio
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                rows="4"
                                placeholder="Tell us about yourself and your experience..."
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-60 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="+977 98..."
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-60 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Kathmandu, Nepal"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-60 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Skills
                            </label>
                            {isEditing && (
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                        placeholder="Add a skill..."
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No skills added yet</p>
                                ) : (
                                    formData.skills.map((skill, index) => (
                                        <div key={index} className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm flex items-center gap-2">
                                            {skill}
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSkill(index)}
                                                    className="hover:text-red-400 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Expertise */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Areas of Expertise
                            </label>
                            {isEditing && (
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newExpertise}
                                        onChange={(e) => setNewExpertise(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
                                        placeholder="Add expertise area..."
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddExpertise}
                                        className="px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {formData.expertise.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No expertise areas added yet</p>
                                ) : (
                                    formData.expertise.map((item, index) => (
                                        <div key={index} className="px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-400 text-sm flex items-center gap-2">
                                            {item}
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExpertise(index)}
                                                    className="hover:text-red-400 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset form to profile data
                                        if (profile) {
                                            setFormData({
                                                name: profile.name || '',
                                                bio: profile.bio || '',
                                                phone: profile.phone || '',
                                                location: profile.location || '',
                                                expertise: profile.expertise || [],
                                                skills: profile.skills || [],
                                            });
                                        }
                                    }}
                                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Hourly Rate Card - Read Only */}
                    <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-500/20 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-semibold text-white">Your Rate</h3>
                            <FaInfoCircle className="w-4 h-4 text-blue-400" title="Set by admin" />
                        </div>
                        <div className="text-4xl font-bold text-white mb-2">
                            Rs. {profile?.hourlyRate || 0}
                            <span className="text-lg font-normal text-gray-400">/hr</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Your hourly rate is set by the admin based on your skills and experience.
                        </p>
                    </div>

                    {/* Account Info */}
                    <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Account Info</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-white">{profile?.email || user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Role</p>
                                <span className="inline-block px-3 py-1 text-sm font-medium bg-violet-500/20 text-violet-400 rounded-full capitalize">
                                    {profile?.role || user?.role || 'Developer'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Member Since</p>
                                <p className="text-white">
                                    {profile?.createdAt
                                        ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Current Status</h3>
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${profile?.status === 'online' ? 'bg-emerald-500' :
                                    profile?.status === 'busy' ? 'bg-amber-500' : 'bg-gray-500'
                                }`}></div>
                            <span className={`font-medium ${profile?.status === 'online' ? 'text-emerald-400' :
                                    profile?.status === 'busy' ? 'text-amber-400' : 'text-gray-400'
                                }`}>
                                {profile?.status === 'online' ? 'Available' :
                                    profile?.status === 'busy' ? 'Busy' : 'Offline'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Status is managed by admin
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
