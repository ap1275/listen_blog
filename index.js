const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const bp = require('body-parser')
const cp = require('cookie-parser')
const api = require('./app/api/v1.0/root')
const app = express()

// disable etag header
app.set('etag', false)

// make response header more secure
app.use(helmet())

// setup access log
//
// log format:
// date|ip|url|status|user-agent|response-time
app.use(morgan((tokens, req, res) => {
  return [
    new Date().toISOString(),'|',
    tokens.method(req,res),'|',
    req.connection.remoteAddress,'|',
    tokens.url(req, res),'|',
    tokens.status(req, res),'|',
    tokens.req(req, res,'user-agent'),'|',
    tokens['response-time'](req, res),'ms'
  ].join('')
}))

// enable body-parser
app.use(bp.urlencoded({extended: true}))
app.use(bp.json())

// enable cookie-parser
app.use(cp())

// routing
app.use('/api', api)

// global 404 page
app.use((req, res) => {
  res.status(404).send('404 page not found')
})

// start listening
app.listen(80, () => console.log('--- start app ---'))
