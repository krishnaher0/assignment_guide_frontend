import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import {
  FaFileInvoiceDollar,
  FaCheck,
  FaTimes,
  FaComments,
  FaClock,
  FaCalendarAlt,
  FaCode,
  FaPaintBrush,
  FaVial,
  FaServer,
  FaTools,
  FaBook,
  FaEllipsisH,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const CATEGORY_ICONS = {
  development: FaCode,
  design: FaPaintBrush,
  testing: FaVial,
  deployment: FaServer,
  consultation: FaComments,
  maintenance: FaTools,
  documentation: FaBook,
  other: FaEllipsisH,
};

export default function QuoteView() {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(null); // 'accept' or 'reject'
  const [feedback, setFeedback] = useState('');
  const [negotiationNotes, setNegotiationNotes] = useState('');

  useEffect(() => {
    fetchQuote();
  }, [quoteId]);

  const fetchQuote = async () => {
    try {
      const { data } = await api.get(`/quotes/${quoteId}`);
      setQuote(data);
    } catch (error) {
      console.error('Error fetching quote:', error);
      alert('Failed to load quote');
      navigate('/dashboard/client');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading('accept');
    try {
      await api.post(`/quotes/${quoteId}/accept`, { feedback });
      alert('Quote accepted! Your project has been initialized.');
      navigate('/dashboard/client');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept quote');
    } finally {
      setActionLoading(null);
      setShowConfirmModal(null);
    }
  };

  const handleReject = async () => {
    setActionLoading('reject');
    try {
      await api.post(`/quotes/${quoteId}/reject`, { feedback });
      alert('Quote rejected.');
      navigate('/dashboard/client');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject quote');
    } finally {
      setActionLoading(null);
      setShowConfirmModal(null);
    }
  };

  const handleNegotiate = async () => {
    if (!negotiationNotes.trim()) {
      alert('Please provide your concerns or requested changes');
      return;
    }
    setActionLoading('negotiate');
    try {
      await api.post(`/quotes/${quoteId}/negotiate`, { notes: negotiationNotes });
      alert('Your feedback has been sent. We will review and respond shortly.');
      fetchQuote();
      setShowNegotiateModal(false);
      setNegotiationNotes('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setActionLoading(null);
    }
  };

  const isExpired = quote && new Date(quote.validUntil) < new Date() && quote.status === 'sent';
  const canRespond = quote && ['sent', 'viewed'].includes(quote.status) && !isExpired;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Quote not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/client/quotes')}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <FaFileInvoiceDollar className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">{quote.quoteNumber}</h1>
            {quote.version > 1 && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
                v{quote.version}
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">Professional Quote & Proposal</p>
        </div>
      </div>

      {/* Status Banner */}
      {quote.status === 'accepted' && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <FaCheckCircle className="w-6 h-6 text-emerald-400" />
          <div>
            <p className="font-medium text-emerald-400">Quote Accepted</p>
            <p className="text-sm text-gray-400">Your project has been initialized and is in progress.</p>
          </div>
        </div>
      )}

      {quote.status === 'rejected' && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <FaTimesCircle className="w-6 h-6 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Quote Rejected</p>
            <p className="text-sm text-gray-400">You declined this quote.</p>
          </div>
        </div>
      )}

      {quote.status === 'negotiating' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <FaExclamationTriangle className="w-6 h-6 text-amber-400" />
          <div>
            <p className="font-medium text-amber-400">Under Review</p>
            <p className="text-sm text-gray-400">Your feedback is being reviewed. A revised quote will be sent soon.</p>
          </div>
        </div>
      )}

      {isExpired && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3">
          <FaClock className="w-6 h-6 text-orange-400" />
          <div>
            <p className="font-medium text-orange-400">Quote Expired</p>
            <p className="text-sm text-gray-400">This quote has expired. Please contact us for a new quote.</p>
          </div>
        </div>
      )}

      {/* Quote Document */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
        {/* Quote Header */}
        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{quote.projectTitle}</h2>
              <p className="text-gray-400 text-sm max-w-lg">{quote.projectSummary}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Valid Until</p>
              <p className={`font-medium ${isExpired ? 'text-red-400' : 'text-white'}`}>
                {new Date(quote.validUntil).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Pricing Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-left text-sm font-medium text-gray-400">Description</th>
                  <th className="pb-3 text-center text-sm font-medium text-gray-400">Qty</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-400">Rate</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {quote.lineItems?.map((item, index) => {
                  const CategoryIcon = CATEGORY_ICONS[item.category] || FaCode;
                  return (
                    <tr key={index}>
                      <td className="py-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <CategoryIcon className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{item.description}</p>
                            <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center text-gray-400">
                        {item.quantity} {item.unit !== 'fixed' && item.unit}
                      </td>
                      <td className="py-4 text-right text-gray-400">
                        {quote.currency} {item.unitPrice?.toLocaleString()}
                      </td>
                      <td className="py-4 text-right font-medium text-white">
                        {quote.currency} {item.amount?.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">{quote.currency} {quote.subtotal?.toLocaleString()}</span>
            </div>
            {quote.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  Discount {quote.discountType === 'percentage' ? `(${quote.discountValue}%)` : ''}
                </span>
                <span className="text-emerald-400">-{quote.currency} {quote.discountAmount?.toLocaleString()}</span>
              </div>
            )}
            {quote.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tax ({quote.taxRate}%)</span>
                <span className="text-white">{quote.currency} {quote.taxAmount?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold pt-3 border-t border-white/10">
              <span className="text-white">Total</span>
              <span className="text-emerald-400">{quote.currency} {quote.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Deliverables */}
        {quote.deliverables?.length > 0 && (
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">What You'll Get</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {quote.deliverables.map((deliverable, index) => (
                <div key={index} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium text-white">{deliverable.title}</span>
                  </div>
                  {deliverable.description && (
                    <p className="text-sm text-gray-400 ml-6">{deliverable.description}</p>
                  )}
                  {deliverable.estimatedDelivery && (
                    <p className="text-xs text-blue-400 ml-6 mt-1">
                      <FaCalendarAlt className="w-3 h-3 inline mr-1" />
                      {deliverable.estimatedDelivery}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline & Payment */}
        <div className="p-6 border-b border-white/5 grid sm:grid-cols-2 gap-6">
          {/* Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Timeline</h3>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <FaClock className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium text-white">
                    {quote.estimatedDuration?.value} {quote.estimatedDuration?.unit}
                  </p>
                  <p className="text-sm text-gray-400">Estimated completion time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Payment Terms</h3>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="font-medium text-emerald-400 capitalize mb-2">
                {quote.paymentTerms?.type?.replace('_', ' ')}
              </p>
              {quote.paymentTerms?.milestones?.map((milestone, index) => (
                <div key={index} className="flex justify-between text-sm py-1">
                  <span className="text-gray-400">{milestone.title}</span>
                  <span className="text-white">{milestone.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Terms & Conditions</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-gray-300 mb-1">Revision Policy</p>
              <p className="text-gray-500">{quote.termsAndConditions?.revisionPolicy}</p>
            </div>
            <div>
              <p className="font-medium text-gray-300 mb-1">Payment Policy</p>
              <p className="text-gray-500">{quote.termsAndConditions?.paymentPolicy}</p>
            </div>
            <div>
              <p className="font-medium text-gray-300 mb-1">Cancellation Policy</p>
              <p className="text-gray-500">{quote.termsAndConditions?.cancellationPolicy}</p>
            </div>
            <div>
              <p className="font-medium text-gray-300 mb-1">Intellectual Property</p>
              <p className="text-gray-500">{quote.termsAndConditions?.intellectualProperty}</p>
            </div>
          </div>
        </div>

        {/* Client Notes */}
        {quote.clientNotes && (
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white mb-3">Additional Notes</h3>
            <p className="text-gray-400">{quote.clientNotes}</p>
          </div>
        )}

        {/* Action Buttons */}
        {canRespond && (
          <div className="p-6 bg-gradient-to-r from-blue-500/5 to-emerald-500/5">
            <p className="text-center text-gray-400 mb-4">
              Ready to proceed? Accept to start your project or request changes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setShowConfirmModal('accept')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold transition-all"
              >
                <FaCheck className="w-4 h-4" />
                Accept Quote
              </button>
              <button
                onClick={() => setShowNegotiateModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-xl font-semibold transition-colors"
              >
                <FaComments className="w-4 h-4" />
                Request Changes
              </button>
              <button
                onClick={() => setShowConfirmModal('reject')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl font-medium transition-colors"
              >
                <FaTimes className="w-4 h-4" />
                Decline
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">
                {showConfirmModal === 'accept' ? 'Accept Quote' : 'Decline Quote'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-300">
                {showConfirmModal === 'accept'
                  ? 'By accepting this quote, your project will be initialized and work will begin. You agree to the terms and payment schedule outlined above.'
                  : 'Are you sure you want to decline this quote? You can request a new quote at any time.'}
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {showConfirmModal === 'accept' ? 'Additional comments (optional)' : 'Reason for declining (optional)'}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  placeholder={showConfirmModal === 'accept' ? 'Any comments or special requests...' : 'Help us understand your decision...'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => { setShowConfirmModal(null); setFeedback(''); }}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={showConfirmModal === 'accept' ? handleAccept : handleReject}
                disabled={actionLoading}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 ${
                  showConfirmModal === 'accept'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {actionLoading ? 'Processing...' : showConfirmModal === 'accept' ? 'Confirm & Accept' : 'Decline Quote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Negotiate Modal */}
      {showNegotiateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Request Changes</h2>
              <p className="text-sm text-gray-500 mt-1">Let us know what adjustments you'd like</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Feedback *</label>
              <textarea
                value={negotiationNotes}
                onChange={(e) => setNegotiationNotes(e.target.value)}
                rows={5}
                placeholder="Please describe the changes you'd like to see in the quote. For example:
- Adjust the scope of work
- Different pricing structure
- Timeline concerns
- Additional features needed"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => { setShowNegotiateModal(false); setNegotiationNotes(''); }}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNegotiate}
                disabled={actionLoading || !negotiationNotes.trim()}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
