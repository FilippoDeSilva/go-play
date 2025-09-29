import { Suspense } from 'react';
import SearchResults from './search-results';

type Props = { 
  searchParams: { q?: string } 
};

export default function SearchPage({ searchParams }: Props) {
  const searchQuery = searchParams.q || '';
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 mb-6 tracking-tight">
          Search results for &quot;{searchQuery}&quot;
        </h1>
      </div>

      <Suspense fallback={
        <div className="container mx-auto p-6 pt-24 flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }>
        <SearchResults searchQuery={searchQuery} />
      </Suspense>
    </div>
  );
}

