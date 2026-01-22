import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaArrowLeft, FaTh, FaUsers, FaUserPlus, FaLink, FaCopy, FaCheck, FaEllipsisV, FaTrash, FaEdit, FaCog } from 'react-icons/fa';
import api from '../../../utils/api';

export default function WorkspaceDetail() {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [workspace, setWorkspace] = useState(null);
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateBoard, setShowCreateBoard] = useState(false);
    const [showAddCollaborator, setShowAddCollaborator] = useState(false);
    const [showBoardMenu, setShowBoardMenu] = useState(null);
    const [copiedLink, setCopiedLink] = useState(false);

    const [newBoard, setNewBoard] = useState({ title: '', description: '', background: '#1f2937' });
    const [collaboratorEmail, setCollaboratorEmail] = useState('');

    const backgroundColors = [
        '#1f2937', '#374151', '#1e3a5f', '#312e81', '#4c1d95',
        '#831843', '#991b1b', '#92400e', '#3f6212', '#115e59'
    ];

    useEffect(() => {
        fetchWorkspace();
        fetchBoards();
    }, [workspaceId]);

    const fetchWorkspace = async () => {
        try {
            const { data } = await api.get(`/workspaces/${workspaceId}`);
            setWorkspace(data);
        } catch (error) {
            console.error('Error fetching workspace:', error);
            navigate('/developer/workspace');
        }
    };

    const fetchBoards = async () => {
        try {
            const { data } = await api.get(`/workspaces/${workspaceId}/boards`);
            setBoards(data);
        } catch (error) {
            console.error('Error fetching boards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post(`/workspaces/${workspaceId}/boards`, newBoard);
            setBoards([data, ...boards]);
            setShowCreateBoard(false);
            setNewBoard({ title: '', description: '', background: '#1f2937' });
        } catch (error) {
            console.error('Error creating board:', error);
            alert(error.response?.data?.message || 'Failed to create board');
        }
    };

    const handleDeleteBoard = async (boardId) => {
        if (!confirm('Are you sure you want to delete this board? All columns and cards will be lost.')) return;
        try {
            await api.delete(`/workspaces/${workspaceId}/boards/${boardId}`);
            setBoards(boards.filter(b => b._id !== boardId));
        } catch (error) {
            console.error('Error deleting board:', error);
            alert(error.response?.data?.message || 'Failed to delete board');
        }
    };

    const handleAddCollaborator = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/workspaces/${workspaceId}/collaborators`, { email: collaboratorEmail });
            fetchWorkspace();
            setShowAddCollaborator(false);
            setCollaboratorEmail('');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add collaborator');
        }
    };

    const handleRemoveCollaborator = async (userId) => {
        if (!confirm('Remove this collaborator?')) return;
        try {
            await api.delete(`/workspaces/${workspaceId}/collaborators/${userId}`);
            fetchWorkspace();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to remove collaborator');
        }
    };

    const handleToggleInvite = async () => {
        try {
            const { data } = await api.post(`/workspaces/${workspaceId}/invite`);
            setWorkspace({ ...workspace, inviteEnabled: data.inviteEnabled, inviteCode: data.inviteCode });
        } catch (error) {
            console.error('Error toggling invite:', error);
        }
    };

    const copyInviteLink = () => {
        const link = `${window.location.origin}/developer/workspace/join/${workspace.inviteCode}`;
        navigator.clipboard.writeText(link);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/developer/workspace"
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <FaArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: workspace?.color }}
                        >
                            <FaTh className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{workspace?.title}</h1>
                            {workspace?.description && (
                                <p className="text-sm text-gray-400">{workspace.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Collaborators */}
                    <div className="flex items-center -space-x-2 mr-2">
                        <div
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs text-white font-medium border-2 border-[#0a0a0f]"
                            title={workspace?.owner?.name}
                        >
                            {workspace?.owner?.name?.charAt(0).toUpperCase()}
                        </div>
                        {workspace?.collaborators?.slice(0, 3).map((collab) => (
                            <div
                                key={collab.user._id}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs text-white font-medium border-2 border-[#0a0a0f]"
                                title={collab.user.name}
                            >
                                {collab.user.name?.charAt(0).toUpperCase()}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowAddCollaborator(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
                    >
                        <FaUserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Invite</span>
                    </button>

                    <button
                        onClick={() => setShowCreateBoard(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                    >
                        <FaPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Board</span>
                    </button>
                </div>
            </div>

            {/* Invite Link Banner */}
            {workspace?.inviteEnabled && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-3">
                        <FaLink className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-300">
                            Invite link is active. Share it with developers to join this workspace.
                        </span>
                    </div>
                    <button
                        onClick={copyInviteLink}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                        {copiedLink ? <FaCheck className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
                        {copiedLink ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
            )}

            {/* Boards Grid */}
            {boards.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                        <FaTh className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No boards yet</h3>
                    <p className="text-gray-400 mb-6">Create your first board to start organizing tasks</p>
                    <button
                        onClick={() => setShowCreateBoard(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                    >
                        <FaPlus className="w-4 h-4" />
                        Create Board
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {boards.map((board) => (
                        <div
                            key={board._id}
                            className="group relative rounded-2xl overflow-hidden"
                            style={{ backgroundColor: board.background }}
                        >
                            <div className="p-5 min-h-[140px]">
                                <div className="flex items-start justify-between">
                                    <Link
                                        to={`/developer/workspace/${workspaceId}/board/${board._id}`}
                                        className="flex-1"
                                    >
                                        <h3 className="text-lg font-semibold text-white hover:text-blue-300 transition-colors">
                                            {board.title}
                                        </h3>
                                        {board.description && (
                                            <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                                                {board.description}
                                            </p>
                                        )}
                                    </Link>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowBoardMenu(showBoardMenu === board._id ? null : board._id)}
                                            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <FaEllipsisV className="w-4 h-4" />
                                        </button>

                                        {showBoardMenu === board._id && (
                                            <div className="absolute right-0 top-10 w-40 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-10 py-1">
                                                <button
                                                    onClick={() => handleDeleteBoard(board._id)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                    Delete Board
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="absolute bottom-4 left-5 right-5">
                                    <div className="flex items-center justify-between text-sm text-gray-300">
                                        <span>{board.columns?.length || 0} columns</span>
                                        <span>
                                            {board.columns?.reduce((acc, col) => acc + (col.cards?.length || 0), 0) || 0} cards
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={`/developer/workspace/${workspaceId}/board/${board._id}`}
                                className="absolute inset-0"
                                aria-label={`Open ${board.title}`}
                            />
                        </div>
                    ))}

                    {/* Create New Board Card */}
                    <button
                        onClick={() => setShowCreateBoard(true)}
                        className="rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 p-5 min-h-[140px] flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <FaPlus className="w-8 h-8 mb-2" />
                        <span>Create Board</span>
                    </button>
                </div>
            )}

            {/* Collaborators Section */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FaUsers className="w-5 h-5 text-blue-400" />
                        Team Members
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleToggleInvite}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                workspace?.inviteEnabled
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            <FaLink className="w-3 h-3" />
                            {workspace?.inviteEnabled ? 'Invite Active' : 'Enable Invite'}
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Owner */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-medium">
                                {workspace?.owner?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-white font-medium">{workspace?.owner?.name}</p>
                                <p className="text-sm text-gray-400">{workspace?.owner?.email}</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                            Owner
                        </span>
                    </div>

                    {/* Collaborators */}
                    {workspace?.collaborators?.map((collab) => (
                        <div key={collab.user._id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium">
                                    {collab.user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-medium">{collab.user.name}</p>
                                    <p className="text-sm text-gray-400">{collab.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    collab.role === 'admin'
                                        ? 'bg-violet-500/20 text-violet-400'
                                        : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                    {collab.role}
                                </span>
                                <button
                                    onClick={() => handleRemoveCollaborator(collab.user._id)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <FaTrash className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Board Modal */}
            {showCreateBoard && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                    <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Create Board</h2>

                        <form onSubmit={handleCreateBoard} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Board Title
                                </label>
                                <input
                                    type="text"
                                    value={newBoard.title}
                                    onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    placeholder="Project Board"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={newBoard.description}
                                    onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                                    rows="2"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                    placeholder="Board description..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Background Color
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {backgroundColors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNewBoard({ ...newBoard, background: color })}
                                            className={`w-10 h-10 rounded-lg transition-all ${
                                                newBoard.background === color
                                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f0f14]'
                                                    : ''
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateBoard(false)}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                                >
                                    Create Board
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Collaborator Modal */}
            {showAddCollaborator && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                    <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Add Collaborator</h2>

                        <form onSubmit={handleAddCollaborator} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Developer Email
                                </label>
                                <input
                                    type="email"
                                    value={collaboratorEmail}
                                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    placeholder="developer@example.com"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    The developer must have an account to be added.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <p className="text-sm text-blue-300">
                                    Or share the invite link to let developers join directly.
                                </p>
                                {workspace?.inviteEnabled ? (
                                    <button
                                        type="button"
                                        onClick={copyInviteLink}
                                        className="mt-2 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                                    >
                                        {copiedLink ? <FaCheck className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
                                        {copiedLink ? 'Copied!' : 'Copy Invite Link'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleToggleInvite}
                                        className="mt-2 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                                    >
                                        <FaLink className="w-4 h-4" />
                                        Enable Invite Link
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddCollaborator(false)}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                                >
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Click outside to close menus */}
            {showBoardMenu && (
                <div className="fixed inset-0 z-5" onClick={() => setShowBoardMenu(null)} />
            )}
        </div>
    );
}
