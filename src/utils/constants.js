// ============================================
// ROUTES
// ============================================
export const ROUTES = {
  HOME: '/',
  SERVICES: '/services',
  HOW_IT_WORKS: '/how-it-works',
  PRICING: '/pricing',
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  DASHBOARD_ORDERS: '/dashboard/orders',
  DASHBOARD_SUBMIT: '/dashboard/submit-task',
  DASHBOARD_PROFILE: '/dashboard/profile',
};

export const NAV_LINKS = [
  { name: 'Home', path: ROUTES.HOME },
  { name: 'Services', path: ROUTES.SERVICES },
  { name: 'How It Works', path: ROUTES.HOW_IT_WORKS },
  { name: 'Pricing', path: ROUTES.PRICING },
  { name: 'About', path: ROUTES.ABOUT },
  { name: 'Contact', path: ROUTES.CONTACT },
];

export const DASHBOARD_NAV_LINKS = [
  { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'home' },
  { name: 'My Assignments', path: ROUTES.DASHBOARD_ORDERS, icon: 'clipboard' },
  { name: 'New Assignment', path: ROUTES.DASHBOARD_SUBMIT, icon: 'plus-circle' },
  { name: 'Profile', path: ROUTES.DASHBOARD_PROFILE, icon: 'user' },
];

// ============================================
// ASSIGNMENT STATUS (Simplified from 12 to 7)
// ============================================
export const ORDER_STATUS = {
  PENDING: 'pending',
  QUOTED: 'quoted',
  ACCEPTED: 'accepted',
  WORKING: 'working',
  REVIEW: 'review',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  pending: 'Pending Review',
  quoted: 'Quote Sent',
  accepted: 'In Progress',
  working: 'Being Worked On',
  review: 'Quality Review',
  delivered: 'Delivered',
  completed: 'Completed',
  rejected: 'Rejected',
  declined: 'Quote Declined',
  cancelled: 'Cancelled',
  // Legacy status mappings (for existing data)
  'initialized': 'Under Review',
  'started': 'Started',
  'assigned': 'Assigned',
  'in-progress': 'In Progress',
  'in-review': 'Under Review',
  'payment-pending': 'Payment Pending',
  'payment-verified': 'Payment Verified',
  'released-to-admin': 'Ready for Delivery',
};

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-purple-100 text-purple-800',
  accepted: 'bg-blue-100 text-blue-800',
  working: 'bg-blue-100 text-blue-800',
  review: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  declined: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  // Legacy status colors
  'initialized': 'bg-yellow-100 text-yellow-800',
  'started': 'bg-blue-100 text-blue-800',
  'assigned': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'in-review': 'bg-indigo-100 text-indigo-800',
  'payment-pending': 'bg-orange-100 text-orange-800',
  'payment-verified': 'bg-green-100 text-green-800',
  'released-to-admin': 'bg-teal-100 text-teal-800',
};

// ============================================
// ACADEMIC-SPECIFIC OPTIONS
// ============================================
export const ACADEMIC_LEVELS = [
  { value: 'high_school', label: 'High School' },
  { value: 'undergraduate', label: 'Undergraduate (Bachelor\'s)' },
  { value: 'masters', label: 'Master\'s Degree' },
  { value: 'phd', label: 'PhD / Doctoral' },
];

export const SUBJECTS = [
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'english', label: 'English / Literature' },
  { value: 'business', label: 'Business / Management' },
  { value: 'economics', label: 'Economics' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'nursing', label: 'Nursing / Healthcare' },
  { value: 'law', label: 'Law' },
  { value: 'history', label: 'History' },
  { value: 'sociology', label: 'Sociology' },
  { value: 'other', label: 'Other' },
];

export const ASSIGNMENT_TYPES = [
  { value: 'essay', label: 'Essay' },
  { value: 'research_paper', label: 'Research Paper' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'lab_report', label: 'Lab Report' },
  { value: 'dissertation', label: 'Dissertation' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'homework', label: 'Homework / Problem Set' },
  { value: 'programming', label: 'Programming Assignment' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'calculations', label: 'Calculations / Math Work' },
  { value: 'other', label: 'Other' },
];

export const CITATION_STYLES = [
  { value: 'apa', label: 'APA (7th Edition)' },
  { value: 'mla', label: 'MLA' },
  { value: 'chicago', label: 'Chicago / Turabian' },
  { value: 'harvard', label: 'Harvard' },
  { value: 'ieee', label: 'IEEE' },
  { value: 'none', label: 'No Citation Required' },
];

export const URGENCY_OPTIONS = [
  { value: 'standard', label: 'Standard (7+ days)', multiplier: 1.0 },
  { value: 'priority', label: 'Priority (3-7 days)', multiplier: 1.25 },
  { value: 'urgent', label: 'Urgent (1-3 days)', multiplier: 1.5 },
  { value: 'rush', label: 'Rush (< 24 hours)', multiplier: 2.0 },
];

// ============================================
// LEGACY SERVICE TYPES (kept for compatibility)
// ============================================
export const SERVICE_TYPES = [
  { value: 'essay', label: 'Essay Writing' },
  { value: 'research_paper', label: 'Research Paper' },
  { value: 'programming', label: 'Programming Assignment' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'homework', label: 'Homework Help' },
  { value: 'thesis', label: 'Thesis/Dissertation' },
  { value: 'other', label: 'Other' },
  // Legacy values
  { value: 'code-project', label: 'Code Project' },
  { value: 'documentation', label: 'Documentation' },
];

export const TECHNOLOGIES = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'react-native', label: 'React Native' },
  { value: 'flutter', label: 'Flutter' },
  { value: 'sql', label: 'SQL/Database' },
  { value: 'matlab', label: 'MATLAB' },
  { value: 'r', label: 'R' },
  { value: 'excel', label: 'Excel/VBA' },
  { value: 'other', label: 'Other' },
];

// ============================================
// COMPANY INFO
// ============================================
export const COMPANY_INFO = {
  name: 'ProjectHub',
  tagline: 'Focus on Learning. We Handle the Rest.',
  email: 'projecthub@gmail.com',
  supportHours: '24/7',
};

// ============================================
// PAYMENT STATUS
// ============================================
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PENDING_VERIFICATION: 'pending_verification',
  PAID: 'paid',
};

export const PAYMENT_STATUS_LABELS = {
  unpaid: 'Unpaid',
  pending_verification: 'Awaiting Verification',
  paid: 'Paid',
};

export const PAYMENT_STATUS_COLORS = {
  unpaid: 'bg-red-100 text-red-800',
  pending_verification: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
};
