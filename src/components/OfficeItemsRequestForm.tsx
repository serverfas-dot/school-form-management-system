import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, CheckCircle, AlertCircle, Lock, Loader2 } from 'lucide-react';
import { MobileFormNavigation } from './MobileFormNavigation';

interface OfficeItemsRequestFormProps {
  onNavigateHome?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateSuperAdmin?: () => void;
}

export default function OfficeItemsRequestForm({ onNavigateHome, onNavigateAdmin, onNavigateSuperAdmin }: OfficeItemsRequestFormProps = {}) {
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    address: '',
    nid_number: '',
    phone_number: '',
    email: '',
    organization_name: '',
    items_requested: '',
    quantity_required: '',
    purpose_of_request: '',
    date_required_by: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkFormAccess();
  }, []);

  const checkFormAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('form_configurations')
        .select('is_open')
        .eq('form_key', 'office-items')
        .maybeSingle();

      if (!error && data) {
        setIsFormOpen(data.is_open ?? false);
      }
    } catch (error) {
      console.error('Error checking form access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('office_items_requests')
        .insert([formData]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        date: '',
        name: '',
        address: '',
        nid_number: '',
        phone_number: '',
        email: '',
        organization_name: '',
        items_requested: '',
        quantity_required: '',
        purpose_of_request: '',
        date_required_by: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen pb-20 md:pb-8 bg-gradient-to-br from-blue-50 to-blue-50 flex items-center justify-center p-4" >
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600" style={{ fontFamily: 'Faruma' }}>ލޯޑް ވަމުން ދޭ...</p>
          </div>
        </div>
      );
    }

    if (!isFormOpen) {
      return (
        <div className="min-h-screen pb-20 md:pb-8 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4" >
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <Lock className="w-16 h-16 text-gray-400 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Faruma' }}>
              ފޯމް ބަންދުވެއެވެ
            </h2>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'Faruma' }}>
              މި ފޯމް މިހާރު ބަންދުކޮށްފައިވާތީ ހުށަހެޅުމުގެ ފުރުޞަތެއް ނެތެވެ. ފޯމް ހުޅުވާލުމުން އަންގާނެއެވެ.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800" style={{ fontFamily: 'Faruma' }}>
              މައުލޫމާތު ސާފުކުރުމަށް، ސްކޫލް އެޑްމިން އާ ގުޅުއްވުން
            </div>
          </div>
        </div>
      );
    }

    return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pb-24 md:pb-8" >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-blue-600 px-8 py-6">
            <div className="flex items-center justify-center mb-3">
              <img
                src="/school-logo.png"
                alt="Faafu Atoll School Logo"
                className="w-24 h-24 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Office Items Request Form
            </h1>
            <p className="text-blue-100 text-center">
              Faafu Atoll School
            </p>
          </div>

          <div className="px-8 py-8">
            {submitStatus === 'success' && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">Request Submitted Successfully!</p>
                  <p className="text-green-700 text-sm mt-1">
                    Your request has been received and is pending approval. You will receive an email notification once it's approved.
                  </p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Submission Failed</p>
                  <p className="text-red-700 text-sm mt-1">
                    There was an error submitting your request. Please try again.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nid_number" className="block text-sm font-semibold text-gray-700 mb-2">
                    NID Number *
                  </label>
                  <input
                    type="text"
                    id="nid_number"
                    name="nid_number"
                    required
                    value={formData.nid_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter NID number"
                  />
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    required
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                />
                <p className="mt-1 text-sm text-gray-600">
                  Approval notification will be sent to this email
                </p>
              </div>

              <div>
                <label htmlFor="organization_name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  id="organization_name"
                  name="organization_name"
                  required
                  value={formData.organization_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter organization name"
                />
              </div>

              <div>
                <label htmlFor="items_requested" className="block text-sm font-semibold text-gray-700 mb-2">
                  Items Requested *
                </label>
                <textarea
                  id="items_requested"
                  name="items_requested"
                  required
                  value={formData.items_requested}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="List the items you are requesting"
                />
              </div>

              <div>
                <label htmlFor="quantity_required" className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity Required *
                </label>
                <input
                  type="text"
                  id="quantity_required"
                  name="quantity_required"
                  required
                  value={formData.quantity_required}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Specify quantity needed"
                />
              </div>

              <div>
                <label htmlFor="purpose_of_request" className="block text-sm font-semibold text-gray-700 mb-2">
                  Purpose of Request *
                </label>
                <textarea
                  id="purpose_of_request"
                  name="purpose_of_request"
                  required
                  value={formData.purpose_of_request}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Explain the purpose of your request"
                />
              </div>

              <div>
                <label htmlFor="date_required_by" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date Required By *
                </label>
                <input
                  type="date"
                  id="date_required_by"
                  name="date_required_by"
                  required
                  value={formData.date_required_by}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    );
  };

  return (
    <>
      {renderContent()}
      <MobileFormNavigation
        onNavigateHome={onNavigateHome}
        onNavigateAdmin={onNavigateAdmin}
        onNavigateSuperAdmin={onNavigateSuperAdmin}
        isFormView={true}
      />
    </>
  );
}
