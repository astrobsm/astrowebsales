import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, User, Mail, Phone, MapPin, FileText, Upload, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const BecomeDistributor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    partner_type: 'distributor',
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    city: '',
    business_type: '',
    years_in_business: '',
    tax_id: '',
    bank_name: '',
    account_number: '',
    account_name: ''
  });

  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setDocuments(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      documents.forEach(doc => {
        submitData.append('documents', doc);
      });

      await axios.post('http://localhost:5000/api/partners/apply', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Application submitted successfully! We\'ll review and get back to you soon.');
      navigate('/');
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            Become a Distributor
          </h1>
          <p className="text-xl text-gray-600">
            Join Nigeria's leading wound care distribution network
          </p>
        </div>

        {/* Benefits */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-display font-semibold mb-6">Distributor Benefits</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-primary-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Exclusive Territory</h3>
                <p className="text-sm text-gray-600">Operate in your designated zone without competition</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-primary-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Attractive Margins</h3>
                <p className="text-sm text-gray-600">Competitive pricing structure for maximum profitability</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-primary-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Marketing Support</h3>
                <p className="text-sm text-gray-600">Full marketing materials and promotional support</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-primary-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Training Programs</h3>
                <p className="text-sm text-gray-600">Comprehensive product and sales training</p>
              </div>
            </div>
          </div>
        </div>

        {/* Distributorship Policy */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-display font-semibold mb-6 text-primary-800">
            📋 Distributorship Policy & Registration Framework
          </h2>
          
          <div className="space-y-6 text-gray-700">
            {/* Introduction */}
            <div className="bg-primary-50 rounded-xl p-6 border-l-4 border-primary-500">
              <p className="text-lg">
                Bonnesante Medicals Limited operates an exclusive distributorship model designed to ensure 
                quality service delivery and market coverage across Nigeria. This policy governs all 
                distributor relationships and sets clear expectations for partnership.
              </p>
            </div>

            {/* Section 1 */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Eligibility Requirements</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Registered business entity (Limited Company, Partnership, or Sole Proprietorship)</li>
                <li>Valid CAC registration certificate</li>
                <li>Minimum 2 years experience in pharmaceutical or medical supplies distribution</li>
                <li>Established network of hospitals, clinics, pharmacies, or healthcare facilities</li>
                <li>Adequate storage facilities meeting NAFDAC standards</li>
                <li>Operational vehicles for last-mile delivery</li>
                <li>Committed capital of minimum ₦2,000,000 for initial stock purchase</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Territory Assignment</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Distributors are assigned exclusive territories based on state or LGA boundaries</li>
                <li>Territory exclusivity is maintained for all assigned product categories</li>
                <li>Cross-territory sales require written authorization from Head Office</li>
                <li>Territory performance is reviewed quarterly; underperformance may result in territory reduction</li>
                <li>Expansion into additional territories available based on performance metrics</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Pricing & Margins</h3>
              <div className="bg-accent-50 rounded-lg p-4 mb-3">
                <p className="font-semibold text-accent-800">Standard Margin Structure:</p>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Distributor Price:</strong> As listed in official price list</li>
                <li><strong>Recommended Retail Price:</strong> Distributor price + 25% markup</li>
                <li><strong>Minimum Order Quantity:</strong> ₦500,000 per order</li>
                <li><strong>Payment Terms:</strong> 50% advance, 50% on delivery for new distributors; established partners may qualify for credit terms</li>
                <li>Prices subject to quarterly review; 30-day notice provided for any adjustments</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">4. Performance Requirements</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Minimum monthly purchase target based on territory size (communicated at onboarding)</li>
                <li>Quarterly sales growth targets of minimum 10%</li>
                <li>Maximum stock age of 6 months (FIFO inventory management required)</li>
                <li>Customer complaint resolution within 48 hours</li>
                <li>Participation in all Bonnesante training programs (minimum 2 per year)</li>
                <li>Monthly sales reports due by 5th of following month</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">5. Marketing & Branding</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use only approved Bonnesante marketing materials</li>
                <li>No modification of product packaging or labeling</li>
                <li>Bonnesante logo and brand guidelines must be followed</li>
                <li>Co-branded marketing materials available upon request</li>
                <li>Social media promotion guidelines provided at onboarding</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">6. Training & Support</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Onboarding Training:</strong> 2-day comprehensive product and sales training</li>
                <li><strong>Quarterly Updates:</strong> New product introductions and refresher training</li>
                <li><strong>Marketing Support:</strong> Point-of-sale materials, brochures, and samples</li>
                <li><strong>Technical Support:</strong> Dedicated account manager and customer service hotline</li>
                <li><strong>Clinical Training:</strong> Optional wound care certification program</li>
              </ul>
            </div>

            {/* Section 7 */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">7. Terms & Termination</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Initial agreement term: 2 years</li>
                <li>Automatic renewal for 1-year periods subject to performance review</li>
                <li>90-day written notice required for voluntary termination</li>
                <li>Immediate termination for breach of exclusivity, brand misuse, or quality violations</li>
                <li>Upon termination, unsold stock may be repurchased at 80% of original cost</li>
              </ul>
            </div>

            {/* Agreement Checkbox */}
            <div className="bg-gray-100 rounded-xl p-6 mt-8">
              <p className="text-sm text-gray-600">
                By submitting this application, you confirm that you have read, understood, and agree 
                to abide by the Bonnesante Medicals Distributorship Policy. You acknowledge that false 
                information provided in this application may result in rejection or termination of 
                distributorship.
              </p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="card p-8">
          <h2 className="text-2xl font-display font-semibold mb-6">Application Form</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Company Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="hospital">Hospital Supply</option>
                    <option value="medical_distributor">Medical Distributor</option>
                    <option value="retailer">Medical Retailer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years in Business *
                  </label>
                  <input
                    type="number"
                    name="years_in_business"
                    value={formData.years_in_business}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID / RC Number *
                  </label>
                  <input
                    type="text"
                    name="tax_id"
                    value={formData.tax_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter CAC/RC number"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+234 800 000 0000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select state</option>
                    {nigerianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>
              </div>
            </div>

            {/* Banking Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Banking Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Bank name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0000000000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    name="account_name"
                    value={formData.account_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Account holder name"
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Supporting Documents</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <label className="cursor-pointer">
                    <span className="btn-secondary inline-block">
                      Choose Files
                    </span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload CAC documents, pharmacy license, ID, etc. (Max 10MB per file)
                  </p>
                </div>
                {documents.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {documents.map((doc, index) => (
                        <li key={index}>• {doc.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center"
              >
                <Send size={18} className="mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BecomeDistributor;
