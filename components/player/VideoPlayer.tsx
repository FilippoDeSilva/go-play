"use client";

import { useEffect, useState } from "react";
import type { PlayProps } from '@/types/PlayerProps';

export default function VideoPlayer(props: PlayProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = async () => {
      const params = new URLSearchParams(
        Object.entries(props).filter(([, v]) => v !== undefined) as [string, string][]
      );
      const res = await fetch(`/api/play?${params.toString()}`);
      const data = await res.json();
      setUrl(data.url);
    };
    fetchUrl();
  }, [props]);

  // Watch progress listener
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== "https://vidlink.pro") return;

      if (event.data?.type === "MEDIA_DATA") {
        localStorage.setItem("vidLinkProgress", JSON.stringify(event.data.data));
      }

      if (event.data?.type === "PLAYER_EVENT") {
        console.log("Player Event:", event.data.data);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!url) return <p>Loading...</p>;

  return (
    <iframe
      src={url}
      width="100%"
      height="600"
      frameBorder="0"
      allowFullScreen
    ></iframe>
  );
}
