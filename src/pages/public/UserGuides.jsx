import React, { useState, useRef } from 'react';
import { 
  Book, Download, ChevronDown, ChevronUp, User, Users, 
  ShoppingCart, Package, TrendingUp, MessageCircle, Settings,
  Shield, Truck, BarChart3, Phone, FileText, CheckCircle,
  AlertCircle, CreditCard, Clock, Search, Plus, Minus
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const UserGuides = () => {
  const [activeGuide, setActiveGuide] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const guideRef = useRef(null);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const downloadPDF = async (guideId, guideTitle) => {
    const element = document.getElementById(`guide-content-${guideId}`);
    if (!element) return;

    try {
      // Create a clone for PDF generation
      const clone = element.cloneNode(true);
      clone.style.width = '800px';
      clone.style.padding = '40px';
      clone.style.backgroundColor = 'white';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${guideTitle.replace(/\s+/g, '_')}_User_Guide.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const guides = [
    {
      id: 'retail',
      title: 'Retail Customer Guide',
      icon: ShoppingCart,
      color: 'blue',
      description: 'How to browse products, place orders, and track deliveries',
      sections: [
        {
          title: 'Getting Started',
          content: `
            <h4>1. Register as a Retail Customer</h4>
            <ul>
              <li>Visit the website and click "Shop Now" or navigate to the retail access page</li>
              <li>Enter your full name, email address, phone number, and select your state</li>
              <li>Provide your delivery address for order fulfillment</li>
              <li>Click "Continue to Shop" to access the product catalog</li>
            </ul>
            
            <h4>2. Browse Products</h4>
            <ul>
              <li>View all available wound care products on the shop page</li>
              <li>Use the search bar to find specific products by name or SKU</li>
              <li>Filter products by category using the dropdown menu</li>
              <li>Click on any product to view detailed information</li>
            </ul>
          `
        },
        {
          title: 'Placing Orders',
          content: `
            <h4>1. Add Products to Cart</h4>
            <ul>
              <li>Click the "Add to Cart" button on any product</li>
              <li>Adjust quantities using the + and - buttons</li>
              <li>View your cart by clicking the cart icon in the header</li>
              <li>Remove items by clicking the trash icon</li>
            </ul>
            
            <h4>2. Checkout Process</h4>
            <ul>
              <li>Review your order summary in the cart</li>
              <li>Confirm your delivery address and contact details</li>
              <li>Select your preferred delivery mode (Pickup, Dispatch, or Courier)</li>
              <li>Choose urgency level if needed (Routine or Urgent)</li>
              <li>Click "Place Order" to submit your order</li>
            </ul>
            
            <h4>3. Payment</h4>
            <ul>
              <li>Your order invoice will display the distributor's bank account details</li>
              <li>Transfer the exact order amount to the provided bank account</li>
              <li>Send your payment proof (receipt/screenshot) via WhatsApp</li>
              <li>Click the WhatsApp button on the order confirmation page</li>
            </ul>
          `
        },
        {
          title: 'Order Tracking',
          content: `
            <h4>Track Your Order</h4>
            <ul>
              <li>After placing an order, you'll receive an order number</li>
              <li>Visit the "Track Order" page and enter your order number</li>
              <li>View real-time status updates:
                <ul>
                  <li><strong>Pending:</strong> Order received, awaiting acknowledgment</li>
                  <li><strong>Acknowledged:</strong> Distributor has confirmed your order</li>
                  <li><strong>Payment Confirmed:</strong> Payment verified</li>
                  <li><strong>Processing:</strong> Order being prepared</li>
                  <li><strong>Dispatched:</strong> Order on its way</li>
                  <li><strong>Delivered:</strong> Order completed</li>
                </ul>
              </li>
              <li>Contact your distributor directly if you have questions</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'distributor',
      title: 'Distributor/Partner Guide',
      icon: Truck,
      color: 'green',
      description: 'Manage inventory, place orders at distributor prices, and track performance',
      sections: [
        {
          title: 'Dashboard Overview',
          content: `
            <h4>Your Dashboard</h4>
            <ul>
              <li><strong>Dashboard:</strong> Overview of your orders, pending items, and key metrics</li>
              <li><strong>Order Products:</strong> Browse and order products at distributor prices</li>
              <li><strong>My Orders:</strong> View all orders you've placed</li>
              <li><strong>Inventory:</strong> Manage your stock levels</li>
              <li><strong>Performance:</strong> Track your ordering activity and metrics</li>
              <li><strong>Feedback:</strong> Submit feedback to the admin team</li>
            </ul>
          `
        },
        {
          title: 'Placing Orders',
          content: `
            <h4>1. Browse Products</h4>
            <ul>
              <li>Navigate to "Order Products" from the sidebar menu</li>
              <li>View all products with your special distributor pricing</li>
              <li>Use search and category filters to find products</li>
              <li>See your savings compared to retail prices</li>
            </ul>
            
            <h4>2. Add to Cart</h4>
            <ul>
              <li>Click "Add to Order" on any product</li>
              <li>Adjust quantities using + and - buttons</li>
              <li>Your cart total appears in the floating button at the bottom</li>
              <li>Click the cart button to proceed to checkout</li>
            </ul>
            
            <h4>3. Checkout & Payment</h4>
            <ul>
              <li>Review your order items and total</li>
              <li>Add any delivery notes if needed</li>
              <li>View payment details:
                <ul>
                  <li><strong>Account Name:</strong> Bonnesante Medicals</li>
                  <li><strong>Access Bank:</strong> 1379643548</li>
                  <li><strong>Moniepoint:</strong> 8259518195</li>
                </ul>
              </li>
              <li>Click "Place Order" to submit</li>
              <li>Send payment proof via WhatsApp to 0707 679 3866</li>
            </ul>
          `
        },
        {
          title: 'Inventory Management',
          content: `
            <h4>Managing Your Stock</h4>
            <ul>
              <li>Navigate to "Inventory" from the sidebar</li>
              <li><strong>Add Products:</strong> Click "Add Product" to add items to your inventory</li>
              <li><strong>Restock:</strong> Update quantities when you receive new stock</li>
              <li><strong>Adjust Stock:</strong> Correct inventory for damages, returns, etc.</li>
              <li><strong>Low Stock Alerts:</strong> Items below reorder level are highlighted</li>
              <li><strong>Transaction History:</strong> View all inventory movements</li>
            </ul>
            
            <h4>Inventory Summary</h4>
            <ul>
              <li>Total products in your inventory</li>
              <li>Total stock value at your cost price</li>
              <li>Number of low stock items needing attention</li>
              <li>Out of stock items requiring immediate reorder</li>
            </ul>
          `
        },
        {
          title: 'Performance Tracking',
          content: `
            <h4>Track Your Activity</h4>
            <ul>
              <li>Navigate to "Performance" from the sidebar</li>
              <li>View key metrics:
                <ul>
                  <li><strong>Total Orders:</strong> Number of orders placed</li>
                  <li><strong>Total Value:</strong> Sum of all order amounts</li>
                  <li><strong>Average Order Value:</strong> Your typical order size</li>
                  <li><strong>Completed Orders:</strong> Successfully delivered orders</li>
                </ul>
              </li>
              <li>Filter by time period (All Time, 7 Days, 30 Days, 90 Days)</li>
              <li>View monthly breakdown of your ordering activity</li>
              <li>See recent orders with status updates</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'wholesaler',
      title: 'Wholesaler Guide',
      icon: Package,
      color: 'purple',
      description: 'Order products at wholesale prices and track your business performance',
      sections: [
        {
          title: 'Dashboard Overview',
          content: `
            <h4>Your Dashboard</h4>
            <ul>
              <li><strong>Dashboard:</strong> Overview of orders, total value, and pending items</li>
              <li><strong>Order Products:</strong> Browse and order at wholesaler prices (10% off retail)</li>
              <li><strong>My Orders:</strong> View your complete order history</li>
              <li><strong>Performance:</strong> Track ordering metrics and activity</li>
              <li><strong>Feedback:</strong> Submit feedback or suggestions</li>
            </ul>
          `
        },
        {
          title: 'Placing Orders',
          content: `
            <h4>1. Browse Products</h4>
            <ul>
              <li>Go to "Order Products" in the sidebar</li>
              <li>All products show your special wholesaler price (10% off retail)</li>
              <li>Search by product name or SKU</li>
              <li>Filter by product category</li>
            </ul>
            
            <h4>2. Checkout Process</h4>
            <ul>
              <li>Add products to your cart</li>
              <li>Review order summary</li>
              <li>Note the payment details:
                <ul>
                  <li><strong>Account Name:</strong> Bonnesante Medicals</li>
                  <li><strong>Access Bank:</strong> 1379643548</li>
                  <li><strong>Moniepoint:</strong> 8259518195</li>
                </ul>
              </li>
              <li>Place your order and make payment</li>
              <li>Send payment proof to WhatsApp: 0707 679 3866</li>
            </ul>
          `
        },
        {
          title: 'Performance Tracking',
          content: `
            <h4>Monitor Your Business</h4>
            <ul>
              <li>Access the "Performance" page from sidebar</li>
              <li>Key metrics displayed:
                <ul>
                  <li>Total orders placed</li>
                  <li>Total order value</li>
                  <li>Average order size</li>
                  <li>Completion rate</li>
                </ul>
              </li>
              <li>Use time filters to analyze specific periods</li>
              <li>Track your growth over time</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'sales',
      title: 'Sales Staff Guide',
      icon: TrendingUp,
      color: 'orange',
      description: 'Manage orders, customers, and track sales performance',
      sections: [
        {
          title: 'Dashboard Overview',
          content: `
            <h4>Sales Dashboard</h4>
            <ul>
              <li><strong>Dashboard:</strong> Sales overview with key metrics and charts</li>
              <li><strong>Orders:</strong> View and manage all customer orders</li>
              <li><strong>Customers:</strong> Customer database and management</li>
              <li><strong>Products:</strong> View product catalog and pricing</li>
              <li><strong>Feedback:</strong> Submit reports and feedback</li>
            </ul>
          `
        },
        {
          title: 'Managing Orders',
          content: `
            <h4>Order Management</h4>
            <ul>
              <li>View all orders with status filters</li>
              <li>Search orders by order number or customer name</li>
              <li>Update order status as needed</li>
              <li>View order details including items, amounts, and customer info</li>
              <li>Track pending vs completed orders</li>
            </ul>
            
            <h4>Order Statuses</h4>
            <ul>
              <li><strong>Pending:</strong> New order awaiting action</li>
              <li><strong>Acknowledged:</strong> Order confirmed</li>
              <li><strong>Payment Confirmed:</strong> Payment received</li>
              <li><strong>Processing:</strong> Being prepared</li>
              <li><strong>Dispatched:</strong> Shipped to customer</li>
              <li><strong>Delivered:</strong> Successfully completed</li>
            </ul>
          `
        },
        {
          title: 'Customer Management',
          content: `
            <h4>Customers Page</h4>
            <ul>
              <li>View all registered customers</li>
              <li>Search customers by name, email, or phone</li>
              <li>Filter by state or registration date</li>
              <li>View customer order history</li>
              <li>Contact customers directly via phone or email</li>
            </ul>
          `
        },
        {
          title: 'Submitting Feedback',
          content: `
            <h4>Feedback System</h4>
            <ul>
              <li>Navigate to "Feedback" in the sidebar</li>
              <li>Select feedback type (Report, Suggestion, Issue)</li>
              <li>Enter detailed description</li>
              <li>Attach screenshots if needed</li>
              <li>Track response from admin team</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'cco',
      title: 'Customer Care Officer (CCO) Guide',
      icon: MessageCircle,
      color: 'cyan',
      description: 'Handle customer inquiries, escalations, and communications',
      sections: [
        {
          title: 'Dashboard Overview',
          content: `
            <h4>CCO Dashboard</h4>
            <ul>
              <li><strong>Dashboard:</strong> Overview of support tickets and escalations</li>
              <li><strong>Feedback:</strong> View and respond to customer feedback</li>
              <li><strong>Escalations:</strong> Handle escalated orders and issues</li>
              <li><strong>Communications:</strong> Send announcements and notifications</li>
            </ul>
          `
        },
        {
          title: 'Managing Feedback',
          content: `
            <h4>Feedback Management</h4>
            <ul>
              <li>View all submitted feedback from customers and staff</li>
              <li>Filter by status (Pending, In Progress, Resolved)</li>
              <li>Respond to feedback with detailed solutions</li>
              <li>Mark feedback as resolved when addressed</li>
              <li>Track response times and satisfaction</li>
            </ul>
          `
        },
        {
          title: 'Handling Escalations',
          content: `
            <h4>Escalation Management</h4>
            <ul>
              <li>Orders are automatically escalated if not acknowledged within 1 hour</li>
              <li>View all escalated orders on the Escalations page</li>
              <li>Contact distributors to resolve delays</li>
              <li>Update order status and add notes</li>
              <li>Close escalations when resolved</li>
            </ul>
          `
        },
        {
          title: 'Communications',
          content: `
            <h4>Sending Communications</h4>
            <ul>
              <li>Create announcements for customers or staff</li>
              <li>Select target audience (All, Customers, Partners, Staff)</li>
              <li>Choose communication type (Announcement, Alert, Update)</li>
              <li>Write message content</li>
              <li>Send immediately or schedule for later</li>
              <li>View communication history</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'marketer',
      title: 'Marketer Guide',
      icon: Users,
      color: 'pink',
      description: 'Manage leads, track marketing campaigns, and generate reports',
      sections: [
        {
          title: 'Dashboard Overview',
          content: `
            <h4>Marketer Dashboard</h4>
            <ul>
              <li><strong>Dashboard:</strong> Marketing metrics and quick actions</li>
              <li><strong>Leads:</strong> Manage potential customers and partners</li>
              <li><strong>Feedback:</strong> Submit marketing reports</li>
              <li><strong>Reports:</strong> View marketing performance analytics</li>
            </ul>
            
            <h4>Quick Actions</h4>
            <ul>
              <li><strong>Add Lead:</strong> Navigate to leads page to add new leads</li>
              <li><strong>Log Call:</strong> Record call activities with leads</li>
              <li><strong>Schedule Meeting:</strong> Plan meetings with prospects</li>
              <li><strong>View Reports:</strong> Access detailed analytics</li>
            </ul>
          `
        },
        {
          title: 'Lead Management',
          content: `
            <h4>Managing Leads</h4>
            <ul>
              <li>Add new leads with contact details</li>
              <li>Categorize leads by source and status</li>
              <li>Track lead progression through the funnel</li>
              <li>Update lead status as they convert</li>
              <li>Search and filter leads</li>
            </ul>
            
            <h4>Lead Statuses</h4>
            <ul>
              <li><strong>New:</strong> Fresh lead, not yet contacted</li>
              <li><strong>Contacted:</strong> Initial contact made</li>
              <li><strong>Qualified:</strong> Confirmed as potential customer</li>
              <li><strong>Negotiating:</strong> Discussing terms</li>
              <li><strong>Converted:</strong> Became a customer/partner</li>
              <li><strong>Lost:</strong> Did not convert</li>
            </ul>
          `
        },
        {
          title: 'Reports & Analytics',
          content: `
            <h4>Marketing Reports</h4>
            <ul>
              <li>View lead conversion rates</li>
              <li>Track campaign performance</li>
              <li>Analyze lead sources</li>
              <li>Monitor team activity</li>
              <li>Export reports for presentations</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'admin',
      title: 'Administrator Guide',
      icon: Shield,
      color: 'red',
      description: 'Full system administration including users, products, and settings',
      sections: [
        {
          title: 'Dashboard Overview',
          content: `
            <h4>Admin Dashboard</h4>
            <ul>
              <li><strong>Dashboard:</strong> System-wide overview and key metrics</li>
              <li><strong>Analytics:</strong> Detailed business intelligence</li>
              <li><strong>Staff Management:</strong> Add/manage staff accounts</li>
              <li><strong>Partners:</strong> Manage distributors and wholesalers</li>
              <li><strong>Orders:</strong> View and manage all orders</li>
              <li><strong>Products:</strong> Product catalog management</li>
              <li><strong>Distributors:</strong> Regional distributor management</li>
              <li><strong>Users:</strong> Customer account management</li>
              <li><strong>Feedback:</strong> View and respond to all feedback</li>
              <li><strong>Reports:</strong> Generate business reports</li>
              <li><strong>Content:</strong> Website content management</li>
              <li><strong>Data Sync:</strong> Database synchronization</li>
              <li><strong>Access Settings:</strong> Control feature access</li>
              <li><strong>Settings:</strong> System configuration</li>
            </ul>
          `
        },
        {
          title: 'Staff Management',
          content: `
            <h4>Managing Staff</h4>
            <ul>
              <li>Navigate to "Staff Management" in sidebar</li>
              <li>View all staff members and their roles</li>
              <li>Add new staff with role assignment:
                <ul>
                  <li>Sales Staff</li>
                  <li>Customer Care Officer (CCO)</li>
                  <li>Marketer</li>
                </ul>
              </li>
              <li>Edit staff details and permissions</li>
              <li>Deactivate staff accounts when needed</li>
              <li>Reset staff passwords</li>
            </ul>
          `
        },
        {
          title: 'Partner Management',
          content: `
            <h4>Managing Partners</h4>
            <ul>
              <li>View all distributors and wholesalers</li>
              <li>Add new partners with details:
                <ul>
                  <li>Business name and contact info</li>
                  <li>Partner type (Distributor/Wholesaler)</li>
                  <li>State and zone assignment</li>
                  <li>Bank account details for payments</li>
                </ul>
              </li>
              <li>Approve pending partner applications</li>
              <li>Track partner performance</li>
              <li>Update partner status</li>
            </ul>
          `
        },
        {
          title: 'Product Management',
          content: `
            <h4>Managing Products</h4>
            <ul>
              <li>Navigate to "Products" in sidebar</li>
              <li>View all products in the catalog</li>
              <li>Add new products with:
                <ul>
                  <li>Product name and SKU</li>
                  <li>Description and category</li>
                  <li>Pricing (Retail and Distributor)</li>
                  <li>Product images</li>
                  <li>Stock information</li>
                </ul>
              </li>
              <li>Edit existing products</li>
              <li>Set products as featured</li>
              <li>Activate/deactivate products</li>
            </ul>
          `
        },
        {
          title: 'Order Management',
          content: `
            <h4>Managing Orders</h4>
            <ul>
              <li>View all orders across the platform</li>
              <li>Filter by status, date, or distributor</li>
              <li>Search by order number or customer</li>
              <li>Update order statuses</li>
              <li>Handle refunds and cancellations</li>
              <li>View order analytics and trends</li>
            </ul>
          `
        },
        {
          title: 'Content Management',
          content: `
            <h4>Managing Website Content</h4>
            <ul>
              <li>Navigate to "Content Management" in sidebar</li>
              <li>Edit homepage content:
                <ul>
                  <li>Hero section text and images</li>
                  <li>Featured products selection</li>
                  <li>Testimonials</li>
                </ul>
              </li>
              <li>Update About page content</li>
              <li>Manage seminar/event listings</li>
              <li>Edit contact information</li>
              <li>All changes sync across devices</li>
            </ul>
          `
        },
        {
          title: 'Access Settings',
          content: `
            <h4>Controlling Access</h4>
            <ul>
              <li>Navigate to "Access Settings" in sidebar</li>
              <li>Enable/disable retail customer registration</li>
              <li>Control partner application acceptance</li>
              <li>Set minimum order amounts</li>
              <li>Configure delivery options</li>
              <li>Manage payment methods</li>
            </ul>
          `
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-700 text-white py-12">
        <div className="container-custom">
          <div className="flex items-center gap-4 mb-4">
            <Book size={40} />
            <h1 className="text-4xl font-display font-bold">User Guides</h1>
          </div>
          <p className="text-primary-100 text-lg max-w-2xl">
            Comprehensive guides for all users of the Bonnesante Medicals platform. 
            Select your role below to view detailed instructions and download the PDF guide.
          </p>
        </div>
      </div>

      {/* Guide Selection */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {guides.map(guide => {
            const Icon = guide.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-50',
              green: 'bg-green-100 text-green-600 border-green-200 hover:bg-green-50',
              purple: 'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-50',
              orange: 'bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-50',
              cyan: 'bg-cyan-100 text-cyan-600 border-cyan-200 hover:bg-cyan-50',
              pink: 'bg-pink-100 text-pink-600 border-pink-200 hover:bg-pink-50',
              red: 'bg-red-100 text-red-600 border-red-200 hover:bg-red-50'
            };

            return (
              <button
                key={guide.id}
                onClick={() => setActiveGuide(activeGuide === guide.id ? null : guide.id)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  activeGuide === guide.id 
                    ? `${colorClasses[guide.color]} ring-2 ring-offset-2 ring-${guide.color}-500` 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  activeGuide === guide.id ? '' : `bg-${guide.color}-100`
                }`}>
                  <Icon size={24} className={activeGuide === guide.id ? '' : `text-${guide.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{guide.title}</h3>
                <p className="text-sm text-gray-600">{guide.description}</p>
              </button>
            );
          })}
        </div>

        {/* Active Guide Content */}
        {activeGuide && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {guides.filter(g => g.id === activeGuide).map(guide => {
              const Icon = guide.icon;
              return (
                <div key={guide.id}>
                  {/* Guide Header */}
                  <div className={`bg-${guide.color}-600 text-white p-6`} style={{
                    backgroundColor: guide.color === 'blue' ? '#2563eb' :
                                    guide.color === 'green' ? '#16a34a' :
                                    guide.color === 'purple' ? '#9333ea' :
                                    guide.color === 'orange' ? '#ea580c' :
                                    guide.color === 'cyan' ? '#0891b2' :
                                    guide.color === 'pink' ? '#db2777' :
                                    '#dc2626'
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Icon size={32} />
                        <div>
                          <h2 className="text-2xl font-bold">{guide.title}</h2>
                          <p className="text-white/80">{guide.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadPDF(guide.id, guide.title)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                      >
                        <Download size={20} />
                        Download PDF
                      </button>
                    </div>
                  </div>

                  {/* Guide Content */}
                  <div id={`guide-content-${guide.id}`} className="p-6">
                    <div className="space-y-4">
                      {guide.sections.map((section, idx) => (
                        <div key={idx} className="border rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleSection(`${guide.id}-${idx}`)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                          >
                            <span className="font-semibold text-gray-900">{section.title}</span>
                            {expandedSections[`${guide.id}-${idx}`] ? (
                              <ChevronUp size={20} className="text-gray-500" />
                            ) : (
                              <ChevronDown size={20} className="text-gray-500" />
                            )}
                          </button>
                          {expandedSections[`${guide.id}-${idx}`] && (
                            <div 
                              className="p-4 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: section.content }}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Payment Info for Partners */}
                    {(guide.id === 'distributor' || guide.id === 'wholesaler') && (
                      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                          <CreditCard size={24} />
                          Payment Information
                        </h3>
                        <div className="space-y-3">
                          <p className="font-medium text-yellow-800">Account Name: Bonnesante Medicals</p>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-yellow-200">
                              <p className="text-sm text-gray-600">Access Bank</p>
                              <p className="text-xl font-bold text-gray-900">1379643548</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-yellow-200">
                              <p className="text-sm text-gray-600">Moniepoint</p>
                              <p className="text-xl font-bold text-gray-900">8259518195</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-green-700 mt-4">
                            <MessageCircle size={20} />
                            <p>Send payment proof via WhatsApp to: <span className="font-bold">0707 679 3866</span></p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Help */}
        <div className="mt-12 bg-primary-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Need More Help?</h2>
          <p className="text-primary-700 mb-6">
            If you have questions not covered in these guides, please contact our support team.
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="https://wa.me/2347076793866" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <MessageCircle size={20} />
              WhatsApp Support
            </a>
            <a 
              href="tel:+2347076793866"
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Phone size={20} />
              Call: 0707 679 3866
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuides;
