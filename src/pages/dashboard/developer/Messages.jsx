import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../utils/api';
import {
    FaSearch,
    FaPlus,
    FaPaperPlane,
    FaPaperclip,
    FaUsers,
    FaEllipsisV,
    FaTimes,
    FaSmile,
    FaCode,
    FaImage,
    FaFile,
    FaUserPlus,
    FaSignOutAlt,
    FaEdit,
    FaTrash,
    FaReply,
} from 'react-icons/fa';

export default function DeveloperMessages() {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [showNewGroupModal, setShowNewGroupModal] = useState(false);
    const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);

    // New group form
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        fetchAvailableUsers();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation._id);
            markAsRead(selectedConversation._id);
        }
    }, [selectedConversation?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Socket listener for new messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data) => {
            console.log('New message received:', data);
            // Compare as strings to handle ObjectId vs string mismatch
            const conversationId = data.conversation?.toString() || data.conversation;
            const selectedId = selectedConversation?._id?.toString() || selectedConversation?._id;
            const senderId = data.message?.sender?._id?.toString() || data.message?.sender?.toString();
            const currentUserId = user?._id?.toString() || user?._id;

            // Skip if current user is the sender (already added via API response)
            if (senderId === currentUserId) {
                fetchConversations(); // Still update conversation list
                return;
            }

            if (conversationId === selectedId) {
                setMessages(prev => [...prev, data.message]);
                markAsRead(conversationId);
            }
            // Update conversation list
            fetchConversations();
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, selectedConversation, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/messages/conversations');
            setConversations(data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        setMessagesLoading(true);
        try {
            const { data } = await api.get(`/messages/conversations/${conversationId}/messages`);
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setMessagesLoading(false);
        }
    };

    const fetchAvailableUsers = async () => {
        try {
            const { data } = await api.get('/messages/users');
            setAvailableUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const markAsRead = async (conversationId) => {
        try {
            await api.put(`/messages/conversations/${conversationId}/read`);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || sending) return;

        setSending(true);
        try {
            const { data } = await api.post(`/messages/conversations/${selectedConversation._id}/messages`, {
                content: newMessage.trim(),
                type: 'text',
            });
            setMessages(prev => [...prev, data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !selectedConversation) return;

        setSending(true);
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
            if (newMessage.trim()) {
                formData.append('content', newMessage.trim());
            }

            const { data } = await api.post(
                `/messages/conversations/${selectedConversation._id}/messages/upload`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setMessages(prev => [...prev, data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setSending(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (mimeType) => {
        if (mimeType?.startsWith('image/')) return <FaImage className="text-green-400" />;
        return <FaFile className="text-blue-400" />;
    };

    const handleStartDirectChat = async (userId) => {
        try {
            const { data } = await api.post('/messages/conversations/direct', { userId });
            setSelectedConversation(data);
            setShowNewChatModal(false);
            fetchConversations();
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;

        try {
            const { data } = await api.post('/messages/conversations/group', {
                name: newGroupName.trim(),
                description: newGroupDesc.trim(),
                participantIds: selectedMembers,
            });
            setSelectedConversation(data);
            setShowNewGroupModal(false);
            setNewGroupName('');
            setNewGroupDesc('');
            setSelectedMembers([]);
            fetchConversations();
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const handleLeaveGroup = async () => {
        if (!selectedConversation || !window.confirm('Are you sure you want to leave this group?')) return;

        try {
            await api.delete(`/messages/conversations/${selectedConversation._id}/members/${user._id}`);
            setSelectedConversation(null);
            setShowGroupInfoModal(false);
            fetchConversations();
        } catch (error) {
            console.error('Error leaving group:', error);
        }
    };

    const getConversationName = (conv) => {
        if (conv.type === 'group') return conv.name;
        const otherParticipant = conv.participants?.find(p => p.user?._id !== user?._id);
        return otherParticipant?.user?.name || 'Unknown';
    };

    const getConversationAvatar = (conv) => {
        if (conv.type === 'group') {
            return conv.name?.charAt(0).toUpperCase();
        }
        const otherParticipant = conv.participants?.find(p => p.user?._id !== user?._id);
        return otherParticipant?.user?.name?.charAt(0).toUpperCase() || '?';
    };

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return d.toLocaleDateString([], { weekday: 'short' });
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const filteredConversations = conversations.filter(conv => {
        const name = getConversationName(conv).toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-[#0a0a0f] rounded-2xl overflow-hidden border border-zinc-800/50">
            {/* Sidebar - Conversation List */}
            <div className="w-80 border-r border-zinc-800/50 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-zinc-800/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Messages</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowNewGroupModal(true)}
                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                title="Create Group"
                            >
                                <FaUsers className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setShowNewChatModal(true)}
                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                title="New Chat"
                            >
                                <FaPlus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-4 text-center text-zinc-500">
                            <p>No conversations yet</p>
                            <button
                                onClick={() => setShowNewChatModal(true)}
                                className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                            >
                                Start a new chat
                            </button>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <button
                                key={conv._id}
                                onClick={() => setSelectedConversation(conv)}
                                className={`w-full p-4 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors ${
                                    selectedConversation?._id === conv._id ? 'bg-zinc-800/50' : ''
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                                    conv.type === 'group' ? 'bg-violet-600' : 'bg-blue-600'
                                }`}>
                                    {getConversationAvatar(conv)}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-white truncate">
                                            {getConversationName(conv)}
                                        </p>
                                        {conv.lastMessage?.timestamp && (
                                            <span className="text-xs text-zinc-500">
                                                {formatTime(conv.lastMessage.timestamp)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-zinc-500 truncate">
                                            {conv.lastMessage?.content || 'No messages yet'}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                    selectedConversation.type === 'group' ? 'bg-violet-600' : 'bg-blue-600'
                                }`}>
                                    {getConversationAvatar(selectedConversation)}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{getConversationName(selectedConversation)}</p>
                                    <p className="text-xs text-zinc-500">
                                        {selectedConversation.type === 'group'
                                            ? `${selectedConversation.participants?.length} members`
                                            : 'Direct message'}
                                    </p>
                                </div>
                            </div>
                            {selectedConversation.type === 'group' && (
                                <button
                                    onClick={() => setShowGroupInfoModal(true)}
                                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    <FaEllipsisV className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messagesLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-zinc-500">
                                    <p>No messages yet. Say hello!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isOwn = msg.sender?._id === user?._id;
                                    const isSystem = msg.type === 'system';

                                    if (isSystem) {
                                        return (
                                            <div key={msg._id} className="flex justify-center">
                                                <p className="text-xs text-zinc-500 bg-zinc-800/50 px-3 py-1 rounded-full">
                                                    {msg.content}
                                                </p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={msg._id}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                                {!isOwn && selectedConversation.type === 'group' && (
                                                    <p className="text-xs text-zinc-500 mb-1 ml-1">
                                                        {msg.sender?.name}
                                                    </p>
                                                )}
                                                <div
                                                    className={`px-4 py-2 rounded-2xl ${
                                                        isOwn
                                                            ? 'bg-blue-600 text-white rounded-br-md'
                                                            : 'bg-zinc-800 text-white rounded-bl-md'
                                                    }`}
                                                >
                                                    {msg.isDeleted ? (
                                                        <p className="italic text-zinc-400">Message deleted</p>
                                                    ) : (
                                                        <>
                                                            {msg.content && (
                                                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                            )}
                                                            {msg.attachments?.map((att, idx) => (
                                                                <div key={idx} className="mt-2">
                                                                    {att.fileType?.startsWith('image/') ? (
                                                                        <a
                                                                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${att.fileUrl}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            <img
                                                                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${att.fileUrl}`}
                                                                                alt={att.fileName}
                                                                                className="max-w-[300px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90"
                                                                            />
                                                                        </a>
                                                                    ) : (
                                                                        <a
                                                                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${att.fileUrl}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            download={att.fileName}
                                                                            className="flex items-center gap-2 p-2 bg-black/20 rounded-lg hover:bg-black/30"
                                                                        >
                                                                            {getFileIcon(att.fileType)}
                                                                            <div className="flex-1 min-w-0">
                                                                                <span className="text-sm truncate block">{att.fileName}</span>
                                                                                <span className="text-xs text-zinc-400">{formatFileSize(att.fileSize)}</span>
                                                                            </div>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </>
                                                    )}
                                                </div>
                                                <p className={`text-xs text-zinc-600 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                                                    {formatTime(msg.createdAt)}
                                                    {msg.isEdited && ' (edited)'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    <FaPaperclip className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    onChange={handleFileUpload}
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt,.csv,.json,.mp4,.webm,.mp3,.wav"
                                />
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                                >
                                    <FaPaperPlane className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                                <FaUsers className="w-8 h-8 text-zinc-600" />
                            </div>
                            <p className="text-zinc-400 mb-2">Select a conversation</p>
                            <p className="text-zinc-600 text-sm">Or start a new one</p>
                        </div>
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-zinc-700/50 max-h-[80vh] overflow-hidden">
                        <div className="p-4 border-b border-zinc-700/50 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">New Conversation</h3>
                            <button
                                onClick={() => setShowNewChatModal(false)}
                                className="p-2 text-zinc-400 hover:text-white"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-96">
                            {availableUsers.length === 0 ? (
                                <p className="text-center text-zinc-500 py-8">No users available</p>
                            ) : (
                                <div className="space-y-2">
                                    {availableUsers.map((u) => (
                                        <button
                                            key={u._id}
                                            onClick={() => handleStartDirectChat(u._id)}
                                            className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                                {u.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-white">{u.name}</p>
                                                <p className="text-sm text-zinc-500">{u.role}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* New Group Modal */}
            {showNewGroupModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-zinc-700/50 max-h-[80vh] overflow-hidden">
                        <div className="p-4 border-b border-zinc-700/50 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Create Group</h3>
                            <button
                                onClick={() => {
                                    setShowNewGroupModal(false);
                                    setNewGroupName('');
                                    setNewGroupDesc('');
                                    setSelectedMembers([]);
                                }}
                                className="p-2 text-zinc-400 hover:text-white"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Group Name *</label>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="e.g., Project Alpha Team"
                                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                                <textarea
                                    value={newGroupDesc}
                                    onChange={(e) => setNewGroupDesc(e.target.value)}
                                    placeholder="What's this group about?"
                                    rows={2}
                                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Add Members ({selectedMembers.length} selected)
                                </label>
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {availableUsers.map((u) => (
                                        <label
                                            key={u._id}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(u._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedMembers([...selectedMembers, u._id]);
                                                    } else {
                                                        setSelectedMembers(selectedMembers.filter(id => id !== u._id));
                                                    }
                                                }}
                                                className="w-4 h-4 rounded border-zinc-600 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                                {u.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <span className="text-white">{u.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-700/50 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowNewGroupModal(false);
                                    setNewGroupName('');
                                    setNewGroupDesc('');
                                    setSelectedMembers([]);
                                }}
                                className="px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                disabled={!newGroupName.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Group Info Modal */}
            {showGroupInfoModal && selectedConversation?.type === 'group' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-zinc-700/50 max-h-[80vh] overflow-hidden">
                        <div className="p-4 border-b border-zinc-700/50 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Group Info</h3>
                            <button
                                onClick={() => setShowGroupInfoModal(false)}
                                className="p-2 text-zinc-400 hover:text-white"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 mx-auto rounded-full bg-violet-600 flex items-center justify-center text-white text-2xl font-semibold">
                                    {selectedConversation.name?.charAt(0).toUpperCase()}
                                </div>
                                <h4 className="text-xl font-semibold text-white mt-3">{selectedConversation.name}</h4>
                                {selectedConversation.description && (
                                    <p className="text-zinc-500 text-sm mt-1">{selectedConversation.description}</p>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-medium text-zinc-400 mb-3">
                                    Members ({selectedConversation.participants?.length})
                                </p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {selectedConversation.participants?.map((p) => (
                                        <div key={p.user?._id} className="flex items-center gap-3 p-2 rounded-lg">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                                {p.user?.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white text-sm">{p.user?.name}</p>
                                            </div>
                                            {p.role === 'admin' && (
                                                <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">Admin</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-700/50">
                            <button
                                onClick={handleLeaveGroup}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
                            >
                                <FaSignOutAlt className="w-4 h-4" />
                                Leave Group
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
