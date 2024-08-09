"use client";
import { Configure, Hits, InfiniteHits, InstantSearch, SearchBox } from 'react-instantsearch';
import { typesenseInstantsearchAdapter } from '@/lib/typesense';
import { _Book } from '@/types/schema';

export const Hit = ({ hit }: { hit: _Book }) => {
  return (
    <div className='p-2'>
      <h2>{hit.title}</h2>
      <p>{hit.authors}</p>
      <p>{hit.publication_year}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div>
      <InstantSearch
        indexName='books'
        searchClient={typesenseInstantsearchAdapter.searchClient}
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <div className='flex'>
          <aside className='w-1/3 bg-gray-600 h-screen'>

          </aside>
          <main className='py-8'>
            <SearchBox />
            <Hits hitComponent={Hit}/>
          </main>
        </div>
      </InstantSearch>
    </div>
  );
}

