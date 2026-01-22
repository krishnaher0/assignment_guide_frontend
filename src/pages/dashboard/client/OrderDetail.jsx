import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlineDocumentDownload,
    HiOutlineClock,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineRefresh,
    HiOutlineDocumentText,
    HiOutlineCurrencyRupee,
    HiOutlineCalendar,
    HiOutlineAcademicCap,
    HiOutlineBookOpen,
    HiOutlinePaperClip,
} from 'react-icons/hi';
import api from '../../../utils/api';
import DeadlineCountdown from '../../../components/DeadlineCountdown';
import {
    ACADEMIC_LEVELS,
    SUBJECTS,
    ASSIGNMENT_TYPES,
    CITATION_STYLES,
} from '../../../utils/constants';

export default function OrderDetail() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [revisionRequest, setRevisionRequest] = useState('');
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [declineReason, setDeclineReason] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/orders/${orderId}`);
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptQuote = async () => {
        setActionLoading('accept');
        try {
            await api.post(`/orders/${orderId}/accept-quote`);
            await fetchOrder();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to accept quote');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeclineQuote = async () => {
        setActionLoading('decline');
        try {
            await api.post(`/orders/${orderId}/decline-quote`, { reason: declineReason });
            setShowDeclineModal(false);
            await fetchOrder();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to decline quote');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRequestRevision = async () => {
        if (!revisionRequest.trim()) {
            alert('Please describe what needs to be revised');
            return;
        }
        setActionLoading('revision');
        try {
            await api.post(`/orders/${orderId}/revision`, { request: revisionRequest });
            setShowRevisionModal(false);
            setRevisionRequest('');
            await fetchOrder();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to request revision');
        } finally {
            setActionLoading(null);
        }
    };

    const getLabel = (value, options) => {
        const opt = options.find(o => o.value === value);
        return opt?.label || value;
    };

    const stages = [
        { key: 'pending', label: 'Submitted' },
        { key: 'quoted', label: 'Quoted' },
        { key: 'accepted', label: 'Accepted' },
        { key: 'working', label: 'In Progress' },
        { key: 'delivered', label: 'Delivered' },
    ];

    const getStageIndex = (status) => {
        if (status === 'review') return 3; // Same as working
        if (status === 'completed') return 4; // Same as delivered
        return stages.findIndex(s => s.key === status);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-500">Order not found</p>
                <button
                    onClick={() => navigate('/dashboard/client')}
                    className="mt-4 text-blue-400 hover:text-blue-300"
                >
                    Go back to dashboard
                </button>
            </div>
        );
    }

    const currentStage = getStageIndex(order.status);
    const progressPercent = Math.max(0, Math.min(100, ((currentStage + 1) / stages.length) * 100));

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/client')}
                    className="p-2.5 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-white truncate">{order.title}</h1>
                    <p className="text-sm text-zinc-500 font-mono">{order.assignmentNumber || `#${order._id.slice(-8)}`}</p>
                </div>
            </div>

            {/* Progress Card */}
            <div className="rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Progress</h2>
                    <span className="text-2xl font-bold text-white">{Math.round(progressPercent)}%</span>
                </div>

                {/* Progress Bar */}
                <div className="relative mb-8">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Stage Indicators */}
                <div className="flex justify-between">
                    {stages.map((stage, idx) => {
                        const isComplete = idx <= currentStage;
                        const isCurrent = idx === currentStage;
                        return (
                            <div key={stage.key} className="flex flex-col items-center">
                                <div className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all
                                    ${isComplete
                                        ? 'bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-white/5 text-zinc-600'
                                    }
                                    ${isCurrent ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-[#09090b]' : ''}
                                `}>
                                    {isComplete ? (
                                        <HiOutlineCheck className="w-5 h-5" />
                                    ) : (
                                        <span className="text-sm font-medium">{idx + 1}</span>
                                    )}
                                </div>
                                <span className={`text-xs font-medium ${isComplete ? 'text-white' : 'text-zinc-600'}`}>
                                    {stage.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Cards based on status */}
            {order.status === 'quoted' && (
                <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 border border-blue-500/20 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                                <HiOutlineCurrencyRupee className="w-7 h-7 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-400 mb-1">Quote Ready</p>
                                <p className="text-3xl font-bold text-white">
                                    Rs. {order.quotedAmount?.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAcceptQuote}
                                disabled={actionLoading === 'accept'}
                                className="flex-1 lg:flex-none px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                            >
                                <HiOutlineCheck className="w-5 h-5" />
                                {actionLoading === 'accept' ? 'Processing...' : 'Accept Quote'}
                            </button>
                            <button
                                onClick={() => setShowDeclineModal(true)}
                                className="px-6 py-3.5 bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-xl font-medium flex items-center justify-center gap-2 transition-all border border-white/10 hover:border-red-500/30"
                            >
                                <HiOutlineX className="w-5 h-5" />
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {order.status === 'accepted' && order.paymentStatus !== 'paid' && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                                <HiOutlineCurrencyRupee className="w-7 h-7 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-white">Payment Required</p>
                                <p className="text-sm text-zinc-400">
                                    {order.paymentStatus === 'pending_verification'
                                        ? 'Payment proof uploaded - awaiting verification'
                                        : `Complete payment of Rs. ${order.quotedAmount?.toLocaleString()} to start work`
                                    }
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/dashboard/client/payment?orderId=${orderId}`)}
                            className="px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                        >
                            <HiOutlineCurrencyRupee className="w-5 h-5" />
                            {order.paymentStatus === 'pending_verification' ? 'View Payment' : 'Make Payment'}
                        </button>
                    </div>
                </div>
            )}

            {order.status === 'delivered' && (
                <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 border border-emerald-500/20 p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <HiOutlineDocumentDownload className="w-7 h-7 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-white mb-1">Assignment Delivered!</p>
                            <p className="text-sm text-zinc-400">Your assignment is ready for download.</p>
                        </div>
                    </div>

                    {order.deliverables?.length > 0 ? (
                        <div className="grid gap-2 mb-4">
                            {order.deliverables.map((file, idx) => (
                                <a
                                    key={idx}
                                    href={file.fileUrl}
                                    download={file.fileName}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                        <HiOutlineDocumentText className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <span className="text-white flex-1 font-medium">{file.fileName}</span>
                                    <HiOutlineDocumentDownload className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-sm mb-4 p-4 bg-white/5 rounded-xl">
                            Deliverable files will appear here once uploaded.
                        </p>
                    )}

                    <button
                        onClick={() => setShowRevisionModal(true)}
                        disabled={order.revisionCount >= order.maxRevisions}
                        className="px-5 py-2.5 bg-white/5 hover:bg-blue-500/10 text-zinc-300 hover:text-blue-400 rounded-xl font-medium flex items-center gap-2 transition-all border border-white/10 hover:border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <HiOutlineRefresh className="w-5 h-5" />
                        Request Revision ({order.maxRevisions - (order.revisionCount || 0)} left)
                    </button>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Assignment Info */}
                    <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                            <HiOutlineAcademicCap className="w-5 h-5 text-blue-400" />
                            <h3 className="font-semibold text-white">Assignment Details</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-xs text-zinc-500 mb-1.5">Type</p>
                                    <p className="text-sm font-medium text-white">
                                        {getLabel(order.assignmentType, ASSIGNMENT_TYPES)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-xs text-zinc-500 mb-1.5">Level</p>
                                    <p className="text-sm font-medium text-white">
                                        {getLabel(order.academicLevel, ACADEMIC_LEVELS)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-xs text-zinc-500 mb-1.5">Subject</p>
                                    <p className="text-sm font-medium text-white">
                                        {getLabel(order.subject, SUBJECTS)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-xs text-zinc-500 mb-1.5">Citation Style</p>
                                    <p className="text-sm font-medium text-white">
                                        {getLabel(order.citationStyle, CITATION_STYLES)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-zinc-500 mb-2">Description</p>
                                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {order.description}
                                </p>
                            </div>

                            {order.requirements && (
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <p className="text-xs text-zinc-500 mb-2">Additional Requirements</p>
                                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {order.requirements}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attached Files */}
                    {order.files?.length > 0 && (
                        <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                                <HiOutlinePaperClip className="w-5 h-5 text-violet-400" />
                                <h3 className="font-semibold text-white">Attached Files</h3>
                                <span className="ml-auto text-xs text-zinc-500">{order.files.length} file(s)</span>
                            </div>
                            <div className="p-4">
                                <div className="grid gap-2">
                                    {order.files.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={file.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl transition-colors group"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                                <HiOutlineDocumentText className="w-4 h-4 text-violet-400" />
                                            </div>
                                            <span className="text-sm text-white flex-1 truncate">{file.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Summary */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                            <HiOutlineBookOpen className="w-5 h-5 text-emerald-400" />
                            <h3 className="font-semibold text-white">Summary</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                                <span className="text-sm text-zinc-400">Length</span>
                                <span className="text-sm font-semibold text-white">
                                    {order.wordCount ? `${order.wordCount} words` :
                                     order.pageCount ? `${order.pageCount} pages` : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                                <span className="text-sm text-zinc-400">Amount</span>
                                <span className="text-sm font-semibold text-emerald-400">
                                    {order.quotedAmount ? `Rs. ${order.quotedAmount.toLocaleString()}` : 'Pending'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                                <span className="text-sm text-zinc-400">Payment</span>
                                <span className={`text-sm font-semibold ${
                                    order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                    {order.paymentStatus === 'paid' ? 'Paid' :
                                     order.paymentStatus === 'pending_verification' ? 'Verifying' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Deadline Card */}
                    <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                            <HiOutlineCalendar className="w-5 h-5 text-orange-400" />
                            <h3 className="font-semibold text-white">Deadline</h3>
                            {order.deadline && (
                                <div className="ml-auto">
                                    <DeadlineCountdown deadline={order.deadline} size="sm" />
                                </div>
                            )}
                        </div>
                        <div className="p-6 text-center">
                            {order.deadline ? (
                                <p className="text-2xl font-bold text-white">
                                    {new Date(order.deadline).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            ) : (
                                <p className="text-zinc-500">Not set</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Decline Modal */}
            {showDeclineModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10 shadow-2xl">
                        <div className="p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold text-white">Decline Quote</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-zinc-400 mb-4">
                                Are you sure you want to decline this quote?
                            </p>
                            <textarea
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                placeholder="Reason for declining (optional)"
                                rows={3}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                            />
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeclineModal(false)}
                                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeclineQuote}
                                disabled={actionLoading === 'decline'}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                {actionLoading === 'decline' ? 'Processing...' : 'Decline'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Revision Modal */}
            {showRevisionModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10 shadow-2xl">
                        <div className="p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold text-white">Request Revision</h2>
                            <p className="text-sm text-zinc-500 mt-1">
                                {order.maxRevisions - (order.revisionCount || 0)} revision(s) remaining
                            </p>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={revisionRequest}
                                onChange={(e) => setRevisionRequest(e.target.value)}
                                placeholder="Please describe what needs to be changed..."
                                rows={5}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                            />
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowRevisionModal(false)}
                                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestRevision}
                                disabled={actionLoading === 'revision' || !revisionRequest.trim()}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                {actionLoading === 'revision' ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
