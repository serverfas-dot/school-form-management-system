import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { MobileFormNavigation } from './MobileFormNavigation';

interface FormSubmissionProps {
  onNavigateHome?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateSuperAdmin?: () => void;
}

export default function FormSubmission({ onNavigateHome, onNavigateAdmin, onNavigateSuperAdmin }: FormSubmissionProps = {}) {
  const [formData, setFormData] = useState({
    studentName: '',
    idCardNumber: '',
    grade: '',
    parentFullName: '',
    requestDate: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const grades = [
    '1', '2', '3', '4', '5', '6', '7', '8',
    '9 SC', '9 BS', '9 BTEC',
    '10 SC', '10 BS', '10 BTEC'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const { error } = await supabase
        .from('stationery_voucher_submissions')
        .insert({
          student_name: formData.studentName,
          id_card_number: formData.idCardNumber,
          grade: formData.grade,
          parent_full_name: formData.parentFullName,
          request_date: formData.requestDate
        });

      if (error) throw error;

      setSubmitStatus({
        type: 'success',
        message: 'Form submitted successfully! Your stationery voucher request has been recorded.'
      });

      setFormData({
        studentName: '',
        idCardNumber: '',
        grade: '',
        parentFullName: '',
        requestDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to submit form. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8" >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 px-8 py-6">
            <div className="flex items-center justify-center mb-3">
              <img
                src="/school-logo.png"
                alt="Faafu Atoll School Logo"
                className="w-24 h-24 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-white text-center">
              Stationery Voucher Request Form
            </h1>
            <p className="text-blue-100 text-center mt-2">Academic Year 2026</p>
          </div>

          <div className="px-8 py-8">
            {submitStatus && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                  submitStatus.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-sm ${
                    submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {submitStatus.message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                  Student Information
                </h2>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      name="studentName"
                      required
                      value={formData.studentName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter student's full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="idCardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      ID Card Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="idCardNumber"
                      name="idCardNumber"
                      required
                      value={formData.idCardNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter ID card number"
                    />
                  </div>

                  <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                      Grade of 2026 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="grade"
                      name="grade"
                      required
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select Grade</option>
                      {grades.map((grade) => (
                        <option key={grade} value={grade}>
                          Grade {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                  Voucher Request Parents Information
                </h2>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="parentFullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="parentFullName"
                      name="parentFullName"
                      required
                      value={formData.parentFullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter parent/guardian full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="requestDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="requestDate"
                      name="requestDate"
                      required
                      value={formData.requestDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact the school administration office.
          </p>
        </div>
      </div>
      <MobileFormNavigation
        onNavigateHome={onNavigateHome}
        onNavigateAdmin={onNavigateAdmin}
        onNavigateSuperAdmin={onNavigateSuperAdmin}
        isFormView={true}
      />
    </div>
  );
}
