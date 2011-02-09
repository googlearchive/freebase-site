#!/bin/sh
# get the latest svn branch of acre running. give one of these args:
# sandbox-freebase or freebase

BRANCH=`curl -s  http://local.dev.${1}apps.com/version | grep \"acre\" | awk -F \" '{print $4}' | sed -e 's/:/ -r /'`
echo http://acre.googlecode.com/svn/${BRANCH}
