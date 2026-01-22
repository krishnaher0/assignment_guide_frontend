import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineChevronRight, HiOutlineCheckCircle, HiOutlineExclamation } from 'react-icons/hi';
import api from '../../../utils/api';
import { useAssignmentModal } from '../../../context/AssignmentModalContext';
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

export default function ClientTasks() {
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
            setOrders(data || []);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (status) => statusConfig[status] || statusConfig.pending;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Assignments</h1>
                    <p className="text-gray-500">Track the progress of your submitted assignments</p>
                </div>
                <button
                    onClick={() => openModal(fetchOrders)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                    <HiOutlinePlus className="w-5 h-5" /> New Assignment
                </button>
            </div>

            {/* Assignments Table */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                {orders.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p className="mb-3">No assignments submitted yet.</p>
                        <p className="text-sm">Submit your first assignment and get it completed professionally!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="text-left py-4 px-5 text-sm font-medium text-gray-400">Assignment</th>
                                    <th className="text-left py-4 px-5 text-sm font-medium text-gray-400">Type</th>
                                    <th className="text-left py-4 px-5 text-sm font-medium text-gray-400">Status</th>
                                    <th className="text-left py-4 px-5 text-sm font-medium text-gray-400">Amount</th>
                                    <th className="text-left py-4 px-5 text-sm font-medium text-gray-400">Deadline</th>
                                    <th className="text-right py-4 px-5 text-sm font-medium text-gray-400">Action</th>
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
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                                                        {order.title?.charAt(0)?.toUpperCase() || 'A'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{order.title}</p>
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
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400 text-sm">{order.assignmentType || order.service}</span>
                                                    {order.urgency && (
                                                        <span className={`px-1.5 py-0.5 rounded text-xs ${
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
                                            <td className="py-4 px-5">
                                                <span className={`px-2.5 py-1 text-xs rounded-lg border ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5">
                                                {order.quotedAmount ? (
                                                    <span className="text-emerald-400 font-medium">
                                                        Rs. {order.quotedAmount.toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">Pending</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-5">
                                                {order.deadline ? (
                                                    <DeadlineCountdown deadline={order.deadline} size="sm" />
                                                ) : (
                                                    <span className="text-gray-500 text-sm">Not set</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-5 text-right">
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
                )}
            </div>
        </div>
    );
}
