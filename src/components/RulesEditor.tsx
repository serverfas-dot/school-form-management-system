import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Save, X, Edit2, ChevronUp, ChevronDown, Lock, Unlock } from 'lucide-react';

interface RuleSection {
  title: string;
  color: string;
  items: string[];
  note?: string;
}

const COLOR_OPTIONS = [
  { value: 'amber', label: 'Amber (Yellow)' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'red', label: 'Red' },
  { value: 'gray', label: 'Gray' }
];

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

export function RulesEditor() {
  const [rulesContent, setRulesContent] = useState<RuleSection[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRulesContent();
  }, []);

  const loadRulesContent = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error('Error loading rules content:', error);
      setMessage({ type: 'error', text: 'Failed to load rules content' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('form_configurations')
        .update({ rules_content: rulesContent })
        .eq('form_key', 'position-application');

      if (error) throw error;

      setMessage({ type: 'success', text: 'Rules saved successfully!' });
      setEditingSection(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving rules:', error);
      setMessage({ type: 'error', text: 'Failed to save rules' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFormAccess = async () => {
    try {
      const newStatus = !isFormOpen;
      const { error } = await supabase
        .from('form_configurations')
        .update({
          is_open: newStatus,
          [newStatus ? 'open_date' : 'close_date']: new Date().toISOString()
        })
        .eq('form_key', 'position-application');

      if (error) throw error;

      setIsFormOpen(newStatus);
      setMessage({
        type: 'success',
        text: newStatus ? 'Form opened for public access!' : 'Form closed - public access disabled'
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error toggling form access:', error);
      setMessage({ type: 'error', text: 'Failed to update form access' });
    }
  };

  const handleAddSection = () => {
    const newSection: RuleSection = {
      title: 'New Section',
      color: 'gray',
      items: ['• New item']
    };
    setRulesContent([...rulesContent, newSection]);
    setEditingSection(rulesContent.length);
  };

  const handleDeleteSection = (index: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    const newRules = rulesContent.filter((_, i) => i !== index);
    setRulesContent(newRules);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === rulesContent.length - 1) return;

    const newRules = [...rulesContent];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newRules[index], newRules[targetIndex]] = [newRules[targetIndex], newRules[index]];
    setRulesContent(newRules);
  };

  const handleUpdateSection = (index: number, field: keyof RuleSection, value: string) => {
    const newRules = [...rulesContent];
    if (field === 'items') {
      newRules[index][field] = value.split('\n').filter(item => item.trim());
    } else if (field === 'note') {
      newRules[index][field] = value || undefined;
    } else {
      newRules[index][field] = value;
    }
    setRulesContent(newRules);
  };

  const handleAddItem = (sectionIndex: number) => {
    const newRules = [...rulesContent];
    newRules[sectionIndex].items.push('• New item');
    setRulesContent(newRules);
  };

  const handleDeleteItem = (sectionIndex: number, itemIndex: number) => {
    const newRules = [...rulesContent];
    newRules[sectionIndex].items = newRules[sectionIndex].items.filter((_, i) => i !== itemIndex);
    setRulesContent(newRules);
  };

  const handleUpdateItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const newRules = [...rulesContent];
    newRules[sectionIndex].items[itemIndex] = value;
    setRulesContent(newRules);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Position Form Rules Editor</h2>
          <div className="flex gap-2">
            <button
              onClick={handleAddSection}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus size={16} />
              Add Section
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Form Access Control</h3>
              <p className="text-sm text-gray-600">
                Control whether the public can access and submit the position application form
              </p>
            </div>
            <button
              onClick={handleToggleFormAccess}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isFormOpen
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {isFormOpen ? <Unlock size={20} /> : <Lock size={20} />}
              <span className="font-semibold">
                {isFormOpen ? 'Form is Open' : 'Form is Closed'}
              </span>
            </button>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Status:</span>{' '}
              {isFormOpen ? (
                <span className="text-green-600">Public users can access and submit the form</span>
              ) : (
                <span className="text-red-600">Public users will see a locked message</span>
              )}
            </p>
          </div>
        </div>

        {rulesContent.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No rules sections found. Add your first section to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rulesContent.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex flex-col gap-1 pt-2">
                      <button
                        onClick={() => handleMoveSection(sectionIndex, 'up')}
                        disabled={sectionIndex === 0}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => handleMoveSection(sectionIndex, 'down')}
                        disabled={sectionIndex === rulesContent.length - 1}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <div className="flex-1">
                      {editingSection === sectionIndex ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title</label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => handleUpdateSection(sectionIndex, 'title', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              style={{ fontFamily: 'Faruma' }}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                            <select
                              value={section.color}
                              onChange={(e) => handleUpdateSection(sectionIndex, 'color', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              {COLOR_OPTIONS.map((color) => (
                                <option key={color.value} value={color.value}>
                                  {color.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-semibold text-gray-700">Items</label>
                              <button
                                onClick={() => handleAddItem(sectionIndex)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm"
                              >
                                <Plus size={14} />
                                Add Item
                              </button>
                            </div>
                            <div className="space-y-2">
                              {section.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => handleUpdateItem(sectionIndex, itemIndex, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    style={{ fontFamily: 'Faruma' }}
                                  />
                                  <button
                                    onClick={() => handleDeleteItem(sectionIndex, itemIndex)}
                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Note (Optional)</label>
                            <input
                              type="text"
                              value={section.note || ''}
                              onChange={(e) => handleUpdateSection(sectionIndex, 'note', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              style={{ fontFamily: 'Faruma' }}
                              placeholder="Optional note at the bottom"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg mb-2" style={{ fontFamily: 'Faruma' }}>
                            {section.title}
                          </h3>
                          <div className={`${getColorClasses(section.color)} rounded-lg p-3 text-sm`}>
                            <ul className="space-y-1 text-gray-700" style={{ fontFamily: 'Faruma' }}>
                              {section.items.map((item, itemIndex) => (
                                <li key={itemIndex}>{item}</li>
                              ))}
                            </ul>
                            {section.note && (
                              <p className="mt-2 text-xs text-gray-600" style={{ fontFamily: 'Faruma' }}>
                                {section.note}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setEditingSection(editingSection === sectionIndex ? null : sectionIndex)}
                      className="p-2 hover:bg-blue-100 text-blue-600 rounded transition"
                    >
                      {editingSection === sectionIndex ? <X size={18} /> : <Edit2 size={18} />}
                    </button>
                    <button
                      onClick={() => handleDeleteSection(sectionIndex)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
