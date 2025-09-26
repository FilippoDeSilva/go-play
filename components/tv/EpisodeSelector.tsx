'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Episode, type EpisodeSelector as EpisodeSelectorType } from '@/types/TMDBMovie';
import { cn } from '@/lib/utils';

interface EpisodeSelectorProps extends EpisodeSelectorType {
  tvId: number;
  onSelect: (seasonNumber: number, episodeNumber: number) => void;
  defaultSeason?: number;
  defaultEpisode?: number;
}

export function EpisodeSelector({
  seasons,
  tvId,
  onSelect,
  defaultSeason = 1,
  defaultEpisode = 1,
}: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState<number>(defaultSeason);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(defaultEpisode);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentSeason = seasons.find(s => s.season_number === selectedSeason);
  const availableSeasons = seasons.filter(s => s.season_number > 0);

  // Fetch episodes when season changes
  useEffect(() => {
    async function loadEpisodes(seasonNum: number) {
      const season = seasons.find(s => s.season_number === seasonNum);
      if (!season) return;
      setIsLoading(true);
      try {
        if (season.episodes) {
          setEpisodes(season.episodes);
        } else {
          const apiUrl = process.env.NEXT_PUBLIC_TMDB_API_URL || 'https://api.themoviedb.org/3';
          const token = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || '';
          const res = await fetch(`${apiUrl}/tv/${tvId}/season/${season.season_number}?language=en-US`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const data = await res.json();
            const seasonEpisodes: Episode[] = data.episodes || [];
            setEpisodes(seasonEpisodes);
            // Cache into seasons array so next time it’s available
            const idx = seasons.findIndex(s => s.season_number === seasonNum);
            if (idx !== -1) {
              seasons[idx].episodes = seasonEpisodes;
            }
          } else {
            setEpisodes([]);
          }
        }
      } catch (err) {
        console.error('Error loading episodes:', err);
        setEpisodes([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadEpisodes(selectedSeason);
  }, [selectedSeason, seasons, tvId]);

  // On mount: ensure defaults, load the episodes for defaultSeason and trigger parent
  useEffect(() => {
    // Ensure a valid season
    const hasDefault = seasons.some(s => s.season_number === defaultSeason);
    const seasonToUse = hasDefault ? defaultSeason : (availableSeasons[0]?.season_number || 1);
    setSelectedSeason(seasonToUse);
    setSelectedEpisode(defaultEpisode);
    onSelect(seasonToUse, defaultEpisode);
  // Only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSeasonSelect = (seasonNumber: number) => {
    if (seasonNumber === selectedSeason) return;
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(1);
    onSelect(seasonNumber, 1);
  };

  const handleEpisodeSelect = (episodeNumber: number) => {
    if (episodeNumber === selectedEpisode) return;
    setSelectedEpisode(episodeNumber);
    onSelect(selectedSeason, episodeNumber);
  };

  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Season Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full sm:w-44 justify-between border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700",
                "px-3 py-2 text-sm"
              )}
            >
              <span className="truncate">{ currentSeason?.name || `Season ${selectedSeason}` }</span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 max-h-56 overflow-y-auto p-1">
            {availableSeasons.map(season => (
              <DropdownMenuItem
                key={season.id}
                onClick={() => handleSeasonSelect(season.season_number)}
                className={cn(
                  "px-2 py-1 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-700",
                  selectedSeason === season.season_number ? "bg-gray-200 dark:bg-gray-700 font-medium" : ""
                )}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="truncate">{season.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{season.episode_count} ep</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Episode Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              disabled={isLoading || episodes.length === 0}
              className={cn(
                "w-full sm:w-60 justify-between border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed",
                "px-3 py-2 text-sm"
              )}
            >
              <span className="truncate">
                { isLoading
                  ? "Loading episodes..."
                  : (episodes[selectedEpisode - 1]
                      ? `Ep ${selectedEpisode}: ${episodes[selectedEpisode - 1].name}`
                      : "Select Episode")
                }
              </span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60 max-h-64 overflow-y-auto p-1">
            {episodes.map(ep => (
              <DropdownMenuItem
                key={ep.id}
                onClick={() => handleEpisodeSelect(ep.episode_number)}
                className={cn(
                  "px-2 py-1 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-700",
                  selectedEpisode === ep.episode_number ? "bg-gray-200 dark:bg-gray-700 font-medium" : ""
                )}
              >
                <div className="flex flex-col">
                  <span className="truncate">{`Ep ${ep.episode_number}: ${ep.name}`}</span>
                  {ep.air_date && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Aired: { new Date(ep.air_date).toLocaleDateString() }
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
