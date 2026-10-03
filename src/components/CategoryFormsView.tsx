import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Users, Briefcase, Package, Loader2 } from 'lucide-react';
import { MobileFormNavigation } from './MobileFormNavigation';
import { supabase } from '../lib/supabase';

interface CategoryFormsViewProps {
  category: 'student' | 'staff_others';
  onBack: () => void;
  onSelectForm: (formType: 'stationery' | 'office-items' | 'volunteer' | 'club-registration' | 'position-application') => void;
  preloadedForms?: FormConfig[];
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

export function CategoryFormsView({ category, onBack, onSelectForm, preloadedForms, onNavigateHome, onNavigateAdmin, onNavigateSuperAdmin }: CategoryFormsViewProps) {
  const [forms, setForms] = useState<FormConfig[]>(preloadedForms || []);
  const [loading, setLoading] = useState(!preloadedForms);

  useEffect(() => {
    if (preloadedForms) {
      setForms(preloadedForms);
      setLoading(false);
    } else {
      loadForms();
    }
  }, [category, preloadedForms]);

  const loadForms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('form_configurations')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('form_name_english');

      if (error) throw error;
      setForms(data || []);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormClick = (formKey: string) => {
    onSelectForm(formKey as 'stationery' | 'office-items' | 'volunteer' | 'club-registration' | 'position-application');
  };

  const getFormColor = (formKey: string) => {
    const colors = {
      'stationery': {
        bg: 'from-blue-500 to-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      'office-items': {
        bg: 'from-green-500 to-green-600',
        button: 'bg-green-600 hover:bg-green-700'
      },
      'volunteer': {
        bg: 'from-orange-500 to-orange-600',
        button: 'bg-orange-600 hover:bg-orange-700'
      },
      'club-registration': {
        bg: 'from-blue-400 to-blue-500',
        button: 'bg-blue-500 hover:bg-blue-600'
      },
      'position-application': {
        bg: 'from-amber-500 to-amber-600',
        button: 'bg-amber-600 hover:bg-amber-700'
      }
    };
    return colors[formKey as keyof typeof colors] || colors['stationery'];
  };

  const getFormIcon = (formKey: string) => {
    if (formKey === 'stationery') return FileText;
    if (formKey === 'office-items') return Package;
    if (formKey === 'club-registration') return Users;
    if (formKey === 'position-application') return Briefcase;
    return Users;
  };

  return (
    <div className="min-h-screen" >
      <MobileFormNavigation
        onNavigateHome={onNavigateHome}
        onNavigateAdmin={onNavigateAdmin}
        onNavigateSuperAdmin={onNavigateSuperAdmin}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center mb-4 sm:mb-6">
              <img
                src="/school-logo.png"
                alt="Faafu Atoll School Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 px-4">
              {category === 'student' ? 'Student Forms' : 'Staff and Others'}
            </h1>
            <p className="text-base sm:text-lg text-gray-600">Faafu Atoll School</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500 text-lg">Loading forms...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No forms available in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {forms.map((form) => {
                const Icon = getFormIcon(form.form_key);
                const colors = getFormColor(form.form_key);
                return (
                  <div
                    key={form.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative"
                    style={{ zIndex: 10 }}
                  >
                    <div className={`bg-gradient-to-br ${colors.bg} p-8 flex items-center justify-center`}>
                      <div className="bg-white rounded-full p-6">
                        <Icon className="w-12 h-12 text-gray-700" />
                      </div>
                    </div>

                    <div className="p-6">
                      <h3
                        className="text-xl font-bold text-gray-800 text-center mb-2"
                        style={(form.form_key === 'volunteer' || form.form_key === 'position-application') ? { fontFamily: 'Faruma' } : {}}
                      >
                        {(form.form_key === 'volunteer' || form.form_key === 'position-application') ? form.form_name_dhivehi : form.form_name_english}
                      </h3>

                      <p
                        className="text-sm text-gray-600 text-center mb-4"
                        style={(form.form_key === 'volunteer' || form.form_key === 'position-application') ? { fontFamily: 'Faruma' } : {}}
                      >
                        {form.additional_config?.landing_description || form.subtitle}
                      </p>

                      {form.additional_config?.card_details && form.additional_config.card_details.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Form includes:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {form.additional_config.card_details.map((detail, index) => (
                              <li key={index} style={detail.includes('ޚިދުމަތް') ? { fontFamily: 'Faruma' } : {}}>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button
                        onClick={() => handleFormClick(form.form_key)}
                        className={`w-full ${colors.button} text-white py-3 rounded-lg font-medium transition-colors`}
                      >
                        Open Form
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-sm text-gray-500">
              Need help? Contact the school administration office
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
