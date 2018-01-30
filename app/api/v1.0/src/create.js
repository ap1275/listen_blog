const mysql = require('mysql2')
require('dotenv').config()

const roles = async (id, roles) => {
  try {
    const handle = mysql.createConnection({
      host: process.env.ND_DB_HOST,
      user: process.env.ND_DB_USER,
      password: process.env.ND_DB_PASS,
      database: process.env.ND_DB_NAME
    })
    for(let i = 0; i < roles.length; ++i) {
      await insert_roles(id, roles[i]['role'], roles[i]['priority'], handle)
    }
  }
  catch(err) {
    return err
  }
  return "OK"
}

const site = async (title, url, format, roles) => {
  try {
    const handle = mysql.createConnection({
      host: process.env.ND_DB_HOST,
      user: process.env.ND_DB_USER,
      password: process.env.ND_DB_PASS,
      database: process.env.ND_DB_NAME
    })
    await insert_sites(title, url, format, handle)
    let id = await get_last_sites_id(handle)
    for(let i = 0; i < roles.length; ++i) {
      await insert_roles(id[0]['last_insert_id()'], roles[i]['role'], roles[i]['priority'], handle)
    }
  }
  catch(err) {
    return err
  }
  return "OK"
}

function get_last_sites_id(handle) {
  return new Promise((resolve, reject) => {
    let q = `select last_insert_id() from site_lists`
    handle.query(q, (e, r, f) => {
      if(e) {
        reject(e)
      } else {
        resolve(r)
      }
    })
  })
}

function insert_roles(id, role, priority, handle) {
  return new Promise((resolve, reject) => {
    let q = `insert into site_roles(site_list_id,role,priority) values(${id},'${role}',${priority})`
    handle.query(q, (e, r, f) => {
      if(e) {
        reject(e)
      } else {
        resolve(r)
      }
    })
  })
}

function insert_sites(title, url, format, handle) {
  return new Promise((resolve, reject) => {
    let q = `insert into site_lists(title,url,format) values('${title}','${url}','${format}')`
    handle.query(q, (e, r, f) => {
      if(e) {
        reject(e)
      } else {
        resolve(r)
      }
    })
  })
}

module.exports.site = site
module.exports.roles = roles
