import React, { useState } from 'react';
import { Credits, CastMember, CrewMember } from '@/types/content.types';
import { contentService } from '@/services/content.service';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn.utils';

interface CastCrewProps {
  credits: Credits;
  className?: string;
}

const CastCrew: React.FC<CastCrewProps> = ({ credits, className }) => {
  const [activeTab, setActiveTab] = useState<'cast' | 'crew'>('cast');
  const [showAllCast, setShowAllCast] = useState(false);
  const [showAllCrew, setShowAllCrew] = useState(false);

  // Limit display to first 12 cast members initially
  const displayCast = showAllCast ? credits.cast : credits.cast.slice(0, 12);

  // Group crew by department
  const crewByDepartment = credits.crew.reduce((acc, member) => {
    if (!acc[member.department]) {
      acc[member.department] = [];
    }
    acc[member.department].push(member);
    return acc;
  }, {} as Record<string, CrewMember[]>);

  // Get key crew members (Director, Writer, Producer, etc.)
  const keyCrewJobs = ['Director', 'Writer', 'Producer', 'Executive Producer', 'Screenplay', 'Story'];
  const keyCrew = credits.crew.filter(member => keyCrewJobs.includes(member.job));

  const PersonCard: React.FC<{ 
    person: CastMember | CrewMember; 
    type: 'cast' | 'crew';
    size?: 'sm' | 'md';
  }> = ({ person, type, size = 'md' }) => {
    const imageUrl = person.profile_path 
      ? contentService.getImageUrl(person.profile_path, 'w200')
      : null;

    const cardSize = size === 'sm' ? 'w-20 h-20' : 'w-24 h-24';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

    return (
      <div className="flex flex-col items-center text-center group">
        <div className={cn(
          'rounded-full overflow-hidden bg-gray-700 mb-2 flex-shrink-0',
          cardSize
        )}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={person.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-h-0 flex-1">
          <p className={cn('font-semibold text-white line-clamp-2 mb-1', textSize)}>
            {person.name}
          </p>
          <p className={cn('text-gray-400 line-clamp-2', textSize)}>
            {type === 'cast' ? (person as CastMember).character : (person as CrewMember).job}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('bg-gray-900/50 rounded-lg p-6', className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Cast & Crew</h2>
        
        {/* Key Crew Members (Directors, Writers, etc.) */}
        {keyCrew.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Key Personnel</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {keyCrew.slice(0, 8).map((member) => (
                <PersonCard
                  key={`${member.id}-${member.job}`}
                  person={member}
                  type="crew"
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('cast')}
            className={cn(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              activeTab === 'cast'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            )}
          >
            Cast ({credits.cast.length})
          </button>
          <button
            onClick={() => setActiveTab('crew')}
            className={cn(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              activeTab === 'crew'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            )}
          >
            Crew ({credits.crew.length})
          </button>
        </div>
      </div>

      {/* Cast Tab */}
      {activeTab === 'cast' && (
        <div>
          {credits.cast.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {displayCast.map((member) => (
                  <PersonCard
                    key={`${member.id}-${member.order}`}
                    person={member}
                    type="cast"
                  />
                ))}
              </div>
              
              {credits.cast.length > 12 && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllCast(!showAllCast)}
                    className="border-gray-600 text-white hover:bg-gray-800"
                  >
                    {showAllCast 
                      ? 'Show Less' 
                      : `Show All ${credits.cast.length} Cast Members`
                    }
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-center py-8">No cast information available.</p>
          )}
        </div>
      )}

      {/* Crew Tab */}
      {activeTab === 'crew' && (
        <div>
          {credits.crew.length > 0 ? (
            <>
              {/* Show crew by department */}
              {Object.entries(crewByDepartment)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([department, members]) => (
                  <div key={department} className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">{department}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {members
                        .slice(0, showAllCrew ? members.length : 6)
                        .map((member) => (
                          <PersonCard
                            key={`${member.id}-${member.job}-${member.department}`}
                            person={member}
                            type="crew"
                          />
                        ))}
                    </div>
                    {!showAllCrew && members.length > 6 && (
                      <p className="text-gray-400 text-sm mt-2">
                        +{members.length - 6} more in {department}
                      </p>
                    )}
                  </div>
                ))}
              
              {credits.crew.length > 8 && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllCrew(!showAllCrew)}
                    className="border-gray-600 text-white hover:bg-gray-800"
                  >
                    {showAllCrew 
                      ? 'Show Less' 
                      : `Show All ${credits.crew.length} Crew Members`
                    }
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-center py-8">No crew information available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CastCrew;