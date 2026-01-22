import { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaWallet, FaBox } from 'react-icons/fa';
import api from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

export default function ClientTaskProgress() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/orders/customer/my-orders');
            setTasks(res.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <FaClock className="w-5 h-5 text-amber-400" />;
            case 'assigned':
                return <FaBox className="w-5 h-5 text-blue-400" />;
            case 'in-progress':
                return <FaClock className="w-5 h-5 text-violet-400" />;
            case 'completed':
            case 'delivered':
                return <FaCheckCircle className="w-5 h-5 text-emerald-400" />;
            default:
                return <FaClock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            assigned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'in-progress': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
            'in-review': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
        return colors[status] || colors.pending;
    };

    const getPaymentColor = (status) => {
        const colors = {
            pending: 'bg-red-500/10 text-red-400 border-red-500/20',
            paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            partial: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
        return colors[status] || colors.pending;
    };

    const getTimelineStatus = (status) => {
        const timeline = [
            { key: 'pending', label: 'Requested', icon: '📝' },
            { key: 'assigned', label: 'Assigned', icon: '👤' },
            { key: 'in-progress', label: 'Working', icon: '⚙️' },
            { key: 'in-review', label: 'Review', icon: '👀' },
            { key: 'completed', label: 'Completed', icon: '✅' },
            { key: 'delivered', label: 'Delivered', icon: '📦' },
        ];

        const currentIndex = timeline.findIndex(t => t.key === status);
        return timeline.map((item, idx) => ({
            ...item,
            completed: idx <= currentIndex,
        }));
    };

    if (loading) {
        return <div className="text-center text-gray-400 py-8">Loading your tasks...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Track Your Tasks</h1>
                <p className="text-gray-400">Monitor progress and manage payments</p>
            </div>

            {/* Tasks List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div
                            key={task._id}
                            onClick={() => setSelectedTask(task)}
                            className={`rounded-2xl border transition-all cursor-pointer ${
                                selectedTask?._id === task._id
                                    ? 'bg-white/[0.05] border-blue-500/50'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className="p-6">
                                {/* Task Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white mb-1">{task.title}</h3>
                                        <p className="text-sm text-gray-500">{task.service}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 whitespace-nowrap ${getStatusColor(task.status)}`}>
                                        {getStatusIcon(task.status)}
                                        {task.status}
                                    </span>
                                </div>

                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-400">Progress</span>
                                        <span className="text-xs font-bold text-white">{task.progress || 0}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                                            style={{ width: `${task.progress || 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Task Details */}
                                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                    <div className="p-3 rounded-lg bg-white/5">
                                        <p className="text-gray-500 text-xs mb-1">Budget</p>
                                        <p className="font-semibold text-white">{task.budget}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/5">
                                        <p className="text-gray-500 text-xs mb-1">Deadline</p>
                                        <p className="font-semibold text-white">
                                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Developer Info */}
                                {task.assignedDeveloper && (
                                    <div className="p-3 rounded-lg bg-white/5 mb-4">
                                        <p className="text-gray-500 text-xs mb-1">Assigned Developer</p>
                                        <p className="font-semibold text-white">
                                            {typeof task.assignedDeveloper === 'object' 
                                                ? task.assignedDeveloper.name 
                                                : 'Developer'}
                                        </p>
                                    </div>
                                )}

                                {/* Payment Status */}
                                <div className={`p-3 rounded-lg border ${getPaymentColor(task.paymentStatus)}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium">Payment Status</span>
                                        <span className="text-sm font-bold capitalize">{task.paymentStatus}</span>
                                    </div>
                                </div>
                                
                                {/* Pay Button - Only show if completed but not paid */}
                                {task.status === 'completed' && task.paymentStatus === 'pending' && (
                                    <button className="w-full mt-4 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors">
                                        Make Payment
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        <p className="mb-4">No tasks submitted yet</p>
                        <a href="/submit-task" className="text-blue-400 hover:text-blue-300 font-semibold">
                            Submit your first task →
                        </a>
                    </div>
                )}
            </div>

            {/* Task Details Panel */}
            {selectedTask && (
                <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-lg font-bold text-white">Task Timeline</h2>
                    </div>

                    <div className="p-6">
                        {/* Timeline */}
                        <div className="space-y-4 mb-6">
                            {getTimelineStatus(selectedTask.status).map((stage, idx, arr) => (
                                <div key={stage.key}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                            stage.completed
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-white/10 text-gray-400'
                                        }`}>
                                            {stage.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-semibold ${stage.completed ? 'text-white' : 'text-gray-500'}`}>
                                                {stage.label}
                                            </p>
                                        </div>
                                    </div>
                                    {idx !== arr.length - 1 && (
                                        <div className={`ml-5 h-8 w-0.5 ${stage.completed ? 'bg-emerald-500' : 'bg-white/10'}`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Task Description */}
                        <div className="mt-6 p-4 rounded-lg bg-white/5">
                            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Description</h3>
                            <p className="text-white text-sm leading-relaxed">{selectedTask.description}</p>
                        </div>

                        {/* Progress Notes */}
                        {selectedTask.progressNotes && selectedTask.progressNotes.length > 0 && (
                            <div className="mt-6 p-4 rounded-lg bg-white/5">
                                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase">Developer Updates</h3>
                                <div className="space-y-3">
                                    {selectedTask.progressNotes.slice().reverse().map((note, idx) => (
                                        <div key={idx} className="p-3 rounded bg-white/5 border border-white/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-medium text-white">{note.developerName}</p>
                                                <span className="text-xs text-gray-500">{note.percentage}% complete</span>
                                            </div>
                                            <p className="text-sm text-gray-400">{note.notes}</p>
                                            <p className="text-xs text-gray-600 mt-2">{new Date(note.updatedAt).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
