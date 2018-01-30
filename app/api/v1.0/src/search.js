const mysql = require('mysql2')
require('dotenv').config()

function roles(id) {
  return new Promise((resolve, reject) => {
    const c = mysql.createConnection({
      host: process.env.ND_DB_HOST,
      user: process.env.ND_DB_USER,
      password: process.env.ND_DB_PASS,
      database: process.env.ND_DB_NAME
    })
    c.query(`select priority, role from site_roles where deleted_at is NULL and site_list_id=${id}`, (e, r, f) => {
      if(e) {
        reject(e)
      } else {
        resolve(r)
      }
    })
  })
}

function sites(limit) {
  return new Promise((resolve, reject) => {
    limit > 1000 ? limit = 1000 : limit
    const c = mysql.createConnection({
      host: process.env.ND_DB_HOST,
      user: process.env.ND_DB_USER,
      password: process.env.ND_DB_PASS,
      database: process.env.ND_DB_NAME
    })
    c.query(`select title,url,id from site_lists where deleted_at is NULL limit ${limit}`, (e, r, f) => {
      if(e) {
        reject(e)
      } else {
        resolve(r)
      }
    })
  })
}

function article(id, limit, dateFrom, dateTo) {
  return new Promise((resolve, reject) => {
    limit > 1000 ? limit = 1000 : limit
    const c = mysql.createConnection({
      host: process.env.ND_DB_HOST,
      user: process.env.ND_DB_USER,
      password: process.env.ND_DB_PASS,
      database: process.env.ND_DB_NAME
    })
    let q = `select articles.article,article_lists.title from articles inner join article_lists on articles.article_list_id=article_lists.id where articles.deleted_at is null and article_lists.site_list_id=${id}`
    if(dateFrom !== undefined && dateTo !== undefined) {
      q += ` and articles.created_at > '${dateFrom}' and articles.created_at < '${dateTo}'`
    }
    else if(dateTo !== undefined) {
      q += ` and articles.created_at < '${dateTo}'`
    }
    else if(dateFrom !== undefined) {
      q += ` and articles.created_at > '${dateFrom}'`
    }
    q += ` order by articles.created_at desc limit ${limit}`
    c.query(q, (e, r, f) => {
      if(e) {
        reject(e)
      } else {
        resolve(r)
      }
    })
  })
}

module.exports.sites = sites
module.exports.article = article
module.exports.roles = roles
