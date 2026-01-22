import { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock order data - in real app this would come from an API
const mockOrders = {
  'CSLX123ABC': {
    id: 'CSLX123ABC',
    title: 'E-commerce Website with eSewa Integration',
    client: 'Ram Sharma',
    email: 'ram@email.com',
    phone: '+977-9841234567',
    service: 'Web Development',
    status: 'in_progress',
    progress: 65,
    budget: 'Rs. 35,000',
    paidAmount: 'Rs. 17,500',
    remainingAmount: 'Rs. 17,500',
    deadline: '2024-02-15',
    developer: {
      name: 'Rajesh Sharma',
      avatar: 'R',
    },
    createdAt: '2024-01-15',
    timeline: [
      { date: '2024-01-15 10:30 AM', event: 'Order submitted', status: 'completed', description: 'Your project request was received.' },
      { date: '2024-01-15 02:15 PM', event: 'Quote sent', status: 'completed', description: 'We sent you a detailed quote via WhatsApp.' },
      { date: '2024-01-15 05:00 PM', event: 'Payment received', status: 'completed', description: '50% advance payment (Rs. 17,500) received via eSewa.' },
      { date: '2024-01-16 09:00 AM', event: 'Development started', status: 'completed', description: 'Developer Rajesh has started working on your project.' },
      { date: '2024-01-18 04:30 PM', event: 'Frontend completed', status: 'completed', description: 'React frontend with Tailwind CSS is complete.' },
      { date: '2024-01-20 11:00 AM', event: 'Backend in progress', status: 'current', description: 'Working on Node.js backend and eSewa payment integration.' },
      { date: 'Upcoming', event: 'Testing & QA', status: 'pending', description: 'Complete testing and bug fixes.' },
      { date: 'Upcoming', event: 'Final delivery', status: 'pending', description: 'Project delivery with source code and documentation.' },
    ],
  },
  'CSMY456XYZ': {
    id: 'CSMY456XYZ',
    title: 'Mobile App UI/UX Design',
    client: 'Sita Gurung',
    email: 'sita@email.com',
    phone: '+977-9851234567',
    service: 'Mobile App',
    status: 'completed',
    progress: 100,
    budget: 'Rs. 15,000',
    paidAmount: 'Rs. 15,000',
    remainingAmount: 'Rs. 0',
    deadline: '2024-01-20',
    developer: {
      name: 'Anita Rai',
      avatar: 'A',
    },
    createdAt: '2024-01-10',
    timeline: [
      { date: '2024-01-10 09:00 AM', event: 'Order submitted', status: 'completed', description: 'Your project request was received.' },
      { date: '2024-01-10 12:00 PM', event: 'Quote sent', status: 'completed', description: 'Quote approved and payment received.' },
      { date: '2024-01-12 10:00 AM', event: 'Development started', status: 'completed', description: 'Started working on Flutter UI components.' },
      { date: '2024-01-18 03:00 PM', event: 'Project completed', status: 'completed', description: 'All screens and components delivered.' },
      { date: '2024-01-20 11:00 AM', event: 'Final delivery', status: 'completed', description: 'Source code and assets delivered via Google Drive.' },
    ],
  },
};

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const foundOrder = mockOrders[orderId.toUpperCase()];
      if (foundOrder) {
        setOrder(foundOrder);
        setError('');
      } else {
        setOrder(null);
        setError('Order not found. Please check your Order ID and try again.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="pt-32 pb-12">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-blue-400 font-medium mb-3 text-sm tracking-wide uppercase">Track Order</p>
          <h1 className="text-4xl font-bold text-white mb-4">Track Your Project</h1>
          <p className="text-gray-400 text-lg">
            Enter your Order ID to check the status of your project.
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-xl mx-auto px-6 mb-12">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID (e.g., CSLX123ABC)"
            className="flex-1 px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-mono"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Demo IDs */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Demo Order IDs to try:</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {Object.keys(mockOrders).map((id) => (
              <button
                key={id}
                onClick={() => setOrderId(id)}
                className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-sm font-mono hover:bg-white/10 transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order Details */}
      {order && (
        <div className="max-w-4xl mx-auto px-6 pb-24">
          {/* Order Header */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="text-xl font-mono font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  {order.id}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-medium border ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">{order.title}</h2>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-medium">{order.progress}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-600 rounded-full transition-all duration-500"
                  style={{ width: `${order.progress}%` }}
                />
              </div>
            </div>

            {/* Order Info Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Service</p>
                <p className="text-white font-medium">{order.service}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Deadline</p>
                <p className="text-white font-medium">{order.deadline}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                <p className="text-white font-bold">{order.budget}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Remaining</p>
                <p className={`font-bold ${order.remainingAmount === 'Rs. 0' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {order.remainingAmount}
                </p>
              </div>
            </div>
          </div>

          {/* Developer Info */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Assigned Developer</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl">
                {order.developer.avatar}
              </div>
              <div>
                <p className="text-white font-medium">{order.developer.name}</p>
                <p className="text-sm text-gray-500">Working on your project</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-6">
            <h3 className="text-lg font-semibold text-white mb-6">Project Timeline</h3>
            <div className="space-y-6">
              {order.timeline.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ${
                      item.status === 'completed' ? 'bg-emerald-500' :
                      item.status === 'current' ? 'bg-blue-500 animate-pulse' :
                      'bg-gray-600'
                    }`} />
                    {index < order.timeline.length - 1 && (
                      <div className={`w-0.5 flex-1 mt-2 ${
                        item.status === 'completed' ? 'bg-emerald-500/30' : 'bg-gray-700'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <p className={`font-medium ${
                        item.status === 'completed' ? 'text-white' :
                        item.status === 'current' ? 'text-blue-400' :
                        'text-gray-500'
                      }`}>
                        {item.event}
                      </p>
                      {item.status === 'current' && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{item.date}</p>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`https://wa.me/9779800000000?text=Hi! I'm checking on my order ${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 bg-green-500/20 text-green-400 rounded-xl font-semibold text-center hover:bg-green-500/30 transition-colors border border-green-500/30 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contact via WhatsApp
            </a>
            <Link
              to="/submit-task"
              className="flex-1 py-4 bg-white/5 text-white rounded-xl font-semibold text-center hover:bg-white/10 transition-colors"
            >
              Submit New Task
            </Link>
          </div>
        </div>
      )}

      {/* No order yet - show instructions */}
      {!order && !error && (
        <div className="max-w-2xl mx-auto px-6 pb-24">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">Enter Your Order ID</h3>
            <p className="text-gray-400 mb-6">
              You received an Order ID when you submitted your task. Enter it above to track progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/submit-task"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Submit New Task
              </Link>
              <a
                href="https://wa.me/9779800000000"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
