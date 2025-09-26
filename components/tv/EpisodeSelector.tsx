'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Episode, type EpisodeSelector } from '@/types/TMDBMovie';
import { cn } from '@/lib/utils';


interface EpisodeSelectorProps extends EpisodeSelector {
  onSelect: (seasonNumber: number, episodeNumber: number) => void;
};

export function EpisodeSelector({ 
  seasons, 
  onSelect, 
  defaultSeason = 1, 
  defaultEpisode = 1 
}: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState<number>(defaultSeason);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(defaultEpisode);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Find the selected season data
  const currentSeason = seasons.find(s => s.season_number === selectedSeason);

  // Fetch episodes when season changes
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!currentSeason) return;
      
      setIsLoading(true);
      try {
        // If we already have episodes, use them
        if (currentSeason.episodes) {
          setEpisodes(currentSeason.episodes);
          return;
        }

        // Otherwise fetch episodes for the season
        const res = await fetch(
          `/api/tv/${currentSeason.id}/season/${currentSeason.season_number}`
        );
        
        if (res.ok) {
          const data = await res.json();
          const seasonEpisodes = data.episodes || [];
          setEpisodes(seasonEpisodes);
          
          // Update the season with episodes for future reference
          const seasonIndex = seasons.findIndex(s => s.season_number === selectedSeason);
          if (seasonIndex !== -1) {
            seasons[seasonIndex].episodes = seasonEpisodes;
          }
        }
      } catch (error) {
        console.error('Error fetching episodes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpisodes();
  }, [selectedSeason, currentSeason, seasons]);

  // Handle season selection
  const handleSeasonSelect = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(1); // Reset to first episode when changing seasons
  };

  // Handle episode selection and notify parent
  const handleEpisodeSelect = (episodeNumber: number) => {
    setSelectedEpisode(episodeNumber);
    onSelect(selectedSeason, episodeNumber);
  };

  // Filter out special seasons (season 0)
  const availableSeasons = seasons.filter(season => season.season_number > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Season Selector */}
        <div className="w-full sm:w-48">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between border border-input">
                {currentSeason?.name || 'Select Season'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <div className="w-[300px] max-h-60 overflow-y-auto">
              {availableSeasons.map((season) => (
                <DropdownMenuItem
                  key={season.id}
                  onClick={() => handleSeasonSelect(season.season_number)}
                  className={`${selectedSeason === season.season_number ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                >
                  {season.name} ({season.episode_count} episodes)
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenu>
        </div>

        {/* Episode Selector */}
        <div className="w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  'w-full justify-between border border-input',
                  (isLoading || episodes.length === 0) && 'opacity-50 cursor-not-allowed'
                )} 
                disabled={isLoading || episodes.length === 0}
              >
                {isLoading ? 'Loading episodes...' : episodes[selectedEpisode - 1] ? `Episode ${selectedEpisode}${episodes[selectedEpisode - 1].name ? `: ${episodes[selectedEpisode - 1].name}` : ''}` : 'Select Episode'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <div className="w-[300px] max-h-60 overflow-y-auto">
              {episodes.map((episode) => (
                <DropdownMenuItem
                  key={episode.id}
                  onClick={() => handleEpisodeSelect(episode.episode_number)}
                  className={`${selectedEpisode === episode.episode_number ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">Episode {episode.episode_number}: {episode.name}</span>
                    {episode.air_date && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Aired: {new Date(episode.air_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
