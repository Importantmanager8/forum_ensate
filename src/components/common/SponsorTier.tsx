import React from 'react';

interface Sponsor {
  name: string;
  logo: string;
}

interface SponsorTierProps {
  title: string;
  sponsors: Sponsor[];
  bgColor: string;
}

const SponsorTier: React.FC<SponsorTierProps> = ({ title, sponsors, bgColor }) => {
  return (
    <div className="mb-16">
      <div className={`${bgColor} text-white py-3 px-6 rounded-t-xl`}>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <div className="bg-white p-8 rounded-b-xl shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {sponsors.map((sponsor, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-24 h-24 relative">
                <img
                  src={sponsor.logo}
                  alt={`${sponsor.name} logo`}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <span className="mt-4 font-semibold text-gray-700">{sponsor.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SponsorTier;
