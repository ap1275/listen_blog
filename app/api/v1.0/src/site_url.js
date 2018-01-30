const mysql = require('mysql2')
require('dotenv').config()

function exec_roles(id) {
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

function exec(limit) {
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

module.exports.exec = exec
module.exports.exec_roles = exec_roles
