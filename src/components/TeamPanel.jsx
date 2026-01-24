import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  FaCrown,
  FaUsers,
  FaPlus,
  FaChartLine,
  FaClipboardList,
  FaCheckCircle,
  FaSpinner,
  FaExclamationCircle,
  FaPaperPlane,
  FaTimes
} from 'react-icons/fa';

const ROLE_LABELS = {
  lead: 'Lead Developer',
  senior: 'Senior Developer',
  developer: 'Developer',
  qa: 'QA Engineer',
  support: 'Support/Docs',
};

const ROLE_COLORS = {
  lead: 'bg-amber-500/20 text-amber-400',
  senior: 'bg-purple-500/20 text-purple-400',
  developer: 'bg-blue-500/20 text-blue-400',
  qa: 'bg-green-500/20 text-green-400',
  support: 'bg-cyan-500/20 text-cyan-400',
};

export default function TeamPanel({ taskId, isLead }) {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAssignModuleModal, setShowAssignModuleModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [requestForm, setRequestForm] = useState({ type: 'add_developer', description: '' });
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchTeamData();
  }, [taskId]);

  const fetchTeamData = async () => {
    try {
      const { data } = await api.get(`/team/${taskId}`);
      setTeamData(data);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!requestForm.description.trim()) {
      alert('Please provide a description');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/team/${taskId}/request`, requestForm);
      alert('Request submitted to admin');
      setShowRequestModal(false);
      setRequestForm({ type: 'add_developer', description: '' });
      fetchTeamData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignModule = async () => {
    if (!moduleForm.title.trim()) {
      alert('Please provide a module title');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/team/${taskId}/assign-module`, {
        developerId: showAssignModuleModal.developer._id,
        module: moduleForm,
      });
      setShowAssignModuleModal(null);
      setModuleForm({ title: '', description: '' });
      fetchTeamData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign module');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateResponsibilities = async (memberId, responsibilities) => {
    try {
      await api.put(`/team/${taskId}/member/${memberId}`, { responsibilities });
      fetchTeamData();
    } catch (error) {
      console.error('Failed to update responsibilities:', error);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!teamData) {
    return null;
  }

  const activeMembers = teamData.team?.filter(m => m.status === 'active') || [];

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaUsers className="w-5 h-5" />
            Team ({activeMembers.length})
          </h3>
          {isLead && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
            >
              <FaPaperPlane className="w-3 h-3" />
              Request
            </button>
          )}
        </div>

        {/* Team Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Team Progress</span>
            <span className="text-white font-medium">{teamData.statistics?.teamProgress || 0}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
              style={{ width: `${teamData.statistics?.teamProgress || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="p-4 space-y-3">
        {activeMembers.map((member) => {
          const isCurrentUser = member.developer?._id === user?._id;
          const isMemberLead = member.role === 'lead';

          return (
            <div
              key={member.developer?._id}
              className={`p-4 rounded-xl transition-all ${
                isMemberLead ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/[0.02] border border-white/5'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 ${
                  isMemberLead ? 'bg-amber-600' : 'bg-gradient-to-br from-blue-500 to-violet-600'
                }`}>
                  {(member.developer?.name || 'U').charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-white">
                      {member.developer?.name || 'Unknown'}
                      {isCurrentUser && <span className="text-gray-500 text-xs ml-1">(You)</span>}
                    </p>
                    {isMemberLead && <FaCrown className="w-3 h-3 text-amber-400" />}
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${ROLE_COLORS[member.role]}`}>
                      {ROLE_LABELS[member.role] || member.role}
                    </span>
                  </div>

                  {member.responsibilities && (
                    <p className="text-xs text-gray-500 mt-1">
                      <FaClipboardList className="w-3 h-3 inline mr-1" />
                      {member.responsibilities}
                    </p>
                  )}

                  {/* Individual Progress */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-white">{member.individualProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${isMemberLead ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${member.individualProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Modules */}
                  {member.modules?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {member.modules.map((mod, idx) => {
                        const statusIcon = mod.status === 'completed' ? FaCheckCircle :
                                          mod.status === 'in-progress' ? FaSpinner :
                                          mod.status === 'blocked' ? FaExclamationCircle : null;
                        const StatusIcon = statusIcon;

                        return (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${
                              mod.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                              mod.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                              mod.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {StatusIcon && <StatusIcon className="w-2.5 h-2.5" />}
                            {mod.title}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Lead Actions */}
                {isLead && !isCurrentUser && (
                  <button
                    onClick={() => setShowAssignModuleModal(member)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    title="Assign Module"
                  >
                    <FaPlus className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {activeMembers.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No team members assigned
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Team Request</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Request Type</label>
                <select
                  value={requestForm.type}
                  onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="add_developer" className="bg-[#0f0f14]">Add Developer</option>
                  <option value="remove_developer" className="bg-[#0f0f14]">Remove Developer</option>
                  <option value="change_role" className="bg-[#0f0f14]">Change Role</option>
                  <option value="extend_deadline" className="bg-[#0f0f14]">Extend Deadline</option>
                  <option value="increase_budget" className="bg-[#0f0f14]">Increase Budget</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  rows={4}
                  placeholder="Explain your request..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={actionLoading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Module Modal */}
      {showAssignModuleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Assign Module</h2>
              <p className="text-sm text-gray-500">To: {showAssignModuleModal.developer?.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Module Title *</label>
                <input
                  type="text"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="e.g., User Authentication"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of the module..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => setShowAssignModuleModal(null)}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignModule}
                disabled={actionLoading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Assigning...' : 'Assign Module'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
