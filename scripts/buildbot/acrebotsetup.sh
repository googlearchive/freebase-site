#!/bin/bash -x
cd `dirname $0`
SRC=`pwd`
BASE=~/acrebot/acre/build
# update freebase-site to latest known passing version
svn up -r `cat ~/buildbot/freebase-site.latest` ~/freebase-site/
${SRC}/sitesetup.sh ~/acrebot/acre/build ~/freebase-site
cp ${SRC}/project.acrebot.conf ${BASE}/config

