import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pvhpxmmssgdqqqndivnf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aHB4bW1zc2dkcXFxbmRpdm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NDY2MDAsImV4cCI6MjA4MTUyMjYwMH0.Yfqj3valffpS4DjgMEE5FyXMg1VXMR69Ubah7X0eJNI';

console.log('Environment Variables Debug:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlValue: supabaseUrl,
});

export const isConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.error('Missing Supabase configuration!');
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  created_at: string;
}

export interface Form {
  id: string;
  form_name: string;
  form_description: string;
  is_active: boolean;
  created_at: string;
}

export interface StationeryVoucherSubmission {
  id: string;
  student_name: string;
  id_card_number: string;
  grade: string;
  parent_full_name: string;
  email?: string;
  request_date: string;
  submitted_at: string;
  status: string;
}

export interface OfficeItemsRequest {
  id: string;
  date: string;
  name: string;
  address: string;
  nid_number: string;
  phone_number: string;
  email: string;
  organization_name: string;
  items_requested: string;
  quantity_required: string;
  purpose_of_request: string;
  date_required_by: string;
  submitted_at: string;
  status: string;
}
