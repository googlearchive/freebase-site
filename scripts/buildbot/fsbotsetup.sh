#!/bin/bash -x
cd `dirname $0`
SRC=`pwd`
BASE=~/fsbot/fs/build/acretrunk
# update freebase-site to latest known passing version
svn up -r `cat ~/buildbot/freebase-site.latest` ~/freebase-site/
${SRC}/sitesetup.sh ${BASE} ~/freebase-site
cp ${SRC}/project.fsbot.conf ${BASE}/config
cp ${SRC}/web.default.xml ${BASE}/webapp/WEB-INF/web.default.xml


