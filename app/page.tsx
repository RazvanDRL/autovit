import Image from 'next/image'
import singletonRouter from 'next/router';
import TypesenseInstantsearchAdapter, { SearchClient } from 'typesense-instantsearch-adapter'
import {
  DynamicWidgets,
  InstantSearch,
  Hits,
  Highlight,
  RefinementList,
  SearchBox,
  InstantSearchServerState,
  InstantSearchSSRProvider,
  getServerState,
} from 'react-instantsearch';
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';

const typesenseInstantSearchAdapter: SearchClient = new TypesenseInstantsearchAdapter({
  server: {
    apiKey: 'xyz',
    nodes: [
      {
        host: 'localhost',
        port: 8108,
        protocol: 'http'
      }
    ]
  },
  additionalSearchParameters: {
    query_by: 'title,authors',
    query_by_weights: '4,1'
  }
})

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <InstantSearch indexName="books" searchClient={typesenseInstantSearchAdapter.searchClient}>
      </InstantSearch>
    </main>
  )
}
