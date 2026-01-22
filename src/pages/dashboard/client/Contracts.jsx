import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import {
  FaFileContract,
  FaSearch,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSpinner,
  FaPen,
  FaMoneyBillWave,
  FaCalendarAlt
} from 'react-icons/fa';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400', icon: FaClock },
  pending_signature: { label: 'Sign Now', color: 'bg-blue-500/20 text-blue-400', icon: FaPen },
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400', icon: FaCheckCircle },
  completed: { label: 'Completed', color: 'bg-blue-500/20 text-blue-400', icon: FaCheckCircle },
  terminated: { label: 'Terminated', color: 'bg-red-500/20 text-red-400', icon: FaTimesCircle },
  expired: { label: 'Expired', color: 'bg-gray-500/20 text-gray-400', icon: FaTimesCircle },
};

export default function Contracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data } = await api.get('/contracts/my-contracts');
      setContracts(data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      contract.contractNumber?.toLowerCase().includes(searchLower) ||
      contract.projectDetails?.title?.toLowerCase().includes(searchLower)
    );
  });

  const pendingSignature = contracts.filter(c => c.status === 'pending_signature');
  const activeContracts = contracts.filter(c => c.status === 'active');

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
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaFileContract className="w-7 h-7 text-blue-400" />
          My Contracts
        </h1>
        <p className="text-gray-400 mt-1">View and sign your project contracts</p>
      </div>

      {/* Action Required Banner */}
      {pendingSignature.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FaPen className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">Action Required</h3>
              <p className="text-sm text-blue-200/70">
                You have {pendingSignature.length} contract{pendingSignature.length > 1 ? 's' : ''} awaiting your signature
              </p>
            </div>
            <button
              onClick={() => navigate(`/dashboard/client/contracts/${pendingSignature[0]._id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
            >
              Review & Sign
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FaFileContract className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{contracts.length}</p>
              <p className="text-xs text-gray-500">Total Contracts</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <FaCheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{activeContracts.length}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FaPen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingSignature.length}</p>
              <p className="text-xs text-gray-500">To Sign</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Search contracts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* Contracts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-12 text-center">
          <FaFileContract className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No contracts yet</h3>
          <p className="text-gray-500">
            Your contracts will appear here when your quotes are accepted
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => {
            const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.draft;
            const StatusIcon = statusConfig.icon;
            const needsSignature = contract.status === 'pending_signature';

            return (
              <div
                key={contract._id}
                className={`rounded-xl border overflow-hidden transition-all cursor-pointer hover:border-white/20 ${
                  needsSignature
                    ? 'bg-blue-500/5 border-blue-500/30'
                    : 'bg-white/[0.02] border-white/5'
                }`}
                onClick={() => navigate(`/dashboard/client/contracts/${contract._id}`)}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      needsSignature
                        ? 'bg-blue-500/20'
                        : 'bg-gradient-to-br from-blue-500 to-violet-600'
                    }`}>
                      {needsSignature ? (
                        <FaPen className="w-5 h-5 text-blue-400" />
                      ) : (
                        <FaFileContract className="w-6 h-6 text-white" />
                      )}
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
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {contract.projectDetails?.title || contract.order?.title}
                          </p>
                        </div>
                        <button
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            needsSignature
                              ? 'bg-blue-600 text-white hover:bg-blue-500'
                              : 'bg-white/5 text-white hover:bg-white/10'
                          }`}
                        >
                          {needsSignature ? (
                            <>
                              <FaPen className="w-3 h-3" />
                              Sign Now
                            </>
                          ) : (
                            <>
                              <FaEye className="w-3 h-3" />
                              View
                            </>
                          )}
                        </button>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <FaMoneyBillWave className="w-3 h-3" />
                          <span>{formatCurrency(contract.financialTerms?.totalAmount, contract.financialTerms?.currency)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span>{formatDate(contract.createdAt)}</span>
                        </div>
                        {contract.signedAt && (
                          <div className="flex items-center gap-2 text-emerald-400">
                            <FaCheckCircle className="w-3 h-3" />
                            <span>Signed {formatDate(contract.signedAt)}</span>
                          </div>
                        )}
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
