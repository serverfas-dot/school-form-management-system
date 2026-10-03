import { useState, useEffect } from 'react';
import { supabase, StationeryVoucherSubmission } from '../lib/supabase';
import { Trash2, Edit, Save, X, Filter } from 'lucide-react';

export default function StationeryVouchersDashboard() {
  const [submissions, setSubmissions] = useState<StationeryVoucherSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<StationeryVoucherSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<StationeryVoucherSubmission>>({});
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const grades = [
    '1', '2', '3', '4', '5', '6', '7', '8',
    '9 SC', '9 BS', '9 BTEC',
    '10 SC', '10 BS', '10 BTEC'
  ];
  const statuses = ['pending', 'reviewed', 'approved'];

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [submissions, gradeFilter, statusFilter]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('stationery_voucher_submissions')
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

  const applyFilters = () => {
    let filtered = [...submissions];

    if (gradeFilter !== 'all') {
      filtered = filtered.filter(sub => sub.grade === gradeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const { error } = await supabase
        .from('stationery_voucher_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSubmissions(submissions.filter(sub => sub.id !== id));
    } catch (error) {
      alert('Failed to delete submission');
    }
  };

  const startEdit = (submission: StationeryVoucherSubmission) => {
    setEditingId(submission.id);
    setEditForm(submission);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('stationery_voucher_submissions')
        .update({
          student_name: editForm.student_name,
          id_card_number: editForm.id_card_number,
          grade: editForm.grade,
          parent_full_name: editForm.parent_full_name,
          email: editForm.email,
          request_date: editForm.request_date,
          status: editForm.status
        })
        .eq('id', editingId);

      if (error) throw error;

      setSubmissions(submissions.map(sub =>
        sub.id === editingId ? { ...sub, ...editForm } as StationeryVoucherSubmission : sub
      ));
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      alert('Failed to update submission');
    }
  };

  const getGradeStats = () => {
    const stats: { [key: string]: number } = {};
    submissions.forEach(sub => {
      stats[sub.grade] = (stats[sub.grade] || 0) + 1;
    });
    return stats;
  };

  const gradeStats = getGradeStats();

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Stationery Voucher Submissions 2026</h2>
        <p className="text-sm sm:text-base text-gray-600">Manage and track all voucher requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-blue-100">
          <p className="text-sm font-medium text-gray-600">Total Submissions</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{submissions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-yellow-100">
          <p className="text-sm font-medium text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {submissions.filter(s => s.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-green-100">
          <p className="text-sm font-medium text-gray-600">Reviewed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {submissions.filter(s => s.status === 'reviewed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-blue-100">
          <p className="text-sm font-medium text-gray-600">Approved</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {submissions.filter(s => s.status === 'approved').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Grade</label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>
                  Grade {grade} ({gradeStats[grade] || 0} submissions)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No submissions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Card</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                    {editingId === submission.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.student_name || ''}
                            onChange={(e) => setEditForm({ ...editForm, student_name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.id_card_number || ''}
                            onChange={(e) => setEditForm({ ...editForm, id_card_number: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editForm.grade || ''}
                            onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          >
                            {grades.map(grade => (
                              <option key={grade} value={grade}>{grade}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.parent_full_name || ''}
                            onChange={(e) => setEditForm({ ...editForm, parent_full_name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="date"
                            value={editForm.request_date || ''}
                            onChange={(e) => setEditForm({ ...editForm, request_date: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editForm.status || ''}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          >
                            {statuses.map(status => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={saveEdit}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-900">{submission.student_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{submission.id_card_number}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Grade {submission.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{submission.parent_full_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(submission.request_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            submission.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                            submission.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEdit(submission)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(submission.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>Showing {filteredSubmissions.length} of {submissions.length} total submissions</p>
      </div>
    </div>
  );
}
