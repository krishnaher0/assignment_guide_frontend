import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamation, HiOutlineCreditCard, HiOutlineUpload, HiOutlineQrcode } from 'react-icons/hi';
import { FaCheckCircle, FaExclamationTriangle, FaLock, FaWallet, FaQrcode, FaTimes, FaDownload } from 'react-icons/fa';
import api from '../../../utils/api';

export default function ClientPayment() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [orders, setOrders] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [receipt, setReceipt] = useState(null);

    // QR Payment states
    const [qrSettings, setQrSettings] = useState(null);
    const [showQRPayment, setShowQRPayment] = useState(false);
    const [qrOrder, setQrOrder] = useState(null);
    const [paymentProofFile, setPaymentProofFile] = useState(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [qrSubmitting, setQrSubmitting] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);

    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const encodedResponse = searchParams.get('data');

    useEffect(() => {
        // Handle payment callback from eSewa
        if (status === 'success' && orderId) {
            // eSewa returns the encoded response as 'data' parameter
            const data = searchParams.get('data');
            console.log('eSewa Payment Callback - Status:', status, 'OrderId:', orderId, 'Data present:', !!data);
            handlePaymentCallback(data || '', orderId);
        } else if (status === 'failure' && orderId) {
            setPaymentStatus('failure');
        } else {
            fetchData();
        }
    }, [searchParams]);

    const fetchData = async () => {
        try {
            const [ordersRes, paymentsRes, qrRes] = await Promise.all([
                api.get('/orders/customer/my-orders'),
                api.get('/payment/history').catch(() => ({ data: [] })),
                api.get('/settings/qr-code').catch(() => ({ data: null }))
            ]);

            setOrders(ordersRes.data || []);
            setPayments(paymentsRes.data || []);
            console.log('QR Settings fetched:', qrRes.data);
            setQrSettings(qrRes.data);

            // If orderId in URL, select that order
            if (orderId) {
                const order = ordersRes.data.find(o => o._id === orderId);
                if (order) setSelectedOrder(order);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQRPayment = (order) => {
        setQrOrder(order);
        setShowQRPayment(true);
        setPaymentProofFile(null);
        setPaymentProofPreview('');
        setPaymentNotes('');
    };

    const handlePaymentProofFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            setPaymentProofFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentProofPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadProof = async () => {
        if (!paymentProofFile) {
            alert('Please select a screenshot to upload');
            return;
        }

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', paymentProofFile);

            const response = await api.post('/payment/upload-proof', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setPaymentProofPreview(response.data.url);
            setPaymentProofFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error uploading proof:', error);
            alert('Failed to upload screenshot: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploadingFile(false);
        }
    };

    const handleClearProofPreview = () => {
        setPaymentProofPreview('');
        setPaymentProofFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmitQRPayment = async () => {
        if (!paymentProofPreview) {
            alert('Please upload your payment screenshot');
            return;
        }

        setQrSubmitting(true);
        try {
            const response = await api.post('/payment/qr-submit', {
                orderId: qrOrder._id,
                paymentProofUrl: paymentProofPreview,
                notes: paymentNotes,
            });

            setShowQRPayment(false);
            setQrOrder(null);
            setPaymentStatus('qr-submitted');
            fetchData();
        } catch (error) {
            console.error('QR payment error:', error);
            alert('Failed to submit payment proof. Please try again.');
        } finally {
            setQrSubmitting(false);
        }
    };

    const handlePaymentCallback = async (encodedResponse, orderId) => {
        setLoading(true);
        try {
            const response = await api.post('/payment/verify', {
                encodedResponse,
                orderId,
            });

            if (response.status === 200) {
                setPaymentStatus('success');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentStatus('failure');
        } finally {
            setLoading(false);
            fetchData();
        }
    };

    const handleInitiatePayment = async (order) => {
        setPaymentLoading(true);
        try {
            const amount = order.quotedAmount || order.amount || parseFloat(String(order.budget || '0').replace(/[^0-9.-]+/g, '')) || 0;

            if (amount <= 0) {
                alert('Price not set yet. Please wait for admin to set the price.');
                return;
            }

            const res = await api.post('/payment/initiate', {
                orderId: order._id,
                amount: amount,
            });

            const { url, params } = res.data;

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = url;

            Object.keys(params).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = params[key];
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to initiate payment. Please try again.');
        } finally {
            setPaymentLoading(false);
        }
    };

    // Categorize orders
    // Pending payments: Orders that are accepted (quote accepted) but not yet paid
    const pendingPayments = orders.filter(o =>
        o.status === 'accepted' &&
        o.paymentStatus !== 'paid' &&
        o.paymentStatus !== 'pending_verification'
    );
    // Awaiting verification: Payment proof submitted, waiting for admin to verify
    const awaitingVerification = orders.filter(o =>
        o.paymentStatus === 'pending_verification'
    );
    // Paid orders: Verified/completed payments
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');

    // QR Payment Submitted screen
    if (paymentStatus === 'qr-submitted') {
        return (
            <div className="max-w-lg mx-auto text-center py-12">
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HiOutlineClock className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Payment Proof Submitted!</h2>
                <p className="text-zinc-400 mb-8">Your payment proof has been submitted and is awaiting verification. We'll notify you once it's verified.</p>
                <button
                    onClick={() => {
                        setPaymentStatus(null);
                        navigate('/dashboard/client/payment', { replace: true });
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                >
                    View Payment Status
                </button>
            </div>
        );
    }

    // Success/Failure screens for payment callback
    if (paymentStatus === 'success') {
        const handleDownloadReceipt = async () => {
            try {
                // Generate receipt
                const receiptResponse = await api.post('/payment/generate-receipt', {
                    orderId: selectedOrder?._id || orders.find(o => o.paymentStatus === 'verified')?._id,
                });

                const receiptData = receiptResponse.data.receipt;
                
                // Create receipt HTML
                const receiptHTML = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Payment Receipt</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                            .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; }
                            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
                            .logo { font-size: 24px; font-weight: bold; color: #007bff; margin-bottom: 10px; }
                            .receipt-id { color: #666; font-size: 12px; }
                            .section { margin-bottom: 25px; }
                            .section-title { font-weight: bold; color: #007bff; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                            .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                            .label { color: #666; }
                            .value { font-weight: bold; }
                            .amount-section { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
                            .total-amount { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; }
                            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
                        </style>
                    </head>
                    <body>
                        <div class="receipt-container">
                            <div class="header">
                                <div class="logo">ProjectHub</div>
                                <div>Payment Receipt</div>
                                <div class="receipt-id">#${receiptData.receiptId}</div>
                            </div>
                            
                            <div class="section">
                                <div class="section-title">Order Information</div>
                                <div class="row">
                                    <span class="label">Project:</span>
                                    <span class="value">${receiptData.order.title}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Order ID:</span>
                                    <span class="value">${receiptData.order.id}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Date:</span>
                                    <span class="value">${new Date(receiptData.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div class="section">
                                <div class="section-title">Client Information</div>
                                <div class="row">
                                    <span class="label">Name:</span>
                                    <span class="value">${receiptData.client.name || 'N/A'}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Email:</span>
                                    <span class="value">${receiptData.client.email || 'N/A'}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Phone:</span>
                                    <span class="value">${receiptData.client.phone || 'N/A'}</span>
                                </div>
                            </div>
                            
                            <div class="section">
                                <div class="section-title">Payment Details</div>
                                <div class="row">
                                    <span class="label">Payment Method:</span>
                                    <span class="value">${receiptData.payment.method}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Transaction ID:</span>
                                    <span class="value">${receiptData.payment.transactionId || 'N/A'}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Status:</span>
                                    <span class="value">${receiptData.payment.status}</span>
                                </div>
                            </div>
                            
                            <div class="amount-section">
                                <div class="row" style="margin-bottom: 10px;">
                                    <span class="label">Amount:</span>
                                    <span class="value">Rs. ${receiptData.order.amount?.toLocaleString() || '0'}</span>
                                </div>
                                <div class="total-amount">
                                    Rs. ${receiptData.order.amount?.toLocaleString() || '0'}
                                </div>
                            </div>
                            
                            <div class="footer">
                                <p>This is an automated receipt. Please keep it for your records.</p>
                                <p>Generated on: ${new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;

                // Download as PDF-like HTML
                const element = document.createElement('a');
                element.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(receiptHTML);
                element.download = `receipt-${receiptData.receiptId}.html`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            } catch (error) {
                console.error('Error downloading receipt:', error);
                alert('Failed to generate receipt');
            }
        };

        return (
            <div className="max-w-lg mx-auto text-center py-12">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaCheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Payment Successful!</h2>
                <p className="text-zinc-400 mb-8">Your payment has been processed successfully. Your receipt is ready for download.</p>
                <div className="flex gap-4 justify-center flex-col sm:flex-row">
                    <button
                        onClick={handleDownloadReceipt}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <FaDownload className="w-4 h-4" />
                        Download Receipt
                    </button>
                    <button
                        onClick={() => {
                            setPaymentStatus(null);
                            navigate('/dashboard/client/payment', { replace: true });
                        }}
                        className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors"
                    >
                        View Payment History
                    </button>
                </div>
            </div>
        );
    }

    if (paymentStatus === 'failure') {
        return (
            <div className="max-w-lg mx-auto text-center py-12">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaExclamationTriangle className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Payment Failed</h2>
                <p className="text-zinc-400 mb-8">Something went wrong. Please try again.</p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => {
                            setPaymentStatus(null);
                            navigate('/dashboard/client/payment', { replace: true });
                        }}
                        className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Payments</h1>
                <p className="text-sm md:text-base text-zinc-500">Manage your payments and view transaction history</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                <div className="p-4 md:p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <HiOutlineClock className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
                        </div>
                        <span className="text-zinc-400 text-xs md:text-sm">Pending</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white">{pendingPayments.length}</p>
                </div>

                <div className="p-4 md:p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <HiOutlineCheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                        </div>
                        <span className="text-zinc-400 text-xs md:text-sm">Completed</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white">{paidOrders.length}</p>
                </div>

                <div className="col-span-2 sm:col-span-1 p-4 md:p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <HiOutlineCreditCard className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                        </div>
                        <span className="text-zinc-400 text-xs md:text-sm">Total Spent</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white">
                        Rs. {paidOrders.reduce((sum, o) => sum + (o.quotedAmount || o.amount || 0), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Pending Payments - Table Design */}
            {pendingPayments.length > 0 && (
                <div className="bg-[#0f0f14] border border-amber-500/20 rounded-xl overflow-hidden">
                    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-amber-500/20 flex items-center justify-between bg-amber-500/5">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <FaExclamationTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" />
                            </div>
                            <h2 className="text-sm md:text-lg font-semibold text-amber-300">Pending Payments</h2>
                        </div>
                        <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-amber-500/20 text-amber-400 text-xs md:text-sm font-medium rounded-lg">
                            {pendingPayments.length}
                        </span>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-white/5">
                        {pendingPayments.map(order => {
                            const amount = order.quotedAmount || order.amount || parseFloat(String(order.budget || '0').replace(/[^0-9.-]+/g, '')) || 0;
                            return (
                                <div key={order._id} className="p-4">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <h3 className="font-medium text-white text-sm flex-1 min-w-0 line-clamp-2">{order.title}</h3>
                                        {amount > 0 ? (
                                            <span className="px-2 py-0.5 text-xs rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                                                Pay Now
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 text-xs rounded-lg bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 shrink-0">
                                                No Quote
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
                                        <span>{order.assignmentType || order.service || 'N/A'}</span>
                                        {amount > 0 && (
                                            <>
                                                <span>•</span>
                                                <span className="text-white font-semibold">Rs. {amount.toLocaleString()}</span>
                                            </>
                                        )}
                                    </div>
                                    {amount > 0 && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleInitiatePayment(order)}
                                                disabled={paymentLoading}
                                                className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                <FaWallet className="w-3.5 h-3.5 shrink-0" />
                                                eSewa
                                            </button>
                                            {qrSettings?.qrCodeEnabled && qrSettings?.qrCodeUrl && (
                                                <button
                                                    onClick={() => handleQRPayment(order)}
                                                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <FaQrcode className="w-3.5 h-3.5 shrink-0" />
                                                    QR Pay
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Project</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Service</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Accepted Date</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Amount</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Status</th>
                                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingPayments.map(order => {
                                    const amount = order.quotedAmount || order.amount || parseFloat(String(order.budget || '0').replace(/[^0-9.-]+/g, '')) || 0;
                                    return (
                                        <tr key={order._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 px-6 min-w-[200px] max-w-[280px]">
                                                <p className="text-white font-medium line-clamp-2">{order.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">#{order._id.slice(-8)}</p>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="text-gray-300">{order.assignmentType || order.service || 'N/A'}</span>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="text-gray-400 text-sm">
                                                    {new Date(order.acceptedAt || order.updatedAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="text-white font-semibold">
                                                    {amount > 0 ? `Rs. ${amount.toLocaleString()}` : '-'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                {amount > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30 whitespace-nowrap">
                                                        <HiOutlineClock className="w-3.5 h-3.5 shrink-0" />
                                                        Awaiting Payment
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-500/20 text-zinc-400 text-xs font-medium border border-zinc-500/30 whitespace-nowrap">
                                                        <HiOutlineClock className="w-3.5 h-3.5 shrink-0" />
                                                        Awaiting Quote
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                {amount > 0 ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleInitiatePayment(order)}
                                                            disabled={paymentLoading}
                                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                                                        >
                                                            <FaWallet className="w-3.5 h-3.5 shrink-0" />
                                                            eSewa
                                                        </button>
                                                        {qrSettings?.qrCodeEnabled && qrSettings?.qrCodeUrl && (
                                                            <button
                                                                onClick={() => handleQRPayment(order)}
                                                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                                                            >
                                                                <FaQrcode className="w-3.5 h-3.5 shrink-0" />
                                                                QR
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Awaiting Verification - Table Design */}
            {awaitingVerification.length > 0 && (
                <div className="bg-[#0f0f14] border border-blue-500/20 rounded-xl overflow-hidden">
                    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-blue-500/20 flex items-center justify-between bg-blue-500/5">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <HiOutlineClock className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" />
                            </div>
                            <h2 className="text-sm md:text-lg font-semibold text-blue-300">Awaiting Verification</h2>
                        </div>
                        <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-blue-500/20 text-blue-400 text-xs md:text-sm font-medium rounded-lg">
                            {awaitingVerification.length}
                        </span>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-white/5">
                        {awaitingVerification.map(order => (
                            <div key={order._id} className="p-4">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h3 className="font-medium text-white text-sm flex-1 min-w-0 line-clamp-2">{order.title}</h3>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/30 shrink-0">
                                        <div className="w-2 h-2 border border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                                        Verifying
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    <span className="inline-flex items-center gap-1">
                                        {order.paymentMethod === 'qr' ? <FaQrcode className="w-3 h-3 text-blue-400" /> : <FaWallet className="w-3 h-3 text-emerald-400" />}
                                        {order.paymentMethod === 'qr' ? 'QR' : 'eSewa'}
                                    </span>
                                    <span>•</span>
                                    <span className="text-white font-semibold">Rs. {(order.paidAmount || order.quotedAmount || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Project</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Payment Method</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Submitted Date</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Amount</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {awaitingVerification.map(order => (
                                    <tr key={order._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-6 min-w-[200px] max-w-[280px]">
                                            <p className="text-white font-medium line-clamp-2">{order.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">#{order._id.slice(-8)}</p>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 text-gray-300">
                                                {order.paymentMethod === 'qr' ? (
                                                    <>
                                                        <FaQrcode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                                        QR Payment
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaWallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                        eSewa
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="text-gray-400 text-sm">
                                                {new Date(order.qrPaymentSubmittedAt || order.paidAt || order.updatedAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="text-white font-semibold">
                                                Rs. {(order.paidAmount || order.quotedAmount || order.amount || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/30 whitespace-nowrap">
                                                <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin shrink-0"></div>
                                                Verifying
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payment History - Table Design */}
            <div className="bg-[#0f0f14] border border-white/5 rounded-xl overflow-hidden">
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <HiOutlineCheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" />
                        </div>
                        <h2 className="text-sm md:text-lg font-semibold text-white">Payment History</h2>
                    </div>
                    {paidOrders.length > 0 && (
                        <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-emerald-500/20 text-emerald-400 text-xs md:text-sm font-medium rounded-lg">
                            {paidOrders.length}
                        </span>
                    )}
                </div>

                {paidOrders.length === 0 ? (
                    <div className="text-center py-12 md:py-16">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <HiOutlineCreditCard className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-400 font-medium">No payment history yet</p>
                        <p className="text-sm text-gray-500 mt-1">Completed payments will appear here</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-white/5">
                            {paidOrders.map(order => (
                                <div key={order._id} className="p-4">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <h3 className="font-medium text-white text-sm flex-1 min-w-0 line-clamp-2">{order.title}</h3>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 shrink-0">
                                            <HiOutlineCheckCircle className="w-3 h-3" />
                                            Paid
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        <span className="text-white font-semibold">Rs. {(order.quotedAmount || order.amount || 0).toLocaleString()}</span>
                                        <span>•</span>
                                        <span>{new Date(order.paidAt || order.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Project</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Payment Date</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Amount</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 whitespace-nowrap">Transaction ID</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paidOrders.map(order => (
                                        <tr key={order._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 px-6 min-w-[200px] max-w-[280px]">
                                                <p className="text-white font-medium line-clamp-2">{order.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">{order.service || order.assignmentType || 'N/A'}</p>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="text-gray-400 text-sm">
                                                    {new Date(order.paidAt || order.updatedAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="text-white font-semibold">
                                                    Rs. {(order.quotedAmount || order.amount || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">
                                                    {order.transactionId || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 whitespace-nowrap">
                                                    <HiOutlineCheckCircle className="w-3.5 h-3.5 shrink-0" />
                                                    Paid
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Security Note */}
            <div className="p-3 md:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2 md:gap-3">
                <FaLock className="w-4 h-4 md:w-5 md:h-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs md:text-sm text-blue-300 font-medium">Secure Payments</p>
                    <p className="text-xs text-blue-400/70">All transactions are secured with eSewa's encrypted payment gateway.</p>
                </div>
            </div>

            {/* QR Payment Modal */}
            {showQRPayment && qrOrder && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-md w-full p-6 space-y-6 my-auto max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-white mb-2">Pay via QR Code</h2>
                            <p className="text-sm text-zinc-400">Scan the QR code below to make payment</p>
                        </div>

                        {/* Order Info */}
                        <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                            <p className="text-sm text-zinc-400 mb-1">Order</p>
                            <p className="font-medium text-white">{qrOrder.title}</p>
                            <p className="text-lg font-bold text-emerald-400 mt-2">
                                Rs. {(qrOrder.quotedAmount || qrOrder.amount || 0).toLocaleString()}
                            </p>
                        </div>

                        {/* QR Code */}
                        {/* QR Code */}
                        <div className="flex justify-center">
                            <div className="p-4 bg-white rounded-xl">
                                {qrSettings?.qrCodeUrl ? (
                                    <>
                                        <img
                                            src={qrSettings.qrCodeUrl}
                                            alt="Payment QR Code"
                                            className="w-48 h-48 object-contain"
                                            onError={(e) => {
                                                console.error('QR Code image failed to load from URL:', qrSettings.qrCodeUrl);
                                                e.target.style.display = 'none';
                                                if (e.target.nextSibling) {
                                                    e.target.nextSibling.style.display = 'flex';
                                                }
                                            }}
                                            onLoad={() => console.log('QR Code image loaded successfully from:', qrSettings.qrCodeUrl)}
                                        />
                                        <div style={{ display: 'none' }} className="w-48 h-48 flex items-center justify-center text-gray-500 text-sm text-center flex-col gap-2">
                                            <p>Failed to load QR code from:</p>
                                            <p className="text-xs break-all">{qrSettings.qrCodeUrl}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-48 h-48 flex items-center justify-center text-gray-500 text-sm text-center flex-col gap-2">
                                        <p>QR Code not configured</p>
                                        <p className="text-xs">Please ask admin to upload QR code</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-sm text-blue-300">
                                {qrSettings?.qrPaymentInstructions || 'Scan the QR code to make payment, then upload your payment screenshot below.'}
                            </p>
                        </div>

                        {/* Payment Proof Upload */}
                        <div className="space-y-3">
                            {!paymentProofPreview ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            Payment Screenshot - Upload File
                                        </label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full px-4 py-6 border-2 border-dashed border-blue-500/50 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
                                        >
                                            <HiOutlineUpload className="w-6 h-6 text-blue-400" />
                                            <p className="text-sm font-medium text-white">Click to upload screenshot</p>
                                            <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePaymentProofFileSelect}
                                            className="hidden"
                                        />
                                        <p className="text-xs text-zinc-500 mt-2">
                                            Upload a screenshot of your successful payment
                                        </p>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-zinc-700"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="px-2 bg-zinc-900 text-zinc-500">Or</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            Payment Screenshot - Paste URL
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentProofPreview}
                                            onChange={(e) => setPaymentProofPreview(e.target.value)}
                                            placeholder="Paste image URL from Google Drive, Imgur, etc."
                                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Upload your screenshot to a file sharing service and paste the link here
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-24 h-24 rounded-lg bg-zinc-800 p-1 shrink-0 flex items-center justify-center">
                                            <img
                                                src={paymentProofPreview}
                                                alt="Payment Proof Preview"
                                                className="w-full h-full object-contain rounded"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <div style={{ display: 'none' }} className="text-zinc-400 text-xs text-center">
                                                Invalid URL
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white mb-2">Preview</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploadingFile}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                                                >
                                                    <HiOutlineUpload className="w-3 h-3" />
                                                    Change
                                                </button>
                                                {paymentProofFile && (
                                                    <button
                                                        onClick={handleUploadProof}
                                                        disabled={uploadingFile}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-medium"
                                                    >
                                                        {uploadingFile ? 'Uploading...' : 'Upload'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={handleClearProofPreview}
                                                    disabled={uploadingFile}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                                                >
                                                    <FaTimes className="w-3 h-3" />
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePaymentProofFileSelect}
                                        className="hidden"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                    placeholder="Transaction ID, sender name, etc."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowQRPayment(false);
                                    setQrOrder(null);
                                }}
                                className="flex-1 px-4 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitQRPayment}
                                disabled={qrSubmitting || !paymentProofPreview}
                                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {qrSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <HiOutlineUpload className="w-4 h-4" />
                                        Submit Proof
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
