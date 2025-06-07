import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import ProtectedRoute from './components/AuthTemp/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';

// Import pages
import HomePage from './pages/HomePage';
import AgentListingsPage from './pages/AgentListingsPage';
import AgentDetailPage from './pages/AgentDetailPage';
import CreateAgentPage from './pages/CreateAgentPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DeveloperDashboardPage from './pages/DeveloperDashboardPage';
import BusinessOwnerDashboardPage from './pages/BusinessOwnerDashboardPage';
import EditAgentPage from './pages/EditAgentPage';
import MyAgentsPage from './pages/MyAgentsPage';
import SandboxPage from './pages/SandboxPage';
import CommunityHomePage from './pages/CommunityHomePage';
import ForumCategoryPage from './pages/ForumCategoryPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import AdminCategoryManagementPage from './pages/AdminCategoryManagementPage';
import CreateCommunityPage from './pages/CreateCommunityPage';
import PostsByTagPage from './pages/PostsByTagPage';
import PricingPage from './pages/PricingPage';
import MyIntegrationsPage from './pages/MyIntegrationsPage';
import BillingUsagePage from './pages/BillingUsagePage';
import BillingPlanPage from './pages/BillingPlanPage';
import BillingPaymentPage from './pages/BillingPaymentPage';
import BillingInvoicesPage from './pages/BillingInvoicesPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import CareersPage from './pages/CareersPage';
import BlogPage from './pages/BlogPage';
import FAQPage from './pages/FAQPage';
import Legal from './pages/Legal';
import ApiDocumentationPage from './pages/ApiDocumentationPage';
import FeaturesPage from './pages/FeaturesPage';
import IntegrationsPage from './pages/IntegrationsPage';

// Import authentication components
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import VerifyEmail from './components/Auth/VerifyEmail';
import VerificationPending from './components/Auth/VerificationPending';
import CookieConsentBanner from './components/CookieConsentBanner';

function App() {
  const { user } = useAuth();

  return (
    <NotificationsProvider>
      <div className="app-container">
        <Navbar />
        <main className="app-main">
          <div className="content-wrap">
          <Routes>
          {/* Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* Agent Listings */}
          <Route path="/agents" element={<AgentListingsPage />} />
          <Route path="/agent/:id" element={<AgentDetailPage />} />
          <Route path="/agent/sandbox/:id" element={<SandboxPage />} />

          {/* Protected Routes - Require Authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/create-agent" element={<CreateAgentPage />} />
            <Route path="/edit-agent/:id" element={<EditAgentPage />} />
            <Route path="/my-agents" element={<MyAgentsPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/business-dashboard" element={<BusinessOwnerDashboardPage />} />
            <Route path="/developer-dashboard" element={<DeveloperDashboardPage />} />
            <Route path="/my-integrations" element={<MyIntegrationsPage />} />
            
            {/* Billing Routes */}
            <Route path="/billing/usage" element={<BillingUsagePage />} />
            <Route path="/billing/plan" element={<BillingPlanPage />} />
            <Route path="/billing/payment" element={<BillingPaymentPage />} />
            <Route path="/billing/invoices" element={<BillingInvoicesPage />} />
            
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Admin Routes */}
            {user?.role === 'admin' && (
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            )}
            
            {/* API Documentation */}
            <Route path="/api-documentation" element={<ApiDocumentationPage />} />

            {/* Community Routes */}
            <Route path="/community/create-post" element={<CreatePostPage />} />
            <Route path="/community/post/:postId/edit" element={<EditPostPage />} />
            
            {/* Admin Community Management */}
            {user?.role === 'admin' && (
              <Route path="/admin/categories" element={<AdminCategoryManagementPage />} />
            )}
            
            {/* Create Community - Protected */}
            <Route path="/create-community" element={<CreateCommunityPage />} />
          </Route>

          {/* Public Community Routes */}
          <Route path="/community" element={<CommunityHomePage />} />
          <Route path="/community/category/:categoryId">
            <Route index element={<ForumCategoryPage />} />
            <Route path="new-post" element={<CreatePostPage />} />
          </Route>
          <Route path="/community/post/:postId" element={<PostDetailPage />} />
          <Route path="/community/tags/:tagName" element={<PostsByTagPage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/verification-pending" element={<VerificationPending />} />

          {/* Pricing Page */}
          <Route path="/pricing" element={<PricingPage />} />

          {/* Information Pages */}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          
          {/* Legal Pages */}
          <Route path="/legal/*" element={<Legal />} />

          {/* 404 Route - Keep this last */}
          <Route path="*" element={
            <div className="page-not-found" style={{ textAlign: 'center', padding: '2rem' }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
              <Link to="/" style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#4cc9f0',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                marginTop: '1rem'
              }}>Return Home</Link>
            </div>
          } />
          </Routes>
          </div>
        </main>
        <Footer />
        <CookieConsentBanner />
      </div>
    </NotificationsProvider>
  );
}

export default App;
