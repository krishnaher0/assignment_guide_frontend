import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import WhatsAppFAB from './components/WhatsAppFAB';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-400">Loading...</p>
      </div>
    </div>
  );
}

// Conditional WhatsApp FAB - hide on admin and developer pages
function ConditionalWhatsAppFAB() {
  const location = useLocation();
  const hideOnPaths = ['/admin', '/developer'];
  const shouldHide = hideOnPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) return null;
  return <WhatsAppFAB />;
}

// Layouts (eagerly loaded as they're frequently used)
import { MainLayout } from './components/layout';
import AdminLayout from './pages/admin/AdminLayout';

// Public Pages (lazily loaded)
const CustomerLanding = lazy(() => import('./pages/CustomerLanding'));
const Services = lazy(() => import('./pages/Services'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Contact = lazy(() => import('./pages/Contact'));

// Auth Pages (lazily loaded)
const OAuthLogin = lazy(() => import('./pages/auth/OAuthLogin'));
const OAuthCallback = lazy(() => import('./pages/auth/OAuthCallback'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const MFASetupPage = lazy(() => import('./pages/MFASetupPage'));
const SecuritySettingsPage = lazy(() => import('./pages/SecuritySettingsPage'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));

// Admin Pages (lazily loaded)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTasks = lazy(() => import('./pages/admin/AdminTasks'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminDevelopers = lazy(() => import('./pages/admin/AdminDevelopers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminQuotes = lazy(() => import('./pages/admin/AdminQuotes'));
const AdminQuoteBuilder = lazy(() => import('./pages/admin/AdminQuoteBuilder'));
const AdminTaskDetail = lazy(() => import('./pages/admin/AdminTaskDetail'));
const AdminContracts = lazy(() => import('./pages/admin/AdminContracts'));
const AdminContractDetail = lazy(() => import('./pages/admin/AdminContractDetail'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminInvoices = lazy(() => import('./pages/admin/AdminInvoices'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));

// Developer Pages (lazily loaded)
const DeveloperLayout = lazy(() => import('./pages/dashboard/developer/Layout'));
const DeveloperDashboard = lazy(() => import('./pages/dashboard/developer/Dashboard'));
const DeveloperTasks = lazy(() => import('./pages/dashboard/developer/Tasks'));
const TaskDetail = lazy(() => import('./pages/dashboard/developer/TaskDetail'));
const DeveloperWorkspace = lazy(() => import('./pages/dashboard/developer/Workspace'));
const WorkspaceDetail = lazy(() => import('./pages/dashboard/developer/WorkspaceDetail'));
const BoardView = lazy(() => import('./pages/dashboard/developer/BoardView'));
const JoinWorkspace = lazy(() => import('./pages/dashboard/developer/JoinWorkspace'));
const DeveloperMessages = lazy(() => import('./pages/dashboard/developer/Messages'));
const DeveloperEarnings = lazy(() => import('./pages/dashboard/developer/Earnings'));

// Client Pages (lazily loaded)
const ClientLayout = lazy(() => import('./pages/dashboard/client/Layout'));
const ClientDashboard = lazy(() => import('./pages/dashboard/client/Dashboard'));
const ClientTasks = lazy(() => import('./pages/dashboard/client/Tasks'));
const ClientPayment = lazy(() => import('./pages/dashboard/client/Payment'));
const ClientQuotes = lazy(() => import('./pages/dashboard/client/Quotes'));
const ClientQuoteView = lazy(() => import('./pages/dashboard/client/QuoteView'));
const ClientContracts = lazy(() => import('./pages/dashboard/client/Contracts'));
const ClientContractView = lazy(() => import('./pages/dashboard/client/ContractView'));
const ClientInvoices = lazy(() => import('./pages/dashboard/client/Invoices'));
const ClientOrderDetail = lazy(() => import('./pages/dashboard/client/OrderDetail'));

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <ToastProvider>
            <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<CustomerLanding />} />

              {/* Public Routes with MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/services" element={<Services />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
              </Route>

              {/* Redirect old submit-task to new dashboard route */}
              <Route path="/submit-task" element={<Navigate to="/dashboard/client/new" replace />} />

              {/* Auth Routes */}
              <Route path="/auth/login" element={<OAuthLogin />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route path="/auth/error" element={
                <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-400 mb-4">Authentication Error</h1>
                    <p className="text-zinc-400 mb-6">{new URLSearchParams(window.location.search).get('message') || 'An error occurred during login'}</p>
                    <a href="/auth/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl">Try Again</a>
                  </div>
                </div>
              } />

              {/* Admin Login (unprotected) - must be before protected admin routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin-login" element={<AdminLogin />} />

              {/* Shortcuts to dashboards */}
              <Route path="/customer-dashboard" element={<Navigate to="/dashboard/client" replace />} />
              <Route path="/developer-dashboard" element={<Navigate to="/developer" replace />} />
              <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/profile" element={<Navigate to="/dashboard/client" replace />} />

              {/* Protected Admin Routes - nested under /admin/* */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="tasks" element={<AdminTasks />} />
                <Route path="tasks/:taskId" element={<AdminTaskDetail />} />
                <Route path="developers" element={<AdminDevelopers />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="quotes" element={<AdminQuotes />} />
                <Route path="quotes/new" element={<AdminQuoteBuilder />} />
                <Route path="quotes/:id" element={<AdminQuoteBuilder />} />
                <Route path="quotes/:id/edit" element={<AdminQuoteBuilder />} />
                <Route path="quotes/:id/revise" element={<AdminQuoteBuilder />} />
                <Route path="contracts" element={<AdminContracts />} />
                <Route path="contracts/:id" element={<AdminContractDetail />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="invoices" element={<AdminInvoices />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="invoices" element={<AdminInvoices />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                {/* Admin Profile & Security Settings */}
                <Route path="profile" element={<ProfilePage />} />
                <Route path="security" element={<ProfilePage />} />
              </Route>

              {/* Protected Developer Routes */}
              <Route
                path="/developer"
                element={
                  <ProtectedRoute roles={['developer', 'admin']}>
                    <DeveloperLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DeveloperDashboard />} />
                <Route path="tasks" element={<DeveloperTasks />} />
                <Route path="tasks/:taskId" element={<TaskDetail />} />
                <Route path="workspace" element={<DeveloperWorkspace />} />
                <Route path="workspace/join/:code" element={<JoinWorkspace />} />
                <Route path="workspace/:workspaceId" element={<WorkspaceDetail />} />
                <Route path="workspace/:workspaceId/board/:boardId" element={<BoardView />} />
                <Route path="messages" element={<DeveloperMessages />} />
                <Route path="earnings" element={<DeveloperEarnings />} />
                <Route path="messages" element={<DeveloperMessages />} />
                <Route path="earnings" element={<DeveloperEarnings />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="security" element={<ProfilePage />} />
              </Route>

              {/* Protected Client Routes - only for client role */}
              <Route
                path="/dashboard/client"
                element={
                  <ProtectedRoute roles={['client']}>
                    <ClientLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ClientDashboard />} />
                <Route path="tasks" element={<ClientTasks />} />
                <Route path="orders/:orderId" element={<ClientOrderDetail />} />
                <Route path="payment" element={<ClientPayment />} />
                <Route path="quotes" element={<ClientQuotes />} />
                <Route path="quotes/:quoteId" element={<ClientQuoteView />} />
                <Route path="contracts" element={<ClientContracts />} />
                <Route path="contracts/:id" element={<ClientContractView />} />
                <Route path="invoices" element={<ClientInvoices />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="security" element={<ProfilePage />} />
              </Route>

              {/* MFA Setup Route (Common for all authenticated users) */}
              <Route path="/mfa-setup" element={
                <ProtectedRoute>
                  <MFASetupPage />
                </ProtectedRoute>
              } />

              {/* Fallback Security Route */}
              <Route path="/settings/security" element={
                <ProtectedRoute>
                  <SecuritySettingsPage />
                </ProtectedRoute>
              } />

              {/* Redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
            <ConditionalWhatsAppFAB />
          </ToastProvider>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
