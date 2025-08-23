import React, { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  timeout: 10000,
});


const AssignCommittee = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [committeeMembers, setCommitteeMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [companiesRes, roomsRes, usersRes] = await Promise.all([
          api.get('/entreprises'),
          api.get('/rooms'),
          api.get('/users?role=committee'),
        ]);
        setCompanies(companiesRes.data);
        setRooms(roomsRes.data);
        setCommitteeMembers(usersRes.data);
      } catch (err) {
        setCompanies([]);
        setRooms([]);
        setCommitteeMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (roomId: string, committeeId: string) => {
    setSaving(roomId);
    try {
      await api.put(`/rooms/${roomId}`, { assignedCommittee: committeeId });
      setRooms((prev) => prev.map((room) => room._id === roomId ? { ...room, assignedCommittee: committeeId } : room));
    } catch (err) {
      alert('Failed to assign committee member.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Assign Committee Members to Companies</h1>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-8">
            {companies.map((company) => {
              const room = rooms.find((r) => r.company === company._id);
              return (
                <div key={company._id} className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-800">{company.name}</h2>
                    <p className="text-gray-500 text-sm">Room: {room?.name || 'Not assigned'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-gray-700 font-medium mr-2">Committee:</label>
                    <select
                      className="border rounded px-3 py-2 text-sm"
                      value={room?.assignedCommittee || ''}
                      onChange={(e) => handleAssign(room._id, e.target.value)}
                      disabled={!room || saving === room._id}
                    >
                      <option value="">Select...</option>
                      {committeeMembers.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.firstName} {member.lastName} ({member.email})
                        </option>
                      ))}
                    </select>
                    {saving === room?._id && <span className="ml-2 text-blue-600 text-xs">Saving...</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignCommittee; 