import { useState, useEffect } from 'react';
import { Users, Briefcase, GraduationCap } from 'lucide-react';
import { CategoryFormsView } from './CategoryFormsView';
import { MobileFormNavigation } from './MobileFormNavigation';
import { supabase } from '../lib/supabase';

interface FormsLandingProps {
  onSelectForm: (formType: 'stationery' | 'office-items' | 'volunteer' | 'club-registration' | 'position-application') => void;
  onNavigateHome?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateSuperAdmin?: () => void;
}

interface FormConfig {
  id: string;
  form_key: string;
  form_name_english: string;
  form_name_dhivehi: string;
  is_active: boolean;
  category: string;
  subtitle: string;
  additional_config: {
    landing_description?: string;
    card_details?: string[];
  };
}

export default function FormsLanding({ onSelectForm, onNavigateHome, onNavigateAdmin, onNavigateSuperAdmin }: FormsLandingProps) {
  const [selectedCategory, setSelectedCategory] = useState<'student' | 'staff_others' | null>(null);
  const [formsCache, setFormsCache] = useState<{ student: FormConfig[]; staff_others: FormConfig[] } | null>(null);
  const [isPreloading, setIsPreloading] = useState(true);

  useEffect(() => {
    preloadForms();
  }, []);

  const preloadForms = async () => {
    try {
      const { data, error } = await supabase
        .from('form_configurations')
        .select('*')
        .eq('is_active', true)
        .order('form_name_english');

      if (error) throw error;

      if (data) {
        const studentForms = data.filter(f => f.category === 'student');
        const staffForms = data.filter(f => f.category === 'staff_others');

        setFormsCache({
          student: studentForms,
          staff_others: staffForms
        });
      }
    } catch (error) {
      console.error('Error preloading forms:', error);
      setFormsCache({
        student: [],
        staff_others: []
      });
    } finally {
      setIsPreloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <MobileFormNavigation
        onNavigateHome={onNavigateHome}
        onNavigateAdmin={onNavigateAdmin}
        onNavigateSuperAdmin={onNavigateSuperAdmin}
      />
      {selectedCategory && formsCache ? (
        <CategoryFormsView
          category={selectedCategory}
          onBack={() => setSelectedCategory(null)}
          onSelectForm={onSelectForm}
          preloadedForms={formsCache[selectedCategory]}
          onNavigateHome={onNavigateHome}
          onNavigateAdmin={onNavigateAdmin}
          onNavigateSuperAdmin={onNavigateSuperAdmin}
        />
      ) : (
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 md:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <button
              onClick={() => window.location.href = '/'}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Go to home"
            >
              <img
                src="/school-logo.png"
                alt="Faafu Atoll School Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
              />
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            School Form Management System
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Faafu Atoll School
          </p>
          <p className="text-gray-500 mt-2 text-sm sm:text-base px-4">
            Select a category to view available forms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 relative" >
            <div className="bg-blue-600 p-8">
              <div className="flex justify-center">
                <div className="bg-white rounded-full p-6">
                  <Users className="w-16 h-16 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
                Student
              </h2>
              <p className="text-2xl text-blue-600 mb-4 text-center font-semibold" style={{ fontFamily: 'Faruma' }}>
                ދަރިވަރުން
              </p>
              <p className="text-gray-600 text-center mb-6">
                Access forms for students including requests, applications, and registrations
              </p>
              <button
                onClick={() => setSelectedCategory('student')}
                disabled={isPreloading}
                className="w-full bg-blue-50 hover:bg-blue-100 rounded-lg p-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-sm text-gray-700 text-center font-medium">
                  Click here to view all student forms
                </p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 relative" >
            <div className="bg-green-600 p-8">
              <div className="flex justify-center">
                <div className="bg-white rounded-full p-6">
                  <Briefcase className="w-16 h-16 text-green-600" />
                </div>
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
                Staff and Others
              </h2>
              <p className="text-2xl text-green-600 mb-4 text-center font-semibold" style={{ fontFamily: 'Faruma' }}>
                މުވައްޒަފުންނާއި އެހެނިހެން
              </p>
              <p className="text-gray-600 text-center mb-6">
                Access forms for staff members, volunteers, and administrative requests
              </p>
              <button
                onClick={() => setSelectedCategory('staff_others')}
                disabled={isPreloading}
                className="w-full bg-green-50 hover:bg-green-100 rounded-lg p-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-sm text-gray-700 text-center font-medium">
                  Click here to view all staff & other forms
                </p>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact the school administration office
          </p>
        </div>
      </div>
      )}
    </div>
  );
}
