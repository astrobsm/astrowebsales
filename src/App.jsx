import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSyncStore } from './store/syncStore';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// PWA Components
import InstallPrompt from './components/shared/InstallPrompt';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Products from './pages/public/Products';
import Education from './pages/public/Education';
import Seminars from './pages/public/Seminars';
import Contact from './pages/public/Contact';
import SeminarRegistration from './pages/public/SeminarRegistration';

// Auth Pages
import RetailAccess from './pages/auth/RetailAccess';
import Login from './pages/auth/Login';
import StaffLogin from './pages/auth/StaffLogin';

// Retail Customer Pages
import RetailProducts from './pages/retail/RetailProducts';
import RetailCart from './pages/retail/RetailCart';
import RetailCheckout from './pages/retail/RetailCheckout';
import RetailOrderConfirmation from './pages/retail/RetailOrderConfirmation';
import RetailOrderTracking from './pages/retail/RetailOrderTracking';

// Admin Dashboard
import AdminDashboard, { AdminUsers, AdminProducts, AdminOrders, AdminDistributors, AdminReports, AdminSettings, AdminContent } from './pages/admin';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminStaffManagement from './pages/admin/AdminStaffManagement';
import AdminPartnerManagement from './pages/admin/AdminPartnerManagement';
import AdminAccessSettings from './pages/admin/AdminAccessSettings';

// Distributor Dashboard
import { DistributorDashboard, DistributorOrders, DistributorInventory, DistributorHistory } from './pages/distributor';

// Wholesaler Dashboard
import { WholesalerDashboard, WholesalerOrders } from './pages/wholesaler';

// Customer Care Dashboard
import { CCODashboard, CCOEscalations, CCOCommunications, CCOFeedback } from './pages/cco';

// Marketer Dashboard
import { MarketerDashboard, MarketerLeads, MarketerReports } from './pages/marketer';

// Sales Dashboard
import { SalesDashboard, SalesOrders, SalesCustomers, SalesProducts } from './pages/sales';

// Shared Components
import StaffFeedback from './components/shared/StaffFeedback';

// Partner Pages
import BecomeDistributor from './pages/partner/BecomeDistributor';

// Auth Guard
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const { initSync, cleanup } = useSyncStore();

  useEffect(() => {
    // Initialize cross-device sync
    initSync();
    
    return () => {
      cleanup();
    };
  }, [initSync, cleanup]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* PWA Install Prompt */}
      <InstallPrompt />
      
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/education" element={<Education />} />
          <Route path="/seminars" element={<Seminars />} />
          <Route path="/seminars/register/:id" element={<SeminarRegistration />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/become-distributor" element={<BecomeDistributor />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/retail-access" element={<RetailAccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/staff-login" element={<StaffLogin />} />

        {/* Retail Customer Routes */}
        <Route path="/shop" element={<RetailProducts />} />
        <Route path="/cart" element={<RetailCart />} />
        <Route path="/checkout" element={<RetailCheckout />} />
        <Route path="/order-confirmation/:orderId" element={<RetailOrderConfirmation />} />
        <Route path="/track-order/:orderId" element={<RetailOrderTracking />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="staff" element={<AdminStaffManagement />} />
          <Route path="partners" element={<AdminPartnerManagement />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="distributors" element={<AdminDistributors />} />
          <Route path="feedback" element={<StaffFeedback canRespond={true} />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="access-settings" element={<AdminAccessSettings />} />
        </Route>

        {/* Distributor Dashboard Routes */}
        <Route path="/distributor" element={
          <ProtectedRoute allowedRoles={['distributor']}>
            <DashboardLayout role="distributor" />
          </ProtectedRoute>
        }>
          <Route index element={<DistributorDashboard />} />
          <Route path="orders" element={<DistributorOrders />} />
          <Route path="inventory" element={<DistributorInventory />} />
          <Route path="feedback" element={<StaffFeedback canRespond={true} />} />
          <Route path="history" element={<DistributorHistory />} />
        </Route>

        {/* Wholesaler Dashboard Routes */}
        <Route path="/wholesaler" element={
          <ProtectedRoute allowedRoles={['wholesaler']}>
            <DashboardLayout role="wholesaler" />
          </ProtectedRoute>
        }>
          <Route index element={<WholesalerDashboard />} />
          <Route path="orders" element={<WholesalerOrders />} />
          <Route path="feedback" element={<StaffFeedback canRespond={false} />} />
        </Route>

        {/* Customer Care Officer Dashboard Routes */}
        <Route path="/cco" element={
          <ProtectedRoute allowedRoles={['cco']}>
            <DashboardLayout role="cco" />
          </ProtectedRoute>
        }>
          <Route index element={<CCODashboard />} />
          <Route path="feedback" element={<CCOFeedback />} />
          <Route path="escalations" element={<CCOEscalations />} />
          <Route path="communications" element={<CCOCommunications />} />
        </Route>

        {/* Marketer Dashboard Routes */}
        <Route path="/marketer" element={
          <ProtectedRoute allowedRoles={['marketer']}>
            <DashboardLayout role="marketer" />
          </ProtectedRoute>
        }>
          <Route index element={<MarketerDashboard />} />
          <Route path="leads" element={<MarketerLeads />} />
          <Route path="feedback" element={<StaffFeedback canRespond={false} />} />
          <Route path="reports" element={<MarketerReports />} />
        </Route>

        {/* Sales Dashboard Routes */}
        <Route path="/sales" element={
          <ProtectedRoute allowedRoles={['sales']}>
            <DashboardLayout role="sales" />
          </ProtectedRoute>
        }>
          <Route index element={<SalesDashboard />} />
          <Route path="orders" element={<SalesOrders />} />
          <Route path="customers" element={<SalesCustomers />} />
          <Route path="products" element={<SalesProducts />} />
          <Route path="feedback" element={<StaffFeedback canRespond={false} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
