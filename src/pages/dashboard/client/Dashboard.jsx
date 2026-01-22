import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { useAssignmentModal } from '../../../context/AssignmentModalContext';
import { HiPlus, HiOutlineCheckCircle, HiOutlineCurrencyRupee, HiOutlineChevronRight, HiOutlineExclamation } from 'react-icons/hi';
import DeadlineCountdown from '../../../components/DeadlineCountdown';

const urgencyLabels = {
    standard: { label: 'Standard', color: 'blue' },
    priority: { label: 'Priority', color: 'amber' },
    urgent: { label: 'Urgent', color: 'orange' },
    rush: { label: 'Rush', color: 'red' }
};

const statusConfig = {
    pending: { label: 'Pending Review', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    quoted: { label: 'Quote Ready', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    accepted: { label: 'Accepted', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    working: { label: 'In Progress', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
    review: { label: 'Under Review', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    delivered: { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    declined: { label: 'Declined', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function ClientDashboard() {
    const { openModal } = useAssignmentModal();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/customer/my-orders');
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (status) => {
        return statusConfig[status] || statusConfig.pending;
    };

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white">My Projects</h1>
                    <p className="text-sm md:text-base text-gray-500">Submit your projects and get them completed professionally</p>
                </div>
                <button
                    onClick={() => openModal(fetchOrders)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition w-full sm:w-auto"
                >
                    <HiPlus /> New Assignment
                </button>
            </div>

            {/* Projects - Mobile Cards & Desktop Table */}
            {orders.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.02] border border-white/5 text-center py-10 text-gray-500">
                    <p className="mb-3">No projects submitted yet.</p>
                    <p className="text-sm">Submit your first project and get it completed professionally!</p>
                </div>
            ) : (
                <>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {orders.map(order => {
                            const status = getStatus(order.status);
                            const handleClick = () => {
                                if (order.status === 'quoted' && order.quote) {
                                    const quoteId = typeof order.quote === 'object' ? order.quote._id : order.quote;
                                    navigate(`/dashboard/client/quotes/${quoteId}`);
                                } else {
                                    navigate(`/dashboard/client/orders/${order._id}`);
                                }
                            };
                            return (
                                <div
                                    key={order._id}
                                    onClick={handleClick}
                                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                                                {order.title?.charAt(0)?.toUpperCase() || 'P'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-white truncate">{order.title}</p>
                                                <p className="text-xs text-gray-500">{order.assignmentType || order.service}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-lg border shrink-0 ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    {['working', 'review'].includes(order.status) && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                                                    style={{ width: `${order.progress || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">{order.progress || 0}%</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-4">
                                            {order.quotedAmount ? (
                                                <span className="text-emerald-400 font-medium">
                                                    Rs. {order.quotedAmount.toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">Pending quote</span>
                                            )}
                                            {order.deadline && (
                                                <DeadlineCountdown deadline={order.deadline} size="sm" />
                                            )}
                                        </div>
                                        <HiOutlineChevronRight className="w-5 h-5 text-zinc-600" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="text-left py-4 px-5 text-sm font-medium text-gray-400">Project</th>
                                        <th className="text-left py-4 px-5 text-sm font-medium text-gray-400 whitespace-nowrap">Type</th>
                                        <th className="text-left py-4 px-5 text-sm font-medium text-gray-400 whitespace-nowrap">Status</th>
                                        <th className="text-left py-4 px-5 text-sm font-medium text-gray-400 whitespace-nowrap">Amount</th>
                                        <th className="text-left py-4 px-5 text-sm font-medium text-gray-400 whitespace-nowrap">Deadline</th>
                                        <th className="text-right py-4 px-5 text-sm font-medium text-gray-400 whitespace-nowrap">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => {
                                        const status = getStatus(order.status);
                                        const handleClick = () => {
                                            if (order.status === 'quoted' && order.quote) {
                                                const quoteId = typeof order.quote === 'object' ? order.quote._id : order.quote;
                                                navigate(`/dashboard/client/quotes/${quoteId}`);
                                            } else {
                                                navigate(`/dashboard/client/orders/${order._id}`);
                                            }
                                        };
                                        return (
                                            <tr
                                                key={order._id}
                                                onClick={handleClick}
                                                className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                                            >
                                                <td className="py-4 px-5 min-w-[200px] max-w-[280px]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                                                            {order.title?.charAt(0)?.toUpperCase() || 'P'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-white line-clamp-2">{order.title}</p>
                                                            {['working', 'review'].includes(order.status) && (
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                                                                            style={{ width: `${order.progress || 0}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">{order.progress || 0}%</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-400 text-sm">{order.assignmentType || order.service}</span>
                                                        {order.urgency && (
                                                            <span className={`px-1.5 py-0.5 rounded text-xs whitespace-nowrap ${
                                                                urgencyLabels[order.urgency]?.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                                                                urgencyLabels[order.urgency]?.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                                                                urgencyLabels[order.urgency]?.color === 'red' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-blue-500/20 text-blue-400'
                                                            }`}>
                                                                {urgencyLabels[order.urgency]?.label || order.urgency}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 text-xs rounded-lg border whitespace-nowrap ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 whitespace-nowrap">
                                                    {order.quotedAmount ? (
                                                        <span className="text-emerald-400 font-medium">
                                                            Rs. {order.quotedAmount.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">Pending</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-5 whitespace-nowrap">
                                                    {order.deadline ? (
                                                        <DeadlineCountdown deadline={order.deadline} size="sm" />
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">Not set</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-5 text-right whitespace-nowrap">
                                                    {order.status === 'quoted' ? (
                                                        <span className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-medium">
                                                            View Quote
                                                        </span>
                                                    ) : order.status === 'accepted' && order.paymentStatus !== 'paid' && order.paymentStatus !== 'verified' ? (
                                                        <span className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg font-medium inline-flex items-center gap-1">
                                                            <HiOutlineExclamation className="w-3 h-3" /> Pay Now
                                                        </span>
                                                    ) : order.status === 'delivered' ? (
                                                        <span className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg font-medium inline-flex items-center gap-1">
                                                            <HiOutlineCheckCircle className="w-3 h-3" /> Download
                                                        </span>
                                                    ) : (
                                                        <HiOutlineChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors inline-block" />
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
