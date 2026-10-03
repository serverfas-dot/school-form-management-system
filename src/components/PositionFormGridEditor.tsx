import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface GridConfig {
  id: string;
  grid_type: string;
  heading: string;
  rows: string[];
  columns: string[];
}

export function PositionFormGridEditor() {
  const [clubGridConfig, setClubGridConfig] = useState<GridConfig | null>(null);
  const [houseGridConfig, setHouseGridConfig] = useState<GridConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [editingClub, setEditingClub] = useState(false);
  const [editingHouse, setEditingHouse] = useState(false);

  useEffect(() => {
    fetchGridConfigurations();
  }, []);

  const fetchGridConfigurations = async () => {
    try {
      setLoading(true);
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
      setMessage({ type: 'error', text: 'Failed to load grid configurations' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrid = async (gridType: 'club' | 'house') => {
    try {
      setSaving(true);
      const config = gridType === 'club' ? clubGridConfig : houseGridConfig;

      if (!config) return;

      const { error } = await supabase
        .from('position_form_grids')
        .update({
          heading: config.heading,
          rows: config.rows,
          columns: config.columns,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Grid configuration saved successfully!' });
      if (gridType === 'club') setEditingClub(false);
      if (gridType === 'house') setEditingHouse(false);

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving grid configuration:', error);
      setMessage({ type: 'error', text: 'Failed to save grid configuration' });
    } finally {
      setSaving(false);
    }
  };

  const updateGridHeading = (gridType: 'club' | 'house', heading: string) => {
    if (gridType === 'club' && clubGridConfig) {
      setClubGridConfig({ ...clubGridConfig, heading });
    } else if (gridType === 'house' && houseGridConfig) {
      setHouseGridConfig({ ...houseGridConfig, heading });
    }
  };

  const addRow = (gridType: 'club' | 'house') => {
    const config = gridType === 'club' ? clubGridConfig : houseGridConfig;
    if (!config) return;

    const newRow = 'New Row';
    const updatedConfig = { ...config, rows: [...config.rows, newRow] };

    if (gridType === 'club') {
      setClubGridConfig(updatedConfig);
    } else {
      setHouseGridConfig(updatedConfig);
    }
  };

  const removeRow = (gridType: 'club' | 'house', index: number) => {
    const config = gridType === 'club' ? clubGridConfig : houseGridConfig;
    if (!config) return;

    const updatedRows = config.rows.filter((_, i) => i !== index);
    const updatedConfig = { ...config, rows: updatedRows };

    if (gridType === 'club') {
      setClubGridConfig(updatedConfig);
    } else {
      setHouseGridConfig(updatedConfig);
    }
  };

  const updateRow = (gridType: 'club' | 'house', index: number, value: string) => {
    const config = gridType === 'club' ? clubGridConfig : houseGridConfig;
    if (!config) return;

    const updatedRows = [...config.rows];
    updatedRows[index] = value;
    const updatedConfig = { ...config, rows: updatedRows };

    if (gridType === 'club') {
      setClubGridConfig(updatedConfig);
    } else {
      setHouseGridConfig(updatedConfig);
    }
  };

  const addColumn = (gridType: 'club' | 'house') => {
    const config = gridType === 'club' ? clubGridConfig : houseGridConfig;
    if (!config) return;

    const newColumn = 'New Column';
    const updatedConfig = { ...config, columns: [...config.columns, newColumn] };

    if (gridType === 'club') {
      setClubGridConfig(updatedConfig);
    } else {
      setHouseGridConfig(updatedConfig);
    }
  };

  const removeColumn = (gridType: 'club' | 'house', index: number) => {
    const config = gridType === 'club' ? clubGridConfig : houseGridConfig;
    if (!config) return;

    const updatedColumns = config.columns.filter((_, i) => i !== index);
    const updatedConfig = { ...config, columns: updatedColumns };

    if (gridType === 'club') {
      setClubGridConfig(updatedConfig);
    } else {
      setHouseGridConfig(updatedConfig);
    }
  };

  const updateColumn = (gridType: 'club' | 'house', index: number, value: string) => {
    const config = gridType === 'club' ? clubGridConfig : houseGridConfig;
    if (!config) return;

    const updatedColumns = [...config.columns];
    updatedColumns[index] = value;
    const updatedConfig = { ...config, columns: updatedColumns };

    if (gridType === 'club') {
      setClubGridConfig(updatedConfig);
    } else {
      setHouseGridConfig(updatedConfig);
    }
  };

  const renderGridEditor = (gridType: 'club' | 'house', config: GridConfig | null, isEditing: boolean, setEditing: (value: boolean) => void) => {
    if (!config) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {gridType === 'club' ? 'Club Grid Configuration' : 'House Grid Configuration'}
          </h3>
          {!isEditing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit Grid
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveGrid(gridType)}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  fetchGridConfigurations();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Heading</label>
            <input
              type="text"
              value={config.heading}
              onChange={(e) => updateGridHeading(gridType, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontFamily: 'Faruma' }}
            />
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-semibold text-gray-700">Rows</h4>
            {isEditing && (
              <button
                onClick={() => addRow(gridType)}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm"
              >
                <Plus size={14} />
                Add Row
              </button>
            )}
          </div>
          <div className="space-y-2">
            {config.rows.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={row}
                      onChange={(e) => updateRow(gridType, index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: 'Faruma' }}
                    />
                    <button
                      onClick={() => removeRow(gridType, index)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <div className="flex-1 px-3 py-2 bg-gray-100 rounded-lg" style={{ fontFamily: 'Faruma' }}>
                    {row}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-semibold text-gray-700">Columns</h4>
            {isEditing && (
              <button
                onClick={() => addColumn(gridType)}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm"
              >
                <Plus size={14} />
                Add Column
              </button>
            )}
          </div>
          <div className="space-y-2">
            {config.columns.map((column, index) => (
              <div key={index} className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={column}
                      onChange={(e) => updateColumn(gridType, index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: 'Faruma' }}
                    />
                    <button
                      onClick={() => removeColumn(gridType, index)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <div className="flex-1 px-3 py-2 bg-gray-100 rounded-lg" style={{ fontFamily: 'Faruma' }}>
                    {column}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grid configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Position Form Grid Editor</h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {renderGridEditor('club', clubGridConfig, editingClub, setEditingClub)}
        {renderGridEditor('house', houseGridConfig, editingHouse, setEditingHouse)}
      </div>
    </div>
  );
}
