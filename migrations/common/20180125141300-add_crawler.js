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

// [site_lists]1 - [article_lists]n
// [site_lists]1 - [articles]1
// [article_lists]1 - [articles]1
exports.up = function(db) {
  return db.createTable('site_lists', {
    id: {type: 'int', notNull: true, primaryKey: true, autoIncrement: true, unsigned: true},
    title: {type: 'text', notNull: true},
    url: {type: 'text', notNull: true},
    format: {type: 'string', notNull: true},
    created_at: {type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP')},
    deleted_at: {type: 'timestamp', notNull: false}
  })
  .then(
    res => {
      db.createTable('site_roles', {
        id: {type: 'int', primaryKey: true, autoIncrement: true, unsigned: true},
        site_list_id: {type: 'int', notNull: true, unsigned: true},
        role: {type: 'text', notNull: true},
        created_at: {type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP')},
        deleted_at: {type: 'timestamp', notNull: false}
      })
    },
    err => console.error(err)
  )
  .then(
    res => {
      db.createTable('articles', {
        id: {type: 'int', primaryKey: true, autoIncrement: true, unsigned: true},
        article_list_id: {type: 'int', notNull: false, unsigned: true}, // this should be null if site_lists.format == 'html'
        original_article: {type: 'text', notNull: true},
        article: {type: 'text', notNull: true},
        read: {type: 'boolean', notNull: true, defaultValue: false},
        created_at: {type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP')},
        updated_at: {type: 'timestamp', notNull: false},
        deleted_at: {type: 'timestamp', notNull: false}
      })
    },
    err => console.error(err)
  )
  .then(
    res => {
      db.createTable('article_lists', {
        id: {type: 'int', primaryKey: true, autoIncrement: true, unsigned: true},
        site_list_id: {type: 'int', notNull: true, unsigned: true},
        article_title: {type: 'text', notNull: false},
        article_url: {type: 'text', notNull: false},
        created_at: {type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP')},
        updated_at: {type: 'timestamp', notNull: false},
      })
    },
    err => console.error(err)
  )
};

exports.down = function(db) {
  return db.dropTable('site_lists')
  .then(res => db.dropTable('articles'), err => console.error(err))
  .then(res => db.dropTable('article_lists'), err => console.error(err))
};

exports._meta = {
  "version": 1
};
