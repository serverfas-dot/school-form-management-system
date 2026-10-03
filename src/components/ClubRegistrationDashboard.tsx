import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Search, Filter, Trash2, Calendar, Mail } from 'lucide-react';

interface ClubRegistration {
  id: string;
  student_name: string;
  student_index: string;
  student_grade: string;
  club: string;
  email: string;
  submitted_at: string;
  status: string;
}

const CLUBS = [
  'Islam Club',
  'Dhivehi Club',
  'E.S Club',
  'English Club',
  'Maths Club'
];

export function ClubRegistrationDashboard() {
  const [registrations, setRegistrations] = useState<ClubRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<ClubRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterClub, setFilterClub] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [uniqueGrades, setUniqueGrades] = useState<string[]>([]);

  useEffect(() => {
    loadRegistrations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [registrations, searchTerm, filterGrade, filterClub, filterStatus]);

  const loadRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('club_registrations')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setRegistrations(data || []);

      const grades = [...new Set((data || []).map(r => r.student_grade))].sort();
      setUniqueGrades(grades);
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...registrations];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(reg =>
        reg.student_name.toLowerCase().includes(term) ||
        reg.student_index.toLowerCase().includes(term)
      );
    }

    if (filterGrade) {
      filtered = filtered.filter(reg => reg.student_grade === filterGrade);
    }

    if (filterClub) {
      filtered = filtered.filter(reg => reg.club === filterClub);
    }

    if (filterStatus) {
      filtered = filtered.filter(reg => reg.status === filterStatus);
    }

    setFilteredRegistrations(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('club_registrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('club_registrations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      await loadRegistrations();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterGrade('');
    setFilterClub('');
    setFilterStatus('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getClubStats = () => {
    const stats = CLUBS.map(club => ({
      club,
      count: registrations.filter(r => r.club === club).length
    }));
    return stats;
  };

  const getGradeStats = () => {
    const stats = uniqueGrades.map(grade => ({
      grade,
      count: registrations.filter(r => r.student_grade === grade).length
    }));
    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full p-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Club Registration Dashboard 2026</h1>
                  <p className="text-blue-100">
                    Total Registrations: {registrations.length} | Filtered: {filteredRegistrations.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Registrations by Club
                  </h3>
                  <div className="space-y-2">
                    {getClubStats().map(stat => (
                      <div key={stat.club} className="flex justify-between items-center">
                        <span className="text-gray-700">{stat.club}</span>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {stat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Registrations by Grade
                  </h3>
                  <div className="space-y-2">
                    {getGradeStats().map(stat => (
                      <div key={stat.grade} className="flex justify-between items-center">
                        <span className="text-gray-700">{stat.grade}</span>
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {stat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by student name or index..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Grades</option>
                    {uniqueGrades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>

                  <select
                    value={filterClub}
                    onChange={(e) => setFilterClub(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Clubs</option>
                    {CLUBS.map(club => (
                      <option key={club} value={club}>{club}</option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  {(searchTerm || filterGrade || filterClub || filterStatus) && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {filteredRegistrations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No registrations found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Index</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Grade</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Club</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map((registration) => (
                        <tr key={registration.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-800">{registration.student_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{registration.student_index}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{registration.student_grade}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-blue-600">{registration.club}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {registration.email ? (
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {registration.email}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(registration.submitted_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={registration.status}
                              onChange={(e) => handleStatusUpdate(registration.id, e.target.value)}
                              className={`px-3 py-2 rounded-lg text-sm font-semibold border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(registration.status)}`}
                              style={{
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z\'/%3E%3C/svg%3E")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                                paddingRight: '32px',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none'
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDelete(registration.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete registration"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
