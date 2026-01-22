import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

const statusConfig = {
    accepted: { label: 'Accepted', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    working: { label: 'In Progress', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    review: { label: 'Under Review', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    delivered: { label: 'Delivered', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
};

export default function Earnings() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        activeTasks: 0,
        completedTasks: 0,
        urgentDeadlines: 0
    });
    const [completedTasks, setCompletedTasks] = useState([]);
    const [activeTasks, setActiveTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, completedRes, activeRes] = await Promise.all([
                api.get('/developer/stats'),
                api.get('/developer/tasks?status=delivered,completed'),
                api.get('/developer/tasks?status=accepted,working,review')
            ]);
            setStats(statsRes.data);
            setCompletedTasks(completedRes.data);
            setActiveTasks(activeRes.data);
        } catch (error) {
            console.error('Error fetching earnings data:', error);
        } finally {
            setLoading(false);
        }
    };

    const earningsStats = [
        {
            label: 'Completed Tasks',
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
            label: 'Active Tasks',
            value: stats.activeTasks,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            label: 'Pending Review',
            value: activeTasks.filter(t => t.status === 'review').length,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            ),
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20'
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Loading earnings data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Earnings & Performance</h1>
                <p className="text-sm md:text-base text-gray-400 mt-1">Track your completed work and performance metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                {earningsStats.map((stat, index) => (
                    <div
                        key={index}
                        className={`p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#0f0f14] border ${stat.border} transition-all hover:border-opacity-50 ${index === 2 ? 'col-span-2 md:col-span-1' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <span className="[&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6">{stat.icon}</span>
                            </div>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-gray-500 text-xs md:text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Payment Info Notice */}
            <div className="rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 p-4 md:p-6">
                <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">Payment Information</h3>
                        <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                            Payments for completed work are processed externally by the admin team.
                            Once you complete and release a task, the admin will review your work and process payment according to the agreed terms.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 md:gap-2 p-1 bg-[#0f0f14] rounded-lg md:rounded-xl border border-white/5 w-full md:w-fit overflow-x-auto">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                        activeTab === 'overview'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                        activeTab === 'completed'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <span className="hidden sm:inline">Completed</span>
                    <span className="sm:hidden">Done</span>
                    <span className="ml-1">({completedTasks.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                        activeTab === 'active'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <span className="hidden sm:inline">In Progress</span>
                    <span className="sm:hidden">Active</span>
                    <span className="ml-1">({activeTasks.length})</span>
                </button>
            </div>

            {/* Content based on tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Recent Completed */}
                    <div className="rounded-xl md:rounded-2xl bg-[#0f0f14] border border-white/5 overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-sm md:text-lg font-semibold text-white">Recently Completed</h2>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className="text-xs md:text-sm text-blue-400 hover:text-blue-300"
                            >
                                View All
                            </button>
                        </div>
                        <div className="divide-y divide-white/5">
                            {completedTasks.length > 0 ? (
                                completedTasks.slice(0, 5).map((task) => (
                                    <Link
                                        key={task._id}
                                        to={`/developer/tasks/${task._id}`}
                                        className="block p-3 md:p-4 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-white text-sm truncate">{task.title}</h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {task.subject && <span className="capitalize">{task.subject.replace('_', ' ')}</span>}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border shrink-0 ${statusConfig[task.status]?.color}`}>
                                                {statusConfig[task.status]?.label}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-6 md:p-8 text-center">
                                    <p className="text-sm text-gray-500">No completed tasks yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Work */}
                    <div className="rounded-xl md:rounded-2xl bg-[#0f0f14] border border-white/5 overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-sm md:text-lg font-semibold text-white">Active Work</h2>
                            <button
                                onClick={() => setActiveTab('active')}
                                className="text-xs md:text-sm text-blue-400 hover:text-blue-300"
                            >
                                View All
                            </button>
                        </div>
                        <div className="divide-y divide-white/5">
                            {activeTasks.length > 0 ? (
                                activeTasks.slice(0, 5).map((task) => (
                                    <Link
                                        key={task._id}
                                        to={`/developer/tasks/${task._id}`}
                                        className="block p-3 md:p-4 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h3 className="font-medium text-white text-sm truncate flex-1">{task.title}</h3>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border shrink-0 ${statusConfig[task.status]?.color}`}>
                                                {statusConfig[task.status]?.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                                                    style={{ width: `${task.progress || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400">{task.progress || 0}%</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-6 md:p-8 text-center">
                                    <p className="text-sm text-gray-500">No active tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'completed' && (
                <div className="bg-[#0f0f14] border border-white/5 rounded-xl overflow-hidden">
                    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-sm md:text-lg font-semibold text-white">Completed Tasks</h2>
                        </div>
                        {completedTasks.length > 0 && (
                            <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-emerald-500/20 text-emerald-400 text-xs md:text-sm font-medium rounded-lg">
                                {completedTasks.length}
                            </span>
                        )}
                    </div>

                    {completedTasks.length === 0 ? (
                        <div className="text-center py-12 md:py-16">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-400 font-medium">No Completed Tasks</p>
                            <p className="text-sm text-gray-500 mt-1">Complete your assigned tasks to see them here</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-white/5">
                                {completedTasks.map((task) => (
                                    <Link
                                        key={task._id}
                                        to={`/developer/tasks/${task._id}`}
                                        className="block p-4 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h3 className="font-medium text-white text-sm flex-1 min-w-0 line-clamp-2">{task.title}</h3>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border shrink-0 ${statusConfig[task.status]?.color}`}>
                                                {statusConfig[task.status]?.label}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                            <span className="capitalize">{task.subject?.replace('_', ' ') || 'N/A'}</span>
                                            <span>•</span>
                                            <span>{task.completedAt ? new Date(task.completedAt).toLocaleDateString() : new Date(task.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Task</th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Subject</th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Level</th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Completed Date</th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Status</th>
                                            <th className="text-right py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {completedTasks.map((task) => (
                                            <tr key={task._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="py-4 px-6 min-w-[200px] max-w-[280px]">
                                                    <p className="text-white font-medium line-clamp-2">{task.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">#{task._id.slice(-8)}</p>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className="text-gray-300 capitalize">{task.subject?.replace('_', ' ') || 'N/A'}</span>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className="text-gray-400 text-sm capitalize">{task.academicLevel?.replace('_', ' ') || 'N/A'}</span>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className="text-gray-400 text-sm">
                                                        {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : new Date(task.updatedAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border whitespace-nowrap ${statusConfig[task.status]?.color}`}>
                                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        {statusConfig[task.status]?.label}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <Link
                                                        to={`/developer/tasks/${task._id}`}
                                                        className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                                                    >
                                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'active' && (
                <div className="bg-[#0f0f14] border border-white/5 rounded-xl overflow-hidden">
                    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-sm md:text-lg font-semibold text-white">Active Tasks</h2>
                        </div>
                        {activeTasks.length > 0 && (
                            <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-blue-500/20 text-blue-400 text-xs md:text-sm font-medium rounded-lg">
                                {activeTasks.length}
                            </span>
                        )}
                    </div>

                    {activeTasks.length === 0 ? (
                        <div className="text-center py-12 md:py-16">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-400 font-medium">No Active Tasks</p>
                            <p className="text-sm text-gray-500 mt-1">Tasks will appear here when assigned to you</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-white/5">
                                {activeTasks.map((task) => {
                                    const isUrgent = task.deadline && (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24) < 2;
                                    return (
                                        <Link
                                            key={task._id}
                                            to={`/developer/tasks/${task._id}`}
                                            className="block p-4 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <h3 className="font-medium text-white text-sm flex-1 min-w-0 line-clamp-2">{task.title}</h3>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border shrink-0 ${statusConfig[task.status]?.color}`}>
                                                    {statusConfig[task.status]?.label}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                                                <span className="capitalize">{task.subject?.replace('_', ' ') || 'N/A'}</span>
                                                {task.deadline && (
                                                    <>
                                                        <span>•</span>
                                                        <span className={isUrgent ? 'text-red-400' : ''}>
                                                            {new Date(task.deadline).toLocaleDateString()}
                                                            {isUrgent && ' (Urgent)'}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                                                        style={{ width: `${task.progress || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-white font-medium">{task.progress || 0}%</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full min-w-[900px]">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Task</th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Subject</th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Deadline</th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Progress</th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Status</th>
                                            <th className="text-right py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeTasks.map((task) => {
                                            const isUrgent = task.deadline && (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24) < 2;
                                            return (
                                                <tr key={task._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-4 px-6 min-w-[200px] max-w-[280px]">
                                                        <p className="text-white font-medium line-clamp-2">{task.title}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">#{task._id.slice(-8)}</p>
                                                    </td>
                                                    <td className="py-4 px-6 whitespace-nowrap">
                                                        <span className="text-gray-300 capitalize">{task.subject?.replace('_', ' ') || 'N/A'}</span>
                                                    </td>
                                                    <td className="py-4 px-6 whitespace-nowrap">
                                                        {task.deadline ? (
                                                            <span className={`text-sm ${isUrgent ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                                                                {new Date(task.deadline).toLocaleDateString()}
                                                                {isUrgent && (
                                                                    <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-xs whitespace-nowrap">
                                                                        Urgent
                                                                    </span>
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-500 text-sm whitespace-nowrap">No deadline</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6 whitespace-nowrap">
                                                        <div className="flex items-center gap-3 min-w-[120px]">
                                                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all"
                                                                    style={{ width: `${task.progress || 0}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-white font-medium w-10 text-right">{task.progress || 0}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border whitespace-nowrap ${statusConfig[task.status]?.color}`}>
                                                            {statusConfig[task.status]?.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 whitespace-nowrap">
                                                        <Link
                                                            to={`/developer/tasks/${task._id}`}
                                                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                                                        >
                                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Work
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
