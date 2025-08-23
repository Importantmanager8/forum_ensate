import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Play, Square, CheckCircle, Clock, MapPin } from 'lucide-react';
import api from '../services/api';

const CommitteeQueue = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedCompanies, setAssignedCompanies] = useState<any[]>([]);

  if (!user || user.role !== 'committee') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-700">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchCommitteeData = async () => {
      setLoading(true);
      try {
        // First, fetch rooms where this committee member is assigned
        const roomsRes = await api.get('/rooms');
        const rooms = Array.isArray(roomsRes.data) ? roomsRes.data : (Array.isArray(roomsRes.data.rooms) ? roomsRes.data.rooms : []);
        
        // Filter rooms where this committee member is assigned
        const assignedRooms = rooms.filter((room: any) => room.assignedCommittee === user.id);
        
        // Get company IDs from assigned rooms
        const companyIds = assignedRooms.map((room: any) => room.company).filter(Boolean);
        
        setAssignedCompanies(companyIds);

        if (companyIds.length === 0) {
          setInterviews([]);
          setLoading(false);
          return;
        }

        // Fetch interviews for assigned companies
        const interviewsRes = await api.get('/interviews');
        const allInterviews = Array.isArray(interviewsRes.data) ? interviewsRes.data : [];
        
        // Filter interviews to only show those for assigned companies
        const filteredInterviews = allInterviews.filter((interview: any) => 
          companyIds.includes(interview.company?._id || interview.company)
        );
        
        setInterviews(filteredInterviews);
      } catch (err) {
        console.error('Error fetching committee data:', err);
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommitteeData();
  }, [user?.id]);

  // Group interviews by company
  const grouped = interviews.reduce((acc, interview) => {
    const companyName = interview.company?.name || 'Unknown Company';
    if (!acc[companyName]) acc[companyName] = [];
    acc[companyName].push(interview);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Interview Queues</h1>
          <p className="text-gray-600">Welcome, {user.firstName} {user.lastName}</p>
          {assignedCompanies.length > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              You are responsible for {assignedCompanies.length} company{assignedCompanies.length !== 1 ? 'ies' : ''}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading your assigned interviews...</div>
        ) : assignedCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Assigned</h3>
            <p className="text-gray-600">You haven't been assigned to any companies yet. Please contact an administrator.</p>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Interviews Found</h3>
            <p className="text-gray-600">There are no interviews scheduled for your assigned companies at the moment.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([company, interviews]) => (
            <div key={company} className="mb-10 bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-800">{company}</h2>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {interviews.length} interview{interviews.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Opportunity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Queue Position</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Finish</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(interviews as any[]).map((interview: any) => (
                      <tr key={interview._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap font-medium">
                          {interview.student?.firstName} {interview.student?.lastName}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap capitalize">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            interview.opportunityType === 'pfa' || interview.opportunityType === 'pfe' 
                              ? 'bg-green-100 text-green-800' 
                              : interview.opportunityType === 'employment' 
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {interview.opportunityType || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap capitalize">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            interview.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : interview.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : interview.status === 'waiting'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {interview.status || 'waiting'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          {interview.queuePosition ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs rounded-full">
                              {interview.queuePosition}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs">
                          {interview.actualStartTime ? new Date(interview.actualStartTime).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs">
                          {interview.actualEndTime ? new Date(interview.actualEndTime).toLocaleString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommitteeQueue; 