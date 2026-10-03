import { useState } from 'react';
import { LogOut, FileText, Package, Users, UserPlus, Award, Home } from 'lucide-react';
import { clearAdminSession } from '../lib/auth';
import StationeryVouchersDashboard from './StationeryVouchersDashboard';
import OfficeItemsRequestsDashboard from './OfficeItemsRequestsDashboard';
import VolunteerFormDashboard from './VolunteerFormDashboard';
import { ClubRegistrationDashboard } from './ClubRegistrationDashboard';
import { PositionApplicationDashboard } from './PositionApplicationDashboard';
import { MobileFormNavigation } from './MobileFormNavigation';

interface AdminDashboardProps {
  username: string;
  onLogout: () => void;
  onNavigateHome?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateSuperAdmin?: () => void;
}

type FormTab = 'stationery' | 'office-items' | 'volunteer' | 'club-registration' | 'position-application';

export default function AdminDashboard({ username, onLogout, onNavigateHome, onNavigateAdmin, onNavigateSuperAdmin }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<FormTab>('stationery');

  const handleLogout = () => {
    clearAdminSession();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50" >
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src={`${import.meta.env.BASE_URL}school-logo.png`}
                alt="Faafu Atoll School Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <div>
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900">School Form Management</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Welcome, {username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onNavigateHome && (
                <button
                  onClick={onNavigateHome}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="-mb-px flex space-x-4 md:space-x-8 min-w-max md:min-w-0">
              <button
                onClick={() => setActiveTab('stationery')}
                className={`flex items-center space-x-1 md:space-x-2 py-4 px-1 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'stationery'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Stationery Vouchers</span>
                <span className="sm:hidden">Stationery</span>
              </button>
              <button
                onClick={() => setActiveTab('office-items')}
                className={`flex items-center space-x-1 md:space-x-2 py-4 px-1 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'office-items'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Office Items</span>
                <span className="sm:hidden">Office</span>
              </button>
              <button
                onClick={() => setActiveTab('volunteer')}
                className={`flex items-center space-x-1 md:space-x-2 py-4 px-1 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'volunteer'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                <span style={{ fontFamily: 'Faruma' }}>ޚިދުމަތް</span>
              </button>
              <button
                onClick={() => setActiveTab('club-registration')}
                className={`flex items-center space-x-1 md:space-x-2 py-4 px-1 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'club-registration'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Club Reg 2026</span>
                <span className="sm:hidden">Club</span>
              </button>
              <button
                onClick={() => setActiveTab('position-application')}
                className={`flex items-center space-x-1 md:space-x-2 py-4 px-1 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'position-application'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Award className="w-4 h-4 md:w-5 md:h-5" />
                <span style={{ fontFamily: 'Faruma' }}>މަޤާން</span>
              </button>
            </nav>
          </div>
        </div>

        <div>
          <div style={{ display: activeTab === 'stationery' ? 'block' : 'none' }}>
            <StationeryVouchersDashboard />
          </div>
          <div style={{ display: activeTab === 'office-items' ? 'block' : 'none' }}>
            <OfficeItemsRequestsDashboard />
          </div>
          <div style={{ display: activeTab === 'volunteer' ? 'block' : 'none' }}>
            <VolunteerFormDashboard />
          </div>
          <div style={{ display: activeTab === 'club-registration' ? 'block' : 'none' }}>
            <ClubRegistrationDashboard />
          </div>
          <div style={{ display: activeTab === 'position-application' ? 'block' : 'none' }}>
            <PositionApplicationDashboard />
          </div>
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
