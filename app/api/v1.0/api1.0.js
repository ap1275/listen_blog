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
    site_lists(count: Int!): [SiteURL]
    articles(count: Int!, dateAfter: String): [Article]
  }
  type SiteURL {
    title: String
    url: String
  }
  type Article {
    article: String
    article_title: String
  }
`)

const root = { 
  site_lists: async({count}) => await site_url.exec(count),
  articles: async ({count, dateAfter}) => await article.exec(count, dateAfter),
}

router.use('/', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: false,
}))

module.exports = router
