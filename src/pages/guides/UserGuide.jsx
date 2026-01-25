// Comprehensive User Guides for Staff and Partners
import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { 
  Download, Book, ChevronDown, ChevronRight, Home, Package, ShoppingCart, 
  Users, BarChart3, MessageCircle, Settings, AlertTriangle, TrendingUp,
  Clock, CheckCircle, Phone, CreditCard, Truck, FileText, Search,
  Plus, Minus, Edit2, Trash2, Eye, Filter, Calendar, Bell
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// PDF Download Component
const DownloadPDFButton = ({ contentRef, filename, title }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setDownloading(true);

    try {
      const content = contentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 800
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      // Calculate pages needed
      const pageHeight = pdfHeight * imgWidth / pdfWidth;
      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position * ratio, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = -pageHeight * page;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position * ratio, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pageHeight;
        page++;
      }

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
    >
      <Download size={18} />
      {downloading ? 'Generating PDF...' : 'Download as PDF'}
    </button>
  );
};

// Section Component
const GuideSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="text-primary-600" size={20} />}
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>
      {isOpen && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
};

// Step Component
const Step = ({ number, title, description }) => (
  <div className="flex gap-4 mb-4">
    <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
      {number}
    </div>
    <div>
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

// Admin User Guide
export const AdminUserGuide = () => {
  const contentRef = useRef(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Admin User Guide</h1>
          <p className="text-gray-600">Complete guide to managing the Bonnesante Medicals platform</p>
        </div>
        <DownloadPDFButton contentRef={contentRef} filename="Admin_User_Guide" title="Admin User Guide" />
      </div>

      <div ref={contentRef} className="bg-white p-6 rounded-xl">
        <div className="text-center mb-8 pb-6 border-b">
          <h2 className="text-2xl font-bold text-primary-700">Bonnesante Medicals</h2>
          <h3 className="text-xl text-gray-700">Administrator User Guide</h3>
          <p className="text-sm text-gray-500 mt-2">Version 1.0 | January 2026</p>
        </div>

        <GuideSection title="Dashboard Overview" icon={Home} defaultOpen={true}>
          <p className="mb-4">The Admin Dashboard provides a comprehensive overview of your business operations:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Total Revenue:</strong> Shows accumulated sales revenue</li>
            <li><strong>Total Orders:</strong> Number of orders placed across all channels</li>
            <li><strong>Active Distributors:</strong> Count of active partner distributors</li>
            <li><strong>Pending Escalations:</strong> Orders requiring attention</li>
          </ul>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800"><strong>Tip:</strong> Check your dashboard daily to monitor business health and identify issues early.</p>
          </div>
        </GuideSection>

        <GuideSection title="Analytics" icon={TrendingUp}>
          <p className="mb-4">The Analytics page provides detailed insights into your business performance:</p>
          <Step number={1} title="View Sales Trends" description="Monitor daily, weekly, and monthly sales patterns to identify growth opportunities." />
          <Step number={2} title="Product Performance" description="See which products are selling best and which need attention." />
          <Step number={3} title="Partner Activity" description="Track distributor and wholesaler order volumes and performance." />
          <Step number={4} title="Export Reports" description="Download detailed reports for offline analysis and record-keeping." />
        </GuideSection>

        <GuideSection title="Staff Management" icon={Users}>
          <p className="mb-4">Manage your team members and their access levels:</p>
          <Step number={1} title="Add New Staff" description="Click 'Add Staff' button, fill in details (name, email, role), and save." />
          <Step number={2} title="Assign Roles" description="Choose from: Sales Staff, CCO (Customer Care), Marketer. Each role has specific permissions." />
          <Step number={3} title="Edit Staff Details" description="Click the edit icon next to any staff member to update their information." />
          <Step number={4} title="Deactivate Staff" description="Toggle the active status to revoke access without deleting the account." />
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800"><strong>Important:</strong> Always use strong passwords and regularly review staff access levels.</p>
          </div>
        </GuideSection>

        <GuideSection title="Partner Management" icon={Truck}>
          <p className="mb-4">Manage distributors and wholesalers across Nigeria:</p>
          <Step number={1} title="View Partners" description="See all registered distributors and wholesalers with their details and status." />
          <Step number={2} title="Add New Partner" description="Register new distributors with their business details, bank information, and assigned state." />
          <Step number={3} title="Update Partner Details" description="Edit partner information including bank accounts and contact details." />
          <Step number={4} title="Monitor Performance" description="Track each partner's order history, total purchases, and activity level." />
        </GuideSection>

        <GuideSection title="Order Management" icon={ShoppingCart}>
          <p className="mb-4">Handle all customer and partner orders:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li><strong>Pending:</strong> New orders awaiting acknowledgment</li>
            <li><strong>Acknowledged:</strong> Orders confirmed by distributors</li>
            <li><strong>Payment Confirmed:</strong> Payment received and verified</li>
            <li><strong>Processing:</strong> Orders being prepared</li>
            <li><strong>Dispatched:</strong> Orders sent for delivery</li>
            <li><strong>Delivered:</strong> Successfully completed orders</li>
            <li><strong>Escalated:</strong> Orders requiring admin attention</li>
          </ul>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800"><strong>Alert:</strong> Orders not acknowledged within 1 hour are automatically escalated.</p>
          </div>
        </GuideSection>

        <GuideSection title="Product Management" icon={Package}>
          <p className="mb-4">Manage your product catalog:</p>
          <Step number={1} title="Add Products" description="Click 'Add Product', enter name, SKU, description, prices (retail, wholesaler, distributor), and upload image." />
          <Step number={2} title="Set Pricing" description="Configure three price tiers: Retail (highest), Wholesaler (10% off), Distributor (lowest)." />
          <Step number={3} title="Manage Categories" description="Organize products into categories: Bandages, Wound Gels, Gauze, Solutions, etc." />
          <Step number={4} title="Stock Management" description="Update stock levels and set reorder alerts for low inventory." />
        </GuideSection>

        <GuideSection title="Content Management" icon={FileText}>
          <p className="mb-4">Update website content and educational materials:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Edit homepage banners and promotional content</li>
            <li>Update About page information</li>
            <li>Manage educational articles and resources</li>
            <li>Configure seminar listings and registration</li>
          </ul>
        </GuideSection>

        <GuideSection title="Feedback Management" icon={MessageCircle}>
          <p className="mb-4">Review and respond to customer feedback:</p>
          <Step number={1} title="View Feedback" description="See all customer reviews and ratings organized by date and status." />
          <Step number={2} title="Respond to Feedback" description="Click on any feedback to add an official response visible to the customer." />
          <Step number={3} title="Escalate Issues" description="Flag serious complaints for immediate attention and resolution." />
        </GuideSection>

        <GuideSection title="Access Settings" icon={Settings}>
          <p className="mb-4">Configure system-wide access controls:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Enable/disable retail customer registration</li>
            <li>Configure partner application requirements</li>
            <li>Set password policies and session timeouts</li>
            <li>Manage API keys and integrations</li>
          </ul>
        </GuideSection>

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-gray-600">Contact Bonnesante Medicals Support:</p>
          <p className="text-gray-700">📱 WhatsApp: 0707 679 3866</p>
          <p className="text-gray-700">📧 Email: support@bonnesantemedicals.com</p>
        </div>
      </div>
    </div>
  );
};

// Sales Staff User Guide
export const SalesUserGuide = () => {
  const contentRef = useRef(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Sales Staff User Guide</h1>
          <p className="text-gray-600">Your complete guide to managing sales operations</p>
        </div>
        <DownloadPDFButton contentRef={contentRef} filename="Sales_Staff_User_Guide" title="Sales Staff Guide" />
      </div>

      <div ref={contentRef} className="bg-white p-6 rounded-xl">
        <div className="text-center mb-8 pb-6 border-b">
          <h2 className="text-2xl font-bold text-primary-700">Bonnesante Medicals</h2>
          <h3 className="text-xl text-gray-700">Sales Staff User Guide</h3>
          <p className="text-sm text-gray-500 mt-2">Version 1.0 | January 2026</p>
        </div>

        <GuideSection title="Your Dashboard" icon={Home} defaultOpen={true}>
          <p className="mb-4">Your dashboard shows key metrics at a glance:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Today's Sales:</strong> Revenue generated today</li>
            <li><strong>Pending Orders:</strong> Orders needing attention</li>
            <li><strong>Total Customers:</strong> Your customer count</li>
            <li><strong>Monthly Target:</strong> Progress toward sales goals</li>
          </ul>
        </GuideSection>

        <GuideSection title="Managing Orders" icon={ShoppingCart}>
          <p className="mb-4">Process and track customer orders efficiently:</p>
          <Step number={1} title="View Pending Orders" description="Check the Orders page for new orders requiring processing." />
          <Step number={2} title="Acknowledge Orders" description="Click 'Acknowledge' to confirm you're handling the order." />
          <Step number={3} title="Update Status" description="Change order status as it progresses: Processing → Dispatched → Delivered." />
          <Step number={4} title="Contact Customers" description="Use the phone or WhatsApp buttons to communicate with customers about their orders." />
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-800"><strong>Remember:</strong> Acknowledge orders within 1 hour to avoid escalation!</p>
          </div>
        </GuideSection>

        <GuideSection title="Customer Management" icon={Users}>
          <p className="mb-4">Build and maintain customer relationships:</p>
          <Step number={1} title="View Customer List" description="Access all registered customers with their contact details and order history." />
          <Step number={2} title="Customer Details" description="Click on any customer to see their complete profile and past orders." />
          <Step number={3} title="Add Notes" description="Record important information about customer preferences or special requirements." />
          <Step number={4} title="Follow Up" description="Use contact buttons to reach out for feedback or repeat orders." />
        </GuideSection>

        <GuideSection title="Product Information" icon={Package}>
          <p className="mb-4">Access product details to assist customers:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>View complete product catalog with images and descriptions</li>
            <li>Check current stock levels and availability</li>
            <li>See pricing for all customer types</li>
            <li>Access product specifications and usage information</li>
          </ul>
        </GuideSection>

        <GuideSection title="Submitting Feedback" icon={MessageCircle}>
          <p className="mb-4">Report issues and share insights with management:</p>
          <Step number={1} title="Open Feedback Form" description="Navigate to the Feedback page from your menu." />
          <Step number={2} title="Select Category" description="Choose: Product Issue, Customer Complaint, Suggestion, or Other." />
          <Step number={3} title="Describe Issue" description="Provide detailed information to help resolve the matter quickly." />
          <Step number={4} title="Track Response" description="Check back for management responses to your feedback." />
        </GuideSection>

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Tips</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Check your dashboard first thing each morning</li>
            <li>Respond to customer inquiries promptly</li>
            <li>Keep order statuses updated in real-time</li>
            <li>Report any issues immediately through feedback</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// CCO User Guide
export const CCOUserGuide = () => {
  const contentRef = useRef(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Customer Care Officer Guide</h1>
          <p className="text-gray-600">Your complete guide to customer support operations</p>
        </div>
        <DownloadPDFButton contentRef={contentRef} filename="CCO_User_Guide" title="CCO User Guide" />
      </div>

      <div ref={contentRef} className="bg-white p-6 rounded-xl">
        <div className="text-center mb-8 pb-6 border-b">
          <h2 className="text-2xl font-bold text-primary-700">Bonnesante Medicals</h2>
          <h3 className="text-xl text-gray-700">Customer Care Officer Guide</h3>
          <p className="text-sm text-gray-500 mt-2">Version 1.0 | January 2026</p>
        </div>

        <GuideSection title="Dashboard Overview" icon={Home} defaultOpen={true}>
          <p className="mb-4">Monitor customer care metrics:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Open Tickets:</strong> Unresolved customer issues</li>
            <li><strong>Pending Escalations:</strong> Orders requiring urgent attention</li>
            <li><strong>Response Rate:</strong> Your communication efficiency</li>
            <li><strong>Customer Satisfaction:</strong> Average feedback rating</li>
          </ul>
        </GuideSection>

        <GuideSection title="Managing Feedback" icon={MessageCircle}>
          <p className="mb-4">Handle customer feedback professionally:</p>
          <Step number={1} title="Review New Feedback" description="Check the Feedback page regularly for new customer submissions." />
          <Step number={2} title="Categorize Issues" description="Identify the type: Complaint, Question, Suggestion, or Praise." />
          <Step number={3} title="Respond Promptly" description="Click 'Respond' to send an official reply to the customer." />
          <Step number={4} title="Escalate if Needed" description="Forward complex issues to appropriate departments or management." />
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800"><strong>Best Practice:</strong> Respond to all feedback within 24 hours.</p>
          </div>
        </GuideSection>

        <GuideSection title="Handling Escalations" icon={AlertTriangle}>
          <p className="mb-4">Manage escalated orders effectively:</p>
          <Step number={1} title="View Escalated Orders" description="Access the Escalations page to see orders that weren't acknowledged in time." />
          <Step number={2} title="Investigate Issue" description="Contact the assigned distributor to understand the delay." />
          <Step number={3} title="Reassign if Necessary" description="Transfer the order to another distributor if the original cannot fulfill it." />
          <Step number={4} title="Communicate with Customer" description="Keep the customer informed about their order status and resolution." />
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800"><strong>Priority:</strong> Escalated orders should be resolved within 2 hours.</p>
          </div>
        </GuideSection>

        <GuideSection title="Communications Center" icon={Phone}>
          <p className="mb-4">Manage all customer communications:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>View communication history with customers</li>
            <li>Send SMS and email notifications</li>
            <li>Initiate WhatsApp conversations</li>
            <li>Log phone calls and outcomes</li>
          </ul>
          <Step number={1} title="Select Customer" description="Find the customer using search or from order details." />
          <Step number={2} title="Choose Channel" description="Pick the best communication method: Phone, WhatsApp, SMS, or Email." />
          <Step number={3} title="Send Message" description="Compose and send your message or initiate a call." />
          <Step number={4} title="Log Interaction" description="Record the outcome for future reference." />
        </GuideSection>

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-3">Customer Service Tips</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Always greet customers professionally</li>
            <li>Listen actively and show empathy</li>
            <li>Provide clear, accurate information</li>
            <li>Follow up on resolved issues</li>
            <li>Document all interactions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Marketer User Guide
export const MarketerUserGuide = () => {
  const contentRef = useRef(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Marketer User Guide</h1>
          <p className="text-gray-600">Your complete guide to marketing operations</p>
        </div>
        <DownloadPDFButton contentRef={contentRef} filename="Marketer_User_Guide" title="Marketer User Guide" />
      </div>

      <div ref={contentRef} className="bg-white p-6 rounded-xl">
        <div className="text-center mb-8 pb-6 border-b">
          <h2 className="text-2xl font-bold text-primary-700">Bonnesante Medicals</h2>
          <h3 className="text-xl text-gray-700">Marketer User Guide</h3>
          <p className="text-sm text-gray-500 mt-2">Version 1.0 | January 2026</p>
        </div>

        <GuideSection title="Dashboard Overview" icon={Home} defaultOpen={true}>
          <p className="mb-4">Track your marketing performance:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Total Leads:</strong> Number of leads in your pipeline</li>
            <li><strong>Conversion Rate:</strong> Percentage of leads becoming customers</li>
            <li><strong>Follow-ups Due:</strong> Leads requiring contact today</li>
            <li><strong>Monthly Target:</strong> Progress toward acquisition goals</li>
          </ul>
        </GuideSection>

        <GuideSection title="Lead Management" icon={Users}>
          <p className="mb-4">Manage and convert leads effectively:</p>
          <Step number={1} title="Add New Leads" description="Click 'Add Lead' and enter contact details, source, and notes." />
          <Step number={2} title="Categorize Leads" description="Set lead status: New, Contacted, Interested, Qualified, or Converted." />
          <Step number={3} title="Schedule Follow-ups" description="Set reminders for when to contact each lead next." />
          <Step number={4} title="Track Interactions" description="Log all calls, meetings, and communications with each lead." />
          <Step number={5} title="Convert to Customer" description="When a lead makes a purchase, mark them as Converted." />
        </GuideSection>

        <GuideSection title="Quick Actions" icon={Clock}>
          <p className="mb-4">Use quick action buttons for efficiency:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Add Lead:</strong> Quickly capture new lead information</li>
            <li><strong>Log Call:</strong> Record details of phone conversations</li>
            <li><strong>Schedule Meeting:</strong> Set up appointments with prospects</li>
            <li><strong>View Reports:</strong> Access your performance analytics</li>
          </ul>
        </GuideSection>

        <GuideSection title="Reports & Analytics" icon={BarChart3}>
          <p className="mb-4">Analyze your marketing effectiveness:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Lead sources performance (which channels work best)</li>
            <li>Conversion funnel analysis</li>
            <li>Time-to-conversion metrics</li>
            <li>Monthly and quarterly trends</li>
          </ul>
          <Step number={1} title="Select Date Range" description="Choose the time period you want to analyze." />
          <Step number={2} title="View Charts" description="See visual representations of your performance data." />
          <Step number={3} title="Export Data" description="Download reports for presentations or record-keeping." />
        </GuideSection>

        <GuideSection title="Submitting Feedback" icon={MessageCircle}>
          <p className="mb-4">Share insights and report issues:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Report market insights and competitor information</li>
            <li>Suggest new marketing initiatives</li>
            <li>Flag issues with marketing materials</li>
            <li>Share customer feedback and trends</li>
          </ul>
        </GuideSection>

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-3">Marketing Best Practices</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Follow up with leads within 24 hours</li>
            <li>Personalize your communications</li>
            <li>Track all interactions diligently</li>
            <li>Focus on high-quality leads over quantity</li>
            <li>Learn about wound care products thoroughly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Distributor User Guide
export const DistributorUserGuide = () => {
  const contentRef = useRef(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Distributor Partner Guide</h1>
          <p className="text-gray-600">Your complete guide to being a Bonnesante Medicals Distributor</p>
        </div>
        <DownloadPDFButton contentRef={contentRef} filename="Distributor_Partner_Guide" title="Distributor Guide" />
      </div>

      <div ref={contentRef} className="bg-white p-6 rounded-xl">
        <div className="text-center mb-8 pb-6 border-b">
          <h2 className="text-2xl font-bold text-primary-700">Bonnesante Medicals</h2>
          <h3 className="text-xl text-gray-700">Distributor Partner Guide</h3>
          <p className="text-sm text-gray-500 mt-2">Version 1.0 | January 2026</p>
        </div>

        <GuideSection title="Welcome to the Partnership" icon={Home} defaultOpen={true}>
          <p className="mb-4">As a Bonnesante Medicals Distributor, you enjoy:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Distributor Pricing:</strong> The best prices on all products</li>
            <li><strong>Order Management:</strong> Process retail customer orders in your state</li>
            <li><strong>Inventory Tracking:</strong> Manage your stock levels efficiently</li>
            <li><strong>Performance Insights:</strong> Track your business growth</li>
          </ul>
        </GuideSection>

        <GuideSection title="Ordering Products" icon={ShoppingCart}>
          <p className="mb-4">Place orders for your inventory:</p>
          <Step number={1} title="Browse Products" description="Go to 'Order Products' to see all available items at distributor prices." />
          <Step number={2} title="Add to Cart" description="Click 'Add to Order' for products you want. Use +/- to adjust quantities." />
          <Step number={3} title="Review Cart" description="Click the floating cart button to review your order." />
          <Step number={4} title="Place Order" description="Confirm your order details and click 'Place Order'." />
          <Step number={5} title="Make Payment" description="Transfer the total amount to Bonnesante Medicals account." />

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <CreditCard size={18} /> Payment Details
            </h4>
            <p className="text-yellow-800 mb-2"><strong>Account Name:</strong> Bonnesante Medicals</p>
            <div className="space-y-2 text-sm">
              <p className="text-yellow-800">
                <strong>Bank:</strong> Access Bank | <strong>Account:</strong> 1379643548
              </p>
              <p className="text-yellow-800">
                <strong>Bank:</strong> Moniepoint | <strong>Account:</strong> 8259518195
              </p>
            </div>
            <p className="text-yellow-900 mt-3 font-medium">
              📱 Send payment proof via WhatsApp to: 0707 679 3866
            </p>
          </div>
        </GuideSection>

        <GuideSection title="Managing Customer Orders" icon={Package}>
          <p className="mb-4">Handle orders from retail customers in your state:</p>
          <Step number={1} title="Receive Notification" description="You'll be notified when a customer in your state places an order." />
          <Step number={2} title="Acknowledge Order" description="Click 'Acknowledge' within 1 hour to prevent escalation." />
          <Step number={3} title="Receive Payment" description="Customer will send payment proof to your WhatsApp." />
          <Step number={4} title="Confirm Payment" description="Verify payment and update order status to 'Payment Confirmed'." />
          <Step number={5} title="Fulfill Order" description="Prepare and deliver the order, then mark as 'Delivered'." />
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800"><strong>Important:</strong> Orders not acknowledged within 1 hour are automatically escalated to management.</p>
          </div>
        </GuideSection>

        <GuideSection title="Inventory Management" icon={Truck}>
          <p className="mb-4">Keep track of your stock levels:</p>
          <Step number={1} title="Add Products" description="Add products to your inventory with initial quantities." />
          <Step number={2} title="Set Reorder Levels" description="Configure alerts for when stock falls below minimum levels." />
          <Step number={3} title="Restock Items" description="Record new stock arrivals to update inventory." />
          <Step number={4} title="Adjust Stock" description="Make corrections for damages, samples, or counting errors." />
          <Step number={5} title="View History" description="Track all inventory changes with timestamps and notes." />
        </GuideSection>

        <GuideSection title="Performance Tracking" icon={TrendingUp}>
          <p className="mb-4">Monitor your business performance:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Total Orders:</strong> Number of orders you've placed</li>
            <li><strong>Total Value:</strong> Cumulative value of your purchases</li>
            <li><strong>Average Order:</strong> Typical order size</li>
            <li><strong>Monthly Breakdown:</strong> Detailed performance by month</li>
          </ul>
          <p className="mt-4 text-gray-600">Use time filters to analyze different periods: Last 7 days, 30 days, 90 days, or all time.</p>
        </GuideSection>

        <GuideSection title="Submitting Feedback" icon={MessageCircle}>
          <p className="mb-4">Share your experiences and suggestions:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Report product quality issues</li>
            <li>Suggest new products or improvements</li>
            <li>Share market insights from your region</li>
            <li>Request support for specific challenges</li>
          </ul>
        </GuideSection>

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-3">Contact & Support</h3>
          <p className="text-gray-600 mb-2">For assistance, contact Bonnesante Medicals:</p>
          <p className="text-gray-700">📱 WhatsApp: 0707 679 3866</p>
          <p className="text-gray-700">📧 Email: partners@bonnesantemedicals.com</p>
        </div>
      </div>
    </div>
  );
};

// Wholesaler User Guide
export const WholesalerUserGuide = () => {
  const contentRef = useRef(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Wholesaler Partner Guide</h1>
          <p className="text-gray-600">Your complete guide to being a Bonnesante Medicals Wholesaler</p>
        </div>
        <DownloadPDFButton contentRef={contentRef} filename="Wholesaler_Partner_Guide" title="Wholesaler Guide" />
      </div>

      <div ref={contentRef} className="bg-white p-6 rounded-xl">
        <div className="text-center mb-8 pb-6 border-b">
          <h2 className="text-2xl font-bold text-primary-700">Bonnesante Medicals</h2>
          <h3 className="text-xl text-gray-700">Wholesaler Partner Guide</h3>
          <p className="text-sm text-gray-500 mt-2">Version 1.0 | January 2026</p>
        </div>

        <GuideSection title="Welcome to the Partnership" icon={Home} defaultOpen={true}>
          <p className="mb-4">As a Bonnesante Medicals Wholesaler, you enjoy:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Wholesaler Pricing:</strong> 10% discount off retail prices</li>
            <li><strong>Bulk Orders:</strong> Order in larger quantities</li>
            <li><strong>Performance Tracking:</strong> Monitor your purchase history</li>
            <li><strong>Priority Support:</strong> Dedicated partner assistance</li>
          </ul>
        </GuideSection>

        <GuideSection title="Ordering Products" icon={ShoppingCart}>
          <p className="mb-4">Place orders at wholesaler prices:</p>
          <Step number={1} title="Browse Products" description="Go to 'Order Products' to see all items at your special pricing." />
          <Step number={2} title="Add to Cart" description="Click 'Add to Order' and adjust quantities as needed." />
          <Step number={3} title="Review Order" description="Click the cart button to see your order summary." />
          <Step number={4} title="Place Order" description="Confirm details and submit your order." />
          <Step number={5} title="Make Payment" description="Transfer to Bonnesante Medicals account and send proof." />

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <CreditCard size={18} /> Payment Details
            </h4>
            <p className="text-yellow-800 mb-2"><strong>Account Name:</strong> Bonnesante Medicals</p>
            <div className="space-y-2 text-sm">
              <p className="text-yellow-800">
                <strong>Bank:</strong> Access Bank | <strong>Account:</strong> 1379643548
              </p>
              <p className="text-yellow-800">
                <strong>Bank:</strong> Moniepoint | <strong>Account:</strong> 8259518195
              </p>
            </div>
            <p className="text-yellow-900 mt-3 font-medium">
              📱 Send payment proof via WhatsApp to: 0707 679 3866
            </p>
          </div>
        </GuideSection>

        <GuideSection title="Viewing Your Orders" icon={Package}>
          <p className="mb-4">Track all your orders in one place:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>View order history with dates and amounts</li>
            <li>Check order status: Pending, Processing, Delivered</li>
            <li>See itemized details for each order</li>
            <li>Track delivery progress</li>
          </ul>
        </GuideSection>

        <GuideSection title="Performance Dashboard" icon={TrendingUp}>
          <p className="mb-4">Understand your purchasing patterns:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Total Orders:</strong> Count of all orders placed</li>
            <li><strong>Total Value:</strong> Sum of all purchases</li>
            <li><strong>Average Order Value:</strong> Typical order size</li>
            <li><strong>Completed Orders:</strong> Successfully delivered orders</li>
          </ul>
          <p className="mt-4 text-gray-600">Filter by time period to analyze trends and plan your purchasing strategy.</p>
        </GuideSection>

        <GuideSection title="Submitting Feedback" icon={MessageCircle}>
          <p className="mb-4">We value your input:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Share product feedback and suggestions</li>
            <li>Report any delivery issues</li>
            <li>Request new products</li>
            <li>Provide market insights</li>
          </ul>
        </GuideSection>

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-3">Contact & Support</h3>
          <p className="text-gray-600 mb-2">For assistance, contact Bonnesante Medicals:</p>
          <p className="text-gray-700">📱 WhatsApp: 0707 679 3866</p>
          <p className="text-gray-700">📧 Email: partners@bonnesantemedicals.com</p>
        </div>
      </div>
    </div>
  );
};

// Main User Guide Component (for selecting guide based on role)
const UserGuide = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'distributor';

  switch (role) {
    case 'admin':
      return <AdminUserGuide />;
    case 'sales':
      return <SalesUserGuide />;
    case 'cco':
      return <CCOUserGuide />;
    case 'marketer':
      return <MarketerUserGuide />;
    case 'distributor':
      return <DistributorUserGuide />;
    case 'wholesaler':
      return <WholesalerUserGuide />;
    default:
      return <DistributorUserGuide />;
  }
};

export default UserGuide;
