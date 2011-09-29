#!/bin/sh
ps ax | grep 'refinery/build/acretrunk/webapp' | grep -v grep | awk '{print $1}' | xargs kill



