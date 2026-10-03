import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getAdminSession, getSuperAdminSession } from '../lib/auth';
import { Loader2, Search, Filter, Download, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface VolunteerSubmission {
  id: string;
  volunteer_activities: string[];
  name: string;
  designation: string;
  address: string;
  id_number: string;
  email: string;
  phone_number: string;
  submitted_at: string;
  status: string;
}

export default function VolunteerFormDashboard() {
  const [submissions, setSubmissions] = useState<VolunteerSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<VolunteerSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<VolunteerSubmission | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const superAdminSession = getSuperAdminSession();
    const adminSession = getAdminSession();

    if (!superAdminSession && !adminSession) {
      window.location.href = '/admin';
      return;
    }

    setIsSuperAdmin(!!superAdminSession || adminSession?.role === 'super_admin');
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, statusFilter]);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteer_form_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.phone_number.includes(searchTerm) ||
        (sub.email && sub.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.designation && sub.designation.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('volunteer_form_submissions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        alert(`Failed to update status: ${error.message}`);
        throw error;
      }

      setSubmissions(prev =>
        prev.map(sub => sub.id === id ? { ...sub, status: newStatus } : sub)
      );

      if (selectedSubmission && selectedSubmission.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }

      alert(`Status updated to ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const { error } = await supabase
        .from('volunteer_form_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubmissions(prev => prev.filter(sub => sub.id !== id));
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Designation', 'Address', 'ID Number', 'Email', 'Phone Number', 'Activities', 'Submitted At', 'Status'];
    const csvData = filteredSubmissions.map(sub => [
      sub.name,
      sub.designation || '',
      sub.address || '',
      sub.id_number || '',
      sub.email || '',
      sub.phone_number,
      sub.volunteer_activities.join('; '),
      new Date(sub.submitted_at).toLocaleString(),
      sub.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volunteer-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-700 to-orange-700 text-white p-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Faruma' }}>ޚިދުމަތަށް އެދޭ ފޯމް</h1>
              <p className="text-amber-100" style={{ fontFamily: 'Faruma' }}>ޚިދުމަތަށް އެދޭ ފޯމް</p>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, email, or designation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="reviewed">Reviewed</option>
                  </select>
                </div>

                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200"
                >
                  <Download className="w-5 h-5" />
                  Export
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-6 text-sm">
              <div>
                <span className="text-gray-600">Total: </span>
                <span className="font-semibold text-gray-900">{submissions.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Pending: </span>
                <span className="font-semibold text-yellow-600">
                  {submissions.filter(s => s.status === 'pending').length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Approved: </span>
                <span className="font-semibold text-green-600">
                  {submissions.filter(s => s.status === 'approved').length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Reviewed: </span>
                <span className="font-semibold text-blue-600">
                  {submissions.filter(s => s.status === 'reviewed').length}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{submission.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.designation || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.phone_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={submission.status}
                        onChange={(e) => handleStatusUpdate(submission.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border ${
                          submission.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                            : submission.status === 'approved'
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : submission.status === 'reviewed'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-gray-50 text-gray-800 border-gray-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="reviewed">Reviewed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDelete(submission.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No submissions found
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedSubmission(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-amber-700 to-orange-700 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Submission Details</h2>
                  <p className="text-amber-100 text-sm">
                    Submitted on {new Date(selectedSubmission.submitted_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg text-gray-900 mt-1" style={{ fontFamily: 'Faruma' }}>{selectedSubmission.name}</p>
                </div>

                {selectedSubmission.designation && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Designation</label>
                    <p className="text-lg text-gray-900 mt-1" style={{ fontFamily: 'Faruma' }}>{selectedSubmission.designation}</p>
                  </div>
                )}

                {selectedSubmission.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-lg text-gray-900 mt-1" style={{ fontFamily: 'Faruma' }}>{selectedSubmission.address}</p>
                  </div>
                )}

                {selectedSubmission.id_number && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID Number</label>
                    <p className="text-lg text-gray-900 mt-1">{selectedSubmission.id_number}</p>
                  </div>
                )}

                {selectedSubmission.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg text-gray-900 mt-1">{selectedSubmission.email}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-lg text-gray-900 mt-1">{selectedSubmission.phone_number}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Volunteer Activities</label>
                <div className="bg-amber-50 rounded-lg p-4 space-y-2">
                  {selectedSubmission.volunteer_activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700" style={{ fontFamily: 'Faruma' }}>{activity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={() => handleStatusUpdate(selectedSubmission.id, 'approved')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedSubmission.id, 'reviewed')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mark as Reviewed
                </button>
                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      handleDelete(selectedSubmission.id);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
