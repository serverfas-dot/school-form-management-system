import { useState } from 'react';
import { LogOut, Settings, Grid2x2 as Grid, CreditCard as Edit, Award, FileText, Lock, Key, Database, Home, Users } from 'lucide-react';
import { clearSuperAdminSession } from '../lib/auth';
import FormSettingsEditor from './FormSettingsEditor';
import { PositionFormGridEditor } from './PositionFormGridEditor';
import { FormFieldEditor } from './FormFieldEditor';
import { PositionApplicationDashboard } from './PositionApplicationDashboard';
import { RulesEditor } from './RulesEditor';
import { FormAccessControl } from './FormAccessControl';
import { PasswordManager } from './PasswordManager';
import BackupManager from './BackupManager';
import VolunteerFormDashboard from './VolunteerFormDashboard';
import { MobileFormNavigation } from './MobileFormNavigation';

interface SuperAdminDashboardProps {
  username: string;
  onLogout: () => void;
  onNavigateHome?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateSuperAdmin?: () => void;
}

export default function SuperAdminDashboard({ username, onLogout, onNavigateHome, onNavigateAdmin, onNavigateSuperAdmin }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'forms' | 'grids' | 'fields' | 'rules' | 'access-control' | 'password-manager' | 'backup' | 'position-submissions' | 'volunteer-submissions'>('forms');

  const handleLogout = () => {
    clearSuperAdminSession();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50" >
      <nav className="bg-gradient-to-r from-slate-700 to-slate-900 border-b border-slate-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src="/school-logo.png"
                alt="Faafu Atoll School Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain bg-white rounded-lg p-1"
              />
              <div>
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-white">Super Admin Panel</h1>
                <p className="text-xs text-slate-300 hidden sm:block">Welcome, {username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onNavigateHome && (
                <button
                  onClick={onNavigateHome}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <button
            onClick={() => setActiveTab('forms')}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-sm border transition-colors ${
              activeTab === 'forms'
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <div className={`rounded-lg p-3 ${activeTab === 'forms' ? 'bg-slate-100' : 'bg-white'}`}>
              <Settings className="w-6 h-6 text-slate-700" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold">Form Settings</h2>
              <p className="text-sm text-gray-600">Configure form titles and messages</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('grids')}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-sm border transition-colors ${
              activeTab === 'grids'
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <div className={`rounded-lg p-3 ${activeTab === 'grids' ? 'bg-slate-100' : 'bg-white'}`}>
              <Grid className="w-6 h-6 text-slate-700" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold">Position Form Grids</h2>
              <p className="text-sm text-gray-600">Manage club and house grids</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('fields')}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-sm border transition-colors ${
              activeTab === 'fields'
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <div className={`rounded-lg p-3 ${activeTab === 'fields' ? 'bg-slate-100' : 'bg-white'}`}>
              <Edit className="w-6 h-6 text-slate-700" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold">Form Fields</h2>
              <p className="text-sm text-gray-600">Edit, add, and delete form fields</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-sm border transition-colors ${
              activeTab === 'rules'
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <div className={`rounded-lg p-3 ${activeTab === 'rules' ? 'bg-slate-100' : 'bg-white'}`}>
              <FileText className="w-6 h-6 text-slate-700" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold">Position Form Rules</h2>
              <p className="text-sm text-gray-600">Edit form rules and criteria</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('access-control')}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-sm border transition-colors ${
              activeTab === 'access-control'
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <div className={`rounded-lg p-3 ${activeTab === 'access-control' ? 'bg-slate-100' : 'bg-white'}`}>
              <Lock className="w-6 h-6 text-slate-700" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold">Form Access Control</h2>
              <p className="text-sm text-gray-600">Open or close forms for public</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('password-manager')}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-sm border transition-colors ${
              activeTab === 'password-manager'
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <div className={`rounded-lg p-3 ${activeTab === 'password-manager' ? 'bg-slate-100' : 'bg-white'}`}>
              <Key className="w-6 h-6 text-slate-700" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold">Password Management</h2>
              <p className="text-sm text-gray-600">Change admin login password</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-sm border transition-colors ${
              activeTab === 'backup'
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <div className={`rounded-lg p-3 ${activeTab === 'backup' ? 'bg-slate-100' : 'bg-white'}`}>
              <Database className="w-6 h-6 text-slate-700" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold">Backup & Restore</h2>
              <p className="text-sm text-gray-600">Manage database backups</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('position-submissions')}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-sm border transition-colors ${
              activeTab === 'position-submissions'
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <div className={`rounded-lg p-3 ${activeTab === 'position-submissions' ? 'bg-slate-100' : 'bg-white'}`}>
              <Award className="w-6 h-6 text-slate-700" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Faruma' }}>އިސްމަޤާތަކަށް ފޯމް</h2>
              <p className="text-sm text-gray-600">View and manage position applications</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('volunteer-submissions')}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-sm border transition-colors ${
              activeTab === 'volunteer-submissions'
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <div className={`rounded-lg p-3 ${activeTab === 'volunteer-submissions' ? 'bg-slate-100' : 'bg-white'}`}>
              <Users className="w-6 h-6 text-slate-700" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Faruma' }}>ޚިދުމަތަށް އެދޭ ފޯމް</h2>
              <p className="text-sm text-gray-600">View and manage volunteer submissions</p>
            </div>
          </button>
        </div>

        <div style={{ display: activeTab === 'forms' ? 'block' : 'none' }}>
          <FormSettingsEditor />
        </div>
        <div style={{ display: activeTab === 'grids' ? 'block' : 'none' }}>
          <PositionFormGridEditor />
        </div>
        <div style={{ display: activeTab === 'fields' ? 'block' : 'none' }}>
          <FormFieldEditor />
        </div>
        <div style={{ display: activeTab === 'rules' ? 'block' : 'none' }}>
          <RulesEditor />
        </div>
        <div style={{ display: activeTab === 'access-control' ? 'block' : 'none' }}>
          <FormAccessControl />
        </div>
        <div style={{ display: activeTab === 'password-manager' ? 'block' : 'none' }}>
          <PasswordManager />
        </div>
        <div style={{ display: activeTab === 'backup' ? 'block' : 'none' }}>
          <BackupManager adminUsername={username} />
        </div>
        <div style={{ display: activeTab === 'position-submissions' ? 'block' : 'none' }}>
          <PositionApplicationDashboard />
        </div>
        <div style={{ display: activeTab === 'volunteer-submissions' ? 'block' : 'none' }}>
          <VolunteerFormDashboard />
        </div>
      </div>
      <MobileFormNavigation
        onNavigateHome={onNavigateHome}
        onNavigateAdmin={onNavigateAdmin}
        onNavigateSuperAdmin={onNavigateSuperAdmin}
        isFormView={false}
      />
    </div>
  );
}
