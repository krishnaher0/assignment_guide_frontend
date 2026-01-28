import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import api from '../../utils/api';
import {
  FaFileContract,
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSpinner,
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClipboardList,
  FaFileAlt,
  FaExclamationTriangle,
  FaEdit,
  FaCheck,
  FaTimes,
  FaHistory,
  FaEye,
  FaDownload
} from 'react-icons/fa';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  pending_signature: { label: 'Awaiting Signature', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  completed: { label: 'Completed', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  terminated: { label: 'Terminated', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  expired: { label: 'Expired', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export default function AdminContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const contractRef = useRef(null);

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      const { data } = await api.get(`/contracts/${id}`);
      setContract(data);
    } catch (error) {
      console.error('Error fetching contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm('Mark this contract as completed?')) return;
    setActionLoading(true);
    try {
      await api.post(`/contracts/${id}/complete`);
      fetchContract();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete contract');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminate = async () => {
    if (!terminationReason.trim()) {
      alert('Please provide a reason for termination');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/contracts/${id}/terminate`, { reason: terminationReason });
      setShowTerminateModal(false);
      fetchContract();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to terminate contract');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAmendmentResponse = async (amendmentId, status) => {
    setActionLoading(true);
    try {
      await api.put(`/contracts/${id}/amendment/${amendmentId}`, { status });
      fetchContract();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to respond to amendment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!contractRef.current || !contract) return;

    setDownloadingPdf(true);
    try {
      const element = contractRef.current;

      // Clone the element to avoid modifying the original
      const clone = element.cloneNode(true);
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = element.offsetWidth + 'px';
      clone.style.backgroundColor = '#09090b';
      document.body.appendChild(clone);

      // Convert modern CSS colors to compatible formats
      const convertColors = (el) => {
        const computed = window.getComputedStyle(el);

        // Handle solid colors
        const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'];
        colorProps.forEach(prop => {
          const value = computed[prop];
          if (value && (value.includes('oklab') || value.includes('oklch') || value.includes('color('))) {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = 1;
              canvas.height = 1;
              const ctx = canvas.getContext('2d');
              ctx.fillStyle = value;
              ctx.fillRect(0, 0, 1, 1);
              const data = ctx.getImageData(0, 0, 1, 1).data;
              el.style[prop] = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
            } catch (e) {
              el.style[prop] = 'transparent';
            }
          }
        });

        // Handle gradients - remove them if they contain unsupported colors
        const bgImage = computed.backgroundImage;
        if (bgImage && bgImage !== 'none' && (bgImage.includes('oklab') || bgImage.includes('oklch') || bgImage.includes('color('))) {
          // Replace gradient with solid background color or transparent
          const bgColor = computed.backgroundColor;
          el.style.backgroundImage = 'none';
          if (!bgColor || bgColor === 'transparent' || bgColor.includes('oklab')) {
            el.style.backgroundColor = '#1a1a2e';
          }
        }

        Array.from(el.children).forEach(convertColors);
      };

      convertColors(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#09090b',
        logging: false,
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;

      const scaledImgHeight = imgHeight * ratio;
      const pageHeight = pdfHeight;
      let heightLeft = scaledImgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, scaledImgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - scaledImgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, scaledImgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${contract.contractNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const formatCurrency = (amount, currency = 'NPR') => {
    return `${currency} ${amount?.toLocaleString() || 0}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-12">
        <FaFileContract className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white">Contract not found</h3>
        <button
          onClick={() => navigate('/admin/contracts')}
          className="mt-4 text-blue-400 hover:underline"
        >
          Back to Contracts
        </button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.draft;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/contracts')}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{contract.contractNumber}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-lg border ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            {contract.version > 1 && (
              <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded">
                Version {contract.version}
              </span>
            )}
          </div>
          <p className="text-gray-400 mt-1">{contract.projectDetails?.title}</p>
        </div>

        {/* Actions */}
        {contract.status === 'active' && (
          <div className="flex gap-2">
            <button
              onClick={handleComplete}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              <FaCheckCircle className="w-4 h-4" />
              Mark Complete
            </button>
            <button
              onClick={() => setShowTerminateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg font-medium hover:bg-red-600/30"
            >
              <FaTimesCircle className="w-4 h-4" />
              Terminate
            </button>
          </div>
        )}
        <button
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg font-medium hover:bg-blue-600/30 disabled:opacity-50"
        >
          {downloadingPdf ? (
            <>
              <FaSpinner className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FaDownload className="w-4 h-4" />
              Download PDF
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" ref={contractRef}>
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parties */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaUser className="w-4 h-4 text-gray-400" />
                Parties
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Provider */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <FaBuilding className="w-3 h-3" /> Service Provider
                </h3>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="font-medium text-white">{contract.serviceProvider?.name}</p>
                  <p className="text-sm text-gray-400">{contract.serviceProvider?.email}</p>
                  <p className="text-sm text-gray-400">{contract.serviceProvider?.phone}</p>
                  {contract.providerSignature?.agreed && (
                    <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm">
                      <FaCheckCircle className="w-3 h-3" />
                      Signed on {formatDate(contract.providerSignature.signedAt)}
                    </div>
                  )}
                </div>
              </div>

              {/* Client */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <FaUser className="w-3 h-3" /> Client
                </h3>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="font-medium text-white">{contract.clientDetails?.name}</p>
                  <p className="text-sm text-gray-400">{contract.clientDetails?.email}</p>
                  <p className="text-sm text-gray-400">{contract.clientDetails?.phone || '-'}</p>
                  {contract.clientSignature?.agreed ? (
                    <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm">
                      <FaCheckCircle className="w-3 h-3" />
                      Signed on {formatDate(contract.clientSignature.signedAt)}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 text-amber-400 text-sm">
                      <FaClock className="w-3 h-3" />
                      Awaiting signature
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaClipboardList className="w-4 h-4 text-gray-400" />
                Project Details
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                <p className="text-white whitespace-pre-wrap">{contract.projectDetails?.description || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Scope</h3>
                <p className="text-white whitespace-pre-wrap">{contract.projectDetails?.scope || '-'}</p>
              </div>
              {contract.projectDetails?.deliverables?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Deliverables</h3>
                  <ul className="space-y-2">
                    {contract.projectDetails.deliverables.map((d, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-white">
                        <FaCheck className="w-3 h-3 text-emerald-400 mt-1 flex-shrink-0" />
                        <span>{d.title || d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Financial Terms */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaMoneyBillWave className="w-4 h-4 text-gray-400" />
                Financial Terms
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20">
                <span className="text-gray-400">Total Contract Value</span>
                <span className="text-2xl font-bold text-white">
                  {formatCurrency(contract.financialTerms?.totalAmount, contract.financialTerms?.currency)}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Payment Structure</h3>
                <p className="text-white capitalize">{contract.financialTerms?.paymentStructure?.replace('_', ' ') || 'Milestone'}</p>
              </div>

              {contract.financialTerms?.milestones?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Milestones</h3>
                  <div className="space-y-3">
                    {contract.financialTerms.milestones.map((m, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{m.title}</span>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            m.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                            m.status === 'invoiced' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{m.dueDescription}</p>
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <span className="text-gray-500">{m.percentage}%</span>
                          <span className="text-white font-medium">
                            {formatCurrency(m.amount, contract.financialTerms?.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaFileAlt className="w-4 h-4 text-gray-400" />
                Terms & Conditions
              </h2>
            </div>
            <div className="p-5 space-y-4 text-sm">
              {contract.terms?.revisionPolicy && (
                <div>
                  <h3 className="font-medium text-gray-400 mb-1">Revision Policy</h3>
                  <p className="text-white">{contract.terms.revisionPolicy}</p>
                </div>
              )}
              {contract.terms?.paymentTerms && (
                <div>
                  <h3 className="font-medium text-gray-400 mb-1">Payment Terms</h3>
                  <p className="text-white">{contract.terms.paymentTerms}</p>
                </div>
              )}
              {contract.terms?.intellectualProperty && (
                <div>
                  <h3 className="font-medium text-gray-400 mb-1">Intellectual Property</h3>
                  <p className="text-white">{contract.terms.intellectualProperty}</p>
                </div>
              )}
              {contract.terms?.confidentiality && (
                <div>
                  <h3 className="font-medium text-gray-400 mb-1">Confidentiality</h3>
                  <p className="text-white">{contract.terms.confidentiality}</p>
                </div>
              )}
              {contract.terms?.limitationOfLiability && (
                <div>
                  <h3 className="font-medium text-gray-400 mb-1">Limitation of Liability</h3>
                  <p className="text-white">{contract.terms.limitationOfLiability}</p>
                </div>
              )}
              {contract.terms?.disputeResolution && (
                <div>
                  <h3 className="font-medium text-gray-400 mb-1">Dispute Resolution</h3>
                  <p className="text-white">{contract.terms.disputeResolution}</p>
                </div>
              )}
            </div>
          </div>

          {/* Amendments */}
          {contract.amendments?.length > 0 && (
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FaEdit className="w-4 h-4 text-gray-400" />
                  Amendments ({contract.amendments.length})
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {contract.amendments.map((amendment) => (
                  <div key={amendment._id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">Amendment #{amendment.amendmentNumber}</span>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        amendment.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        amendment.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {amendment.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{amendment.description}</p>
                    <p className="text-xs text-gray-500">
                      Requested by {amendment.requestedBy?.name || 'Client'} on {formatDate(amendment.createdAt)}
                    </p>
                    {amendment.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleAmendmentResponse(amendment._id, 'approved')}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAmendmentResponse(amendment._id, 'rejected')}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-red-600/20 text-red-400 text-sm rounded-lg hover:bg-red-600/30 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                Timeline
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Effective Date</span>
                <span className="text-white">{formatDate(contract.timeline?.effectiveDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Est. Start</span>
                <span className="text-white">{formatDate(contract.timeline?.estimatedStartDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Est. Completion</span>
                <span className="text-white">{formatDate(contract.timeline?.estimatedCompletionDate)}</span>
              </div>
              {contract.timeline?.estimatedDuration && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white">
                    {contract.timeline.estimatedDuration.value} {contract.timeline.estimatedDuration.unit}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaHistory className="w-4 h-4 text-gray-400" />
                Activity
              </h2>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FaFileContract className="w-3 h-3 text-blue-400" />
                </div>
                <div>
                  <p className="text-white">Contract Created</p>
                  <p className="text-xs text-gray-500">{formatDate(contract.createdAt)}</p>
                </div>
              </div>
              {contract.sentAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <FaFileAlt className="w-3 h-3 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white">Sent to Client</p>
                    <p className="text-xs text-gray-500">{formatDate(contract.sentAt)}</p>
                  </div>
                </div>
              )}
              {contract.viewedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <FaEye className="w-3 h-3 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white">Viewed by Client</p>
                    <p className="text-xs text-gray-500">{formatDate(contract.viewedAt)}</p>
                  </div>
                </div>
              )}
              {contract.signedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <FaCheckCircle className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white">Client Signed</p>
                    <p className="text-xs text-gray-500">{formatDate(contract.signedAt)}</p>
                  </div>
                </div>
              )}
              {contract.activatedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <FaCheck className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white">Contract Activated</p>
                    <p className="text-xs text-gray-500">{formatDate(contract.activatedAt)}</p>
                  </div>
                </div>
              )}
              {contract.completedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <FaCheckCircle className="w-3 h-3 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white">Completed</p>
                    <p className="text-xs text-gray-500">{formatDate(contract.completedAt)}</p>
                  </div>
                </div>
              )}
              {contract.terminatedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <FaTimesCircle className="w-3 h-3 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white">Terminated</p>
                    <p className="text-xs text-gray-500">{formatDate(contract.terminatedAt)}</p>
                    <p className="text-xs text-red-400">{contract.terminationReason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Related</h2>
            </div>
            <div className="p-5 space-y-3">
              {contract.order && (
                <button
                  onClick={() => navigate(`/admin/tasks/${contract.order._id || contract.order}`)}
                  className="w-full p-3 text-left rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <p className="text-xs text-gray-500">Order</p>
                  <p className="text-white font-medium truncate">{contract.order.title || 'View Order'}</p>
                </button>
              )}
              {contract.quote && (
                <button
                  onClick={() => navigate(`/admin/quotes/${contract.quote._id || contract.quote}`)}
                  className="w-full p-3 text-left rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <p className="text-xs text-gray-500">Quote</p>
                  <p className="text-white font-medium">{contract.quote.quoteNumber || 'View Quote'}</p>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terminate Modal */}
      {showTerminateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaExclamationTriangle className="w-5 h-5 text-red-400" />
                Terminate Contract
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-400">
                Are you sure you want to terminate this contract? This action cannot be undone.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Termination *
                </label>
                <textarea
                  value={terminationReason}
                  onChange={(e) => setTerminationReason(e.target.value)}
                  rows={4}
                  placeholder="Provide the reason for termination..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => setShowTerminateModal(false)}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleTerminate}
                disabled={actionLoading}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Terminating...' : 'Terminate Contract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
