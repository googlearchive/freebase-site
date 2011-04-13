#!/bin/bash -x
cd `dirname $0`
SRC=`pwd`
BASE=~/acreaebot/acreae/build
${BASE}/acre distclean
# update freebase-site to latest known passing version
svn up -r `cat ~/buildbot/freebase-site.latest` ~/freebase-site/
${SRC}/sitesetup.sh ~/acreaebot/acreae/build ~/freebase-site
cp ${SRC}/project.acreaebot.conf ${BASE}/config
cp ${SRC}/web.default.xml ${BASE}/webapp/WEB-INF/web.default.xml


