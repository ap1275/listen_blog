#!/usr/bin/env ruby
require_relative '../bin/nd-crawler-start'

def crawler_test
  return if ENV['ND_EXEC_ENV'] == 'production'
  ND::NDCrawl.new(ENV['ND_DB_HOST'], ENV['ND_DB_USER'], ENV['ND_DB_PASS'], ENV['ND_DB_NAME']).main
end

crawler_test
