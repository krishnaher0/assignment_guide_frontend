import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  FaFileContract,
  FaSearch,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSpinner,
  FaChartBar,
  FaCalendarAlt,
  FaUser,
  FaMoneyBillWave
} from 'react-icons/fa';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400', icon: FaClock },
  pending_signature: { label: 'Awaiting Signature', color: 'bg-amber-500/20 text-amber-400', icon: FaClock },
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400', icon: FaCheckCircle },
  completed: { label: 'Completed', color: 'bg-blue-500/20 text-blue-400', icon: FaCheckCircle },
  terminated: { label: 'Terminated', color: 'bg-red-500/20 text-red-400', icon: FaTimesCircle },
  expired: { label: 'Expired', color: 'bg-gray-500/20 text-gray-400', icon: FaTimesCircle },
};

export default function AdminContracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchContracts();
    fetchStats();
  }, [filter]);

  const fetchContracts = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await api.get('/contracts', { params });
      setContracts(data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/contracts/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      contract.contractNumber?.toLowerCase().includes(searchLower) ||
      contract.projectDetails?.title?.toLowerCase().includes(searchLower) ||
      contract.clientDetails?.name?.toLowerCase().includes(searchLower) ||
      contract.order?.clientName?.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (amount, currency = 'NPR') => {
    return `${currency} ${amount?.toLocaleString() || 0}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaFileContract className="w-7 h-7 text-blue-400" />
            Contracts
          </h1>
          <p className="text-gray-400 mt-1">Manage project contracts and agreements</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FaChartBar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Contracts</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <FaClock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pendingSignature}</p>
                <p className="text-xs text-gray-500">Pending Signature</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <FaCheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <FaMoneyBillWave className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(stats.byStatus?.find(s => s._id === 'active')?.totalValue || 0)}
                </p>
                <p className="text-xs text-gray-500">Active Value</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search contracts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500 w-4 h-4" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all" className="bg-[#0f0f14]">All Contracts</option>
            <option value="pending_signature" className="bg-[#0f0f14]">Pending Signature</option>
            <option value="active" className="bg-[#0f0f14]">Active</option>
            <option value="completed" className="bg-[#0f0f14]">Completed</option>
            <option value="terminated" className="bg-[#0f0f14]">Terminated</option>
          </select>
        </div>
      </div>

      {/* Contracts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-12 text-center">
          <FaFileContract className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No contracts found</h3>
          <p className="text-gray-500">
            {search ? 'Try adjusting your search terms' : 'Contracts will appear here when quotes are accepted'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => {
            const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.draft;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={contract._id}
                className="rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                      <FaFileContract className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white">
                              {contract.contractNumber}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                            {contract.version > 1 && (
                              <span className="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-400 rounded">
                                v{contract.version}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {contract.projectDetails?.title || contract.order?.title}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/admin/contracts/${contract._id}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                        >
                          <FaEye className="w-3 h-3" />
                          View
                        </button>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <FaUser className="w-3 h-3" />
                          <span>{contract.clientDetails?.name || contract.order?.clientName || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <FaMoneyBillWave className="w-3 h-3" />
                          <span>{formatCurrency(contract.financialTerms?.totalAmount, contract.financialTerms?.currency)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span>Created {formatDate(contract.createdAt)}</span>
                        </div>
                        {contract.signedAt && (
                          <div className="flex items-center gap-2 text-emerald-400">
                            <FaCheckCircle className="w-3 h-3" />
                            <span>Signed {formatDate(contract.signedAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Signature Status */}
                      <div className="flex gap-4 mt-4">
                        <div className={`flex items-center gap-2 text-xs ${contract.providerSignature?.agreed ? 'text-emerald-400' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${contract.providerSignature?.agreed ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                          Provider {contract.providerSignature?.agreed ? 'Signed' : 'Pending'}
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${contract.clientSignature?.agreed ? 'text-emerald-400' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${contract.clientSignature?.agreed ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                          Client {contract.clientSignature?.agreed ? 'Signed' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
