import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Company {
  _id?: string;
  name: string;
  logo?: string;
}

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  rank: 'Premium' | 'Gold' | 'Silver';
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

interface SchoolInfo {
  name: string;
  description: string;
  images: string[];
}

interface CompanyRankResponse {
  companyId: {
    _id: string;
    name: string;
    logo: string;
  } | string;
  rank: 'Official' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
}

interface CompanyRank {
  companyId: string;
  rank: 'Official' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
}

const HomeSettings = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyRanks, setCompanyRanks] = useState<CompanyRank[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    name: '',
    description: '',
    images: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch companies
      const companiesResponse = await api.get('/entreprises');
      setCompanies(companiesResponse.data);

      // Fetch homepage settings
      try {
        const settingsResponse = await api.get('/homepage-settings');
        const data = settingsResponse.data;
        
        // Transform company ranks to match the expected format
        const transformedRanks = data.companyRanks?.map((rank: CompanyRankResponse) => ({
          companyId: typeof rank.companyId === 'string' ? rank.companyId : rank.companyId._id,
          rank: rank.rank
        })) || [];
        
        setCompanyRanks(transformedRanks);
        setSponsors(data.sponsors || []);
        setTimeline(data.timeline || []);
        setSchoolInfo(data.schoolInfo || {
          name: '',
          description: '',
          images: []
        });
      } catch (error) {
        console.error('Error loading settings:', error);
        // If settings don't exist yet, use defaults
        setCompanyRanks([]);
        setSponsors([]);
        setTimeline([]);
        setSchoolInfo({
          name: '',
          description: '',
          images: []
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.post('/homepage-settings', {
        companyRanks,
        sponsors,
        timeline,
        schoolInfo
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const handleCompanyRankChange = (companyId: string, rank: CompanyRank['rank']) => {
    setCompanyRanks(prev => {
      const existing = prev.find(cr => cr.companyId === companyId);
      if (existing) {
        return prev.map(cr => cr.companyId === companyId ? { ...cr, rank } : cr);
      }
      return [...prev, { companyId, rank }];
    });
  };

  const addSponsor = () => {
    const newSponsor: Sponsor = {
      id: Date.now().toString(),
      name: '',
      logo: '',
      rank: 'Premium'
    };
    setSponsors([...sponsors, newSponsor]);
  };

  const updateSponsor = (id: string, updates: Partial<Sponsor>) => {
    setSponsors(prev => prev.map(sponsor => 
      sponsor.id === id ? { ...sponsor, ...updates } : sponsor
    ));
  };

  const deleteSponsor = (id: string) => {
    setSponsors(prev => prev.filter(sponsor => sponsor.id !== id));
  };

  const addTimelineEvent = () => {
    const newEvent: TimelineEvent = {
      id: Date.now().toString(),
      date: '',
      title: '',
      description: ''
    };
    setTimeline([...timeline, newEvent]);
  };

  const updateTimelineEvent = (id: string, updates: Partial<TimelineEvent>) => {
    setTimeline(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deleteTimelineEvent = (id: string) => {
    setTimeline(prev => prev.filter(event => event.id !== id));
  };

  const addSchoolImage = () => {
    setSchoolInfo(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const updateSchoolImage = (index: number, url: string) => {
    setSchoolInfo(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? url : img)
    }));
  };

  const deleteSchoolImage = (index: number) => {
    setSchoolInfo(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Homepage Settings</h1>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Changes
          </button>
        </div>

        <div className="space-y-8">
          {/* School Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">School Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  value={schoolInfo.name}
                  onChange={(e) => setSchoolInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter school name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={schoolInfo.description}
                  onChange={(e) => setSchoolInfo(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={4}
                  placeholder="Enter school description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Images
                </label>
                <div className="space-y-2">
                  {schoolInfo.images.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => updateSchoolImage(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter image URL"
                      />
                      <button
                        onClick={() => deleteSchoolImage(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addSchoolImage}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-5 w-5 mr-1" />
                    Add Image
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Events */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              {timeline.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={event.date}
                        onChange={(e) => updateTimelineEvent(event.id, { date: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={event.title}
                        onChange={(e) => updateTimelineEvent(event.id, { title: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Event title"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={event.description}
                      onChange={(e) => updateTimelineEvent(event.id, { description: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={2}
                      placeholder="Event description"
                    />
                  </div>
                  <button
                    onClick={() => deleteTimelineEvent(event.id)}
                    className="mt-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={addTimelineEvent}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-5 w-5 mr-1" />
                Add Event
              </button>
            </div>
          </div>

          {/* Company Rankings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Company Rankings</h2>
            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company._id} className="flex items-center justify-between border-b border-gray-200 py-2">
                  <div>
                    <p className="font-medium">{company.name}</p>
                    {company.logo && (
                      <img
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="h-8 w-8 object-contain"
                      />
                    )}
                  </div>
                  <select
                    value={companyRanks.find(cr => cr.companyId === company._id)?.rank || ''}
                    onChange={(e) => handleCompanyRankChange(company._id!, e.target.value as CompanyRank['rank'])}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Rank</option>
                    <option value="Official">Official</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsors */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Sponsors</h2>
            <div className="space-y-4">
              {sponsors.map((sponsor) => (
                <div key={sponsor.id} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={sponsor.name}
                        onChange={(e) => updateSponsor(sponsor.id, { name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Sponsor name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logo URL
                      </label>
                      <input
                        type="text"
                        value={sponsor.logo}
                        onChange={(e) => updateSponsor(sponsor.id, { logo: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Logo URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rank
                      </label>
                      <select
                        value={sponsor.rank}
                        onChange={(e) => updateSponsor(sponsor.id, { rank: e.target.value as Sponsor['rank'] })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="Premium">Premium</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSponsor(sponsor.id)}
                    className="mt-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={addSponsor}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-5 w-5 mr-1" />
                Add Sponsor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSettings;
