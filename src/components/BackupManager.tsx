import React, { useState, useEffect } from 'react';
import { Download, Upload, Calendar, Clock, Database, CheckCircle, AlertCircle, Loader2, FolderOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BackupConfig {
  id: string;
  backup_type: 'weekly' | 'monthly' | 'yearly';
  schedule_enabled: boolean;
  last_backup_date: string | null;
  next_backup_date: string | null;
  backup_count: number;
}

interface BackupHistory {
  id: string;
  backup_type: string;
  backup_size: number;
  record_count: number;
  tables_backed_up: string[];
  created_at: string;
  created_by: string;
}

interface BackupData {
  metadata: {
    version: string;
    timestamp: string;
    created_by: string;
    tables: string[];
  };
  data: {
    form_submissions: any[];
    volunteer_forms: any[];
    club_registrations: any[];
    position_applications: any[];
    office_items_requests: any[];
    form_configurations: any[];
    form_fields: any[];
    position_form_grid_configurations: any[];
    form_access_control: any[];
  };
}

export default function BackupManager({ adminUsername }: { adminUsername: string }) {
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [history, setHistory] = useState<BackupHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);

  useEffect(() => {
    loadBackupData();
  }, []);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      checkScheduledBackups();
    }, 60000);

    checkScheduledBackups();

    return () => clearInterval(checkInterval);
  }, [configs]);

  const loadBackupData = async () => {
    try {
      const [configsRes, historyRes] = await Promise.all([
        supabase.from('backup_configurations').select('*').order('backup_type'),
        supabase.from('backup_history').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      if (configsRes.error) {
        console.error('Error loading backup configurations:', configsRes.error);
        setMessage({ type: 'error', text: 'Failed to load backup configurations' });
      } else if (configsRes.data) {
        console.log('Loaded backup configs:', configsRes.data);
        setConfigs(configsRes.data);
      }

      if (historyRes.error) {
        console.error('Error loading backup history:', historyRes.error);
      } else if (historyRes.data) {
        setHistory(historyRes.data);
      }
    } catch (error) {
      console.error('Error loading backup data:', error);
      setMessage({ type: 'error', text: 'Failed to load backup data' });
    } finally {
      setLoading(false);
    }
  };

  const checkScheduledBackups = async () => {
    if (backingUp || configs.length === 0) return;

    const now = new Date();

    for (const config of configs) {
      if (config.schedule_enabled && config.next_backup_date) {
        const nextBackupDate = new Date(config.next_backup_date);

        if (now >= nextBackupDate) {
          console.log(`Scheduled ${config.backup_type} backup is due. Triggering backup...`);
          await createBackup(config.backup_type, true);
        }
      }
    }
  };

  const isFolderSelectionAvailable = () => {
    return 'showDirectoryPicker' in window &&
           (window.location.protocol === 'https:' || window.location.hostname === 'localhost');
  };

  const selectBackupFolder = async () => {
    try {
      if (!isFolderSelectionAvailable()) {
        setMessage({
          type: 'info',
          text: 'Folder selection requires HTTPS or localhost. Scheduled backups will automatically download to your default downloads folder.'
        });
        return null;
      }

      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'downloads'
      });

      setDirHandle(handle);
      setMessage({ type: 'success', text: `Backup folder selected: ${handle.name}` });
      return handle;
    } catch (error) {
      const err = error as Error;
      if (err.name === 'AbortError') {
        setMessage(null);
        return null;
      }

      console.error('Error selecting folder:', error);

      if (err.name === 'NotAllowedError') {
        setMessage({
          type: 'info',
          text: 'Folder access not granted. Backups will download to default location.'
        });
      } else {
        setMessage({
          type: 'info',
          text: 'Folder selection not available. Backups will download to default location.'
        });
      }
      return null;
    }
  };

  const exportAllData = async (): Promise<BackupData> => {
    const tables = [
      'form_submissions',
      'volunteer_forms',
      'club_registrations',
      'position_applications',
      'office_items_requests',
      'form_configurations',
      'form_fields',
      'position_form_grid_configurations',
      'form_access_control'
    ];

    const data: any = {};

    for (const table of tables) {
      const { data: tableData, error } = await supabase.from(table).select('*');
      if (error) {
        console.error(`Error fetching ${table}:`, error);
        data[table] = [];
      } else {
        data[table] = tableData || [];
      }
    }

    return {
      metadata: {
        version: '1.0',
        timestamp: new Date().toISOString(),
        created_by: adminUsername,
        tables
      },
      data
    };
  };

  const createBackup = async (backupType: 'manual' | 'weekly' | 'monthly' | 'yearly', isScheduled = false) => {
    setBackingUp(true);
    setMessage(null);

    try {
      const backupData = await exportAllData();

      const backupJson = JSON.stringify(backupData, null, 2);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const filename = `backup_${backupType}_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;

      if (dirHandle && isScheduled) {
        try {
          const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          setMessage({ type: 'success', text: `Scheduled backup saved to selected folder! (${Object.values(backupData.data).reduce((sum, arr) => sum + arr.length, 0)} records)` });
        } catch (fileError) {
          console.error('Error saving to folder:', fileError);
          downloadBackup(blob, filename);
          setMessage({ type: 'success', text: `Backup downloaded (folder access failed)` });
        }
      } else {
        downloadBackup(blob, filename);
        if (!isScheduled) {
          setMessage({ type: 'success', text: `Backup created successfully! (${Object.values(backupData.data).reduce((sum, arr) => sum + arr.length, 0)} records)` });
        } else {
          setMessage({ type: 'success', text: `Scheduled backup ready - please save the file` });
        }
      }

      const totalRecords = Object.values(backupData.data).reduce((sum, arr) => sum + arr.length, 0);

      await supabase.from('backup_history').insert({
        backup_type: backupType,
        backup_size: blob.size,
        record_count: totalRecords,
        tables_backed_up: backupData.metadata.tables,
        created_by: adminUsername
      });

      if (backupType !== 'manual') {
        const config = configs.find(c => c.backup_type === backupType);
        if (config) {
          await supabase
            .from('backup_configurations')
            .update({
              last_backup_date: new Date().toISOString(),
              backup_count: config.backup_count + 1
            })
            .eq('id', config.id);
        }
      }

      await loadBackupData();
    } catch (error) {
      console.error('Backup error:', error);
      setMessage({ type: 'error', text: 'Failed to create backup. Please try again.' });
    } finally {
      setBackingUp(false);
    }
  };

  const downloadBackup = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const restoreBackup = async (file: File) => {
    setRestoring(true);
    setMessage(null);

    try {
      const fileContent = await file.text();
      const backupData: BackupData = JSON.parse(fileContent);

      if (!backupData.metadata || !backupData.data) {
        throw new Error('Invalid backup file format');
      }

      const tablesToRestore = Object.keys(backupData.data);
      let restoredCount = 0;

      for (const table of tablesToRestore) {
        const records = backupData.data[table as keyof typeof backupData.data];

        if (Array.isArray(records) && records.length > 0) {
          const { error } = await supabase.from(table).upsert(records, {
            onConflict: 'id',
            ignoreDuplicates: false
          });

          if (error) {
            console.error(`Error restoring ${table}:`, error);
          } else {
            restoredCount += records.length;
          }
        }
      }

      await supabase.from('backup_history').insert({
        backup_type: 'restore',
        backup_size: file.size,
        record_count: restoredCount,
        tables_backed_up: tablesToRestore,
        created_by: adminUsername
      });

      await loadBackupData();
      setMessage({ type: 'success', text: `Backup restored successfully! (${restoredCount} records)` });
    } catch (error) {
      console.error('Restore error:', error);
      setMessage({ type: 'error', text: 'Failed to restore backup. Please check the file and try again.' });
    } finally {
      setRestoring(false);
    }
  };

  const toggleSchedule = async (configId: string, enabled: boolean) => {
    try {
      await supabase
        .from('backup_configurations')
        .update({ schedule_enabled: enabled })
        .eq('id', configId);

      await loadBackupData();
      setMessage({
        type: 'success',
        text: `Scheduled backup ${enabled ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      console.error('Toggle schedule error:', error);
      setMessage({ type: 'error', text: 'Failed to update schedule. Please try again.' });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (confirm('Are you sure you want to restore from this backup? This will overwrite existing data.')) {
        restoreBackup(file);
      }
    }
    event.target.value = '';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Backup & Restore</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => createBackup('manual')}
            disabled={backingUp || restoring}
            className="flex flex-col items-center gap-3 p-6 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-8 h-8 text-blue-600" />
            <div className="text-center">
              <div className="font-semibold text-gray-800">Manual Backup</div>
              <div className="text-sm text-gray-600">Create backup now</div>
            </div>
          </button>

          <label className="flex flex-col items-center gap-3 p-6 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={backingUp || restoring}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-green-600" />
            <div className="text-center">
              <div className="font-semibold text-gray-800">Restore Backup</div>
              <div className="text-sm text-gray-600">Upload backup file</div>
            </div>
          </label>

          <div className="flex flex-col items-center gap-3 p-6 border-2 border-purple-200 rounded-lg bg-purple-50">
            <Clock className="w-8 h-8 text-purple-600" />
            <div className="text-center">
              <div className="font-semibold text-gray-800">Scheduled Backups</div>
              <div className="text-sm text-gray-600">Configure below</div>
            </div>
          </div>
        </div>

        {(backingUp || restoring) && (
          <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg mb-6">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-blue-800">
              {backingUp ? 'Creating backup...' : 'Restoring backup...'}
            </span>
          </div>
        )}

        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Scheduled Backup Download Location</h3>

          {!isFolderSelectionAvailable() && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-2">Custom Folder Selection Not Available</p>
                  <p className="mb-3">
                    Your site is accessed over HTTP. Browsers require HTTPS or localhost for folder selection.
                  </p>
                  <div className="bg-white p-3 rounded border border-amber-300">
                    <p className="font-semibold mb-2">How to Enable Folder Selection:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Deploy your site with HTTPS (recommended for production)</li>
                      <li>Access via localhost: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">http://localhost:5173</code></li>
                    </ul>
                  </div>
                  <p className="mt-3 text-xs">
                    Currently, scheduled backups will download to your browser's default downloads folder.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4">
            {isFolderSelectionAvailable()
              ? 'Select a folder where scheduled backups will be automatically saved. If not selected, backups will download to your default downloads folder.'
              : 'Scheduled backups will download to your browser\'s default download folder when they run.'}
          </p>

          <div className="flex items-center gap-4">
            {isFolderSelectionAvailable() ? (
              <>
                <button
                  onClick={selectBackupFolder}
                  disabled={backingUp || restoring}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FolderOpen className="w-4 h-4" />
                  Select Backup Folder
                </button>
                {dirHandle && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                    <CheckCircle className="w-4 h-4" />
                    <span>Folder selected: {dirHandle.name}</span>
                  </div>
                )}
                {!dirHandle && (
                  <div className="text-sm text-gray-500">
                    No folder selected - backups will download to default location
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded">
                <Download className="w-4 h-4" />
                <span>Scheduled backups will trigger automatic downloads</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Scheduled Backups</h3>

        {configs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No backup configurations found. Please refresh the page.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {configs.map((config) => (
            <div key={config.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-semibold text-gray-800 capitalize">
                      {config.backup_type} Backup
                    </div>
                    <div className="text-sm text-gray-600">
                      {config.backup_count} backups created
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-600">Enable</span>
                  <input
                    type="checkbox"
                    checked={config.schedule_enabled}
                    onChange={(e) => toggleSchedule(config.id, e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Last Backup:</span>
                  <span className="ml-2 text-gray-800">{formatDate(config.last_backup_date)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Next Backup:</span>
                  <span className="ml-2 text-gray-800">
                    {config.schedule_enabled ? formatDate(config.next_backup_date) : 'Disabled'}
                  </span>
                </div>
              </div>

              {config.schedule_enabled && (
                <button
                  onClick={() => createBackup(config.backup_type)}
                  disabled={backingUp || restoring}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Run Backup Now
                </button>
              )}
            </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Backup History</h3>

        {history.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No backup history available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Records</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.backup_type === 'restore'
                          ? 'bg-green-100 text-green-800'
                          : item.backup_type === 'manual'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.backup_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {item.record_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {formatBytes(item.backup_size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {item.created_by}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">How Scheduled Backups Work:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Manual backups download immediately to your device</li>
              <li>Scheduled backups check every minute if a backup is due</li>
              <li>When enabled, backups automatically trigger on schedule without any manual intervention</li>
              <li>When scheduled backup is due, it will automatically download to your default downloads folder</li>
              <li>Weekly backups: automatically trigger every 7 days after the last backup</li>
              <li>Monthly backups: automatically trigger every 30 days after the last backup</li>
              <li>Yearly backups: automatically trigger every 365 days after the last backup</li>
              <li>You can manually run a scheduled backup anytime using "Run Backup Now" button</li>
              <li>Select a backup folder (optional) to save scheduled backups to a specific location</li>
              <li>Store backup files in a safe location (cloud drive recommended)</li>
              <li>Restore will overwrite existing data with backup data</li>
              <li>Always verify backup files before restoring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
