const express = require('express')
const mysql = require('mysql2')
const execSync = require('child_process').execSync
const graphqlHTTP = require('express-graphql')
const redis = require("redis")
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
    list_active_crawlers: [Int]
  }
  type Mutation {
    add_site(title: String!, url: String!, format: String!, roles: [Role]!): String!
    add_roles(id: Int!, roles: [Role]!): String!
    update_site(id: Int!, title: String, url: String, format: String, roles: [Role]): String!
    stop_crawler(id: Int!): String!
    start_crawler(num: Int!, deg: String!): Int!
  }
  input Role {
    role: String!
    priority: Int!
  }
  type RoleRes {
    role: String!
    priority: Int!
  }
  type SearchResult {
    id: Int
    title: String
    url: String
    roles: [RoleRes]
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
  constructor(id, title, url, roles) {
    this.title = title
    this.url = url
    this.id = id
    this.roles = roles
  }

  articles({limit, dateFrom, dateTo}) {
    return (async () => await article.exec(this.id, limit, dateFrom, dateTo))()
  }
}

const search_api = async (limit,title,url) => {
  let sites = await site_url.exec(limit)
  const lists = []
  for(let i = 0; i < sites.length; ++i) {
    let roles = await site_url.exec_roles(sites[i]['id'])
    if(title === undefined && url === undefined) {
      lists.push(new SearchResult(sites[i]['id'], sites[i]['title'], sites[i]['url'], roles))
    }
    if(title !== undefined && sites[i]['title'] === title) {
      lists.push(new SearchResult(sites[i]['id'], title, sites[i]['url'], roles))
    }
    if(url !== undefined && sites[i]['url'] === url) {
      lists.push(new SearchResult(sites[i]['id'], sites[i]['title'], url, roles))
    }
  }
  return lists
}

//
// crawler api
//
const start_crawler = async (num, deg) => {
  const result = await execSync(`./bin/nd-crawler-start.rb ${num} ${deg}`).toString()
  const {promisify} = require('util')
  const client = redis.createClient()
  const getAsync = promisify(client.get).bind(client);
  const ret = await getAsync('crawler_count')
  if(ret === null) return 0
  return ret
}

//
// crawler api
//
const stop_crawler = async (id) => {
  const result = execSync(`./bin/nd-crawler-stop.rb ${id}`).toString()
  if(result === null || result === "") {
    return "OK"
  }
  return result
}

//
// list crawler api
// just returns array of crawler's id
//
const list_active_crawlers = async () => {
  const {promisify} = require('util')
  const client = redis.createClient()
  const getKeys = promisify(client.keys).bind(client);
  const ret = await getKeys('crawler[1-999]')
  for(let i = 0; i < ret.length; ++i) {
    ret[i] = ret[i].replace(/[a-zA-Z]+/g, '') // 'crawler[1-999]' -> '[1-999]'
  }
  return ret
}

//
// api root
//
const root = { 
  search: async({limit, title, url}) => await search_api(limit, title, url),
  list_active_crawlers: async () => await list_active_crawlers(),
  add_site: async ({title, url, format, roles}) => await add_site.exec(title,url,format,roles),
  add_roles: async ({id, roles}) => await add_site.exec_roles(id,roles),
  update_site: async ({id, title, url, format, roles}) => await add_site.exec_update(id,title,url,format,roles),
  start_crawler: async ({num, deg}) => await start_crawler(num, deg),
  stop_crawler: async ({id}) => await stop_crawler(id),
}

router.use('/', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}))

module.exports = router
