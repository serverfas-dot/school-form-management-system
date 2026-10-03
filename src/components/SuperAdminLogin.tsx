import { useState } from 'react';
import { adminLogin, setAdminSession } from '../lib/auth';
import { Shield, Loader2, AlertCircle, Home } from 'lucide-react';
import { MobileFormNavigation } from './MobileFormNavigation';

interface SuperAdminLoginProps {
  onLoginSuccess: (username: string) => void;
  onNavigateHome?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateSuperAdmin?: () => void;
}

export default function SuperAdminLogin({ onLoginSuccess, onNavigateHome, onNavigateAdmin, onNavigateSuperAdmin }: SuperAdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await adminLogin(username, password);

      if (result.success && result.adminId && result.role === 'super_admin') {
        setAdminSession(result.adminId, username, result.role);
        onLoginSuccess(username);
      } else if (result.success && result.role !== 'super_admin') {
        setError('Access denied. Super Admin credentials required.');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {onNavigateHome && (
          <div className="mb-4">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 text-white hover:text-slate-300 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-4">
                <Shield className="w-12 h-12 text-slate-800" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Super Admin Access
            </h1>
            <p className="text-slate-300 text-center text-sm">
              Form Settings & System Configuration
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="Enter super admin username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="Enter password"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg hover:from-slate-800 hover:to-black transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 text-center">
                Super Admin access is restricted to authorized personnel only
              </p>
            </div>
          </div>
        </div>
      </div>
      <MobileFormNavigation
        onNavigateHome={onNavigateHome}
        onNavigateAdmin={onNavigateAdmin}
        onNavigateSuperAdmin={onNavigateSuperAdmin}
        isFormView={true}
      />
    </div>
  );
}
