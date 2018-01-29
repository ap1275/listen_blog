#!/usr/bin/env ruby
require 'bundler/setup'
require 'redis'

def main(i)
  redis = Redis.new
  pid = redis.get('crawler' + i.to_s)
  return if pid == nil
  system "kill #{pid}"
  redis.del('crawler' + i.to_s)
end

main ARGV[0]
