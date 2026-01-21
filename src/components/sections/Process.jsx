const steps = [
  {
    number: '01',
    title: 'Submit Request',
    description: 'Tell us about your project, deadline, and budget.',
  },
  {
    number: '02',
    title: 'Get Quote',
    description: 'Receive a detailed quote within 24 hours.',
  },
  {
    number: '03',
    title: 'We Deliver',
    description: 'Our experts complete your project on time.',
  },
];

export default function Process() {
  return (
    <section className="py-24 bg-[#08080c]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-violet-400 font-medium mb-3 text-sm tracking-wide uppercase">Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Simple, fast, and reliable. Get your project done in three easy steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-px bg-gradient-to-r from-white/10 to-transparent" />
              )}

              <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                {/* Large Number */}
                <div className="text-6xl font-bold text-white/[0.03] absolute top-4 right-6">
                  {step.number}
                </div>

                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg mb-5">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
