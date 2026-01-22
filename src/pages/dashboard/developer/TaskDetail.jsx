import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaCrown, FaDownload, FaFileAlt, FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaFileCode, FaTh, FaExternalLinkAlt, FaClock, FaCalendar, FaMoneyBillWave, FaUsers, FaPlus, FaCheck, FaExclamationTriangle, FaTimes, FaTrash } from 'react-icons/fa';
import api from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import TeamPanel from '../../../components/TeamPanel';

export default function TaskDetail() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const [task, setTask] = useState(null);
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState({
        progress: 0,
        progressNotes: '',
        status: 'working',
    });
    const [updatingProgress, setUpdatingProgress] = useState(false);

    // Subtask state
    const [newSubtask, setNewSubtask] = useState('');
    const [addingSubtask, setAddingSubtask] = useState(false);

    // Blocker state
    const [showBlockerModal, setShowBlockerModal] = useState(false);
    const [newBlocker, setNewBlocker] = useState({ title: '', description: '', severity: 'medium' });
    const [addingBlocker, setAddingBlocker] = useState(false);

    useEffect(() => {
        fetchTask();
    }, [taskId]);

    const fetchTask = async () => {
        try {
            const { data } = await api.get('/developer/tasks');
            const foundTask = data.find(t => t._id === taskId);
            if (foundTask) {
                setTask(foundTask);
                setProgressData({
                    progress: foundTask.progress || 0,
                    progressNotes: '',
                    status: foundTask.status,
                });
                // Try to find the workspace for this task
                try {
                    const wsRes = await api.get('/workspaces');
                    const ws = wsRes.data.find(w => w.task?._id === taskId || w.task === taskId);
                    if (ws) setWorkspace(ws);
                } catch (e) {
                    console.log('No workspace found');
                }
            } else {
                navigate('/developer/tasks');
            }
        } catch (error) {
            console.error('Error fetching task:', error);
            navigate('/developer/tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProgress = async () => {
        if (!task) return;
        setUpdatingProgress(true);
        try {
            await api.put(`/developer/tasks/${task._id}/progress`, progressData);
            toast.success('Progress updated successfully!');
            fetchTask();
        } catch (error) {
            console.error('Error updating progress:', error);
        } finally {
            setUpdatingProgress(false);
        }
    };

    // Subtask handlers
    const handleAddSubtask = async () => {
        if (!newSubtask.trim()) return;
        setAddingSubtask(true);
        try {
            await api.post(`/orders/${task._id}/subtasks`, { title: newSubtask.trim() });
            toast.success('Subtask added!');
            setNewSubtask('');
            fetchTask();
        } catch (error) {
            console.error('Error adding subtask:', error);
        } finally {
            setAddingSubtask(false);
        }
    };

    const handleToggleSubtask = async (subtaskId, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        try {
            await api.put(`/orders/${task._id}/subtasks/${subtaskId}`, { status: newStatus });
            fetchTask();
        } catch (error) {
            console.error('Error updating subtask:', error);
        }
    };

    const handleDeleteSubtask = async (subtaskId) => {
        try {
            await api.delete(`/orders/${task._id}/subtasks/${subtaskId}`);
            toast.success('Subtask deleted');
            fetchTask();
        } catch (error) {
            console.error('Error deleting subtask:', error);
        }
    };

    // Blocker handlers
    const handleAddBlocker = async () => {
        if (!newBlocker.title.trim()) return;
        setAddingBlocker(true);
        try {
            await api.post(`/orders/${task._id}/blockers`, newBlocker);
            toast.success('Blocker reported');
            setNewBlocker({ title: '', description: '', severity: 'medium' });
            setShowBlockerModal(false);
            fetchTask();
        } catch (error) {
            console.error('Error adding blocker:', error);
        } finally {
            setAddingBlocker(false);
        }
    };

    const getFileIcon = (filename) => {
        const ext = filename?.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf':
                return <FaFilePdf className="w-5 h-5 text-red-400" />;
            case 'doc':
            case 'docx':
                return <FaFileWord className="w-5 h-5 text-blue-400" />;
            case 'xls':
            case 'xlsx':
                return <FaFileExcel className="w-5 h-5 text-green-400" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return <FaImage className="w-5 h-5 text-purple-400" />;
            case 'js':
            case 'ts':
            case 'py':
            case 'html':
            case 'css':
                return <FaFileCode className="w-5 h-5 text-yellow-400" />;
            default:
                return <FaFileAlt className="w-5 h-5 text-gray-400" />;
        }
    };

    const statusConfig = {
        accepted: { label: 'Accepted', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
        working: { label: 'In Progress', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
        review: { label: 'Under Review', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
        delivered: { label: 'Delivered', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
        pending: { label: 'Pending', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    };

    const getStatusColor = (status) => {
        return statusConfig[status]?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    const getStatusLabel = (status) => {
        return statusConfig[status]?.label || status;
    };

    const isLeadDeveloper = task?.assignedDeveloper?._id === user?._id || task?.assignedDeveloper === user?._id;

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading task details...</p>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">Task not found</p>
                <Link to="/developer/tasks" className="text-blue-400 hover:underline mt-2 inline-block">
                    Back to Tasks
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/developer/tasks')}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                    <FaArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">{task.title}</h1>
                        {isLeadDeveloper && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded">
                                <FaCrown className="w-3 h-3" /> Lead Developer
                            </span>
                        )}
                    </div>
                    <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-lg border ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                    </span>
                </div>
                {workspace && (
                    <Link
                        to={`/developer/workspace/${workspace._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                    >
                        <FaTh className="w-4 h-4" />
                        Open Workspace
                    </Link>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Task Info Cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <FaMoneyBillWave className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Budget</p>
                                    <p className="font-semibold text-white">{task.budget}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <FaMoneyBillWave className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Quoted</p>
                                    <p className="font-semibold text-white">Rs. {(task.quotedAmount || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                    <FaCalendar className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Deadline</p>
                                    <p className="font-semibold text-white">
                                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'None'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                    <FaClock className="w-5 h-5 text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Assigned</p>
                                    <p className="font-semibold text-white">
                                        {task.assignedAt ? new Date(task.assignedAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
                        <p className="text-gray-300 whitespace-pre-wrap">{task.description}</p>
                    </div>

                    {/* Attachments */}
                    {task.files && task.files.length > 0 && (
                        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Attachments ({task.files.length})
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {task.files.map((file, idx) => {
                                    const filename = file.name || file.url?.split('/').pop() || `File ${idx + 1}`;
                                    const fileUrl = file.url || file;
                                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

                                    return (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                                        >
                                            {isImage ? (
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                                    <img
                                                        src={fileUrl}
                                                        alt={filename}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                                    {getFileIcon(filename)}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white truncate">{filename}</p>
                                                <p className="text-xs text-gray-500">
                                                    {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Click to download'}
                                                </p>
                                            </div>
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                                            >
                                                <FaExternalLinkAlt className="w-4 h-4" />
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Team Panel */}
                    <TeamPanel taskId={taskId} isLead={isLeadDeveloper} />

                    {/* Subtasks Checklist */}
                    <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">
                                Subtasks ({task.subtasks?.filter(s => s.status === 'completed').length || 0}/{task.subtasks?.length || 0})
                            </h3>
                        </div>

                        {/* Subtask List */}
                        <div className="space-y-2 mb-4">
                            {task.subtasks?.length > 0 ? (
                                task.subtasks.map((subtask) => (
                                    <div
                                        key={subtask._id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                                            subtask.status === 'completed'
                                                ? 'bg-emerald-500/10 border-emerald-500/20'
                                                : subtask.status === 'blocked'
                                                    ? 'bg-red-500/10 border-red-500/20'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        <button
                                            onClick={() => handleToggleSubtask(subtask._id, subtask.status)}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                subtask.status === 'completed'
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-gray-500 hover:border-emerald-400'
                                            }`}
                                        >
                                            {subtask.status === 'completed' && <FaCheck className="w-3 h-3 text-white" />}
                                        </button>
                                        <span className={`flex-1 ${subtask.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                                            {subtask.title}
                                        </span>
                                        {subtask.isRequired && (
                                            <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">Required</span>
                                        )}
                                        {!subtask.isRequired && (
                                            <button
                                                onClick={() => handleDeleteSubtask(subtask._id)}
                                                className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <FaTrash className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm py-2">No subtasks yet. Add one below.</p>
                            )}
                        </div>

                        {/* Add Subtask Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                                placeholder="Add a subtask..."
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

                    {/* Blockers Section */}
                    <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FaExclamationTriangle className="text-amber-400" />
                                Blockers ({task.blockers?.filter(b => b.status === 'open').length || 0} open)
                            </h3>
                            <button
                                onClick={() => setShowBlockerModal(true)}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-2"
                            >
                                <FaPlus className="w-3 h-3" /> Report Blocker
                            </button>
                        </div>

                        {/* Blocker List */}
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
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Reported {new Date(blocker.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm py-2">No blockers reported. Great!</p>
                            )}
                        </div>
                    </div>

                    {/* Blocker Modal */}
                    {showBlockerModal && (
                        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                            <div className="bg-[#16161a] rounded-2xl border border-white/10 w-full max-w-md p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white">Report Blocker</h3>
                                    <button
                                        onClick={() => setShowBlockerModal(false)}
                                        className="p-2 text-gray-400 hover:text-white"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={newBlocker.title}
                                            onChange={(e) => setNewBlocker({ ...newBlocker, title: e.target.value })}
                                            placeholder="What's blocking you?"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                        <textarea
                                            value={newBlocker.description}
                                            onChange={(e) => setNewBlocker({ ...newBlocker, description: e.target.value })}
                                            placeholder="Provide more details..."
                                            rows="3"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Severity</label>
                                        <select
                                            value={newBlocker.severity}
                                            onChange={(e) => setNewBlocker({ ...newBlocker, severity: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-red-500 outline-none"
                                        >
                                            <option value="low" className="bg-[#16161a]">Low - Can work around it</option>
                                            <option value="medium" className="bg-[#16161a]">Medium - Slowing progress</option>
                                            <option value="high" className="bg-[#16161a]">High - Blocking major work</option>
                                            <option value="critical" className="bg-[#16161a]">Critical - Complete stop</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleAddBlocker}
                                        disabled={addingBlocker || !newBlocker.title.trim()}
                                        className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
                                    >
                                        {addingBlocker ? 'Reporting...' : 'Report Blocker'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Progress History */}
                    {task.progressNotes && task.progressNotes.length > 0 && (
                        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Progress History</h3>
                            <div className="space-y-3">
                                {task.progressNotes.slice().reverse().map((note, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-white/5 border-l-4 border-blue-500">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-blue-400">{note.percentage}% complete</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(note.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm">{note.notes}</p>
                                        {note.developerName && (
                                            <p className="text-xs text-gray-500 mt-2">By: {note.developerName}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Update Progress */}
                <div className="lg:col-span-1">
                    <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden sticky top-6">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="text-lg font-bold text-white">Update Progress</h3>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Current Progress */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-400">Current Progress</span>
                                    <span className="text-lg font-bold text-white">{task.progress || 0}%</span>
                                </div>
                                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                                        style={{ width: `${task.progress || 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Progress Slider */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Set Progress: {progressData.progress}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progressData.progress}
                                    onChange={(e) => setProgressData({
                                        ...progressData,
                                        progress: parseInt(e.target.value),
                                    })}
                                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            {/* Status Update */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Update Status</label>
                                <select
                                    value={progressData.status}
                                    onChange={(e) => setProgressData({
                                        ...progressData,
                                        status: e.target.value,
                                    })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="working" className="bg-[#0f0f14]">In Progress</option>
                                    <option value="review" className="bg-[#0f0f14]">Submit for Review</option>
                                </select>
                            </div>

                            {/* Progress Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Update Notes</label>
                                <textarea
                                    value={progressData.progressNotes}
                                    onChange={(e) => setProgressData({
                                        ...progressData,
                                        progressNotes: e.target.value,
                                    })}
                                    placeholder="What did you accomplish?"
                                    rows="4"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleUpdateProgress}
                                disabled={updatingProgress}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
                            >
                                {updatingProgress ? 'Updating...' : 'Update Progress'}
                            </button>
                        </div>

                        {/* Client Info */}
                        <div className="p-6 border-t border-white/5">
                            <h4 className="text-sm font-medium text-gray-400 mb-3">Client</h4>
                            <p className="font-medium text-white">{task.clientName || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{task.clientEmail}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
