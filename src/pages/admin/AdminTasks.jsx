import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FaCheckCircle, FaTimesCircle, FaPlay, FaPaperPlane, FaMoneyBillWave, FaTruck, FaImage, FaUsers } from 'react-icons/fa';
import { HiOutlineExternalLink } from 'react-icons/hi';

export default function AdminTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Unified Acknowledge Modal State
  const [acknowledgeModal, setAcknowledgeModal] = useState(null);
  const [assignDevelopersModal, setAssignDevelopersModal] = useState(null);
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);
  const [quotedAmount, setQuotedAmount] = useState('');

  // Delivery Modal State
  const [deliveryModal, setDeliveryModal] = useState(null);
  const [deliveryFiles, setDeliveryFiles] = useState([]);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, devsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/users/developers'),
        ]);
        setTasks(tasksRes.data);
        // Filter out banned developers
        setDevelopers(devsRes.data.filter(d => !d.isBanned));
      } catch (error) {
        console.error('Error fetching tasks data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === filter);

  const toggleDeveloperSelection = (devId) => {
    setSelectedDevelopers(prev =>
      prev.includes(devId)
        ? prev.filter(id => id !== devId)
        : [...prev, devId]
    );
  };

  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    quoted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    started: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    assigned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'in-progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'in-review': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'payment-pending': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'payment-verified': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    'released-to-admin': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const statusLabels = {
    pending: 'Pending',
    quoted: 'Quoted',
    started: 'Started',
    assigned: 'Assigned',
    'in-progress': 'In Progress',
    'in-review': 'In Review',
    completed: 'Completed',
    'payment-pending': 'Payment Pending',
    'payment-verified': 'Payment Verified',
    'released-to-admin': 'Ready for Release',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  // Open acknowledge modal
  const openAcknowledgeModal = (task) => {
    setAcknowledgeModal(task);
    setSelectedDevelopers([]);
    setQuotedAmount(task.budget?.replace(/[^0-9]/g, '') || '');
  };

  // Handle acknowledge/initialize
  const handleAcknowledge = async () => {
    if (!acknowledgeModal) return;
    
    setActionLoading(acknowledgeModal._id);
    try {
      // Step 1: Initialize the task
      const { data: initData } = await api.put(`/admin/tasks/${acknowledgeModal._id}/initialize`);
      
      setTasks(tasks.map(t => t._id === acknowledgeModal._id ? initData.task : t));
      if (selectedTask?._id === acknowledgeModal._id) setSelectedTask(initData.task);
      
      // Step 2: Move to assign developers modal (open modal with initialized task)
      setAcknowledgeModal(null);
      setAssignDevelopersModal(initData.task);
      
    } catch (error) {
      alert('Failed to initialize task: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle assign developers to initialized task
  const handleAssignDevelopers = async () => {
    if (!assignDevelopersModal) return;
    if (selectedDevelopers.length === 0) {
      alert('Please select at least one worker');
      return;
    }
    if (!quotedAmount || parseFloat(quotedAmount) <= 0) {
      alert('Please enter a valid quoted amount');
      return;
    }

    setActionLoading(assignDevelopersModal._id);
    try {
      const { data } = await api.put(`/admin/tasks/${assignDevelopersModal._id}/assign-developers`, {
        developerIds: selectedDevelopers,
        quotedAmount: parseFloat(quotedAmount),
      });
      setTasks(tasks.map(t => t._id === assignDevelopersModal._id ? data.task : t));
      if (selectedTask?._id === assignDevelopersModal._id) setSelectedTask(data.task);
      setAssignDevelopersModal(null);
      setSelectedDevelopers([]);
      setQuotedAmount('');
    } catch (error) {
      alert('Failed to assign workers: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal._id);
    try {
      const { data } = await api.put(`/admin/tasks/${rejectModal._id}/reject`, { reason: rejectReason });
      setTasks(tasks.map(t => t._id === rejectModal._id ? data.task : t));
      if (selectedTask?._id === rejectModal._id) setSelectedTask(data.task);
      setRejectModal(null);
      setRejectReason('');
    } catch (error) {
      alert('Failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReleaseToClient = async (task) => {
    if (!confirm('Release this task to the client?')) return;
    setActionLoading(task._id);
    try {
      const { data } = await api.put(`/admin/tasks/${task._id}/release-to-client`);
      setTasks(tasks.map(t => t._id === task._id ? data.task : t));
      if (selectedTask?._id === task._id) setSelectedTask(data.task);
    } catch (error) {
      alert('Failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyPayment = async (task) => {
    if (!confirm('Verify this payment?')) return;
    setActionLoading(task._id);
    try {
      const { data } = await api.put(`/admin/tasks/${task._id}/verify-payment`);
      setTasks(tasks.map(t => t._id === task._id ? data.task : t));
      if (selectedTask?._id === task._id) setSelectedTask(data.task);
    } catch (error) {
      alert('Failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliver = (task) => {
    setDeliveryModal(task);
    setDeliveryFiles([]);
    setDeliveryNotes('');
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const { data } = await api.post('/upload/deliverables', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const uploadedFiles = data.files.map(f => ({
        fileName: f.fileName,
        fileUrl: f.fileUrl,
      }));
      setDeliveryFiles(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      alert('Failed to upload file: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingFiles(false);
    }
  };

  const submitDelivery = async () => {
    if (deliveryFiles.length === 0) {
      if (!confirm('No files attached. Deliver without files?')) return;
    }
    setActionLoading(deliveryModal._id);
    try {
      const { data } = await api.put(`/admin/tasks/${deliveryModal._id}/deliver`, {
        deliverables: deliveryFiles,
        deliveryNotes,
      });
      setTasks(tasks.map(t => t._id === deliveryModal._id ? data.task : t));
      if (selectedTask?._id === deliveryModal._id) setSelectedTask(data.task);
      setDeliveryModal(null);
      setDeliveryFiles([]);
      setDeliveryNotes('');
    } catch (error) {
      alert('Failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const getLeadDeveloperName = (task) => {
    if (!task.assignedDeveloper) return null;
    const devId = task.assignedDeveloper._id || task.assignedDeveloper;
    const dev = developers.find(d => d._id === devId) || task.assignedDeveloper;
    return dev?.name || dev?.email || 'Lead';
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Tasks...</div>;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-gray-500">View tasks and assign developers</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
          >
            <option value="all" className="bg-[#0f0f14]">All Tasks</option>
            <option value="pending" className="bg-[#0f0f14]">Pending</option>
            <option value="assigned" className="bg-[#0f0f14]">Assigned</option>
            <option value="in-progress" className="bg-[#0f0f14]">In Progress</option>
            <option value="completed" className="bg-[#0f0f14]">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Task</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Client</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Budget</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Developer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Deadline</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.map((task) => (
                <tr key={task._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.service || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white">{task.clientName || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{task.clientEmail}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">{task.budget}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {task.assignedDevelopers && task.assignedDevelopers.length > 0 ? (
                        <div className="flex -space-x-2 overflow-hidden">
                          {task.assignedDevelopers.map((dev, idx) => {
                            const isLead = task.assignedDeveloper && (task.assignedDeveloper._id || task.assignedDeveloper) === (dev._id || dev);
                            return (
                              <div
                                key={idx}
                                className={`relative inline-block h-8 w-8 rounded-full ring-2 ring-[#0f0f14] flex items-center justify-center text-xs text-white ${isLead ? 'bg-amber-600' : 'bg-neutral-800'}`}
                                title={`${dev.name || 'Dev'}${isLead ? ' (Lead)' : ''}`}
                              >
                                {(dev.name || 'U').charAt(0)}
                                {isLead && <FaCrown className="absolute -top-1 -right-1 w-3 h-3 text-amber-400" />}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-amber-400 text-sm">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{new Date(task.deadline).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${statusColors[task.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {statusLabels[task.status] || task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/admin/tasks/${task._id}`)}
                        className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="text-gray-400 hover:text-gray-300 font-medium text-sm"
                      >
                        Quick View
                      </button>
                      {task.status === 'pending' && (
                        <>
                          <button
                            onClick={() => navigate(`/admin/quotes/new?orderId=${task._id}`)}
                            className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium hover:bg-blue-500/30"
                          >
                            Create Quote
                          </button>
                          <button
                            onClick={() => openAcknowledgeModal(task)}
                            disabled={actionLoading === task._id}
                            className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium hover:bg-emerald-500/30 disabled:opacity-50"
                          >
                            Quick Assign
                          </button>
                          <button
                            onClick={() => setRejectModal(task)}
                            className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium hover:bg-red-500/30"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {task.status === 'released-to-admin' && (
                        <button
                          onClick={() => handleReleaseToClient(task)}
                          disabled={actionLoading === task._id}
                          className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded text-xs font-medium hover:bg-violet-500/30 disabled:opacity-50"
                        >
                          Release to Client
                        </button>
                      )}
                      {task.status === 'payment-pending' && (
                        <button
                          onClick={() => handleVerifyPayment(task)}
                          disabled={actionLoading === task._id}
                          className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-medium hover:bg-orange-500/30 disabled:opacity-50"
                        >
                          Verify Payment
                        </button>
                      )}
                      {task.status === 'review' && (
                        <button
                          onClick={() => handleDeliver(task)}
                          disabled={actionLoading === task._id}
                          className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium hover:bg-green-500/30 disabled:opacity-50"
                        >
                          Deliver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTasks.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No tasks found with the selected filter.
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Task Details</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedTask.title}</h3>
                <span className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-lg border ${statusColors[selectedTask.status]}`}>
                  {statusLabels[selectedTask.status] || selectedTask.status}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Client</p>
                  <p className="font-medium text-white">{selectedTask.clientName}</p>
                  <p className="text-sm text-gray-400">{selectedTask.clientEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Service Type</p>
                  <p className="font-medium text-white">{selectedTask.service}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Budget</p>
                  <p className="font-bold text-white text-lg">{selectedTask.budget}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Deadline</p>
                  <p className="font-medium text-white">{new Date(selectedTask.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-300 bg-white/5 rounded-xl p-4 max-h-40 overflow-y-auto">{selectedTask.description}</p>
              </div>

              {/* Attachments */}
              {selectedTask.files && selectedTask.files.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Attachments</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedTask.files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url || file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <FaImage className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white truncate">{file.name || `File ${idx + 1}`}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned Developers */}
              <div>
                <p className="text-sm text-gray-500 mb-3">Assigned Developers</p>
                {selectedTask.assignedDevelopers && selectedTask.assignedDevelopers.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTask.assignedDevelopers.map((dev) => {
                      const isLead = selectedTask.assignedDeveloper && (selectedTask.assignedDeveloper._id || selectedTask.assignedDeveloper) === (dev._id || dev);
                      return (
                        <div key={dev._id} className={`flex items-center gap-3 p-3 rounded-lg border ${isLead ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}`}>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold ${isLead ? 'bg-amber-600' : 'bg-gradient-to-br from-blue-500 to-violet-600'}`}>
                            {(dev.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">{dev.name || dev.email}</p>
                              {isLead && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded">
                                  <FaCrown className="w-2.5 h-2.5" /> Lead
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{dev.expertise?.join(', ') || 'No expertise'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    No developers assigned yet. Use "Acknowledge" to assign developers.
                  </p>
                )}
              </div>

              {/* Progress Info */}
              <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-lg p-4 border border-blue-500/20">
                <p className="text-sm text-gray-400 mb-2">Task Progress</p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden mr-3">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-violet-600" style={{ width: `${selectedTask.progress || 0}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-white whitespace-nowrap">{selectedTask.progress || 0}%</span>
                </div>
              </div>

              {/* Payment Info */}
              {(selectedTask.quotedAmount || selectedTask.amount) && (
                <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                  <p className="text-sm text-gray-400 mb-2">Payment Info</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-emerald-400">Rs. {(selectedTask.quotedAmount || selectedTask.amount || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{selectedTask.paymentMethod === 'qr' ? 'QR Payment' : selectedTask.paymentMethod === 'esewa' ? 'eSewa' : 'Pending'}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-lg ${selectedTask.paymentStatus === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : selectedTask.paymentStatus === 'paid' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {selectedTask.paymentStatus === 'verified' ? 'Verified' : selectedTask.paymentStatus === 'paid' ? 'Pending Verification' : 'Not Paid'}
                    </span>
                  </div>
                </div>
              )}

              {/* QR Payment Proof */}
              {selectedTask.qrPaymentProof && (
                <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                  <p className="text-sm text-gray-400 mb-3">Payment Proof</p>
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                      <img
                        src={selectedTask.qrPaymentProof}
                        alt="Payment Proof"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-2">Submitted: {selectedTask.qrPaymentSubmittedAt ? new Date(selectedTask.qrPaymentSubmittedAt).toLocaleString() : 'N/A'}</p>
                      <a
                        href={selectedTask.qrPaymentProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                      >
                        <HiOutlineExternalLink className="w-4 h-4" />
                        View Full Image
                      </a>
                      {selectedTask.status === 'payment-pending' && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleVerifyPayment(selectedTask)}
                            disabled={actionLoading === selectedTask._id}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Verify Payment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              {selectedTask.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setSelectedTask(null);
                      navigate(`/admin/quotes/new?orderId=${selectedTask._id}`);
                    }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Create Quote
                  </button>
                  <button
                    onClick={() => openAcknowledgeModal(selectedTask)}
                    disabled={actionLoading === selectedTask._id}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    Quick Assign
                  </button>
                  <button
                    onClick={() => setRejectModal(selectedTask)}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              {selectedTask.status === 'released-to-admin' && (
                <button
                  onClick={() => handleReleaseToClient(selectedTask)}
                  disabled={actionLoading === selectedTask._id}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Release to Client
                </button>
              )}
              {selectedTask.status === 'review' && (
                <button
                  onClick={() => handleDeliver(selectedTask)}
                  disabled={actionLoading === selectedTask._id}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Deliver to Client
                </button>
              )}
              <button
                onClick={() => setSelectedTask(null)}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initialize Modal */}
      {acknowledgeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Initialize Task</h2>
              <p className="text-sm text-gray-500 mt-1">{acknowledgeModal.title}</p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-300">
                Are you ready to acknowledge this task and start the assignment process? You'll be able to assign developers in the next step.
              </p>
              
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm font-medium text-blue-400">Budget: <span className="text-white">{acknowledgeModal.budget}</span></p>
                <p className="text-sm text-blue-300/70 mt-2">You can set the final quoted price when assigning developers.</p>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setAcknowledgeModal(null);
                  setSelectedDevelopers([]);
                  setQuotedAmount('');
                }}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledge}
                disabled={actionLoading === acknowledgeModal._id}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
              >
                {actionLoading === acknowledgeModal._id ? 'Processing...' : 'Initialize Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Developers Modal */}
      {assignDevelopersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Assign Workers</h2>
              <p className="text-sm text-gray-500 mt-1">{assignDevelopersModal.title}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Quoted Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Set Price (Rs.) *</label>
                <input
                  type="number"
                  value={quotedAmount}
                  onChange={(e) => setQuotedAmount(e.target.value)}
                  placeholder="Enter the quoted amount"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <p className="text-xs text-gray-500 mt-1">Original budget: {assignDevelopersModal.budget}</p>
              </div>

              {/* Worker Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">Select Workers *</label>
                  {selectedDevelopers.length > 0 && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg">
                      {selectedDevelopers.length} selected
                    </span>
                  )}
                </div>

                <div className="max-h-[40vh] overflow-y-auto space-y-2">
                  {developers.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No developers available</p>
                  ) : (
                    developers.map((dev) => {
                      const isSelected = selectedDevelopers.includes(dev._id);

                      return (
                        <div
                          key={dev._id}
                          onClick={() => toggleDeveloperSelection(dev._id)}
                          className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                            ? 'bg-blue-500/20 border-blue-500/30'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                        >
                          {/* Select checkbox */}
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-gray-500'
                              }`}
                          >
                            {isSelected && <FaCheckCircle className="w-4 h-4" />}
                          </div>

                          {/* Developer info */}
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0 bg-gradient-to-br from-blue-500 to-violet-600">
                            {(dev.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{dev.name || 'Profile not set'}</p>
                            <p className="text-xs text-gray-500">{dev.email}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Info box */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-300">
                  Selected workers will be notified and assigned to this task. Client will receive the quote.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setAssignDevelopersModal(null);
                  setSelectedDevelopers([]);
                  setQuotedAmount('');
                }}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDevelopers}
                disabled={actionLoading === assignDevelopersModal._id || selectedDevelopers.length === 0 || !quotedAmount}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
              >
                {actionLoading === assignDevelopersModal._id ? 'Processing...' : 'Assign Workers'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Reject Task</h2>
              <p className="text-sm text-gray-500 mt-1">{rejectModal.title}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reason for rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this task is being rejected..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal._id}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
              >
                {actionLoading === rejectModal._id ? 'Rejecting...' : 'Reject Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Modal */}
      {deliveryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-lg w-full border border-white/10">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Deliver to Client</h2>
              <p className="text-sm text-gray-500 mt-1">{deliveryModal.title}</p>
            </div>
            <div className="p-6 space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload Deliverable Files</label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-white/20 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploadingFiles}
                    className="hidden"
                    id="deliverable-upload"
                  />
                  <label htmlFor="deliverable-upload" className="cursor-pointer">
                    <FaImage className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {uploadingFiles ? 'Uploading...' : 'Click to upload files'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, ZIP, DOC, images, etc.</p>
                  </label>
                </div>
              </div>

              {/* Uploaded Files */}
              {deliveryFiles.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Attached Files ({deliveryFiles.length})</label>
                  {deliveryFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-sm text-white truncate flex-1">{file.fileName}</span>
                      <button
                        onClick={() => setDeliveryFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-gray-400 hover:text-red-400"
                      >
                        <FaTimesCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Notes (optional)</label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Any notes for the client..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => { setDeliveryModal(null); setDeliveryFiles([]); setDeliveryNotes(''); }}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitDelivery}
                disabled={actionLoading === deliveryModal._id || uploadingFiles}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
              >
                {actionLoading === deliveryModal._id ? 'Delivering...' : 'Deliver Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
