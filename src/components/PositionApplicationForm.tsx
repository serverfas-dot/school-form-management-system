import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { MobileFormNavigation } from './MobileFormNavigation';

const GRADES = ['A (75-100)', 'B (65-74)', 'C (50-64)', 'D (40-49)', 'Pass (Grade 6 only)'];

interface GridConfig {
  id: string;
  grid_type: string;
  heading: string;
  rows: string[];
  columns: string[];
}

interface RuleSection {
  title: string;
  color: string;
  items: string[];
  note?: string;
}

interface PositionApplicationFormProps {
  onNavigateHome?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateSuperAdmin?: () => void;
}

export function PositionApplicationForm({ onNavigateHome, onNavigateAdmin, onNavigateSuperAdmin }: PositionApplicationFormProps = {}) {
  const [formData, setFormData] = useState({
    studentEmail: '',
    studentName: '',
    studentIndex: '',
    studentClass: '',
    previousPositions: '',
    captainPosition: '',
    gamesCaptainPosition: '',
    prefectPosition: '',
    associationPosition: '',
    sportsClubPosition: '',
    dhivehiWeek: '',
    englishWeek: '',
    islamWeek: '',
    sportsCompetitions: '',
    otherActivities: ''
  });

  const [clubGridSelections, setClubGridSelections] = useState<{[key: string]: boolean}>({});
  const [houseGridSelections, setHouseGridSelections] = useState<{[key: string]: boolean}>({});
  const [firstSemesterGrades, setFirstSemesterGrades] = useState('');
  const [secondSemesterGrades, setSecondSemesterGrades] = useState('');

  const [clubGridConfig, setClubGridConfig] = useState<GridConfig | null>(null);
  const [houseGridConfig, setHouseGridConfig] = useState<GridConfig | null>(null);
  const [rulesContent, setRulesContent] = useState<RuleSection[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchGridConfigurations();
    fetchRulesContent();

    const configSubscription = supabase
      .channel('form_config_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'form_configurations',
          filter: 'form_key=eq.position-application'
        },
        (payload) => {
          if (payload.new) {
            if (payload.new.rules_content) {
              setRulesContent(payload.new.rules_content as RuleSection[]);
            }
            if (payload.new.is_open !== undefined) {
              setIsFormOpen(payload.new.is_open as boolean);
            }
          }
        }
      )
      .subscribe();

    const gridSubscription = supabase
      .channel('grid_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'position_form_grids',
          filter: 'form_key=eq.position_applications'
        },
        (payload) => {
          if (payload.new) {
            if (payload.new.grid_type === 'club') {
              setClubGridConfig(payload.new as GridConfig);
            } else if (payload.new.grid_type === 'house') {
              setHouseGridConfig(payload.new as GridConfig);
            }
          }
        }
      )
      .subscribe();

    return () => {
      configSubscription.unsubscribe();
      gridSubscription.unsubscribe();
    };
  }, []);

  const fetchGridConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('position_form_grids')
        .select('*')
        .eq('form_key', 'position_applications');

      if (error) throw error;

      if (data) {
        const clubGrid = data.find(g => g.grid_type === 'club');
        const houseGrid = data.find(g => g.grid_type === 'house');

        if (clubGrid) setClubGridConfig(clubGrid);
        if (houseGrid) setHouseGridConfig(houseGrid);
      }
    } catch (error) {
      console.error('Error fetching grid configurations:', error);
    }
  };

  const fetchRulesContent = async () => {
    try {
      const { data, error } = await supabase
        .from('form_configurations')
        .select('rules_content, is_open')
        .eq('form_key', 'position-application')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (data.rules_content) {
          setRulesContent(data.rules_content as RuleSection[]);
        }
        setIsFormOpen(data.is_open ?? false);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching rules content:', error);
      setIsLoading(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      amber: 'bg-amber-50',
      blue: 'bg-blue-50',
      green: 'bg-green-50',
      purple: 'bg-purple-50',
      red: 'bg-red-50',
      gray: 'bg-gray-50'
    };
    return colorMap[color] || 'bg-gray-50';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      const clubGridArray = Object.entries(clubGridSelections)
        .filter(([_, checked]) => checked)
        .map(([key, _]) => key);

      const houseGridArray = Object.entries(houseGridSelections)
        .filter(([_, checked]) => checked)
        .map(([key, _]) => key);

      const { error } = await supabase
        .from('position_applications')
        .insert([{
          student_email: formData.studentEmail || null,
          student_name: formData.studentName,
          student_index: formData.studentIndex,
          student_class: formData.studentClass,
          previous_positions: formData.previousPositions || null,
          captain_position: formData.captainPosition || null,
          games_captain_position: formData.gamesCaptainPosition || null,
          prefect_position: formData.prefectPosition || null,
          association_position: formData.associationPosition || null,
          sports_club_position: formData.sportsClubPosition || null,
          houses_selections: {
            clubs_grid: clubGridArray,
            houses_grid: houseGridArray
          },
          first_semester_grades: firstSemesterGrades ? { grade: firstSemesterGrades } : {},
          second_semester_grades: secondSemesterGrades ? { grade: secondSemesterGrades } : {},
          dhivehi_week: formData.dhivehiWeek || null,
          english_week: formData.englishWeek || null,
          islam_week: formData.islamWeek || null,
          sports_competitions: formData.sportsCompetitions || null,
          other_activities: formData.otherActivities || null,
          status: 'pending'
        }]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        studentEmail: '',
        studentName: '',
        studentIndex: '',
        studentClass: '',
        previousPositions: '',
        captainPosition: '',
        gamesCaptainPosition: '',
        prefectPosition: '',
        associationPosition: '',
        sportsClubPosition: '',
        dhivehiWeek: '',
        englishWeek: '',
        islamWeek: '',
        sportsCompetitions: '',
        otherActivities: ''
      });
      setClubGridSelections({});
      setHouseGridSelections({});
      setFirstSemesterGrades('');
      setSecondSemesterGrades('');

      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage('ފޯމް ހުށަހެޅުމުގައި މައްސަލަ ޖެހުނެވެ. މަސައްކަތް ކުރައްވާފައި ވަކި ފަހުން އަލުން މަސައްކަތް ކޮށްލައްވާ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClubGridSelection = (key: string, checked: boolean) => {
    setClubGridSelections(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleHouseGridSelection = (key: string, checked: boolean) => {
    setHouseGridSelections(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4" >
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dhivehi-text" style={{ fontFamily: 'Faruma' }}>ލޯޑް ވަމުން ދޭ...</p>
          </div>
        </div>
      );
    }

    if (!isFormOpen) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4" >
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8 max-w-md w-full text-center">
            <div className="mb-4 md:mb-6">
              <Lock className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
              ފޯމް ބަންދުވެއެވެ
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
              މި ފޯމް މިހާރު ބަންދުކޮށްފައިވާތީ ހުށަހެޅުމުގެ ފުރުޞަތެއް ނެތެވެ. ފޯމް ހުޅުވާލުމުން އަންގާނެއެވެ.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
              މައުލޫމާތު ސާފުކުރުމަށް، ސްކޫލް އެޑްމިން އާ ގުޅުއްވުން
            </div>
          </div>
        </div>
      );
    }

    if (submitStatus === 'success') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4" >
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8 max-w-md w-full text-center">
            <div className="mb-4 md:mb-6">
              <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500 mx-auto" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
              ފޯމް ކާމިޔާބުކަމާއެކު ހުށަހަޅައިފި!
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
              ތިޔަބޭފުޅުންގެ މަޤާމަށް ކުރިމަތިލުމުގެ ފޯމް ކާމިޔާބުކަމާއެކު ހުށަހަޅައިފިއެވެ. ފޯމް ބަލައި ނިމުމުން އަންގާނެއެވެ.
            </p>
            <button
              onClick={() => setSubmitStatus(null)}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base dhivehi-text"
              style={{ fontFamily: 'Faruma' }}
            >
              އިތުރު ފޯމެއް ހުށަހެޅުން
            </button>
          </div>
        </div>
      );
    }

    return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 pb-24 md:pb-8" >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-amber-500 text-white p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 md:gap-4">
                <img
                  src="/school-logo.png"
                  alt="Faafu Atoll School Logo"
                  className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 object-contain flex-shrink-0"
                />
                <div className="dhivehi-text">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2" style={{ fontFamily: 'Faruma' }}>
                    އިސްމަޤާތަކަށް ދަރިވަރުން އައްޔަން ކުރުން 2026
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-amber-100" style={{ fontFamily: 'Faruma' }}>
                    ފާފު އަތޮޅު ސްކޫލް
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="dhivehi-text">
                    <h3 className="font-semibold text-red-800 mb-1 dhivehi-text" style={{ fontFamily: 'Faruma' }}>ހުއްޓުވުން</h3>
                    <p className="text-red-600 text-sm" style={{ fontFamily: 'Faruma' }}>{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Section 1: އިސްމަޤާމްތަކަށް ކުރިމަތިލުމުގެ ފޯމް */}
                <div className="bg-amber-50 rounded-lg p-4 sm:p-5 md:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 md:mb-4 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                    އިސްމަޤާމްތަކަށް ކުރިމަތިލުމުގެ ފޯމް
                  </h2>

                  <div className="mb-4">
                    <label htmlFor="studentEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                      Student Email (Optional)
                    </label>
                    <input
                      type="email"
                      id="studentEmail"
                      name="studentEmail"
                      value={formData.studentEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>

                  {rulesContent.length > 0 && (
                    <div className="bg-white rounded-lg p-3 sm:p-4 border-2 border-amber-200 dhivehi-text">
                      <h3 className="font-semibold text-gray-700 mb-2 sm:mb-3 text-base sm:text-lg" style={{ fontFamily: 'Faruma' }}>ޤަވާޢިދު:</h3>
                      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm" style={{ fontFamily: 'Faruma' }}>
                        {rulesContent.map((section, index) => (
                          <div key={index} className={`${getColorClasses(section.color)} rounded-lg p-3 sm:p-4`}>
                            <h4 className="font-bold mb-1 sm:mb-2 text-sm sm:text-base">{section.title}</h4>
                            <ul className="space-y-1 sm:space-y-2 text-gray-700">
                              {section.items.map((item, itemIndex) => (
                                <li key={itemIndex}>{item}</li>
                              ))}
                            </ul>
                            {section.note && (
                              <p className="mt-2 sm:mt-3 text-xs text-gray-600">
                                {section.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: ދަރިވަރުގެ މަޢުލޫމާތު */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 md:mb-4 pb-2 border-b-2 border-amber-200 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                    ދަރިވަރުގެ މަޢުލޫމާތު
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="studentName" className="block text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        ދަރިވަރުގެ ފުރިހަމަ ނަން <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dhivehi-text"
                        style={{ fontFamily: 'Faruma' }}
                        placeholder="ފުރިހަމަ ނަން ލިޔުއްވާ"
                      />
                    </div>

                    <div>
                      <label htmlFor="studentIndex" className="block text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        އިންޑެކްސް <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="studentIndex"
                        name="studentIndex"
                        value={formData.studentIndex}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Index number"
                      />
                    </div>

                    <div>
                      <label htmlFor="studentClass" className="block text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        ކުލާސް (2024-2025ވަނަ އަހަރުގެ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="studentClass"
                        name="studentClass"
                        value={formData.studentClass}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dhivehi-text"
                        style={{ fontFamily: 'Faruma' }}
                        placeholder="މިސާލަކަށް: ގްރޭޑް 10"
                      />
                    </div>

                    <div>
                      <label htmlFor="previousPositions" className="block text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        އެންމެ ފަހުން އަދާކުރި މަޤާމްތައް (2024-2025 ވަނަ އަހަރު)
                      </label>
                      <input
                        type="text"
                        id="previousPositions"
                        name="previousPositions"
                        value={formData.previousPositions}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dhivehi-text"
                        style={{ fontFamily: 'Faruma' }}
                        placeholder="ކުރީގެ މަޤާމްތައް ލިޔުއްވާ"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: ކުރިމަތިލާ މަޤާމް، ތަޢުލީމު */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 md:mb-4 pb-2 border-b-2 border-amber-200 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                    ކުރިމަތިލާ މަޤާމް
                  </h2>

                  <div className="space-y-4 md:space-y-6">
                    {/* Captain */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        ކެޕްޓަނުން (މި މަޤާމަށް ކުރިމަތިލެވޭނީ ހަމައެކަނި ގްރޭޑް 10ގެ ދަރިވަރުންނަށް)
                      </label>
                      <select
                        name="captainPosition"
                        value={formData.captainPosition}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-sm sm:text-base dhivehi-text"
                        style={{ fontFamily: 'Faruma' }}
                      >
                        <option value="">-- އައްޔަން ކުރައްވާ --</option>
                        <option value="ސްކޫލް ކެޕްޓަން">ސްކޫލް ކެޕްޓަން</option>
                        <option value="ޑެޕިއުޓީ ކެޕްޓަން">ޑެޕިއުޓީ ކެޕްޓަން</option>
                      </select>
                    </div>

                    {/* Games Captain */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        ގޭމްސް ކެޕްޓަން (މި މަޤާމަށް ކުރިމަތިލެވޭނީ ގްރޭޑް 9 އަދި 10 ގެ ދަރިވަރުންނަށް)
                      </label>
                      <select
                        name="gamesCaptainPosition"
                        value={formData.gamesCaptainPosition}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-sm sm:text-base dhivehi-text"
                        style={{ fontFamily: 'Faruma' }}
                      >
                        <option value="">-- އައްޔަން ކުރައްވާ --</option>
                        <option value="ގޭމްސް ކެޕްޓަން">ގޭމްސް ކެޕްޓަން</option>
                      </select>
                    </div>

                    {/* Prefects */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        ޕްރިފެކްޓުން
                      </label>
                      <select
                        name="prefectPosition"
                        value={formData.prefectPosition}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-sm sm:text-base dhivehi-text"
                        style={{ fontFamily: 'Faruma' }}
                      >
                        <option value="">-- އައްޔަން ކުރައްވާ --</option>
                        <option value="ޕްރިފެކްޓް (ގްރޭޑް 8 އިން 10 އަށް)">ޕްރިފެކްޓް (ގްރޭޑް 8 އިން 10 އަށް)</option>
                        <option value="ޖޫނިއަރ ޕްރިފެކްޓް (ގްރޭޑް 7)">ޖޫނިއަރ ޕްރިފެކްޓް (ގްރޭޑް 7)</option>
                      </select>
                    </div>

                    {/* Association */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        އެސޯސިއޭޝަން
                      </label>
                      <select
                        name="associationPosition"
                        value={formData.associationPosition}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-sm sm:text-base dhivehi-text"
                        style={{ fontFamily: 'Faruma' }}
                      >
                        <option value="">-- އައްޔަން ކުރައްވާ --</option>
                        <option value="ރައީސް">ރައީސް</option>
                        <option value="ނައިބު ރައީސް">ނައިބު ރައީސް</option>
                        <option value="ޖެނެރަލް ސެކެޓްރީ">ޖެނެރަލް ސެކެޓްރީ</option>
                        <option value="މަންދޫބު">މަންދޫބު</option>
                      </select>
                    </div>

                    {/* Club Grid */}
                    {clubGridConfig && (
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3" style={{ fontFamily: 'Faruma' }}>
                          {clubGridConfig.heading}
                        </label>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto -mx-3 sm:mx-0">
                          <table className="w-full text-xs sm:text-sm">
                            <thead>
                              <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="p-2 sm:p-3 text-right sticky left-0 bg-gray-50 z-10" style={{ fontFamily: 'Faruma' }}></th>
                                {clubGridConfig.columns.map((col, idx) => (
                                  <th key={idx} className="p-2 sm:p-3 text-center font-semibold whitespace-nowrap" style={{ fontFamily: 'Faruma' }}>
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {clubGridConfig.rows.map((row, rowIdx) => (
                                <tr key={rowIdx} className="border-b border-gray-200 hover:bg-gray-50">
                                  <td className="p-2 sm:p-3 text-right font-medium sticky left-0 bg-white z-10 whitespace-nowrap" style={{ fontFamily: 'Faruma' }}>
                                    {row}
                                  </td>
                                  {clubGridConfig.columns.map((col, colIdx) => {
                                    const key = `${col}-${row}`;
                                    return (
                                      <td key={colIdx} className="p-2 sm:p-3 text-center">
                                        <input
                                          type="checkbox"
                                          checked={clubGridSelections[key] || false}
                                          onChange={(e) => handleClubGridSelection(key, e.target.checked)}
                                          className="w-4 h-4 sm:w-5 sm:h-5 accent-red-600"
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* House Grid */}
                    {houseGridConfig && (
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3" style={{ fontFamily: 'Faruma' }}>
                          {houseGridConfig.heading}
                        </label>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto -mx-3 sm:mx-0">
                          <table className="w-full text-xs sm:text-sm">
                            <thead>
                              <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="p-2 sm:p-3 text-right sticky left-0 bg-gray-50 z-10" style={{ fontFamily: 'Faruma' }}></th>
                                {houseGridConfig.columns.map((col, idx) => (
                                  <th key={idx} className="p-2 sm:p-3 text-center font-semibold whitespace-nowrap" style={{ fontFamily: 'Faruma' }}>
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {houseGridConfig.rows.map((row, rowIdx) => (
                                <tr key={rowIdx} className="border-b border-gray-200 hover:bg-gray-50">
                                  <td className="p-2 sm:p-3 text-right font-medium sticky left-0 bg-white z-10 whitespace-nowrap" style={{ fontFamily: 'Faruma' }}>
                                    {row}
                                  </td>
                                  {houseGridConfig.columns.map((col, colIdx) => {
                                    const key = `${col}-${row}`;
                                    return (
                                      <td key={colIdx} className="p-2 sm:p-3 text-center">
                                        <input
                                          type="checkbox"
                                          checked={houseGridSelections[key] || false}
                                          onChange={(e) => handleHouseGridSelection(key, e.target.checked)}
                                          className="w-4 h-4 sm:w-5 sm:h-5 accent-red-600"
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Sports Club */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        ސްޕޯރޓްސް ކުލަބު
                      </label>
                      <select
                        name="sportsClubPosition"
                        value={formData.sportsClubPosition}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-sm sm:text-base dhivehi-text"
                        style={{ fontFamily: 'Faruma' }}
                      >
                        <option value="">-- އައްޔަން ކުރައްވާ --</option>
                        <option value="ނައިބު ރައީސް">ނައިބު ރައީސް</option>
                        <option value="ޖެނެރަލް ސެކެޓްރީ">ޖެނެރަލް ސެކެޓްރީ</option>
                        <option value="މަންދޫބު">މަންދޫބު</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 4: ތަޢުލީމު */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 md:mb-4 pb-2 border-b-2 border-amber-200 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                    ތަޢުލީމު
                  </h2>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        ފުރަތަމަ ސެމިސްޓަރ 2024-2025 - ލިބުނު ނަތީޖާ
                      </label>
                      <select
                        value={firstSemesterGrades}
                        onChange={(e) => setFirstSemesterGrades(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-sm sm:text-base"
                      >
                        <option value="">-- އައްޔަން ކުރައްވާ --</option>
                        {GRADES.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        ދެވަނަ ސެމިސްޓަރ 2024-2025 - ލިބުނު ނަތީޖާ
                      </label>
                      <select
                        value={secondSemesterGrades}
                        onChange={(e) => setSecondSemesterGrades(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-sm sm:text-base"
                      >
                        <option value="">-- އައްޔަން ކުރައްވާ --</option>
                        {GRADES.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 5: ބައިވެރިވެފައިވާ އިތުރު ޙަރަކާތްތައް */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 md:mb-4 pb-2 border-b-2 border-amber-200 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                    ބައިވެރިވެފައިވާ އިތުރު ޙަރަކާތްތައް
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-600 mb-3 md:mb-4 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                    ކޮންމެ ހަރަކާތެއް ވެސް ވަކިވަކިން ލިޔާށެވެ. މިސާލަކަށް، ދިވެހި ދުވަސް ނަމަ، ސުވާލު މުބާރާތް، ޖުމުލަ ހެދުން..... ފަދަ ގޮތަކަށް
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="dhivehiWeek" className="block text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        ދިވެހި ހަފްތާ
                      </label>
                      <textarea
                        id="dhivehiWeek"
                        name="dhivehiWeek"
                        value={formData.dhivehiWeek}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dhivehi-text"
                        style={{ fontFamily: 'Faruma' }}
                        placeholder="ދިވެހި ހަފްތާގައި ބައިވެރިވި ހަރަކާތްތައް"
                      />
                    </div>

                    <div>
                      <label htmlFor="englishWeek" className="block text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        އިނގިރޭސި ހަފްތާ
                      </label>
                      <textarea
                        id="englishWeek"
                        name="englishWeek"
                        value={formData.englishWeek}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dhivehi-text"
                        style={{ fontFamily: 'Faruma' }}
                        placeholder="އިނގިރޭސި ހަފްތާގައި ބައިވެރިވި ހަރަކާތްތައް"
                      />
                    </div>

                    <div>
                      <label htmlFor="islamWeek" className="block text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        އިސްލާމް ހަފްތާ
                      </label>
                      <textarea
                        id="islamWeek"
                        name="islamWeek"
                        value={formData.islamWeek}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dhivehi-text"
                        style={{ fontFamily: 'Faruma' }}
                        placeholder="އިސްލާމް ހަފްތާގައި ބައިވެރިވި ހަރަކާތްތައް"
                      />
                    </div>

                    <div>
                      <label htmlFor="sportsCompetitions" className="block text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        ކުޅިވަރު މުބާރާތް
                      </label>
                      <textarea
                        id="sportsCompetitions"
                        name="sportsCompetitions"
                        value={formData.sportsCompetitions}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dhivehi-text"
                        style={{ fontFamily: 'Faruma' }}
                        placeholder="ކުޅިވަރު މުބާރާތްތަކުގައި ބައިވެރިވި ހަރަކާތްތައް"
                      />
                    </div>

                    <div>
                      <label htmlFor="otherActivities" className="block text-sm font-semibold text-gray-700 mb-2 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
                        އެހެނިހެން
                      </label>
                      <textarea
                        id="otherActivities"
                        name="otherActivities"
                        value={formData.otherActivities}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dhivehi-text"
                        style={{ fontFamily: 'Faruma' }}
                        placeholder="އެހެނިހެން ހަރަކާތްތައް"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 md:pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-600 text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base dhivehi-text"
                    style={{ fontFamily: 'Faruma' }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        ހުށަހަޅަނީ...
                      </>
                    ) : (
                      'ފޯމް ހުށަހެޅުން'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-4 md:mt-6 text-center px-4">
            <p className="text-xs sm:text-sm text-gray-500 dhivehi-text" style={{ fontFamily: 'Faruma' }}>
              އެހީތެރިކަން ބޭނުންތޯ؟ ސްކޫލުގެ އިދާރާއަށް ގުޅުއްވާ
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
