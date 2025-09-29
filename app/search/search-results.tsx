// 'use client';

// import SearchGrid from '@/components/Search/SearchGrid';

// type SearchResultsProps = {
//   searchQuery: string;
// };

// export default function SearchResults({ searchQuery }: SearchResultsProps) {
//   return (
//     <>
//       {/* Movies Section */}
//       <section className="mb-16">
//         <div className="flex items-center justify-between mb-4 px-2">
//           <h2 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 tracking-tight">Movies</h2>
//         </div>
//         <SearchGrid 
//           query={searchQuery}
//           type="movie"
//           className="mb-8"
//           itemsPerPage={18}
//         />
//       </section>

//       {/* TV Shows Section */}
//       <section>
//         <div className="flex items-center justify-between mb-4 px-2">
//           <h2 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 tracking-tight">TV Shows</h2>
//         </div>
//         <SearchGrid 
//           query={searchQuery}
//           type="tv"
//           itemsPerPage={18}
//         />
//       </section>
//     </>
//   );
// }
