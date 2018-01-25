'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  db.runSql('insert into site_lists (title,url,format) values(\'yahoo japan topics\', \'https://news.yahoo.co.jp/pickup/rss.xml\', \'rss\')', err => console.error(err))
  db.runSql('insert into site_lists (title,url,format) values(\'ねとらぼ\', \'https://headlines.yahoo.co.jp/rss/it_nlab-c_ent.xml\', \'rss\')', err => console.error(err))
  db.runSql('insert into site_roles (site_list_id,role) values(1, \'.hbody\')', err => console.error(err))
  db.runSql('insert into site_roles (site_list_id,role) values(1, \'.ynDetailText\')', err => console.error(err))
  db.runSql('insert into site_roles (site_list_id,role) values(2, \'.hbody\')', err => console.error(err))
  return db.runSql('insert into site_roles (site_list_id,role) values(2, \'.ynDetailText\')', err => console.error(err))
};

exports.down = function(db) {
  db.runSql('truncate table site_lists', err => console.error(err))
  return db.runSql('truncate table site_roles', err => console.error(err))
};

exports._meta = {
  "version": 1
};
