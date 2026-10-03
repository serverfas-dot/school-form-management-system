import { useState, useEffect } from 'react';
import { supabase, OfficeItemsRequest } from '../lib/supabase';
import { Trash2, Edit, Save, X, Filter, Mail } from 'lucide-react';

export default function OfficeItemsRequestsDashboard() {
  const [requests, setRequests] = useState<OfficeItemsRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<OfficeItemsRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<OfficeItemsRequest>>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const statuses = ['pending', 'reviewed', 'approved'];

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, statusFilter]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('office_items_requests')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching office items requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const { error } = await supabase
        .from('office_items_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRequests(requests.filter(req => req.id !== id));
    } catch (error) {
      alert('Failed to delete request');
    }
  };

  const startEdit = (request: OfficeItemsRequest) => {
    setEditingId(request.id);
    setEditForm(request);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const previousStatus = requests.find(r => r.id === editingId)?.status;
    const newStatus = editForm.status;

    try {
      const { error } = await supabase
        .from('office_items_requests')
        .update({
          date: editForm.date,
          name: editForm.name,
          address: editForm.address,
          nid_number: editForm.nid_number,
          phone_number: editForm.phone_number,
          email: editForm.email,
          organization_name: editForm.organization_name,
          items_requested: editForm.items_requested,
          quantity_required: editForm.quantity_required,
          purpose_of_request: editForm.purpose_of_request,
          date_required_by: editForm.date_required_by,
          status: editForm.status
        })
        .eq('id', editingId);

      if (error) throw error;

      if (previousStatus !== 'approved' && newStatus === 'approved' && editForm.email) {
        await sendApprovalNotification(editForm.email);
      }

      setRequests(requests.map(req =>
        req.id === editingId ? { ...req, ...editForm } as OfficeItemsRequest : req
      ));
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      alert('Failed to update request');
    }
  };

  const sendApprovalNotification = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-approval-notification', {
        body: { email, formType: 'office-items' }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Notification sent:', data);
      setNotification({
        type: 'success',
        message: data?.demo
          ? `Approval notification prepared for ${email} (Demo mode - email not sent)`
          : `Approval notification sent to ${email}`
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      setNotification({
        type: 'error',
        message: `Failed to send notification: ${error?.message || 'Unknown error'}`
      });
      setTimeout(() => setNotification(null), 8000);
    }
  };

  return (
    <div>
      {notification && (
        <div className={`mb-6 ${notification.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4 flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <Mail className={`w-5 h-5 ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
            <p className={`font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Office Items Requests</h2>
        <p className="text-sm sm:text-base text-gray-600">Manage and track all office items requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-blue-100">
          <p className="text-sm font-medium text-gray-600">Total Requests</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{requests.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-yellow-100">
          <p className="text-sm font-medium text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {requests.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-green-100">
          <p className="text-sm font-medium text-gray-600">Reviewed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {requests.filter(r => r.status === 'reviewed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-blue-100">
          <p className="text-sm font-medium text-gray-600">Approved</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {requests.filter(r => r.status === 'approved').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Required</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    {editingId === request.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.name || ''}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.organization_name || ''}
                            onChange={(e) => setEditForm({ ...editForm, organization_name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="email"
                            value={editForm.email || ''}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <textarea
                            value={editForm.items_requested || ''}
                            onChange={(e) => setEditForm({ ...editForm, items_requested: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.quantity_required || ''}
                            onChange={(e) => setEditForm({ ...editForm, quantity_required: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="date"
                            value={editForm.date_required_by || ''}
                            onChange={(e) => setEditForm({ ...editForm, date_required_by: e.target.value })}
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
                        <td className="px-6 py-4 text-sm text-gray-900">{request.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{request.organization_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{request.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={request.items_requested}>
                          {request.items_requested}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {request.quantity_required}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(request.date_required_by).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                            request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEdit(request)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(request.id)}
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
        <p>Showing {filteredRequests.length} of {requests.length} total requests</p>
      </div>
    </div>
  );
}
