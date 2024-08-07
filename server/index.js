/*
 *  Our JavaScript client library works on both the server and the browser.
 *  When using the library on the browser, please be sure to use the
 *  search-only API Key rather than the master API key since the latter
 *  has write access to Typesense and you don't want to expose that.
 */

import Typesense from 'typesense'

let client = new Typesense.Client({
    'nodes': [{
        'host': 'localhost', // For Typesense Cloud use xxx.a1.typesense.net
        'port': 8108,      // For Typesense Cloud use 443
        'protocol': 'http'   // For Typesense Cloud use https
    }],
    'apiKey': 'xyz',
    'connectionTimeoutSeconds': 2
})

let searchParameters = {
    'q': 'harry potter',
    'query_by': 'title',
    'sort_by': 'ratings_count:desc'
}

client.collections('books')
    .documents()
    .search(searchParameters)
    .then(function (searchResults) {
        console.log(searchResults)
    })


