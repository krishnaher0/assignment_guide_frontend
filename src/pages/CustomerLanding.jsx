import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import {
  FaArrowRight,
  FaCheckCircle,
  FaShieldAlt,
  FaLightbulb,
  FaHeadset,
  FaStar,
  FaRocket,
  FaCode,
  FaGraduationCap,
  FaChevronDown,
  FaTerminal,
} from "react-icons/fa";

export default function CustomerLanding() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { info } = useToast();
  const [openFaq, setOpenFaq] = useState(null);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard/client", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGetHelp = () => {
    if (user) {
      navigate("/dashboard/client");
    } else {
      navigate("/auth/login");
    }
  };

  const benefits = [
    {
      icon: FaRocket,
      title: "Rapid Delivery",
      description:
        "Projects completed in hours, not days. Meet every deadline with confidence.",
    },
    {
      icon: FaShieldAlt,
      title: "Quality Assured",
      description:
        "Every deliverable undergoes rigorous review. Unlimited revisions included.",
    },
    {
      icon: FaLightbulb,
      title: "Learn While You Submit",
      description:
        "Comprehensive documentation explains the implementation approach.",
    },
    {
      icon: FaHeadset,
      title: "Round-the-Clock Support",
      description:
        "Technical support available 24/7. We are here whenever you need us.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Submit Requirements",
      description:
        "Upload project details, specifications, and deadline requirements.",
      icon: FaTerminal,
    },
    {
      number: "02",
      title: "Expert Assignment",
      description:
        "A specialist matching your tech stack is assigned to your project.",
      icon: FaGraduationCap,
    },
    {
      number: "03",
      title: "Development & Updates",
      description: "Track progress in real-time with milestone notifications.",
      icon: FaCode,
    },
    {
      number: "04",
      title: "Delivery & Review",
      description: "Receive polished, documented code ready for submission.",
      icon: FaCheckCircle,
    },
  ];

  const stats = [
    { value: "1000+", label: "Students Served" },
    { value: "2500+", label: "Projects Completed" },
    { value: "96%", label: "Satisfaction Rate" },
    { value: "4.9/5", label: "Average Rating" },
  ];

  const testimonials = [
    {
      quote:
        "ProjectHub helped me understand complex algorithms through well-documented code. The quality exceeded my expectations and I learned so much from their implementation!",
      author: "Priya Sharma",
      role: "Computer Science, Tribhuvan University",
      avatar: "PS",
      rating: 5,
    },
    {
      quote:
        "Fast delivery and professional work. The documentation was thorough and helped me learn while meeting my tight deadline. Highly recommended!",
      author: "Rajesh Adhikari",
      role: "Software Engineering, Kathmandu University",
      avatar: "RA",
      rating: 5,
    },
    {
      quote:
        "Excellent service! They delivered a clean, well-structured project that I could easily understand and build upon. The code quality was impressive.",
      author: "Neha Gurung",
      role: "Data Science, Pokhara University",
      avatar: "NG",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "What is the typical turnaround time?",
      answer:
        "Standard projects are completed within 24-48 hours. Urgent requests can be expedited to 6-12 hours depending on complexity. Timeline is confirmed before project initiation.",
    },
    {
      question: "How is confidentiality maintained?",
      answer:
        "All projects are handled with strict confidentiality. Developers sign NDAs, and we use encrypted communication channels. Your information is never shared with third parties.",
    },
    {
      question: "What is your revision policy?",
      answer:
        "Unlimited revisions are included until you are completely satisfied with the deliverable. Our goal is your success.",
    },
    {
      question: "Which technologies do you support?",
      answer:
        "We support all major programming languages and frameworks including Python, Java, JavaScript, C/C++, React, Node.js, Django, Spring Boot, TensorFlow, and more.",
    },
    {
      question: "How does the payment process work?",
      answer:
        "A 50% deposit initiates the project, with the balance due upon completion. We offer multiple secure payment methods and provide a money-back guarantee.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        {/* Subtle Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 text-sm mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Trusted by 1000+ students
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight tracking-tight mb-6">
              Expert Academic Project Help
              <span className="text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text">
                {" "}
                for All Domains
              </span>
            </h1>

            <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              Professional academic project assistance across engineering,
              business, design, coding, and more. 24/7 support from expert
              professionals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
              <button
                onClick={handleGetHelp}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Get Help Now
                <FaArrowRight className="text-xs" />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg transition-colors"
              >
                Learn More
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500 text-xs" />
                <span>No upfront payment</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500 text-xs" />
                <span>Money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500 text-xs" />
                <span>Unlimited revisions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl lg:text-4xl font-semibold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-4">
              How It Works
            </h2>
            <p className="text-zinc-400">
              A streamlined process designed to get your project completed
              efficiently and professionally.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="group relative p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                      <Icon className="text-zinc-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <span className="text-xs font-mono text-zinc-600">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-4">
              Why Choose ProjectHub
            </h2>
            <p className="text-zinc-400">
              Built by professionals, for students across all academic domains.
              We understand what it takes to deliver quality work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="group p-6 rounded-xl bg-[#09090b] border border-zinc-800/50 hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition-colors">
                    <Icon className="text-blue-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-4">
              What Students Say
            </h2>
            <p className="text-zinc-400">
              Hear from students who have achieved their academic goals with our
              assistance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-amber-400 text-sm" />
                  ))}
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-zinc-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-zinc-900/30">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-400">
              Everything you need to know about our service.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800/50 bg-[#09090b] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-900/50 transition-colors"
                >
                  <span className="text-sm font-medium text-white pr-4">
                    {faq.question}
                  </span>
                  <FaChevronDown
                    className={`text-zinc-500 text-xs flex-shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    openFaq === idx ? "max-h-40" : "max-h-0"
                  }`}
                >
                  <p className="px-5 pb-5 text-sm text-zinc-500 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-zinc-400 mb-10 max-w-xl mx-auto">
            Join thousands of students who have achieved academic success with
            professional code assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() =>
                info("Feature coming soon. Please check back later!")
              }
              disabled
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gray-600 opacity-50 rounded-lg cursor-not-allowed transition-colors relative group"
              title="Coming Soon"
            >
              Submit Your Project
              <FaArrowRight className="text-xs" />
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Coming Soon
              </span>
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg transition-colors">
              Contact Support
            </button>
          </div>
          <p className="mt-8 text-xs text-zinc-600">
            No credit card required • Free consultation • 100% satisfaction
            guaranteed
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <FaCode className="text-white text-sm" />
                </div>
                <span className="text-lg font-semibold text-white tracking-tight">
                  ProjectHub
                </span>
              </Link>
              <p className="text-sm text-zinc-500 max-w-xs">
                Professional academic assistance for students across all
                domains. Quality work, on time, every time.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-4">Platform</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#how-it-works"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600">
              &copy; 2025 ProjectHub. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
