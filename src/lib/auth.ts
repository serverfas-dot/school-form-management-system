import { supabase } from './supabase';

export async function adminLogin(username: string, password: string): Promise<{ success: boolean; error?: string; adminId?: string; role?: string }> {
  try {
    console.log('Attempting login for username:', username);

    const { data, error } = await supabase
      .rpc('admin_login', {
        p_username: username,
        p_password: password
      });

    console.log('Login response:', { data, error });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }

    if (data && data.length > 0) {
      console.log('Login successful:', data[0]);
      return { success: true, adminId: data[0].id, role: data[0].role || 'admin' };
    }

    console.log('Invalid credentials - no matching user');
    return { success: false, error: 'Invalid credentials' };
  } catch (error) {
    console.error('Login exception:', error);
    return { success: false, error: 'Login failed: ' + (error instanceof Error ? error.message : 'Unknown error') };
  }
}

export function setAdminSession(adminId: string, username: string, role: string = 'admin') {
  const key = role === 'super_admin' ? 'super_admin_session' : 'admin_session';
  localStorage.setItem(key, JSON.stringify({ adminId, username, role, timestamp: Date.now() }));
}

export function getAdminSession(): { adminId: string; username: string; role: string } | null {
  const session = localStorage.getItem('admin_session');
  if (!session) return null;

  try {
    const parsed = JSON.parse(session);
    const oneDay = 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > oneDay) {
      clearAdminSession();
      return null;
    }
    return { adminId: parsed.adminId, username: parsed.username, role: parsed.role || 'admin' };
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem('admin_session');
}

export function getSuperAdminSession(): { adminId: string; username: string; role: string } | null {
  const session = localStorage.getItem('super_admin_session');
  if (!session) return null;

  try {
    const parsed = JSON.parse(session);
    const oneDay = 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > oneDay) {
      clearSuperAdminSession();
      return null;
    }
    return { adminId: parsed.adminId, username: parsed.username, role: parsed.role || 'super_admin' };
  } catch {
    return null;
  }
}

export function clearSuperAdminSession() {
  localStorage.removeItem('super_admin_session');
}
