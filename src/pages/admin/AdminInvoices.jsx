import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [sendingId, setSendingId] = useState(null);
  const [markingPaidId, setMarkingPaidId] = useState(null);

  // Create invoice form state
  const [createForm, setCreateForm] = useState({
    contract: '',
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices');
      // API returns { invoices, stats }
      setInvoices(response.data?.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/invoices/stats');
      // Map the stats response to match our expected format
      setStats({
        total: response.data?.totalInvoices || 0,
        pendingAmount: response.data?.pendingRevenue || 0,
        paidAmount: response.data?.totalRevenue || 0,
        overdue: response.data?.overdueInvoices || 0,
      });
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await api.get('/contracts');
      // Handle both array and { contracts: [...] } response formats
      const contractsData = Array.isArray(response.data)
        ? response.data
        : (response.data?.contracts || []);
      // Filter to only signed/active contracts
      const availableContracts = contractsData.filter(
        c => ['signed', 'active'].includes(c.status)
      );
      setContracts(availableContracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setContracts([]);
    }
  };

  const handleOpenCreateModal = () => {
    fetchContracts();
    setShowCreateModal(true);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      // Find the selected contract to get its details
      const selectedContract = contracts.find(c => c._id === createForm.contract);

      // Create invoice payload with required fields
      const payload = {
        contractId: createForm.contract,
        dueDate: createForm.dueDate,
        notes: createForm.notes,
        title: selectedContract?.projectTitle || 'Project Invoice',
        lineItems: [{
          description: selectedContract?.projectTitle || 'Project Services',
          quantity: 1,
          unitPrice: selectedContract?.pricing?.totalAmount || 0,
        }],
      };

      await api.post('/invoices', payload);
      setShowCreateModal(false);
      setCreateForm({ contract: '', dueDate: '', notes: '' });
      fetchInvoices();
      fetchStats();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSendInvoice = async (invoice) => {
    if (!window.confirm(`Send invoice ${invoice.invoiceNumber} to ${invoice.client?.name || 'client'}?`)) {
      return;
    }
    setSendingId(invoice._id);
    try {
      await api.post(`/invoices/${invoice._id}/send`);
      fetchInvoices();
      alert('Invoice sent successfully!');
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice: ' + (error.response?.data?.message || error.message));
    } finally {
      setSendingId(null);
    }
  };

  const handleMarkPaid = async (invoice) => {
    if (!window.confirm(`Mark invoice ${invoice.invoiceNumber} as paid?`)) {
      return;
    }
    setMarkingPaidId(invoice._id);
    try {
      await api.post(`/invoices/${invoice._id}/mark-paid`);
      fetchInvoices();
      fetchStats();
      setShowDetailModal(null);
      alert('Invoice marked as paid!');
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Failed to mark as paid: ' + (error.response?.data?.message || error.message));
    } finally {
      setMarkingPaidId(null);
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/invoices/${invoice._id}`);
      fetchInvoices();
      fetchStats();
      setShowDetailModal(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice: ' + (error.response?.data?.message || error.message));
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
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-gray-500">Manage and track client invoices</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Invoice
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Invoices</p>
                <p className="text-2xl font-bold text-white">{stats.total || 0}</p>
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
                <p className="text-sm text-gray-400">Pending Amount</p>
                <p className="text-2xl font-bold text-white">Rs. {(stats.pendingAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Paid Amount</p>
                <p className="text-2xl font-bold text-white">Rs. {(stats.paidAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-white">{stats.overdue || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
        >
          <option value="all" className="bg-[#0f0f14]">All Invoices</option>
          <option value="draft" className="bg-[#0f0f14]">Draft</option>
          <option value="sent" className="bg-[#0f0f14]">Sent</option>
          <option value="paid" className="bg-[#0f0f14]">Paid</option>
          <option value="overdue" className="bg-[#0f0f14]">Overdue</option>
        </select>
        <button
          onClick={fetchInvoices}
          className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          title="Refresh"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Invoice #</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Client</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice._id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setShowDetailModal(invoice)}
                      className="font-mono font-medium text-white hover:text-blue-400 transition-colors"
                    >
                      {invoice.invoiceNumber}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white">{invoice.client?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{invoice.client?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">Rs. {invoice.total?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {invoice.status === 'draft' && (
                        <button
                          onClick={() => handleSendInvoice(invoice)}
                          disabled={sendingId === invoice._id}
                          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-medium transition-colors"
                        >
                          {sendingId === invoice._id ? 'Sending...' : 'Send'}
                        </button>
                      )}
                      {['draft', 'sent', 'overdue'].includes(invoice.status) && (
                        <button
                          onClick={() => handleMarkPaid(invoice)}
                          disabled={markingPaidId === invoice._id}
                          className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded font-medium transition-colors"
                        >
                          {markingPaidId === invoice._id ? '...' : 'Mark Paid'}
                        </button>
                      )}
                      <button
                        onClick={() => setShowDetailModal(invoice)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No invoices found. Create your first invoice to get started.
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-lg w-full border border-white/10">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create Invoice</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Select Contract
                </label>
                <select
                  value={createForm.contract}
                  onChange={(e) => setCreateForm({ ...createForm, contract: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                  required
                >
                  <option value="" className="bg-[#0f0f14]">Select a contract...</option>
                  {contracts.map((contract) => (
                    <option key={contract._id} value={contract._id} className="bg-[#0f0f14]">
                      {contract.projectTitle} - {contract.client?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                  rows={3}
                  placeholder="Any additional notes for the invoice..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0f0f14]">
              <h2 className="text-xl font-bold text-white">Invoice {showDetailModal.invoiceNumber}</h2>
              <button
                onClick={() => setShowDetailModal(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
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
                <p className="text-sm text-gray-400">
                  Created: {formatDate(showDetailModal.createdAt)}
                </p>
              </div>

              {/* Client Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Bill To</p>
                  <p className="font-medium text-white">{showDetailModal.client?.name}</p>
                  <p className="text-sm text-gray-500">{showDetailModal.client?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Due Date</p>
                  <p className="font-medium text-white">{formatDate(showDetailModal.dueDate)}</p>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <p className="text-sm text-gray-400 mb-3">Line Items</p>
                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Rate</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {showDetailModal.lineItems?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-white">{item.description}</td>
                          <td className="px-4 py-3 text-right text-gray-400">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-400">Rs. {item.unitPrice?.toLocaleString()}</td>
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
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>Rs. {showDetailModal.subtotal?.toLocaleString()}</span>
                  </div>
                  {showDetailModal.taxAmount > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Tax ({showDetailModal.taxRate}%)</span>
                      <span>Rs. {showDetailModal.taxAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>Rs. {showDetailModal.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {showDetailModal.notes && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <p className="text-gray-300">{showDetailModal.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                {showDetailModal.status === 'draft' && (
                  <>
                    <button
                      onClick={() => handleDeleteInvoice(showDetailModal)}
                      className="px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleSendInvoice(showDetailModal)}
                      disabled={sendingId === showDetailModal._id}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {sendingId === showDetailModal._id ? 'Sending...' : 'Send Invoice'}
                    </button>
                  </>
                )}
                {['draft', 'sent', 'overdue'].includes(showDetailModal.status) && (
                  <button
                    onClick={() => handleMarkPaid(showDetailModal)}
                    disabled={markingPaidId === showDetailModal._id}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {markingPaidId === showDetailModal._id ? 'Processing...' : 'Mark as Paid'}
                  </button>
                )}
                {showDetailModal.status === 'paid' && (
                  <span className="px-5 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl font-medium">
                    Paid on {formatDate(showDetailModal.paidAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
