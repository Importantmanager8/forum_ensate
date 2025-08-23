import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Users, 
  Building, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Plus,
  Edit,
  UserPlus
} from 'lucide-react';
import api from '../services/api';

interface Company {
  _id?: string;
  id?: number;
  name: string;
  domaine?: string;
  description?: string;
  logo?: string;
  salle_affectee?: string;
  stande?: string;
  room?: string;
  committee?: string;
  queue?: number;
  completed?: number;
}

interface Room {
  _id?: string;
  id?: number;
  name: string;
  location?: string;
  company?: string;
  status?: string;
  assignedCommittee?: string;
}

interface CommitteeMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    totalStudents?: number;
    totalCompanies?: number;
    totalInterviews?: number;
    completedInterviews?: number;
    activeInterviews?: number;
    waitingStudents?: number;
  }>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Company Management States
  const [companyForm, setCompanyForm] = useState<{
    name: string;
    domaine: string;
    description: string;
    logo: string;
    salle_affectee: string;
    stande: string;
    _id?: string;
  }>({
    name: '',
    domaine: '',
    description: '',
    logo: '',
    salle_affectee: '',
    stande: ''
  });
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  // Committee Assignment States
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([]);
  const [savingAssignment, setSavingAssignment] = useState<string | null>(null);

  // Fetch data from database
  useEffect(() => {
    // Set mock stats for now
    setStats({
      totalStudents: 156,
      totalCompanies: 12,
      totalInterviews: 89,
      completedInterviews: 67,
      activeInterviews: 8,
      waitingStudents: 34
    });

    // Fetch real data from database
    fetchCompanies();
    fetchRooms();
    fetchCommitteeMembers();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/entreprises');
      const data = response.data;
      const companiesArray = Array.isArray(data) ? data : (Array.isArray(data.companies) ? data.companies : []);
      setCompanies(companiesArray);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      const data = response.data;
      const roomsArray = Array.isArray(data) ? data : (Array.isArray(data.rooms) ? data.rooms : []);
      setRooms(roomsArray);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchCommitteeMembers = async () => {
    try {
      const response = await api.get('/users?role=committee');
      setCommitteeMembers(response.data);
    } catch (error) {
      console.error('Error fetching committee members:', error);
    }
  };

  // Company Management Functions
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyForm({ ...companyForm, [e.target.name]: e.target.value });
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyLoading(true);
    try {
      const payload = { ...companyForm };
      delete payload._id;
      
      if (editingCompanyId) {
        await api.put(`/entreprises/${editingCompanyId}`, payload);
      } else {
        await api.post('/entreprises', payload);
      }
      
      setCompanyForm({ name: '', domaine: '', description: '', logo: '', salle_affectee: '', stande: '' });
      setEditingCompanyId(null);
      fetchCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleEditCompany = (company: Company) => {
    setCompanyForm({
      name: company.name || '',
      domaine: company.domaine || '',
      description: company.description || '',
      logo: company.logo || '',
      salle_affectee: company.salle_affectee || '',
      stande: company.stande || '',
      _id: company._id
    });
    setEditingCompanyId(company._id || null);
  };

  const handleDeleteCompany = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await api.delete(`/entreprises/${id}`);
        fetchCompanies();
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  // Committee Assignment Functions
  const handleAssignCommittee = async (roomId: string, committeeId: string) => {
    setSavingAssignment(roomId);
    try {
      await api.put(`/rooms/${roomId}`, { assignedCommittee: committeeId });
      setRooms((prev) => prev.map((room) => room._id === roomId ? { ...room, assignedCommittee: committeeId } : room));
    } catch (err) {
      alert('Failed to assign committee member.');
    } finally {
      setSavingAssignment(null);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    change?: number;
  }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from yesterday
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }: {
    id: string;
    label: string;
    isActive: boolean;
    onClick: (id: string) => void;
  }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 font-medium text-sm rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome, {user?.firstName} - Forum Management Overview
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/admin/rooms"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Building className="h-4 w-4" />
                  <span>Manage Rooms</span>
                </a>
                <Link
                  to="/admin/settings"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
            <div className="flex space-x-2 overflow-x-auto">
              <TabButton
                id="overview"
                label="Overview"
                isActive={activeTab === 'overview'}
                onClick={setActiveTab}
              />
              <TabButton
                id="companies"
                label="Companies"
                isActive={activeTab === 'companies'}
                onClick={setActiveTab}
              />
              <TabButton
                id="add-company"
                label="Add Company"
                isActive={activeTab === 'add-company'}
                onClick={setActiveTab}
              />
              <TabButton
                id="assign-committee"
                label="Assign Committee"
                isActive={activeTab === 'assign-committee'}
                onClick={setActiveTab}
              />
              <TabButton
                id="rooms"
                label="Rooms"
                isActive={activeTab === 'rooms'}
                onClick={setActiveTab}
              />
              <TabButton
                id="analytics"
                label="Analytics"
                isActive={activeTab === 'analytics'}
                onClick={setActiveTab}
              />
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Students"
                value={stats.totalStudents || 0}
                icon={Users}
                color="bg-blue-600"
                change={12}
              />
              <StatCard
                title="Active Interviews"
                value={stats.activeInterviews || 0}
                icon={Clock}
                color="bg-green-600"
                change={-5}
              />
              <StatCard
                title="Completed Today"
                value={stats.completedInterviews || 0}
                icon={CheckCircle}
                color="bg-purple-600"
                change={8}
              />
              <StatCard
                title="In Queue"
                value={stats.waitingStudents || 0}
                icon={AlertTriangle}
                color="bg-orange-600"
                change={-3}
              />
            </div>

            {/* Real-time Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                  Live Interview Status
                </h2>
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-600">{company.room} - {company.committee}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          Queue: {company.queue}
                        </div>
                        <div className="text-xs text-gray-500">
                          Completed: {company.completed}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  System Alerts
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Long Queue Alert</p>
                      <p className="text-xs text-yellow-700">InnovateX has 7 students waiting</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Room Issue</p>
                      <p className="text-xs text-red-700">Room D4 is under maintenance</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">System Healthy</p>
                      <p className="text-xs text-green-700">All other rooms operating normally</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Company Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Committee Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.length > 0 ? (
                    companies.map((company) => {
                      const room = rooms.find((r) => r.company === company._id || r.company === company.name);
                      const committeeMember = room?.assignedCommittee ? 
                        committeeMembers.find(m => m._id === room.assignedCommittee) : null;
                      
                      return (
                        <tr key={company._id || company.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{company.name}</div>
                            {company.description && (
                              <div className="text-xs text-gray-500">{company.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              company.domaine === 'Technology' ? 'bg-blue-100 text-blue-800' :
                              company.domaine === 'Finance' ? 'bg-green-100 text-green-800' :
                              company.domaine === 'Healthcare' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {company.domaine}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{room?.name || company.salle_affectee || 'Not assigned'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {committeeMember ? `${committeeMember.firstName} ${committeeMember.lastName}` : 'Not assigned'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button 
                              onClick={() => handleEditCompany(company)}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteCompany(company._id || '')}
                              className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                            >
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Found</h3>
                        <p className="text-gray-600">No companies have been created yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Room Management</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <div key={room._id || room.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">{room.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        room.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {room.status || 'active'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{room.location || 'No location specified'}</p>
                    <p className="text-sm font-medium text-gray-900">
                      Company: {room.company || 'No company assigned'}
                    </p>
                    {room.assignedCommittee && (
                      <p className="text-sm text-blue-600 mt-1">
                        Committee: {committeeMembers.find(m => m._id === room.assignedCommittee)?.firstName} {committeeMembers.find(m => m._id === room.assignedCommittee)?.lastName}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Rooms Found</h3>
                  <p className="text-gray-600">No rooms have been created yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Company Tab */}
        {activeTab === 'add-company' && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Plus className="h-5 w-5 text-blue-600 mr-2" />
              Add/Edit Company
            </h2>
            
            <form onSubmit={handleCompanySubmit} className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    name="name"
                    value={companyForm.name}
                    onChange={handleCompanyChange}
                    placeholder="Enter company name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain *</label>
                  <input
                    name="domaine"
                    value={companyForm.domaine}
                    onChange={handleCompanyChange}
                    placeholder="e.g., Technology, Finance"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    name="description"
                    value={companyForm.description}
                    onChange={handleCompanyChange}
                    placeholder="Company description"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    name="logo"
                    value={companyForm.logo}
                    onChange={handleCompanyChange}
                    placeholder="Logo URL"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Room</label>
                  <input
                    name="salle_affectee"
                    value={companyForm.salle_affectee}
                    onChange={handleCompanyChange}
                    placeholder="Room assignment"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stand</label>
                  <input
                    name="stande"
                    value={companyForm.stande}
                    onChange={handleCompanyChange}
                    placeholder="Stand number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={companyLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {companyLoading ? 'Saving...' : (editingCompanyId ? 'Update Company' : 'Add Company')}
                </button>
                {editingCompanyId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCompanyId(null);
                      setCompanyForm({ name: '', domaine: '', description: '', logo: '', salle_affectee: '', stande: '' });
                    }}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Companies List */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Companies</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companies.map((company) => (
                      <tr key={company._id || company.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.domaine}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.salle_affectee}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditCompany(company)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(company._id || '')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Assign Committee Tab */}
        {activeTab === 'assign-committee' && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <UserPlus className="h-5 w-5 text-green-600 mr-2" />
              Assign Committee Members to Companies
            </h2>
            
            <div className="space-y-6">
              {companies.map((company) => {
                const room = rooms.find((r) => r.company === company._id || r.company === company.name);
                return (
                  <div key={company._id || company.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">{company.name}</h3>
                      <p className="text-gray-500 text-sm">Room: {room?.name || 'Not assigned'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-gray-700 font-medium">Committee:</label>
                      <select
                        className="border rounded px-3 py-2 text-sm"
                        value={room?.assignedCommittee || ''}
                        onChange={(e) => handleAssignCommittee(room?._id || '', e.target.value)}
                        disabled={!room || savingAssignment === room?._id}
                      >
                        <option value="">Select...</option>
                        {committeeMembers.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.firstName} {member.lastName} ({member.email})
                          </option>
                        ))}
                      </select>
                      {savingAssignment === room?._id && <span className="ml-2 text-blue-600 text-xs">Saving...</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics & Reports</h2>
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-600">Detailed analytics and reporting features will be available here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;