import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaPlus, FaArrowLeft, FaTimes, FaEllipsisV, FaTrash, FaEdit, FaCalendar, FaUser, FaCheck, FaComment } from 'react-icons/fa';
import api from '../../../utils/api';

export default function BoardView() {
    const { workspaceId, boardId } = useParams();
    const [board, setBoard] = useState(null);
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [addingCardTo, setAddingCardTo] = useState(null);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [selectedCard, setSelectedCard] = useState(null);
    const [editingColumn, setEditingColumn] = useState(null);
    const [columnMenu, setColumnMenu] = useState(null);

    // Drag state
    const [draggedCard, setDraggedCard] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    useEffect(() => {
        fetchBoard();
        fetchWorkspace();
    }, [workspaceId, boardId]);

    const fetchBoard = async () => {
        try {
            const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}`);
            setBoard(data);
        } catch (error) {
            console.error('Error fetching board:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkspace = async () => {
        try {
            const { data } = await api.get(`/workspaces/${workspaceId}`);
            setWorkspace(data);
        } catch (error) {
            console.error('Error fetching workspace:', error);
        }
    };

    const handleAddColumn = async (e) => {
        e.preventDefault();
        if (!newColumnTitle.trim()) return;

        try {
            const { data } = await api.post(`/workspaces/${workspaceId}/boards/${boardId}/columns`, {
                title: newColumnTitle.trim()
            });
            setBoard(data);
            setNewColumnTitle('');
            setShowAddColumn(false);
        } catch (error) {
            console.error('Error adding column:', error);
        }
    };

    const handleUpdateColumn = async (columnId, title) => {
        try {
            const { data } = await api.put(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`, { title });
            setBoard(data);
            setEditingColumn(null);
        } catch (error) {
            console.error('Error updating column:', error);
        }
    };

    const handleDeleteColumn = async (columnId) => {
        if (!confirm('Delete this column and all its cards?')) return;
        try {
            const { data } = await api.delete(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`);
            setBoard(data);
            setColumnMenu(null);
        } catch (error) {
            console.error('Error deleting column:', error);
        }
    };

    const handleAddCard = async (e, columnId) => {
        e.preventDefault();
        if (!newCardTitle.trim()) return;

        try {
            const { data } = await api.post(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards`, {
                title: newCardTitle.trim()
            });
            setBoard(data);
            setNewCardTitle('');
            setAddingCardTo(null);
        } catch (error) {
            console.error('Error adding card:', error);
        }
    };

    const handleUpdateCard = async (columnId, cardId, updates) => {
        try {
            const { data } = await api.put(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}`, updates);
            setBoard(data);
            if (selectedCard) {
                const col = data.columns.find(c => c._id === columnId);
                const card = col?.cards.find(c => c._id === cardId);
                setSelectedCard({ ...card, columnId });
            }
        } catch (error) {
            console.error('Error updating card:', error);
        }
    };

    const handleDeleteCard = async (columnId, cardId) => {
        try {
            const { data } = await api.delete(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}`);
            setBoard(data);
            setSelectedCard(null);
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    };

    const handleMoveCard = async (cardId, sourceColumnId, destColumnId, newPosition) => {
        try {
            const { data } = await api.put(`/workspaces/${workspaceId}/boards/${boardId}/cards/move`, {
                cardId,
                sourceColumnId,
                destColumnId,
                newPosition
            });
            setBoard(data);
        } catch (error) {
            console.error('Error moving card:', error);
        }
    };

    // Drag handlers
    const handleDragStart = (e, card, columnId) => {
        setDraggedCard({ ...card, sourceColumnId: columnId });
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedCard(null);
        setDragOverColumn(null);
        setDragOverIndex(null);
    };

    const handleDragOver = (e, columnId, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnId);
        setDragOverIndex(index);
    };

    const handleDrop = (e, destColumnId, dropIndex) => {
        e.preventDefault();
        if (!draggedCard) return;

        const sourceColumnId = draggedCard.sourceColumnId;
        const cardId = draggedCard._id;

        // Calculate actual position
        let newPosition = dropIndex;
        if (sourceColumnId === destColumnId && draggedCard.position < dropIndex) {
            newPosition = dropIndex - 1;
        }

        handleMoveCard(cardId, sourceColumnId, destColumnId, newPosition);
        setDraggedCard(null);
        setDragOverColumn(null);
        setDragOverIndex(null);
    };

    const handleAddComment = async (columnId, cardId, text) => {
        try {
            const { data } = await api.post(`/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}/comments`, { text });
            setBoard(data);
            const col = data.columns.find(c => c._id === columnId);
            const card = col?.cards.find(c => c._id === cardId);
            setSelectedCard({ ...card, columnId });
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading board...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <Link
                    to={`/developer/workspace/${workspaceId}`}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <FaArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-white">{board?.title}</h1>
                    <p className="text-sm text-gray-400">{workspace?.title}</p>
                </div>
            </div>

            {/* Board Container */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 h-full min-w-max">
                    {/* Columns */}
                    {board?.columns?.map((column) => (
                        <div
                            key={column._id}
                            className={`w-72 flex-shrink-0 bg-white/[0.03] rounded-xl flex flex-col max-h-full ${
                                dragOverColumn === column._id ? 'ring-2 ring-blue-500/50' : ''
                            }`}
                            onDragOver={(e) => handleDragOver(e, column._id, column.cards?.length || 0)}
                            onDrop={(e) => handleDrop(e, column._id, column.cards?.length || 0)}
                        >
                            {/* Column Header */}
                            <div className="p-3 flex items-center justify-between border-b border-white/5">
                                {editingColumn === column._id ? (
                                    <input
                                        type="text"
                                        defaultValue={column.title}
                                        autoFocus
                                        onBlur={(e) => handleUpdateColumn(column._id, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleUpdateColumn(column._id, e.target.value);
                                            if (e.key === 'Escape') setEditingColumn(null);
                                        }}
                                        className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                ) : (
                                    <h3
                                        className="text-sm font-semibold text-white cursor-pointer"
                                        onClick={() => setEditingColumn(column._id)}
                                    >
                                        {column.title}
                                        <span className="ml-2 text-gray-500">({column.cards?.length || 0})</span>
                                    </h3>
                                )}
                                <div className="relative">
                                    <button
                                        onClick={() => setColumnMenu(columnMenu === column._id ? null : column._id)}
                                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                                    >
                                        <FaEllipsisV className="w-3 h-3" />
                                    </button>
                                    {columnMenu === column._id && (
                                        <div className="absolute right-0 top-8 w-36 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-10 py-1">
                                            <button
                                                onClick={() => {
                                                    setEditingColumn(column._id);
                                                    setColumnMenu(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
                                            >
                                                <FaEdit className="w-3 h-3" />
                                                Rename
                                            </button>
                                            <button
                                                onClick={() => handleDeleteColumn(column._id)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                                            >
                                                <FaTrash className="w-3 h-3" />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cards */}
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {column.cards?.map((card, index) => (
                                    <div
                                        key={card._id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, card, column._id)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => handleDragOver(e, column._id, index)}
                                        onDrop={(e) => handleDrop(e, column._id, index)}
                                        onClick={() => setSelectedCard({ ...card, columnId: column._id })}
                                        className={`p-3 bg-white/[0.03] hover:bg-white/[0.05] rounded-lg cursor-pointer transition-all ${
                                            dragOverColumn === column._id && dragOverIndex === index
                                                ? 'border-t-2 border-blue-500'
                                                : ''
                                        } ${card.isCompleted ? 'opacity-60' : ''}`}
                                    >
                                        {/* Labels */}
                                        {card.labels?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {card.labels.map((label, i) => (
                                                    <span
                                                        key={i}
                                                        className="w-8 h-1.5 rounded-full"
                                                        style={{ backgroundColor: label.color }}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <p className={`text-sm text-white ${card.isCompleted ? 'line-through' : ''}`}>
                                            {card.title}
                                        </p>

                                        {/* Card Meta */}
                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                            {card.dueDate && (
                                                <span className={`flex items-center gap-1 ${
                                                    new Date(card.dueDate) < new Date() && !card.isCompleted
                                                        ? 'text-red-400'
                                                        : ''
                                                }`}>
                                                    <FaCalendar className="w-3 h-3" />
                                                    {new Date(card.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                            {card.comments?.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <FaComment className="w-3 h-3" />
                                                    {card.comments.length}
                                                </span>
                                            )}
                                            {card.checklist?.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <FaCheck className="w-3 h-3" />
                                                    {card.checklist.filter(c => c.isCompleted).length}/{card.checklist.length}
                                                </span>
                                            )}
                                        </div>

                                        {/* Assignees */}
                                        {card.assignees?.length > 0 && (
                                            <div className="flex -space-x-1 mt-2">
                                                {card.assignees.slice(0, 3).map((user) => (
                                                    <div
                                                        key={user._id}
                                                        className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[10px] text-white font-medium border border-[#0f0f14]"
                                                        title={user.name}
                                                    >
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add Card Form */}
                                {addingCardTo === column._id ? (
                                    <form onSubmit={(e) => handleAddCard(e, column._id)} className="p-2">
                                        <textarea
                                            value={newCardTitle}
                                            onChange={(e) => setNewCardTitle(e.target.value)}
                                            autoFocus
                                            rows="2"
                                            placeholder="Enter card title..."
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                type="submit"
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                            >
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddingCardTo(null);
                                                    setNewCardTitle('');
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-white"
                                            >
                                                <FaTimes className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => setAddingCardTo(column._id)}
                                        className="w-full p-2 text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <FaPlus className="w-3 h-3" />
                                        Add card
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add Column */}
                    <div className="w-72 flex-shrink-0">
                        {showAddColumn ? (
                            <form onSubmit={handleAddColumn} className="bg-white/[0.03] rounded-xl p-3">
                                <input
                                    type="text"
                                    value={newColumnTitle}
                                    onChange={(e) => setNewColumnTitle(e.target.value)}
                                    autoFocus
                                    placeholder="Column title..."
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="submit"
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                    >
                                        Add Column
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddColumn(false);
                                            setNewColumnTitle('');
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-white"
                                    >
                                        <FaTimes className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowAddColumn(true)}
                                className="w-full p-3 bg-white/[0.03] hover:bg-white/[0.05] rounded-xl text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <FaPlus className="w-4 h-4" />
                                Add Column
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Card Detail Modal */}
            {selectedCard && (
                <CardDetailModal
                    card={selectedCard}
                    workspace={workspace}
                    onClose={() => setSelectedCard(null)}
                    onUpdate={(updates) => handleUpdateCard(selectedCard.columnId, selectedCard._id, updates)}
                    onDelete={() => handleDeleteCard(selectedCard.columnId, selectedCard._id)}
                    onAddComment={(text) => handleAddComment(selectedCard.columnId, selectedCard._id, text)}
                />
            )}

            {/* Click outside to close menus */}
            {columnMenu && (
                <div className="fixed inset-0 z-5" onClick={() => setColumnMenu(null)} />
            )}
        </div>
    );
}

// Card Detail Modal Component
function CardDetailModal({ card, workspace, onClose, onUpdate, onDelete, onAddComment }) {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || '');
    const [newComment, setNewComment] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dueDate, setDueDate] = useState(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
    const [startDate, setStartDate] = useState(card.startDate ? new Date(card.startDate).toISOString().split('T')[0] : '');

    const handleSave = () => {
        onUpdate({
            title,
            description,
            startDate: startDate || null,
            dueDate: dueDate || null,
        });
    };

    const handleToggleComplete = () => {
        onUpdate({ isCompleted: !card.isCompleted });
    };

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onAddComment(newComment.trim());
        setNewComment('');
    };

    const labelColors = [
        { name: 'Red', color: '#ef4444' },
        { name: 'Orange', color: '#f97316' },
        { name: 'Yellow', color: '#eab308' },
        { name: 'Green', color: '#22c55e' },
        { name: 'Blue', color: '#3b82f6' },
        { name: 'Purple', color: '#8b5cf6' },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center px-4 py-8 overflow-y-auto">
            <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-full max-w-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleSave}
                                className="w-full text-xl font-semibold text-white bg-transparent border-none focus:outline-none focus:ring-0"
                            />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleToggleComplete}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                card.isCompleted
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            <FaCheck className="w-4 h-4" />
                            {card.isCompleted ? 'Completed' : 'Mark Complete'}
                        </button>
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm transition-colors"
                        >
                            <FaCalendar className="w-4 h-4" />
                            Due Date
                        </button>
                    </div>

                    {/* Date Picker */}
                    {showDatePicker && (
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        onBlur={handleSave}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        onBlur={handleSave}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Labels */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Labels</h4>
                        <div className="flex flex-wrap gap-2">
                            {labelColors.map((label) => {
                                const isSelected = card.labels?.some(l => l.color === label.color);
                                return (
                                    <button
                                        key={label.color}
                                        onClick={() => {
                                            const newLabels = isSelected
                                                ? card.labels.filter(l => l.color !== label.color)
                                                : [...(card.labels || []), label];
                                            onUpdate({ labels: newLabels });
                                        }}
                                        className={`w-12 h-6 rounded transition-all ${
                                            isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f0f14]' : ''
                                        }`}
                                        style={{ backgroundColor: label.color }}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Assignees */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Assignees</h4>
                        <div className="flex flex-wrap gap-2">
                            {/* Show workspace members */}
                            {[workspace?.owner, ...(workspace?.collaborators?.map(c => c.user) || [])].filter(Boolean).map((user) => {
                                const isAssigned = card.assignees?.some(a => a._id === user._id);
                                return (
                                    <button
                                        key={user._id}
                                        onClick={() => {
                                            const newAssignees = isAssigned
                                                ? card.assignees.filter(a => a._id !== user._id)
                                                : [...(card.assignees || []), user];
                                            onUpdate({ assignees: newAssignees.map(a => a._id) });
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                            isAssigned
                                                ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs text-white font-medium">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        {user.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={handleSave}
                            rows="4"
                            placeholder="Add a description..."
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* Comments */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Comments</h4>

                        {/* Add Comment */}
                        <form onSubmit={handleSubmitComment} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-colors"
                            >
                                Post
                            </button>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {card.comments?.map((comment) => (
                                <div key={comment._id} className="flex gap-3 p-3 bg-white/[0.02] rounded-xl">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                                        {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-white">
                                                {comment.user?.name || 'Unknown'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                            {(!card.comments || card.comments.length === 0) && (
                                <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex justify-between">
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                        <FaTrash className="w-4 h-4" />
                        Delete Card
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
