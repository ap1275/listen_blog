const mysql = require('mysql2')
require('dotenv').config()

function exec(limit) {
  return new Promise(resolve => {
    limit > 1000 ? limit = 1000 : limit
    const c = mysql.createConnection({
      host: process.env.ND_DB_HOST,
      user: process.env.ND_DB_USER,
      password: process.env.ND_DB_PASS,
      database: process.env.ND_DB_NAME
    })
    c.query(`select title,url,id from site_lists where deleted_at is NULL limit ${limit}`, (e, r, f) => {
      if(e) {
        console.error(`err : ${e}`)
      } else {
        resolve(r)
      }
    })
  })
}

module.exports.exec = exec
