import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaEye, FaEyeSlash, FaBan, FaCheck, FaEdit, FaTrash, FaUserPlus, FaTimes, FaSearch, FaRedo, FaCopy } from 'react-icons/fa';
import { HiOutlineDotsVertical } from 'react-icons/hi';

// Generate random password
const generatePassword = (length = 12) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default function AdminDevelopers() {
  const [developers, setDevelopers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Simplified new developer - just email and password
  const [newDev, setNewDev] = useState({
    email: '',
    password: '',
  });

  // Edit modal - only admin-controlled fields
  const [editDev, setEditDev] = useState({
    hourlyRate: 0,
    isBanned: false
  });

  useEffect(() => {
    fetchDevelopers();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchDevelopers = async () => {
    try {
      const { data } = await api.get('/users/developers');
      setDevelopers(data);
    } catch (error) {
      console.error('Error fetching developers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevelopers = developers.filter(d => {
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && !d.isBanned) ||
      (filter === 'banned' && d.isBanned) ||
      (filter === 'online' && d.status === 'online');

    const matchesSearch = !searchQuery ||
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleGeneratePassword = () => {
    const pwd = generatePassword();
    setNewDev({ ...newDev, password: pwd });
    setShowPassword(true);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newDev.password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleAddDeveloper = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/developers', {
        email: newDev.email,
        password: newDev.password,
        role: 'developer',
      });
      setShowAddModal(false);
      setNewDev({ email: '', password: '' });
      setShowPassword(false);
      fetchDevelopers();
    } catch (error) {
      console.error('Error adding developer:', error);
      alert(error.response?.data?.message || 'Failed to add developer');
    }
  };

  const handleEditDeveloper = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${showEditModal._id}`, {
        hourlyRate: editDev.hourlyRate,
        isBanned: editDev.isBanned
      });
      setShowEditModal(null);
      fetchDevelopers();
    } catch (error) {
      console.error('Error updating developer:', error);
      alert(error.response?.data?.message || 'Failed to update developer');
    }
  };

  const handleBanToggle = async (dev) => {
    const action = dev.isBanned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} ${dev.name || dev.email}?`)) return;

    try {
      await api.put(`/users/${dev._id}`, { isBanned: !dev.isBanned });
      fetchDevelopers();
    } catch (error) {
      console.error(`Error ${action}ning developer:`, error);
      alert(`Failed to ${action} developer`);
    }
  };

  const handleDelete = async (dev) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${dev.name || dev.email}? This action cannot be undone.`)) return;

    try {
      await api.delete(`/users/${dev._id}`);
      fetchDevelopers();
    } catch (error) {
      console.error('Error deleting developer:', error);
      alert('Failed to delete developer');
    }
  };

  const openEditModal = (dev) => {
    setEditDev({
      hourlyRate: dev.hourlyRate || 0,
      isBanned: dev.isBanned || false
    });
    setShowEditModal(dev);
    setActionMenuOpen(null);
  };

  const statusColors = {
    online: 'bg-emerald-500',
    busy: 'bg-amber-500',
    offline: 'bg-gray-500',
  };

  const statusLabels = {
    online: 'Available',
    busy: 'Busy',
    offline: 'Offline',
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading developers...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Development Team</h1>
          <p className="text-gray-500">Manage developers, set rates, and control access</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <FaUserPlus className="w-4 h-4" />
          Add Developer
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <p className="text-sm text-gray-500 mb-1">Total Developers</p>
          <p className="text-2xl font-bold text-white">{developers.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-sm text-gray-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-emerald-400">{developers.filter(d => !d.isBanned).length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-gray-500 mb-1">Online Now</p>
          <p className="text-2xl font-bold text-blue-400">{developers.filter(d => d.status === 'online').length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-gray-500 mb-1">Banned</p>
          <p className="text-2xl font-bold text-red-400">{developers.filter(d => d.isBanned).length}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
        >
          <option value="all" className="bg-[#0f0f14]">All Developers</option>
          <option value="active" className="bg-[#0f0f14]">Active Only</option>
          <option value="online" className="bg-[#0f0f14]">Online Now</option>
          <option value="banned" className="bg-[#0f0f14]">Banned</option>
        </select>
      </div>

      {/* Developers Table */}
      <div className="rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Developer</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Skills</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Rate</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevelopers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No developers found
                  </td>
                </tr>
              ) : (
                filteredDevelopers.map((dev) => (
                  <tr key={dev._id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${dev.isBanned ? 'opacity-60' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-xl ${dev.isBanned ? 'bg-red-500/20' : 'bg-gradient-to-br from-blue-500 to-violet-600'} flex items-center justify-center text-white font-bold`}>
                            {dev.isBanned ? <FaBan className="w-4 h-4 text-red-400" /> : (dev.name || dev.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          {!dev.isBanned && (
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0f] ${statusColors[dev.status || 'offline']}`} />
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${dev.isBanned ? 'text-gray-500 line-through' : 'text-white'}`}>
                            {dev.name || <span className="text-gray-500 italic">Profile not set</span>}
                          </p>
                          <p className="text-sm text-gray-500">{dev.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(dev.skills || []).length === 0 ? (
                          <span className="text-gray-500 text-sm italic">Not set</span>
                        ) : (
                          <>
                            {dev.skills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 text-xs font-medium bg-white/5 text-gray-400 rounded">
                                {skill}
                              </span>
                            ))}
                            {dev.skills.length > 3 && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-white/5 text-gray-500 rounded">
                                +{dev.skills.length - 3}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-white font-medium">Rs. {dev.hourlyRate || 0}</span>
                      <span className="text-gray-500 text-sm">/hr</span>
                    </td>
                    <td className="py-4 px-6">
                      {dev.isBanned ? (
                        <span className="px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                          Banned
                        </span>
                      ) : (
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          dev.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' :
                          dev.status === 'busy' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {statusLabels[dev.status || 'offline']}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowDetailModal(dev)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(dev)}
                          className="p-2 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                          title="Set Rate"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpen(actionMenuOpen === dev._id ? null : dev._id);
                            }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <HiOutlineDotsVertical className="w-4 h-4" />
                          </button>
                          {actionMenuOpen === dev._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#0f0f14] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                              <div className="py-1">
                                <button
                                  onClick={() => handleBanToggle(dev)}
                                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${dev.isBanned ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-amber-400 hover:bg-amber-500/10'}`}
                                >
                                  {dev.isBanned ? <FaCheck className="w-3 h-3" /> : <FaBan className="w-3 h-3" />}
                                  {dev.isBanned ? 'Unban Developer' : 'Ban Developer'}
                                </button>
                                <button
                                  onClick={() => handleDelete(dev)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                  <FaTrash className="w-3 h-3" />
                                  Delete Permanently
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Developer Modal - Simplified */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Add New Developer</h2>
              <button
                onClick={() => { setShowAddModal(false); setShowPassword(false); setNewDev({ email: '', password: '' }); }}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddDeveloper} className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-300">
                  Create an account with email and password. The developer will complete their profile (name, skills, bio) after logging in.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newDev.email}
                  onChange={(e) => setNewDev({ ...newDev, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                  placeholder="developer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newDev.password}
                      onChange={(e) => setNewDev({ ...newDev, password: e.target.value })}
                      className="w-full px-4 py-3 pr-24 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                    {newDev.password && (
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        title="Copy password"
                      >
                        {copiedPassword ? <FaCheck className="w-4 h-4 text-green-400" /> : <FaCopy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors"
                  >
                    <FaRedo className="w-3 h-3" />
                    Auto-generate Password
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowPassword(false); setNewDev({ email: '', password: '' }); }}
                  className="flex-1 px-5 py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Developer Modal - Only Rate and Ban */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Developer Settings</h2>
                <p className="text-sm text-gray-400">{showEditModal.name || showEditModal.email}</p>
              </div>
              <button
                onClick={() => setShowEditModal(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditDeveloper} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hourly Rate (Rs.)</label>
                <input
                  type="number"
                  value={editDev.hourlyRate}
                  onChange={(e) => setEditDev({ ...editDev, hourlyRate: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                  placeholder="500"
                />
                <p className="text-xs text-gray-500 mt-2">Set the hourly rate for this developer's work</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editDev.isBanned}
                    onChange={(e) => setEditDev({ ...editDev, isBanned: e.target.checked })}
                    className="w-5 h-5 rounded border-amber-500/50 bg-transparent text-amber-500 focus:ring-amber-500/50"
                  />
                  <div>
                    <span className="font-medium text-amber-400">Ban this developer</span>
                    <p className="text-xs text-amber-400/70">Banned developers cannot log in or accept tasks</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="flex-1 px-5 py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Developer Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f14] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Developer Profile</h2>
              <button
                onClick={() => setShowDetailModal(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-start gap-6 mb-6">
                <div className={`w-20 h-20 rounded-2xl ${showDetailModal.isBanned ? 'bg-red-500/20' : 'bg-gradient-to-br from-blue-500 to-violet-600'} flex items-center justify-center text-white font-bold text-3xl`}>
                  {showDetailModal.isBanned ? <FaBan className="w-8 h-8 text-red-400" /> : (showDetailModal.name || showDetailModal.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-2xl font-bold ${showDetailModal.isBanned ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {showDetailModal.name || <span className="text-gray-500 italic">Profile not set</span>}
                    </h3>
                    {showDetailModal.isBanned && (
                      <span className="px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                        Banned
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400">{showDetailModal.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      showDetailModal.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' :
                      showDetailModal.status === 'busy' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {statusLabels[showDetailModal.status || 'offline']}
                    </span>
                    <span className="text-gray-500">|</span>
                    <span className="text-blue-400 font-medium">Rs. {showDetailModal.hourlyRate || 0}/hr</span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-white">{showDetailModal.phone || 'Not provided'}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-white">{showDetailModal.location || 'Not provided'}</p>
                </div>
              </div>

              {/* Bio */}
              {showDetailModal.bio && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Bio</p>
                  <p className="text-gray-300 bg-white/5 p-4 rounded-xl">{showDetailModal.bio}</p>
                </div>
              )}

              {/* Skills */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-3">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(showDetailModal.skills || []).map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 text-sm font-medium bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                      {skill}
                    </span>
                  ))}
                  {(showDetailModal.skills || []).length === 0 && (
                    <span className="text-gray-500 italic">No skills listed yet</span>
                  )}
                </div>
              </div>

              {/* Account Info */}
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-gray-500 mb-2">Account Created</p>
                <p className="text-white">{showDetailModal.createdAt ? new Date(showDetailModal.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-between">
              <button
                onClick={() => {
                  openEditModal(showDetailModal);
                  setShowDetailModal(null);
                }}
                className="px-6 py-2.5 bg-blue-500/10 text-blue-400 rounded-xl font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-2"
              >
                <FaEdit className="w-4 h-4" />
                Set Rate
              </button>
              <button
                onClick={() => setShowDetailModal(null)}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
