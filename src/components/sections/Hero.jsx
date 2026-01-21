import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export default function Hero() {
  const { info } = useToast();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f] py-20">
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Available Now</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-gray-400 text-sm">Trusted by 1000+ students</span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
          <span className="text-white">Expert Academic</span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Project Help for All Domains
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Professional academic project assistance across engineering, business, design, coding, and more.
          <br className="hidden sm:block" />
          24/7 support from expert professionals.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
          <button
            onClick={() => info('Feature coming soon. Please check back later!')}
            disabled
            className="w-full sm:w-auto px-8 py-4 bg-gray-600 opacity-50 text-white rounded-xl font-semibold text-lg cursor-not-allowed flex items-center justify-center gap-2 relative group"
            title="Coming Soon"
          >
            Get Started
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Coming Soon
            </span>
          </button>
          <Link
            to="/pricing"
            className="w-full sm:w-auto px-8 py-4 text-gray-300 rounded-xl font-semibold text-lg border border-white/10 hover:bg-white/5 transition-all text-center"
          >
            View Pricing
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 pt-10 border-t border-white/10 grid grid-cols-3 gap-8 w-full max-w-xl">
          {[
            { value: '1000+', label: 'Students Served' },
            { value: '2500+', label: 'Projects Completed' },
            { value: '4.9/5', label: 'Average Rating' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-500 text-xs sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
