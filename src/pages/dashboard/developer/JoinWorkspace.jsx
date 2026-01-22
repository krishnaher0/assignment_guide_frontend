import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTh, FaCheck, FaTimes } from 'react-icons/fa';
import api from '../../../utils/api';

export default function JoinWorkspace() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const [workspace, setWorkspace] = useState(null);

    useEffect(() => {
        joinWorkspace();
    }, [code]);

    const joinWorkspace = async () => {
        try {
            const { data } = await api.post(`/workspaces/join/${code}`);
            setWorkspace(data.workspace);
            setStatus('success');
            setMessage(data.message);

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate(`/developer/workspace/${data.workspace._id}`);
            }, 2000);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to join workspace');
        }
    };

    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
                {status === 'loading' && (
                    <>
                        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-xl font-semibold text-white mb-2">Joining Workspace...</h2>
                        <p className="text-gray-400">Please wait while we add you to the workspace.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                            <FaCheck className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">{message}</h2>
                        {workspace && (
                            <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                                    style={{ backgroundColor: workspace.color }}
                                >
                                    <FaTh className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">{workspace.title}</h3>
                                {workspace.description && (
                                    <p className="text-sm text-gray-400 mt-1">{workspace.description}</p>
                                )}
                            </div>
                        )}
                        <p className="text-gray-400 mt-4">Redirecting to workspace...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                            <FaTimes className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Unable to Join</h2>
                        <p className="text-gray-400 mb-6">{message}</p>
                        <button
                            onClick={() => navigate('/developer/workspace')}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                        >
                            Go to Workspaces
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
