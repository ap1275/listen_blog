const mysql = require('mysql2')
require('dotenv').config()

async function roles(id, c) {
  const [r,f] = await c.query(`select priority, role from site_roles where deleted_at is NULL and site_list_id=${id}`)
  return r
}

async function sites(limit, c) {
  limit > 1000 ? limit = 1000 : limit
  const [r, f] = await c.query(`select title,url,id from site_lists where deleted_at is NULL limit ${limit}`)
  return r
}

async function article(id, limit, dateFrom, dateTo, c) {
    limit > 1000 ? limit = 1000 : limit
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
  const [r,f] = await c.query(q)
  return r
}

module.exports.sites = sites
module.exports.article = article
module.exports.roles = roles
