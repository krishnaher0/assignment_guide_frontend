import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import {
  FaFileInvoiceDollar,
  FaCheck,
  FaTimes,
  FaEye,
  FaClock,
  FaHistory,
  FaPaperPlane,
  FaEdit,
  FaExclamationTriangle
} from 'react-icons/fa';

export default function ClientQuotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data } = await api.get('/quotes/my-quotes');
      setQuotes(data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    sent: {
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: FaPaperPlane,
      label: 'Awaiting Response'
    },
    viewed: {
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      icon: FaEye,
      label: 'Viewed'
    },
    accepted: {
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: FaCheck,
      label: 'Accepted'
    },
    rejected: {
      color: 'bg-red-500/10 text-red-400 border-red-500/20',
      icon: FaTimes,
      label: 'Declined'
    },
    expired: {
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      icon: FaClock,
      label: 'Expired'
    },
    revised: {
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      icon: FaHistory,
      label: 'Revised'
    },
    negotiating: {
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: FaExclamationTriangle,
      label: 'Under Review'
    }
  };

  const pendingQuotes = quotes.filter(q => ['sent', 'viewed'].includes(q.status));
  const otherQuotes = quotes.filter(q => !['sent', 'viewed'].includes(q.status));

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
      <div>
        <h1 className="text-2xl font-bold text-white">Quotes & Proposals</h1>
        <p className="text-gray-500">Review and respond to project quotes</p>
      </div>

      {/* Pending Quotes */}
      {pendingQuotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Awaiting Your Response
          </h2>
          <div className="grid gap-4">
            {pendingQuotes.map((quote) => {
              const config = statusConfig[quote.status] || statusConfig.sent;
              const StatusIcon = config.icon;
              const isExpired = new Date(quote.validUntil) < new Date();

              return (
                <div
                  key={quote._id}
                  onClick={() => navigate(`/dashboard/client/quotes/${quote._id}`)}
                  className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/20 hover:border-blue-500/40 cursor-pointer transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                        <FaFileInvoiceDollar className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{quote.projectTitle}</h3>
                          <span className="text-xs text-gray-500">{quote.quoteNumber}</span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">{quote.projectSummary}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className={`flex items-center gap-1 ${isExpired ? 'text-red-400' : 'text-gray-500'}`}>
                            <FaClock className="w-3 h-3" />
                            {isExpired ? 'Expired' : `Valid until ${new Date(quote.validUntil).toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-400">
                          {quote.currency} {quote.total?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Total Quote</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Quotes */}
      {otherQuotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Quote History</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Quote</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Project</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {otherQuotes.map((quote) => {
                    const config = statusConfig[quote.status] || statusConfig.sent;
                    const StatusIcon = config.icon;

                    return (
                      <tr
                        key={quote._id}
                        onClick={() => navigate(`/dashboard/client/quotes/${quote._id}`)}
                        className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FaFileInvoiceDollar className="w-4 h-4 text-gray-500" />
                            <span className="text-white font-medium">{quote.quoteNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white truncate max-w-[200px]">{quote.projectTitle}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">{quote.currency} {quote.total?.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${config.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {quotes.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/5">
          <FaFileInvoiceDollar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Quotes Yet</h3>
          <p className="text-gray-500 mb-4">
            When you submit a project, you'll receive a professional quote here.
          </p>
          <button
            onClick={() => navigate('/dashboard/client/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 text-blue-400 rounded-xl font-medium hover:bg-blue-500/30 transition-colors"
          >
            Submit a Project
          </button>
        </div>
      )}
    </div>
  );
}
