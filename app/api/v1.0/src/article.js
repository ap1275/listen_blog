const mysql = require('mysql2')
require('dotenv').config()

function exec(count, dateAfter) {
  return new Promise(resolve => {
    count > 1000 ? count = 1000 : count
    const c = mysql.createConnection({
      host: process.env.ND_DB_HOST,
      user: process.env.ND_DB_USER,
      password: process.env.ND_DB_PASS,
      database: process.env.ND_DB_NAME
    })
    let q = ''
    if(dateAfter === null || dateAfter === undefined) {
      q = `select articles.article,article_lists.article_title from articles inner join article_lists on articles.article_list_id=article_lists.id where articles.deleted_at is null order by articles.created_at desc limit ${count}`
    }
    else {
      q = `select articles.article,article_lists.article_title from articles inner join article_lists on articles.article_list_id=article_lists.id where articles.deleted_at is null and articles.created_at > '${dateAfter}' order by articles.created_at desc limit ${count}`
    }
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
