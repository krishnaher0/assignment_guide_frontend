import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices/my-invoices');
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = filter === 'all'
    ? invoices
    : invoices.filter(inv => inv.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'sent':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'overdue':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate totals
  const totalPending = invoices
    .filter(inv => ['sent', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Invoices</h1>
        <p className="text-sm md:text-base text-zinc-500">View and manage your invoices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-zinc-400">Total</p>
              <p className="text-lg md:text-xl font-bold text-white">{invoices.length}</p>
            </div>
          </div>
        </div>
        <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-zinc-400">Pending</p>
              <p className="text-lg md:text-xl font-bold text-white truncate">Rs. {totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1 p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-zinc-400">Paid</p>
              <p className="text-lg md:text-xl font-bold text-white truncate">Rs. {totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white text-sm md:text-base focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
        >
          <option value="all" className="bg-zinc-800">All Invoices</option>
          <option value="sent" className="bg-zinc-800">Pending</option>
          <option value="paid" className="bg-zinc-800">Paid</option>
          <option value="overdue" className="bg-zinc-800">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#0f0f14] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-sm md:text-lg font-semibold text-white">All Invoices</h2>
          </div>
          {filteredInvoices.length > 0 && (
            <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-blue-500/20 text-blue-400 text-xs md:text-sm font-medium rounded-lg">
              {filteredInvoices.length}
            </span>
          )}
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">No invoices found</p>
            <p className="text-sm text-gray-500 mt-1">Invoices will appear here when created</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  onClick={() => setShowDetailModal(invoice)}
                  className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-gray-400 mb-1">{invoice.invoiceNumber}</p>
                      <h3 className="font-medium text-white text-sm line-clamp-2">{invoice.contract?.projectTitle || 'Project Invoice'}</h3>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-lg border shrink-0 ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
                    <span>Due: {formatDate(invoice.dueDate)}</span>
                    <span>•</span>
                    <span className="text-white font-semibold">Rs. {invoice.total?.toLocaleString()}</span>
                  </div>
                  {invoice.status !== 'paid' && (
                    <Link
                      to="/dashboard/client/payment"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors flex items-center justify-center"
                    >
                      Pay Now
                    </Link>
                  )}
                </div>
              ))}
            </div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Invoice</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Project</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Issue Date</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Due Date</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Status</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setShowDetailModal(invoice)}
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-mono font-medium text-white">{invoice.invoiceNumber}</span>
                      </td>
                      <td className="py-4 px-6 min-w-[200px] max-w-[280px]">
                        <p className="text-white font-medium line-clamp-2">{invoice.contract?.projectTitle || 'Project Invoice'}</p>
                        <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">{invoice.lineItems?.length || 0} item(s)</p>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-gray-400 text-sm">{formatDate(invoice.createdAt)}</span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`text-sm ${invoice.status === 'overdue' ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                          {formatDate(invoice.dueDate)}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-white font-semibold">Rs. {invoice.total?.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border whitespace-nowrap ${getStatusColor(invoice.status)}`}>
                          {invoice.status === 'paid' && (
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {invoice.status === 'overdue' && (
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                            </svg>
                          )}
                          {invoice.status === 'sent' && (
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                            </svg>
                          )}
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDetailModal(invoice);
                            }}
                            className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          {invoice.status !== 'paid' && (
                            <Link
                              to="/dashboard/client/payment"
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors whitespace-nowrap"
                            >
                              Pay
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f14] rounded-2xl max-w-2xl w-full border border-zinc-700/50 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-700/50 flex items-center justify-between sticky top-0 bg-[#0f0f14]">
              <h2 className="text-xl font-bold text-white">Invoice {showDetailModal.invoiceNumber}</h2>
              <button
                onClick={() => setShowDetailModal(null)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${getStatusColor(showDetailModal.status)}`}>
                  {showDetailModal.status.charAt(0).toUpperCase() + showDetailModal.status.slice(1)}
                </span>
                <p className="text-sm text-zinc-400">
                  Issued: {formatDate(showDetailModal.createdAt)}
                </p>
              </div>

              {/* Due Date Alert */}
              {showDetailModal.status === 'overdue' && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-red-400 font-medium">This invoice is overdue. Please make payment as soon as possible.</p>
                  </div>
                </div>
              )}

              {/* Invoice Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Project</p>
                  <p className="font-medium text-white">{showDetailModal.contract?.projectTitle || 'Project Invoice'}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Due Date</p>
                  <p className="font-medium text-white">{formatDate(showDetailModal.dueDate)}</p>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <p className="text-sm text-zinc-400 mb-3">Line Items</p>
                <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 overflow-hidden">
                  <table className="w-full">
                    <thead className="border-b border-zinc-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Rate</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-700/30">
                      {showDetailModal.lineItems?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-white">{item.description}</td>
                          <td className="px-4 py-3 text-right text-zinc-400">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-zinc-400">Rs. {item.unitPrice?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-white font-medium">Rs. {item.amount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>Rs. {showDetailModal.subtotal?.toLocaleString()}</span>
                  </div>
                  {showDetailModal.taxAmount > 0 && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Tax ({showDetailModal.taxRate}%)</span>
                      <span>Rs. {showDetailModal.taxAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-zinc-700/50">
                    <span>Total</span>
                    <span>Rs. {showDetailModal.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {showDetailModal.notes && (
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Notes</p>
                  <p className="text-zinc-300">{showDetailModal.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-700/50">
                {showDetailModal.status === 'paid' ? (
                  <span className="px-5 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl font-medium">
                    Paid on {formatDate(showDetailModal.paidAt)}
                  </span>
                ) : (
                  <Link
                    to="/dashboard/client/payment"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                  >
                    Make Payment
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
