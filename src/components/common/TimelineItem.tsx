import React from 'react';

interface TimelineItemProps {
  date: string;
  title: string;
  description: string;
  side: 'left' | 'right';
}

const TimelineItem: React.FC<TimelineItemProps> = ({ date, title, description, side }) => {
  return (
    <div className={`flex ${side === 'left' ? 'flex-row' : 'flex-row-reverse'} items-center justify-center`}>
      <div className={`w-5/12 ${side === 'right' && 'text-right'}`}>
        <div className={`p-6 bg-white rounded-xl shadow-lg ${side === 'right' ? 'ml-6' : 'mr-6'}`}>
          <span className="text-sm font-semibold text-blue-600">{date}</span>
          <h3 className="text-xl font-bold mt-1">{title}</h3>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
      </div>
      <div className="relative flex items-center justify-center w-2/12">
        <div className="h-4 w-4 bg-blue-600 rounded-full z-10"></div>
      </div>
      <div className="w-5/12"></div>
    </div>
  );
};

export default TimelineItem;
