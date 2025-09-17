import React from 'react';
import { Season } from '@/types/content.types';

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeason: number;
  onSeasonChange: (seasonNumber: number) => void;
  className?: string;
}

// SVG Icons
const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeason: number;
  onSeasonChange: (seasonNumber: number) => void;
  className?: string;
}

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  seasons,
  selectedSeason,
  onSeasonChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedSeasonData = seasons.find(s => s.season_number === selectedSeason);

  const handleSeasonSelect = (seasonNumber: number) => {
    onSeasonChange(seasonNumber);
    setIsOpen(false);
  };

  const getSeasonDisplayName = (season: Season) => {
    if (season.season_number === 0) return 'Specials';
    return `Season ${season.season_number}`;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-black/50 transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          <CalendarIcon />
          <div className="text-left">
            <div className="font-medium text-white">
              {selectedSeasonData ? getSeasonDisplayName(selectedSeasonData) : 'Select Season'}
            </div>
            {selectedSeasonData && (
              <div className="text-xs text-white/60">
                {selectedSeasonData.episode_count} episodes
                {selectedSeasonData.air_date && (
                  <> • {new Date(selectedSeasonData.air_date).getFullYear()}</>
                )}
              </div>
            )}
          </div>
        </div>
        <div 
          className={`transition-transform duration-200 text-white/60 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <ChevronDownIcon />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 shadow-xl max-h-64 overflow-y-auto">
          {seasons
            .sort((a, b) => a.season_number - b.season_number)
            .map((season) => (
            <button
              key={season.id}
              onClick={() => handleSeasonSelect(season.season_number)}
              className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors duration-200 ${
                season.season_number === selectedSeason ? 'bg-blue-600/20 border-r-2 border-blue-400' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">
                    {getSeasonDisplayName(season)}
                  </div>
                  <div className="text-xs text-white/60">
                    {season.episode_count} episodes
                    {season.air_date && (
                      <> • {new Date(season.air_date).getFullYear()}</>
                    )}
                  </div>
                </div>
                {season.season_number === selectedSeason && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SeasonSelector;