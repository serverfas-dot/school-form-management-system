import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Unlock, Calendar, Loader2 } from 'lucide-react';

interface FormConfig {
  form_key: string;
  form_name_english: string;
  form_name_dhivehi: string;
  is_open: boolean;
  open_date: string | null;
  close_date: string | null;
}

export function FormAccessControl() {
  const [forms, setForms] = useState<FormConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('form_configurations')
        .select('form_key, form_name_english, form_name_dhivehi, is_open, open_date, close_date')
        .order('form_name_english');

      if (error) throw error;

      if (data) {
        setForms(data as FormConfig[]);
      }
    } catch (error) {
      console.error('Error loading forms:', error);
      setMessage({ type: 'error', text: 'Failed to load forms' });
    } finally {
      setLoading(false);
    }
  };

  const toggleFormAccess = async (formKey: string, currentStatus: boolean) => {
    try {
      setUpdating(formKey);
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from('form_configurations')
        .update({
          is_open: newStatus,
          [newStatus ? 'open_date' : 'close_date']: new Date().toISOString()
        })
        .eq('form_key', formKey);

      if (error) throw error;

      setForms(forms.map(form =>
        form.form_key === formKey
          ? {
              ...form,
              is_open: newStatus,
              [newStatus ? 'open_date' : 'close_date']: new Date().toISOString()
            }
          : form
      ));

      const formName = forms.find(f => f.form_key === formKey)?.form_name_english || 'Form';
      setMessage({
        type: 'success',
        text: `${formName} ${newStatus ? 'opened' : 'closed'} successfully!`
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error toggling form access:', error);
      setMessage({ type: 'error', text: 'Failed to update form access' });
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Form Access Control</h2>
        <p className="text-gray-600">
          Control which forms are accessible to public users. Toggle to open or close forms.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {forms.map((form) => (
          <div key={form.form_key} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {form.form_name_english}
                </h3>
                <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Faruma' }}>
                  {form.form_name_dhivehi}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} />
                  <span>
                    {form.is_open ? (
                      <>Opened: {formatDate(form.open_date)}</>
                    ) : (
                      <>Closed: {formatDate(form.close_date)}</>
                    )}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleFormAccess(form.form_key, form.is_open)}
                disabled={updating === form.form_key}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 ${
                  form.is_open
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {updating === form.form_key ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {form.is_open ? <Unlock size={18} /> : <Lock size={18} />}
                    <span className="font-semibold">
                      {form.is_open ? 'Open' : 'Closed'}
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className={`p-3 rounded-lg border text-sm ${
              form.is_open
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p className="font-medium">
                {form.is_open ? (
                  <>✓ Form is open for public submissions</>
                ) : (
                  <>✗ Form is closed - public users cannot submit</>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {forms.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500">No forms configured</p>
        </div>
      )}
    </div>
  );
}
