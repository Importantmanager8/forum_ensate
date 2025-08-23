import { useEffect, useState } from 'react';
import axios from 'axios';

interface Company {
  _id: string;
  name: string;
}

interface Room {
  _id: string;
  name: string;
  // location: string; // Remove location
}
const API_BASE_URL = import.meta.env.VITE_API_URL;
// Create an axios instance with interceptor for rooms
const roomApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

const API_COMPANIES = '/entreprises';
const API_ROOMS = '/rooms';

const AssignCompanyRoom = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomLocation, setNewRoomLocation] = useState('');
  const [newRoomCompany, setNewRoomCompany] = useState('');
  // const [newRoomLocation, setNewRoomLocation] = useState(''); // Remove newRoomLocation state
  // Remove roomIdCounter, it is unused
  const [selectedRooms, setSelectedRooms] = useState<{ [key: string]: string }>({});
  const [errorMessages, setErrorMessages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    axios.get(API_COMPANIES, {
      baseURL: API_BASE_URL,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      // Defensive: handle both array and object response
      const data = res.data;
      const companiesArray = Array.isArray(data) ? data : (Array.isArray(data.companies) ? data.companies : []);
      console.log('Companies API response:', data);
      setCompanies(companiesArray);
    });
    roomApi.get(API_ROOMS).then(res => {
      const data = res.data;
      const roomsArray = Array.isArray(data) ? data : (Array.isArray(data.rooms) ? data.rooms : []);
      setRooms(roomsArray);
    });
  }, []);

  // Add handler for adding a room
  const handleAddRoom = async () => {
    const trimmedName = newRoomName.trim();
    const trimmedLocation = newRoomLocation.trim();
    const companyId = newRoomCompany;
    if (!trimmedName || !trimmedLocation || !companyId) return;
    if (rooms.some(r => r.name.toLowerCase() === trimmedName.toLowerCase())) return;
    try {
      const res = await roomApi.post(API_ROOMS, {
        name: trimmedName,
        location: trimmedLocation,
        company: companyId
      });
      setRooms([...rooms, res.data]);
      setNewRoomName('');
      setNewRoomLocation('');
      setNewRoomCompany('');
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleAssign = async (companyId: string) => {
    const roomId = selectedRooms[companyId];
    if (!roomId) {
      setErrorMessages((prev) => ({ ...prev, [companyId]: 'Please select a room.' }));
      return;
    }
    const matchedRoom = rooms.find(room => room._id === roomId);
    if (!matchedRoom) {
      setErrorMessages((prev) => ({ ...prev, [companyId]: 'Room not found.' }));
      return;
    }
    try {
      await roomApi.put(`${API_ROOMS}/${roomId}`, { company: companyId });
      alert('Company assigned to room!');
      setErrorMessages((prev) => ({ ...prev, [companyId]: '' }));
      // Optionally update local state
      setRooms(rooms.map(r => r._id === roomId ? { ...r, company: companyId } : r));
    } catch (err) {
      setErrorMessages((prev) => ({ ...prev, [companyId]: 'Assignment failed.' }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Assign Companies to Rooms</h1>
      {/* Room entry section */}
      <div className="mb-6 p-4 bg-gray-50 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Enter Available Rooms</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Room name"
            value={newRoomName}
            onChange={e => setNewRoomName(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Location"
            value={newRoomLocation}
            onChange={e => setNewRoomLocation(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <select
            value={newRoomCompany}
            onChange={e => setNewRoomCompany(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Company</option>
            {companies.map(company => (
              <option key={company._id} value={company._id}>{company.name}</option>
            ))}
          </select>
          <button
            onClick={handleAddRoom}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Room
          </button>
        </div>
        {rooms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rooms.map(room => (
              <span key={room._id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{room.name}</span>
            ))}
          </div>
        )}
      </div>
      {/* Assignment table */}
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="p-2 border">Company</th>
            <th className="p-2 border">Assign Room</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(companies) ? companies.map((company) => (
            <tr key={company._id}>
              <td className="p-2 border">{company.name}</td>
              <td className="p-2 border">
                <select
                  value={selectedRooms[company._id] || ''}
                  onChange={e => {
                    setSelectedRooms({ ...selectedRooms, [company._id]: e.target.value });
                    setErrorMessages((prev) => ({ ...prev, [company._id]: '' }));
                  }}
                  className="border p-2 rounded w-full"
                  disabled={rooms.length === 0}
                >
                  <option value="">Select Room</option>
                  {rooms.map(room => (
                    <option key={room._id} value={room._id}>{room.name}</option>
                  ))}
                </select>
                {errorMessages[company._id] && (
                  <div className="text-red-600 text-xs mt-1">{errorMessages[company._id]}</div>
                )}
              </td>
              <td className="p-2 border">
                <button
                  onClick={() => handleAssign(company._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={rooms.length === 0}
                >
                  Assign
                </button>
              </td>
            </tr>
          )) : null}
        </tbody>
      </table>
    </div>
  );
};

export default AssignCompanyRoom; 