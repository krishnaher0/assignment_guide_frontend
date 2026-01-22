import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaTh, FaUsers, FaLock, FaGlobe, FaLink, FaEllipsisV, FaTrash, FaEdit, FaCopy, FaCheck, FaTasks, FaCrown, FaInfoCircle } from 'react-icons/fa';
import api from '../../../utils/api';

const colorOptions = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#6366f1'
];

export default function Workspace() {
    const [workspaces, setWorkspaces] = useState([]);
    const [availableTasks, setAvailableTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showMenu, setShowMenu] = useState(null);
    const [copiedLink, setCopiedLink] = useState(null);
    const [createStep, setCreateStep] = useState('select-task'); // 'select-task' or 'configure'

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: 'shared',
        color: '#3b82f6',
    });

    useEffect(() => {
        fetchWorkspaces();
        fetchAvailableTasks();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const { data } = await api.get('/workspaces');
            setWorkspaces(data);
        } catch (error) {
            console.error('Error fetching workspaces:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableTasks = async () => {
        try {
            const { data } = await api.get('/workspaces/available-tasks');
            setAvailableTasks(data);
        } catch (error) {
            console.error('Error fetching available tasks:', error);
        }
    };

    const handleTaskSelect = (task) => {
        if (!task.isLeadDeveloper) return; // Can't select if not lead
        if (task.hasWorkspace) return; // Can't select if already has workspace

        setSelectedTask(task);
        setFormData({
            ...formData,
            title: task.title,
            description: task.description || '',
        });
        setCreateStep('configure');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!selectedTask) {
            alert('Please select a task first');
            return;
        }

        try {
            const { data } = await api.post('/workspaces', {
                ...formData,
                taskId: selectedTask._id,
            });
            setWorkspaces([data, ...workspaces]);
            setShowCreateModal(false);
            resetCreateModal();
            // Refresh available tasks to update hasWorkspace status
            fetchAvailableTasks();
        } catch (error) {
            console.error('Error creating workspace:', error);
            alert(error.response?.data?.message || 'Failed to create workspace');
        }
    };

    const resetCreateModal = () => {
        setSelectedTask(null);
        setCreateStep('select-task');
        setFormData({ title: '', description: '', visibility: 'shared', color: '#3b82f6' });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/workspaces/${selectedWorkspace._id}`, formData);
            setWorkspaces(workspaces.map(w => w._id === data._id ? data : w));
            setShowEditModal(false);
            setSelectedWorkspace(null);
        } catch (error) {
            console.error('Error updating workspace:', error);
            alert(error.response?.data?.message || 'Failed to update workspace');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this workspace? All boards and cards will be permanently deleted.')) return;
        try {
            await api.delete(`/workspaces/${id}`);
            setWorkspaces(workspaces.filter(w => w._id !== id));
            fetchAvailableTasks(); // Refresh to show task as available again
        } catch (error) {
            console.error('Error deleting workspace:', error);
            alert(error.response?.data?.message || 'Failed to delete workspace');
        }
    };

    const handleToggleInvite = async (workspace) => {
        try {
            const { data } = await api.post(`/workspaces/${workspace._id}/invite`);
            setWorkspaces(workspaces.map(w =>
                w._id === workspace._id
                    ? { ...w, inviteEnabled: data.inviteEnabled, inviteCode: data.inviteCode }
                    : w
            ));
        } catch (error) {
            console.error('Error toggling invite:', error);
        }
    };

    const copyInviteLink = (workspace) => {
        const link = `${window.location.origin}/developer/workspace/join/${workspace.inviteCode}`;
        navigator.clipboard.writeText(link);
        setCopiedLink(workspace._id);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    const openEditModal = (workspace) => {
        setSelectedWorkspace(workspace);
        setFormData({
            title: workspace.title,
            description: workspace.description || '',
            visibility: workspace.visibility,
            color: workspace.color,
        });
        setShowEditModal(true);
        setShowMenu(null);
    };

    const getVisibilityIcon = (visibility) => {
        switch (visibility) {
            case 'private': return <FaLock className="w-3 h-3" />;
            case 'shared': return <FaUsers className="w-3 h-3" />;
            case 'public': return <FaGlobe className="w-3 h-3" />;
            default: return null;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'accepted': 'bg-emerald-500/20 text-emerald-400',
            'working': 'bg-violet-500/20 text-violet-400',
            'review': 'bg-orange-500/20 text-orange-400',
            'delivered': 'bg-blue-500/20 text-blue-400',
            'completed': 'bg-emerald-500/20 text-emerald-400',
        };
        return styles[status] || 'bg-gray-500/20 text-gray-400';
    };

    // Count tasks that can have workspaces created
    const availableForCreation = availableTasks.filter(t => t.isLeadDeveloper && !t.hasWorkspace).length;

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading workspaces...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Workspaces</h1>
                    <p className="text-gray-400">Manage your projects and collaborate with team</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={availableForCreation === 0}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-colors ${
                        availableForCreation > 0
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    }`}
                    title={availableForCreation === 0 ? 'No tasks available for workspace creation' : ''}
                >
                    <FaPlus className="w-4 h-4" />
                    New Workspace
                </button>
            </div>

            {/* Info banner if no tasks available */}
            {availableForCreation === 0 && workspaces.length === 0 && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <FaInfoCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-blue-400 font-medium">No tasks assigned as lead developer</p>
                        <p className="text-sm text-blue-400/70 mt-1">
                            You can only create workspaces for tasks where you are the lead/primary developer.
                            Check your assigned tasks or contact your admin.
                        </p>
                    </div>
                </div>
            )}

            {/* Workspaces Grid */}
            {workspaces.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                        <FaTh className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No workspaces yet</h3>
                    <p className="text-gray-400 mb-6">Create your first workspace to start organizing your projects</p>
                    {availableForCreation > 0 && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                        >
                            <FaPlus className="w-4 h-4" />
                            Create Workspace
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workspaces.map((workspace) => (
                        <div
                            key={workspace._id}
                            className="group relative rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all overflow-hidden"
                        >
                            {/* Color bar */}
                            <div
                                className="h-2"
                                style={{ backgroundColor: workspace.color }}
                            />

                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <Link
                                        to={`/developer/workspace/${workspace._id}`}
                                        className="flex-1"
                                    >
                                        <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
                                            {workspace.title}
                                        </h3>
                                    </Link>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowMenu(showMenu === workspace._id ? null : workspace._id)}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            <FaEllipsisV className="w-4 h-4" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showMenu === workspace._id && (
                                            <div className="absolute right-0 top-10 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-10 py-1">
                                                <button
                                                    onClick={() => openEditModal(workspace)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                    Edit Workspace
                                                </button>
                                                <button
                                                    onClick={() => handleToggleInvite(workspace)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5"
                                                >
                                                    <FaLink className="w-4 h-4" />
                                                    {workspace.inviteEnabled ? 'Disable Invite' : 'Enable Invite'}
                                                </button>
                                                {workspace.inviteEnabled && (
                                                    <button
                                                        onClick={() => copyInviteLink(workspace)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5"
                                                    >
                                                        {copiedLink === workspace._id ? (
                                                            <>
                                                                <FaCheck className="w-4 h-4 text-green-400" />
                                                                <span className="text-green-400">Copied!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaCopy className="w-4 h-4" />
                                                                Copy Invite Link
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                <div className="border-t border-white/5 my-1" />
                                                <button
                                                    onClick={() => handleDelete(workspace._id)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                    Delete Workspace
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Linked Task Info */}
                                {workspace.task && (
                                    <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-white/5">
                                        <FaTasks className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-sm text-gray-300 truncate flex-1">
                                            {workspace.task.title}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(workspace.task.status)}`}>
                                            {workspace.task.status}
                                        </span>
                                    </div>
                                )}

                                {/* Description */}
                                {workspace.description && (
                                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                        {workspace.description}
                                    </p>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
                                            workspace.visibility === 'private'
                                                ? 'bg-gray-500/20 text-gray-400'
                                                : workspace.visibility === 'shared'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-green-500/20 text-green-400'
                                        }`}>
                                            {getVisibilityIcon(workspace.visibility)}
                                            {workspace.visibility}
                                        </span>
                                    </div>

                                    {/* Collaborators */}
                                    <div className="flex items-center -space-x-2">
                                        {workspace.collaborators?.slice(0, 3).map((collab) => (
                                            <div
                                                key={collab.user._id}
                                                className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs text-white font-medium border-2 border-[#0f0f14]"
                                                title={collab.user.name}
                                            >
                                                {collab.user.name?.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                        {workspace.collaborators?.length > 3 && (
                                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400 border-2 border-[#0f0f14]">
                                                +{workspace.collaborators.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Open button */}
                            <Link
                                to={`/developer/workspace/${workspace._id}`}
                                className="block px-5 py-3 text-center text-sm font-medium text-blue-400 hover:text-white hover:bg-blue-600/20 border-t border-white/5 transition-colors"
                            >
                                Open Workspace
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                    <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-full max-w-lg p-6">
                        {createStep === 'select-task' ? (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-white">Select Task</h2>
                                    <button
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetCreateModal();
                                        }}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <p className="text-gray-400 text-sm mb-4">
                                    Choose a task to create a workspace for. Only tasks where you are the lead developer can have workspaces.
                                </p>

                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {availableTasks.length === 0 ? (
                                        <div className="text-center py-8">
                                            <FaTasks className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-400">No tasks assigned to you</p>
                                        </div>
                                    ) : (
                                        availableTasks.map((task) => {
                                            const isDisabled = !task.isLeadDeveloper || task.hasWorkspace;

                                            return (
                                                <button
                                                    key={task._id}
                                                    onClick={() => handleTaskSelect(task)}
                                                    disabled={isDisabled}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                                                        isDisabled
                                                            ? 'bg-white/[0.02] border-white/5 opacity-60 cursor-not-allowed'
                                                            : 'bg-white/[0.02] border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-medium text-white truncate">
                                                                    {task.title}
                                                                </h4>
                                                                {task.isLeadDeveloper && (
                                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs shrink-0">
                                                                        <FaCrown className="w-2.5 h-2.5" />
                                                                        Lead
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {task.description && (
                                                                <p className="text-sm text-gray-400 line-clamp-1">
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${getStatusBadge(task.status)}`}>
                                                            {task.status}
                                                        </span>
                                                    </div>

                                                    {/* Show why disabled */}
                                                    {isDisabled && (
                                                        <div className="mt-2 pt-2 border-t border-white/5">
                                                            {task.hasWorkspace ? (
                                                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                                                    <FaCheck className="w-3 h-3 text-green-500" />
                                                                    Workspace already exists for this task
                                                                </p>
                                                            ) : !task.isLeadDeveloper ? (
                                                                <p className="text-xs text-amber-500/80 flex items-center gap-1.5">
                                                                    <FaLock className="w-3 h-3" />
                                                                    You must be the lead developer to initialize workspace for this project
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="flex justify-end mt-6 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetCreateModal();
                                        }}
                                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Configure Workspace</h2>
                                        <p className="text-sm text-gray-400 mt-1">
                                            For: {selectedTask?.title}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setCreateStep('select-task')}
                                        className="text-sm text-blue-400 hover:text-blue-300"
                                    >
                                        Change Task
                                    </button>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Workspace Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                            placeholder="Workspace name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                            placeholder="Describe your workspace..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Color
                                        </label>
                                        <div className="flex gap-2">
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, color })}
                                                    className={`w-8 h-8 rounded-lg transition-all ${
                                                        formData.color === color
                                                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f0f14]'
                                                            : ''
                                                    }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Visibility
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['private', 'shared', 'public'].map((vis) => (
                                                <button
                                                    key={vis}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, visibility: vis })}
                                                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                                        formData.visibility === vis
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                    }`}
                                                >
                                                    {getVisibilityIcon(vis)}
                                                    {vis.charAt(0).toUpperCase() + vis.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                resetCreateModal();
                                            }}
                                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                                        >
                                            Create Workspace
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                    <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Edit Workspace</h2>

                        <form onSubmit={handleUpdate} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Workspace Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Color
                                </label>
                                <div className="flex gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color })}
                                            className={`w-8 h-8 rounded-lg transition-all ${
                                                formData.color === color
                                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f0f14]'
                                                    : ''
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Visibility
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['private', 'shared', 'public'].map((vis) => (
                                        <button
                                            key={vis}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, visibility: vis })}
                                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                                formData.visibility === vis
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {getVisibilityIcon(vis)}
                                            {vis.charAt(0).toUpperCase() + vis.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedWorkspace(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Click outside to close menu */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setShowMenu(null)}
                />
            )}
        </div>
    );
}
