#!/usr/bin/env ruby
require 'bundler/setup'
require 'redis'

def main
  redis = Redis.new
  i = 1
  loop do
    pid = redis.get('crawler' + i.to_s)
    break if pid == nil
    system "kill #{pid}"
    i = i + 1
  end
  redis.flushall
end

main
