import { useState } from 'react';
import { FaCheckCircle, FaClock, FaComments, FaFile } from 'react-icons/fa';

export default function ProgressTracking({ task }) {
  const [expandedMilestone, setExpandedMilestone] = useState(null);

  const progressStages = [
    { stage: 1, label: 'Assigned', status: 'completed', description: 'Developer has been assigned' },
    { stage: 2, label: 'In Progress', status: task?.progress > 0 ? 'active' : 'pending', description: 'Work is being done' },
    { stage: 3, label: 'In Review', status: task?.progress === 100 ? 'active' : 'pending', description: 'Work is ready for review' },
    { stage: 4, label: 'Approved', status: task?.status === 'completed' ? 'completed' : 'pending', description: 'Task approved by client' },
    { stage: 5, label: 'Payment', status: task?.paymentStatus === 'completed' ? 'completed' : 'pending', description: 'Payment processed' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 text-white';
      case 'active':
        return 'bg-blue-500 text-white animate-pulse';
      default:
        return 'bg-gray-600 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Overall Progress</h3>
          <span className="text-2xl font-bold text-blue-400">{task?.progress || 0}%</span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-600 transition-all duration-500"
            style={{ width: `${task?.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Workflow Stages */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Workflow Progress</h3>
        <div className="space-y-4">
          {progressStages.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${getStatusColor(item.status)}`}>
                  {item.status === 'completed' ? <FaCheckCircle className="w-6 h-6" /> : item.stage}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">{item.label}</h4>
                    {item.status === 'active' && <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">In Progress</span>}
                    {item.status === 'completed' && <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">Completed</span>}
                  </div>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              </div>
              {idx < progressStages.length - 1 && (
                <div className="ml-6 h-8 border-l-2 border-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Milestones/Updates Timeline */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Progress Updates</h3>
        <div className="space-y-4">
          {task?.progressNotes && task.progressNotes.length > 0 ? (
            task.progressNotes.map((note, idx) => (
              <div key={idx} className="border-l-2 border-blue-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">{note.title || `Update ${idx + 1}`}</p>
                    <p className="text-sm text-gray-400 mt-1">{note.description || note}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{new Date(note.timestamp || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No progress updates yet</p>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <FaClock className="w-5 h-5" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[
            { action: 'Task assigned to developer', time: '2 hours ago', icon: FaFile },
            { action: 'Chat message received', time: '1 hour ago', icon: FaComments },
            { action: 'Progress updated to 50%', time: '30 minutes ago', icon: FaCheckCircle },
          ].map((activity, idx) => {
            const Icon = activity.icon;
            return (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estimated Completion */}
      {task?.deadline && (
        <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2">Estimated Completion</h3>
          <p className="text-gray-300">
            {new Date(task.deadline).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <div className="mt-4 text-sm text-gray-400">
            {Math.ceil((new Date(task.deadline) - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
          </div>
        </div>
      )}
    </div>
  );
}
