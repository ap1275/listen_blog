const express = require('express')
const mysql = require('mysql2')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
const site_url = require('./src/site_url')
const article = require('./src/article')
const router = express.Router()
require('dotenv').config()

// api roles
const schema = buildSchema(`
  type Query {
    search(limit: Int!, title: String, url: String): [SearchResult]
  }
  type Mutation {
    addSite(title: String!, url: String!): String
  }
  type SearchResult {
    title: String
    url: String
    articles(limit: Int!, dateFrom: String, dateTo: String): [Article]
  }
  type Article {
    title: String
    article: String
  }
`)

class SearchResult {
  constructor(id, title, url) {
    this.title = title
    this.url = url
    this.id = id
  }

  articles({limit, dateFrom, dateTo}) {
    return (async () => await article.exec(this.id, limit, dateFrom, dateTo))()
  }
}

const search_api = async (limit,title,url) => {
  let sites = await site_url.exec(limit)
  const lists = []
  for(let i = 0; i < sites.length; ++i) {
    if(title === undefined && url === undefined) {
      lists.push(new SearchResult(sites[i]['id'], sites[i]['title'], sites[i]['url']))
    }
    if(title !== undefined && sites[i]['title'] === title) {
      lists.push(new SearchResult(sites[i]['id'], title, sites[i]['url']))
    }
    if(url !== undefined && sites[i]['url'] === url) {
      lists.push(new SearchResult(sites[i]['id'], sites[i]['title'], url))
    }
  }
  return lists
}

const root = { 
  search: async({limit, title, url}) => await search_api(limit, title, url),
  addSite: async () => 'not implemented',
}

router.use('/', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}))

module.exports = router
