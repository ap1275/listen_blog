const express = require('express')
const mysql = require('mysql2')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
const site_url = require('./src/site_url')
const article = require('./src/article')
const router = express.Router()
require('dotenv').config()

const schema = buildSchema(`
  type Query {
    list(count: Int!, title: String, url: String): [List]
  }
  type List {
    title: String
    url: String
    articles(count: Int!, dateFrom: String, dateTo: String): [Article]
  }
  type Article {
    title: String
    article: String
  }
`)

class List {
  constructor(title, url) {
    this.title = title
    this.url = url
  }

  articles({count, dateFrom, dateTo}) {
    return (async () => await article.exec(count, dateFrom, dateTo))()
  }
}

const exec = async (count,title,url) => {
  let sites = await site_url.exec(count)
  const lists = []
  for(let i = 0; i < sites.length; ++i) {
    if(title === undefined && url === undefined) {
      lists.push(new List(sites[i]['title'], sites[i]['url']))
    }
    if(title !== undefined && sites[i]['title'] === title) {
      lists.push(new List(title, sites[i]['url']))
    }
    if(url !== undefined && sites[i]['url'] === url) {
      lists.push(new List(sites[i]['title'], url))
    }
  }
  return lists
}

const root = { 
  list: async({count, title, url}) => await exec(count, title, url),
}

router.use('/', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}))

module.exports = router
