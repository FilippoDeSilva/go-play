// "use client";

// import React, { useEffect, useState } from 'react';
// import { X } from 'lucide-react';

// type Props = {
//   movieId: number;
//   title: string;
//   onClose: () => void;
// };

// type Video = { id: string; key: string; site: string; type: string; name: string };

// export default function MovieDetail({ movieId, title, onClose }: Props) {
//   const [videos, setVideos] = useState<Video[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;
//     async function load() {
//       try {
//         const res = await fetch(`/api/movies/${movieId}/videos`);
//         if (!res.ok) throw new Error('failed');
//         const json = await res.json();
//         if (mounted) setVideos(json.results || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }
//     load();
//     return () => { mounted = false };
//   }, [movieId]);

//   const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer');

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
//       <div className="absolute inset-0 bg-black/60" onClick={onClose} />
//       <div className="relative max-w-3xl w-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
//         <div className="p-4 flex items-start justify-between">
//           <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
//           <button onClick={onClose} className="text-gray-600 dark:text-gray-300"><X className="h-8 w-8" /></button>
//         </div>

//         <div className="px-4 pb-6">
//           {loading ? (
//             <p className="text-gray-600 dark:text-gray-300">Loading videos…</p>
//           ) : trailer ? (
//             <div className="aspect-video bg-black">
//               <iframe
//                 src={`https://www.youtube.com/embed/${trailer.key}`}
//                 title={trailer.name}
//                 frameBorder={0}
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 allowFullScreen
//                 className="w-full h-full"
//               />
//             </div>
//           ) : (
//             <p className="text-gray-600 dark:text-gray-300">No trailer available.</p>
//           )}

//           <div className="mt-4 flex gap-3">
//             {trailer ? (
//               <a
//                 href={`https://www.youtube.com/watch?v=${trailer.key}`}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="px-4 py-2 bg-red-600 text-white rounded-md"
//               >
//                 Play Trailer
//               </a>
//             ) : null}

//            <a
//               href={`https://www.${process.env.BASE_URL}/movie/${movieId}`}
//               target="_blank"
//               rel="noreferrer"
//               className="px-4 py-2 border rounded-md text-sm"
//             >
//               View on TMDB
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
