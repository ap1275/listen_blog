const mysql = require('mysql2')
require('dotenv').config()

function exec(count, dateFrom, dateTo) {
  return new Promise(resolve => {
    count > 1000 ? count = 1000 : count
    const c = mysql.createConnection({
      host: process.env.ND_DB_HOST,
      user: process.env.ND_DB_USER,
      password: process.env.ND_DB_PASS,
      database: process.env.ND_DB_NAME
    })
    let q = 'select articles.article,article_lists.title from articles inner join article_lists on articles.article_list_id=article_lists.id where articles.deleted_at is null'
    if(dateFrom !== undefined && dateTo !== undefined) {
      q += ` and articles.created_at > '${dateFrom}' and articles.created_at < '${dateTo}'`
    }
    else if(dateTo !== undefined) {
      q += ` and articles.created_at < '${dateTo}'`
    }
    else if(dateFrom !== undefined) {
      q += ` and articles.created_at > '${dateFrom}'`
    }
    q += ` order by articles.created_at desc limit ${count}`
    c.query(q, (e, r, f) => {
      if(e) {
        console.error(`err : ${e}`)
      } else {
        resolve(r)
      }
    })
  })
}

module.exports.exec = exec
