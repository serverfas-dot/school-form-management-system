import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Filter, Trash2, Eye, Download, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getAdminSession, getSuperAdminSession } from '../lib/auth';

interface PositionApplication {
  id: string;
  student_email: string;
  student_name: string;
  student_index: string;
  student_class: string;
  previous_positions: string;
  captain_position: string;
  games_captain_position: string;
  prefect_position: string;
  association_position: string;
  clubs_selections: Array<{club: string; designation: string}>;
  sports_club_position: string;
  houses_selections: Array<{house: string; designation: string}>;
  first_semester_grades: {grade?: string};
  second_semester_grades: {grade?: string};
  dhivehi_week: string;
  english_week: string;
  islam_week: string;
  sports_competitions: string;
  other_activities: string;
  status: string;
  created_at: string;
}

export function PositionApplicationDashboard() {
  const [applications, setApplications] = useState<PositionApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<PositionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [uniqueClasses, setUniqueClasses] = useState<string[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<PositionApplication | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const superAdminSession = getSuperAdminSession();
    const adminSession = getAdminSession();

    if (!superAdminSession && !adminSession) {
      window.location.href = '/admin';
      return;
    }

    setIsSuperAdmin(!!superAdminSession || adminSession?.role === 'super_admin');
    loadApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, searchTerm, filterClass, filterStatus]);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('position_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);

      const classes = [...new Set((data || []).map(app => app.student_class))].sort();
      setUniqueClasses(classes);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.student_name.toLowerCase().includes(term) ||
        app.student_index.toLowerCase().includes(term)
      );
    }

    if (filterClass) {
      filtered = filtered.filter(app => app.student_class === filterClass);
    }

    if (filterStatus) {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    setFilteredApplications(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('position_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setApplications(applications.filter(app => app.id !== id));
      if (selectedApplication?.id === id) {
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('position_applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        alert(`Failed to update status: ${error.message}`);
        throw error;
      }

      setApplications(applications.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      ));

      if (selectedApplication?.id === id) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }

      alert(`Status updated to ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Index', 'Class', 'Email', 'Positions Applied', 'Status', 'Submitted At'];
    const csvData = filteredApplications.map(app => {
      const positions = getAppliedPositions(app).join('; ');
      return [
        app.student_name,
        app.student_index,
        app.student_class,
        app.student_email || '',
        positions,
        app.status,
        new Date(app.created_at).toLocaleString(),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `position-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getAppliedPositions = (app: PositionApplication) => {
    const positions = [];
    if (app.captain_position) positions.push(app.captain_position);
    if (app.games_captain_position) positions.push(app.games_captain_position);
    if (app.prefect_position) positions.push(app.prefect_position);
    if (app.association_position) positions.push(`Association: ${app.association_position}`);
    if (app.sports_club_position) positions.push(`Sports Club: ${app.sports_club_position}`);
    if (app.clubs_selections?.length > 0) {
      app.clubs_selections.forEach(c => positions.push(`${c.club}: ${c.designation}`));
    }
    if (app.houses_selections?.length > 0) {
      app.houses_selections.forEach(h => positions.push(`${h.house}: ${h.designation}`));
    }
    return positions;
  };

  if (loading) {
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
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Faruma' }}>އިސްމަޤާތަކަށް ދަރިވަރުން އައްޔަން ކުރުން 2026</h1>
              <p className="text-amber-100">Position Applications Dashboard</p>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or index..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
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
                <span className="font-semibold text-gray-900">{applications.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Pending: </span>
                <span className="font-semibold text-yellow-600">
                  {applications.filter(s => s.status === 'pending').length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Approved: </span>
                <span className="font-semibold text-green-600">
                  {applications.filter(s => s.status === 'approved').length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Rejected: </span>
                <span className="font-semibold text-red-600">
                  {applications.filter(s => s.status === 'rejected').length}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Index</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Faruma' }}>{application.student_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.student_index}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900" style={{ fontFamily: 'Faruma' }}>{application.student_class}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.student_email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(application.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={application.status}
                        onChange={(e) => handleStatusUpdate(application.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border ${
                          application.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                            : application.status === 'approved'
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : application.status === 'rejected'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-gray-50 text-gray-800 border-gray-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDelete(application.id)}
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

            {filteredApplications.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No applications found
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedApplication(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-amber-700 to-orange-700 text-white p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">Application Details</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedApplication.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedApplication.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : selectedApplication.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedApplication.status === 'pending' ? 'Pending' :
                       selectedApplication.status === 'approved' ? 'Approved' :
                       selectedApplication.status === 'rejected' ? 'Rejected' : selectedApplication.status}
                    </span>
                  </div>
                  <p className="text-amber-100 text-sm">
                    Submitted on {new Date(selectedApplication.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-3" style={{ fontFamily: 'Faruma' }}>ދަރިވަރުގެ މަޢުލޫމާތު</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500">Name</label>
                    <p className="text-base text-gray-900 mt-1 font-medium" style={{ fontFamily: 'Faruma' }}>{selectedApplication.student_name || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500">Index Number</label>
                    <p className="text-base text-gray-900 mt-1 font-medium">{selectedApplication.student_index || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500">Class</label>
                    <p className="text-base text-gray-900 mt-1 font-medium" style={{ fontFamily: 'Faruma' }}>{selectedApplication.student_class || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500">Email</label>
                    <p className="text-base text-gray-900 mt-1 font-medium">{selectedApplication.student_email || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
                    <label className="text-xs font-medium text-gray-500" style={{ fontFamily: 'Faruma' }}>ކުރީގެ މަޤާމްތައް</label>
                    <p className="text-base text-gray-900 mt-1" style={{ fontFamily: 'Faruma' }}>{selectedApplication.previous_positions || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-3" style={{ fontFamily: 'Faruma' }}>ކުރިމަތިލާ މަޤާމްތައް</h3>
                <div className="space-y-2">
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Captain</p>
                    <p className="text-sm text-gray-900" style={{ fontFamily: 'Faruma' }}>{selectedApplication.captain_position || '-'}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Games Captain</p>
                    <p className="text-sm text-gray-900" style={{ fontFamily: 'Faruma' }}>{selectedApplication.games_captain_position || '-'}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Prefect</p>
                    <p className="text-sm text-gray-900" style={{ fontFamily: 'Faruma' }}>{selectedApplication.prefect_position || '-'}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Association</p>
                    <p className="text-sm text-gray-900" style={{ fontFamily: 'Faruma' }}>{selectedApplication.association_position || '-'}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Sports Club</p>
                    <p className="text-sm text-gray-900" style={{ fontFamily: 'Faruma' }}>{selectedApplication.sports_club_position || '-'}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Faruma' }}>ކުލަބުތައް</p>
                    {selectedApplication.clubs_selections?.length > 0 ? (
                      <div className="space-y-1">
                        {selectedApplication.clubs_selections.map((club, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-900" style={{ fontFamily: 'Faruma' }}>
                              {club.club}: {club.designation}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">-</p>
                    )}
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Faruma' }}>ހައުސްތައް</p>
                    {selectedApplication.houses_selections?.length > 0 ? (
                      <div className="space-y-1">
                        {selectedApplication.houses_selections.map((house, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-900" style={{ fontFamily: 'Faruma' }}>
                              {house.house}: {house.designation}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">-</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-3" style={{ fontFamily: 'Faruma' }}>ތަޢުލީމީ ނަތީޖާ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <label className="text-xs font-medium text-gray-500" style={{ fontFamily: 'Faruma' }}>ފުރަތަމަ ސެމިސްޓަރ</label>
                    <p className="text-base text-gray-900 mt-1 font-medium">{selectedApplication.first_semester_grades?.grade || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <label className="text-xs font-medium text-gray-500" style={{ fontFamily: 'Faruma' }}>ދެވަނަ ސެމިސްޓަރ</label>
                    <p className="text-base text-gray-900 mt-1 font-medium">{selectedApplication.second_semester_grades?.grade || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-3" style={{ fontFamily: 'Faruma' }}>ބައިވެރިވި ހަރަކާތްތައް</h3>
                <div className="space-y-3">
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Faruma' }}>ދިވެހި ހަފްތާ</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap" style={{ fontFamily: 'Faruma' }}>
                      {selectedApplication.dhivehi_week || '-'}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Faruma' }}>އިނގިރޭސި ހަފްތާ</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap" style={{ fontFamily: 'Faruma' }}>
                      {selectedApplication.english_week || '-'}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Faruma' }}>އިސްލާމް ހަފްތާ</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap" style={{ fontFamily: 'Faruma' }}>
                      {selectedApplication.islam_week || '-'}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Faruma' }}>ކުޅިވަރު މުބާރާތް</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap" style={{ fontFamily: 'Faruma' }}>
                      {selectedApplication.sports_competitions || '-'}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Faruma' }}>އެހެނިހެން ހަރަކާތްތައް</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap" style={{ fontFamily: 'Faruma' }}>
                      {selectedApplication.other_activities || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      handleDelete(selectedApplication.id);
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
