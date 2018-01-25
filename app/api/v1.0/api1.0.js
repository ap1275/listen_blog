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
    site_urls: [SiteURL]
    articles: [Article]
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
  site_urls: site_url.exec().then(r => r),
  articles: article.exec().then(r => r),
}


router.use('/', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: false,
}))

module.exports = router
