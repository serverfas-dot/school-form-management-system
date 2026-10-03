import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getFormConfiguration, FormConfiguration } from '../lib/formConfig';
import { CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';
import { MobileFormNavigation } from './MobileFormNavigation';

interface VolunteerFormProps {
  onNavigateHome?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateSuperAdmin?: () => void;
}

export default function VolunteerForm({ onNavigateHome, onNavigateAdmin, onNavigateSuperAdmin }: VolunteerFormProps = {}) {
  const [currentSection, setCurrentSection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [config, setConfig] = useState<FormConfiguration | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const formConfig = await getFormConfiguration('volunteer');
      setConfig(formConfig);

      const { data, error } = await supabase
        .from('form_configurations')
        .select('is_open')
        .eq('form_key', 'volunteer')
        .maybeSingle();

      if (!error && data) {
        setIsFormOpen(data.is_open ?? false);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    volunteerActivities: [] as string[],
    otherActivity: '',
    name: '',
    designation: '',
    address: '',
    idNumber: '',
    email: '',
    phoneNumber: '',
  });

  const activityOptions = config?.additional_config?.activity_options || [
    'ތިލަވުގެ އުފެއްދުންތެރިކަމާބެހޭ ހުނަރު ވެރި ކުދީންގެ ގްރޫޕް',
    'ބައިސްކޯޕް، ސާންސް ސެންޓާރު، ލައިބްރަރީ ބޯޑު',
    'ބައްތިކުޅި މުބާރާތު ކޯޗިންގ ބޯޑު',
    'ކުދިން ފޯރިސް ކޭސްކުރުމަށް މެނޭޖުކުރުން ބޯޑު',
    'ބައްތިކުޅި މުބާރާތުގައި މަސައްކަތް ކުރުން ބޯޑު',
    'ވޮލަންޓިއާ ސްކޮލަރޝިޕް ބޯޑު',
    'ބަސްލަން އެސިސްޓް (6 ވަނަ)',
    'ބަސްލަން، ވޮލަންޓިއާރުގެ ކޯޗިންގ، މަސައްކަތް، ކުދިން މަޑުކޮށް ބޯޑު',
  ];

  const handleActivityChange = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      volunteerActivities: prev.volunteerActivities.includes(activity)
        ? prev.volunteerActivities.filter(a => a !== activity)
        : [...prev.volunteerActivities, activity]
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateSection1 = () => {
    return formData.volunteerActivities.length > 0 || formData.otherActivity.trim() !== '';
  };

  const validateSection2 = () => {
    return formData.name.trim() !== '' && formData.phoneNumber.trim() !== '';
  };

  const handleNextSection = () => {
    if (currentSection === 1 && !validateSection1()) {
      setErrorMessage('މަސައްކަތެއް އިޚްތިޔާރު ކުރައްވާ');
      return;
    }
    if (currentSection === 2 && !validateSection2()) {
      setErrorMessage('ނަމާއި ފޯނު ނަންބަރު ބޭނުން');
      return;
    }
    setErrorMessage('');
    setCurrentSection(prev => prev + 1);
  };

  const handlePreviousSection = () => {
    setErrorMessage('');
    setCurrentSection(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSection2()) {
      setErrorMessage('ނަމާއި ފޯނު ނަންބަރު ބޭނުން');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const activities = [...formData.volunteerActivities];
      if (formData.otherActivity.trim()) {
        activities.push(`އެހެނިހެން: ${formData.otherActivity}`);
      }

      const { error } = await supabase
        .from('volunteer_form_submissions')
        .insert([{
          volunteer_activities: activities,
          name: formData.name,
          designation: formData.designation,
          address: formData.address,
          id_number: formData.idNumber,
          email: formData.email,
          phone_number: formData.phoneNumber,
        }]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        volunteerActivities: [],
        otherActivity: '',
        name: '',
        designation: '',
        address: '',
        idNumber: '',
        email: '',
        phoneNumber: '',
      });
      setCurrentSection(1);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage('ފޯމު ހުށަހެޅުމުގައި މައްސަލަ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen pb-20 md:pb-8 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4" dir="rtl" >
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
            <p className="text-gray-600" style={{ fontFamily: 'Faruma' }}>ލޯޑް ވަމުން ދޭ...</p>
          </div>
        </div>
      );
    }

    if (!isFormOpen) {
      return (
        <div className="min-h-screen pb-20 md:pb-8 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4" dir="rtl" >
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
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800" style={{ fontFamily: 'Faruma' }}>
              މައުލޫމާތު ސާފުކުރުމަށް، ސްކޫލް އެޑްމިން އާ ގުޅުއްވުން
            </div>
          </div>
        </div>
      );
    }

    if (submitStatus === 'success') {
      return (
        <div className="min-h-screen pb-20 md:pb-8 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4" dir="rtl" >
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Faruma' }}>
              ކާމިޔާބު!
            </h2>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'Faruma' }}>
              {config?.success_message || 'ތިޔަބޭފުޅުންގެ ފޯމު ކާމިޔާބުކަމާއެކު ހުށަހަޅައިފި'}
            </p>
            <button
              onClick={() => setSubmitStatus('idle')}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-medium"
              style={{ fontFamily: 'Faruma' }}
            >
              އަލުން ހުށަހެޅުން
            </button>
          </div>
        </div>
      );
    }

    return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 pb-24 md:pb-8" dir="rtl" >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-amber-700 text-white p-8">
            <div className="flex items-center gap-4 justify-end mb-4">
              <div className="text-right">
                <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Faruma' }}>
                  {config?.title || 'ވޮލަންޓިއަރ ރަޖިސްޓްރޭޝަން ފޯމު'}
                </h1>
                <p className="text-amber-100" style={{ fontFamily: 'Faruma' }}>
                  ސެކްޝަން {currentSection} އޮފް 3
                </p>
              </div>
              <img
                src="/school-logo.png"
                alt="Faafu Atoll School Logo"
                className="w-20 h-20 object-contain flex-shrink-0"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {currentSection === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 text-right" style={{ fontFamily: 'Faruma' }}>
                    {config?.additional_config?.section_headings?.activities || 'ވަޒީފާ / ބޯޑުތައް / ގްރޫޕްތައް އިޚްތިޔާރުކުރައްވާ'}
                  </h2>
                  <div className="space-y-3">
                    {activityOptions.map((activity, index) => (
                      <label key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.volunteerActivities.includes(activity)}
                          onChange={() => handleActivityChange(activity)}
                          className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                        />
                        <span className="text-gray-700 text-right flex-1" style={{ fontFamily: 'Faruma' }}>
                          {activity}
                        </span>
                      </label>
                    ))}
                    <div className="mt-4">
                      <label className="flex items-center gap-3 mb-2">
                        <span className="text-gray-700 font-medium text-right" style={{ fontFamily: 'Faruma' }}>
                          {config?.additional_config?.section_headings?.other_activity || 'އެހެނިހެން:'}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.otherActivity}
                        onChange={(e) => handleInputChange('otherActivity', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-right"
                        style={{ fontFamily: 'Faruma' }}
                        placeholder={config?.additional_config?.field_labels?.other_activity_placeholder || 'އެހެން މަސައްކަތެއް ލިޔުއްވާ'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentSection === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 text-right" style={{ fontFamily: 'Faruma' }}>
                    {config?.additional_config?.section_headings?.info || 'މައުލޫމާތު'}
                  </h2>
                  <p className="text-gray-600 mb-6 text-right text-sm" style={{ fontFamily: 'Faruma' }}>
                    {config?.subtitle || 'އަންހެނުން ވޮލިންޓިއަރއަކަށް ވުމަށް އެދޭ ފޯމް'}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-right" style={{ fontFamily: 'Faruma' }}>
                    {config?.additional_config?.field_labels?.name || 'ނަން'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-right"
                    style={{ fontFamily: 'Faruma' }}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-right" style={{ fontFamily: 'Faruma' }}>
                    {config?.additional_config?.field_labels?.designation || 'މަގާމް'}
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-right"
                    style={{ fontFamily: 'Faruma' }}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-right" style={{ fontFamily: 'Faruma' }}>
                    {config?.additional_config?.field_labels?.address || 'އެޑްރެސް'}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-right"
                    style={{ fontFamily: 'Faruma' }}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-right" style={{ fontFamily: 'Faruma' }}>
                    {config?.additional_config?.field_labels?.id_number || 'އައިޑީ ނަންބަރު'}
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-right"
                    style={{ fontFamily: 'Faruma' }}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-right" style={{ fontFamily: 'Faruma' }}>
                    {config?.additional_config?.field_labels?.email || 'އީމެއިލް'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-right"
                    style={{ fontFamily: 'Faruma' }}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-right" style={{ fontFamily: 'Faruma' }}>
                    {config?.additional_config?.field_labels?.phone_number || 'ފޯނު ނަންބަރު'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-right"
                    style={{ fontFamily: 'Faruma' }}
                  />
                </div>
              </div>
            )}

            {currentSection === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 text-right" style={{ fontFamily: 'Faruma' }}>
                    {config?.additional_config?.section_headings?.note || 'ނޯޓް'}
                  </h2>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-right">
                    <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Faruma' }}>
                      މިފޯމްގައި ހިމެނޭ މައުލޫމާތު ސިއްރުކުރުމަށް އަޅުގަނޑުމެން ވަޢުދުވަމުން، މި މައުލޫމާތުތައް ބޭނުންކުރަނީ މަދަރުސާގެ ބޭނުމަށް އެކަންޏެވެ. މި މައުލޫމާތުތައް ފުރިހަމަ ކުރުމުގައި އެއްވެސް ހަރަދެއް ނުހިނގާނެއެވެ. މި މައުލޫމާތުތައް ތިރީސް ދުވަހުގެ ތެރޭގައި އެކި ގޮތްގޮތަށް ބޭނުންކުރާނެއެވެ.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-right">
                  <p className="text-sm text-blue-800" style={{ fontFamily: 'Faruma' }}>
                    ފޯމު ހުށަހެޅުމުގެ ކުރިން ތިޔަބޭފުޅުން ދެއްވި މައުލޫމާތު ސައްހަކަން ޔަގީންކުރައްވާ
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-right" style={{ fontFamily: 'Faruma' }}>{errorMessage}</span>
              </div>
            )}

            <div className="mt-8 flex justify-between items-center gap-4">
              {currentSection > 1 && (
                <button
                  type="button"
                  onClick={handlePreviousSection}
                  className="px-6 py-3 border-2 border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors font-medium"
                  style={{ fontFamily: 'Faruma' }}
                >
                  ކުރީގެ ސެކްޝަން
                </button>
              )}

              <div className="flex-1"></div>

              {currentSection < 3 ? (
                <button
                  type="button"
                  onClick={handleNextSection}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-medium"
                  style={{ fontFamily: 'Faruma' }}
                >
                  ދެން ކުރިއަށް
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ fontFamily: 'Faruma' }}
                >
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {config?.button_text || 'ހުށަހެޅުން'}
                </button>
              )}
            </div>
          </form>
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
