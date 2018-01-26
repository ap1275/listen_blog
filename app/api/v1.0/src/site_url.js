const mysql = require('mysql2')
require('dotenv').config()

function exec(count) {
  return new Promise(resolve => {
    count > 1000 ? count = 1000 : count
    const c = mysql.createConnection({
      host: process.env.ND_DB_HOST,
      user: process.env.ND_DB_USER,
      password: process.env.ND_DB_PASS,
      database: process.env.ND_DB_NAME
    })
    c.query(`select title,url,created_at from site_lists where deleted_at is NULL limit ${count}`, (e, r, f) => {
      if(e) {
        console.error(`err : ${e}`)
      } else {
        resolve(r)
      }
    })
  })
}

module.exports.exec = exec
