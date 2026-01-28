import { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  FaChartLine, FaUsers, FaFileInvoiceDollar, FaProjectDiagram,
  FaArrowUp, FaArrowDown, FaClock, FaCheckCircle, FaSpinner
} from 'react-icons/fa';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/analytics/dashboard');
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `NPR ${amount?.toLocaleString() || 0}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    );
  }

  const { summary, charts, recentOrders, pendingInvoices } = analytics;

  // Prepare pie chart data for order status
  const orderStatusData = Object.entries(charts.ordersByStatus || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-gray-500">Business insights and metrics overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <FaChartLine className="w-6 h-6 text-blue-400" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              parseFloat(summary.revenueGrowth) >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {parseFloat(summary.revenueGrowth) >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(parseFloat(summary.revenueGrowth))}%
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalRevenue)}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-xs text-gray-600 mt-1">
            This month: {formatCurrency(summary.thisMonthRevenue)}
          </p>
        </div>

        {/* Total Clients */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <FaUsers className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{summary.totalClients}</p>
          <p className="text-sm text-gray-500">Total Clients</p>
          <p className="text-xs text-gray-600 mt-1">
            {summary.totalDevelopers} developers
          </p>
        </div>

        {/* Active Contracts */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <FaProjectDiagram className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{summary.activeContracts}</p>
          <p className="text-sm text-gray-500">Active Contracts</p>
          <p className="text-xs text-gray-600 mt-1">
            {summary.totalContracts} total contracts
          </p>
        </div>

        {/* Conversion Rate */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <FaFileInvoiceDollar className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{summary.conversionRate}%</p>
          <p className="text-sm text-gray-500">Quote Conversion</p>
          <p className="text-xs text-gray-600 mt-1">
            {summary.paidInvoices}/{summary.totalInvoices} invoices paid
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenueByMonth}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Orders Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.ordersByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Orders by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Legend
                  wrapperStyle={{ color: '#fff' }}
                  formatter={(value) => <span className="text-gray-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Pending Invoices</h3>
          <div className="space-y-3">
            {pendingInvoices?.length > 0 ? (
              pendingInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      invoice.status === 'overdue' ? 'bg-red-500/20' : 'bg-amber-500/20'
                    }`}>
                      {invoice.status === 'overdue' ? (
                        <FaClock className="w-4 h-4 text-red-400" />
                      ) : (
                        <FaFileInvoiceDollar className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">{invoice.client?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(invoice.total)}</p>
                    <p className={`text-xs ${invoice.status === 'overdue' ? 'text-red-400' : 'text-gray-500'}`}>
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FaCheckCircle className="w-12 h-12 text-emerald-500/50 mx-auto mb-2" />
                <p className="text-gray-500">No pending invoices</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-3 text-left text-sm font-medium text-gray-400">Client</th>
                <th className="pb-3 text-left text-sm font-medium text-gray-400">Project</th>
                <th className="pb-3 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="pb-3 text-left text-sm font-medium text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders?.map((order) => (
                <tr key={order._id}>
                  <td className="py-3">
                    <p className="text-white">{order.clientName || order.client?.name}</p>
                    <p className="text-xs text-gray-500">{order.clientEmail || order.client?.email}</p>
                  </td>
                  <td className="py-3 text-gray-300">{order.title}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-lg ${
                      order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      order.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
