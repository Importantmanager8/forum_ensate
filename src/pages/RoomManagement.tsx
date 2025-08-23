import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building, Plus, Edit, Trash2, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

interface Room {
  _id?: string;
  name: string;
  location: string;
  capacity?: number;
  company?: string;
  assignedCommittee?: string;
  isActive?: boolean;
  equipment?: string[];
}

interface Company {
  _id: string;
  name: string;
}

interface CommitteeMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const RoomManagement = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState<Room>({
    name: '',
    location: '',
    capacity: 1,
    company: '',
    assignedCommittee: '',
    isActive: true,
    equipment: []
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEquipment, setNewEquipment] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, companiesRes, committeeRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/entreprises'),
        api.get('/users?role=committee')
      ]);

      const roomsData = Array.isArray(roomsRes.data) ? roomsRes.data : (Array.isArray(roomsRes.data.rooms) ? roomsRes.data.rooms : []);
      const companiesData = Array.isArray(companiesRes.data) ? companiesRes.data : (Array.isArray(companiesRes.data.companies) ? companiesRes.data.companies : []);

      setRooms(roomsData);
      setCompanies(companiesData);
      setCommitteeMembers(committeeRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const addEquipment = () => {
    if (newEquipment.trim() && !form.equipment?.includes(newEquipment.trim())) {
      setForm(prev => ({
        ...prev,
        equipment: [...(prev.equipment || []), newEquipment.trim()]
      }));
      setNewEquipment('');
    }
  };

  const removeEquipment = (equipment: string) => {
    setForm(prev => ({
      ...prev,
      equipment: prev.equipment?.filter(e => e !== equipment) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { ...form };
      delete payload._id;

      if (editingId) {
        await api.put(`/rooms/${editingId}`, payload);
      } else {
        await api.post('/rooms', payload);
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Error saving room. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (room: Room) => {
    setForm(room);
    setEditingId(room._id || null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await api.delete(`/rooms/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Error deleting room. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      location: '',
      capacity: 1,
      company: '',
      assignedCommittee: '',
      isActive: true,
      equipment: []
    });
    setEditingId(null);
    setNewEquipment('');
  };

  const getCompanyName = (companyId: string) => {
    return companies.find(c => c._id === companyId)?.name || 'Not assigned';
  };

  const getCommitteeName = (committeeId: string) => {
    const member = committeeMembers.find(m => m._id === committeeId);
    return member ? `${member.firstName} ${member.lastName}` : 'Not assigned';
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-700">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
                <p className="text-gray-600 mt-1">Create, edit, and manage interview rooms</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={resetForm}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Room</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Building className="h-5 w-5 text-blue-600 mr-2" />
                {editingId ? 'Edit Room' : 'Add New Room'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Room A1, Conference Room B"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Building A, Floor 1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Company</label>
                  <select
                    name="company"
                    value={form.company}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a company</option>
                    {companies.map(company => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Committee Member</label>
                  <select
                    name="assignedCommittee"
                    value={form.assignedCommittee}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a committee member</option>
                    {committeeMembers.map(member => (
                      <option key={member._id} value={member._id}>
                        {member.firstName} {member.lastName} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newEquipment}
                      onChange={(e) => setNewEquipment(e.target.value)}
                      placeholder="Add equipment"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                    />
                    <button
                      type="button"
                      onClick={addEquipment}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {form.equipment && form.equipment.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.equipment.map((equipment, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                        >
                          {equipment}
                          <button
                            type="button"
                            onClick={() => removeEquipment(equipment)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Room is active</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : (editingId ? 'Update Room' : 'Create Room')}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Rooms List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">All Rooms</h2>
              </div>
              
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading rooms...</div>
              ) : rooms.length === 0 ? (
                <div className="p-12 text-center">
                  <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Rooms Found</h3>
                  <p className="text-gray-600">Create your first room to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Committee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rooms.map((room) => (
                        <tr key={room._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Building className="h-5 w-5 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{room.name}</div>
                                <div className="text-sm text-gray-500">Capacity: {room.capacity || 1}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-900">{room.location}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getCompanyName(room.company || '')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getCommitteeName(room.assignedCommittee || '')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              room.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {room.isActive ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEdit(room)}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(room._id || '')}
                              className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
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
};

export default RoomManagement; 