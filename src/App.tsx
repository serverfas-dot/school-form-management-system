import { useState, useEffect } from 'react';
import FormsLanding from './components/FormsLanding';
import FormSubmission from './components/FormSubmission';
import OfficeItemsRequestForm from './components/OfficeItemsRequestForm';
import VolunteerForm from './components/VolunteerForm';
import { ClubRegistrationForm } from './components/ClubRegistrationForm';
import { PositionApplicationForm } from './components/PositionApplicationForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import SuperAdminLogin from './components/SuperAdminLogin';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import { getAdminSession, getSuperAdminSession } from './lib/auth';
import { isConfigured } from './lib/supabase';
import { AlertCircle } from 'lucide-react';

type View = 'home' | 'stationery-form' | 'office-items-form' | 'volunteer-form' | 'club-registration-form' | 'position-application-form' | 'admin-login' | 'admin-dashboard' | 'super-admin-login' | 'super-admin-dashboard';

function App() {
  console.log('App component rendering...');
  console.log('Supabase configured:', isConfigured);

  const [currentView, setCurrentView] = useState<View>('home');
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [superAdminUsername, setSuperAdminUsername] = useState<string>('');
  const [volunteerFormKey, setVolunteerFormKey] = useState(0);

  useEffect(() => {
    if (!isConfigured) return;

    const superAdminSession = getSuperAdminSession();
    if (superAdminSession) {
      setSuperAdminUsername(superAdminSession.username);
      setCurrentView('super-admin-dashboard');
      return;
    }

    const adminSession = getAdminSession();
    if (adminSession) {
      setAdminUsername(adminSession.username);
      setCurrentView('admin-dashboard');
    }
  }, []);

  if (!isConfigured) {
    console.warn('Supabase not configured - showing configuration message');
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="flex items-center space-x-3 mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-800">Configuration Required</h1>
          </div>
          <div className="space-y-4 text-gray-700">
            <p className="text-lg">
              The application is missing required environment variables.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-semibold mb-2">Please configure the following in your deployment settings:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><code className="text-sm bg-gray-200 px-2 py-1 rounded">VITE_SUPABASE_URL</code></li>
                <li><code className="text-sm bg-gray-200 px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              After adding these environment variables, redeploy the application.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleLoginSuccess = (username: string) => {
    setAdminUsername(username);
    setCurrentView('admin-dashboard');
  };

  const handleSuperAdminLoginSuccess = (username: string) => {
    setSuperAdminUsername(username);
    setCurrentView('super-admin-dashboard');
  };

  const handleLogout = () => {
    setAdminUsername('');
    setCurrentView('home');
  };

  const handleSuperAdminLogout = () => {
    setSuperAdminUsername('');
    setCurrentView('home');
  };

  const handleSelectForm = (formType: 'stationery' | 'office-items' | 'volunteer' | 'club-registration' | 'position-application') => {
    if (formType === 'stationery') {
      setCurrentView('stationery-form');
    } else if (formType === 'office-items') {
      setCurrentView('office-items-form');
    } else if (formType === 'club-registration') {
      setCurrentView('club-registration-form');
    } else if (formType === 'position-application') {
      setCurrentView('position-application-form');
    } else {
      setVolunteerFormKey(prev => prev + 1);
      setCurrentView('volunteer-form');
    }
  };

  return (
    <>
      <div style={{ display: currentView === 'home' ? 'block' : 'none' }}>
        <FormsLanding
          onSelectForm={handleSelectForm}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateAdmin={() => setCurrentView('admin-login')}
          onNavigateSuperAdmin={() => setCurrentView('super-admin-login')}
        />
      </div>
      {currentView === 'admin-login' && (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateAdmin={() => setCurrentView('admin-login')}
          onNavigateSuperAdmin={() => setCurrentView('super-admin-login')}
        />
      )}
      {currentView === 'admin-dashboard' && (
        <AdminDashboard
          username={adminUsername}
          onLogout={handleLogout}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateAdmin={() => setCurrentView('admin-login')}
          onNavigateSuperAdmin={() => setCurrentView('super-admin-login')}
        />
      )}
      {currentView === 'super-admin-login' && (
        <SuperAdminLogin
          onLoginSuccess={handleSuperAdminLoginSuccess}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateAdmin={() => setCurrentView('admin-login')}
          onNavigateSuperAdmin={() => setCurrentView('super-admin-login')}
        />
      )}
      {currentView === 'super-admin-dashboard' && (
        <SuperAdminDashboard
          username={superAdminUsername}
          onLogout={handleSuperAdminLogout}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateAdmin={() => setCurrentView('admin-login')}
          onNavigateSuperAdmin={() => setCurrentView('super-admin-login')}
        />
      )}
      {currentView === 'stationery-form' && (
        <FormSubmission
          onNavigateHome={() => setCurrentView('home')}
          onNavigateAdmin={() => setCurrentView('admin-login')}
          onNavigateSuperAdmin={() => setCurrentView('super-admin-login')}
        />
      )}
      {currentView === 'office-items-form' && (
        <OfficeItemsRequestForm
          onNavigateHome={() => setCurrentView('home')}
          onNavigateAdmin={() => setCurrentView('admin-login')}
          onNavigateSuperAdmin={() => setCurrentView('super-admin-login')}
        />
      )}
      {currentView === 'volunteer-form' && (
        <VolunteerForm
          key={volunteerFormKey}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateAdmin={() => setCurrentView('admin-login')}
          onNavigateSuperAdmin={() => setCurrentView('super-admin-login')}
        />
      )}
      {currentView === 'club-registration-form' && (
        <ClubRegistrationForm
          onNavigateHome={() => setCurrentView('home')}
          onNavigateAdmin={() => setCurrentView('admin-login')}
          onNavigateSuperAdmin={() => setCurrentView('super-admin-login')}
        />
      )}
      {currentView === 'position-application-form' && (
        <PositionApplicationForm
          onNavigateHome={() => setCurrentView('home')}
          onNavigateAdmin={() => setCurrentView('admin-login')}
          onNavigateSuperAdmin={() => setCurrentView('super-admin-login')}
        />
      )}
    </>
  );
}

export default App;
