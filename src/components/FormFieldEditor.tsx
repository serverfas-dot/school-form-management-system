import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Save, Edit2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

interface FormField {
  id: string;
  form_key: string;
  field_key: string;
  field_label: string;
  field_label_dhivehi: string;
  field_type: string;
  field_options: string[];
  is_required: boolean;
  display_order: number;
  is_active: boolean;
  placeholder: string;
  section: string;
  help_text: string;
}

interface FormConfig {
  form_key: string;
  form_name_english: string;
  form_name_dhivehi: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'email', label: 'Email' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Button' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Number' }
];

export function FormFieldEditor() {
  const [forms, setForms] = useState<FormConfig[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      loadFields();
    }
  }, [selectedForm]);

  const loadForms = async () => {
    try {
      const { data, error } = await supabase
        .from('form_configurations')
        .select('form_key, form_name_english, form_name_dhivehi')
        .eq('is_active', true)
        .order('form_name_english');

      if (error) throw error;
      setForms(data || []);
    } catch (error) {
      console.error('Error loading forms:', error);
      setMessage({ type: 'error', text: 'Failed to load forms' });
    } finally {
      setLoading(false);
    }
  };

  const loadFields = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_key', selectedForm)
        .order('display_order');

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error loading fields:', error);
      setMessage({ type: 'error', text: 'Failed to load fields' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: '',
      form_key: selectedForm,
      field_key: `field_${Date.now()}`,
      field_label: 'New Field',
      field_label_dhivehi: '',
      field_type: 'text',
      field_options: [],
      is_required: false,
      display_order: fields.length,
      is_active: true,
      placeholder: '',
      section: '',
      help_text: ''
    };
    setEditingField(newField);
  };

  const handleSaveField = async () => {
    if (!editingField) return;

    try {
      setSaving(true);

      if (editingField.id) {
        const { error } = await supabase
          .from('form_fields')
          .update({
            field_label: editingField.field_label,
            field_label_dhivehi: editingField.field_label_dhivehi,
            field_type: editingField.field_type,
            field_options: editingField.field_options,
            is_required: editingField.is_required,
            is_active: editingField.is_active,
            placeholder: editingField.placeholder,
            section: editingField.section,
            help_text: editingField.help_text,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingField.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('form_fields')
          .insert([editingField]);

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Field saved successfully!' });
      setEditingField(null);
      loadFields();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving field:', error);
      setMessage({ type: 'error', text: 'Failed to save field' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;

    try {
      const { error } = await supabase
        .from('form_fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Field deleted successfully!' });
      loadFields();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting field:', error);
      setMessage({ type: 'error', text: 'Failed to delete field' });
    }
  };

  const handleMoveField = async (fieldId: string, direction: 'up' | 'down') => {
    const fieldIndex = fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return;
    if (direction === 'up' && fieldIndex === 0) return;
    if (direction === 'down' && fieldIndex === fields.length - 1) return;

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    [newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]];

    try {
      const updates = newFields.map((field, index) =>
        supabase
          .from('form_fields')
          .update({ display_order: index })
          .eq('id', field.id)
      );

      await Promise.all(updates);
      loadFields();
    } catch (error) {
      console.error('Error reordering fields:', error);
      setMessage({ type: 'error', text: 'Failed to reorder fields' });
    }
  };

  const handleToggleActive = async (field: FormField) => {
    try {
      const { error } = await supabase
        .from('form_fields')
        .update({ is_active: !field.is_active })
        .eq('id', field.id);

      if (error) throw error;
      loadFields();
    } catch (error) {
      console.error('Error toggling field:', error);
      setMessage({ type: 'error', text: 'Failed to toggle field' });
    }
  };

  if (loading && forms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Form Field Editor</h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Form</label>
          <select
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select a form --</option>
            {forms.map((form) => (
              <option key={form.form_key} value={form.form_key}>
                {form.form_name_english}
              </option>
            ))}
          </select>
        </div>

        {selectedForm && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Form Fields</h3>
              <button
                onClick={handleAddField}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus size={16} />
                Add Field
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : fields.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500">No fields found. Add your first field to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`bg-white rounded-lg shadow-md p-4 ${!field.is_active ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMoveField(field.id, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            onClick={() => handleMoveField(field.id, 'down')}
                            disabled={index === fields.length - 1}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>

                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{field.field_label}</h4>
                          {field.field_label_dhivehi && (
                            <p className="text-sm text-gray-600" style={{ fontFamily: 'Faruma' }}>
                              {field.field_label_dhivehi}
                            </p>
                          )}
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>Type: {field.field_type}</span>
                            <span>Key: {field.field_key}</span>
                            {field.is_required && <span className="text-red-600">Required</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(field)}
                          className="p-2 hover:bg-gray-100 rounded transition"
                          title={field.is_active ? 'Hide field' : 'Show field'}
                        >
                          {field.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                          onClick={() => setEditingField(field)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id)}
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
          </>
        )}

        {editingField && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingField.id ? 'Edit Field' : 'Add New Field'}
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Field Label (English)</label>
                      <input
                        type="text"
                        value={editingField.field_label}
                        onChange={(e) => setEditingField({ ...editingField, field_label: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Field Label (Dhivehi)</label>
                      <input
                        type="text"
                        value={editingField.field_label_dhivehi}
                        onChange={(e) => setEditingField({ ...editingField, field_label_dhivehi: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        style={{ fontFamily: 'Faruma' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Field Type</label>
                    <select
                      value={editingField.field_type}
                      onChange={(e) => setEditingField({ ...editingField, field_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {FIELD_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(editingField.field_type === 'select' || editingField.field_type === 'radio' || editingField.field_type === 'checkbox') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Options (one per line)
                      </label>
                      <textarea
                        value={editingField.field_options.join('\n')}
                        onChange={(e) => setEditingField({ ...editingField, field_options: e.target.value.split('\n').filter(o => o.trim()) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={5}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Placeholder</label>
                    <input
                      type="text"
                      value={editingField.placeholder}
                      onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Section/Group</label>
                    <input
                      type="text"
                      value={editingField.section}
                      onChange={(e) => setEditingField({ ...editingField, section: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Help Text</label>
                    <input
                      type="text"
                      value={editingField.help_text}
                      onChange={(e) => setEditingField({ ...editingField, help_text: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingField.is_required}
                        onChange={(e) => setEditingField({ ...editingField, is_required: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-semibold text-gray-700">Required Field</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingField.is_active}
                        onChange={(e) => setEditingField({ ...editingField, is_active: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-semibold text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveField}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Field'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
