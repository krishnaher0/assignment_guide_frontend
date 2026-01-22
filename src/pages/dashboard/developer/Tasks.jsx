import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const statusConfig = {
    accepted: { label: 'Accepted', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    working: { label: 'In Progress', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    review: { label: 'Under Review', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    delivered: { label: 'Delivered', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
};

const urgencyConfig = {
    rush: { label: 'Rush', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    urgent: { label: 'Urgent', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    priority: { label: 'Priority', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
};

const tabs = [
    { key: 'active', label: 'Active', statuses: ['accepted', 'working', 'review'] },
    { key: 'completed', label: 'Completed', statuses: ['delivered', 'completed'] },
    { key: 'all', label: 'All Tasks', statuses: null },
];

function formatDeadline(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffMs < 0) {
        return { text: 'Overdue', color: 'text-red-400', urgent: true };
    } else if (diffDays === 0) {
        return { text: `${diffHours}h left`, color: 'text-red-400', urgent: true };
    } else if (diffDays === 1) {
        return { text: '1 day left', color: 'text-orange-400', urgent: true };
    } else if (diffDays <= 3) {
        return { text: `${diffDays} days left`, color: 'text-amber-400', urgent: false };
    } else {
        return { text: `${diffDays} days left`, color: 'text-gray-400', urgent: false };
    }
}

export default function DeveloperTasks() {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingProgress, setUpdatingProgress] = useState(false);
    const [activeTab, setActiveTab] = useState('active');
    const [progressData, setProgressData] = useState({
        progress: 0,
        notes: '',
    });

    useEffect(() => {
        fetchTasks();
    }, [activeTab]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const tab = tabs.find(t => t.key === activeTab);
            const statusParam = tab?.statuses ? `?status=${tab.statuses.join(',')}` : '';
            // For 'all', don't pass status filter
            const url = activeTab === 'all' ? '/developer/tasks?status=all' : `/developer/tasks${statusParam}`;
            const res = await api.get(url);
            setTasks(res.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            showError('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTask = (task) => {
        setSelectedTask(task);
        setProgressData({
            progress: task.progress || 0,
            notes: '',
        });
    };

    const handleUpdateProgress = async () => {
        if (!selectedTask) return;

        setUpdatingProgress(true);
        try {
            await api.put(`/developer/tasks/${selectedTask._id}/progress`, {
                progress: progressData.progress,
                progressNotes: progressData.notes,
            });
            success('Progress updated successfully');
            setProgressData({ progress: 0, notes: '' });
            setSelectedTask(null);
            fetchTasks();
        } catch (error) {
            console.error('Error updating progress:', error);
            showError(error.response?.data?.message || 'Failed to update progress');
        } finally {
            setUpdatingProgress(false);
        }
    };

    const handleSubmitForReview = async () => {
        if (!selectedTask) return;

        setUpdatingProgress(true);
        try {
            await api.put(`/developer/tasks/${selectedTask._id}/status`, {
                status: 'review',
                notes: progressData.notes || 'Submitted for review',
            });
            success('Task submitted for review');
            setSelectedTask(null);
            fetchTasks();
        } catch (error) {
            console.error('Error submitting for review:', error);
            showError(error.response?.data?.message || 'Failed to submit for review');
        } finally {
            setUpdatingProgress(false);
        }
    };

    const isLeadDeveloper = (task) => {
        return task.assignedDeveloper?._id === user?._id ||
               task.assignedDeveloper === user?._id;
    };

    const filteredTasks = tasks;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Loading tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Tasks</h1>
                    <p className="text-gray-400 mt-1">Manage and track your assigned tasks</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-[#0f0f14] rounded-xl border border-white/5 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveTab(tab.key);
                            setSelectedTask(null);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === tab.key
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tasks List */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl bg-[#0f0f14] border border-white/5 overflow-hidden">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    {tabs.find(t => t.key === activeTab)?.label}
                                </h2>
                                <p className="text-sm text-gray-500">{filteredTasks.length} tasks</p>
                            </div>
                            <button
                                onClick={fetchTasks}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>

                        <div className="divide-y divide-white/5">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => {
                                    const status = statusConfig[task.status] || statusConfig.working;
                                    const urgency = urgencyConfig[task.urgency];
                                    const deadline = task.deadline ? formatDeadline(task.deadline) : null;
                                    const isLead = isLeadDeveloper(task);
                                    const isSelected = selectedTask?._id === task._id;

                                    return (
                                        <div
                                            key={task._id}
                                            onClick={() => handleSelectTask(task)}
                                            className={`p-5 cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-blue-500/10 border-l-4 border-blue-500'
                                                    : 'hover:bg-white/[0.02] border-l-4 border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <h3 className="font-semibold text-white truncate">{task.title}</h3>
                                                        {isLead && (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                                Lead
                                                            </span>
                                                        )}
                                                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                        {urgency && (
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${urgency.color}`}>
                                                                {urgency.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 line-clamp-1">
                                                        {task.description?.substring(0, 100)}...
                                                    </p>
                                                </div>
                                                {deadline && (
                                                    <div className={`flex items-center gap-1.5 shrink-0 ${deadline.color}`}>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-sm font-medium">{deadline.text}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs text-gray-500">Progress</span>
                                                    <span className="text-xs font-medium text-white">{task.progress || 0}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all rounded-full"
                                                        style={{ width: `${task.progress || 0}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 text-sm">
                                                <div className="flex items-center gap-4 text-gray-500">
                                                    {task.subject && (
                                                        <span className="capitalize">{task.subject.replace('_', ' ')}</span>
                                                    )}
                                                    {task.academicLevel && (
                                                        <>
                                                            <span className="text-gray-700">•</span>
                                                            <span className="capitalize">{task.academicLevel.replace('_', ' ')}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <Link
                                                    to={`/developer/tasks/${task._id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    <span>View Details</span>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">No Tasks Found</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">
                                        {activeTab === 'active'
                                            ? "You don't have any active tasks at the moment."
                                            : activeTab === 'completed'
                                            ? "You haven't completed any tasks yet."
                                            : "No tasks assigned to you."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Update Progress Panel */}
                <div className="lg:col-span-1">
                    {selectedTask ? (
                        <div className="rounded-2xl bg-[#0f0f14] border border-white/5 overflow-hidden sticky top-24">
                            <div className="p-5 border-b border-white/5">
                                <h3 className="text-lg font-semibold text-white">Update Progress</h3>
                                <p className="text-sm text-gray-500 mt-1 truncate">{selectedTask.title}</p>
                            </div>

                            <div className="p-5 space-y-5">
                                {/* Current Status */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                                        Current Status
                                    </label>
                                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${statusConfig[selectedTask.status]?.color || 'bg-gray-500/20 text-gray-400'}`}>
                                        {statusConfig[selectedTask.status]?.label || selectedTask.status}
                                    </span>
                                </div>

                                {/* Progress Slider */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                                        Progress: {progressData.progress}%
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
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>0%</span>
                                        <span>50%</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                                        Update Notes
                                    </label>
                                    <textarea
                                        value={progressData.notes}
                                        onChange={(e) => setProgressData({
                                            ...progressData,
                                            notes: e.target.value,
                                        })}
                                        placeholder="Add a note about your progress..."
                                        rows="3"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none resize-none transition-colors"
                                    />
                                </div>

                                {/* Progress History */}
                                {selectedTask.progressNotes && selectedTask.progressNotes.length > 0 && (
                                    <div className="pt-4 border-t border-white/5">
                                        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                                            Recent Updates
                                        </h4>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {selectedTask.progressNotes.slice(-3).reverse().map((note, idx) => (
                                                <div key={idx} className="text-xs bg-white/5 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-blue-400 font-medium">{note.percentage || 0}%</span>
                                                        <span className="text-gray-600">
                                                            {new Date(note.updatedAt || note.addedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400">{note.notes || note.note}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-2">
                                    <button
                                        onClick={handleUpdateProgress}
                                        disabled={updatingProgress}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        {updatingProgress ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Update Progress
                                            </>
                                        )}
                                    </button>

                                    {selectedTask.status === 'working' && (
                                        <button
                                            onClick={handleSubmitForReview}
                                            disabled={updatingProgress}
                                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Submit for Review
                                        </button>
                                    )}

                                    <Link
                                        to={`/developer/tasks/${selectedTask._id}`}
                                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View Full Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl bg-[#0f0f14] border border-white/5 p-8 text-center sticky top-24">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Select a Task</h3>
                            <p className="text-gray-500 text-sm">
                                Click on a task from the list to update its progress
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
