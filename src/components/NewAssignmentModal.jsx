import { useState } from 'react';
import { HiOutlineX, HiOutlineUpload, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import api from '../utils/api';
import {
    ACADEMIC_LEVELS,
    SUBJECTS,
    ASSIGNMENT_TYPES,
    CITATION_STYLES,
    URGENCY_OPTIONS,
} from '../utils/constants';

export default function NewAssignmentModal({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderId, setOrderId] = useState('');
    const [assignmentNumber, setAssignmentNumber] = useState('');
    const [files, setFiles] = useState([]);

    const [form, setForm] = useState({
        title: '',
        description: '',
        // Academic fields
        academicLevel: 'undergraduate',
        subject: '',
        assignmentType: '',
        wordCount: '',
        pageCount: '',
        citationStyle: 'none',
        requirements: '',
        // Deadline & urgency
        deadline: '',
        deadlineTime: '23:59',
        urgency: 'standard',
    });

    const resetForm = () => {
        setForm({
            title: '',
            description: '',
            academicLevel: 'undergraduate',
            subject: '',
            assignmentType: '',
            wordCount: '',
            pageCount: '',
            citationStyle: 'none',
            requirements: '',
            deadline: '',
            deadlineTime: '23:59',
            urgency: 'standard',
        });
        setFiles([]);
        setStep(1);
        setError('');
        setOrderId('');
        setAssignmentNumber('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles].slice(0, 5));
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Calculate urgency based on deadline
    const calculateUrgency = (deadlineDate) => {
        if (!deadlineDate) return 'standard';
        const now = new Date();
        const deadline = new Date(deadlineDate);
        const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        if (daysUntil <= 1) return 'rush';
        if (daysUntil <= 3) return 'urgent';
        if (daysUntil <= 7) return 'priority';
        return 'standard';
    };

    // Update urgency when deadline changes
    const handleDeadlineChange = (date) => {
        const urgency = calculateUrgency(date);
        setForm({ ...form, deadline: date, urgency });
    };

    const uploadFiles = async () => {
        if (files.length === 0) return [];

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            const response = await api.post('/upload/assignment-files', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.files || [];
        } catch (err) {
            console.error('File upload error:', err);
            throw new Error('Failed to upload files. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Upload files first if any
            let uploadedFiles = [];
            if (files.length > 0) {
                uploadedFiles = await uploadFiles();
            }

            // Combine date and time for deadline
            const deadlineDateTime = form.deadline && form.deadlineTime
                ? new Date(`${form.deadline}T${form.deadlineTime}`)
                : new Date(form.deadline);

            const payload = {
                title: form.title,
                description: form.description,
                academicLevel: form.academicLevel,
                subject: form.subject,
                assignmentType: form.assignmentType,
                wordCount: form.wordCount ? parseInt(form.wordCount) : undefined,
                pageCount: form.pageCount ? parseInt(form.pageCount) : undefined,
                citationStyle: form.citationStyle,
                requirements: form.requirements,
                deadline: deadlineDateTime,
                urgency: form.urgency,
                files: uploadedFiles,
                // Legacy field for compatibility
                service: form.assignmentType,
            };

            const response = await api.post('/orders', payload);
            setOrderId(response.data._id || response.data.order?._id);
            setAssignmentNumber(response.data.assignmentNumber || response.data.order?.assignmentNumber);
            setStep(4); // Success step
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Get days until deadline for display
    const getDaysUntilDeadline = () => {
        if (!form.deadline) return null;
        const now = new Date();
        const deadline = new Date(form.deadline);
        const days = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        return days;
    };

    const daysUntil = getDaysUntilDeadline();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f0f12] w-full max-w-2xl max-h-[90vh] rounded-2xl border border-zinc-800/50 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {step === 4 ? 'Assignment Submitted!' : 'New Assignment'}
                        </h2>
                        {step < 4 && (
                            <p className="text-sm text-zinc-500">Step {step} of 3</p>
                        )}
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Assignment Type & Details */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Assignment Type <span className="text-red-400">*</span></label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {ASSIGNMENT_TYPES.slice(0, 9).map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setForm({ ...form, assignmentType: opt.value })}
                                            className={`p-3 rounded-xl text-sm font-medium transition-all ${
                                                form.assignmentType === opt.value
                                                    ? 'bg-blue-500/20 border-2 border-blue-500/50 text-white'
                                                    : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Academic Level <span className="text-red-400">*</span></label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {ACADEMIC_LEVELS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setForm({ ...form, academicLevel: opt.value })}
                                            className={`p-3 rounded-xl text-sm font-medium transition-all ${
                                                form.academicLevel === opt.value
                                                    ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                                                    : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Subject <span className="text-red-400">*</span></label>
                                <select
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                                >
                                    <option value="">Select subject...</option>
                                    {SUBJECTS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Assignment Title <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                                    placeholder="e.g., Research Paper on Climate Change"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Requirements & Specifications */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Description <span className="text-red-400">*</span></label>
                                <textarea
                                    rows={4}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none"
                                    placeholder="Describe what the assignment is about..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Word Count <span className="text-zinc-500 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={form.wordCount}
                                        onChange={(e) => setForm({ ...form, wordCount: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                                        placeholder="e.g., 2500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Or Pages <span className="text-zinc-500 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={form.pageCount}
                                        onChange={(e) => setForm({ ...form, pageCount: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                                        placeholder="e.g., 10"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500 -mt-3">
                                Skip these for programming assignments or if unsure
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Citation Style <span className="text-zinc-500 font-normal">(optional)</span></label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {CITATION_STYLES.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setForm({ ...form, citationStyle: opt.value })}
                                            className={`p-2 rounded-lg text-xs font-medium transition-all ${
                                                form.citationStyle === opt.value
                                                    ? 'bg-emerald-500/20 border-2 border-emerald-500/50 text-white'
                                                    : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                            }`}
                                        >
                                            {opt.label.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Additional Requirements <span className="text-zinc-500 font-normal">(optional)</span></label>
                                <textarea
                                    rows={3}
                                    value={form.requirements}
                                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none"
                                    placeholder="Any specific instructions, rubric details, or professor requirements..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Reference Files <span className="text-zinc-500 font-normal">(optional)</span></label>
                                <div className="border-2 border-dashed border-zinc-700/50 rounded-xl p-4 text-center hover:border-blue-500/50 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="modal-file-upload"
                                        accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg,.ppt,.pptx,.xls,.xlsx"
                                    />
                                    <label htmlFor="modal-file-upload" className="cursor-pointer">
                                        <HiOutlineUpload className="w-6 h-6 text-zinc-500 mx-auto mb-1" />
                                        <p className="text-sm text-zinc-400">Click to upload (Max 5 files)</p>
                                    </label>
                                </div>
                                {files.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                                                <span className="text-sm text-white truncate">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="p-1 text-red-400 hover:text-red-300"
                                                >
                                                    <HiOutlineX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Deadline & Urgency */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Deadline <span className="text-red-400">*</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        value={form.deadline}
                                        onChange={(e) => handleDeadlineChange(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                                    />
                                    <input
                                        type="time"
                                        value={form.deadlineTime}
                                        onChange={(e) => setForm({ ...form, deadlineTime: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                {daysUntil !== null && (
                                    <div className={`mt-2 flex items-center gap-2 text-sm ${
                                        daysUntil <= 1 ? 'text-red-400' :
                                        daysUntil <= 3 ? 'text-orange-400' :
                                        daysUntil <= 7 ? 'text-amber-400' :
                                        'text-emerald-400'
                                    }`}>
                                        <HiOutlineClock className="w-4 h-4" />
                                        {daysUntil <= 0 ? 'Due today!' :
                                         daysUntil === 1 ? '1 day remaining' :
                                         `${daysUntil} days remaining`}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Urgency Level
                                    <span className="text-zinc-500 font-normal ml-2">(Auto-calculated based on deadline)</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {URGENCY_OPTIONS.map((opt) => (
                                        <div
                                            key={opt.value}
                                            className={`p-3 rounded-xl text-center transition-all ${
                                                form.urgency === opt.value
                                                    ? opt.value === 'rush' ? 'bg-red-500/20 border-2 border-red-500/50' :
                                                      opt.value === 'urgent' ? 'bg-orange-500/20 border-2 border-orange-500/50' :
                                                      opt.value === 'priority' ? 'bg-amber-500/20 border-2 border-amber-500/50' :
                                                      'bg-blue-500/20 border-2 border-blue-500/50'
                                                    : 'bg-zinc-800/30 border border-zinc-700/30 opacity-50'
                                            }`}
                                        >
                                            <p className="font-medium text-white text-sm">{opt.label}</p>
                                            <p className="text-xs text-zinc-500">{opt.label.includes('Rush') ? '< 24 hours' : opt.label.includes('Urgent') ? '1-3 days' : opt.label.includes('Priority') ? '3-7 days' : '7+ days'}</p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                                                opt.value === 'standard' ? 'bg-blue-500/20 text-blue-400' :
                                                opt.value === 'priority' ? 'bg-amber-500/20 text-amber-400' :
                                                opt.value === 'urgent' ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                                {opt.multiplier === 1 ? 'Base rate' : `+${(opt.multiplier - 1) * 100}%`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                                <h4 className="text-sm font-medium text-zinc-300 mb-3">Assignment Summary</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Type:</span>
                                        <span className="text-white">{ASSIGNMENT_TYPES.find(t => t.value === form.assignmentType)?.label || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Level:</span>
                                        <span className="text-white">{ACADEMIC_LEVELS.find(l => l.value === form.academicLevel)?.label || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Subject:</span>
                                        <span className="text-white">{SUBJECTS.find(s => s.value === form.subject)?.label || '-'}</span>
                                    </div>
                                    {(form.wordCount || form.pageCount) && (
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Length:</span>
                                            <span className="text-white">
                                                {form.wordCount ? `${form.wordCount} words` : `${form.pageCount} pages`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <p className="text-sm text-blue-300">
                                    We'll review your requirements and send a quote within 2-4 hours. You can discuss details via WhatsApp.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiOutlineCheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-zinc-400 mb-6">
                                We'll review and send you a quote within 2-4 hours.
                            </p>
                            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 mb-6">
                                <p className="text-xs text-zinc-500 mb-1">Assignment ID</p>
                                <p className="text-lg font-mono font-bold text-blue-400">{assignmentNumber || orderId}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors"
                                >
                                    Done
                                </button>
                                <a
                                    href={`https://wa.me/97798662291003?text=Hi! I submitted assignment ${assignmentNumber || orderId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3 bg-green-500/20 text-green-400 rounded-xl font-medium hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaWhatsapp /> WhatsApp
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step < 4 && (
                    <div className="p-5 border-t border-zinc-800/50 flex gap-3">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors"
                            >
                                Back
                            </button>
                        )}
                        {step === 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={!form.assignmentType || !form.subject || !form.title}
                                className="flex-1 py-3 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                            >
                                Continue
                            </button>
                        ) : step === 2 ? (
                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                disabled={!form.description}
                                className="flex-1 py-3 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !form.deadline}
                                className="flex-1 py-3 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                            >
                                {loading ? 'Submitting...' : 'Submit Assignment'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
