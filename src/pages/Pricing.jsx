import { Link } from 'react-router-dom';
import { useState } from 'react';

const basePricingTiers = [
  {
    name: 'Basic',
    basePrice: 1500,
    priceRange: 'range based on urgency',
    description: 'Simple tasks and small bug fixes',
    features: [
      'Simple bug fixes & debugging',
      'Single file modifications',
      'Code review & optimization',
      'Basic documentation',
      '{delivery} days delivery',
      '1 revision included',
      'Email support',
    ],
    popular: false,
    idealFor: 'Small homework assignments, simple scripts',
  },
  {
    name: 'Standard',
    basePrice: 5000,
    priceRange: 'range based on urgency',
    description: 'Medium-sized projects and features',
    features: [
      'Full feature development',
      'API integration',
      'Database setup & design',
      'Comprehensive documentation',
      '{delivery} days delivery',
      '3 revisions included',
      'WhatsApp support',
      'Code walkthrough',
    ],
    popular: true,
    idealFor: 'Course projects, mini applications',
  },
  {
    name: 'Premium',
    basePrice: 15000,
    priceRange: 'range based on urgency',
    description: 'Complex applications and full systems',
    features: [
      'Full application development',
      'Multi-module systems',
      'Advanced integrations',
      'Complete documentation',
      '{delivery} days delivery',
      'Unlimited revisions',
      '24/7 priority support',
      'Video walkthrough',
      'Deployment assistance',
    ],
    popular: false,
    idealFor: 'Final year projects, complete web/mobile apps',
  },
  {
    name: 'Enterprise',
    basePrice: 50000,
    priceRange: 'range based on urgency',
    description: 'Large-scale enterprise solutions',
    features: [
      'Enterprise-grade applications',
      'Scalable architecture',
      'Cloud deployment (AWS/Azure)',
      'CI/CD pipeline setup',
      'Custom timeline',
      'Dedicated developer',
      'Post-delivery support',
      'Source code ownership',
      'NDA available',
    ],
    popular: false,
    idealFor: 'Startups, businesses, enterprise systems',
  },
];

const serviceRates = [
  { service: 'Bug Fixing', rate: 'Rs. 500 - Rs. 2,000', time: '1-2 days' },
  { service: 'Code Review', rate: 'Rs. 1,000 - Rs. 3,000', time: '1-2 days' },
  { service: 'API Development', rate: 'Rs. 3,000 - Rs. 15,000', time: '3-7 days' },
  { service: 'Database Design', rate: 'Rs. 2,000 - Rs. 8,000', time: '2-5 days' },
  { service: 'Frontend Development', rate: 'Rs. 5,000 - Rs. 25,000', time: '5-15 days' },
  { service: 'Backend Development', rate: 'Rs. 5,000 - Rs. 30,000', time: '5-15 days' },
  { service: 'Full Stack App', rate: 'Rs. 15,000 - Rs. 80,000', time: '10-30 days' },
  { service: 'Mobile App', rate: 'Rs. 20,000 - Rs. 100,000', time: '15-45 days' },
  { service: 'Documentation', rate: 'Rs. 1,000 - Rs. 5,000', time: '2-5 days' },
  { service: 'Deployment & Hosting', rate: 'Rs. 2,000 - Rs. 10,000', time: '1-3 days' },
];

const faqs = [
  {
    question: 'How is pricing determined?',
    answer: 'Pricing depends on project complexity, deadline urgency, and specific requirements. Submit your task for a free custom quote within 2 hours.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept eSewa, Khalti, bank transfer (Nepal), and international payments via PayPal. 50% advance payment is required to start work.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes! Full refund if we cannot deliver as promised. Partial refunds available for scope changes. Your satisfaction is guaranteed.',
  },
  {
    question: 'How do revisions work?',
    answer: 'Each plan includes a set number of revisions. Additional revisions beyond the limit are charged at Rs. 500 per revision.',
  },
  {
    question: 'Can I get urgent delivery?',
    answer: 'Yes! Express delivery is available with 50% additional charge. We can deliver simple tasks within 24 hours.',
  },
  {
    question: 'Do you provide source code?',
    answer: 'Absolutely! You get complete source code with full ownership rights. We also provide documentation and setup guides.',
  },
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState(null);
  const [isUrgent, setIsUrgent] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-violet-400 font-medium mb-3 text-sm tracking-wide uppercase">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Transparent <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Nepali</span> Pricing
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Affordable rates for students and professionals. No hidden fees. Pay in NPR via eSewa or Bank Transfer.
          </p>

          {/* Urgency Toggle */}
          <div className="inline-flex items-center gap-4 bg-white/5 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setIsUrgent(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isUrgent ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
            >
              Standard Delivery
            </button>
            <button
              onClick={() => setIsUrgent(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isUrgent ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
            >
              Urgent (24-48h)
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {basePricingTiers.map((tier, index) => {
            const price = isUrgent ? Math.round(tier.basePrice * 1.5) : tier.basePrice;
            const deliveryDays = isUrgent
              ? (tier.name === 'Basic' ? '1' : tier.name === 'Standard' ? '2-3' : '3-5')
              : (tier.name === 'Basic' ? '3-5' : tier.name === 'Standard' ? '5-10' : '10-20');

            return (
              <div
                key={index}
                className={`relative p-6 rounded-2xl transition-all duration-300 flex flex-col ${tier.popular
                    ? 'bg-gradient-to-b from-blue-500/10 to-violet-500/10 border-2 border-blue-500/30 scale-[1.02]'
                    : 'bg-white/[0.02] border border-white/[0.05] hover:border-white/10'
                  }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white text-sm font-semibold rounded-full whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{tier.description}</p>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                    Rs. {price.toLocaleString()}
                    {tier.name === 'Enterprise' && '+'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isUrgent ? 'Express Delivery' : 'Standard Delivery'}
                  </p>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature.replace('{delivery}', deliveryDays)}
                    </li>
                  ))}
                </ul>
                <div className="mb-4 p-3 bg-white/5 rounded-xl">
                  <p className="text-xs text-gray-500">Ideal for:</p>
                  <p className="text-sm text-gray-300">{tier.idealFor}</p>
                </div>
                <Link
                  to="/submit-task"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all ${tier.popular
                      ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:opacity-90'
                      : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                >
                  Get Started
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Service Rates Table */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Service-wise Rates</h2>
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Price Range</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Typical Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {serviceRates.map((item, index) => (
                  <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{item.service}</td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">{item.rate}</td>
                    <td className="px-6 py-4 text-gray-400">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Payment Methods</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 text-center">
            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-green-400 font-bold text-lg">e</span>
            </div>
            <h3 className="font-semibold text-white mb-1">eSewa</h3>
            <p className="text-sm text-gray-500">Instant transfer</p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 text-center">
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-400 font-bold text-lg">K</span>
            </div>
            <h3 className="font-semibold text-white mb-1">Khalti</h3>
            <p className="text-sm text-gray-500">Instant transfer</p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-center">
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-1">Bank Transfer</h3>
            <p className="text-sm text-gray-500">All Nepal banks</p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 text-center">
            <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-1">Cash</h3>
            <p className="text-sm text-gray-500">Kathmandu valley</p>
          </div>
        </div>
        <p className="text-center text-gray-500 text-sm mt-6">
          50% advance payment required to start work. Remaining 50% on delivery.
        </p>
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <span className="font-medium text-white">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-purple-500/10 border border-white/5 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Need a Custom Quote?</h2>
          <p className="text-gray-400 mb-6">
            Tell us about your project and get a personalized quote within 2 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/submit-task"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Submit Your Task
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="https://wa.me/9779800000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500/20 text-green-400 rounded-xl font-semibold hover:bg-green-500/30 transition-colors border border-green-500/30"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
