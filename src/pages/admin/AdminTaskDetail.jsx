import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import {
  FaArrowLeft,
  FaUsers,
  FaPlus,
  FaTrash,
  FaClock,
  FaMoneyBillWave,
  FaCheck,
  FaExclamationTriangle,
  FaTimes,
} from 'react-icons/fa';

export default function AdminTaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [task, setTask] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('');

  // Subtask state
  const [newSubtask, setNewSubtask] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);

  // Blocker resolution state
  const [resolvingBlocker, setResolvingBlocker] = useState(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchData();
  }, [taskId]);

  const fetchData = async () => {
    try {
      const [taskRes, devsRes] = await Promise.all([
        api.get(`/orders/${taskId}`),
        api.get('/users/developers'),
      ]);
      setTask(taskRes.data);
      setDevelopers(devsRes.data.filter(d => !d.isBanned));
    } catch (error) {
      console.error('Error fetching data:', error);
      navigate('/admin/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = async () => {
    if (!selectedWorker) {
      toast.warning('Please select a worker');
      return;
    }
    setActionLoading('add');
    try {
      await api.post(`/team/${taskId}/add`, { developerId: selectedWorker, role: 'developer' });
      toast.success('Worker added successfully');
      await fetchData();
      setShowAddModal(false);
      setSelectedWorker('');
    } catch (error) {
      // Error toast handled by API interceptor
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveWorker = async (workerId) => {
    if (!confirm('Remove this worker from the task?')) return;
    setActionLoading(workerId);
    try {
      await api.delete(`/team/${taskId}/remove/${workerId}`);
      toast.success('Worker removed');
      await fetchData();
    } catch (error) {
      // Error toast handled by API interceptor
    } finally {
      setActionLoading(null);
    }
  };

  // Subtask handlers
  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;
    setAddingSubtask(true);
    try {
      await api.post(`/orders/${taskId}/subtasks`, {
        title: newSubtask.trim(),
        isRequired: true // Admin-created subtasks are required
      });
      toast.success('Subtask added');
      setNewSubtask('');
      fetchData();
    } catch (error) {
      // Error toast handled by API interceptor
    } finally {
      setAddingSubtask(false);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await api.delete(`/orders/${taskId}/subtasks/${subtaskId}`);
      toast.success('Subtask deleted');
      fetchData();
    } catch (error) {
      // Error toast handled by API interceptor
    }
  };

  // Blocker handlers
  const handleResolveBlocker = async (blockerId) => {
    if (!resolution.trim()) {
      toast.warning('Please provide a resolution');
      return;
    }
    try {
      await api.post(`/orders/${taskId}/blockers/${blockerId}/resolve`, { resolution });
      toast.success('Blocker resolved');
      setResolvingBlocker(null);
      setResolution('');
      fetchData();
    } catch (error) {
      // Error toast handled by API interceptor
    }
  };

  const handleDeleteBlocker = async (blockerId) => {
    if (!confirm('Delete this blocker?')) return;
    try {
      await api.delete(`/orders/${taskId}/blockers/${blockerId}`);
      toast.success('Blocker deleted');
      fetchData();
    } catch (error) {
      // Error toast handled by API interceptor
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!task) {
    return <div className="text-center p-8 text-gray-500">Task not found</div>;
  }

  // Get assigned workers from task
  const assignedWorkers = task.assignedDevelopers || [];
  const assignedWorkerIds = assignedWorkers.map(w => w._id || w);
  const availableWorkers = developers.filter(d => !assignedWorkerIds.includes(d._id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/tasks')}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{task.title}</h1>
          <p className="text-gray-500">Task Management</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FaUsers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Workers</p>
              <p className="text-xl font-bold text-white">{assignedWorkers.length}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 font-bold">{task.progress || 0}%</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Progress</p>
              <p className="text-xl font-bold text-white">{task.status}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <FaMoneyBillWave className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount</p>
              <p className="text-xl font-bold text-white">Rs. {(task.quotedAmount || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FaClock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Deadline</p>
              <p className="text-lg font-bold text-white">
                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workers Section */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaUsers className="w-5 h-5" />
            Assigned Workers ({assignedWorkers.length})
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Add Worker
          </button>
        </div>

        <div className="p-6">
          <div className="grid gap-3">
            {assignedWorkers.map((worker) => {
              const workerId = worker._id || worker;
              const workerData = typeof worker === 'object' ? worker : developers.find(d => d._id === worker);

              return (
                <div
                  key={workerId}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
                    {(workerData?.name || 'W').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{workerData?.name || 'Worker'}</p>
                    <p className="text-sm text-gray-500">{workerData?.email || ''}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveWorker(workerId)}
                    disabled={actionLoading === workerId}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {assignedWorkers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No workers assigned yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Description */}
      {task.description && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
          <p className="text-gray-400 whitespace-pre-wrap">{task.description}</p>
        </div>
      )}

      {/* Subtasks Management */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Subtasks ({task.subtasks?.filter(s => s.status === 'completed').length || 0}/{task.subtasks?.length || 0})
          </h3>
        </div>

        <div className="space-y-2 mb-4">
          {task.subtasks?.length > 0 ? (
            task.subtasks.map((subtask) => (
              <div
                key={subtask._id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  subtask.status === 'completed'
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : subtask.status === 'blocked'
                      ? 'bg-red-500/10 border-red-500/20'
                      : 'bg-white/5 border-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  subtask.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-gray-500'
                }`}>
                  {subtask.status === 'completed' && <FaCheck className="w-3 h-3 text-white" />}
                </div>
                <span className={`flex-1 ${subtask.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                  {subtask.title}
                </span>
                {subtask.isRequired && (
                  <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">Required</span>
                )}
                <button
                  onClick={() => handleDeleteSubtask(subtask._id)}
                  className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm py-2">No subtasks defined</p>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
            placeholder="Add required subtask..."
            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleAddSubtask}
            disabled={addingSubtask || !newSubtask.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center gap-2"
          >
            <FaPlus className="w-3 h-3" />
            Add
          </button>
        </div>
      </div>

      {/* Blockers Management */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <FaExclamationTriangle className="text-amber-400" />
          Blockers ({task.blockers?.filter(b => b.status === 'open').length || 0} open)
        </h3>

        <div className="space-y-3">
          {task.blockers?.length > 0 ? (
            task.blockers.map((blocker) => (
              <div
                key={blocker._id}
                className={`p-4 rounded-xl border ${
                  blocker.status === 'resolved'
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : blocker.severity === 'critical'
                      ? 'bg-red-500/10 border-red-500/30'
                      : blocker.severity === 'high'
                        ? 'bg-orange-500/10 border-orange-500/20'
                        : 'bg-amber-500/10 border-amber-500/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        blocker.severity === 'critical' ? 'bg-red-500 text-white' :
                        blocker.severity === 'high' ? 'bg-orange-500 text-white' :
                        blocker.severity === 'medium' ? 'bg-amber-500 text-black' :
                        'bg-gray-500 text-white'
                      }`}>
                        {blocker.severity?.toUpperCase()}
                      </span>
                      {blocker.status === 'resolved' && (
                        <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Resolved</span>
                      )}
                    </div>
                    <h4 className="font-medium text-white">{blocker.title}</h4>
                    {blocker.description && (
                      <p className="text-sm text-gray-400 mt-1">{blocker.description}</p>
                    )}
                    {blocker.resolution && (
                      <p className="text-sm text-emerald-400 mt-2">
                        <span className="font-medium">Resolution:</span> {blocker.resolution}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {blocker.status !== 'resolved' && (
                      <button
                        onClick={() => setResolvingBlocker(blocker._id)}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteBlocker(blocker._id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Resolution input */}
                {resolvingBlocker === blocker._id && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <input
                      type="text"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="How was this resolved?"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleResolveBlocker(blocker._id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => { setResolvingBlocker(null); setResolution(''); }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Reported {new Date(blocker.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm py-2">No blockers reported</p>
          )}
        </div>
      </div>

      {/* Add Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Add Worker</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Worker</label>
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="" className="bg-[#0f0f14]">Select a worker...</option>
                {availableWorkers.map(dev => (
                  <option key={dev._id} value={dev._id} className="bg-[#0f0f14]">
                    {dev.name} ({dev.email})
                  </option>
                ))}
              </select>
              {availableWorkers.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">No available workers to add</p>
              )}
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => { setShowAddModal(false); setSelectedWorker(''); }}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWorker}
                disabled={actionLoading === 'add' || !selectedWorker}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading === 'add' ? 'Adding...' : 'Add Worker'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
