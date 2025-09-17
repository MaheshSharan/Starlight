import React, { useState } from 'react';
import { cn } from '@/utils/cn.utils';
import { contentService } from '@/services/content.service';
import type { CastMember, CrewMember, Credits } from '@/types/content.types';

interface CastCrewProps {
  credits: Credits;
  className?: string;
}

interface PersonCardProps {
  person: CastMember | CrewMember;
  type: 'cast' | 'crew';
}

const PersonCard: React.FC<PersonCardProps> = ({ person, type }) => {
  const imageUrl = person.profile_path
    ? contentService.getImageUrl(person.profile_path, 'w200')
    : null;

  return (
    <div className="flex-shrink-0 w-32 group cursor-pointer">
      <div className="relative mb-3 overflow-hidden rounded-lg bg-gray-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={person.name}
            className="w-32 h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-32 h-48 bg-gray-700 flex items-center justify-center">
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-xl font-bold">
                {person.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white mb-1 line-clamp-2">{person.name}</p>
        <p className="text-xs text-gray-400 line-clamp-2">
          {type === 'cast' ? (person as CastMember).character : (person as CrewMember).job}
        </p>
      </div>
    </div>
  );
};

const CastCrew: React.FC<CastCrewProps> = ({ credits, className }) => {
  const [activeTab, setActiveTab] = useState<'cast' | 'crew'>('cast');

  const keyCrew = (credits.crew || [])
    .filter(m => ['Director', 'Creator', 'Executive Producer', 'Writer', 'Producer', 'Screenplay'].includes(m.job))
    .slice(0, 10);

  const hasCast = (credits.cast?.length || 0) > 0;
  const hasCrew = (credits.crew?.length || 0) > 0;

  if (!hasCast && !hasCrew) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {keyCrew.length > 0 && (
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-white mb-4">Key People</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {keyCrew.map((member, index) => (
              <PersonCard key={`${member.id}-${member.job}-${index}`} person={member} type="crew" />
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-6 mb-6 border-b border-gray-800">
        {hasCast && (
          <button
            type="button"
            onClick={() => setActiveTab('cast')}
            className={cn(
              'pb-3 px-1 text-lg font-medium transition-colors relative',
              activeTab === 'cast' ? 'text-white border-b-2 border-red-600' : 'text-gray-400 hover:text-white'
            )}
          >
            Cast
          </button>
        )}
        {hasCrew && (
          <button
            type="button"
            onClick={() => setActiveTab('crew')}
            className={cn(
              'pb-3 px-1 text-lg font-medium transition-colors relative',
              activeTab === 'crew' ? 'text-white border-b-2 border-red-600' : 'text-gray-400 hover:text-white'
            )}
          >
            Crew
          </button>
        )}
      </div>

      {activeTab === 'cast' && hasCast && (
        <div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {credits.cast!.slice(0, 20).map(member => (
              <PersonCard key={`${member.id}-${member.order}`} person={member} type="cast" />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'crew' && hasCrew && (
        <div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {credits.crew!.slice(0, 20).map((member, index) => (
              <PersonCard key={`${member.id}-${member.job}-${index}`} person={member} type="crew" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CastCrew;
