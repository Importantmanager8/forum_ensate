import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useState as useReactState } from 'react';
import { Clock, MapPin, Users, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL;
// Create an axios instance with interceptor for API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

interface Company {
  _id: string;
  name: string;
  domaine: string;
  description: string;
  logo: string;
  salle_affectee: string;
  stande: string;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [selectedCompanies, setSelectedCompanies] = useState<{[key: string]: {selected: boolean, opportunityType: string}}>({});
  const [queuePositions, setQueuePositions] = useState<any[]>([]);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // CV upload state
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploadStatus, setCvUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [cvMessage, setCvMessage] = useState<string>('');
  const [cvInfo, setCvInfo] = useState<any>(null);
  const [cvLoading, setCvLoading] = useState<boolean>(true);
  const [cvDeleteStatus, setCvDeleteStatus] = useState<'idle' | 'deleting' | 'success' | 'error'>('idle');
  const [cvDeleteMessage, setCvDeleteMessage] = useState<string>('');

  // Tab state
  const [activeTab, setActiveTab] = useState<'cv' | 'select' | 'queue' | 'status'>('select');

  // Interview Queue Page State
  const [showInterviewQueue, setShowInterviewQueue] = useReactState(false);
  const [allInterviews, setAllInterviews] = useReactState<any[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useReactState(false);

  // Fetch companies from backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get('/entreprises');
        const data = response.data;
        const companiesArray = Array.isArray(data) ? data : (Array.isArray(data.companies) ? data.companies : []);
        setCompanies(companiesArray);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch current user's CV info
  useEffect(() => {
    const fetchCvInfo = async () => {
      setCvLoading(true);
      try {
        const res = await api.get('/users/cv/info');
        setCvInfo(res.data.cvFile);
      } catch (err) {
        setCvInfo(null);
      } finally {
        setCvLoading(false);
      }
    };
    fetchCvInfo();
  }, []);

  // Fetch student's queue positions
  useEffect(() => {
    const fetchQueuePositions = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/queues/student/${user.id}`);
        setQueuePositions(res.data);
      } catch (err) {
        setQueuePositions([]);
      }
    };
    fetchQueuePositions();
  }, [user?.id]);

  // Fetch all interviews for the student
  useEffect(() => {
    if (!showInterviewQueue || !user?.id) return;
    const fetchAllInterviews = async () => {
      setLoadingInterviews(true);
      try {
        const res = await api.get(`/interviews`); // You may want to filter by student in backend for security
        // Filter on frontend for now
        setAllInterviews(res.data.filter((i: any) => i.student === user.id));
      } catch (err) {
        setAllInterviews([]);
      } finally {
        setLoadingInterviews(false);
      }
    };
    fetchAllInterviews();
  }, [showInterviewQueue, user?.id]);

  const opportunityTypes = [
    { value: 'pfa', label: 'PFA (Projet de Fin d\'Année)' },
    { value: 'pfe', label: 'PFE (Projet de Fin d\'Études)' },
    { value: 'employment', label: 'Employment' },
    { value: 'observation', label: 'Stage d\'observation' }
  ];

  // Group companies by category (domaine)
  const groupedCompanies = companies.reduce((acc, company) => {
    const category = company.domaine || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(company);
    return acc;
  }, {} as {[key: string]: Company[]});

  // Handle company selection
  const handleCompanySelection = (companyId: string, selected: boolean) => {
    setSelectedCompanies(prev => ({
      ...prev,
      [companyId]: {
        selected,
        opportunityType: selected ? (prev[companyId]?.opportunityType || '') : ''
      }
    }));
  };

  // Handle opportunity type selection
  const handleOpportunityTypeSelection = (companyId: string, opportunityType: string) => {
    setSelectedCompanies(prev => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        opportunityType
      }
    }));
  };

  // Handle update selections
  const handleUpdateSelections = async () => {
    const selections = Object.entries(selectedCompanies)
      .filter(([_, data]) => data.selected && data.opportunityType)
      .map(([companyId, data]) => ({
        companyId,
        opportunityType: data.opportunityType
      }));

    if (selections.length === 0) {
      alert('Please select at least one company and opportunity type.');
      return;
    }

    let results: string[] = [];
    for (const sel of selections) {
      try {
        await api.post('/queues/join', sel);
        results.push(`✅ Joined queue for company ${sel.companyId}`);
      } catch (err: any) {
        results.push(`❌ Failed for company ${sel.companyId}: ${err?.response?.data?.message || 'Error'}`);
      }
    }
    alert(results.join('\n'));
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Finance': 'bg-green-100 text-green-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Education': 'bg-purple-100 text-purple-800',
      'Manufacturing': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.Other;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadge = () => {
    if (user?.role === 'committee') return 'Committee Priority';
    if (user?.status === 'ensa') return 'ENSA Student';
    return 'External Student';
  };

  const getPriorityColor = () => {
    if (user?.role === 'committee') return 'bg-purple-100 text-purple-800';
    if (user?.status === 'ensa') return 'bg-blue-100 text-blue-800';
    return 'bg-orange-100 text-orange-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // CV upload handler
  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleCvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile) {
      setCvMessage('Please select a file to upload.');
      setCvUploadStatus('error');
      return;
    }
    setCvUploadStatus('uploading');
    setCvMessage('');
    try {
      const formData = new FormData();
      formData.append('cv', cvFile);
      await api.post("/users/cv/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // <-- add this to send cookies
      });
      setCvUploadStatus('success');
      setCvMessage('CV uploaded successfully!');
      // Refresh CV info
      const res = await api.get('/users/cv/info');
      setCvInfo(res.data.cvFile);
    } catch (error: any) {
      setCvUploadStatus('error');
      setCvMessage(error?.response?.data?.message || 'Failed to upload CV.');
    }
  };

  // Download CV handler
  const handleCvDownload = async () => {
    if (!user?.id || !cvInfo?.filename) return;
    try {
      const res = await api.get(`/users/cv/download/${user.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', cvInfo.originalName || 'cv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      setCvMessage('Failed to download CV.');
      setCvUploadStatus('error');
    }
  };

  // Delete CV handler
  const handleCvDelete = async () => {
    setCvDeleteStatus('deleting');
    setCvDeleteMessage('');
    try {
      await api.delete('/users/cv/delete');
      setCvInfo(null);
      setCvDeleteStatus('success');
      setCvDeleteMessage('CV deleted successfully.');
    } catch (err: any) {
      setCvDeleteStatus('error');
      setCvDeleteMessage(err?.response?.data?.message || 'Failed to delete CV.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome, {user?.firstName}!
                </h1>
                <p className="text-gray-600 mt-1">Manage your interview schedule and track your progress</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor()}`}>
                  {getPriorityBadge()}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col space-y-6 md:space-y-8">
            {/* Tab Bar */}
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mb-4 md:mb-6">
              <button
                className={`w-full sm:w-auto px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors ${activeTab === 'cv' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setActiveTab('cv')}
              >
                CV Upload
              </button>
              <button
                className={`w-full sm:w-auto px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors ${activeTab === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setActiveTab('select')}
              >
                Select Companies & Opportunities
              </button>
              <button
                className={`w-full sm:w-auto px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors ${activeTab === 'queue' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setActiveTab('queue')}
              >
                My Queue Positions
              </button>
              <button
                className={`w-full sm:w-auto px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors ${activeTab === 'status' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setActiveTab('status')}
              >
                Current Queue Status
              </button>
            </div>

            {/* Tab Panels */}
            {activeTab === 'cv' && (
              <>
                {/* CV Upload Section */}
                <div className="mb-8">
                  <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Your CV</h2>
                      <form className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full" onSubmit={handleCvUpload}>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleCvChange}
                          className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                          disabled={cvUploadStatus === 'uploading'}
                        >
                          {cvUploadStatus === 'uploading' ? 'Uploading...' : 'Upload CV'}
                        </button>
                      </form>
                      {cvUploadStatus === 'success' && (
                        <div className="mt-2 text-green-600 text-sm">{cvMessage}</div>
                      )}
                      {cvUploadStatus === 'error' && (
                        <div className="mt-2 text-red-600 text-sm">{cvMessage}</div>
                      )}
                      {/* CV Info, Download, and Delete */}
                      <div className="mt-4">
                        {cvLoading ? (
                          <div className="text-gray-500 text-sm">Loading CV info...</div>
                        ) : cvInfo && cvInfo.filename ? (
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <span className="text-sm text-gray-700">Current CV: <span className="font-medium">{cvInfo.originalName}</span></span>
                            <button
                              type="button"
                              onClick={handleCvDownload}
                              className="ml-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                            >
                              Download
                            </button>
                            <button
                              type="button"
                              onClick={handleCvDelete}
                              className="ml-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                              disabled={cvDeleteStatus === 'deleting'}
                            >
                              {cvDeleteStatus === 'deleting' ? 'Deleting...' : 'Delete'}
                            </button>
                            {cvDeleteStatus === 'success' && (
                              <span className="ml-2 text-green-600 text-xs">{cvDeleteMessage}</span>
                            )}
                            {cvDeleteStatus === 'error' && (
                              <span className="ml-2 text-red-600 text-xs">{cvDeleteMessage}</span>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">No CV uploaded yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'select' && (
              <>
                {/* Company Selection */}
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                    Select Companies & Opportunities
                  </h2>
                  
                  {companies.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No companies available at the moment</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8">
                      {Object.entries(groupedCompanies).map(([category, companiesInCategory]) => (
                        <div key={category} className="bg-gray-50 rounded-lg p-4 w-full">
                          <h3 className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getCategoryColor(category)}`}>
                            {category}
                          </h3>
                          <div className="space-y-4">
                            {companiesInCategory.map((company) => (
                              <div key={company._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`company-${company._id}`}
                                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      checked={selectedCompanies[company._id]?.selected || false}
                                      onChange={(e) => handleCompanySelection(company._id, e.target.checked)}
                                    />
                                    <label htmlFor={`company-${company._id}`} className="ml-3 text-lg font-medium text-gray-900">
                                      {company.name}
                                    </label>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {company.salle_affectee || 'No room assigned'}
                                  </div>
                                </div>
                                
                                {company.description && (
                                  <div className="ml-8 mb-3">
                                    <p className="text-sm text-gray-600">{company.description}</p>
                                  </div>
                                )}
                                
                                {selectedCompanies[company._id]?.selected && (
                                  <div className="ml-8 mt-4 p-3 bg-blue-50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Select opportunity type:
                                    </label>
                                    <div className="flex flex-col gap-2">
                                      {opportunityTypes.map((type) => (
                                        <label key={type.value} className="flex items-center">
                                          <input
                                            type="radio"
                                            name={`opportunity-${company._id}`}
                                            value={type.value}
                                            className="text-blue-600 focus:ring-blue-500"
                                            checked={selectedCompanies[company._id]?.opportunityType === type.value}
                                            onChange={() => handleOpportunityTypeSelection(company._id, type.value)}
                                          />
                                          <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleUpdateSelections}
                    className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Update Selections
                  </button>
                </div>

                {/* Current Queue Status */}
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Users className="h-6 w-6 text-green-600 mr-2" />
                    Current Queue Status
                  </h2>

                  {companies.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No queue information available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {companies.slice(0, 2).map((company) => (
                        <div key={company._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                              Position #3
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            <div className="flex items-center justify-between">
                              <span>Estimated wait time: 35 minutes</span>
                              <span>{company.salle_affectee || 'No room assigned'}</span>
                            </div>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2 mb-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>2 people ahead</span>
                            <span>60% through queue</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            {activeTab === 'queue' && (
              <>
                {/* Student Queue Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Users className="h-6 w-6 text-blue-600 mr-2" />
                    My Queue Positions
                  </h2>
                  {queuePositions.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>You have not joined any queues yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Opportunity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {queuePositions.map((interview: any) => (
                            <tr key={interview._id}>
                              <td className="px-4 py-2 whitespace-nowrap">{interview.company?.name || '-'}</td>
                              <td className="px-4 py-2 whitespace-nowrap capitalize">{interview.opportunityType || '-'}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{interview.room?.name || '-'}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{interview.queuePosition || '-'}</td>
                              <td className="px-4 py-2 whitespace-nowrap capitalize">{interview.status || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
            {activeTab === 'status' && (
              <>
                {/* Current Queue Status */}
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Users className="h-6 w-6 text-green-600 mr-2" />
                    Current Queue Status
                  </h2>
                  {companies.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No queue information available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {companies.slice(0, 2).map((company) => (
                        <div key={company._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                              Position #3
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            <div className="flex items-center justify-between">
                              <span>Estimated wait time: 35 minutes</span>
                              <span>{company.salle_affectee || 'No room assigned'}</span>
                            </div>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2 mb-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>2 people ahead</span>
                            <span>60% through queue</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {user?.role === 'committee' && (
              <button
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors mb-4"
                onClick={() => setShowInterviewQueue((prev) => !prev)}
              >
                {showInterviewQueue ? 'Back to Dashboard' : 'View All Interviews'}
              </button>
            )}
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Companies Available:</span>
                  <span className="font-medium">{companies.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Companies Selected:</span>
                  <span className="font-medium">
                    {Object.values(selectedCompanies).filter(data => data.selected).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interviews Completed:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Queue:</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Companies Loaded</p>
                    <p className="text-xs text-green-700">Successfully loaded {companies.length} companies</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interview History */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview History</h3>
              <div className="text-center text-gray-500 py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p>No interviews completed yet</p>
                <p className="text-sm">Your interview history will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Interview Queue Dedicated Page */}
      {showInterviewQueue && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            My Interview Queue (Grouped by Company)
          </h2>
          {loadingInterviews ? (
            <div className="text-center py-8 text-gray-500">Loading interviews...</div>
          ) : allInterviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No interviews found.</div>
          ) : (
            Object.entries(
              allInterviews.reduce((acc, interview) => {
                const companyName = interview.company?.name || 'Unknown Company';
                if (!acc[companyName]) acc[companyName] = [];
                acc[companyName].push(interview);
                return acc;
              }, {} as Record<string, any[]>)
            ).map(([company, interviews]) => (
              <div key={company} className="mb-8">
                <h3 className="text-lg font-bold text-blue-700 mb-2">{company}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Opportunity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(interviews as any[]).map((interview: any) => (
                        <tr key={interview._id}>
                          <td className="px-4 py-2 whitespace-nowrap capitalize">{interview.opportunityType || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{interview.room?.name || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{interview.queuePosition || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap capitalize">{interview.status || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{interview.scheduledTime ? new Date(interview.scheduledTime).toLocaleString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;