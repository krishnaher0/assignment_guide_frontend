import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';

const paymentMethods = ['eSewa', 'Khalti', 'Bank Transfer', 'Cash', 'IME Pay', 'QR Payment'];

export default function AdminPayments() {
  const { socket } = useSocket();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Fetch all orders and filter those with payments
      const ordersResponse = await api.get('/orders');
      const orders = ordersResponse.data || [];
      
      // Transform orders into payment records
      const paymentRecords = orders
        .filter(order => order.paymentStatus || order.transactionId)
        .map(order => ({
          id: order._id,
          taskId: order._id,
          task: order.title,
          client: order.clientName || order.client?.name || 'Unknown',
          email: order.clientEmail || order.client?.email || 'N/A',
          phone: order.clientPhone || order.client?.phone || 'N/A',
          amount: order.quotedAmount || order.amount || 0,
          paidAmount: order.paidAmount || order.amount || 0,
          paymentStatus: order.paymentStatus,
          status: order.paymentStatus === 'paid' ? 'completed' : order.paymentStatus === 'pending_verification' ? 'pending' : 'pending',
          date: new Date(order.updatedAt).toISOString().split('T')[0],
          method: order.paymentMethod || 'eSewa',
          transactionId: order.transactionId || '-',
          description: order.description,
          orderId: order._id,
          qrPaymentProof: order.qrPaymentProof,
        }));

      setPayments(paymentRecords);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (payment) => {
    if (!window.confirm(`Verify payment of Rs. ${payment.amount.toLocaleString()} from ${payment.client}?`)) {
      return;
    }

    setVerifyingId(payment.id);
    try {
      await api.put(`/admin/tasks/${payment.orderId}/verify-payment`);
      
      // Update payment status in UI
      setPayments(payments.map(p => 
        p.id === payment.id 
          ? { ...p, paymentStatus: 'verified', status: 'completed' }
          : p
      ));
      
      // Close modal if open
      setShowDetailModal(null);
      
      // Show success message
      alert('Payment verified successfully!');
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setVerifyingId(null);
    }
  };

  const handleRejectPayment = async (payment) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason === null) return;

    setRejectingId(payment.id);
    try {
      await api.put(`/payment/${payment.orderId}/reject-qr`, { reason });
      
      // Update payment status in UI
      setPayments(payments.map(p => 
        p.id === payment.id 
          ? { ...p, paymentStatus: 'rejected', status: 'rejected' }
          : p
      ));
      
      // Close modal if open
      setShowDetailModal(null);
      
      // Show success message
      alert('Payment rejected successfully!');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setRejectingId(null);
    }
  };

  const filteredPayments = filter === 'all'
    ? payments
    : filter === 'completed'
    ? payments.filter(p => p.paymentStatus === 'paid')
    : filter === 'pending'
    ? payments.filter(p => p.paymentStatus === 'pending_verification')
    : payments;

  const totalRevenue = payments.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + (p.paidAmount || p.amount), 0);
  const pendingAmount = payments.filter(p => p.paymentStatus === 'pending_verification').reduce((sum, p) => sum + p.amount, 0);

  const getMethodIcon = (method) => {
    switch (method) {
      case 'eSewa':
        return <span className="text-green-400 font-bold">e</span>;
      case 'Khalti':
        return <span className="text-purple-400 font-bold">K</span>;
      case 'Bank Transfer':
        return (
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'IME Pay':
        return <span className="text-red-400 font-bold text-xs">IME</span>;
      case 'QR Payment':
        return <span className="text-yellow-400 font-bold text-xs">QR</span>;
      case 'Cash':
        return (
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return <span className="text-gray-400 text-xs">-</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-gray-500">Track all payment transactions from clients</p>
        </div>
        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-white">Rs. {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending Payments</p>
              <p className="text-2xl font-bold text-white">Rs. {pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-white">{payments.length}</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-white">{payments.filter(p => p.paymentStatus === 'paid').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid sm:grid-cols-4 gap-4">
        {['eSewa', 'Khalti', 'Bank Transfer', 'QR Payment'].map((method) => {
          const methodTotal = payments.filter(p => p.method === method && p.paymentStatus === 'verified').reduce((sum, p) => sum + (p.paidAmount || p.amount), 0);
          const count = payments.filter(p => p.method === method).length;
          return (
            <div key={method} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  {getMethodIcon(method)}
                </div>
                <span className="text-white font-medium">{method}</span>
              </div>
              <p className="text-lg font-bold text-emerald-400">Rs. {methodTotal.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{count} transactions</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
        >
          <option value="all" className="bg-[#0f0f14]">All Payments</option>
          <option value="completed" className="bg-[#0f0f14]">Completed</option>
          <option value="pending" className="bg-[#0f0f14]">Pending</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Task</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 whitespace-nowrap">Client</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 whitespace-nowrap">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 whitespace-nowrap">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 whitespace-nowrap">Method</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 whitespace-nowrap">Transaction ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 min-w-[200px] max-w-[280px]">
                    <p className="font-medium text-white cursor-pointer hover:text-blue-400 line-clamp-2" onClick={() => setShowDetailModal(payment)}>{payment.task}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-white">{payment.client}</p>
                    <p className="text-sm text-gray-500">{payment.phone}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-bold text-white">Rs. {payment.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap">{payment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center shrink-0">
                        {getMethodIcon(payment.method)}
                      </div>
                      <span className="text-gray-400">{payment.method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-lg border ${
                        payment.paymentStatus === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : payment.paymentStatus === 'rejected'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : payment.paymentStatus === 'pending_verification'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}
                    >
                      {payment.paymentStatus === 'paid' ? 'Verified' : payment.paymentStatus === 'rejected' ? 'Rejected' : payment.paymentStatus === 'pending_verification' ? 'Pending' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                    <span className="text-xs font-mono">{payment.transactionId}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.paymentStatus === 'pending_verification' && payment.qrPaymentProof ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowDetailModal(payment)}
                          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors whitespace-nowrap"
                        >
                          View Proof
                        </button>
                        <button
                          onClick={() => handleVerifyPayment(payment)}
                          disabled={verifyingId === payment.id}
                          className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded font-medium transition-colors"
                        >
                          {verifyingId === payment.id ? '...' : 'Verify'}
                        </button>
                        <button
                          onClick={() => handleRejectPayment(payment)}
                          disabled={rejectingId === payment.id}
                          className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded font-medium transition-colors"
                        >
                          {rejectingId === payment.id ? '...' : 'Reject'}
                        </button>
                      </div>
                    ) : payment.paymentStatus === 'paid' ? (
                      <span className="text-xs text-emerald-400 font-medium whitespace-nowrap">✓ Verified</span>
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No payments found with the selected filter.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-lg w-full border border-white/10 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Payment Details</h2>
              <button
                onClick={() => setShowDetailModal(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <p className="text-sm text-gray-400">Project/Task</p>
                <p className="font-medium text-white">{showDetailModal.task}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Client</p>
                <p className="font-medium text-white">{showDetailModal.client}</p>
                <p className="text-sm text-gray-500">{showDetailModal.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Amount</p>
                <p className="text-2xl font-bold text-emerald-400">Rs. {showDetailModal.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Payment Method</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
                    {getMethodIcon(showDetailModal.method)}
                  </div>
                  <p className="text-white">{showDetailModal.method}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Transaction ID</p>
                <p className="font-mono text-white">{showDetailModal.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="text-white">{showDetailModal.date}</p>
              </div>
              {showDetailModal.qrPaymentProof && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Payment Proof Screenshot</p>
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black">
                    <img
                      src={showDetailModal.qrPaymentProof}
                      alt="Payment Proof"
                      className="w-full max-h-64 object-contain"
                    />
                    <a
                      href={showDetailModal.qrPaymentProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 px-3 py-1 bg-black/70 text-white text-xs rounded-lg hover:bg-black/90"
                    >
                      Open Full Size
                    </a>
                  </div>
                </div>
              )}
              <div className="pt-4 border-t border-white/5">
                {showDetailModal.paymentStatus === 'pending_verification' && showDetailModal.qrPaymentProof ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleVerifyPayment(showDetailModal);
                      }}
                      disabled={verifyingId === showDetailModal.id}
                      className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                    >
                      {verifyingId === showDetailModal.id ? 'Verifying...' : 'Verify Payment'}
                    </button>
                    <button
                      onClick={() => {
                        handleRejectPayment(showDetailModal);
                      }}
                      disabled={rejectingId === showDetailModal.id}
                      className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                    >
                      {rejectingId === showDetailModal.id ? 'Rejecting...' : 'Reject Payment'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDetailModal(null)}
                    className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
