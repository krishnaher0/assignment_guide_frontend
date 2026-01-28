import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaPaperPlane,
  FaArrowLeft,
  FaInfoCircle,
  FaCode,
  FaPaintBrush,
  FaVial,
  FaServer,
  FaComments,
  FaTools,
  FaBook,
  FaEllipsisH
} from 'react-icons/fa';

const CATEGORIES = [
  { value: 'development', label: 'Development', icon: FaCode, color: 'blue' },
  { value: 'design', label: 'Design', icon: FaPaintBrush, color: 'pink' },
  { value: 'testing', label: 'Testing', icon: FaVial, color: 'green' },
  { value: 'deployment', label: 'Deployment', icon: FaServer, color: 'purple' },
  { value: 'consultation', label: 'Consultation', icon: FaComments, color: 'amber' },
  { value: 'maintenance', label: 'Maintenance', icon: FaTools, color: 'orange' },
  { value: 'documentation', label: 'Documentation', icon: FaBook, color: 'cyan' },
  { value: 'other', label: 'Other', icon: FaEllipsisH, color: 'gray' },
];

const UNITS = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'modules', label: 'Modules' },
  { value: 'features', label: 'Features' },
  { value: 'pages', label: 'Pages' },
];

export default function AdminQuoteBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Quote form state
  const [formData, setFormData] = useState({
    orderId: orderId || '',
    projectTitle: '',
    projectSummary: '',
    lineItems: [
      { category: 'development', description: '', quantity: 1, unit: 'fixed', unitPrice: 0, amount: 0 }
    ],
    deliverables: [{ title: '', description: '', estimatedDelivery: '' }],
    estimatedDuration: { value: 7, unit: 'days' },
    discountType: 'none',
    discountValue: 0,
    taxRate: 0,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: {
      type: 'milestone',
      milestones: [
        { title: 'Project Start', description: 'Initial payment upon project acceptance', percentage: 50, amount: 0, dueDescription: 'Upon project start' },
        { title: 'Final Delivery', description: 'Remaining payment upon completion', percentage: 50, amount: 0, dueDescription: 'Upon final delivery' },
      ],
      notes: ''
    },
    termsAndConditions: {
      revisionPolicy: 'Up to 2 rounds of revisions included. Additional revisions charged at standard hourly rate.',
      paymentPolicy: 'Payment due within 7 days of invoice. Late payments may incur additional charges.',
      cancellationPolicy: 'Cancellation after project start will be charged for work completed plus 20% of remaining project value.',
      intellectualProperty: 'Full intellectual property rights transfer to client upon complete payment.',
      confidentiality: 'All project details and deliverables are treated as confidential.',
      additionalTerms: ''
    },
    clientNotes: '',
    internalNotes: ''
  });

  useEffect(() => {
    fetchPendingOrders();
    if (id) {
      fetchQuote();
    } else if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [id, orderId]);

  const fetchPendingOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      // Handle both array and wrapped response
      const ordersData = Array.isArray(data) ? data : (data?.orders || []);
      // Filter orders that can have quotes created
      // Include: pending, initialized, quoted (for revisions)
      // Exclude: orders with accepted quotes, completed, cancelled, delivered
      const eligibleOrders = ordersData.filter(o =>
        ['pending', 'initialized', 'quoted'].includes(o.status) && !o.acceptedQuote
      );
      setOrders(eligibleOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/quotes/${id}`);
      setFormData({
        orderId: data.order._id,
        projectTitle: data.projectTitle,
        projectSummary: data.projectSummary,
        lineItems: data.lineItems,
        deliverables: data.deliverables || [],
        estimatedDuration: data.estimatedDuration || { value: 7, unit: 'days' },
        discountType: data.discountType || 'none',
        discountValue: data.discountValue || 0,
        taxRate: data.taxRate || 0,
        validUntil: new Date(data.validUntil).toISOString().split('T')[0],
        paymentTerms: data.paymentTerms || { type: 'milestone', milestones: [] },
        termsAndConditions: data.termsAndConditions || {},
        clientNotes: data.clientNotes || '',
        internalNotes: data.internalNotes || ''
      });
      setSelectedOrder(data.order);
    } catch (error) {
      console.error('Error fetching quote:', error);
      alert('Failed to load quote');
      navigate('/admin/quotes');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (oid) => {
    try {
      const { data } = await api.get(`/orders/${oid}`);
      setSelectedOrder(data);
      setFormData(prev => ({
        ...prev,
        orderId: data._id,
        projectTitle: data.title,
        projectSummary: data.description
      }));
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const handleOrderSelect = (oid) => {
    const order = orders.find(o => o._id === oid);
    if (order) {
      setSelectedOrder(order);
      setFormData(prev => ({
        ...prev,
        orderId: order._id,
        projectTitle: order.title,
        projectSummary: order.description
      }));
    }
  };

  // Line Items
  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { category: 'development', description: '', quantity: 1, unit: 'fixed', unitPrice: 0, amount: 0 }]
    }));
  };

  const updateLineItem = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.lineItems];
      newItems[index][field] = value;

      // Recalculate amount
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
      }

      return { ...prev, lineItems: newItems };
    });
  };

  const removeLineItem = (index) => {
    if (formData.lineItems.length === 1) return;
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  // Deliverables
  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, { title: '', description: '', estimatedDelivery: '' }]
    }));
  };

  const updateDeliverable = (index, field, value) => {
    setFormData(prev => {
      const newDeliverables = [...prev.deliverables];
      newDeliverables[index][field] = value;
      return { ...prev, deliverables: newDeliverables };
    });
  };

  const removeDeliverable = (index) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  // Milestones
  const updateMilestone = (index, field, value) => {
    setFormData(prev => {
      const newMilestones = [...prev.paymentTerms.milestones];
      newMilestones[index][field] = value;

      // Recalculate amount based on percentage
      if (field === 'percentage') {
        const subtotal = calculateSubtotal();
        newMilestones[index].amount = (subtotal * value) / 100;
      }

      return {
        ...prev,
        paymentTerms: { ...prev.paymentTerms, milestones: newMilestones }
      };
    });
  };

  // Calculations
  const calculateSubtotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (formData.discountType === 'percentage') {
      return (subtotal * formData.discountValue) / 100;
    } else if (formData.discountType === 'fixed') {
      return formData.discountValue;
    }
    return 0;
  };

  const calculateTax = () => {
    const afterDiscount = calculateSubtotal() - calculateDiscount();
    return (afterDiscount * formData.taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  // Save & Send
  const handleSave = async (send = false) => {
    if (!formData.orderId) {
      alert('Please select an order');
      return;
    }

    // Filter out empty line items
    const validLineItems = formData.lineItems.filter(item => item.description && item.unitPrice > 0);
    if (validLineItems.length === 0) {
      alert('Please add at least one line item with description and price');
      return;
    }

    // Filter out empty deliverables
    const validDeliverables = formData.deliverables.filter(d => d.title && d.title.trim() !== '');

    // Filter and process milestones
    const validMilestones = formData.paymentTerms.milestones
      .filter(m => m.title && m.title.trim() !== '')
      .map(m => ({
        ...m,
        amount: m.amount || (calculateSubtotal() * (m.percentage || 0) / 100)
      }));

    send ? setSending(true) : setSaving(true);

    try {
      const payload = {
        ...formData,
        lineItems: validLineItems.map(item => ({
          ...item,
          amount: item.quantity * item.unitPrice
        })),
        deliverables: validDeliverables,
        paymentTerms: {
          ...formData.paymentTerms,
          milestones: validMilestones
        }
      };

      console.log('Sending payload:', payload);

      let quoteId = id;

      if (id) {
        await api.put(`/quotes/${id}`, payload);
      } else {
        const { data } = await api.post('/quotes', payload);
        quoteId = data.quote._id;
      }

      if (send && quoteId) {
        await api.post(`/quotes/${quoteId}/send`);
        alert('Quote sent to client successfully!');
      } else {
        alert('Quote saved as draft');
      }

      navigate('/admin/quotes');
    } catch (error) {
      console.error('Error saving quote:', error);
      alert(error.response?.data?.message || 'Failed to save quote');
    } finally {
      setSaving(false);
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/quotes')}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {id ? 'Edit Quote' : 'Create Quote'}
            </h1>
            <p className="text-gray-500">Build a professional proposal for your client</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving || sending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <FaSave className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || sending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
          >
            <FaPaperPlane className="w-4 h-4" />
            {sending ? 'Sending...' : 'Save & Send'}
          </button>
        </div>
      </div>

      {/* Order Selection */}
      {!id && !orderId && (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <label className="block text-sm font-medium text-gray-300 mb-3">Select Order *</label>
          {orders.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <p className="font-medium">No eligible orders found</p>
              <p className="text-sm mt-1 text-amber-400/70">
                Orders must have status "pending" or "initialized" and not have an accepted quote.
                Check the Tasks page to see all orders.
              </p>
            </div>
          ) : (
            <select
              value={formData.orderId}
              onChange={(e) => handleOrderSelect(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="" className="bg-[#0f0f14]">Select an order...</option>
              {orders.map(order => (
                <option key={order._id} value={order._id} className="bg-[#0f0f14]">
                  {order.title} - {order.clientName || order.client?.name || 'Unknown'} ({order.status})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Selected Order Info */}
      {selectedOrder && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">{selectedOrder.title}</p>
              <p className="text-sm text-gray-400">Client: {selectedOrder.clientName} ({selectedOrder.clientEmail})</p>
              <p className="text-sm text-gray-400">Budget: {selectedOrder.budget} | Deadline: {new Date(selectedOrder.deadline).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Project Details */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Project Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project Title *</label>
          <input
            type="text"
            value={formData.projectTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="e.g., E-commerce Website Development"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project Summary *</label>
          <textarea
            value={formData.projectSummary}
            onChange={(e) => setFormData(prev => ({ ...prev, projectSummary: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            placeholder="Brief description of the project scope..."
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Duration</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.estimatedDuration.value}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  estimatedDuration: { ...prev.estimatedDuration, value: parseInt(e.target.value) || 0 }
                }))}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                min="1"
              />
              <select
                value={formData.estimatedDuration.unit}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  estimatedDuration: { ...prev.estimatedDuration, unit: e.target.value }
                }))}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="days" className="bg-[#0f0f14]">Days</option>
                <option value="weeks" className="bg-[#0f0f14]">Weeks</option>
                <option value="months" className="bg-[#0f0f14]">Months</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Valid Until *</label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Pricing Breakdown</h2>
          <button
            onClick={addLineItem}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
          >
            <FaPlus className="w-3 h-3" />
            Add Item
          </button>
        </div>

        <div className="space-y-3">
          {formData.lineItems.map((item, index) => {
            const CategoryIcon = CATEGORIES.find(c => c.value === item.category)?.icon || FaCode;

            return (
              <div key={index} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Item {index + 1}</span>
                  </div>
                  {formData.lineItems.length > 1 && (
                    <button
                      onClick={() => removeLineItem(index)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Row 1: Category and Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Category</label>
                      <select
                        value={item.category}
                        onChange={(e) => updateLineItem(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value} className="bg-[#0f0f14]">{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="e.g., Frontend development with React"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  {/* Row 2: Quantity, Unit, Price, Total */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Unit</label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        {UNITS.map(u => (
                          <option key={u.value} value={u.value} className="bg-[#0f0f14]">{u.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Unit Price (Rs.)</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Amount</label>
                      <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <span className="text-emerald-400 font-medium">
                          Rs. {(item.quantity * item.unitPrice).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Discount & Tax */}
        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Discount</label>
            <div className="flex gap-2">
              <select
                value={formData.discountType}
                onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="none" className="bg-[#0f0f14]">No Discount</option>
                <option value="percentage" className="bg-[#0f0f14]">Percentage</option>
                <option value="fixed" className="bg-[#0f0f14]">Fixed Amount</option>
              </select>
              {formData.discountType !== 'none' && (
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  placeholder={formData.discountType === 'percentage' ? '%' : 'Rs.'}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tax Rate (%)</label>
            <input
              type="number"
              value={formData.taxRate}
              onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
              min="0"
              max="100"
              placeholder="0"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white">Rs. {calculateSubtotal().toLocaleString()}</span>
          </div>
          {calculateDiscount() > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Discount</span>
              <span className="text-emerald-400">-Rs. {calculateDiscount().toLocaleString()}</span>
            </div>
          )}
          {calculateTax() > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tax ({formData.taxRate}%)</span>
              <span className="text-white">Rs. {calculateTax().toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/5">
            <span className="text-white">Total</span>
            <span className="text-emerald-400">Rs. {calculateTotal().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Deliverables */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Deliverables</h2>
          <button
            onClick={addDeliverable}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
          >
            <FaPlus className="w-3 h-3" />
            Add Deliverable
          </button>
        </div>

        <div className="space-y-3">
          {formData.deliverables.map((deliverable, index) => (
            <div key={index} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">Deliverable {index + 1}</span>
                <button
                  onClick={() => removeDeliverable(index)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={deliverable.title}
                  onChange={(e) => updateDeliverable(index, 'title', e.target.value)}
                  placeholder="Title (e.g., Frontend Development)"
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <input
                  type="text"
                  value={deliverable.description}
                  onChange={(e) => updateDeliverable(index, 'description', e.target.value)}
                  placeholder="Description"
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <input
                  type="text"
                  value={deliverable.estimatedDelivery}
                  onChange={(e) => updateDeliverable(index, 'estimatedDelivery', e.target.value)}
                  placeholder="Timeline (e.g., Week 1-2)"
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Terms */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Payment Terms</h2>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Payment Structure</label>
          <select
            value={formData.paymentTerms.type}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              paymentTerms: { ...prev.paymentTerms, type: e.target.value }
            }))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="full_upfront" className="bg-[#0f0f14]">Full Payment Upfront</option>
            <option value="50_50" className="bg-[#0f0f14]">50% Upfront, 50% on Completion</option>
            <option value="milestone" className="bg-[#0f0f14]">Milestone Based</option>
            <option value="custom" className="bg-[#0f0f14]">Custom</option>
          </select>
        </div>

        {formData.paymentTerms.type === 'milestone' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">Define payment milestones:</p>
            {formData.paymentTerms.milestones.map((milestone, index) => (
              <div key={index} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 grid sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={milestone.title}
                  onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                  placeholder="Milestone Title"
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <input
                  type="number"
                  value={milestone.percentage}
                  onChange={(e) => updateMilestone(index, 'percentage', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  placeholder="Percentage"
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <input
                  type="text"
                  value={milestone.dueDescription}
                  onChange={(e) => updateMilestone(index, 'dueDescription', e.target.value)}
                  placeholder="When due (e.g., Upon start)"
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <div className="flex items-center justify-end text-white font-medium">
                  Rs. {((calculateTotal() * milestone.percentage) / 100).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Additional Payment Notes</label>
          <textarea
            value={formData.paymentTerms.notes}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              paymentTerms: { ...prev.paymentTerms, notes: e.target.value }
            }))}
            rows={2}
            placeholder="Any additional notes about payment..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Notes</h2>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Client Notes (Visible to client)</label>
          <textarea
            value={formData.clientNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, clientNotes: e.target.value }))}
            rows={3}
            placeholder="Add any notes for the client..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Internal Notes (Admin only)</label>
          <textarea
            value={formData.internalNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
            rows={2}
            placeholder="Internal notes, not visible to client..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() => navigate('/admin/quotes')}
          className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={saving || sending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          <FaSave className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving || sending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
        >
          <FaPaperPlane className="w-4 h-4" />
          {sending ? 'Sending...' : 'Save & Send to Client'}
        </button>
      </div>
    </div>
  );
}
