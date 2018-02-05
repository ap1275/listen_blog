const express = require('express')
const mysql = require('mysql2/promise')
const execSync = require('child_process').execSync
const graphqlHTTP = require('express-graphql')
const redis = require("redis")
const { buildSchema } = require('graphql')
const search = require('./src/search')
const create = require('./src/create')
const update = require('./src/update')
const router = express.Router()
require('dotenv').config()

// connection handler
const conn = mysql.createPool({
  timeout: 10,
  connectionLimit: 50,
  host: process.env.ND_DB_HOST,
  user: process.env.ND_DB_USER,
  password: process.env.ND_DB_PASS,
  database: process.env.ND_DB_NAME
})

// api roles
const schema = buildSchema(`
  type Query {
    search_sites(limit: Int!, title: String, url: String): [SearchResult]
    search_crawlers: [Int]
  }
  type Mutation {
    create_site(title: String!, url: String!, format: String!, roles: [Role]!): CreateSiteResult!
    create_roles(id: Int!, roles: [Role]!): String!
    update_site(id: Int!, title: String, url: String, format: String, roles: [Role]): String!
    stop_crawler(id: Int!): String!
    start_crawler(num: Int!, deg: String!): Int!
  }
  type CreateSiteResult {
    id: Int
    msg: String!
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
  constructor(id, title, url, roles, c) {
    this.title = title
    this.url = url
    this.id = id
    this.roles = roles
    this.conn = c
  }

  articles({limit, dateFrom, dateTo}) {
    return (async () => await search.article(this.id, limit, dateFrom, dateTo, this.conn))()
  }
}

const search_api = async (limit,title,url) => {
  const lists = []
  try {
    let sites = await search.sites(limit, conn)
    for(let i = 0; i < sites.length; ++i) {
      let roles = await search.roles(sites[i]['id'], conn)
      if(title === undefined && url === undefined) {
        lists.push(new SearchResult(sites[i]['id'], sites[i]['title'], sites[i]['url'], roles, conn))
      }
      if(title !== undefined && sites[i]['title'] === title) {
        lists.push(new SearchResult(sites[i]['id'], title, sites[i]['url'], roles, conn))
      }
      if(url !== undefined && sites[i]['url'] === url) {
        lists.push(new SearchResult(sites[i]['id'], sites[i]['title'], url, roles, conn))
      }
    }
  }
  catch(e) {
    console.error(e)
  }

  return lists
}

//
// crawler api
//
const start_crawler = async (num, deg) => {
  if(deg !== 'm' && deg !== 'h' && deg !== 's') return -1
  await execSync(`./bin/nd-crawler-start.rb ${num} ${deg}`)
  const {promisify} = require('util')
  const client = redis.createClient()
  const getAsync = promisify(client.get).bind(client)
  const ret = await getAsync('crawler_count')
  const quit = promisify(client.quit).bind(client)
  await quit()
  if(ret === null) return -1
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
const crawlers = async () => {
  const {promisify} = require('util')
  const client = redis.createClient()
  const getKeys = promisify(client.keys).bind(client)
  const ret = await getKeys('crawler[1-999]')
  for(let i = 0; i < ret.length; ++i) {
    ret[i] = ret[i].replace(/[a-zA-Z]+/g, '') // 'crawler[1-999]' -> '[1-999]'
  }
  const quit = promisify(client.quit).bind(client)
  await quit()
  return ret
}

//
// api root
//
const root = { 
  search_sites: async({limit, title, url}) => await search_api(limit, title, url),
  search_crawlers: async () => await crawlers(),
  create_site: async ({title, url, format, roles}) => await create.site(title,url,format,roles, conn),
  create_roles: async ({id, roles}) => await create.roles(id,roles, conn),
  update_site: async ({id, title, url, format, roles}) => await update.exec(id,title,url,format,roles, conn),
  start_crawler: async ({num, deg}) => await start_crawler(num, deg),
  stop_crawler: async ({id}) => await stop_crawler(id),
}

router.use('/', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}))

module.exports = router
