import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../utils/api";
import {
  HiOutlineUpload,
  HiOutlineX,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";

const serviceOptions = [
  {
    value: "web",
    label: "Web Development",
    description: "React, Vue, Angular, PHP, WordPress",
  },
  {
    value: "mobile",
    label: "Mobile App",
    description: "React Native, Flutter, iOS, Android",
  },
  {
    value: "backend",
    label: "Backend & API",
    description: "Node.js, Python, Django, Laravel",
  },
  {
    value: "database",
    label: "Database Design",
    description: "MySQL, MongoDB, PostgreSQL, Firebase",
  },
  {
    value: "algorithms",
    label: "Algorithms & DS",
    description: "Data structures, algorithms, complexity",
  },
  {
    value: "ml",
    label: "Machine Learning",
    description: "TensorFlow, PyTorch, scikit-learn",
  },
  {
    value: "docs",
    label: "Documentation",
    description: "Technical docs, reports, diagrams",
  },
  { value: "other", label: "Other", description: "Any other programming task" },
];

const urgencyOptions = [
  {
    value: "standard",
    label: "Standard",
    description: "5-10 days delivery",
    pricing: "Base rate",
    multiplier: 1.0,
    color: "blue",
  },
  {
    value: "priority",
    label: "Priority",
    description: "3-5 days delivery",
    pricing: "+25% premium",
    multiplier: 1.25,
    color: "amber",
  },
  {
    value: "urgent",
    label: "Urgent",
    description: "1-3 days delivery",
    pricing: "+50% premium",
    multiplier: 1.5,
    color: "orange",
  },
  {
    value: "rush",
    label: "Rush",
    description: "Within 24 hours",
    pricing: "+100% premium",
    multiplier: 2.0,
    color: "red",
  },
];

export default function NewAssignment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    service: "",
    description: "",
    requirements: "",
    deadline: "",
    urgency: "standard",
    techStack: "",
    referenceLinks: "",
  });

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const selectedUrgency = urgencyOptions.find(
        (u) => u.value === form.urgency
      );

      const payload = {
        title: form.title,
        description: form.description,
        service: form.service,
        deadline: form.deadline,
        urgency: form.urgency,
        requirements: form.requirements,
        techStack: form.techStack,
        referenceLinks: form.referenceLinks,
        pricingMultiplier: selectedUrgency?.multiplier || 1.0,
      };

      const response = await api.post("/orders", payload);
      setOrderId(response.data._id || response.data.order?._id);
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit assignment. Please try again."
      );
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedUrgency = urgencyOptions.find((u) => u.value === form.urgency);

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineCheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Assignment Submitted!
          </h1>
          <p className="text-zinc-400 mb-8">
            We'll review your requirements and send you a quote within 2-4
            hours.
          </p>

          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 mb-8">
            <p className="text-sm text-zinc-500 mb-2">Order ID</p>
            <p className="text-xl font-mono font-bold text-blue-400">
              {orderId}
            </p>
          </div>

          <div className="text-left p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 mb-8">
            <h3 className="font-semibold text-white mb-4">
              What happens next?
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="text-white font-medium">Review & Quote</p>
                  <p className="text-sm text-zinc-500">
                    We'll analyze your requirements and send a quote via
                    WhatsApp/Email.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-white font-medium">Developer Assignment</p>
                  <p className="text-sm text-zinc-500">
                    A qualified developer matching your tech stack will be
                    assigned.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-white font-medium">
                    Development & Updates
                  </p>
                  <p className="text-sm text-zinc-500">
                    Track progress with milestone notifications.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="text-white font-medium">Payment & Delivery</p>
                  <p className="text-sm text-zinc-500">
                    Make payment and receive completed work with documentation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/dashboard/client/tasks")}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
            >
              View My Assignments
            </button>
            <a
              href={`https://wa.me/9779866291003?text=Hi! I just submitted an assignment with Order ID: ${orderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-green-500/20 text-green-400 rounded-xl font-medium hover:bg-green-500/30 transition-colors border border-green-500/30 flex items-center justify-center gap-2"
            >
              <FaWhatsapp className="text-lg" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">New Assignment</h1>
        <p className="text-zinc-400">
          Tell us about your project. We'll review and send you a quote within
          2-4 hours.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Service Type */}
        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
              1
            </span>
            Service Type
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {serviceOptions.map((option) => (
              <label
                key={option.value}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  form.service === option.value
                    ? "bg-blue-500/20 border-2 border-blue-500/50"
                    : "bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800"
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  value={option.value}
                  checked={form.service === option.value}
                  onChange={(e) =>
                    setForm({ ...form, service: e.target.value })
                  }
                  className="hidden"
                  required
                />
                <p className="font-medium text-white">{option.label}</p>
                <p className="text-sm text-zinc-500">{option.description}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Project Details */}
        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
              2
            </span>
            Project Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                placeholder="e.g., E-commerce Website with Payment Integration"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none resize-none"
                placeholder="Describe your project in detail. What problem does it solve? What features do you need?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Specific Requirements
              </label>
              <textarea
                rows={3}
                value={form.requirements}
                onChange={(e) =>
                  setForm({ ...form, requirements: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none resize-none"
                placeholder="List specific features, functionalities, or requirements..."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Tech Stack (if any)
                </label>
                <input
                  type="text"
                  value={form.techStack}
                  onChange={(e) =>
                    setForm({ ...form, techStack: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                  placeholder="e.g., React, Node.js, MongoDB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Reference Links
                </label>
                <input
                  type="text"
                  value={form.referenceLinks}
                  onChange={(e) =>
                    setForm({ ...form, referenceLinks: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                  placeholder="Any example sites or designs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
              3
            </span>
            Attachments (Optional)
          </h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-zinc-700/50 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.zip,.rar,.png,.jpg,.jpeg"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <HiOutlineUpload className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">
                  Click to upload files
                </p>
                <p className="text-sm text-zinc-500">
                  PDF, DOC, ZIP, Images (Max 5 files)
                </p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm">{file.name}</span>
                      <span className="text-zinc-500 text-xs">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <HiOutlineX className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Urgency & Deadline */}
        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
              4
            </span>
            Urgency & Deadline
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">
                How urgent is this? *
              </label>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {urgencyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`p-4 rounded-xl cursor-pointer text-center transition-all ${
                      form.urgency === option.value
                        ? `bg-${option.color}-500/20 border-2 border-${option.color}-500/50`
                        : "bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800"
                    }`}
                    style={{
                      backgroundColor:
                        form.urgency === option.value
                          ? `var(--${option.color}-bg, rgba(59, 130, 246, 0.2))`
                          : undefined,
                      borderColor:
                        form.urgency === option.value
                          ? `var(--${option.color}-border, rgba(59, 130, 246, 0.5))`
                          : undefined,
                    }}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={option.value}
                      checked={form.urgency === option.value}
                      onChange={(e) =>
                        setForm({ ...form, urgency: e.target.value })
                      }
                      className="hidden"
                    />
                    <p className="font-medium text-white">{option.label}</p>
                    <p className="text-xs text-zinc-500 mb-2">
                      {option.description}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        option.value === "standard"
                          ? "bg-blue-500/20 text-blue-400"
                          : option.value === "priority"
                          ? "bg-amber-500/20 text-amber-400"
                          : option.value === "urgent"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {option.pricing}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Preferred Deadline *
              </label>
              <input
                type="date"
                required
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
              />
            </div>

            {/* Pricing Note */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300">
                <strong>Pricing:</strong> Based on your urgency selection (
                {selectedUrgency?.label}),
                {selectedUrgency?.value === "standard"
                  ? " standard rates apply."
                  : ` a ${selectedUrgency?.pricing} applies.`}{" "}
                We'll provide an exact quote after reviewing your requirements.
                You can always negotiate via WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 bg-blue-600 disabled:opacity-50 text-white rounded-xl font-semibold text-lg hover:bg-blue-500 transition-colors"
          >
            {loading ? "Submitting..." : "Submit Assignment"}
          </button>
          <a
            href="https://wa.me/9779866291003"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-4 bg-green-500/20 text-green-400 rounded-xl font-semibold text-lg hover:bg-green-500/30 transition-colors border border-green-500/30 text-center flex items-center justify-center gap-2"
          >
            <FaWhatsapp className="text-xl" />
            Or Chat on WhatsApp
          </a>
        </div>
      </form>
    </div>
  );
}
