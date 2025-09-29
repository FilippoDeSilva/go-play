"use client";

import React, { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { Loader2, Play, X } from "lucide-react";
import { Media as Props } from "@/types/TMDBMovie";

function addAutoplay(url: string) {
  try {
    const u = new URL(url);
    // prefer to set autoplay=true when embedding
    u.searchParams.set("autoplay", "true");
    return u.toString();
  } catch {
    return url + (url.includes("?") ? "&autoplay=true" : "?autoplay=true");
  }
}

export type PlayButtonHandle = { open: () => void };

function PlayButtonBase({ 
  tmdbId, 
  className, 
  media_type = 'movie',
  seasonNumber,
  episodeNumber 
}: Props, ref: React.Ref<PlayButtonHandle>) {
  const [loading, setLoading] = useState(false);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleOpenEmbed = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: media_type || 'movie',
        tmdbId: tmdbId!.toString()
      });

      if (media_type === 'tv') {
        if (seasonNumber) params.append('season', seasonNumber.toString());
        if (episodeNumber) params.append('episode', episodeNumber.toString());
      }

      const res = await fetch(`/api/play?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to request player");
      const data = await res.json();
      if (!data?.url) throw new Error("No player URL returned");
      // validate host against a small allowlist to avoid embedding unknown/ad providers
      try {
        const parsed = new URL(data.url);
        const host = parsed.hostname.toLowerCase();
        const ALLOWED = new Set([
          'youtube.com',
          'www.youtube.com',
          'youtu.be',
          // 'player.vimeo.com',
          // 'vimeo.com',
          'vidlink.pro',
          'www.vidlink.pro'
        ]);
        // allow exact match or simple suffix matches (e.g. subdomains)
        const ok = [...ALLOWED].some(h => host === h || host.endsWith('.' + h));
        if (!ok) throw new Error('Embedding blocked: provider is not on the allowed list');
      } catch {
        throw new Error('Invalid or unsafe player URL');
      }

      // attempt to embed with autoplay
      setPlayerUrl(addAutoplay(data.url));
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error)?.message || "Failed to open player");
    } finally {
      setLoading(false);
    }
  }, [tmdbId, media_type, seasonNumber, episodeNumber]);

  useImperativeHandle(ref, () => ({ open: handleOpenEmbed }), [handleOpenEmbed]);

  function closePlayer() {
    setPlayerUrl(null);
    setError(null);
  }

  // close on ESC
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closePlayer();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div>
      <button
        onClick={handleOpenEmbed}
        disabled={loading}
        aria-label="Play movie"
        className={
          (className || "") +
          " inline-flex items-center gap-2 px-4 py-2 rounded-md shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 dark:focus:ring-indigo-600"
        }
      >
        <span className="text-white">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}</span>
      </button>

      {error ? (
        <div className="mt-3 text-sm text-red-400">{error}</div>
      ) : null}

      {playerUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70" onClick={closePlayer} />

          <div className="relative w-full max-w-5xl mx-auto max-h-[85vh] flex items-center justify-center">
            {/* Close button positioned at the top-right just above the video */}
            <button
              onClick={closePlayer}
              aria-label="Close player"
              className="absolute -top-12 right-3 z-50 flex items-center gap-2 px-3 py-2 bg-white/8 text-white rounded-md hover:bg-white/12 transition"
            >
              <X className="h-5 w-5" />
              <span className="hidden sm:inline">Close</span>
            </button>

            <div className="bg-black rounded-lg overflow-hidden shadow-2xl w-full">
              <div className="aspect-video max-h-[75vh]">{/* 16:9, constrained to viewport */}
                <iframe
                  src={playerUrl}
                  title={`Player for ${tmdbId}`}
                  frameBorder={0}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  className="w-full h-full"
                  onError={() => setError('Embedding blocked or restricted by provider.')}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const PlayButton = forwardRef<PlayButtonHandle, Props>(PlayButtonBase);
export default PlayButton;
