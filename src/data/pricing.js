export const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$29',
    priceNote: 'Starting from',
    description: 'Perfect for small tasks and quick fixes',
    features: [
      { text: 'Small code tasks & bug fixes', included: true },
      { text: '3-5 day delivery', included: true },
      { text: '1 revision included', included: true },
      { text: 'Email support', included: true },
      { text: 'Source code delivery', included: true },
      { text: 'Priority support', included: false },
      { text: 'Video walkthrough', included: false },
    ],
    isPopular: false,
    ctaText: 'Get Started',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$79',
    priceNote: 'Starting from',
    description: 'Ideal for medium-sized projects',
    features: [
      { text: 'Medium complexity projects', included: true },
      { text: '2-3 day delivery', included: true },
      { text: '3 revisions included', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Source code with documentation', included: true },
      { text: 'Progress updates', included: true },
      { text: 'Video walkthrough', included: false },
    ],
    isPopular: true,
    ctaText: 'Most Popular',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$149',
    priceNote: 'Starting from',
    description: 'For complex and urgent projects',
    features: [
      { text: 'Large/complex projects', included: true },
      { text: 'Express 24-48hr delivery', included: true },
      { text: 'Unlimited revisions', included: true },
      { text: '24/7 dedicated support', included: true },
      { text: 'Full documentation package', included: true },
      { text: 'Progress updates', included: true },
      { text: 'Video walkthrough included', included: true },
    ],
    isPopular: false,
    ctaText: 'Contact Us',
  },
];

export const pricingFAQ = [
  {
    question: 'How is pricing determined?',
    answer: 'Pricing depends on project complexity, deadline, and specific requirements. We provide a custom quote after reviewing your task details.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer full refunds if we cannot complete your project to specifications. Partial refunds are available for scope changes.',
  },
  {
    question: 'Can I get a custom quote?',
    answer: 'Absolutely! Contact us with your project details and we\'ll provide a tailored quote within 24 hours.',
  },
  {
    question: 'Are there any hidden fees?',
    answer: 'No hidden fees. The quoted price is final unless you request additional features or scope changes.',
  },
];
