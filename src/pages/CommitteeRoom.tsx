import { useAuth } from '../context/AuthContext';
import { Clock, Users, Play, Square, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface Student {
  firstName: string;
  lastName: string;
  status: string;
}

interface Interview {
  id: number;
  student: Student;
  opportunityType: string;
  priority: number;
  estimatedTime: string;
  startTime?: Date;
  status?: string;
}

interface RoomInfo {
  id: string;
  name: string;
  company: string;
  location: string;
}

const CommitteeRoom = () => {
  const { user } = useAuth();
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(null);
  const [queueList, setQueueList] = useState<Interview[]>([]);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);

  // Mock data - replace with real API calls
  useEffect(() => {
    setRoomInfo({
      id: 'room-a1',
      name: 'Room A1',
      company: 'TechCorp',
      location: 'Building A, Floor 1'
    });
    setQueueList([
      {
        id: 1,
        student: { firstName: 'Ahmed', lastName: 'Benali', status: 'ensa' },
        opportunityType: 'pfa',
        priority: 12,
        estimatedTime: '10:30 AM'
      },
      {
        id: 2,
        student: { firstName: 'Sara', lastName: 'Alami', status: 'external' },
        opportunityType: 'employment',
        priority: 32,
        estimatedTime: '10:50 AM'
      },
      {
        id: 3,
        student: { firstName: 'Omar', lastName: 'Tazi', status: 'ensa' },
        opportunityType: 'pfe',
        priority: 21,
        estimatedTime: '11:10 AM'
      }
    ]);
  }, []);

  const handleStartInterview = (interview: Interview) => {
    setCurrentInterview({
      ...interview,
      startTime: new Date(),
      status: 'in_progress'
    });
    setQueueList(prev => prev.filter(item => item.id !== interview.id));
  };

  const handleEndInterview = () => {
    if (currentInterview) {
      setCurrentInterview(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ensa':
        return 'bg-blue-100 text-blue-800';
      case 'external':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOpportunityColor = (type: string) => {
    switch (type) {
      case 'pfa':
      case 'pfe':
        return 'bg-green-100 text-green-800';
      case 'employment':
        return 'bg-purple-100 text-purple-800';
      case 'observation':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Links for Committee */}
        <div className="mb-4 flex gap-4">
          <Link to="/committee/queue" className="bg-blue-600 text-white px-4 py-2 rounded">View All Interviews</Link>
        </div>
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Committee Interface
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome, {user?.firstName} - Managing {roomInfo?.company} interviews
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-gray-600 mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{roomInfo?.name} - {roomInfo?.location}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Interview */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Play className="h-6 w-6 text-green-600 mr-2" />
              Current Interview
            </h2>

            {currentInterview ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {currentInterview.student.firstName} {currentInterview.student.lastName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentInterview.student.status)}`}>
                        {currentInterview.student.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOpportunityColor(currentInterview.opportunityType)}`}>
                        {currentInterview.opportunityType.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>Started: {currentInterview.startTime?.toLocaleTimeString()}</span>
                    <span>Duration: {currentInterview.startTime ? Math.floor((new Date().getTime() - currentInterview.startTime.getTime()) / 60000) : 0} min</span>
                  </div>
                  <button
                    onClick={handleEndInterview}
                    className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Square className="h-5 w-5" />
                    <span>End Interview</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Interview</h3>
                <p className="text-gray-600">Ready to start the next interview</p>
              </div>
            )}
          </div>

          {/* Queue Management */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-2" />
              Interview Queue ({queueList.length})
            </h2>
            <div className="space-y-4">
              {queueList.length > 0 ? (
                queueList.map((interview, index) => (
                  <div
                    key={interview.id}
                    className={`border rounded-lg p-4 transition-all ${
                      index === 0 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {interview.student.firstName} {interview.student.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Est. time: {interview.estimatedTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.student.status)}`}>
                          {interview.student.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOpportunityColor(interview.opportunityType)}`}>
                          {interview.opportunityType.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {index === 0 && !currentInterview && (
                      <button
                        onClick={() => handleStartInterview(interview)}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Play className="h-4 w-4" />
                        <span>Start Interview</span>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Queue Empty</h3>
                  <p className="text-gray-600">No students waiting for interviews</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Queue</p>
                <p className="text-2xl font-bold text-gray-900">{queueList.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
                <p className="text-2xl font-bold text-gray-900">22m</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeRoom;