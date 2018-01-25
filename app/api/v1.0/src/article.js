const mysql = require('mysql2')
require('dotenv').config()

function exec() {
  return new Promise(resolve => {
    const c = mysql.createConnection({
      host: process.env.ND_DB_HOST,
      user: process.env.ND_DB_USER,
      password: process.env.ND_DB_PASS,
      database: process.env.ND_DB_NAME
    })
    c.query('select articles.article,article_lists.article_title from articles inner join article_lists on articles.article_list_id=article_lists.id where articles.deleted_at is null order by articles.created_at desc', (e, r, f) => { if(e) {
        console.error(`err : ${e}`)
      } else {
        resolve(r)
      }
    })
  })
}

module.exports.exec = exec
