import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaPlus, FaPaperPlane, FaSmile, FaPaperclip, FaUsers, FaTimes, FaCog, FaCheck, FaFile, FaImage } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';

export default function AdminMessages() {
    const { user } = useAuth();
    const { socket } = useSocket();

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [usersLoading, setUsersLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchConversations();
        fetchAvailableUsers();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation._id);
            markConversationRead(selectedConversation._id);
        }
    }, [selectedConversation?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data) => {
            console.log('New message received:', data);
            const conversationId = data.conversation?.toString() || data.conversation;
            const selectedId = selectedConversation?._id?.toString() || selectedConversation?._id;
            const senderId = data.message?.sender?._id?.toString() || data.message?.sender?.toString();
            const currentUserId = user?._id?.toString() || user?._id;

            // Skip if current user is the sender (already added via API response)
            if (senderId === currentUserId) {
                return;
            }

            if (selectedConversation && conversationId === selectedId) {
                setMessages(prev => [...prev, data.message]);
                markConversationRead(conversationId);
            }
            fetchConversations();
        };

        const handleMessageUpdated = (data) => {
            setMessages(prev => prev.map(m => m._id === data.message._id ? data.message : m));
        };

        const handleMessageDeleted = (data) => {
            setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, isDeleted: true, content: 'Message deleted' } : m));
        };

        socket.on('new_message', handleNewMessage);
        socket.on('message_updated', handleMessageUpdated);
        socket.on('message_deleted', handleMessageDeleted);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('message_updated', handleMessageUpdated);
            socket.off('message_deleted', handleMessageDeleted);
        };
    }, [socket, selectedConversation, user]);

    const updateConversationLastMessage = (convId, message) => {
        const targetId = convId?.toString() || convId;
        const selectedId = selectedConversation?._id?.toString() || selectedConversation?._id;
        setConversations(prev => prev.map(c => {
            const cId = c._id?.toString() || c._id;
            if (cId === targetId) {
                return {
                    ...c,
                    lastMessage: {
                        content: message.content,
                        sender: message.sender,
                        timestamp: message.createdAt,
                        type: message.type
                    },
                    unreadCount: selectedId === targetId ? 0 : (c.unreadCount || 0) + 1
                };
            }
            return c;
        }));
    };

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/messages/conversations');
            setConversations(data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            setMessagesLoading(true);
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
            setUsersLoading(true);
            const { data } = await api.get('/messages/users');
            setAvailableUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setUsersLoading(false);
        }
    };

    const markConversationRead = async (conversationId) => {
        try {
            await api.put(`/messages/conversations/${conversationId}/read`);
            setConversations(prev => prev.map(c =>
                c._id === conversationId ? { ...c, unreadCount: 0 } : c
            ));
        } catch (error) {
            console.error('Error marking conversation as read:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || sending) return;

        setSending(true);
        try {
            const { data } = await api.post(`/messages/conversations/${selectedConversation._id}/messages`, {
                content: newMessage.trim(),
                type: 'text'
            });
            setMessages(prev => [...prev, data]);
            setNewMessage('');
            messageInputRef.current?.focus();
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
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (mimeType) => {
        if (mimeType?.startsWith('image/')) return <FaImage className="text-green-400" />;
        return <FaFile className="text-blue-400" />;
    };

    const startDirectChat = async (userId) => {
        try {
            const { data } = await api.post('/messages/conversations/direct', { userId });
            setConversations(prev => {
                const exists = prev.find(c => c._id === data._id);
                if (exists) return prev;
                return [data, ...prev];
            });
            setSelectedConversation(data);
            setShowNewChatModal(false);
        } catch (error) {
            console.error('Error starting direct chat:', error);
        }
    };

    const createGroup = async () => {
        if (!groupName.trim() || selectedUsers.length < 1) return;

        try {
            const { data } = await api.post('/messages/conversations/group', {
                name: groupName.trim(),
                participantIds: selectedUsers
            });
            setConversations(prev => [data, ...prev]);
            setSelectedConversation(data);
            setShowCreateGroupModal(false);
            setGroupName('');
            setSelectedUsers([]);
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const getConversationName = (conversation) => {
        if (conversation.type === 'group') {
            return conversation.name;
        }
        const otherParticipant = conversation.participants?.find(p => p.user?._id !== user?._id);
        return otherParticipant?.user?.name || 'Unknown User';
    };

    const getConversationAvatar = (conversation) => {
        if (conversation.type === 'group') {
            return (
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <FaUsers className="text-white" />
                </div>
            );
        }
        const otherParticipant = conversation.participants?.find(p => p.user?._id !== user?._id);
        const name = otherParticipant?.user?.name || 'U';
        return (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                {name.charAt(0).toUpperCase()}
            </div>
        );
    };

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;

        if (diff < 86400000 && d.getDate() === now.getDate()) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        if (diff < 604800000) {
            return d.toLocaleDateString([], { weekday: 'short' });
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const filteredConversations = conversations.filter(conv => {
        const name = getConversationName(conv).toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    const filteredUsers = availableUsers.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-120px)] flex bg-[#0a0a0f] rounded-2xl overflow-hidden border border-white/10">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r border-white/10 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Messages</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowCreateGroupModal(true)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                title="Create Group"
                            >
                                <FaUsers className="text-gray-400" />
                            </button>
                            <button
                                onClick={() => setShowNewChatModal(true)}
                                className="p-2 bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg transition-colors"
                                title="New Chat"
                            >
                                <FaPlus className="text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FaUsers className="mx-auto text-4xl mb-2 opacity-50" />
                            <p>No conversations yet</p>
                            <p className="text-sm">Start a new chat!</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <div
                                key={conv._id}
                                onClick={() => setSelectedConversation(conv)}
                                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                                    selectedConversation?._id === conv._id
                                        ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 border-l-2 border-blue-500'
                                        : 'hover:bg-white/5'
                                }`}
                            >
                                {getConversationAvatar(conv)}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-white truncate">
                                            {getConversationName(conv)}
                                        </h3>
                                        <span className="text-xs text-gray-500">
                                            {formatTime(conv.lastMessage?.timestamp)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-sm text-gray-400 truncate">
                                            {conv.lastMessage?.content || 'No messages yet'}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {getConversationAvatar(selectedConversation)}
                                <div>
                                    <h3 className="font-semibold text-white">
                                        {getConversationName(selectedConversation)}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {selectedConversation.type === 'group'
                                            ? `${selectedConversation.participants?.length || 0} members`
                                            : 'Direct message'}
                                    </p>
                                </div>
                            </div>
                            {selectedConversation.type === 'group' && (
                                <button
                                    onClick={() => setShowGroupInfoModal(true)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <FaCog className="text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messagesLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <FaPaperPlane className="text-4xl mb-2 opacity-50" />
                                    <p>No messages yet</p>
                                    <p className="text-sm">Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((message, index) => {
                                    const isOwn = message.sender?._id === user?._id;
                                    const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender?._id !== message.sender?._id);

                                    return (
                                        <div
                                            key={message._id}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                                                {!isOwn && showAvatar && (
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                                        {message.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                {!isOwn && !showAvatar && <div className="w-8" />}
                                                <div>
                                                    {showAvatar && !isOwn && (
                                                        <p className="text-xs text-gray-500 mb-1 ml-1">
                                                            {message.sender?.name}
                                                        </p>
                                                    )}
                                                    <div
                                                        className={`px-4 py-2.5 rounded-2xl ${
                                                            message.isDeleted
                                                                ? 'bg-white/5 text-gray-500 italic'
                                                                : isOwn
                                                                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                                                                    : 'bg-white/10 text-white'
                                                        }`}
                                                    >
                                                        {message.isDeleted ? (
                                                            <p className="text-sm italic">Message deleted</p>
                                                        ) : (
                                                            <>
                                                                {message.content && (
                                                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                                )}
                                                                {message.attachments?.map((att, idx) => (
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
                                                                                    <span className="text-xs text-gray-400">{formatFileSize(att.fileSize)}</span>
                                                                                </div>
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                                                        <span className="text-xs text-gray-500">
                                                            {formatTime(message.createdAt)}
                                                        </span>
                                                        {message.isEdited && (
                                                            <span className="text-xs text-gray-500">(edited)</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <FaPaperclip className="text-gray-400" />
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
                                    ref={messageInputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                                />
                                <button
                                    type="button"
                                    className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <FaSmile className="text-gray-400" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="p-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaPaperPlane className="text-white" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-full flex items-center justify-center mb-4">
                            <FaUsers className="text-4xl text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Admin Messages</h3>
                        <p className="text-center max-w-sm">
                            Select a conversation or start a new chat with developers and team members.
                        </p>
                        <button
                            onClick={() => setShowNewChatModal(true)}
                            className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                        >
                            Start New Chat
                        </button>
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">New Chat</h3>
                            <button
                                onClick={() => setShowNewChatModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="relative mb-4">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                                />
                            </div>

                            <div className="max-h-80 overflow-y-auto space-y-2">
                                {usersLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <p className="text-center py-8 text-gray-500">No users found</p>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <button
                                            key={u._id}
                                            onClick={() => startDirectChat(u._id)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-white">{u.name}</p>
                                                <p className="text-sm text-gray-400">{u.email}</p>
                                            </div>
                                            <span className={`ml-auto px-2 py-0.5 rounded text-xs ${
                                                u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                                u.role === 'developer' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Group Modal */}
            {showCreateGroupModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Create Group</h3>
                            <button
                                onClick={() => {
                                    setShowCreateGroupModal(false);
                                    setGroupName('');
                                    setSelectedUsers([]);
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4">
                            <input
                                type="text"
                                placeholder="Group name"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 mb-4"
                            />

                            {selectedUsers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedUsers.map(userId => {
                                        const u = availableUsers.find(user => user._id === userId);
                                        return u ? (
                                            <span
                                                key={userId}
                                                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-2"
                                            >
                                                {u.name}
                                                <button
                                                    onClick={() => toggleUserSelection(userId)}
                                                    className="hover:text-blue-300"
                                                >
                                                    <FaTimes className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            )}

                            <p className="text-sm text-gray-400 mb-2">Select members:</p>
                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {availableUsers.map((u) => (
                                    <button
                                        key={u._id}
                                        onClick={() => toggleUserSelection(u._id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                            selectedUsers.includes(u._id)
                                                ? 'bg-blue-500/20 border border-blue-500/30'
                                                : 'hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-medium text-white">{u.name}</p>
                                            <p className="text-sm text-gray-400">{u.role}</p>
                                        </div>
                                        {selectedUsers.includes(u._id) && (
                                            <FaCheck className="text-blue-400" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={createGroup}
                                disabled={!groupName.trim() || selectedUsers.length < 1}
                                className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Group Info Modal */}
            {showGroupInfoModal && selectedConversation?.type === 'group' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Group Info</h3>
                            <button
                                onClick={() => setShowGroupInfoModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <FaUsers className="text-white text-2xl" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold text-white">
                                        {selectedConversation.name}
                                    </h4>
                                    <p className="text-gray-400">
                                        {selectedConversation.participants?.length || 0} members
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 mb-2">Members:</p>
                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {selectedConversation.participants?.map((p) => (
                                    <div
                                        key={p.user?._id}
                                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                                            {p.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-white">
                                                {p.user?.name}
                                                {p.user?._id === user?._id && ' (You)'}
                                            </p>
                                            <p className="text-sm text-gray-400">{p.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
