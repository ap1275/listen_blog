const express = require('express')
const mysql = require('mysql2')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
const site_url = require('./src/site_url')
const article = require('./src/article')
const add_site = require('./src/add_site')
const router = express.Router()
require('dotenv').config()

// api roles
const schema = buildSchema(`
  type Query {
    search(limit: Int!, title: String, url: String): [SearchResult]
  }
  type Mutation {
    addSite(title: String!, url: String!, format: String!, roles: [Role]!): String!
  }
  input Role {
    role: String!
    priority: Int!
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

//
// search api
//
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

//
// add site api
//
const add_site_api = async (title, url, format, roles) => await add_site.exec(title,url,format,roles)

const root = { 
  search: async({limit, title, url}) => await search_api(limit, title, url),
  addSite: async ({title, url, format, roles}) => await add_site_api(title,url,format,roles),
}

router.use('/', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}))

module.exports = router
