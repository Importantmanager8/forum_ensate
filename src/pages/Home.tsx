import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Play } from 'lucide-react';
import TimelineItem from '../components/common/TimelineItem';
import CompanyTier from '../components/common/CompanyTier';
import SponsorTier from '../components/common/SponsorTier';

interface CompanyData {
  _id: string;
  name: string;
  logo: string;
}

interface HomepageSettings {
  schoolInfo: {
    name: string;
    description: string;
    images: string[];
  };
  timeline: Array<{
    id?: string;
    date: string;
    title: string;
    description: string;
  }>;
  companyRanks: Array<{
    companyId: CompanyData;
    rank: 'Official' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  }>;
  sponsors: Array<{
    name: string;
    logo: string;
    rank: 'Premium' | 'Gold' | 'Silver';
  }>;
}

const Home = (): JSX.Element => {
  const { isAuthenticated, user } = useAuth();
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect((): void => {
    let mounted = true;

    const fetchSettings = async () => {
      try {
        console.log('Fetching homepage settings...');
        const response = await fetch('/api/homepage-settings');
        const data = await response.json();
        console.log('Received homepage settings:', data);
        
        if (!mounted) return;

        if (!data.companyRanks) {
          console.error('No company ranks found in settings:', data);
          setLoading(false);
          return;
        }
        
        // Validate company data
        const validCompanyRanks = data.companyRanks.filter((cr: {companyId?: CompanyData; rank?: string}) => {
          if (!cr.companyId) {
            console.warn('Company rank missing companyId:', cr);
            return false;
          }
          if (!cr.rank) {
            console.warn('Company rank missing rank:', cr);
            return false;
          }
          return true;
        });
        
        console.log('Valid company ranks:', validCompanyRanks);
        if (mounted) {
          setSettings({...data, companyRanks: validCompanyRanks});
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching homepage settings:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    
  }, []); // Add empty dependency array

  const features = [
    {
      icon: Play,
      title: 'Smart Scheduling',
      description: 'Automated interview scheduling with intelligent conflict resolution'
    },
    {
      icon: ArrowRight,
      title: 'Priority Management',
      description: 'Fair queue system with priority based on student status and opportunity type'
    },
    {
      icon: Play,
      title: 'Real-time Updates',
      description: 'Live notifications and queue position updates for all participants'
    },
    {
      icon: ArrowRight,
      title: 'Seamless Management',
      description: 'Efficient interview flow management for committee members and administrators'
    }
  ];

  const stats = [
    { label: 'Active Students', value: '150+', color: 'text-blue-600' },
    { label: 'Partner Companies', value: '25+', color: 'text-green-600' },
    { label: 'Successful Interviews', value: '500+', color: 'text-purple-600' },
    { label: 'Average Wait Time', value: '< 15min', color: 'text-orange-600' }
  ];

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'student':
        return '/student/dashboard';
      case 'committee':
        return '/committee/room';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
        <div className="text-center">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : !settings ? (
            <div className="text-gray-600">No settings available</div>
          ) : (
            <>
              <div className="flex justify-center mb-8">
                {settings?.schoolInfo.images[0] && (
                  <img 
                    src={settings?.schoolInfo.images[0]} 
                    alt={`${settings?.schoolInfo.name} Logo`} 
                    className="h-24 w-auto" 
                  />
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {settings?.schoolInfo.name || 'Forum ENSATE'}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  2025 Edition
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                {settings?.schoolInfo.description || 
                  "Welcome to the National School of Applied Sciences and Technologies of El Jadida's annual career forum."}
              </p>
            </>
          )}
          
          {/* School Introduction */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative h-[400px] rounded-xl overflow-hidden">
              <img 
                src="/school-campus.jpg" 
                alt="ENSATE Campus" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <h2 className="text-3xl font-bold mb-4">About ENSATE</h2>
              <p className="text-gray-600 mb-6">
                The National School of Applied Sciences and Technologies of El Jadida (ENSATE) 
                is a prestigious institution dedicated to engineering excellence and technological innovation.
                Our state-of-the-art facilities and distinguished faculty prepare students for leadership
                roles in various engineering disciplines.
              </p>
              <Link to="/about" className="text-blue-600 font-semibold hover:text-blue-700">
                Learn more about ENSATE →
              </Link>
            </div>
          </div>

          {/* Forum Timeline */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold mb-12">Forum Timeline</h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
              <div className="space-y-12">
                {settings?.timeline.map((event, index) => {
                  // Create a unique key using index as fallback if id is not available
                  const uniqueKey = `timeline-${event.id || index}`;
                  return (
                    <TimelineItem
                      key={uniqueKey}
                      date={event.date}
                      title={event.title}
                      description={event.description}
                      side={index % 2 === 0 ? "left" : "right"}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Participating Companies */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold mb-12">Participating Companies</h2>
            
            {(() => {
              console.log('Current settings:', settings);
              console.log('Company ranks:', settings?.companyRanks);
              return null;
            })()}
            {settings && (
              <>
                {/* Official Partners */}
                <CompanyTier
                  title="Official Partners"
                  companies={settings.companyRanks
                    .filter(cr => cr.rank === 'Official' && cr.companyId)
                    .map(cr => ({
                      name: cr.companyId.name,
                      logo: cr.companyId.logo || ''
                    }))}
                  bgColor="bg-gradient-to-r from-purple-600 to-indigo-600"
                />

                {/* Platinum Partners */}
                <CompanyTier
                  title="Platinum Partners"
                  companies={settings.companyRanks
                    .filter(cr => cr.rank === 'Platinum' && cr.companyId)
                    .map(cr => ({
                      name: cr.companyId.name,
                      logo: cr.companyId.logo || ''
                    }))}
                  bgColor="bg-gradient-to-r from-gray-800 to-gray-600"
                />

                {/* Gold Partners */}
                <CompanyTier
                  title="Gold Partners"
                  companies={settings.companyRanks
                    .filter(cr => cr.rank === 'Gold' && cr.companyId)
                    .map(cr => ({
                      name: cr.companyId.name,
                      logo: cr.companyId.logo || ''
                    }))}
                  bgColor="bg-gradient-to-r from-yellow-500 to-yellow-400"
                />

                {/* Silver Partners */}
                <CompanyTier
                  title="Silver Partners"
                  companies={settings.companyRanks
                    .filter(cr => cr.rank === 'Silver' && cr.companyId)
                    .map(cr => ({
                      name: cr.companyId.name,
                      logo: cr.companyId.logo || ''
                    }))}
                  bgColor="bg-gradient-to-r from-gray-400 to-gray-300"
                />

                {/* Bronze Partners */}
                <CompanyTier
                  title="Bronze Partners"
                  companies={settings.companyRanks
                    .filter(cr => cr.rank === 'Bronze' && cr.companyId)
                    .map(cr => ({
                      name: cr.companyId.name,
                      logo: cr.companyId.logo || ''
                    }))}
                  bgColor="bg-gradient-to-r from-amber-700 to-amber-600"
                />
              </>
            )}
          </div>

          {/* Sponsors Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold mb-12">Our Sponsors</h2>
            
            {settings && (
              <>
                {/* Premium Sponsors */}
                <SponsorTier
                  title="Premium Sponsors"
                  sponsors={settings.sponsors?.filter(s => s.rank === 'Premium') || []}
                  bgColor="bg-gradient-to-r from-blue-600 to-blue-400"
                />

                {/* Gold Sponsors */}
                <SponsorTier
                  title="Gold Sponsors"
                  sponsors={settings.sponsors?.filter(s => s.rank === 'Gold') || []}
                  bgColor="bg-gradient-to-r from-yellow-500 to-yellow-400"
                />

                {/* Silver Sponsors */}
                <SponsorTier
                  title="Silver Sponsors"
                  sponsors={settings.sponsors?.filter(s => s.rank === 'Silver') || []}
                  bgColor="bg-gradient-to-r from-gray-400 to-gray-300"
                />
              </>
            )}
          </div>
          
          {isAuthenticated ? (
            <div className="space-y-4">
              <Link
                to={getDashboardPath()}
                className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Play className="mr-2 h-5 w-5" />
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <p className="text-sm text-gray-500">
                Welcome back, {user?.firstName}! ({user?.role})
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Play className="mr-2 h-5 w-5" />
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose ForumPro?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform eliminates the chaos of traditional career forums with modern, 
            automated solutions designed for students, companies, and organizers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <feature.icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to manage your career forum experience efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Register & Select</h3>
              <p className="text-gray-600">
                Create your account and select companies and opportunity types you're interested in
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Queue</h3>
              <p className="text-gray-600">
                Our algorithm places you in priority-based queues with real-time position updates
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Interview Ready</h3>
              <p className="text-gray-600">
                Get notified when it's your turn and head to the designated room for your interview
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Career Forum?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of students and companies using ForumPro for efficient interview management
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center bg-white text-blue-600 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;