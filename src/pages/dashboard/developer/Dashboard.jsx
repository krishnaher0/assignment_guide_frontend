import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

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
    standard: { label: 'Standard', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

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

export default function DeveloperDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeTasks: 0,
        completedTasks: 0,
        urgentDeadlines: 0
    });
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [statsRes, tasksRes] = await Promise.all([
                api.get('/developer/stats'),
                api.get('/developer/tasks')
            ]);
            setStats(statsRes.data);
            setTasks(tasksRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const statItems = [
        {
            label: 'Active Tasks',
            value: stats.activeTasks,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            label: 'Completed',
            value: stats.completedTasks,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        },
        {
            label: 'Urgent Deadlines',
            value: stats.urgentDeadlines,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: stats.urgentDeadlines > 0 ? 'text-red-400' : 'text-gray-400',
            bg: stats.urgentDeadlines > 0 ? 'bg-red-500/10' : 'bg-gray-500/10',
            border: stats.urgentDeadlines > 0 ? 'border-red-500/20' : 'border-gray-500/20'
        },
    ];

    const quickActions = [
        { label: 'View All Tasks', path: '/developer/tasks', icon: '📋' },
        { label: 'Open Workspace', path: '/developer/workspace', icon: '🗂️' },
        { label: 'Check Messages', path: '/developer/messages', icon: '💬' },
        { label: 'View Earnings', path: '/developer/earnings', icon: '💰' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                    Welcome back, {user?.name?.split(' ')[0] || 'Developer'}
                </h1>
                <p className="text-sm md:text-base text-gray-400">Here's your performance overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                {statItems.map((stat, index) => (
                    <div
                        key={index}
                        className={`p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#0f0f14] border ${stat.border} transition-all hover:border-opacity-50 ${index === 2 ? 'col-span-2 md:col-span-1' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <span className="[&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6">{stat.icon}</span>
                            </div>
                            {stat.label === 'Urgent Deadlines' && stat.value > 0 && (
                                <span className="px-1.5 md:px-2 py-0.5 md:py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                                    Attention
                                </span>
                            )}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-gray-500 text-xs md:text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                {quickActions.map((action, index) => (
                    <Link
                        key={index}
                        to={action.path}
                        className="p-3 md:p-4 rounded-lg md:rounded-xl bg-[#0f0f14] border border-white/5 hover:border-blue-500/30 hover:bg-white/5 transition-all group"
                    >
                        <span className="text-xl md:text-2xl mb-1 md:mb-2 block">{action.icon}</span>
                        <span className="text-xs md:text-sm text-gray-400 group-hover:text-white transition-colors">
                            {action.label}
                        </span>
                    </Link>
                ))}
            </div>

            {/* Active Tasks */}
            <div className="rounded-xl md:rounded-2xl bg-[#0f0f14] border border-white/5 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-base md:text-lg font-bold text-white">My Assigned Tasks</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">Tasks currently assigned to you</p>
                    </div>
                    <Link
                        to="/developer/tasks"
                        className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                        <span className="hidden sm:inline">View All</span>
                        <span className="sm:hidden">All</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                <div className="divide-y divide-white/5">
                    {tasks.length > 0 ? (
                        tasks.slice(0, 5).map((task) => {
                            const status = statusConfig[task.status] || statusConfig.working;
                            const urgency = urgencyConfig[task.urgency];
                            const deadline = task.deadline ? formatDeadline(task.deadline) : null;

                            return (
                                <div
                                    key={task._id}
                                    onClick={() => navigate(`/developer/tasks/${task._id}`)}
                                    className="p-4 md:p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                >
                                    {/* Mobile Layout */}
                                    <div className="md:hidden">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h3 className="font-semibold text-white text-sm flex-1 min-w-0 line-clamp-2">
                                                {task.title}
                                            </h3>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border shrink-0 ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                                            {task.subject && (
                                                <span className="capitalize">{task.subject.replace('_', ' ')}</span>
                                            )}
                                            {urgency && task.urgency !== 'standard' && (
                                                <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${urgency.color}`}>
                                                    {urgency.label}
                                                </span>
                                            )}
                                            {deadline && (
                                                <span className={`flex items-center gap-1 ${deadline.color}`}>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {deadline.text}
                                                </span>
                                            )}
                                        </div>
                                        {(task.status === 'working' || task.status === 'accepted') && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                                                        style={{ width: `${task.progress || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-white font-medium">{task.progress || 0}%</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden md:block">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                                                        {task.title}
                                                    </h3>
                                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                    {urgency && task.urgency !== 'standard' && (
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${urgency.color}`}>
                                                            {urgency.label}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    {task.subject && (
                                                        <span className="capitalize">{task.subject.replace('_', ' ')}</span>
                                                    )}
                                                    {task.academicLevel && (
                                                        <>
                                                            <span className="text-gray-700">•</span>
                                                            <span className="capitalize">{task.academicLevel.replace('_', ' ')}</span>
                                                        </>
                                                    )}
                                                    {task.assignmentType && (
                                                        <>
                                                            <span className="text-gray-700">•</span>
                                                            <span className="capitalize">{task.assignmentType.replace('_', ' ')}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0">
                                                {deadline && (
                                                    <div className={`flex items-center gap-2 ${deadline.color}`}>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-sm font-medium">{deadline.text}</span>
                                                    </div>
                                                )}
                                                <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {(task.status === 'working' || task.status === 'accepted') && (
                                            <div className="mt-4 pt-4 border-t border-white/5">
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span className="text-gray-500">Progress</span>
                                                    <span className="text-white font-medium">{task.progress || 0}%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
                                                        style={{ width: `${task.progress || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-8 md:p-12 text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                                <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-base md:text-lg font-medium text-white mb-2">No Active Tasks</h3>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                You don't have any tasks assigned yet. Tasks will appear here when an admin assigns them to you.
                            </p>
                        </div>
                    )}
                </div>

                {/* Show more link if there are more than 5 tasks */}
                {tasks.length > 5 && (
                    <div className="p-3 md:p-4 border-t border-white/5 text-center">
                        <Link
                            to="/developer/tasks"
                            className="text-xs md:text-sm text-blue-400 hover:text-blue-300"
                        >
                            View {tasks.length - 5} more tasks
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
