import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  FaPlus,
  FaEdit,
  FaPaperPlane,
  FaEye,
  FaCheck,
  FaTimes,
  FaHistory,
  FaFileInvoiceDollar,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';

export default function AdminQuotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchQuotes();
    fetchStats();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data } = await api.get('/quotes');
      setQuotes(data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/quotes/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredQuotes = filter === 'all'
    ? quotes
    : quotes.filter(q => q.status === filter);

  const statusColors = {
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    viewed: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    expired: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    revised: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    negotiating: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const statusIcons = {
    draft: FaEdit,
    sent: FaPaperPlane,
    viewed: FaEye,
    accepted: FaCheck,
    rejected: FaTimes,
    expired: FaClock,
    revised: FaHistory,
    negotiating: FaExclamationTriangle,
  };

  const getStatusCount = (status) => {
    return stats?.byStatus?.find(s => s._id === status)?.count || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quotes & Proposals</h1>
          <p className="text-gray-500">Create and manage client quotes</p>
        </div>
        <button
          onClick={() => navigate('/admin/quotes/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-all"
        >
          <FaPlus className="w-4 h-4" />
          New Quote
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-gray-500">Acceptance Rate</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.acceptanceRate?.toFixed(1) || 0}%</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-gray-500">Pending Response</p>
            <p className="text-2xl font-bold text-blue-400">{getStatusCount('sent') + getStatusCount('viewed')}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-gray-500">Negotiating</p>
            <p className="text-2xl font-bold text-amber-400">{getStatusCount('negotiating')}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-gray-500">Accepted</p>
            <p className="text-2xl font-bold text-emerald-400">{getStatusCount('accepted')}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'draft', 'sent', 'viewed', 'negotiating', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
            }`}
          >
            {status === 'all' ? 'All Quotes' : status}
          </button>
        ))}
      </div>

      {/* Quotes Table */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Quote #</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Project</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Client</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Valid Until</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredQuotes.map((quote) => {
                const StatusIcon = statusIcons[quote.status] || FaFileInvoiceDollar;
                const isExpired = new Date(quote.validUntil) < new Date() && quote.status === 'sent';

                return (
                  <tr key={quote._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaFileInvoiceDollar className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="font-medium text-white">{quote.quoteNumber}</p>
                          {quote.version > 1 && (
                            <p className="text-xs text-gray-500">v{quote.version}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium truncate max-w-[200px]">{quote.projectTitle}</p>
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">{quote.order?.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{quote.order?.clientName || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{quote.order?.clientEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{quote.currency} {quote.total?.toLocaleString()}</p>
                      {quote.discountAmount > 0 && (
                        <p className="text-xs text-emerald-400">-{quote.currency} {quote.discountAmount?.toLocaleString()} discount</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${isExpired ? 'text-red-400' : 'text-gray-400'}`}>
                        {new Date(quote.validUntil).toLocaleDateString()}
                      </p>
                      {isExpired && (
                        <p className="text-xs text-red-400">Expired</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${statusColors[quote.status]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/quotes/${quote._id}`)}
                          className="px-3 py-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        {quote.status === 'draft' && (
                          <button
                            onClick={() => navigate(`/admin/quotes/${quote._id}/edit`)}
                            className="px-3 py-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {quote.status === 'negotiating' && (
                          <button
                            onClick={() => navigate(`/admin/quotes/${quote._id}/revise`)}
                            className="px-3 py-1.5 text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                          >
                            Revise
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredQuotes.length === 0 && (
          <div className="p-12 text-center">
            <FaFileInvoiceDollar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">No quotes found</p>
            <button
              onClick={() => navigate('/admin/quotes/new')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
            >
              <FaPlus className="w-3 h-3" />
              Create First Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
