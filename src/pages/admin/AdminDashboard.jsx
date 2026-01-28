import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HiOutlineChevronRight, HiOutlineClock, HiOutlineExclamation, HiOutlineCheckCircle, HiOutlineFire, HiOutlineClipboardList } from 'react-icons/hi';
import api from '../../utils/api';
import DeadlineCountdown from '../../components/DeadlineCountdown';

// Simplified status colors for new workflow
const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  quoted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  accepted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  working: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  review: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  declined: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels = {
  pending: 'Needs Quote',
  quoted: 'Awaiting Client',
  accepted: 'Ready to Assign',
  working: 'In Progress',
  review: 'Review Required',
  delivered: 'Delivered',
  completed: 'Completed',
  rejected: 'Rejected',
  declined: 'Declined',
};

// Action config based on status
const getActionConfig = (status) => {
  switch (status) {
    case 'pending':
      return { label: 'Create Quote', color: 'bg-amber-600 hover:bg-amber-700', icon: 'quote' };
    case 'accepted':
      return { label: 'Assign Developer', color: 'bg-emerald-600 hover:bg-emerald-700', icon: 'assign' };
    case 'review':
      return { label: 'Review Work', color: 'bg-orange-600 hover:bg-orange-700', icon: 'review' };
    default:
      return { label: 'View', color: 'bg-blue-600 hover:bg-blue-700', icon: 'view' };
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, workersRes] = await Promise.all([
          api.get('/orders'),
          api.get('/users/developers'),
        ]);
        setTasks(tasksRes.data);
        setWorkers(workersRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Tasks needing action - grouped by action type
  const pendingQuotes = tasks.filter(t => t.status === 'pending');
  const needsAssignment = tasks.filter(t => t.status === 'accepted');
  const needsReview = tasks.filter(t => t.status === 'review');

  // Combined needs action list
  const needsAction = [...pendingQuotes, ...needsAssignment, ...needsReview]
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  // In progress tasks
  const inProgress = tasks
    .filter(t => ['working', 'quoted'].includes(t.status))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  // Urgent deadlines (within 3 days)
  const urgentDeadlines = tasks.filter(t => {
    if (!['working', 'review', 'accepted'].includes(t.status)) return false;
    const deadline = new Date(t.deadline);
    const now = new Date();
    const daysUntil = (deadline - now) / (1000 * 60 * 60 * 24);
    return daysUntil <= 3 && daysUntil >= 0;
  });

  // Calculate stats from real data
  const stats = [
    {
      label: 'Pending Quotes',
      value: pendingQuotes.length.toString(),
      change: 'New requests',
      trend: pendingQuotes.length > 0 ? 'alert' : 'neutral',
      icon: HiOutlineExclamation,
      bgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-400'
    },
    {
      label: 'Ready to Assign',
      value: needsAssignment.length.toString(),
      change: 'Paid & waiting',
      trend: needsAssignment.length > 0 ? 'alert' : 'neutral',
      icon: HiOutlineClipboardList,
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400'
    },
    {
      label: 'Needs Review',
      value: needsReview.length.toString(),
      change: 'Work submitted',
      trend: needsReview.length > 0 ? 'alert' : 'neutral',
      icon: HiOutlineFire,
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-400'
    },
    {
      label: 'Completed',
      value: tasks.filter(t => ['delivered', 'completed'].includes(t.status)).length.toString(),
      change: `${workers.length} workers`,
      trend: 'up',
      icon: HiOutlineCheckCircle,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-400'
    },
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-500">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <p className="text-xs md:text-sm text-gray-500">{stat.label}</p>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-xl md:text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className={`text-xs md:text-sm ${stat.trend === 'up' ? 'text-emerald-400' : stat.trend === 'alert' && parseInt(stat.value) > 0 ? 'text-amber-400' : 'text-gray-500'}`}>
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Action Required */}
      {needsAction.length > 0 && (
        <div className="rounded-xl md:rounded-2xl bg-[#0f0f14] border border-white/5 overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <h2 className="text-base md:text-lg font-semibold text-white">Action Required</h2>
              <span className="px-2 py-0.5 md:px-2.5 md:py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
                {needsAction.length}
              </span>
            </div>
            <Link to="/admin/tasks" className="text-xs md:text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-white/5">
            {needsAction.slice(0, 6).map((task) => {
              const action = getActionConfig(task.status);
              return (
                <div
                  key={task._id}
                  onClick={() => navigate(`/admin/tasks/${task._id}`)}
                  className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.clientName || 'Unknown'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg border shrink-0 ${statusColors[task.status]}`}>
                      {statusLabels[task.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      {task.quotedAmount ? (
                        <span className="text-emerald-400 font-medium">Rs. {task.quotedAmount.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-500">Not quoted</span>
                      )}
                      {task.deadline && <DeadlineCountdown deadline={task.deadline} size="sm" />}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/tasks/${task._id}`); }}
                      className={`px-2.5 py-1 text-xs text-white rounded-lg font-medium ${action.color}`}
                    >
                      {action.label}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 whitespace-nowrap">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 whitespace-nowrap">Deadline</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {needsAction.slice(0, 6).map((task) => {
                  const action = getActionConfig(task.status);
                  return (
                    <tr key={task._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 min-w-[200px] max-w-[280px]">
                        <p className="font-medium text-white line-clamp-2">{task.title}</p>
                        <p className="text-sm text-gray-500 capitalize whitespace-nowrap">{task.assignmentType?.replace('_', ' ') || 'Project'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-white">{task.clientName || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{task.clientEmail}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.quotedAmount ? (
                          <p className="font-semibold text-emerald-400">Rs. {task.quotedAmount.toLocaleString()}</p>
                        ) : (
                          <p className="text-gray-500">Not quoted</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.deadline ? (
                          <DeadlineCountdown deadline={task.deadline} size="sm" />
                        ) : (
                          <span className="text-gray-500">No deadline</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-lg border ${statusColors[task.status]}`}>
                          {statusLabels[task.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/tasks/${task._id}`)}
                            className={`px-3 py-1.5 text-xs text-white rounded-lg font-medium transition-colors whitespace-nowrap ${action.color}`}
                          >
                            {action.label}
                          </button>
                          <button
                            onClick={() => navigate(`/admin/tasks/${task._id}`)}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {needsAction.length > 6 && (
            <div className="px-4 md:px-6 py-3 border-t border-white/5 text-center">
              <Link to="/admin/tasks" className="text-xs md:text-sm text-blue-400 hover:text-blue-300">
                View {needsAction.length - 6} more items
              </Link>
            </div>
          )}
        </div>
      )}

      {/* No Action Required State */}
      {needsAction.length === 0 && (
        <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <HiOutlineCheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">All caught up!</h3>
          <p className="text-gray-400">No tasks require your immediate action.</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
        {/* In Progress Tasks */}
        <div className="lg:col-span-2 rounded-xl md:rounded-2xl bg-[#0f0f14] border border-white/5 overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <h2 className="text-sm md:text-base font-semibold text-white">In Progress</h2>
              <span className="px-2 py-0.5 text-xs bg-violet-500/20 text-violet-400 rounded-full">
                {inProgress.length}
              </span>
            </div>
            <Link to="/admin/tasks" className="text-xs md:text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {inProgress.length > 0 ? (
              inProgress.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  onClick={() => navigate(`/admin/tasks/${task._id}`)}
                  className="px-4 md:px-6 py-3 md:py-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-medium text-white text-sm flex-1 min-w-0 line-clamp-2">{task.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-lg border shrink-0 ${statusColors[task.status]}`}>
                        {statusLabels[task.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>{task.clientName || 'Unknown'}</span>
                      {task.team?.length > 0 && (
                        <span className="text-emerald-400">{task.team.filter(t => t.status === 'active').length} dev</span>
                      )}
                      {task.deadline && <DeadlineCountdown deadline={task.deadline} size="sm" />}
                    </div>
                    {task.progress > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="text-xs text-violet-400">{task.progress}%</span>
                      </div>
                    )}
                  </div>
                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium text-white group-hover:text-blue-400 transition-colors truncate">{task.title}</p>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border shrink-0 ${statusColors[task.status]}`}>
                          {statusLabels[task.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{task.clientName || 'Unknown client'}</span>
                        {task.team?.length > 0 && (
                          <span className="text-emerald-400">{task.team.filter(t => t.status === 'active').length} developer(s)</span>
                        )}
                        {task.progress > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-violet-500 rounded-full"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="text-violet-400">{task.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {task.deadline && <DeadlineCountdown deadline={task.deadline} size="sm" />}
                      <HiOutlineChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 md:px-6 py-8 md:py-12 text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center">
                  <HiOutlineClipboardList className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                </div>
                <p className="text-sm md:text-base text-gray-500">No tasks in progress</p>
              </div>
            )}
          </div>
        </div>

        {/* Workers */}
        <div className="rounded-xl md:rounded-2xl bg-[#0f0f14] border border-white/5 overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm md:text-base font-semibold text-white">Team</h2>
            <Link to="/admin/developers" className="text-xs md:text-sm text-blue-400 hover:text-blue-300">
              Manage
            </Link>
          </div>
          <div className="p-3 md:p-4 space-y-2 md:space-y-3">
            {workers.slice(0, 5).map((worker) => (
              <div key={worker._id} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm md:text-base">
                    {(worker.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-[#0f0f14] ${
                    worker.status === 'online' ? 'bg-emerald-400' :
                    worker.status === 'busy' ? 'bg-amber-400' : 'bg-gray-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-white truncate">{worker.name}</p>
                  <p className="text-xs text-gray-500">
                    {worker.workerProfile?.currentTaskCount || 0} task(s)
                  </p>
                </div>
                <span className={`px-1.5 md:px-2 py-0.5 text-xs rounded-full shrink-0 ${
                  worker.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' :
                  worker.status === 'busy' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {worker.status || 'offline'}
                </span>
              </div>
            ))}
            {workers.length === 0 && (
              <div className="text-center py-6 md:py-8">
                <p className="text-sm text-gray-500">No workers yet</p>
                <Link to="/admin/developers" className="text-xs md:text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block">
                  Add developers
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 md:p-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-purple-500/10 border border-white/5">
        <h2 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">Quick Actions</h2>
        <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6">Manage your workflow efficiently</p>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-4">
          <Link
            to="/admin/tasks"
            className="px-3 md:px-5 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg md:rounded-xl font-medium transition-colors text-center text-sm md:text-base"
          >
            All Tasks
          </Link>
          <Link
            to="/admin/quotes"
            className="px-3 md:px-5 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg md:rounded-xl font-medium transition-colors text-center text-sm md:text-base"
          >
            Quotes
          </Link>
          <Link
            to="/admin/developers"
            className="px-3 md:px-5 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg md:rounded-xl font-medium transition-colors text-center text-sm md:text-base"
          >
            Team
          </Link>
          <Link
            to="/admin/payments"
            className="px-3 md:px-5 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg md:rounded-xl font-medium transition-colors text-center text-sm md:text-base"
          >
            Payments
          </Link>
          <Link
            to="/admin/invoices"
            className="col-span-2 sm:col-span-1 px-3 md:px-5 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg md:rounded-xl font-medium transition-colors text-center text-sm md:text-base"
          >
            Invoices
          </Link>
        </div>
      </div>
    </div>
  );
}
