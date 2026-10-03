import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function PasswordManager() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long!' });
      return;
    }

    setIsUpdating(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('admin_credentials')
        .update({ password: newPassword })
        .eq('username', 'admin');

      if (error) throw error;

      setMessage({ type: 'success', text: 'Admin password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 rounded-lg p-3">
            <Key className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Password Management</h2>
            <p className="text-gray-600">Change the regular admin login password</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> This will update the password for the regular admin account (username: "admin").
            The Super Admin password cannot be changed here for security reasons.
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Enter new password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">Minimum 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Confirm new password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-800">
              <AlertCircle size={18} />
              <span className="text-sm">Passwords do not match</span>
            </div>
          )}

          {newPassword && confirmPassword && newPassword === confirmPassword && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-800">
              <CheckCircle size={18} />
              <span className="text-sm">Passwords match</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdating || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                <Key size={20} />
                Update Admin Password
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Admin Credentials:</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Username:</span>
              <span className="text-sm font-medium text-gray-900">admin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Role:</span>
              <span className="text-sm font-medium text-gray-900">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
