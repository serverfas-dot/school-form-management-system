import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getAdminSession } from '../lib/auth';
import { Loader2, Save, FileText, Package, Users, CheckCircle, AlertCircle, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface FormConfig {
  id: string;
  form_type: string;
  form_key: string;
  form_name_english: string;
  form_name_dhivehi: string;
  is_active: boolean;
  title: string;
  subtitle: string;
  success_message: string;
  button_text: string;
  category: 'student' | 'staff_others';
  additional_config: {
    landing_title?: string;
    landing_title_dv?: string;
    landing_description?: string;
    section_headings?: {
      activities?: string;
      info?: string;
      note?: string;
      other_activity?: string;
    };
    activity_options?: string[];
    field_labels?: {
      name?: string;
      child_student?: string;
      blood_group?: string;
      mobile_number?: string;
      additional_mobile?: string;
      arrangement?: string;
      office_number?: string;
      other_activity_placeholder?: string;
      blood_group_placeholder?: string;
    };
    card_details?: string[];
  };
  updated_at: string;
  updated_by: string;
}

export default function FormSettingsEditor() {
  const [configs, setConfigs] = useState<FormConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedForm, setSelectedForm] = useState<string>('stationery');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sectionHeadings: false,
    activityOptions: false,
    fieldLabels: false,
    cardDetails: false,
  });

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('form_configurations')
        .select('*')
        .order('form_type');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching configurations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (formType: string, field: string, value: any) => {
    setConfigs(prev =>
      prev.map(config => {
        if (config.form_type === formType) {
          if (field.startsWith('additional_config.')) {
            const path = field.replace('additional_config.', '').split('.');
            const updatedAdditionalConfig = { ...config.additional_config };

            if (path.length === 1) {
              updatedAdditionalConfig[path[0] as keyof typeof updatedAdditionalConfig] = value;
            } else if (path.length === 2) {
              const [parent, child] = path;
              updatedAdditionalConfig[parent as keyof typeof updatedAdditionalConfig] = {
                ...(updatedAdditionalConfig[parent as keyof typeof updatedAdditionalConfig] as any),
                [child]: value
              };
            }

            return {
              ...config,
              additional_config: updatedAdditionalConfig
            };
          }
          return { ...config, [field]: value };
        }
        return config;
      })
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const session = getAdminSession();
      const username = session?.username || 'admin';

      const updates = configs.map(config => ({
        ...config,
        updated_at: new Date().toISOString(),
        updated_by: username
      }));

      for (const config of updates) {
        const { error } = await supabase
          .from('form_configurations')
          .update({
            form_key: config.form_key,
            form_name_english: config.form_name_english,
            form_name_dhivehi: config.form_name_dhivehi,
            is_active: config.is_active,
            title: config.title,
            subtitle: config.subtitle,
            success_message: config.success_message,
            button_text: config.button_text,
            category: config.category,
            additional_config: config.additional_config,
            updated_at: config.updated_at,
            updated_by: config.updated_by
          })
          .eq('form_type', config.form_type);

        if (error) throw error;
      }

      setSaveStatus({ type: 'success', message: 'All form configurations saved successfully!' });
      fetchConfigurations();
    } catch (error) {
      console.error('Error saving configurations:', error);
      setSaveStatus({ type: 'error', message: 'Failed to save configurations. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const getFormIcon = (formType: string) => {
    switch (formType) {
      case 'stationery':
        return <FileText className="w-6 h-6" />;
      case 'office-items':
        return <Package className="w-6 h-6" />;
      case 'volunteer':
        return <Users className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getFormColor = (formType: string) => {
    switch (formType) {
      case 'stationery':
        return 'blue';
      case 'office-items':
        return 'green';
      case 'volunteer':
        return 'amber';
      default:
        return 'gray';
    }
  };

  const currentConfig = configs.find(c => c.form_type === selectedForm);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Form Settings Editor</h2>
          <p className="text-slate-200">Customize headings, subheadings, and messages for all forms</p>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6 border-b pb-4">
            {configs.map((config) => {
              const color = getFormColor(config.form_type);
              const isSelected = selectedForm === config.form_type;
              return (
                <button
                  key={config.form_type}
                  onClick={() => setSelectedForm(config.form_type)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    isSelected
                      ? `bg-${color}-100 text-${color}-700 border-2 border-${color}-500`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  {getFormIcon(config.form_type)}
                  <span className="font-medium capitalize">
                    {config.form_type === 'office-items' ? 'Office Items' : config.form_type}
                  </span>
                </button>
              );
            })}
          </div>

          {currentConfig && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Form Type:</strong> {currentConfig.form_type}
                </p>
                {currentConfig.updated_by && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Last updated by:</strong> {currentConfig.updated_by} on{' '}
                    {new Date(currentConfig.updated_at).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Category
                </label>
                <select
                  value={currentConfig.category}
                  onChange={(e) => handleUpdate(currentConfig.form_type, 'category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="student">Student - ދަރިވަރުންގެ ފޯމް</option>
                  <option value="staff_others">Staff and Others - މުވައްޒަފުންނާއި އެހެނިހެން</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Select which category this form belongs to</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Status
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is-active"
                    checked={currentConfig.is_active}
                    onChange={(e) => handleUpdate(currentConfig.form_type, 'is_active', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="is-active" className="text-sm text-gray-700">
                    Form is active and visible to users
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Inactive forms will not appear in the category list</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Display Name (English)
                </label>
                <input
                  type="text"
                  value={currentConfig.form_name_english}
                  onChange={(e) => handleUpdate(currentConfig.form_type, 'form_name_english', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter form name in English"
                />
                <p className="text-xs text-gray-500 mt-1">This name appears in the category list</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Display Name (Dhivehi)
                </label>
                <input
                  type="text"
                  value={currentConfig.form_name_dhivehi}
                  onChange={(e) => handleUpdate(currentConfig.form_type, 'form_name_dhivehi', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                  style={{ fontFamily: 'Faruma' }}
                  placeholder="ފޯމްގެ ނަން ދިވެހި"
                />
                <p className="text-xs text-gray-500 mt-1">This name appears in the category list</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Form Title
                </label>
                <input
                  type="text"
                  value={currentConfig.title}
                  onChange={(e) => handleUpdate(currentConfig.form_type, 'title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter form title"
                />
                <p className="text-xs text-gray-500 mt-1">This appears at the top of the form</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={currentConfig.subtitle}
                  onChange={(e) => handleUpdate(currentConfig.form_type, 'subtitle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subtitle or description"
                />
                <p className="text-xs text-gray-500 mt-1">Brief description shown below the title</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success Message
                </label>
                <textarea
                  value={currentConfig.success_message}
                  onChange={(e) => handleUpdate(currentConfig.form_type, 'success_message', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter success message"
                />
                <p className="text-xs text-gray-500 mt-1">Message shown after successful form submission</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submit Button Text
                </label>
                <input
                  type="text"
                  value={currentConfig.button_text}
                  onChange={(e) => handleUpdate(currentConfig.form_type, 'button_text', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter button text"
                />
                <p className="text-xs text-gray-500 mt-1">Text displayed on the submit button</p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Landing Page Settings</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landing Page Title
                    </label>
                    <input
                      type="text"
                      value={currentConfig.additional_config.landing_title || ''}
                      onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.landing_title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter landing page title"
                    />
                  </div>

                  {currentConfig.form_type === 'volunteer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Landing Page Title (Dhivehi)
                      </label>
                      <input
                        type="text"
                        value={currentConfig.additional_config.landing_title_dv || ''}
                        onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.landing_title_dv', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                        style={{ fontFamily: 'Faruma' }}
                        placeholder="ލޭންޑިން ޕޭޖް ޓައިޓަލް"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landing Page Description
                    </label>
                    <textarea
                      value={currentConfig.additional_config.landing_description || ''}
                      onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.landing_description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Enter landing page description"
                    />
                  </div>

                  {currentConfig.form_type === 'volunteer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Home Card Details (Bullet Points)
                      </label>
                      <div className="space-y-2">
                        {(currentConfig.additional_config.card_details || []).map((detail, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={detail}
                              onChange={(e) => {
                                const newDetails = [...(currentConfig.additional_config.card_details || [])];
                                newDetails[index] = e.target.value;
                                handleUpdate(currentConfig.form_type, 'additional_config.card_details', newDetails);
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="• Bullet point"
                            />
                            <button
                              onClick={() => {
                                const newDetails = (currentConfig.additional_config.card_details || []).filter((_, i) => i !== index);
                                handleUpdate(currentConfig.form_type, 'additional_config.card_details', newDetails);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newDetails = [...(currentConfig.additional_config.card_details || []), '• New item'];
                            handleUpdate(currentConfig.form_type, 'additional_config.card_details', newDetails);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Detail
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {currentConfig.form_type === 'volunteer' && (
                <>
                  <div className="border-t pt-6">
                    <button
                      onClick={() => toggleSection('sectionHeadings')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-lg font-semibold text-gray-800">Section Headings</h3>
                      {expandedSections.sectionHeadings ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {expandedSections.sectionHeadings && (
                      <div className="mt-4 space-y-4 pl-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Activities Section Heading
                          </label>
                          <input
                            type="text"
                            value={currentConfig.additional_config.section_headings?.activities || ''}
                            onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.section_headings.activities', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            style={{ fontFamily: 'Faruma' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Information Section Heading
                          </label>
                          <input
                            type="text"
                            value={currentConfig.additional_config.section_headings?.info || ''}
                            onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.section_headings.info', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            style={{ fontFamily: 'Faruma' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Note Section Heading
                          </label>
                          <input
                            type="text"
                            value={currentConfig.additional_config.section_headings?.note || ''}
                            onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.section_headings.note', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            style={{ fontFamily: 'Faruma' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Other Activity Label
                          </label>
                          <input
                            type="text"
                            value={currentConfig.additional_config.section_headings?.other_activity || ''}
                            onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.section_headings.other_activity', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            style={{ fontFamily: 'Faruma' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <button
                      onClick={() => toggleSection('activityOptions')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-lg font-semibold text-gray-800">Activity Options (Checkboxes)</h3>
                      {expandedSections.activityOptions ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {expandedSections.activityOptions && (
                      <div className="mt-4 space-y-2 pl-4">
                        {(currentConfig.additional_config.activity_options || []).map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(currentConfig.additional_config.activity_options || [])];
                                newOptions[index] = e.target.value;
                                handleUpdate(currentConfig.form_type, 'additional_config.activity_options', newOptions);
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                              style={{ fontFamily: 'Faruma' }}
                            />
                            <button
                              onClick={() => {
                                const newOptions = (currentConfig.additional_config.activity_options || []).filter((_, i) => i !== index);
                                handleUpdate(currentConfig.form_type, 'additional_config.activity_options', newOptions);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newOptions = [...(currentConfig.additional_config.activity_options || []), ''];
                            handleUpdate(currentConfig.form_type, 'additional_config.activity_options', newOptions);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Activity Option
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <button
                      onClick={() => toggleSection('fieldLabels')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-lg font-semibold text-gray-800">Form Field Labels</h3>
                      {expandedSections.fieldLabels ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {expandedSections.fieldLabels && (
                      <div className="mt-4 grid grid-cols-2 gap-4 pl-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name Field Label
                          </label>
                          <input
                            type="text"
                            value={currentConfig.additional_config.field_labels?.name || ''}
                            onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.field_labels.name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            style={{ fontFamily: 'Faruma' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Child/Student Field Label
                          </label>
                          <input
                            type="text"
                            value={currentConfig.additional_config.field_labels?.child_student || ''}
                            onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.field_labels.child_student', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            style={{ fontFamily: 'Faruma' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Blood Group Field Label
                          </label>
                          <input
                            type="text"
                            value={currentConfig.additional_config.field_labels?.blood_group || ''}
                            onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.field_labels.blood_group', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            style={{ fontFamily: 'Faruma' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Blood Group Placeholder
                          </label>
                          <input
                            type="text"
                            value={currentConfig.additional_config.field_labels?.blood_group_placeholder || ''}
                            onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.field_labels.blood_group_placeholder', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobile Number Field Label
                          </label>
                          <input
                            type="text"
                            value={currentConfig.additional_config.field_labels?.mobile_number || ''}
                            onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.field_labels.mobile_number', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            style={{ fontFamily: 'Faruma' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Mobile Field Label
                          </label>
                          <input
                            type="text"
                            value={currentConfig.additional_config.field_labels?.additional_mobile || ''}
                            onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.field_labels.additional_mobile', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            style={{ fontFamily: 'Faruma' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Arrangement Field Label
                          </label>
                          <input
                            type="text"
                            value={currentConfig.additional_config.field_labels?.arrangement || ''}
                            onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.field_labels.arrangement', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            style={{ fontFamily: 'Faruma' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Office Number Field Label
                          </label>
                          <input
                            type="text"
                            value={currentConfig.additional_config.field_labels?.office_number || ''}
                            onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.field_labels.office_number', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            style={{ fontFamily: 'Faruma' }}
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Other Activity Placeholder
                          </label>
                          <input
                            type="text"
                            value={currentConfig.additional_config.field_labels?.other_activity_placeholder || ''}
                            onChange={(e) => handleUpdate(currentConfig.form_type, 'additional_config.field_labels.other_activity_placeholder', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            style={{ fontFamily: 'Faruma' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {saveStatus && (
                <div
                  className={`flex items-center gap-2 p-4 rounded-lg ${
                    saveStatus.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {saveStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span>{saveStatus.message}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={fetchConfigurations}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Reset Changes
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save All Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
