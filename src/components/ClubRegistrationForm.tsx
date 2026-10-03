import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Lock, Loader2 } from 'lucide-react';
import { MobileFormNavigation } from './MobileFormNavigation';

const CLUBS = [
  'Islam Club',
  'Dhivehi Club',
  'E.S Club',
  'English Club',
  'Maths Club'
];

interface ClubRegistrationFormProps {
  onNavigateHome?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateSuperAdmin?: () => void;
}

export function ClubRegistrationForm({ onNavigateHome, onNavigateAdmin, onNavigateSuperAdmin }: ClubRegistrationFormProps = {}) {
  const [formData, setFormData] = useState({
    studentName: '',
    studentIndex: '',
    studentGrade: '',
    club: '',
    email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
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
        .eq('form_key', 'club-registration')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('club_registrations')
        .insert([{
          student_name: formData.studentName,
          student_index: formData.studentIndex,
          student_grade: formData.studentGrade,
          club: formData.club,
          email: formData.email || null,
          status: 'pending'
        }]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        studentName: '',
        studentIndex: '',
        studentGrade: '',
        club: '',
        email: ''
      });

      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen pb-20 md:pb-8 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4" >
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

    if (submitStatus === 'success') {
      return (
        <div className="min-h-screen pb-20 md:pb-8 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4" >
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your club registration has been submitted successfully. You will be notified once it's approved.
            </p>
            <button
              onClick={() => setSubmitStatus(null)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Another Registration
            </button>
          </div>
        </div>
      );
    }

    return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24 md:pb-8" >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-blue-600 text-white p-8">
              <div className="flex items-center gap-4">
                <img
                  src="/school-logo.png"
                  alt="Faafu Atoll School Logo"
                  className="w-20 h-20 object-contain flex-shrink-0"
                />
                <div>
                  <h1 className="text-3xl font-bold mb-2">Club Registration Form 2026</h1>
                  <p className="text-blue-100">Register for a school club</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                    <p className="text-red-600 text-sm">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">Important Information:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Each student can register for only ONE club</li>
                    <li>• All fields are required</li>
                    <li>• Make sure your student index is correct</li>
                  </ul>
                </div>

                <div>
                  <label htmlFor="studentName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter student's full name"
                  />
                </div>

                <div>
                  <label htmlFor="studentIndex" className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Index <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="studentIndex"
                    name="studentIndex"
                    value={formData.studentIndex}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter student index number"
                  />
                </div>

                <div>
                  <label htmlFor="studentGrade" className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Grade <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="studentGrade"
                    name="studentGrade"
                    value={formData.studentGrade}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter grade (e.g., Grade 10)"
                  />
                </div>

                <div>
                  <label htmlFor="club" className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Club <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="club"
                    name="club"
                    value={formData.club}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">-- Select a club --</option>
                    {CLUBS.map((club) => (
                      <option key={club} value={club}>
                        {club}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Choose only ONE club that you wish to join
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Email (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email for notifications"
                  />
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Registration'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact the school administration office
            </p>
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
