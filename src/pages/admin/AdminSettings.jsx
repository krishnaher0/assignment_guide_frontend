import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { FaQrcode, FaSave, FaCheck, FaUpload, FaTimes } from 'react-icons/fa';
import { HiOutlineExternalLink } from 'react-icons/hi';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  // QR Settings
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState('');
  const [qrCodeEnabled, setQrCodeEnabled] = useState(false);
  const [qrPaymentInstructions, setQrPaymentInstructions] = useState('');
  const [uploadingQR, setUploadingQR] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings/qr-code');
      setQrCodeUrl(data.qrCodeUrl || '');
      setQrCodePreview(data.qrCodeUrl || '');
      setQrCodeEnabled(data.qrCodeEnabled || false);
      setQrPaymentInstructions(data.qrPaymentInstructions || '');
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQRFileSelect = (e) => {
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
      setQrCodeFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadQR = async () => {
    if (!qrCodeFile) {
      alert('Please select a file to upload');
      return;
    }

    setUploadingQR(true);
    try {
      const formData = new FormData();
      formData.append('file', qrCodeFile);

      const response = await api.post('/settings/qr-code/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setQrCodeUrl(response.data.qrCodeUrl);
      setQrCodeFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading QR:', error);
      alert('Failed to upload QR code: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingQR(false);
    }
  };

  const handleClearQRPreview = () => {
    setQrCodePreview('');
    setQrCodeUrl('');
    setQrCodeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveQRSettings = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put('/settings/qr-code', {
        qrCodeUrl,
        qrCodeEnabled,
        qrPaymentInstructions,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500">Configure system settings</p>
      </div>

      {/* QR Code Settings */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <FaQrcode className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">QR Code Payment</h2>
            <p className="text-sm text-gray-500">Configure fallback QR payment option</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <p className="font-medium text-white">Enable QR Payment</p>
              <p className="text-sm text-gray-500">Show QR payment option to clients as fallback</p>
            </div>
            <button
              onClick={() => setQrCodeEnabled(!qrCodeEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${qrCodeEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${qrCodeEnabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {/* QR Code Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Upload QR Code Image
            </label>
            
            {!qrCodePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-8 border-2 border-dashed border-blue-500/50 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
              >
                <FaUpload className="w-6 h-6 text-blue-400" />
                <p className="text-sm font-medium text-white">Click to upload QR code image</p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="w-32 h-32 rounded-lg bg-white p-2 flex-shrink-0 relative">
                  <img
                    src={qrCodePreview}
                    alt="QR Code Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white mb-2">QR Code Preview</p>
                  <p className="text-xs text-gray-500 mb-4">This is how the QR code will appear to clients</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingQR}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                    >
                      <FaUpload className="w-3 h-3" />
                      Change
                    </button>
                    {qrCodeFile && (
                      <button
                        onClick={handleUploadQR}
                        disabled={uploadingQR}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-medium"
                      >
                        {uploadingQR ? 'Uploading...' : 'Upload'}
                      </button>
                    )}
                    <button
                      onClick={handleClearQRPreview}
                      disabled={uploadingQR}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      <FaTimes className="w-3 h-3" />
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleQRFileSelect}
              className="hidden"
            />
            
            <p className="text-xs text-gray-500 mt-2">
              Upload your payment QR code image directly. Make sure the QR code is clear and scannable.
            </p>
          </div>

          {/* QR Code URL Option */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Or Paste QR Code URL
            </label>
            <input
              type="text"
              value={qrCodeUrl}
              onChange={(e) => setQrCodeUrl(e.target.value)}
              placeholder="https://example.com/your-qr-code.png"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Alternatively, upload to a hosting service (Google Drive, Imgur, etc.) and paste the direct link here
            </p>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Instructions
            </label>
            <textarea
              value={qrPaymentInstructions}
              onChange={(e) => setQrPaymentInstructions(e.target.value)}
              placeholder="Scan the QR code to make payment, then upload your payment screenshot below."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Instructions displayed to clients when using QR payment
            </p>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            {saved && (
              <span className="text-sm text-emerald-400 flex items-center gap-1">
                <FaCheck className="w-3 h-3" />
                Settings saved!
              </span>
            )}
            <button
              onClick={handleSaveQRSettings}
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-sm font-medium text-blue-300 mb-2">How QR Payment Works</h3>
        <ul className="text-xs text-blue-400/70 space-y-1 list-disc list-inside">
          <li>When enabled, clients will see a "QR Pay" option alongside eSewa</li>
          <li>Clients scan your QR code and make the payment via their banking app</li>
          <li>After payment, they upload a screenshot as proof</li>
          <li>You receive a notification to verify the payment</li>
          <li>Once verified, the task is marked as paid and deliverables are released</li>
        </ul>
      </div>
    </div>
  );
}
