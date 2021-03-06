#!/usr/bin/env ruby
require 'bundler/setup'
require 'rufus-scheduler'
require 'mysql2'
require 'httpclient'
require 'parallel'
require 'etc'
require 'nokogiri'
require 'dotenv'
require 'redis'

#==============================================================================
# crawler core
#==============================================================================
# namespace ND
module ND

  # crawler core
  class NDCrawl

    # connect database and create http client instance
    def initialize(host, user, pass, name)
      @sql = Mysql2::Client.new(:host => host, :username => user, :password => pass, :database => name)
      @http = HTTPClient.new
    end

    # entry point
    def main
      rows = @sql.query 'select id, url, format from site_lists where deleted_at is NULL'
      Parallel.each(rows, in_process: Etc.nprocessors) do |row|
        res = @http.get(row['url'], :follow_redirect => true)
        parse(row['id'], res.body, row['format']) if res.status == 200
      end
    end

    private

    # do parse at parallel
    def parse(id, body, format)
      case format
      when 'rss' then update_rss(id, body)
      else p 'error : unknown format'
      end
    end

    # get title and link from rss
    def update_rss(id, body)
      doc = Nokogiri::XML(body)
      doc.xpath('rss/channel/item').each do |i|
        title = i.xpath('title').text
        link = i.xpath('link').text
        st = @sql.prepare "select exists(select 1 from article_lists where article_url=?)"
        st.execute(link).each_with_index do |res, index|
          insert_article_list(res, id, title, link) if index == 0
        end
      end
    end

    # insert row into article_lists
    def insert_article_list(res, id, title, link)
      if res['exists(select 1 from article_lists where article_url=?)'] == 0
        stmt = @sql.prepare "insert into article_lists (site_list_id, title, article_url) values(?,?,?)"
        stmt.execute(id, title, link)
        id_res = @sql.query 'select last_insert_id() from article_lists'
        roles = @sql.query "select role from site_roles where deleted_at is null and site_list_id=#{id} order by priority desc"
        r = @http.get(link, :follow_redirect => true)
        id_res.each_with_index {|nowid, i| extract_html(r.body, roles, nowid['last_insert_id()']) if r.status == 200 && i == 0}
      end
    end

    # get raw html and parse raw string
    def extract_html(body, roles, id=nil)
      doc = Nokogiri::HTML(body)
      s = ''
      roles.each do |r|
        doc.search(r['role']).each do |d|
          s = d.text
          break unless s.empty?
        end
        break unless s.empty?
      end
      insert_article(id, body, s)
    end

    # insert html and trimmed text
    def insert_article(id, body, s)
      if id == nil
        stmt = @sql.prepare "insert into articles (original_article, article) values(?,?)"
        stmt.execute(body, s)
      else
        stmt = @sql.prepare "insert into articles (article_list_id, original_article, article) values(?,?,?)"
        stmt.execute(id, body, s)
      end
    end
  end # end class
end # end module

#==============================================================================
# set crawler's pid
#==============================================================================
def register_pid
  redis = Redis.new
  c = redis.get('crawler_count')
  c = 1 if c == nil
  redis.set('crawler' + c.to_s, $$)
  redis.set('crawler_count', c.to_i + 1)
end
  
#==============================================================================
# entry point
#==============================================================================
def main
  Dotenv.load
  # get arg
  time = ARGV.length < 2 ? '15m' : "%s%s" % [ARGV[0], ARGV[1]]
  # check environment variables
  # exit if not set those
  if ENV['ND_DB_HOST'] == nil || ENV['ND_DB_USER'] == nil || ENV['ND_DB_PASS'] == nil || ENV['ND_DB_NAME'] == nil
    puts 'environment value has not set'
    puts 'you have to set ND_DB_{NAME,USER,PASS,HOST}'
    exit(1)
  end
  Process.daemon
  scheduler = Rufus::Scheduler.new
  register_pid
  scheduler.every time do
    ND::NDCrawl.new(ENV['ND_DB_HOST'], ENV['ND_DB_USER'], ENV['ND_DB_PASS'], ENV['ND_DB_NAME']).main
  end
  scheduler.join
end

main
