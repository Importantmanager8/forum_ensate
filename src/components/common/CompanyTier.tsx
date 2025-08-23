import React from 'react';

interface Company {
  name: string;
  logo: string;
}

interface CompanyTierProps {
  title: string;
  companies: Company[];
  bgColor: string;
}

const CompanyTier: React.FC<CompanyTierProps> = ({ title, companies, bgColor }) => {
  console.log(`Rendering ${title} with companies:`, companies);

  if (!companies || companies.length === 0) {
    console.log(`No companies for ${title}`);
    // Instead of returning null, show an empty state
    return (
      <div className="mb-16">
        <div className={`${bgColor} text-white py-3 px-6 rounded-t-xl`}>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="bg-white p-8 rounded-b-xl shadow-lg text-center text-gray-500">
          No companies in this tier yet
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16">
      <div className={`${bgColor} text-white py-3 px-6 rounded-t-xl`}>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <div className="bg-white p-8 rounded-b-xl shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {companies.map((company, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-32 h-32 relative">
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <span className="mt-4 font-semibold text-gray-700">{company.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyTier;
