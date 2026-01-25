import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMobileAlt, FaLaptop, FaGlobe, FaTrashAlt, FaHistory } from 'react-icons/fa';

const ActiveSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/sessions', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSessions(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch sessions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const revokeSession = async (sessionId) => {
        if (!window.confirm('Are you sure you want to log out of this device?')) return;

        try {
            await axios.delete(`/api/sessions/${sessionId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSessions(sessions.filter(s => s.sessionId !== sessionId && s._id !== sessionId));
        } catch (err) {
            alert('Failed to revoke session');
        }
    };

    const revokeAllOthers = async () => {
        if (!window.confirm('This will log you out of all other devices. Continue?')) return;

        try {
            await axios.delete('/api/sessions/logout-others', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchSessions();
        } catch (err) {
            alert('Failed to revoke sessions');
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Loading active sessions...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FaHistory className="text-blue-500" /> Active Sessions
                </h3>
                {sessions.length > 1 && (
                    <button
                        onClick={revokeAllOthers}
                        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                        Log out all others
                    </button>
                )}
            </div>

            <div className="divide-y divide-gray-100">
                {sessions.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No active sessions found.</div>
                ) : (
                    sessions.map((session) => (
                        <div key={session._id || session.sessionId} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    {session.deviceInfo?.toLowerCase().includes('mobi') ? <FaMobileAlt size={20} /> : <FaLaptop size={20} />}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 truncate max-w-[200px]">
                                        {session.deviceInfo || 'Unknown Device'}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <FaGlobe className="text-gray-400 text-xs" /> {session.location || 'Unknown'} • {session.ipAddress}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Last active: {new Date(session.lastActivity).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => revokeSession(session.sessionId || session._id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                title="Revoke session"
                            >
                                <FaTrashAlt />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 bg-gray-50 text-center">
                <p className="text-xs text-gray-400">
                    Maximum 5 concurrent sessions allowed. Oldest sessions are auto-revoked.
                </p>
            </div>
        </div>
    );
};

export default ActiveSessions;
