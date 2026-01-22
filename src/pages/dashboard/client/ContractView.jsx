import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import api from '../../../utils/api';
import {
  FaFileContract,
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSpinner,
  FaBuilding,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClipboardList,
  FaFileAlt,
  FaPen,
  FaCheck,
  FaEdit,
  FaExclamationTriangle,
  FaDownload,
  FaSignature
} from 'react-icons/fa';
import SignaturePad from '../../../components/SignaturePad';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  pending_signature: { label: 'Awaiting Your Signature', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  completed: { label: 'Completed', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  terminated: { label: 'Terminated', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  expired: { label: 'Expired', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export default function ContractView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signing, setSigning] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [amendmentForm, setAmendmentForm] = useState({ description: '', changes: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const contractRef = useRef(null);

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      setError('Invalid contract ID');
      setLoading(false);
      return;
    }
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      setError(null);
      const { data } = await api.get(`/contracts/${id}`);
      setContract(data);
    } catch (error) {
      console.error('Error fetching contract:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load contract';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!agreed) {
      alert('Please agree to the terms and conditions');
      return;
    }
    setSigning(true);
    try {
      await api.post(`/contracts/${id}/sign`, {
        agreed: true,
        signatureData: signatureData
      });
      setShowSignModal(false);
      setSignatureData(null);
      setAgreed(false);
      fetchContract();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to sign contract');
    } finally {
      setSigning(false);
    }
  };

  const handleSignatureCapture = (data) => {
    setSignatureData(data);
    setShowSignaturePad(false);
  };

  const handleRequestAmendment = async () => {
    if (!amendmentForm.description.trim()) {
      alert('Please describe the changes you want');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/contracts/${id}/amendment`, amendmentForm);
      setShowAmendmentModal(false);
      setAmendmentForm({ description: '', changes: '' });
      alert('Amendment request submitted');
      fetchContract();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit amendment');
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

      // Calculate how many pages we need
      const scaledImgHeight = imgHeight * ratio;
      const pageHeight = pdfHeight;
      let heightLeft = scaledImgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, scaledImgHeight);
      heightLeft -= pageHeight;

      // Add more pages if needed
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
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="text-center py-12">
        <FaFileContract className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white">
          {error === 'Access denied' ? 'Access Denied' : 'Contract Not Available'}
        </h3>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          {error === 'Access denied'
            ? 'You do not have permission to view this contract.'
            : error === 'Contract not found'
            ? 'This contract may have been removed or the link is invalid.'
            : error === 'Invalid contract ID'
            ? 'The contract link appears to be invalid.'
            : 'The contract you are looking for is not available. It may still be pending generation by our team.'}
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => navigate('/dashboard/client/contracts')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            View My Contracts
          </button>
          <button
            onClick={() => navigate('/dashboard/client')}
            className="px-5 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.draft;
  const canSign = contract.status === 'pending_signature';
  const canRequestAmendment = contract.status === 'active';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/client/contracts')}
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
          </div>
          <p className="text-gray-400 mt-1">{contract.projectDetails?.title}</p>
        </div>
      </div>

      {/* Sign Now Banner */}
      {canSign && (
        <div className="rounded-xl bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FaPen className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Ready to Sign</h3>
                <p className="text-sm text-blue-200/70">
                  Review the contract below and sign to proceed with the project
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSignModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors"
            >
              Sign Contract
            </button>
          </div>
        </div>
      )}

      {/* Contract Already Signed */}
      {contract.clientSignature?.agreed && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <FaCheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Contract Signed</h3>
              <p className="text-sm text-emerald-200/70">
                You signed this contract on {formatDate(contract.clientSignature.signedAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" ref={contractRef}>
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parties */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Parties to the Agreement</h2>
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
                      Signed
                    </div>
                  )}
                </div>
              </div>

              {/* Client (You) */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <FaUser className="w-3 h-3" /> Client (You)
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
                    <div className="mt-3 flex items-center gap-2 text-blue-400 text-sm">
                      <FaClock className="w-3 h-3" />
                      Awaiting your signature
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
                <h3 className="text-sm font-medium text-gray-400 mb-2">Project Title</h3>
                <p className="text-white font-medium">{contract.projectDetails?.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                <p className="text-white whitespace-pre-wrap">{contract.projectDetails?.description || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Scope of Work</h3>
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
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Contract Value</span>
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(contract.financialTerms?.totalAmount, contract.financialTerms?.currency)}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Payment Structure</h3>
                <p className="text-white capitalize">{contract.financialTerms?.paymentStructure?.replace('_', ' ') || 'Milestone'}</p>
              </div>

              {contract.financialTerms?.milestones?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Payment Milestones</h3>
                  <div className="space-y-3">
                    {contract.financialTerms.milestones.map((m, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{m.title}</span>
                          <span className="text-white font-medium">
                            {formatCurrency(m.amount, contract.financialTerms?.currency)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{m.dueDescription}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{m.percentage}% of total</span>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            m.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                            m.status === 'invoiced' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {contract.financialTerms?.paymentMethods?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Accepted Payment Methods</h3>
                  <div className="flex flex-wrap gap-2">
                    {contract.financialTerms.paymentMethods.map((method, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/5 text-white text-sm rounded-lg capitalize">
                        {method.replace('_', ' ')}
                      </span>
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
            <div className="p-5 space-y-6 text-sm">
              {contract.terms?.scopeOfWork && (
                <div>
                  <h3 className="font-semibold text-white mb-2">1. Scope of Work</h3>
                  <p className="text-gray-300">{contract.terms.scopeOfWork}</p>
                </div>
              )}
              {contract.terms?.changeRequests && (
                <div>
                  <h3 className="font-semibold text-white mb-2">2. Change Requests</h3>
                  <p className="text-gray-300">{contract.terms.changeRequests}</p>
                </div>
              )}
              {contract.terms?.revisionPolicy && (
                <div>
                  <h3 className="font-semibold text-white mb-2">3. Revision Policy</h3>
                  <p className="text-gray-300">{contract.terms.revisionPolicy}</p>
                </div>
              )}
              {contract.terms?.paymentTerms && (
                <div>
                  <h3 className="font-semibold text-white mb-2">4. Payment Terms</h3>
                  <p className="text-gray-300">{contract.terms.paymentTerms}</p>
                </div>
              )}
              {contract.terms?.lateFeePolicy && (
                <div>
                  <h3 className="font-semibold text-white mb-2">5. Late Fee Policy</h3>
                  <p className="text-gray-300">{contract.terms.lateFeePolicy}</p>
                </div>
              )}
              {contract.terms?.intellectualProperty && (
                <div>
                  <h3 className="font-semibold text-white mb-2">6. Intellectual Property</h3>
                  <p className="text-gray-300">{contract.terms.intellectualProperty}</p>
                </div>
              )}
              {contract.terms?.ownershipTransfer && (
                <div>
                  <h3 className="font-semibold text-white mb-2">7. Ownership Transfer</h3>
                  <p className="text-gray-300">{contract.terms.ownershipTransfer}</p>
                </div>
              )}
              {contract.terms?.confidentiality && (
                <div>
                  <h3 className="font-semibold text-white mb-2">8. Confidentiality</h3>
                  <p className="text-gray-300">{contract.terms.confidentiality}</p>
                </div>
              )}
              {contract.terms?.ndaClause && (
                <div>
                  <h3 className="font-semibold text-white mb-2">9. Non-Disclosure Agreement</h3>
                  <p className="text-gray-300">{contract.terms.ndaClause}</p>
                </div>
              )}
              {contract.terms?.limitationOfLiability && (
                <div>
                  <h3 className="font-semibold text-white mb-2">10. Limitation of Liability</h3>
                  <p className="text-gray-300">{contract.terms.limitationOfLiability}</p>
                </div>
              )}
              {contract.terms?.warranty && (
                <div>
                  <h3 className="font-semibold text-white mb-2">11. Warranty</h3>
                  <p className="text-gray-300">{contract.terms.warranty}</p>
                </div>
              )}
              {contract.terms?.terminationByClient && (
                <div>
                  <h3 className="font-semibold text-white mb-2">12. Termination by Client</h3>
                  <p className="text-gray-300">{contract.terms.terminationByClient}</p>
                </div>
              )}
              {contract.terms?.terminationByProvider && (
                <div>
                  <h3 className="font-semibold text-white mb-2">13. Termination by Provider</h3>
                  <p className="text-gray-300">{contract.terms.terminationByProvider}</p>
                </div>
              )}
              {contract.terms?.disputeResolution && (
                <div>
                  <h3 className="font-semibold text-white mb-2">14. Dispute Resolution</h3>
                  <p className="text-gray-300">{contract.terms.disputeResolution}</p>
                </div>
              )}
              {contract.terms?.governingLaw && (
                <div>
                  <h3 className="font-semibold text-white mb-2">15. Governing Law</h3>
                  <p className="text-gray-300">{contract.terms.governingLaw}</p>
                </div>
              )}
              {contract.terms?.forceMajeure && (
                <div>
                  <h3 className="font-semibold text-white mb-2">16. Force Majeure</h3>
                  <p className="text-gray-300">{contract.terms.forceMajeure}</p>
                </div>
              )}
              {contract.terms?.additionalTerms && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Additional Terms</h3>
                  <p className="text-gray-300">{contract.terms.additionalTerms}</p>
                </div>
              )}
            </div>
          </div>
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

          {/* Actions */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Actions</h2>
            </div>
            <div className="p-5 space-y-3">
              {canSign && (
                <button
                  onClick={() => setShowSignModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors"
                >
                  <FaPen className="w-4 h-4" />
                  Sign Contract
                </button>
              )}
              {canRequestAmendment && (
                <button
                  onClick={() => setShowAmendmentModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  <FaEdit className="w-4 h-4" />
                  Request Amendment
                </button>
              )}
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/20 text-blue-400 rounded-xl font-medium hover:bg-blue-600/30 transition-colors disabled:opacity-50"
              >
                {downloadingPdf ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FaDownload className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Amendments */}
          {contract.amendments?.length > 0 && (
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">
                  Amendments ({contract.amendments.length})
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {contract.amendments.map((amendment) => (
                  <div key={amendment._id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">
                        Amendment #{amendment.amendmentNumber}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        amendment.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        amendment.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {amendment.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{amendment.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-lg w-full border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaPen className="w-5 h-5 text-blue-400" />
                Sign Contract
              </h2>
              <p className="text-sm text-gray-400 mt-1">{contract.contractNumber}</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Project</span>
                  <span className="text-white">{contract.projectDetails?.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Value</span>
                  <span className="text-white font-medium">
                    {formatCurrency(contract.financialTerms?.totalAmount, contract.financialTerms?.currency)}
                  </span>
                </div>
              </div>

              {/* Digital Signature */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Digital Signature (Optional)</span>
                  {signatureData && (
                    <button
                      onClick={() => setSignatureData(null)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {showSignaturePad ? (
                  <SignaturePad
                    onSave={handleSignatureCapture}
                    onCancel={() => setShowSignaturePad(false)}
                  />
                ) : signatureData ? (
                  <div className="p-4 rounded-xl bg-white border border-white/10">
                    <img src={signatureData} alt="Your signature" className="max-h-20 mx-auto" />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSignaturePad(true)}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-gray-400 hover:text-blue-400"
                  >
                    <FaSignature className="w-5 h-5" />
                    <span>Draw Your Signature</span>
                  </button>
                )}
              </div>

              {/* Agreement Checkbox */}
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                  />
                  <span className="text-sm text-gray-300">
                    I have read, understood, and agree to all the terms and conditions outlined in this contract.
                    I acknowledge that this constitutes a legally binding agreement between myself and {contract.serviceProvider?.name}.
                  </span>
                </label>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <FaExclamationTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-200/80">
                  By signing this contract, you are entering into a legally binding agreement.
                  Please ensure you have reviewed all terms carefully before proceeding.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => { setShowSignModal(false); setShowSignaturePad(false); }}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSign}
                disabled={!agreed || signing}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signing ? 'Signing...' : 'Sign Contract'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amendment Request Modal */}
      {showAmendmentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaEdit className="w-5 h-5 text-blue-400" />
                Request Amendment
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description of Requested Changes *
                </label>
                <textarea
                  value={amendmentForm.description}
                  onChange={(e) => setAmendmentForm({ ...amendmentForm, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the changes you would like to request..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Changes
                </label>
                <textarea
                  value={amendmentForm.changes}
                  onChange={(e) => setAmendmentForm({ ...amendmentForm, changes: e.target.value })}
                  rows={2}
                  placeholder="Optional: Why are these changes needed?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => setShowAmendmentModal(false)}
                className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestAmendment}
                disabled={actionLoading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
