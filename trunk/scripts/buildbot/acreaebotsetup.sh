#!/bin/bash -x
cd `dirname $0`
SRC=`pwd`
BASE=~/acreaebot/acreae/build
# update freebase-site to latest known passing version
svn up -r `cat ~/buildbot/freebase-site.latest` ~/freebase-site/
${SRC}/sitesetup.sh ~/acreaebot/acreae/build ~/freebase-site
cp ${SRC}/project.acreaebot.conf ${BASE}/config
${BASE}/acre distclean


