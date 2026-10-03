import { useState } from 'react';
import { Shield, AlertCircle, Home } from 'lucide-react';
import { adminLogin, setAdminSession } from '../lib/auth';
import { MobileFormNavigation } from './MobileFormNavigation';

interface AdminLoginProps {
  onLoginSuccess: (username: string) => void;
  onNavigateHome?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateSuperAdmin?: () => void;
}

export default function AdminLogin({ onLoginSuccess, onNavigateHome, onNavigateAdmin, onNavigateSuperAdmin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await adminLogin(username, password);

      if (result.success && result.adminId) {
        setAdminSession(result.adminId, username);
        onLoginSuccess(username);
      } else {
        setError(result.error || 'Invalid username or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
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
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6">
            <div className="flex items-center justify-center">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white text-center">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-slate-300 text-center">
              Access the form management system
            </p>
          </div>

          <div className="px-8 py-8">
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white py-3 px-4 rounded-lg font-semibold hover:from-slate-800 hover:to-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
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
