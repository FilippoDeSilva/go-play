import React from 'react'
import Image from 'next/image'

type Props = {
  id: number
  title: string
  poster_url?: string | null
  release_date?: string | null
  className?: string
}

export default function MovieCardItem({ id, title, poster_url, release_date, className }: Props) {
  return (
    <div className={(className || '') + ' card-glass rounded-lg overflow-hidden shadow'}>
      {poster_url ? (
        <Image src={poster_url} alt={title} width={300} height={450} className="w-full h-auto object-cover" />
      ) : (
        <div className="w-full h-72 bg-gray-200 dark:bg-gray-700" />
      )}

      <div className="p-3">
  <h2 className="font-semibold text-lg text-slate-900 dark:text-white truncate">{title}</h2>
  {release_date ? <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{release_date}</p> : null}

        <div className="mt-3 flex gap-2 items-center">
          <a href={`/movies/${id}`} className="ml-auto px-3 py-1 bg-indigo-600 text-white rounded">Open</a>
        </div>
      </div>
    </div>
  )
}
